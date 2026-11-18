// Takes the screenshots of the home page (site/landing/shots/*.webp) from the real pages: the Patch builder and the
// Pedal manager of the MS-60B+ and the MS-70CDR+, the pedal menu, the Effects page, the Add effect window and the
// MS-50G+ builder. A local server with an empty database, a test account (so the header shows the account menu), sample
// patches in My patches and the simulated pedal of tools/fake-pedal.mjs, so no list is empty. 1280 × 800 at 1.5×,
// saved as WebP with cwebp (brew install webp).
// Run: PW_CHANNEL=chrome node tools/landing-shots.mjs [name …]   (names: the keys of SHOTS below; none = all)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { fakePedal } from './fake-pedal.mjs';

const PORT = 8131;
const OUT = 'site/landing/shots';
const EMAIL = 'player@example.com';
const VIEWPORT = { width: 1280, height: 800 };
const SCALE = 1.5;

// Sample patches, newest first (values in display units, as the starters of advice-rules.js; unset ones take the defaults)
const MS60B = [
  { name: 'ALT ROCK', effects: [
    { effect: 'DYNAMIC COMPRESSOR', values: { SENSE: 5, ATTACK: 'FAST', TONE: 50, VOL: 80 } },
    { effect: 'SQUEAK DISTORTION', values: { GAIN: 45, TONE: 55, VOL: 75 } },
    { effect: 'BASS GRAPHIC EQ' },
    { effect: 'AMPG SVT' },
    { effect: 'CLONE CHORUS' },
    { effect: 'ROOM REVERB', values: { MIX: 20 } }
  ] },
  { name: 'FUNK SLAP', effects: [
    { effect: 'ENVELOPE FILTER', values: { THRSHLD: 50, ATTACK: 60, MODE: 'UP', VOL: 80 } },
    { effect: 'DYNAMIC COMPRESSOR', values: { SENSE: 6, ATTACK: 'FAST', TONE: 55, VOL: 80 } },
    { effect: 'BASS DRIVER PREAMP', values: { BASS: 55, TREBLE: 60, PRESENC: 55, BLEND: 40, GAIN: 30, VOL: 70, 'MID-FREQ': '1.0 kHz', MID: 45 } }
  ] },
  { name: 'ROCK DRIVE', effects: [
    { effect: 'DYNAMIC COMPRESSOR', values: { SENSE: 4, ATTACK: 'SLOW', TONE: 50, VOL: 80 } },
    { effect: 'BLUEBERRY DRIVE', values: { GAIN: 55, TONE: 55, BLEND: 50, VOL: 75 } },
    { effect: 'AG 750', values: { GAIN: 40, VOL: 70, CABINET: 60, DEEP: 'OFF', BRIGHT: 'OFF', BASS: 55, MID: 55, TREBLE: 50 } }
  ] },
  { name: 'GRUNGE', effects: [{ effect: 'SQUEAK DISTORTION' }, { effect: 'AMPG SVT' }] },
  { name: 'POST PUNK', effects: [{ effect: 'DYNAMIC COMPRESSOR' }, { effect: 'CLONE CHORUS' }] },
  { name: 'DUB DEEP', effects: [{ effect: 'OPTICAL COMPRESSOR' }, { effect: 'BASS GRAPHIC EQ' }, { effect: 'SPRING REVERB' }] },
  { name: 'INDIE ROCK', effects: [{ effect: 'DYNAMIC COMPRESSOR' }, { effect: 'AMPG SVT' }] },
  { name: 'JAZZ WARM', effects: [{ effect: 'OPTICAL COMPRESSOR' }, { effect: 'BASS GRAPHIC EQ' }] }
];
const MS70CDR = [
  { name: 'DREAM WASH', effects: [
    { effect: 'COMPRESSOR' },
    { effect: 'PHASER' },
    { effect: 'STEREO CHORUS' },
    { effect: 'TAPE ECHO' },
    { effect: 'PING PONG DELAY' },
    { effect: 'HALL REVERB' }
  ] },
  { name: 'SURF SPRING', effects: [{ effect: 'TREMOLO' }, { effect: 'SPRING REVERB 63' }] },
  { name: 'SLAPBACK', effects: [{ effect: 'SLAP BACK DELAY' }, { effect: 'ROOM REVERB' }] },
  { name: 'SHIMMER PAD', effects: [{ effect: 'SLOW ATTACK' }, { effect: 'MODULATION DELAY' }, { effect: 'SHIMMER REVERB' }] },
  { name: '80S CLEAN', effects: [{ effect: 'COMPRESSOR' }, { effect: 'STEREO CHORUS' }, { effect: 'STEREO DELAY' }, { effect: 'PLATE REVERB' }] },
  { name: 'VIBE SWIRL', effects: [{ effect: 'THE VIBE' }, { effect: 'TAPE ECHO' }] },
  { name: 'LO-FI TAPE', effects: [{ effect: 'LO-FI DELAY' }, { effect: 'LO-FI REVERB' }] },
  { name: 'CHURCH PAD', effects: [{ effect: 'SLOW ATTACK' }, { effect: 'CHURCH REVERB' }] }
];
const MS50G = [
  { name: 'CLASSIC ROCK', effects: [
    { effect: 'COMPRESSOR' }, { effect: 'TS DRIVE' }, { effect: 'MS800 DRIVE' }, { effect: 'CLONE CHORUS' }, { effect: 'DELAY' }, { effect: 'HALL REVERB' }
  ] },
  { name: 'BLUES', effects: [{ effect: 'TS DRIVE' }, { effect: 'SPRING REVERB' }] },
  { name: 'CLEAN CHORUS', effects: [{ effect: 'COMPRESSOR' }, { effect: 'STEREO CHORUS' }, { effect: 'HALL REVERB' }] }
];
// Pedal memories: the same patches in another order, as a pedal would hold them; memory 4 gets the six-effect one
const memoryOrder = list => [list[1], list[2], list[3], list[0], list[4], list[5], list[6], list[7]];

