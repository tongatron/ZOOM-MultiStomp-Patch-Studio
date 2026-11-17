// Read-only Pedal manager of the beta pedals (MS-200D+, MS-80IR+) in a real browser against the simulated pedal: it connects,
// lists the memories with the patch name and the effects, makes and deletes a backup, downloads a .zptc, never writes to
// the pedal and never raises a native dialog. Run: PW_CHANNEL=chrome node tools/pedal-reader-test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { fakePedal } from './fake-pedal.mjs';

const PORT = 8110;
const server = spawn('node', ['deploy/server.mjs'], { env: { ...process.env, PORT: String(PORT), DATA_DIR: fs.mkdtempSync('/tmp/pr-test-') }, stdio: 'ignore' });
await new Promise(resolve => setTimeout(resolve, 1500));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
function mockMidi({ source, patches }) {
  localStorage.setItem('account-welcome', 'ignored');
  const answer = eval(`(${source})`)(patches.map(p => new Uint8Array(p)), { device: 0x6e });
  window.__sent = [];
  const input = { id: 'in', name: 'ZOOM MS Plus Series', open: async () => {}, onmidimessage: null };
  const output = { id: 'out', name: 'ZOOM MS Plus Series', open: async () => {}, send: message => { window.__sent.push([...message]); const r = answer(message); if (r) setTimeout(() => input.onmidimessage?.({ data: new Uint8Array(r) }), 0); } };
  navigator.requestMIDIAccess = async () => ({ inputs: new Map([['in', input]]), outputs: new Map([['out', output]]), onstatechange: null });
}
let passed = 0;
const nativeDialogs = [];
const test = async (name, fn) => { try { await fn(); passed++; console.log(`✓ ${name}`); } catch (error) { process.exitCode = 1; console.log(`✗ ${name}\n  ${error.message}`); } };
try {
  const good = [...fs.readFileSync('patches/01base.zptc')];
  for (const folder of ['ms-80ir', 'ms-200d']) {
    const page = await (await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 800 } })).newPage();
    page.on('dialog', dialog => { nativeDialogs.push(`${dialog.type()}: ${dialog.message()}`); dialog.dismiss(); });
    await page.addInitScript(mockMidi, { source: fakePedal.toString(), patches: [good, Array(848).fill(88)] });
    await page.goto(`http://localhost:${PORT}/${folder}/pedal-manager.html`);
    await test(`${folder}: the nav has Effects and Pedal manager, and the page says it only reads`, async () => {
      assert.deepEqual(await page.locator('.fs-nav > a').allTextContents(), ['Effects', 'Pedal manager']);
      assert.match(await page.locator('.rd-note').first().innerText(), /only reads/);
      assert.equal(await page.locator('.fs-beta').count(), 1);
    });
    await page.click('#rd-connect');
    await page.waitForFunction(() => /memories read/.test(document.querySelector('#rd-status').textContent), null, { timeout: 60000 });
    await test(`${folder}: memories are listed, the patch shows its effects, and a memory that is not a patch is marked`, async () => {
      assert.ok((await page.locator('#rd-list .rd-row').count()) >= 2);
      assert.match(await page.locator('#rd-list .rd-row').nth(0).innerText(), /^1\s+\S+/);
      assert.match(await page.locator('#rd-list .rd-row').nth(1).innerText(), /cannot read/);
      await page.locator('#rd-list .rd-row').nth(0).click();
      assert.ok((await page.locator('#rd-detail .rd-effects li').count()) >= 1);
      const [download] = await Promise.all([page.waitForEvent('download'), page.click('#rd-download')]);
      assert.match(download.suggestedFilename(), /\.zptc$/);
    });
    await test(`${folder}: a backup is kept in the browser, downloads as JSON and is deleted after a question`, async () => {
      await page.click('#rd-backup');
      assert.equal(await page.locator('#rd-backups li[data-id]').count(), 1);
      const [download] = await Promise.all([page.waitForEvent('download'), page.click('#rd-backups [data-act="download"]')]);
      assert.match(download.suggestedFilename(), /-backup-\d{4}-\d{2}-\d{2}\.json$/);
      await page.click('#rd-backups [data-act="delete"]');
      await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
      await page.locator('#rd-backups li[data-id]').waitFor({ state: 'detached', timeout: 3000 });
      assert.equal(await page.locator('#rd-backups li[data-id]').count(), 0);
    });
    await test(`${folder}: no command that writes to the pedal was sent`, async () => {
      const sent = await page.evaluate(() => window.__sent);
      assert.ok(sent.length > 3);
      assert.equal(sent.filter(m => m[0] === 0xf0 && m[1] === 0x52 && (m[4] === 0x45 || m[4] === 0x64 && m[5] === 0x20)).length, 0, 'no write command');
    });
    await test(`${folder}: the memories as last read are shown again after a reload`, async () => {
      await page.reload();
      assert.match(await page.locator('#rd-status').innerText(), /as last read/);
      assert.ok((await page.locator('#rd-list .rd-row').count()) >= 2);
    });
    await page.close();
  }
  await test('no native browser dialog was raised', async () => assert.deepEqual(nativeDialogs, []));
} finally {
  await browser.close();
  server.kill();
  console.log(`${passed} passed`);
}
