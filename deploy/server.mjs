// Static file server + sync API for the ZOOM MultiStomp Patch Studio. No dependencies (Node 18+).
//   node deploy/server.mjs                 → serves ./site on 127.0.0.1:8097, data in ./sync-data
//   ROOT=… DATA_DIR=… PORT=… node …        → override
//
// POST /api/sync/<64 hex id>   body { patches, deleted }  → merges with the stored copy and returns the merged state.
// The id is the SHA-256 of the user's sync code (computed in the browser), so the server never sees the code.
// Accounts (sign-in pages, /api/me, database in DATA_DIR/studio.db): see accounts.mjs.
// POST /api/account/sync/<pedal>  body { patches, deleted, docs }  → the signed-in user's merged copy (account-sync.mjs).

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAccounts } from './accounts.mjs';
import { PEDALS, cleanDocs, createAccountSync } from './account-sync.mjs';
import { crossSite } from './auth.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(process.env.ROOT || join(here, '..', 'site'));
const DATA_DIR = resolve(process.env.DATA_DIR || join(here, '..', 'sync-data'));
const PORT = Number(process.env.PORT || 8097);
const HOST = process.env.HOST || '127.0.0.1';
const LIBMERGE = createRequire(import.meta.url)(join(ROOT, 'library-merge.js'));
const accounts = createAccounts({ dataDir: DATA_DIR });

const MAX_BODY = 1_000_000;
const MAX_PATCHES = 300;
const MAX_EFFECTS = 6;
const MAX_LIBRARIES = 5000;
const RATE_LIMIT = 90; // requests per minute per address
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8'
};

// ---- validation ---------------------------------------------------------------------------------
const isoDate = value => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
const cleanValue = value => (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && value.length <= 40);

function cleanPatch(p) {
  if (!p || typeof p.id !== 'string' || !/^[\w-]{1,40}$/.test(p.id) || typeof p.name !== 'string' || !isoDate(p.updatedAt) || !Array.isArray(p.effects)) return null;
  const effects = p.effects.slice(0, MAX_EFFECTS).map(e => {
    if (!e || !Number.isInteger(e.index) || e.index < 0 || e.index > 500 || !e.values || typeof e.values !== 'object') return null;
    const values = {};
    for (const [k, v] of Object.entries(e.values).slice(0, 24)) if (k.length <= 40 && cleanValue(v)) values[k] = v;
    return { index: e.index, on: e.on !== false, values };
  });
  if (effects.includes(null)) return null;
  return { id: p.id, name: p.name.slice(0, 28), output: p.output === 'amp' || p.output === 'mixer' ? p.output : null, effects, updatedAt: p.updatedAt };
}

function cleanState(state) {
  const patches = (Array.isArray(state?.patches) ? state.patches : []).map(cleanPatch).filter(Boolean);
  const deleted = {};
  for (const [id, at] of Object.entries(state?.deleted && typeof state.deleted === 'object' ? state.deleted : {}).slice(0, 2000)) {
    if (/^[\w-]{1,40}$/.test(id) && isoDate(at)) deleted[id] = at;
  }
  return { patches: patches.slice(0, MAX_PATCHES), deleted };
}

// ---- storage ------------------------------------------------------------------------------------
const locks = new Map(); // one write at a time per library
const withLock = (id, task) => {
  const next = (locks.get(id) || Promise.resolve()).then(task, task);
  locks.set(id, next.finally(() => { if (locks.get(id) === next) locks.delete(id); }));
  return next;
};

async function sync(id, incoming) {
  const file = join(DATA_DIR, `${id}.json`);
  let stored = { patches: [], deleted: {} };
  try { stored = cleanState(JSON.parse(await readFile(file, 'utf8'))); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if ((await readdir(DATA_DIR)).filter(name => name.endsWith('.json')).length >= MAX_LIBRARIES) { const full = new Error('storage full'); full.status = 507; throw full; }
  }
  const merged = LIBMERGE.merge(stored, incoming);
  merged.patches = merged.patches.slice(0, MAX_PATCHES);
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(merged));
  await rename(tmp, file);
  return merged;
}

const accountSync = createAccountSync({ store: accounts.store, LIBMERGE, maxPatches: MAX_PATCHES });