const server = spawn('node', ['deploy/server.mjs'], {
  env: { ...process.env, PORT: String(PORT), DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'landing-shots-')), MAIL_FILE: '', TELEGRAM_FILE: '' },
  stdio: 'ignore'
});
await new Promise(resolve => setTimeout(resolve, 1500));
const base = `http://localhost:${PORT}`;
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-shots-png-'));

// A fake Web MIDI access wired to the simulated pedal (runs in the page), as in tools/pedal-manager-test.mjs
function mockMidi({ source, patches }) {
  const answer = eval(`(${source})`)(patches.map(p => new Uint8Array(p)), { device: 0x6e });
  const input = { id: 'in', name: 'ZOOM MS Plus Series', open: async () => {}, onmidimessage: null };
  const output = { id: 'out', name: 'ZOOM MS Plus Series', open: async () => {}, send: message => { const r = answer(message); if (r) setTimeout(() => input.onmidimessage?.({ data: new Uint8Array(r) }), 1); } };
  navigator.requestMIDIAccess = async () => ({ inputs: new Map([['in', input]]), outputs: new Map([['out', output]]), onstatechange: null });
  Object.defineProperty(navigator, 'permissions', { value: { query: async () => ({ state: 'granted' }) }, configurable: true });
}

async function signUp() {
  const response = await fetch(`${base}/register`, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email: EMAIL, name: 'Player', password: 'landing shots password', passwordConfirm: 'landing shots password' }) });
  const cookie = response.headers.get('set-cookie');
  if (!cookie) throw new Error(`sign-up failed (${response.status})`);
  const [name, value] = cookie.split(';')[0].split('=');
  return { name, value, domain: 'localhost', path: '/' };
}

// A browser context of the signed-in test account: no sign-up reminder, this browser already belongs to the account
async function newContext(cookie, extra) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE, ...extra });
  await context.addCookies([cookie]);
  await context.addInitScript(email => {
    localStorage.setItem('account-welcome', 'ignored');
    localStorage.setItem('account-owner', email);
  }, EMAIL);
  return context;
}

// Library entries and pedal memories made by the pedal's own scripts (EFFECTS_DATA, ZPTC) on one of its pages
async function prepare(page, folder, patches) {
  await page.goto(`${base}/${folder}/builder.html`);
  return page.evaluate(list => {
    const index = name => { const i = EFFECTS_DATA.findIndex(e => e[0] === name); if (i < 0) throw new Error(`no effect ${name}`); return i; };
    const now = Date.now();
    const library = list.map((p, k) => ({
      id: `sample${k}`, name: p.name, updatedAt: new Date(now - (k + 1) * 47 * 60e3).toISOString(),
      // slotFor (builder.js) fills the unset parameters with their defaults, as when an effect is added in the builder
      effects: p.effects.map(e => ({ index: index(e.effect), on: true, values: slotFor(index(e.effect), e.values || {}).values }))
    }));
    const memories = list.map(p => Array.from(ZPTC.forPedal(ZPTC.encode({ name: p.name, effects: p.effects.map(e => ({ effect: e.effect, params: e.values || {} })) }).file)));
    return { library, memories };
  }, patches);
}

async function save(page, name, clip) {
  const png = path.join(tmp, `${name}.png`);
  await page.mouse.move(0, VIEWPORT.height - 1); // no hover state in the picture
  await page.waitForTimeout(400);
  await page.screenshot({ path: png, clip, animations: 'disabled' });
  execFileSync('cwebp', ['-quiet', '-q', '82', '-m', '6', png, '-o', path.join(OUT, `${name}.webp`)]);
  console.log(`✓ ${OUT}/${name}.webp`);
}

