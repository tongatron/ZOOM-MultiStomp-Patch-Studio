// Tests for the My patches sync: merge rules (site/library-merge.js), the server API (deploy/server.mjs) and the
// account sync (deploy/account-sync.mjs with the browser side site/account.js).
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
const ACCOUNT = createRequire(import.meta.url)('../site/account.js');
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

await test('docs: the newest copy wins, pedal backups from both sides are kept', () => {
  const docs = LIBMERGE.mergeDocs(
    { view: { data: 'list', updatedAt: T(20) }, 'usb-backups': { data: JSON.stringify([{ id: '1', at: T(20) }]), updatedAt: T(20) } },
    { view: { data: 'grid', updatedAt: T(21) }, advice: { data: '{}', updatedAt: T(19) }, 'usb-backups': { data: JSON.stringify([{ id: '2', at: T(21) }]), updatedAt: T(21) } });
  assert.equal(docs.view.data, 'grid');
  assert.equal(docs.advice.data, '{}');
  assert.deepEqual(JSON.parse(docs['usb-backups'].data).map(b => b.id), ['2', '1']);
  const many = Array.from({ length: 40 }, (_, i) => ({ id: String(i), at: T(1 + (i % 20)) }));
  assert.equal(JSON.parse(LIBMERGE.mergeDocs({ 'usb-backups': { data: JSON.stringify(many), updatedAt: T(1) } }, { 'usb-backups': { data: '[]', updatedAt: T(2) } })['usb-backups'].data).length, 30);
});

