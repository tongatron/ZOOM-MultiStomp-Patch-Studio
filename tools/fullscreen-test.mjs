// Full-screen version (site/_fullscreen/): every page must fit the window at each target size without scrolling.
// The page and the work area are never cut, every pane fits, the main controls are on screen and each work area keeps
// a useful height. Below 760 × 560 px the pages scroll on purpose (phone layout, later): there only sideways overflow
// is an error. The builder is also checked with a full chain of 6 effects, signed out (with the account notice).
// Run: npm install && npx playwright install chromium && node tools/fullscreen-test.mjs
// Locally you can use the installed Chrome instead of downloading Chromium: PW_CHANNEL=chrome node tools/fullscreen-test.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const port = 18198;
const base = `http://127.0.0.1:${port}/_fullscreen`;
const dataDir = await mkdtemp(join(tmpdir(), 'ms60b-fullscreen-'));
const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', fileURLToPath(new URL('../deploy/server.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, PBKDF2_ITER: '1000', MAIL_OUTBOX: join(dataDir, 'mail') }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(resolve => server.stdout.once('data', resolve));
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });

const SIZES = [[1440, 820], [1280, 680], [1024, 700]];
const PHONE = [390, 700];
// [selector, label, least useful height in px]: the controls must be on screen
const PAGES = {
  'index.html': [['#search', 'search'], ['#sort', 'sort'], ['.fx-link', 'effect list'], ['#fx-dialog .Overlay-nav', 'detail pane'], ['.results .fs-pane-body', 'effect list', 240], ['#dialog-body', 'effect detail', 240]],
  'builder.html': [['#add-effect', 'Add effect'], ['.builder-chain a[href="tones.html"]', 'Tone ideas'], ['#patch-name', 'patch name'], ['#save-patch', 'Save'], ['#download', 'Download .zptc'], ['.advice .switch', 'advice switch'], ['#clear-chain', 'Create new patch'], ['.builder-chain .fs-pane-body', 'chain', 200], ['#library-list', 'My patches list', 48]],
  'pedal-manager.html': [['#usb-connect', 'Connect the pedal'], ['#usb-local-title', 'My patches'], ['#usb-pedal-title', 'On the pedal'], ['#usb-locals', 'My patches list', 160], ['#usb-memories', 'memory list', 160]],
  'tones.html': [['#tone-filter', 'filter'], ['#tone-styles-title', 'By style'], ['#tone-bassists-title', 'By bassist'], ['.tone-pane .fs-pane-body', 'tone list', 200]],
  'resources.html': [['.resource-list', 'manuals'], ['#check-title', 'Still to check'], ['.check-pane .fs-pane-body', 'checks', 200]],
  'technical-notes.html': [['#toc a', 'contents'], ['#doc-title', 'title'], ['.fs-doc .fs-pane-body', 'document', 300]],
  'privacy.html': [['#toc a', 'contents'], ['#doc-title', 'title'], ['.fs-doc .fs-pane-body', 'document', 300]]
};

// Runs in the page: what is cut, off screen or too small
function check(keys) {
  const issues = [];
  if (getComputedStyle(document.body).overflowY !== 'hidden') return { scrolls: true, wide: document.documentElement.scrollWidth - innerWidth, issues };
  const cut = (el, label) => {
    const tall = el.scrollHeight - el.clientHeight;
    const wide = el.scrollWidth - el.clientWidth;
    if (tall > 1) issues.push(`${label} cut by ${tall} px`);
    if (wide > 1) issues.push(`${label} ${wide} px too wide`);
  };
  cut(document.body, 'page');
  cut(document.querySelector('.fs-main'), 'work area');
  document.querySelectorAll('.fs-pane').forEach(pane => {
    if (pane.getClientRects().length) cut(pane, pane.getAttribute('aria-label') || pane.querySelector('h1, h2')?.textContent.trim() || 'pane');
  });
  for (const [selector, label, least] of keys) {
    const el = document.querySelector(selector);
    if (!el) { issues.push(`${label} missing`); continue; }
    const r = el.getBoundingClientRect();
    if (least && r.height < least) issues.push(`${label} only ${Math.round(r.height)} px tall`);
    const x = r.left + Math.min(r.width / 2, 12);
    const y = r.top + r.height / 2;
    const hit = r.width > 0 && x >= 0 && y >= 0 && x < innerWidth && y < innerHeight ? document.elementFromPoint(x, y) : null;
    if (!hit || !(el === hit || el.contains(hit) || hit.contains(el))) issues.push(`${label} off screen`);
  }
  return { scrolls: false, issues };
}