// Opens the builder with the library in place and one patch (the first by default) open from My patches
async function builder(cookie, pedal, folder, patches, open = 'sample0') {
  const context = await newContext(cookie);
  const page = await context.newPage();
  const { library } = await prepare(page, folder, patches);
  await page.evaluate(([id, list]) => { localStorage.setItem(`${id}-library`, JSON.stringify(list)); }, [pedal, library]);
  await page.reload();
  await page.locator('.account-button').waitFor();
  await page.locator(`#library-list .library-item[data-id="${open}"] .library-open`).click();
  await page.waitForTimeout(500);
  // The sample values are filled in with the defaults when the patch opens: save it so the page shows it as saved
  if (await page.locator('#save-patch').isEnabled()) await page.click('#save-patch');
  await page.waitForTimeout(800);
  return { context, page };
}

async function pedalManager(cookie, pedal, folder, patches) {
  const prep = await newContext(cookie);
  const { library, memories } = await prepare(await prep.newPage(), folder, patches);
  await prep.close();
  const context = await newContext(cookie);
  await context.addInitScript(([id, list]) => { if (!localStorage.getItem(`${id}-library`)) localStorage.setItem(`${id}-library`, JSON.stringify(list)); }, [pedal, library]);
  await context.addInitScript(mockMidi, { source: fakePedal.toString(), patches: memoryOrder(memories) });
  const page = await context.newPage();
  await page.goto(`${base}/${folder}/pedal-manager.html`);
  await page.locator('.account-button').waitFor();
  if (!(await page.locator('#usb-memories li[data-state="ok"]').count())) await page.click('#usb-connect');
  await page.locator('#usb-memories li[data-state="ok"]').first().waitFor({ timeout: 20000 });
  await page.waitForFunction(() => !document.querySelector('#usb-memories li[data-state="loading"]'), null, { timeout: 90000 });
  await page.locator('#usb-memories li[data-n="4"] .usb-mem-main').click();
  await page.waitForTimeout(600);
  await page.locator('#usb-memories').evaluate(list => { list.scrollTop = 0; });
  return { context, page };
}

const SHOTS = {
  async 'ms60b-builder'(cookie) {
    const { context, page } = await builder(cookie, 'ms60b', 'ms-60b', MS60B);
    await save(page, 'ms60b-builder');
    await context.close();
  },
  async 'ms70cdr-builder'(cookie) {
    const { context, page } = await builder(cookie, 'ms70cdr', 'ms-70cdr', MS70CDR);
    await save(page, 'ms70cdr-builder');
    await context.close();
  },
  async 'ms50g-builder'(cookie) {
    const { context, page } = await builder(cookie, 'ms50g', 'ms-50g', MS50G);
    await save(page, 'ms50g-builder');
    await context.close();
  },
  async 'ms60b-pedal-manager'(cookie) {
    const { context, page } = await pedalManager(cookie, 'ms60b', 'ms-60b', MS60B);
    await save(page, 'ms60b-pedal-manager');
    await context.close();
  },
  async 'ms70cdr-pedal-manager'(cookie) {
    const { context, page } = await pedalManager(cookie, 'ms70cdr', 'ms-70cdr', MS70CDR);
    await save(page, 'ms70cdr-pedal-manager');
    await context.close();
  },
  async effects(cookie) {
    const context = await newContext(cookie);
    const page = await context.newPage();
    await page.goto(`${base}/ms-60b/index.html#dynamic-compressor`);
    await page.locator('.account-button').waitFor();
    await page.waitForTimeout(800);
    await save(page, 'effects');
    await context.close();
  },
  async 'add-effect'(cookie) {
    const { context, page } = await builder(cookie, 'ms60b', 'ms-60b', MS60B, 'sample1'); // three effects: Add effect is enabled
    await page.locator('#add-effect').click();
    await page.locator('dialog[open]').waitFor();
    await page.waitForTimeout(500);
    await save(page, 'add-effect');
    await context.close();
  },
  async menu(cookie) {
    const context = await newContext(cookie);
    const page = await context.newPage();
    await page.goto(`${base}/ms-60b/builder.html`);
    await page.locator('.account-button').waitFor();
    await page.click('.fs-menu-button');
    const list = await page.locator('#pedal-menu').boundingBox();
    const button = await page.locator('.fs-menu').boundingBox();
    const x = Math.max(0, button.x - 16);
    await save(page, 'menu', { x, y: 0, width: Math.max(list.x + list.width, button.x + button.width) + 16 - x, height: list.y + list.height + 16 });
    await context.close();
  }
};

let failed = false;
try {
  const cookie = await signUp();
  const wanted = process.argv.slice(2);
  for (const [name, take] of Object.entries(SHOTS)) {
    if (wanted.length && !wanted.includes(name)) continue;
    try { await take(cookie); }
    catch (error) { failed = true; console.log(`✗ ${name}: ${error.message}`); }
  }
} finally {
  await browser.close();
  server.kill();
  fs.rmSync(tmp, { recursive: true, force: true });
}
if (failed) process.exitCode = 1;