// ---- server ---------------------------------------------------------------------------------------
const dataDir = await mkdtemp(join(tmpdir(), 'ms60b-sync-'));
const port = 18097;
const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', fileURLToPath(new URL('../deploy/server.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, PBKDF2_ITER: '1000', MAIL_FILE: '', SMTP_USER: '', TELEGRAM_FILE: '', TELEGRAM_TOKEN: '' }, stdio: ['ignore', 'pipe', 'inherit'] });
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
  await test('the old anonymous sync codes are gone', async () => {
    assert.equal((await post(`/api/sync/${id}`, { patches: [], deleted: {} })).status, 410);
    assert.equal((await post('/api/nothing', {})).status, 404);
  });

  // ---- account sync ----
  const memoryStorage = () => {
    const data = new Map();
    return { getItem: k => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k), data };
  };
  const signUp = async email => {
    const response = await fetch(`${base}/register`, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'CF-Connecting-IP': email },
      body: new URLSearchParams({ email, password: 'long enough password' }) });
    return response.headers.get('set-cookie').split(';')[0];
  };
  // A browser of a signed-in user: its own storage, requests sent with the session cookie
  let tick = 0; // one clock for every browser, one second further at each reading
  const clock = () => new Date(Date.parse(T(20)) + ++tick * 1000).toISOString();
  const device = cookie => {
    const storage = memoryStorage();
    const request = (path, options) => fetch(base + path, { ...options, headers: { ...options.headers, Cookie: cookie } });
    return { storage, sync: ACCOUNT.createSync({ storage, request, merge: LIBMERGE, now: clock }) };
  };

  await test('account sync: two browsers of one user share patches and settings, per pedal', async () => {
    const cookie = await signUp('bassist@example.com');
    const phone = device(cookie);
    const laptop = device(cookie);
    phone.storage.setItem('ms60b-library', JSON.stringify([patch('a', 'FROM PHONE', T(20))]));
    phone.storage.setItem('ms60b-view', 'list');
    phone.storage.setItem('ms50g-library', JSON.stringify([patch('g', 'GUITAR', T(20))]));
    await phone.sync.syncPedal('ms60b');
    await phone.sync.syncPedal('ms50g');
    laptop.storage.setItem('ms60b-library', JSON.stringify([patch('b', 'FROM LAPTOP', T(21))]));
    const { changed } = await laptop.sync.syncPedal('ms60b');
    assert.deepEqual(JSON.parse(laptop.storage.getItem('ms60b-library')).map(p => p.id).sort(), ['a', 'b']);
    assert.equal(laptop.storage.getItem('ms60b-view'), 'list');
    assert.ok(changed.includes('ms60b-view'));
    assert.equal(laptop.storage.getItem('ms50g-library'), null, 'the other pedal is synced on its own');
    await laptop.sync.syncPedal('ms50g');
    assert.deepEqual(JSON.parse(laptop.storage.getItem('ms50g-library')).map(p => p.name), ['GUITAR']);
    laptop.storage.setItem('ms60b-view', 'grid');
    await laptop.sync.syncPedal('ms60b');
    await phone.sync.syncPedal('ms60b');
    assert.equal(phone.storage.getItem('ms60b-view'), 'grid', 'a setting changed on the laptop reaches the phone');
    assert.deepEqual(JSON.parse(phone.storage.getItem('ms60b-library')).map(p => p.id).sort(), ['a', 'b']);
    phone.storage.removeItem('ms60b-view');
    await phone.sync.syncPedal('ms60b');
    await laptop.sync.syncPedal('ms60b');
    assert.equal(laptop.storage.getItem('ms60b-view'), null, 'a removed setting is removed everywhere');
  });

  await test('account sync: accounts are separate and signed-out requests are refused', async () => {
    const other = device(await signUp('other@example.com'));
    await other.sync.syncPedal('ms60b');
    assert.deepEqual(JSON.parse(other.storage.getItem('ms60b-library')), []);
    const anonymous = device('');
    await assert.rejects(anonymous.sync.syncPedal('ms60b'), error => error.signedOut === true);
    const cookie = await signUp('third@example.com');
    const json = { 'Content-Type': 'application/json', Cookie: cookie };
    assert.equal((await fetch(`${base}/api/account/sync/ms99x`, { method: 'POST', headers: json, body: '{}' })).status, 404);
    assert.equal((await fetch(`${base}/api/account/sync/ms60b`, { headers: json })).status, 405);
    assert.equal((await fetch(`${base}/api/account/sync/ms60b`, { method: 'POST', headers: { ...json, 'Content-Type': 'text/plain' }, body: '{}' })).status, 415);
    assert.equal((await fetch(`${base}/api/account/sync/ms60b`, { method: 'POST', headers: { ...json, 'Sec-Fetch-Site': 'cross-site' }, body: '{}' })).status, 403);
    assert.equal((await fetch(`${base}/api/account/sync/ms60b`, { method: 'POST', headers: json, body: 'nope' })).status, 400);
  });

  await test('account sync: oversized or unknown data is dropped, pedal backups are merged', async () => {
    const cookie = await signUp('backups@example.com');
    const headers = { 'Content-Type': 'application/json', Cookie: cookie };
    const backups = id => JSON.stringify([{ id, memory: 1, name: 'OLD', at: T(20 + Number(id)), data: 'AAAA' }]);
    const send = docs => fetch(`${base}/api/account/sync/ms60b`, { method: 'POST', headers, body: JSON.stringify({ patches: [], deleted: {}, docs }) }).then(r => r.json());
    await send({ 'usb-backups': { data: backups('1'), updatedAt: T(20) } });
    const merged = await send({ 'usb-backups': { data: backups('2'), updatedAt: T(22) }, view: { data: 'x'.repeat(101), updatedAt: T(22) }, secrets: { data: 'no', updatedAt: T(22) } });
    assert.deepEqual(JSON.parse(merged.docs['usb-backups'].data).map(b => b.id), ['2', '1']);
    assert.equal(merged.docs.view, undefined);
    assert.equal(merged.docs.secrets, undefined);
    const bad = { id: 'x', name: 'NO EFFECTS', updatedAt: T(20) };
    const odd = { ...patch('c', 'A'.repeat(40), T(20)), output: 'evil', extra: '<script>' };
    const cleaned = await fetch(`${base}/api/account/sync/ms60b`, { method: 'POST', headers, body: JSON.stringify({ patches: [bad, odd], deleted: {} }) }).then(r => r.json());
    assert.equal(cleaned.patches.length, 1);
    assert.equal(cleaned.patches[0].name.length, 28);
    assert.equal(cleaned.patches[0].output, null);
    assert.equal('extra' in cleaned.patches[0], false);
    assert.equal((await fetch(`${base}/api/account/sync/ms60b`, { method: 'POST', headers, body: 'x'.repeat(1_100_000) })).status, 413);
  });

  await test('account sync: a change made while the request is on its way is not lost', async () => {
    const cookie = await signUp('busy@example.com');
    const storage = memoryStorage();
    const request = async (path, options) => {
      storage.setItem('ms60b-view', 'changed meanwhile');
      storage.setItem('ms60b-library', JSON.stringify([patch('late', 'LATE', T(25))]));
      return fetch(base + path, { ...options, headers: { ...options.headers, Cookie: cookie } });
    };
    storage.setItem('ms60b-view', 'before');
    storage.setItem('ms60b-library', JSON.stringify([patch('early', 'EARLY', T(20))]));
    const sync = ACCOUNT.createSync({ storage, request, merge: LIBMERGE });
    const { pending } = await sync.syncPedal('ms60b');
    assert.equal(pending, true);
    assert.equal(storage.getItem('ms60b-view'), 'changed meanwhile');
    assert.deepEqual(JSON.parse(storage.getItem('ms60b-library')).map(p => p.id).sort(), ['early', 'late']);
    assert.equal(sync.snapshot('ms60b').docs.view.data, 'changed meanwhile', 'it is sent with the next sync');
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
