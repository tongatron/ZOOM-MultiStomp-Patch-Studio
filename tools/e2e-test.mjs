// End-to-end test of the patch builder in a real browser (Playwright): build, save, share, compare, download, sync.
// Run: npm install && npx playwright install chromium && node tools/e2e-test.mjs
// Locally you can use the installed Chrome instead of downloading Chromium: PW_CHANNEL=chrome node tools/e2e-test.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const port = 18197;
const base = `http://127.0.0.1:${port}`;
const dataDir = await mkdtemp(join(tmpdir(), 'ms60b-e2e-'));
const server = spawn(process.execPath, [fileURLToPath(new URL('../deploy/server.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port), DATA_DIR: dataDir }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(resolve => server.stdout.once('data', resolve));
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });

let passed = 0;
const errors = [];
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };
// Each context is a separate "device" with its own storage; service workers are blocked so every load hits the server
async function device() {
  const context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: true });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('dialog', dialog => dialog.accept());
  await page.goto(`${base}/builder.html`);
  return { context, page };
}
const addEffect = async (page, name) => {
  await page.locator('#chain-list [data-action="open-picker"], #add-effect').first().click();
  await page.fill('#picker-query', name);
  await page.locator('.picker-item', { hasText: name }).first().click();
};
const chain = page => page.locator('#chain-list .chain-item').count();

try {
  const { context, page } = await device();

  await test('build a chain with the picker and reorder it from the keyboard', async () => {
    await addEffect(page, 'DYNAMIC COMPRESSOR');
    await addEffect(page, 'BASS GRAPHIC EQ');
    assert.equal(await chain(page), 2);
    await page.locator('#chain-list .chain-item').first().locator('[data-action="down"]').click();
    assert.match(await page.locator('#chain-list .chain-item').first().innerText(), /BASS GRAPHIC EQ/);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'up', 'focus stays on the moved effect');
  });

  await test('save the patch to My patches', async () => {
    await page.fill('#patch-name', 'E2E TEST');
    await page.click('#save-patch');
    assert.equal(await page.locator('#library-count').innerText(), '1');
    assert.match(await page.locator('#library-list').innerText(), /E2E TEST/);
  });

  await test('download a .zptc file that starts with the PTCF header', async () => {
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#download')]);
    assert.equal(download.suggestedFilename(), 'E2E_TEST.zptc');
    const bytes = await readFile(await download.path());
    assert.equal(bytes.subarray(0, 4).toString('latin1'), 'PTCF');
  });

  await test('a share link opens the same patch on another device', async () => {
    const link = await page.evaluate(() => new URL(PATCHLINK.url(serialize(state)), location.href).href);
    const other = await device();
    await other.page.goto(link);
    await other.page.reload();
    assert.equal(await other.page.inputValue('#patch-name'), 'E2E TEST');
    assert.equal(await chain(other.page), 2);
    assert.match(await other.page.locator('#notices').innerText(), /Opened the shared patch/);
    await other.context.close();
  });

  await test('compare a saved patch with a changed copy', async () => {
    await page.locator('#chain-list .chain-item').first().locator('[data-action="toggle-on"]').uncheck({ force: true });
    await page.click('#save-as-new');
    assert.equal(await page.locator('#library-count').innerText(), '2');
    await page.click('#compare-open');
    await page.selectOption('#compare-a', { index: 1 });
    await page.selectOption('#compare-b', { index: 2 });
    assert.match(await page.locator('#compare-body').innerText(), /State/);
    await page.locator('[data-cmp-copy="a"][data-param="State"]').click();
    assert.match(await page.locator('#compare-body').innerText(), /identical/);
    await page.click('#compare-close');
  });

  await test('two devices share My patches through Sync', async () => {
    await page.click('#sync-open');
    await page.click('#sync-create');
    const code = (await page.locator('#sync-code').innerText()).trim();
    assert.match(code, /^[A-Z2-9]{5}(-[A-Z2-9]{5}){3}$/);
    await page.waitForFunction(() => /Last synced/.test(document.querySelector('#sync-status').textContent));
    await page.click('#sync-close');
    const laptop = await device();
    await laptop.page.click('#sync-open');
    await laptop.page.fill('#sync-code-input', code.toLowerCase().replaceAll('-', ''));
    await laptop.page.click('#sync-join');
    await laptop.page.waitForFunction(() => document.querySelector('#library-count').textContent === '2');
    await laptop.context.close();
  });

  await test('a tone idea opens in the builder with its chain and advice style', async () => {
    const fresh = await device();
    await fresh.page.goto(`${base}/tones.html`);
    assert.ok(await fresh.page.locator('#tone-styles .tone-card').count() >= 5);
    await fresh.page.locator('#bassist-wolstenholme .btn-primary').click();
    await fresh.page.waitForURL(/builder\.html/);
    assert.equal(await fresh.page.inputValue('#patch-name'), 'FUZZ SYNTH');
    assert.equal(await chain(fresh.page), 2);
    assert.equal(await fresh.page.inputValue('#advice-style'), 'fuzzrock');
    await fresh.context.close();
  });

  await test('the catalog page loads and links to the builder', async () => {
    await page.goto(`${base}/`);
    assert.ok(await page.locator('a[href*="builder"]').count());
  });

  await context.close();
  assert.deepEqual(errors, [], `no errors in the browser console:\n${errors.join('\n')}`);
  passed++;
  console.log('✓ no errors in the browser console');
} finally {
  await browser.close();
  server.kill();
  await rm(dataDir, { recursive: true, force: true });
}
console.log(`\n${passed} passed`);