let passed = 0;
const failures = [];
const errors = [];
const test = async (name, fn) => {
  try { await fn(); passed++; console.log(`✓ ${name}`); } catch (error) { failures.push(name); console.log(`✗ ${name}\n  ${error.message.split('\n').join('\n  ')}`); }
};
const context = await browser.newContext({ serviceWorkers: 'block' });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push(message.text()); });
const open = async (file, [width, height]) => {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}/${file}`);
  if (file === 'technical-notes.html' || file === 'privacy.html') await page.waitForSelector('#toc a', { state: 'attached' });
  await page.waitForTimeout(150);
};

try {
  for (const [file, keys] of Object.entries(PAGES)) {
    for (const size of SIZES) {
      await test(`${file} fits ${size.join(' × ')}`, async () => {
        await open(file, size);
        const result = await page.evaluate(check, keys);
        assert.equal(result.scrolls, false, 'the page scrolls');
        assert.deepEqual(result.issues, []);
      });
    }
    await test(`${file} at ${PHONE.join(' × ')} scrolls only down, never sideways`, async () => {
      await open(file, PHONE);
      const result = await page.evaluate(check, keys);
      assert.equal(result.scrolls, true, 'the page should fall back to scrolling');
      assert.ok(result.wide <= 1, `${result.wide} px too wide`);
    });
  }

  await test('builder with 6 effects fits every size', async () => {
    await open('builder.html', SIZES[0]);
    await page.evaluate(() => {
      state.effects = [];
      catalog.filter(fx => fx.dsp !== null).sort((a, b) => a.dsp - b.dsp).slice(0, 6).forEach(fx => state.effects.push(slotFor(fx.index)));
      render();
    });
    for (const size of SIZES) {
      await open('builder.html', size);
      assert.equal(await page.locator('#chain-list .chain-item').count(), 6);
      const result = await page.evaluate(check, PAGES['builder.html']);
      assert.deepEqual(result.issues, [], size.join(' × '));
    }
  });

  await test('with 30 saved patches every one can be reached in My patches (builder and pedal manager)', async () => {
    await open('builder.html', SIZES[1]);
    await page.evaluate(() => {
      const list = readLibrary();
      for (let i = 1; i <= 30; i++) addToLibrary({ ...state, name: `TEST ${i}` }, list);
      writeLibrary(list);
    });
    for (const size of SIZES) {
      for (const [file, list, item] of [['builder.html', '#library-list', '.library-item'], ['pedal-manager.html', '#usb-locals', '.usb-local']]) {
        await open(file, size);
        const result = await page.evaluate(check, PAGES[file]);
        assert.deepEqual(result.issues, [], `${file} ${size.join(' × ')}`);
        const last = await page.evaluate(([list, item]) => {
          const box = document.querySelector(list);
          box.scrollTop = box.scrollHeight;
          const items = box.querySelectorAll(item);
          const r = items[items.length - 1].getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + 20, r.top + r.height / 2);
          return { count: items.length, visible: !!hit && items[items.length - 1].contains(hit) };
        }, [list, item]);
        assert.ok(last.count >= 30 && last.visible, `${file} ${size.join(' × ')}: the last patch cannot be reached (${JSON.stringify(last)})`);
      }
    }
  });

  await test('the status bar links Resources; Tone ideas opens from the builder', async () => {
    await open('index.html', SIZES[1]);
    assert.equal(await page.locator('.fs-nav a').count(), 3);
    await page.locator('.fs-status a[href="resources.html"]').click();
    await page.waitForURL(/resources\.html$/);
    await open('builder.html', SIZES[1]);
    await page.locator('.builder-chain a[href="tones.html"]').click();
    await page.waitForURL(/tones\.html$/);
    assert.equal(await page.locator('.fs-nav a[aria-current="page"]').textContent(), 'Patch builder');
  });

  await test('effects: the detail pane shows the first effect, follows the list and the arrows', async () => {
    await open('index.html', SIZES[1]);
    assert.equal(await page.evaluate(() => document.querySelector('#fx-dialog').open && !document.querySelector('#fx-dialog').matches(':modal')), true, 'docked detail open, not modal');
    const first = await page.locator('.fx-link .fx-name').first().textContent();
    assert.equal(await page.locator('#dialog-title').textContent(), first);
    await page.locator('.fx-link').nth(3).click();
    const fourth = await page.locator('.fx-link .fx-name').nth(3).textContent();
    assert.equal(await page.locator('#dialog-title').textContent(), fourth);
    assert.equal(await page.locator('.fx-link[aria-current]').count(), 1);
    await page.locator('body').press('ArrowRight');
    const fifth = await page.locator('.fx-link .fx-name').nth(4).textContent();
    assert.equal(await page.locator('#dialog-title').textContent(), fifth);
    await page.fill('#search', 'chorus');
    await page.locator('#search').press('ArrowLeft');
    assert.equal(await page.locator('#dialog-title').textContent(), fifth, 'arrows in the search box move the caret, not the effect');
    await page.locator('#search').press('Escape');
    assert.equal(await page.locator('#result-count').textContent(), '97 effects');
  });

  await test('no errors in the browser console', async () => { assert.deepEqual(errors, []); });
} finally {
  await browser.close();
  server.kill();
  await rm(dataDir, { recursive: true, force: true });
}
console.log(`\n${passed} passed${failures.length ? `, ${failures.length} failed` : ''}`);
if (failures.length) process.exitCode = 1;
