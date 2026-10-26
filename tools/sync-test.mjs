// Tests for the My patches sync: merge rules (site/library-merge.js) and the server API (deploy/server.mjs).
// Run: node tools/sync-test.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIBMERGE = createRequire(import.meta.url)('../site/library-merge.js');
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };

const patch = (id, name, updatedAt) => ({ id, name, output: null, effects: [{ index: 1, on: true, values: { VOL: 50 } }], updatedAt });
const T = n => `2026-10-${String(n).padStart(2, '0')}T10:00:00.000Z`;
const NOW = Date.parse(T(26));
const merge = (a, b) => LIBMERGE.merge(a, b, NOW);

await test('the newest edit of a patch wins', () => {
  const m = merge({ patches: [patch('a', 'OLD', T(20))] }, { patches: [patch('a', 'NEW', T(22))] });
  assert.deepEqual(m.patches.map(p => p.name), ['NEW']);
  assert.deepEqual(merge({ patches: [patch('a', 'LOCAL', T(23))] }, { patches: [patch('a', 'REMOTE', T(22))] }).patches.map(p => p.name), ['LOCAL']);
});

await test('patches from both sides are kept; remote-only ones go on top, newest first', () => {
  const m = merge({ patches: [patch('a', 'A', T(20))] }, { patches: [patch('b', 'B', T(21)), patch('c', 'C', T(22))] });
  assert.deepEqual(m.patches.map(p => p.id), ['c', 'b', 'a']);
});

await test('a deletion removes the patch unless it was edited afterwards', () => {
  assert.deepEqual(merge({ patches: [patch('a', 'A', T(20))] }, { patches: [], deleted: { a: T(21) } }).patches, []);
  const kept = merge({ patches: [patch('a', 'A', T(22))] }, { patches: [], deleted: { a: T(21) } });
  assert.equal(kept.patches.length, 1);
  assert.equal(kept.deleted.a, undefined);
});

await test('old deletion records are dropped after 90 days', () => {
  const m = merge({ patches: [], deleted: { a: '2026-01-01T00:00:00.000Z', b: T(20) } }, { patches: [] });
  assert.deepEqual(Object.keys(m.deleted), ['b']);
});

// ---- server ---------------------------------------------------------------------------------------
const dataDir = await mkdtemp(join(tmpdir(), 'ms60b-sync-'));
const port = 18097;
const server = spawn(process.execPath, [fileURLToPath(new URL('../deploy/server.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port), DATA_DIR: dataDir }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(resolve => server.stdout.once('data', resolve));
const base = `http://127.0.0.1:${port}`;
const id = 'a'.repeat(64);
const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const rawGet = path => new Promise(resolve => {
  const socket = connect(port, '127.0.0.1', () => socket.write(`GET ${path} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
  let data = '';
  socket.on('data', chunk => { data += chunk; });
  socket.on('close', () => resolve(data));
});

try {
  await test('two devices converge through the server', async () => {
    const first = await (await post(`/api/sync/${id}`, { patches: [patch('a', 'FROM PHONE', T(20))], deleted: {} })).json();
    assert.equal(first.patches.length, 1);
    const second = await (await post(`/api/sync/${id}`, { patches: [patch('b', 'FROM LAPTOP', T(21))], deleted: {} })).json();
    assert.deepEqual(second.patches.map(p => p.id).sort(), ['a', 'b']);
    const third = await (await post(`/api/sync/${id}`, { patches: [], deleted: { a: T(22) } })).json();
    assert.deepEqual(third.patches.map(p => p.id), ['b']);
    const other = await (await post(`/api/sync/${'b'.repeat(64)}`, { patches: [], deleted: {} })).json();
    assert.deepEqual(other.patches, [], 'another sync code sees nothing');
  });

  await test('the server rejects bad ids, methods and bodies', async () => {
    assert.equal((await post('/api/sync/short', {})).status, 404);
    assert.equal((await fetch(`${base}/api/sync/${id}`)).status, 405);
    assert.equal((await post(`/api/sync/${id}`, 'not json')).status, 400);
    assert.equal((await post(`/api/sync/${id}`, 'x'.repeat(1_100_000))).status, 413);
  });

  await test('invalid patches are dropped, valid fields are kept', async () => {
    const bad = { id: 'x', name: 'NO EFFECTS', updatedAt: T(20) };
    const odd = { ...patch('c', 'A'.repeat(40), T(20)), output: 'evil', extra: '<script>' };
    const m = await (await post(`/api/sync/${'c'.repeat(64)}`, { patches: [bad, odd], deleted: {} })).json();
    assert.equal(m.patches.length, 1);
    assert.equal(m.patches[0].name.length, 28);
    assert.equal(m.patches[0].output, null);
    assert.equal('extra' in m.patches[0], false);
  });

  await test('static files are served and the site root cannot be escaped', async () => {
    const page = await fetch(`${base}/builder.html`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.ok(page.headers.get('last-modified'));
    assert.equal((await fetch(`${base}/builder.html`, { headers: { 'If-Modified-Since': page.headers.get('last-modified') } })).status, 304);
    assert.equal((await fetch(`${base}/landing`, { redirect: 'manual' })).status, 301);
    assert.equal((await fetch(`${base}/landing/`)).status, 200);
    assert.doesNotMatch(await rawGet('/../deploy/server.mjs'), /createServer/);
    assert.doesNotMatch(await rawGet('/%2e%2e/deploy/server.mjs'), /createServer/);
  });
} finally {
  server.kill();
  await rm(dataDir, { recursive: true, force: true });
}
console.log(`\n${passed} passed`);
