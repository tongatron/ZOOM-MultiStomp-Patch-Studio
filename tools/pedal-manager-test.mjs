// Pedal manager in a real browser against the simulated pedal: Clear patch on a readable memory and on a memory the
// page cannot decode (it proposes the name Empty, keeps a backup first). Run: PW_CHANNEL=chrome node tools/pedal-manager-test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { fakePedal } from './fake-pedal.mjs';

const PORT = 8109;
const server = spawn('node', ['deploy/server.mjs'], { env: { ...process.env, PORT: String(PORT), DATA_DIR: fs.mkdtempSync('/tmp/pm-test-') }, stdio: 'ignore' });
await new Promise(resolve => setTimeout(resolve, 1500));
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
let passed = 0;
const test = async (name, fn) => { try { await fn(); passed++; console.log(`✓ ${name}`); } catch (error) { process.exitCode = 1; console.log(`✗ ${name}\n  ${error.message}`); } };

try {
  const good = [...fs.readFileSync('patches/01base.zptc')];
  const garbage = Array(848).fill(88); // not a PTCF file: the page cannot decode it
  const page = await (await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 800 } })).newPage();
  await page.addInitScript(({ source, patches }) => {
    localStorage.setItem('account-welcome', 'ignored');
    const answer = eval(`(${source})`)(patches.map(p => new Uint8Array(p)), { device: 0x6e });
    const input = { id: 'in', name: 'ZOOM MS Plus Series', open: async () => {}, onmidimessage: null };
    const output = { id: 'out', name: 'ZOOM MS Plus Series', open: async () => {}, send: message => { const r = answer(message); if (r) setTimeout(() => input.onmidimessage?.({ data: new Uint8Array(r) }), 1); } };
    navigator.requestMIDIAccess = async () => ({ inputs: new Map([['in', input]]), outputs: new Map([['out', output]]), onstatechange: null });
  }, { source: fakePedal.toString(), patches: [good, garbage] });
  await page.goto(`http://localhost:${PORT}/ms-60b/pedal-manager.html`);
  await page.click('#usb-connect');
  await page.locator('#usb-memories li[data-state="ok"]').first().waitFor({ timeout: 20000 });
  await page.waitForFunction(() => !document.querySelector('#usb-memories li[data-state="loading"]'), null, { timeout: 60000 });

  await test('a memory that cannot be decoded still offers Read again and Clear patch', async () => {
    await page.locator('#usb-memories li[data-n="2"] .usb-mem-main').click();
    const detail = page.locator('#usb-memories li[data-n="2"] .usb-mem-detail');
    assert.match(await detail.innerText(), /Not a PTCF file/);
    assert.equal(await detail.locator('[data-act="clear"]').isEnabled(), true);
  });
  await test('Clear patch proposes the name Empty, backs up the memory first and writes it', async () => {
    const download = page.waitForEvent('download');
    await page.locator('#usb-memories li[data-n="2"] [data-act="clear"]').click();
    assert.equal(await page.inputValue('#usb-clear-name'), 'Empty');
    await page.fill('#usb-clear-name', 'Nothing');
    await page.click('#usb-confirm-yes');
    assert.match((await download).suggestedFilename(), /^backup 002/);
    await page.waitForFunction(() => /Cleared/.test(document.querySelector('#usb-status')?.textContent || ''), null, { timeout: 20000 });
    assert.match(await page.locator('#usb-memories li[data-n="2"] .usb-name').innerText(), /Nothing/);
    assert.equal(await page.locator('#usb-backups li').count() > 0, true, 'the backup is listed');
  });
  await test('a readable patch is cleared as Empty and then has nothing left to clear', async () => {
    await page.waitForTimeout(800); // the first write is finished: the page takes no new write while it is busy
    await page.locator('#usb-memories li[data-n="1"] .usb-mem-main').click();
    const clear = page.locator('#usb-memories li[data-n="1"] [data-act="clear"]');
    assert.equal(await clear.isEnabled(), true);
    const download = page.waitForEvent('download');
    await clear.click();
    await page.waitForSelector('#usb-confirm[open]');
    assert.equal(await page.inputValue('#usb-clear-name'), 'Empty');
    await page.click('#usb-confirm-yes');
    await download;
    await page.waitForFunction(() => /Empty/.test(document.querySelector('#usb-memories li[data-n="1"] .usb-name')?.textContent || ''), null, { timeout: 20000 });
    assert.equal(await page.locator('#usb-memories li[data-n="1"] [data-act="clear"]').isDisabled(), true);
  });
} finally {
  await browser.close();
  server.kill();
}
console.log(`${passed} passed`);
