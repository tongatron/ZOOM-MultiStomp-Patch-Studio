// The old address of the site only redirects to the new one (deploy/legacy-host.mjs): pages, files, the service worker and the
// hand-over of the data a browser keeps for the old address. The same server answers under two names: localhost is the
// new address and 127.0.0.1 the old one.
// Run: npm install && npx playwright install chromium && node tools/legacy-test.mjs
// Locally you can use the installed Chrome instead of downloading Chromium: PW_CHANNEL=chrome node tools/legacy-test.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const port = 18199;
const site = `http://localhost:${port}`;
const old = `http://127.0.0.1:${port}`;
const dataDir = await mkdtemp(join(tmpdir(), 'ms60b-legacy-'));
const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', fileURLToPath(new URL('../deploy/server.mjs', import.meta.url))],
  { env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, SITE_URL: site, LEGACY_ORIGINS: old, PBKDF2_ITER: '1000' } });
await new Promise(resolve => server.stdout.once('data', resolve));

let passed = 0;
const failures = [];
const test = async (name, fn) => {
  try { await fn(); passed++; console.log(`✓ ${name}`); } catch (error) { failures.push(name); console.log(`✗ ${name}\n  ${error.message.split('\n').join('\n  ')}`); }
};
const page = { headers: { accept: 'text/html,application/xhtml+xml' }, redirect: 'manual' };

await test('a page request to the old address gets the hand-over page, which is never cached', async () => {
  const response = await fetch(`${old}/builder.html?add=hall`, page);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('referrer-policy'), 'origin');
  const body = await response.text();
  assert.match(body, new RegExp(`const site = "${site}"`));
  assert.match(body, /location\.replace\(target\)/);
  assert.match(body, /<noscript><meta http-equiv="refresh"/);
});

await test('any other file of the old address is redirected for good to the same path and query', async () => {
  const response = await fetch(`${old}/styles.css?v=zoom56`, { headers: { accept: 'text/css,*/*;q=0.1' }, redirect: 'manual' });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), `${site}/styles.css?v=zoom56`);
  const head = await fetch(`${old}/favicon.svg`, { method: 'HEAD', redirect: 'manual' });
  assert.equal(head.status, 301);
});