// ---- helpers ------------------------------------------------------------------------------------
const hits = new Map();
setInterval(() => hits.clear(), 60_000).unref();
const limited = ip => { const n = (hits.get(ip) || 0) + 1; hits.set(ip, n); return n > RATE_LIMIT; };
const clientIp = request => request.headers['cf-connecting-ip'] || String(request.headers['x-forwarded-for'] || '').split(',')[0].trim() || request.socket.remoteAddress;

function send(response, status, body, headers = {}) {
  response.writeHead(status, { 'X-Content-Type-Options': 'nosniff', ...headers });
  response.end(body);
}
const sendJson = (response, status, data) => send(response, status, JSON.stringify(data), {
  'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(status === 413 ? { Connection: 'close' } : {})
});

async function readBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) { const big = new Error('too large'); big.status = 413; throw big; }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function serveStatic(request, response, pathname) {
  let target = normalize(join(ROOT, decodeURIComponent(pathname)));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return send(response, 403, 'Forbidden');
  let info = await stat(target).catch(() => null);
  if (info?.isDirectory()) {
    if (!pathname.endsWith('/')) return send(response, 301, '', { Location: `${pathname}/` });
    target = join(target, 'index.html');
    info = await stat(target).catch(() => null);
  }
  if (!info?.isFile()) return send(response, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  const lastModified = info.mtime.toUTCString();
  const headers = { 'Content-Type': TYPES[extname(target)] || 'application/octet-stream', 'Content-Length': info.size, 'Last-Modified': lastModified, 'X-Content-Type-Options': 'nosniff' };
  const since = Date.parse(request.headers['if-modified-since'] || '');
  if (Number.isFinite(since) && Math.floor(info.mtimeMs / 1000) * 1000 <= since) return send(response, 304, '', { 'Last-Modified': lastModified });
  response.writeHead(200, headers);
  if (request.method === 'HEAD') return response.end();
  createReadStream(target).pipe(response);
}

// ---- server -------------------------------------------------------------------------------------
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const { pathname } = url;
    if (await accounts.handle(request, response, url)) return;
    const route = pathname.match(/^\/api\/sync\/([a-f0-9]{64})$/);
    const accountRoute = pathname.match(/^\/api\/account\/sync\/([a-z0-9]{1,12})$/);
    if (accountRoute) {
      if (!PEDALS.includes(accountRoute[1])) return sendJson(response, 404, { error: 'not found' });
      if (request.method !== 'POST') return sendJson(response, 405, { error: 'use POST' });
      if (crossSite(request.headers)) return sendJson(response, 403, { error: 'request from another site' });
      if (!String(request.headers['content-type'] || '').startsWith('application/json')) return sendJson(response, 415, { error: 'use JSON' });
      if (limited(clientIp(request))) return sendJson(response, 429, { error: 'too many requests' });
      const session = accounts.current(request);
      if (!session) return sendJson(response, 401, { error: 'sign in first' });
      let body;
      try { body = JSON.parse(await readBody(request)); } catch (error) { if (error.status) throw error; return sendJson(response, 400, { error: 'invalid body' }); }
      const incoming = { ...cleanState(body), docs: cleanDocs(body?.docs) };
      return sendJson(response, 200, accountSync.sync(session.user.id, accountRoute[1], incoming));
    }
    if (pathname.startsWith('/api/')) {
      if (!route) return sendJson(response, 404, { error: 'not found' });
      if (request.method !== 'POST') return sendJson(response, 405, { error: 'use POST' });
      if (limited(clientIp(request))) return sendJson(response, 429, { error: 'too many requests' });
      let incoming;
      try { incoming = cleanState(JSON.parse(await readBody(request))); } catch (error) { if (error.status) throw error; return sendJson(response, 400, { error: 'invalid body' }); }
      return sendJson(response, 200, await withLock(route[1], () => sync(route[1], incoming)));
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return send(response, 405, 'Method not allowed');
    await serveStatic(request, response, pathname);
  } catch (error) {
    if (error.status) return sendJson(response, error.status, { error: error.message });
    console.error(error);
    if (!response.headersSent) sendJson(response, 500, { error: 'server error' });
    else response.end();
  }
});

await mkdir(DATA_DIR, { recursive: true });
server.listen(PORT, HOST, () => console.log(`ZOOM MultiStomp Patch Studio on http://${HOST}:${PORT} (site ${ROOT}, data ${DATA_DIR})`));