await test('nothing is sent to the old address: POST gets 410 and the new address', async () => {
  const response = await fetch(`${old}/api/account/sync/ms60b`, { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' }, redirect: 'manual' });
  assert.equal(response.status, 410);
  assert.match((await response.json()).error, new RegExp(site));
});

await test('the old address serves a service worker that removes itself and the caches; the new one serves the real one', async () => {
  const goodbye = await fetch(`${old}/sw.js`);
  assert.equal(goodbye.status, 200);
  assert.match(goodbye.headers.get('content-type'), /javascript/);
  assert.equal(goodbye.headers.get('cache-control'), 'no-store');
  const text = await goodbye.text();
  assert.match(text, /registration\.unregister\(\)/);
  assert.match(text, /caches\.delete/);
  assert.match(await (await fetch(`${site}/sw.js`)).text(), /const CACHE = /);
});

await test('the new address is the site itself, and its /moved page only takes data from the old address', async () => {
  const builder = await fetch(`${site}/builder.html`);
  assert.equal(builder.status, 200);
  assert.match(await builder.text(), /Patch builder/);
  const receiver = await fetch(`${site}/moved`);
  assert.equal(receiver.status, 200);
  assert.equal(receiver.headers.get('cache-control'), 'no-store');
  const body = await receiver.text();
  assert.ok(body.includes(`const FROM = ["${old}"]`));
  assert.match(body, /event\.origin !== from/);
});

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
try {
  const seed = async (context, origin, values) => {
    const tab = await context.newPage();
    await tab.route(`${origin}/seed`, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>seed</title>' }));
    await tab.goto(`${origin}/seed`);
    await tab.evaluate(entries => { for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); }, values);
    await tab.close();
  };
  const patch = (id, name, updatedAt) => ({ id, name, output: null, effects: [{ index: 1, on: true, values: {} }], updatedAt });

  await test('visiting a page of the old address brings its patches, backups and settings to the same page of the new one', async () => {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await seed(context, old, {
      'ms60b-library': [patch('pa', 'OLD ONE', '2026-10-20T10:00:00.000Z')],
      'ms60b-usb-backups': [{ id: 'x', memory: 2, name: 'B', at: '2026-10-21T10:00:00.000Z', data: 'AAAA' }],
      'ms50g-view': 'grid',
      'account-welcome': 'ignored',
      'ms60b-account-sync': '{"docs":{}}', 'ms60b-account-owner': 'someone@example.com', 'unrelated': 'x'
    });
    await seed(context, site, { 'ms60b-library': [patch('pb', 'NEW ONE', '2026-10-22T10:00:00.000Z')], 'ms50g-view': 'list' });
    const tab = await context.newPage();
    await tab.goto(`${old}/builder.html?add=hall#frag`);
    await tab.waitForURL(url => url.origin === site && url.pathname === '/builder.html', { timeout: 15000 });
    const kept = await tab.evaluate(() => {
      const get = key => localStorage.getItem(key);
      return {
        patches: JSON.parse(get('ms60b-library')).map(p => p.id).sort(),
        backups: JSON.parse(get('ms60b-usb-backups')).map(b => b.id),
        view: get('ms50g-view'), welcome: get('account-welcome'),
        syncState: get('ms60b-account-sync'), owner: get('ms60b-account-owner'), unrelated: get('unrelated')
      };
    });
    assert.deepEqual(kept, { patches: ['pa', 'pb'], backups: ['x'], view: 'list', welcome: 'ignored', syncState: null, owner: null, unrelated: null },
      'patches are merged, settings the new address already has are kept, the sign-in and sync state stay behind');
    await context.close();
  });

  await test('a browser with nothing stored goes straight to the same page of the new address', async () => {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const tab = await context.newPage();
    await tab.goto(`${old}/guide.html#shortcuts`);
    await tab.waitForURL(url => url.origin === site && url.pathname === '/guide.html', { timeout: 15000 });
    assert.equal(new URL(tab.url()).hash, '#shortcuts');
    await context.close();
  });

  await test('the receiver ignores a page that is not an old address', async () => {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const tab = await context.newPage();
    // a page of the new address itself embeds the receiver: its address is not one of the old ones
    await tab.route(`${site}/embed`, route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><iframe id="f" src="${site}/moved"></iframe>` }));
    await tab.goto(`${site}/embed`);
    await tab.evaluate(() => { window.heard = []; addEventListener('message', event => window.heard.push(event.data)); });
    await tab.waitForTimeout(500);
    const frame = tab.frames().find(f => f.url() === `${site}/moved`);
    assert.ok(frame, 'the receiver loaded');
    await tab.evaluate(() => document.getElementById('f').contentWindow.postMessage({ type: 'moved-data', data: { 'ms60b-view': 'grid' } }, '*'));
    await tab.waitForTimeout(300);
    assert.equal(await frame.evaluate(() => localStorage.getItem('ms60b-view')), null, 'nothing was stored');
    assert.deepEqual(await tab.evaluate(() => window.heard), [], 'and it did not answer');
    await context.close();
  });

  await test('the service worker of the old address removes itself', async () => {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    const tab = await context.newPage();
    await tab.route(`${old}/seed`, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>seed</title>' }));
    await tab.goto(`${old}/seed`);
    await tab.evaluate(() => navigator.serviceWorker.register('/sw.js'));
    await tab.waitForFunction(async () => (await navigator.serviceWorker.getRegistrations()).length === 0, null, { timeout: 15000 });
    await context.close();
  });
} finally {
  await browser.close();
  server.kill();
  await rm(dataDir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
