// Layout of the site, both pedals (MS-60B+ in site/, MS-50G+ in site/ms-50g/): every page must fit the window at each target size without scrolling.
// The page and the work area are never cut, every pane fits, the main controls are on screen and each work area keeps
// a useful height. Below 800 × 640 px there is no layout: a notice replaces the page (no phone version, by decision).
// The builder is also checked with a full chain of 6 effects, signed out (with the account notice).
// Run: npm install && npx playwright install chromium && node tools/fullscreen-test.mjs
// Locally you can use the installed Chrome instead of downloading Chromium: PW_CHANNEL=chrome node tools/fullscreen-test.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const port = 18198;
const base = `http://127.0.0.1:${port}`;
const dataDir = await mkdtemp(join(tmpdir(), 'ms60b-fullscreen-'));
const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', fileURLToPath(new URL('../deploy/server.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, PBKDF2_ITER: '1000', MAIL_OUTBOX: join(dataDir, 'mail'), TELEGRAM_OUTBOX: join(dataDir, 'telegram') }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(resolve => server.stdout.once('data', resolve));
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });

const SIZES = [[1440, 820], [1280, 680], [1024, 700]];
const PHONE = [390, 700];
// [selector, label, least useful height in px]: the controls must be on screen
const PAGES = {
  'index.html': [['#search', 'search'], ['#sort', 'sort'], ['.fx-link', 'effect list'], ['#fx-dialog .detail-head', 'detail pane'], ['.results .fs-pane-body', 'effect list', 240], ['#dialog-body', 'effect detail', 240]],
  'builder.html': [['#add-effect', 'Add effect'], ['.builder-chain a[href="tones.html"]', 'Tone ideas'], ['#patch-name', 'patch name'], ['#save-patch', 'Save'], ['#download', 'Download .zptc'], ['#advice .Box-header', 'Advice'],['#clear-chain', 'Create new patch'], ['.builder-chain .fs-pane-body', 'chain', 200], ['#library-list', 'My patches list', 48]],
  'pedal-manager.html': [['#usb-connect', 'Connect the pedal'], ['#usb-local-title', 'My patches'], ['#usb-pedal-title', 'On the pedal'], ['#usb-locals', 'My patches list', 160], ['#usb-memories', 'memory list', 160]],
  'tones.html': [['#tone-filter', 'filter'], ['#tone-styles-title', 'By style'], ['#tone-bassists-title', 'By bassist'], ['.tone-pane .fs-pane-body', 'tone list', 200]],
  'resources.html': [['.resource-list', 'manuals'], ['#check-title', 'Still to check'], ['.check-pane .fs-pane-body', 'checks', 200]],
  'technical-notes.html': [['#toc a', 'contents'], ['#doc-title', 'title'], ['.fs-doc .fs-pane-body', 'document', 300]],
  'privacy.html': [['#toc a', 'contents'], ['#doc-title', 'title'], ['.fs-doc .fs-pane-body', 'document', 300]],
  'guide.html': [['.fs-guide', 'Guide button'], ['#toc a', 'contents'], ['#doc-title', 'title'], ['.fs-doc .fs-pane-body', 'document', 300]]
};
// The MS-50G+ has Effects, Patch builder, Resources, the Guide and the help page for its testers (no Pedal manager, no Tone ideas)
const PAGES_50G = {
  'ms-50g/index.html': PAGES['index.html'],
  'ms-50g/builder.html': PAGES['builder.html'].filter(([selector]) => !selector.includes('tones.html')),
  'ms-50g/resources.html': PAGES['resources.html'],
  'ms-50g/guide.html': PAGES['guide.html'],
  'ms-50g/help.html': PAGES['guide.html']
};
const ALL_PAGES = { ...PAGES, ...PAGES_50G };

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

// Runs in the page: is the small-screen notice what is shown (and nothing else), and does it fit sideways
function smallScreen() {
  const notice = document.querySelector('.fs-small');
  const others = [...document.body.children].filter(el => el !== notice && el.tagName !== 'SCRIPT' && !el.matches('.account-notice, .update-bar'));
  return {
    notice: !!notice && getComputedStyle(notice).display === 'flex' && notice.getBoundingClientRect().height > 100,
    restHidden: others.every(el => getComputedStyle(el).display === 'none') && getComputedStyle(document.body).overflowX !== 'scroll',
    sideways: Math.max(0, document.documentElement.scrollWidth - innerWidth)
  };
}

// Runs in the page: the items of the top bar sit one after the other, inside the window, and the links are not clipped
function barIssues() {
  const items = [...document.querySelectorAll('.fs-top > *')].filter(el => el.getClientRects().length && getComputedStyle(el).display !== 'none');
  const rects = items.map(el => [el.className.split(' ')[0] || el.tagName.toLowerCase(), el.getBoundingClientRect()]);
  const issues = [];
  rects.forEach(([name, r], i) => {
    if (r.right > innerWidth + 1) issues.push(`${name} runs off the right edge`);
    if (i && r.left < rects[i - 1][1].right - 1) issues.push(`${name} overlaps ${rects[i - 1][0]}`);
  });
  const nav = document.querySelector('.fs-nav');
  if (nav.scrollWidth > nav.clientWidth + 1) issues.push('the links are clipped');
  return issues;
}

let passed = 0;
const failures = [];
const errors = [];
const test = async (name, fn) => {
  try { await fn(); passed++; console.log(`✓ ${name}`); } catch (error) { failures.push(name); console.log(`✗ ${name}\n  ${error.message.split('\n').join('\n  ')}`); }
};
const context = await browser.newContext({ serviceWorkers: 'block' });
// The reminder dialog for visitors without an account would cover every page: it is checked in tools/e2e-test.mjs
await context.addInitScript(() => { try { localStorage.setItem('account-welcome', 'ignored'); } catch {} });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push(message.text()); });
// The MS-60B+ pages live in /ms-60b/ (the MS-50G+ ones in /ms-50g/); the tests name them by file, privacy.html is at the root
const BASS_FILES = /^(index|builder|tones|pedal-manager|resources|technical-notes|guide)\.html$/;
const addressOf = file => (BASS_FILES.test(file) ? `ms-60b/${file}` : file);
const open = async (file, [width, height]) => {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}/${addressOf(file)}`);
  if (/(technical-notes|privacy|guide|help)\.html$/.test(file)) await page.waitForSelector('#toc a', { state: 'attached' });
  await page.waitForSelector('.account-slot > *', { state: 'attached', timeout: 3000 }).catch(() => {}); // the Sign in button is part of the bar
  await page.waitForTimeout(150);
};

try {
  for (const [file, keys] of Object.entries(ALL_PAGES)) {
    for (const size of SIZES) {
      await test(`${file} fits ${size.join(' × ')}`, async () => {
        await open(file, size);
        const result = await page.evaluate(check, keys);
        assert.equal(result.scrolls, false, 'the page scrolls');
        assert.deepEqual(result.issues, []);
        assert.deepEqual(await page.evaluate(barIssues), [], 'top bar');
      });
    }
    await test(`${file} top bar fits at 800 px`, async () => {
      await open(file, [800, 700]);
      assert.deepEqual(await page.evaluate(barIssues), []);
    });
    await test(`${file} at ${PHONE.join(' × ')} shows the small-screen notice instead of the page`, async () => {
      await open(file, PHONE);
      assert.deepEqual(await page.evaluate(smallScreen), { notice: true, restHidden: true, sideways: 0 });
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

  await test('builder: the patch alerts are in the Advice pane; Save and Download are small', async () => {
    await open('builder.html', SIZES[1]);
    await page.evaluate(() => {
      const fx = catalog.find(f => f.dsp !== null && f.params.some(p => p.codec && !p.codec.verified));
      state.effects = [slotFor(fx.index)];
      render();
    });
    assert.equal(await page.locator('#advice #notices').count(), 1, 'the alerts list is in Advice');
    assert.equal(await page.locator('.patch-box #notices').count(), 0, 'and not in the patch box');
    assert.match(await page.locator('#advice #notices').textContent(), /Check on the pedal:/);
    assert.equal(await page.locator('#advice #notices .notice').first().isVisible(), true);
    for (const id of ['#save-patch', '#download']) {
      const box = await page.locator(id).boundingBox();
      assert.ok(box.height <= 30, `${id} is ${box.height} px tall`);
    }
  });

  await test('Tone ideas opens from the builder; Resources opens from the Guide', async () => {
    await open('index.html', SIZES[1]);
    assert.equal(await page.locator('.fs-nav > a').count(), 3);
    await open('builder.html', SIZES[1]);
    await page.locator('.builder-chain a[href="tones.html"]').click();
    await page.waitForURL(/tones\.html$/);
    assert.equal(await page.locator('.fs-nav > a[aria-current="page"]').textContent(), 'Patch builder');
    await open('guide.html', SIZES[1]);
    assert.equal(await page.locator('#toc a[href="#resources"]').count(), 1, 'Resources is a section of the guide');
    await page.locator('#doc a[href="resources.html"]').click();
    await page.waitForURL(/resources\.html$/);
  });

  await test('the status bar: tongatron.org all the way to the left, then Source on GitHub, Privacy and Report a problem, and the update time on the right', async () => {
    for (const file of Object.keys(ALL_PAGES)) {
      for (const size of SIZES) {
        await open(file, size);
        const labels = await page.locator('.fs-status > *').evaluateAll(els => els.map(el => el.textContent.trim().replace(/\s+/g, ' ')));
        assert.equal(labels.length, 5, `${file}: ${labels.join(' | ')}`);
        assert.deepEqual(labels.slice(0, 4), ['tongatron.org', 'Source on GitHub', 'Privacy', 'Report a problem'], file);
        assert.match(labels[4], /^Last update /, file);
        assert.equal(await page.locator('.fs-status').getByText('ZOOM CORPORATION').count(), 0, `${file}: the data note is not in the status bar`);
        const edges = await page.evaluate(() => [...document.querySelectorAll('.fs-status > *')].map(el => { const r = el.getBoundingClientRect(); return [r.left, r.right]; }));
        edges.forEach(([left], i) => { if (i) assert.ok(left >= edges[i - 1][1] - 1, `${file} ${size.join(' × ')}: item ${i} overlaps the previous one`); });
        assert.ok(edges[4][1] >= size[0] - 20, `${file}: the update time is at the right edge`);
        assert.ok(edges[0][0] <= 16, `${file}: the tongatron.org button is all the way to the left`);
      }
      assert.equal(await page.locator('.fs-status a[href="resources.html"]').count(), 0, `${file}: no Resources in the status bar`);
      assert.equal(await page.locator('.fs-status').getByText('Classic view').count(), 0, `${file}: no Classic view in the status bar`);
    }
  });

  await test('signed in, the header has the account menu (the initial, then the name, Account and Sign out), Account opens the account page, and the top bar fits at 800 px', async () => {
    const made = await page.request.post(`${base}/register`, { form: { email: 'header@example.com', name: 'Header Tester', password: 'header password 1' }, maxRedirects: 0 });
    assert.equal(made.status(), 303);
    for (const file of ['index.html', 'builder.html', 'pedal-manager.html', 'ms-50g/builder.html']) {
      for (const size of [[1280, 680], [800, 700]]) {
        await open(file, size);
        const button = page.locator('.account-slot .account-button');
        await button.waitFor();
        assert.equal((await button.innerText()).trim(), 'H', `${file}: the initial of the name`);
        assert.deepEqual(await page.evaluate(barIssues), [], `${file} ${size.join(' × ')}: the top bar fits with the account button`);
      }
    }
    await open('builder.html', SIZES[1]);
    await page.locator('.account-slot .account-button').click();
    const items = await page.locator('.account-dropdown .account-item').allInnerTexts();
    assert.deepEqual(items.map(t => t.trim()), ['Account', 'Sign out'], 'a normal user has Account and Sign out');
    assert.match(await page.locator('.account-dropdown .account-who').innerText(), /Header Tester[\s\S]*header@example\.com/);
    await page.locator('.account-dropdown a.account-item', { hasText: 'Account' }).click();
    await page.waitForURL(/\/account$/);
    assert.match(await page.locator('body').innerText(), /header@example\.com/, 'the account page opens, not the sign-in page');
    await page.context().clearCookies();
    await page.evaluate(() => { try { sessionStorage.clear(); } catch {} });
  });

  await test('Report a problem: the form opens, asks for a message, sends it to the Telegram bot and confirms', async () => {
    const outbox = join(dataDir, 'telegram');
    for (const file of ['index.html', 'ms-50g/index.html']) {
      await open(file, SIZES[1]);
      await page.locator('.fs-report').click();
      const dialog = page.locator('dialog.report-dialog');
      assert.ok(await dialog.evaluate(d => d.open), `${file}: the form opens`);
      assert.equal(await page.evaluate(() => document.activeElement.name), 'message', `${file}: the cursor is in the message`);
      await dialog.getByRole('button', { name: 'Send', exact: true }).click();
      assert.match(await dialog.locator('.report-error').textContent(), /Write your message/, file);
      await dialog.locator('[name="name"]').fill('Test Bassist');
      await dialog.locator('[name="message"]').fill(`Line one on ${file}\nLine two`);
      await dialog.getByRole('button', { name: 'Send', exact: true }).click();
      await dialog.locator('.report-done').waitFor({ state: 'visible' });
      assert.equal(await page.locator('.fs-report').textContent(), '✓ Message sent', file);
      await dialog.getByRole('button', { name: 'Close' }).click();
      assert.ok(!(await dialog.evaluate(d => d.open)), `${file}: the form closes`);
    }
    // The technical details are optional: unticked, neither the page nor the details are sent
    await open('index.html', SIZES[1]);
    await page.locator('.fs-report').click();
    const plain = page.locator('dialog.report-dialog');
    assert.ok(await plain.locator('[name="details"]').isChecked(), 'the technical details are ticked by default');
    await plain.locator('[name="details"]').uncheck();
    await plain.locator('[name="message"]').fill('No details, please');
    await plain.getByRole('button', { name: 'Send', exact: true }).click();
    await plain.locator('.report-done').waitFor({ state: 'visible' });
    await plain.getByRole('button', { name: 'Close' }).click();
    const everything = await Promise.all((await readdir(outbox)).sort().map(name => readFile(join(outbox, name), 'utf8')));
    const notices = everything.filter(text => text.startsWith('Problem report from')); // the sign-up notices of other tests share the folder
    assert.equal(notices.length, 3);
    assert.match(notices[2], /^Problem report from ZOOM Patch Studio\nFrom: \(no name\) \(not signed in\)\n\nNo details, please$/);
    assert.match(notices[0], /^Problem report from ZOOM Patch Studio\nFrom: Test Bassist \(not signed in\)\nPage: \/ms-60b\/index\.html\n\nLine one on index\.html\nLine two\n\n---\nZoom MS-60B\+ · site updated /);
    assert.match(notices[1], /Page: \/ms-50g\/index\.html\n[\s\S]*Zoom MS-50G\+ · site updated /);
  });

  await test('landing page: a Help us button leads to the MS-50G+ help page instead of steps, and Contact us writes to the Telegram bot', async () => {
    await page.goto(`${base}/landing/`);
    await page.locator('.gh-header .account-slot > *').waitFor();
    const testers = page.locator('section[aria-labelledby="testers-title"]');
    assert.equal(await testers.locator('ol, li').count(), 0, 'no list of steps to follow');
    const help = testers.locator('a.btn');
    assert.equal(await help.count(), 1, 'one button');
    assert.equal(await help.textContent(), 'Help us test the MS-50G+');
    assert.equal(await help.evaluate(a => new URL(a.href).pathname), '/ms-50g/help.html');
    // Contact us: the form of report.js, an email address is needed
    const outbox = join(dataDir, 'telegram');
    const lastNotice = async () => { const all = (await readdir(outbox)).sort(); return readFile(join(outbox, all[all.length - 1]), 'utf8'); };
    await page.locator('.gh-header [data-report="contact"]').click();
    const dialog = page.locator('dialog.report-dialog');
    assert.equal(await dialog.locator('#report-title').textContent(), 'Contact us');
    assert.match(await dialog.locator('[data-intro]').textContent(), /a question, an idea, or an offer to help/);
    assert.equal(await dialog.locator('[name="message"]').inputValue(), '', 'no message to start from');
    assert.equal(await dialog.locator('.report-check').isVisible(), false, 'Contact us has no technical details');
    assert.deepEqual([await dialog.locator('[name="name"]').inputValue(), await dialog.locator('[name="email"]').inputValue()], ['', ''], 'not signed in: empty name and email');
    await dialog.locator('[name="message"]').fill('Can I help with the tests?');
    await dialog.getByRole('button', { name: 'Send', exact: true }).click();
    assert.match(await dialog.locator('.report-error').textContent(), /Add your email address/);
    await dialog.locator('[name="name"]').fill('Ann');
    await dialog.locator('[name="email"]').fill('ann@example.com');
    await dialog.getByRole('button', { name: 'Send', exact: true }).click();
    await dialog.locator('.report-done').waitFor({ state: 'visible' });
    assert.match(await lastNotice(), /^Message from ZOOM Patch Studio \(Contact us\)\nFrom: Ann <ann@example\.com> \(not signed in\)\n\nCan I help with the tests\?$/, 'only what was written: no page, no details');
    assert.equal(await dialog.locator('form').isVisible(), false, 'the form gives way to the confirmation');
    await dialog.getByRole('button', { name: 'Close' }).click();
    await help.click();
    await page.waitForURL(/\/ms-50g\/help\.html$/);
  });

  await test('the AMPG SVT MID-FREQ has no warning any more; the other amps with that scale still have one', async () => {
    await open('builder.html', SIZES[1]);
    const flags = await page.evaluate(() => Object.fromEntries(['AMPG SVT', 'SMR400', 'B-MAN100', 'AC 370'].map(name => [name, catalog.find(fx => fx.name === name).params.find(p => p.name === 'MID-FREQ').codec.verified])));
    assert.deepEqual(flags, { 'AMPG SVT': true, 'SMR400': false, 'B-MAN100': false, 'AC 370': false });
    const notice = names => page.evaluate(names => { state.effects = names.map(name => slotFor(catalog.find(fx => fx.name === name).index)); render(); return document.querySelector('#notices').textContent; }, names);
    assert.doesNotMatch(await notice(['AMPG SVT']), /MID-FREQ/, 'no "Check on the pedal" for the AMPG SVT');
    assert.match(await notice(['SMR400']), /Check on the pedal:.*MID-FREQ/, 'but still one for the SMR400');
    await page.evaluate(() => { state.effects = []; render(); });
    await open('resources.html', SIZES[1]);
    const rows = await page.locator('#check-unverified').innerText();
    assert.doesNotMatch(rows, /AMPG SVT/);
    for (const amp of ['SMR400', 'B-MAN100', 'AC 370']) assert.match(rows, new RegExp(`${amp}\\s+MID-FREQ`));
  });

  await test('the tongatron.org button is B3: no animation, only a highlight on hover', async () => {
    await open('index.html', SIZES[1]);
    const button = page.locator('.fs-status a.fs-b3');
    assert.equal(await button.getAttribute('href'), 'https://tongatron.org');
    assert.equal(await page.locator('.fs-b3-dot').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 204, 0)', 'the yellow dot');
    assert.notEqual(await page.locator('.fs-b3-dot').evaluate(el => getComputedStyle(el).boxShadow), 'none', 'with a glow');
    const style = () => button.evaluate(el => { const s = getComputedStyle(el); return { background: s.backgroundColor, transform: s.transform, animation: s.animationName }; });
    const plain = await style();
    assert.equal(plain.background, 'rgba(0, 0, 0, 0)', 'on the bar background');
    await button.hover();
    await page.waitForTimeout(300);
    const hover = await style();
    assert.notEqual(hover.background, plain.background, 'highlighted on hover');
    assert.equal(hover.transform, 'none', 'it does not move or grow');
    assert.equal(hover.animation, 'none');
  });

  await test('the header has no "Full screen" tag; the Guide button comes right before the account entry on every page and opens the guide', async () => {
    for (const file of Object.keys(ALL_PAGES)) {
      await open(file, SIZES[1]);
      assert.equal(await page.locator('.fs-badge').count(), 0, `${file}: no "Full screen" tag`);
      assert.equal(await page.locator('.fs-top .gh-search').count(), 0, `${file}: no search box in the top bar`);
      const place = await page.evaluate(() => {
        const items = [...document.querySelectorAll('.fs-top > *')];
        const at = items.findIndex(el => el.classList.contains('fs-guide'));
        const guide = items[at]?.getBoundingClientRect();
        const nav = document.querySelector('.fs-nav').getBoundingClientRect();
        return { onlyAccountAfter: at >= 0 && items.slice(at + 1).every(el => el.classList.contains('account-slot')), rightOfNav: !!guide && guide.left > nav.right, atRight: !!guide && guide.right > innerWidth / 2 };
      });
      assert.deepEqual(place, { onlyAccountAfter: true, rightOfNav: true, atRight: true }, `${file}: Guide at the right, before the account entry`);
      assert.equal(await page.locator('.fs-guide').getAttribute('href'), file === 'privacy.html' ? 'ms-60b/guide.html' : 'guide.html'); // privacy.html is at the root
      assert.equal(await page.locator('.fs-guide[aria-current="page"]').count(), file.endsWith('guide.html') ? 1 : 0, `${file}: highlighted only on the guide`);
      assert.equal(await page.locator('.fs-guide').getAttribute('aria-label'), 'Guide');
    }
    await open('builder.html', SIZES[1]);
    await page.locator('.fs-guide').click();
    await page.waitForURL(/guide\.html$/);
    await page.waitForSelector('#toc a', { state: 'attached' });
    assert.equal(await page.locator('#doc-title').textContent(), 'Guide');
    const sections = await page.locator('#doc h2').count();
    assert.ok(sections >= 8, `${sections} sections`);
    assert.equal(await page.locator('#toc a').count(), sections, 'one contents entry per section');
  });

  await test('the data note left the status bar and is in the Guide, for each pedal', async () => {
    for (const [file, pedal, pdf] of [['guide.html', 'MS-60B+', 'E_MS-60Bplus_FX-list.pdf'], ['ms-50g/guide.html', 'MS-50G+', 'E_MS-50Gplus_EffectsList.pdf']]) {
      await open(file, SIZES[1]);
      assert.equal(await page.locator('#toc a[href="#credits"]').count(), 1, `${file}: a Data and credits section`);
      assert.equal((await page.locator('#credits + p').innerText()).replace(/\s+/g, ' '), `Data: Zoom ${pedal} Effects List © 2024 ZOOM CORPORATION. Manufacturer names are used only to describe sonic character.`);
      assert.match(await page.locator('#credits + p a').getAttribute('href'), new RegExp(`${pdf}$`));
    }
  });

  await test('the guide has the how-to that left the builder, and the contents list scrolls the guide', async () => {
    await open('guide.html', SIZES[1]);
    const steps = await page.locator('#load-on-pedal + ol > li').allTextContents();
    assert.equal(steps.length, 3);
    assert.match(steps[0], /Handy Guitar Lab/);
    assert.match(steps[1], /Copy to Device/);
    assert.match(steps[2], /overwrites/);
    await page.locator('#toc a[href="#shortcuts"]').click();
    const where = await page.evaluate(() => {
      const pane = document.querySelector('.fs-doc .fs-pane-body');
      return { pane: pane.scrollTop, page: document.scrollingElement.scrollTop, top: document.querySelector('#shortcuts').getBoundingClientRect().top - pane.getBoundingClientRect().top };
    });
    assert.ok(where.pane > 0 && where.page === 0 && where.top < 80, `the guide scrolled, the page did not: ${JSON.stringify(where)}`);
    await open('builder.html', SIZES[1]);
    assert.equal(await page.locator('.import-help').count(), 0, 'the how-to is not in the builder any more');
    assert.equal(await page.getByText('How to load it on the pedal').count(), 0);
  });

  await test('the Pedal menu comes first, lists the two Zoom pedals and closes', async () => {
    await open('builder.html', SIZES[1]);
    assert.equal((await page.locator('.fs-nav > *').first().getAttribute('class')), 'fs-menu', 'the menu is the first item of the bar');
    // the button shows the selected pedal and an arrow, not a generic word
    assert.equal(await page.locator('.fs-menu-current').textContent(), 'MS-60B+ bass');
    assert.equal(await page.locator('.fs-menu-button svg').count(), 1, 'the arrow');
    assert.match(await page.locator('.fs-menu-button').getAttribute('title'), /Change pedal/);
    assert.equal(await page.locator('.fs-menu-button .sr-only').textContent(), 'Pedal: ', 'a screen reader still hears that it is the pedal');
    assert.equal(await page.locator('.fs-menu-list').isHidden(), true);
    await page.locator('.fs-menu-button').click();
    assert.equal(await page.locator('.fs-menu-button').getAttribute('aria-expanded'), 'true');
    const items = await page.locator('.fs-menu-list a').allTextContents();
    assert.deepEqual(items.map(t => t.replace(/\s+/g, ' ').trim()), ['MS-60B+ bass', 'MS-50G+ guitar Not tested']);
    assert.equal(await page.locator('.fs-menu-list .Label--success').count(), 0, 'the firmware tag is not in the menu any more');
    assert.equal(await page.locator('.fs-menu-list a[aria-current]').evaluate(a => a.firstChild.textContent.trim()), await page.locator('.fs-menu-current').textContent(), 'the menu marks the pedal the button shows');
    assert.equal(await page.locator('.fs-menu-list a[href="../ms-50g/builder.html"]').count(), 1, 'the other pedal opens on the same page');
    // the open menu floats over the page: it stays inside the window
    const box = await page.locator('.fs-menu-list').boundingBox();
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= SIZES[1][0] && box.y + box.height <= SIZES[1][1], 'the menu is inside the window');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.fs-menu-list').isHidden(), true, 'Esc closes it');
    assert.deepEqual((await page.evaluate(check, PAGES['builder.html'])).issues, [], 'nothing stays covered once it is closed');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('fs-menu-button')), true, 'and gives the focus back');
    await page.locator('.fs-menu-button').click();
    await page.locator('.fs-main').click({ position: { x: 5, y: 5 } });
    assert.equal(await page.locator('.fs-menu-list').isHidden(), true, 'a click elsewhere closes it');
    // the section you are in is the only highlighted one
    const marked = await page.locator('.fs-nav > a').evaluateAll(links => links.map(a => [a.textContent, getComputedStyle(a).backgroundColor !== 'rgba(0, 0, 0, 0)']));
    assert.deepEqual(marked, [['Effects', false], ['Patch builder', true], ['Pedal manager', false]]);
  });

  await test('effects: the detail pane shows the first effect, follows the list and the arrows', async () => {
    await open('index.html', SIZES[1]);
    assert.equal(await page.evaluate(() => document.querySelector('#fx-dialog').open && !document.querySelector('#fx-dialog').matches(':modal')), true, 'docked detail open, not modal');
    assert.equal(await page.evaluate(() => document.querySelector('#fx-dialog').contains(document.activeElement)), false, 'the pane that opens by itself does not take the focus');
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

  await test('effects: the search box is in the list pane and "/" reaches it', async () => {
    await open('index.html', SIZES[1]);
    assert.equal(await page.locator('.fs-top #search').count(), 0);
    assert.equal(await page.locator('.results .fs-searchbar #search').count(), 1);
    const [pane, search] = await page.evaluate(() => ['.results', '#search'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.right]; }));
    assert.ok(search[0] >= pane[0] && search[1] <= pane[1], 'inside the list pane');
    await page.locator('.fx-link').first().focus();
    await page.keyboard.press('/');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'search');
    await page.fill('#search', 'chorus');
    assert.notEqual(await page.locator('#result-count').textContent(), '97 effects', 'it filters the list');
    await page.fill('#search', '');
  });

  await test('effects: the detail has no previous/next buttons and "Add to patch" sits right under the description', async () => {
    await open('index.html', SIZES[1]);
    await page.locator('.fx-link').nth(3).click();
    assert.equal(await page.locator('#fx-dialog .Overlay-header, #dialog-prev, #dialog-next, #dialog-pos, #dialog-close').count(), 0, 'the buttons that are at the top of the page are not repeated in the pane');
    const place = await page.evaluate(() => {
      const body = document.querySelector('#dialog-body');
      const top = selector => body.querySelector(selector)?.getBoundingClientRect().top;
      const bottom = selector => body.querySelector(selector)?.getBoundingClientRect().bottom;
      const add = body.querySelector('.detail-add a');
      return { text: add?.textContent.trim(), href: add?.getAttribute('href'), afterDescription: top('.detail-add') >= bottom('.detail-desc'), beforeSections: top('.detail-add') < top('.detail-section'), inFoot: [...body.querySelectorAll('.detail-foot a')].some(a => /Add to patch/.test(a.textContent)) };
    });
    assert.match(place.href, /^builder\.html\?add=/);
    assert.deepEqual({ ...place, href: null }, { text: 'Add to patch', href: null, afterDescription: true, beforeSections: true, inFoot: false });
    // the arrow keys still move between effects
    const before = await page.locator('#dialog-title').textContent();
    await page.locator('body').press('ArrowRight');
    assert.notEqual(await page.locator('#dialog-title').textContent(), before);
  });

  await test('effects: no manual notice under the filters and no link buttons under the detail, for each pedal', async () => {
    for (const file of ['index.html', 'ms-50g/index.html']) {
      await open(file, SIZES[1]);
      await page.locator('.fx-link').nth(2).click();
      assert.equal(await page.locator('.sidebar .flash, .sidebar a[href*="zoomcorp.com"]').count(), 0, `${file}: no notice about the official manual`);
      assert.equal(await page.locator('#dialog-body .detail-foot, #dialog-body a[href*="zoomcorp.com"]').count(), 0, `${file}: no Effects List or manual buttons in the detail`);
      assert.equal(await page.locator('#dialog-body .detail-add a').count(), 1, `${file}: Add to patch is still there`);
    }
  });

  await test('the header of the MS-60B+ pages has the green "Tested on firmware 1.20" tag just left of the Guide button, with the full text at every width', async () => {
    for (const file of Object.keys(PAGES)) {
      await open(file, SIZES[1]);
      const tag = page.locator('.fs-top > .fs-fw');
      assert.equal(await tag.count(), 1, file);
      assert.equal(await tag.getAttribute('title'), 'Tested on firmware 1.20', file);
      assert.equal(await tag.evaluate(el => getComputedStyle(el).color), 'rgb(63, 185, 80)', `${file}: green`);
      assert.equal((await tag.innerText()).trim(), 'Tested on firmware 1.20', `${file}: the full text`);
      const place = await page.evaluate(() => {
        const items = [...document.querySelectorAll('.fs-top > *')];
        const t = document.querySelector('.fs-fw').getBoundingClientRect();
        const g = document.querySelector('.fs-guide').getBoundingClientRect();
        return { rightBeforeGuide: items.indexOf(document.querySelector('.fs-fw')) === items.indexOf(document.querySelector('.fs-guide')) - 1, left: t.right <= g.left + 1 };
      });
      assert.deepEqual(place, { rightBeforeGuide: true, left: true }, `${file}: left of the Guide button`);
    }
    // the same text on the narrowest supported window, and on the ones in between, for every page of the MS-60B+
    for (const file of Object.keys(PAGES)) {
      for (const size of [[1024, 700], [800, 700]]) {
        await open(file, size);
        assert.equal((await page.locator('.fs-fw').innerText()).trim(), 'Tested on firmware 1.20', `${file} ${size.join(' × ')}: the full text on a narrow window too`);
        assert.equal(await page.locator('.fs-fw').evaluate(el => el.scrollWidth <= el.clientWidth + 1 && el.getBoundingClientRect().right <= innerWidth), true, `${file} ${size.join(' × ')}: the tag is whole and inside the window`);
      }
    }
  });

  await test('builder: Plug into, Amp and the mixer choice sit on one line at every size, for each pedal, above the Errors / Warnings / Tips row', async () => {
    for (const file of ['builder.html', 'ms-50g/builder.html']) {
      for (const size of SIZES) {
        await open(file, size);
        assert.equal(await page.evaluate(() => !!(document.querySelector('#advice-output').compareDocumentPosition(document.querySelector('#advice-filters')) & Node.DOCUMENT_POSITION_FOLLOWING)), true, `${file}: Plug into comes before the filters row`);
        const row = await page.evaluate(() => {
          const box = document.querySelector('#advice-output');
          const items = [...box.children];
          const middle = el => { const r = el.getBoundingClientRect(); return (r.top + r.bottom) / 2; };
          return { texts: items.map(el => el.textContent.trim()), oneLine: items.every(el => Math.abs(middle(el) - middle(items[0])) < 4), fits: box.scrollWidth <= box.clientWidth + 1 };
        });
        assert.deepEqual(row, { texts: ['Plug into', 'Amp', 'Mixer / PA / headphones'], oneLine: true, fits: true }, `${file} at ${size.join(' × ')}`);
      }
    }
  });

  await test('the guide and the other documents mark the contents entry of the section being read', async () => {
    for (const file of ['guide.html', 'ms-50g/guide.html', 'technical-notes.html']) {
      await open(file, SIZES[1]);
      const current = () => page.locator('#toc a[aria-current]').evaluateAll(links => links.map(a => a.getAttribute('href')));
      const hrefs = await page.locator('#toc a').evaluateAll(links => links.map(a => a.getAttribute('href')));
      assert.deepEqual(await current(), [hrefs[0]], `${file}: the first section is marked at the top`);
      const scrollTo = id => page.evaluate(target => {
        const pane = document.querySelector('.fs-doc .fs-pane-body');
        pane.scrollTop = document.getElementById(target).getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop - 4;
      }, id);
      const middle = hrefs[Math.floor(hrefs.length / 2)];
      await scrollTo(middle.slice(1));
      await page.waitForFunction(href => document.querySelector('#toc a[aria-current]')?.getAttribute('href') === href, middle);
      assert.deepEqual(await current(), [middle], `${file}: the section that reached the top is marked, and only that one`);
      await page.evaluate(() => { const pane = document.querySelector('.fs-doc .fs-pane-body'); pane.scrollTop = pane.scrollHeight; });
      await page.waitForFunction(href => document.querySelector('#toc a[aria-current]')?.getAttribute('href') === href, hrefs.at(-1));
      if (file.endsWith('guide.html')) { // a short section near the end cannot reach the top: it stays marked after its link is used
        await page.locator('#toc a[href="#resources"]').click();
        await page.waitForTimeout(300);
        assert.deepEqual(await current(), ['#resources'], `${file}: the section a link led to stays marked`);
      }
    }
  });

  await test('pedal manager: the hint under My patches, the effects of the last-read patches, Delete all and the MIDI log in full screen', async () => {
    const memories = { 1: '01base.zptc', 2: '06FLIP.zptc', 3: '07Big Black .zptc' };
    const lastRead = { at: '2026-10-28T10:00:00.000Z', count: 6, memories: { ...Object.fromEntries(Object.entries(memories).map(([n, f]) => [n, readFileSync(new URL(`../patches/${f}`, import.meta.url)).toString('base64')])), 4: null } };
    const backups = [3, 2, 1].map(i => ({ id: `b${i}`, memory: i, name: `Patch ${i}`, at: new Date(Date.now() - i * 60000).toISOString(), data: 'AAAA' }));
    await open('pedal-manager.html', SIZES[1]);
    await page.evaluate(([read, saved]) => { localStorage.setItem('ms60b-usb-last-read', read); localStorage.setItem('ms60b-usb-backups', saved); }, [JSON.stringify(lastRead), JSON.stringify(backups)]);
    await page.reload();
    await page.waitForSelector('#usb-memories .usb-mem');

    // My patches: a hint that asks for a slot on the pedal, and nothing about the browser
    const hint = (await page.locator('.usb-panel').first().locator('.usb-hint').textContent()).trim();
    assert.equal(hint, 'Select a slot on the pedal to load a patch.');

    // Not connected: the last-read patches open to their effects, and can be copied or downloaded
    assert.match(await page.locator('#usb-pedal-hint').textContent(), /Not connected: the patches and their effects as last read on 28 October 2026/);
    assert.equal(await page.locator('#usb-memories [data-act="stale-open"]:not([disabled])').count(), 3, 'the three readable memories can be opened; the empty and unread ones cannot');
    await page.locator('#usb-memories [data-n="3"] [data-act="stale-open"]').click();
    const shown = await page.locator('#usb-memories [data-n="3"] .usb-fx b').allTextContents();
    const stored = await page.evaluate(b64 => ZPTC.decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))).effects.map(e => e.effect), lastRead.memories[3]);
    assert.ok(stored.length >= 2, 'the sample patch has several effects');
    assert.deepEqual(shown, stored, 'the saved patch shows its effects, in order');
    assert.deepEqual(await page.locator('#usb-memories [data-n="3"] .usb-mem-detail button').allTextContents(), ['Copy to My patches', 'Download .zptc']);
    const patchesBefore = Number(await page.locator('#usb-local-count').textContent());
    await page.locator('#usb-memories [data-n="3"] [data-act="copy"]').click();
    assert.equal(Number(await page.locator('#usb-local-count').textContent()), patchesBefore + 1, 'copied to My patches without the pedal');
    await page.locator('#usb-memories [data-n="3"] [data-act="stale-open"]').click();
    assert.equal(await page.locator('#usb-memories .usb-mem-detail').count(), 0, 'selecting it again closes it');

    // The connection box shows the real MS-60B+ of the landing page: dim and grey while the pedal is not connected, in colour once it is
    const pedal = page.locator('.usb-connect > img.usb-pedal');
    assert.match(await pedal.getAttribute('src'), /^\.\.\/landing\/pedal-ms60b-small\.webp$/, 'the picture of the landing page');
    assert.equal(await pedal.evaluate(img => img.complete && img.naturalWidth > 0), true, 'the picture loads');
    const look = () => pedal.evaluate(img => ({ filter: getComputedStyle(img).filter, opacity: Number(getComputedStyle(img).opacity) }));
    const off = await look();
    assert.match(off.filter, /grayscale/, 'grey while not connected');
    assert.ok(off.opacity < 1, 'and dim');
    await page.evaluate(() => document.querySelector('.usb-connect').classList.add('is-connected')); // what setConnected(true) does
    await page.waitForFunction(() => { const css = getComputedStyle(document.querySelector('.usb-pedal')); return css.opacity === '1' && css.filter === 'none'; }); // the colour comes back with a short transition
    assert.deepEqual(await look(), { filter: 'none', opacity: 1 }, 'normal colours once connected');
    await page.evaluate(() => document.querySelector('.usb-connect').classList.remove('is-connected'));
    const sits = await page.evaluate(() => { const i = document.querySelector('.usb-pedal').getBoundingClientRect(), s = document.querySelector('.usb-howto > summary').getBoundingClientRect(), c = document.querySelector('.usb-connect').getBoundingClientRect(); return { leftOfText: i.right <= s.left, size: i.width >= 80 && i.width <= 110 && i.height <= 160, inside: i.top >= c.top && i.bottom <= c.bottom }; });
    assert.deepEqual(sits, { leftOfText: true, size: true, inside: true }, 'a small pedal (a bit bigger than a thumbnail) at the left of the connection text');

    // How to connect: a box that is closed until opened, with the three steps
    assert.equal(await page.locator('#usb-howto').evaluate(box => box.open), false, 'How to connect starts closed');
    assert.equal(await page.locator('#usb-steps').isVisible(), false);
    await page.locator('#usb-howto > summary').click();
    assert.equal(await page.locator('#usb-steps li').count(), 3, 'the three steps');
    assert.equal(await page.locator('#usb-steps').isVisible(), true);
    await page.locator('#usb-howto > summary').click();

    // Backups and the MIDI log are closed until opened
    assert.deepEqual(await page.evaluate(() => [document.querySelector('#usb-backups-box').open, document.querySelector('#usb-log-box').open]), [false, false], 'Backups and the MIDI log start closed');
    await page.locator('#usb-backups-title').click();
    assert.equal(await page.locator('#usb-backups-box').evaluate(box => box.open), true, 'a click on the title opens Backups');

    // Backups: Delete all asks first
    assert.equal(await page.locator('#usb-backup-count').textContent(), '3');
    await page.locator('#usb-backups-clear').click();
    assert.equal(await page.locator('#usb-backups-box').evaluate(box => box.open), true, 'the button does not fold the box');
    assert.equal(await page.locator('#usb-confirm-title').textContent(), 'Delete all backups');
    assert.match(await page.locator('#usb-confirm-body').innerText(), /Delete all 3 backups\?/);
    await page.locator('#usb-confirm [data-confirm="no"]').click();
    assert.equal(await page.locator('#usb-backup-count').textContent(), '3', 'Cancel keeps them');
    await page.locator('#usb-backups-clear').click();
    await page.locator('#usb-confirm [data-confirm="yes"]').click();
    assert.equal(await page.locator('#usb-backup-count').textContent(), '0');
    assert.equal(await page.locator('#usb-backups-clear').isDisabled(), true, 'nothing left to delete');
    const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('ms60b-usb-backups')));
    assert.deepEqual(kept.map(b => b.deleted), [true, true, true], 'deletion records keep an account from bringing them back');
    await page.reload();
    await page.waitForSelector('#usb-backups li', { state: 'attached' }); // Backups is closed again after a reload
    assert.equal(await page.locator('#usb-backups .usb-empty').textContent(), 'No backups yet.');

    // MIDI log: a full screen button at the top right of its header
    const place = await page.evaluate(() => {
      const head = document.querySelector('#usb-log-box > summary').getBoundingClientRect();
      const button = document.querySelector('#usb-log-full').getBoundingClientRect();
      return { atRight: head.right - button.right < 24, inside: button.top >= head.top && button.bottom <= head.bottom };
    });
    assert.deepEqual(place, { atRight: true, inside: true });
    await page.locator('#usb-log-full').click();
    const full = await page.evaluate(() => { const r = document.querySelector('#usb-log-box').getBoundingClientRect(); return { covers: r.width === innerWidth && r.height === innerHeight, pressed: document.querySelector('#usb-log-full').getAttribute('aria-pressed') }; });
    assert.deepEqual(full, { covers: true, pressed: 'true' });
    await page.locator('#usb-log-full').click();
    assert.equal(await page.locator('#usb-log-box').evaluate(box => box.classList.contains('is-full')), false, 'the button leaves full screen');
    // without the Fullscreen API the box fills the window and Esc leaves it
    await page.evaluate(() => { document.querySelector('#usb-log-box').requestFullscreen = undefined; });
    await page.locator('#usb-log-full').click();
    assert.equal(await page.locator('#usb-log-box').evaluate(box => box.classList.contains('is-full')), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#usb-log-box').evaluate(box => box.classList.contains('is-full')), false, 'Esc leaves it');
  });

  await test('the advice cannot be turned off: no switch in the builder or in the effect detail, even if the classic page saved it off', async () => {
    await open('index.html', SIZES[1]);
    await page.evaluate(() => localStorage.setItem(`${PEDAL.id}-advice`, JSON.stringify({ enabled: false })));
    const slug = await page.evaluate(() => effects.find(effect => ADVICE.effectTips(effect.index)).slug);
    await page.goto(`${base}/ms-60b/index.html#${slug}`);
    await page.reload();
    await page.waitForSelector('#dialog-title');
    assert.equal(await page.locator('#dialog-body .tip-card').count(), 1, 'the placement tips are shown');
    assert.equal(await page.locator('[data-advice-off], [data-advice-on], .advice-off-note').count(), 0);
    await open('builder.html', SIZES[1]);
    assert.equal(await page.locator('#advice-toggle, #advice-off, #advice-on, .advice .switch').count(), 0);
    assert.equal(await page.locator('#advice-body').isVisible(), true);
    await page.evaluate(() => { state.effects = [slotFor(catalog.find(fx => fx.dsp !== null).index)]; render(); });
    assert.equal(await page.locator('#advice-list .advice-item, #advice-list .advice-empty').first().isVisible(), true);
    assert.equal(await page.locator('#notices .notice--danger, #notices .notice--attention').filter({ hasText: /DSP|load|limit/i }).count(), 0, 'no second DSP notice next to the advice');
    await page.evaluate(() => localStorage.removeItem(`${PEDAL.id}-advice`));
  });

  await test('builder: chain | patch with Advice under it | My patches; the DSP bar is thin; there is no arrow to fold the patch', async () => {
    const boxes = () => page.evaluate(() => Object.fromEntries(['.builder-chain', '.patch-box', '#advice', '.builder-mine'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return [s, { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom) }]; })));
    for (const size of SIZES) {
      await open('builder.html', size);
      const box = await boxes();
      const where = `${size.join(' × ')} ${JSON.stringify(box)}`;
      // Advice is right under the patch, in the same column
      assert.ok(Math.abs(box['#advice'].left - box['.patch-box'].left) <= 1 && box['#advice'].top >= box['.patch-box'].bottom - 1, `Advice under the patch: ${where}`);
      assert.ok(box['#advice'].bottom - box['#advice'].top >= 120, `Advice keeps some height: ${where}`);
      if (size[0] >= 1200) {
        // three columns: the chain, the patch with Advice, My patches at the right
        assert.ok(box['.builder-chain'].right <= box['.patch-box'].left && box['.patch-box'].right <= box['.builder-mine'].left, `chain | patch | My patches: ${where}`);
        assert.ok(box['.builder-mine'].right >= size[0] - 20, `My patches is the last column: ${where}`);
      } else {
        // two columns: My patches goes under the chain
        assert.ok(box['.builder-mine'].left === box['.builder-chain'].left && box['.builder-mine'].top >= box['.builder-chain'].bottom - 1, `My patches under the chain: ${where}`);
      }
    }
    await open('builder.html', SIZES[0]);
    assert.equal(await page.locator('#patch-toggle, .patch-chevron, #patch-summary').count(), 0, 'no arrow to close the patch');
    assert.equal(await page.locator('#patch-name').isVisible(), true);
    await page.evaluate(() => { state.effects = catalog.filter(fx => fx.dsp !== null).slice(0, 3).map(fx => slotFor(fx.index)); render(); });
    const bar = await page.locator('#dsp-stack').boundingBox();
    assert.ok(bar.height <= 8 && bar.height >= 3, `the DSP bar is ${bar.height} px tall`);
    assert.ok(bar.width > 150, 'and still as wide as the box');
  });

  await test('the pedal menu switches to the same page of the other pedal', async () => {
    await open('builder.html', SIZES[1]);
    await page.locator('.fs-menu-button').click();
    await page.locator('.fs-menu-list a[href="../ms-50g/builder.html"]').click();
    await page.waitForURL(/\/ms-50g\/builder\.html$/);
    await page.locator('.fs-menu-button').click();
    await page.locator('.fs-menu-list a[href="../ms-60b/builder.html"]').click();
    await page.waitForURL(url => url.pathname === '/ms-60b/builder.html');
  });

  await test('MS-50G+: the same layout with its own data, no Pedal manager or Tone ideas, and the "Not tested" bar', async () => {
    await open('ms-50g/index.html', SIZES[1]);
    assert.equal(await page.locator('.fs-menu-current').textContent(), 'MS-50G+ guitar');
    assert.deepEqual(await page.locator('.fs-nav > a').allTextContents(), ['Effects', 'Patch builder']);
    assert.match(await page.locator('.fs-note').textContent(), /^Not tested yet\./);
    assert.equal(await page.locator('#result-count').textContent(), '127 effects');
    assert.equal(await page.evaluate(() => PEDAL.id), 'ms50g');
    assert.equal(await page.locator('.fx-thumb').first().getAttribute('src'), 'assets/effects/fx-000.png');
    await page.locator('.fx-thumb').first().evaluate(img => img.decode());
    assert.equal(await page.locator('.fx-thumb').first().evaluate(img => img.naturalWidth > 0), true, 'the MS-50G+ effect images load');
    assert.equal(await page.locator('.flash').count(), 0, 'no notice about the official manual');
    await page.locator('.fs-menu-button').click();
    const items = await page.locator('.fs-menu-list a').allTextContents();
    assert.deepEqual(items.map(t => t.replace(/\s+/g, ' ').trim()), ['MS-60B+ bass', 'MS-50G+ guitar Not tested']);
    assert.equal(await page.locator('.fs-menu-list .Label--success').count(), 0);
    assert.equal(await page.locator('.fs-fw').count(), 0, 'the firmware tag of the MS-60B+ is not on the MS-50G+ pages');
    await page.keyboard.press('Escape');

    // the builder: six effects fit every size, and the data are kept apart from the MS-60B+ ones
    await open('ms-50g/builder.html', SIZES[0]);
    assert.equal(await page.locator('.builder-chain a[href="tones.html"], #pedal-edit-bar').count(), 0);
    await page.evaluate(() => {
      state.effects = catalog.filter(fx => fx.dsp !== null).sort((a, b) => a.dsp - b.dsp).slice(0, 6).map(fx => slotFor(fx.index));
      render();
    });
    await page.fill('#patch-name', 'GTR TEST');
    assert.equal(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith('ms50g-'))), true, 'ms50g- keys');
    for (const size of SIZES) {
      await open('ms-50g/builder.html', size);
      assert.equal(await page.locator('#chain-list .chain-item').count(), 6);
      assert.deepEqual((await page.evaluate(check, PAGES_50G['ms-50g/builder.html'])).issues, [], size.join(' × '));
    }
    await page.evaluate(() => { state.effects = []; state.name = ''; render(); save(); });

    // the guide and resources: the pedal's own text and links
    await open('ms-50g/guide.html', SIZES[1]);
    assert.equal(await page.locator('#toc a[href="#pedal-manager"], #toc a[href="#tone-ideas"]').count(), 0, 'no Pedal manager or Tone ideas section');
    assert.equal(await page.locator('#doc').getByText('Pedal manager').count(), 0);
    assert.match(await page.locator('#load-on-pedal ~ p a[href*="HandyGuitarLab"]').first().getAttribute('href'), /MS-50Gplus/);
    assert.equal(await page.locator('#toc a[href="#resources"]').count(), 1);
    await page.locator('#doc a[href="resources.html"]').click();
    await page.waitForURL(/\/ms-50g\/resources\.html$/);
    assert.deepEqual(await page.locator('.resource a[aria-label^="Official manual"]').evaluateAll(links => links.map(a => a.href)), ['https://zoomcorp.com/manuals/ms-50gplus-en/', 'https://zoomcorp.com/manuals/ms-50gplus-it/']);
    assert.match(await page.locator('.check-list').textContent(), /The whole format on an MS-50G\+/);
    assert.equal(await page.locator('.fs-status a[href="../privacy.html"]').count(), 1, 'the privacy page is the one of the site');
  });

  await test('MS-50G+: the "Help us" button ends the "Not tested" bar and opens the help page, whose test patches open in the builder and which has Contact us (a form that writes to the Telegram bot) after its description', async () => {
    for (const file of ['ms-50g/index.html', 'ms-50g/builder.html', 'ms-50g/guide.html', 'ms-50g/resources.html']) {
      for (const size of SIZES) {
        await open(file, size);
        const button = page.locator('.fs-note > a.btn');
        assert.equal(await button.textContent(), 'Help us', `${file}: the button`);
        assert.equal(await button.getAttribute('href'), 'help.html', file);
        const place = await page.evaluate(() => {
          const bar = document.querySelector('.fs-note').getBoundingClientRect();
          const b = document.querySelector('.fs-note > a.btn').getBoundingClientRect();
          const p = document.querySelector('.fs-note > p').getBoundingClientRect();
          return { gapRight: Math.round(bar.right - b.right), afterText: b.left >= p.right - 1, inside: b.top >= bar.top && b.bottom <= bar.bottom };
        });
        assert.ok(place.gapRight <= 17 && place.afterText && place.inside, `${file} ${size.join(' × ')}: the button sits at the right end of the bar, after the text ${JSON.stringify(place)}`);
      }
    }
    await open('ms-50g/resources.html', SIZES[1]);
    await page.locator('.fs-note > a.btn').click();
    await page.waitForURL(/\/ms-50g\/help\.html$/);

    // the help page: no bar of its own, Contact us after the description, one section per test with its time, the two test patches
    await open('ms-50g/help.html', SIZES[1]);
    assert.equal(await page.locator('.fs-note').count(), 0, 'the page is the invitation: no "Not tested" bar on it');
    assert.equal(await page.locator('#doc-title').textContent(), 'Help us test the MS-50G+');
    for (const id of ['at-a-glance', 'what-it-takes', ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => `test-${n}`)]) assert.equal(await page.locator(`#toc a[href="#${id}"]`).count(), 1, `contents: ${id}`);
    for (let n = 1; n <= 8; n++) {
      const first = await page.locator(`#test-${n} + p`).textContent();
      assert.match(first, /^About \d+ minutes/, `test ${n} says how long it takes`);
    }
    const glance = await page.locator('#at-a-glance + .md-table tbody tr').allInnerTexts();
    assert.equal(glance.length, 9, 'the table has the setup and the 8 tests');
    assert.ok(glance.every(row => /min/.test(row)), 'with a time for each');
    const contact = page.locator('#doc #contact-us');
    assert.equal(await contact.textContent(), 'Contact us');
    assert.equal(await contact.getAttribute('data-report'), 'contact', 'it opens the form of report.js, not an email program');
    assert.equal(await page.locator('#doc a[href^="mailto:"]').count(), 0, 'no email address on the page');
    assert.equal(await page.locator('#doc .btn').count(), 1, 'one button');
    // Contact us comes right after the description (which says the tests are organised according to the time the person has), before the list of tests
    assert.equal(await page.evaluate(() => {
      const button = document.querySelector('#contact-us'), glance = document.querySelector('#at-a-glance');
      const intro = [...document.querySelectorAll('#doc > p')].filter(p => glance.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING && !p.contains(button) && !p.matches('.field-hint')).map(p => p.textContent).join(' ');
      return !!(button.compareDocumentPosition(glance) & Node.DOCUMENT_POSITION_FOLLOWING) && /organise the tests together, according to the time you have/.test(intro) && /we would need/.test(intro);
    }), true, 'Contact us follows the description and comes before the tests');
    assert.equal(await page.locator('#contact-us').getAttribute('data-template'), null, 'no message to start from');
    // Contact us opens the form (empty, without technical details); an email address is needed; it reaches Telegram as a contact message
    const outbox = join(dataDir, 'telegram');
    const lastNotice = async () => { const all = (await readdir(outbox)).sort(); return readFile(join(outbox, all[all.length - 1]), 'utf8'); };
    const before = (await readdir(outbox)).length;
    await contact.click();
    const dialog = page.locator('dialog.report-dialog');
    assert.equal(await dialog.locator('#report-title').textContent(), 'Contact us');
    assert.match(await dialog.locator('[data-intro]').textContent(), /how much time you could give to the MS-50G\+ tests/);
    assert.equal(await dialog.locator('[name="message"]').inputValue(), '', 'the message starts empty');
    assert.equal(await dialog.locator('.report-check').isVisible(), false, 'Contact us has no technical details');
    await dialog.getByRole('button', { name: 'Send', exact: true }).click();
    assert.match(await dialog.locator('.report-error').textContent(), /Write your message/);
    await dialog.locator('[name="message"]').fill('I could give two hours.\nFirmware 1.10.');
    await dialog.getByRole('button', { name: 'Send', exact: true }).click();
    assert.match(await dialog.locator('.report-error').textContent(), /Add your email address/, 'Contact us needs an email address');
    assert.equal((await readdir(outbox)).length, before, 'nothing was sent yet');
    await dialog.locator('[name="email"]').fill('tester@example.com');
    await dialog.getByRole('button', { name: 'Send', exact: true }).click();
    await dialog.locator('.report-done').waitFor({ state: 'visible' });
    assert.match(await dialog.locator('[data-reply]').textContent(), /We will write to tester@example\.com/);
    assert.equal(await page.locator('.fs-report').textContent(), 'Report a problem', 'the status bar button does not change for Contact us');
    assert.match(await lastNotice(), /^Message from ZOOM Patch Studio \(Contact us\)\nFrom: \(no name\) <tester@example\.com> \(not signed in\)\n\nI could give two hours\.\nFirmware 1\.10\.$/, 'only what was written: no page, no details');
    await dialog.getByRole('button', { name: 'Close' }).click();
    // the same form serves the status bar button, with its own title, and nothing of the contact message
    await page.locator('.fs-report').click();
    assert.equal(await dialog.locator('#report-title').textContent(), 'Report a problem');
    assert.equal(await dialog.locator('[name="message"]').inputValue(), '', 'the problem form starts empty');
    assert.equal(await dialog.locator('.report-check').isVisible(), true, 'and keeps its technical details box');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    const claimed = (await page.locator('#doc').innerText()).match(/about (\d+\.\d)%/g).map(s => parseFloat(s.slice(6)));
    assert.equal(claimed.length, 2, 'the DSP of TEST A and TEST C');
    // the test patches open in the builder with the effects the page names, and with the DSP load it quotes
    const links = await page.locator('#doc a[href^="builder.html#p="]').evaluateAll(as => as.map(a => a.getAttribute('href')));
    assert.equal(links.length, 2);
    const expected = [['COMPRESSOR', 'MS1959 DRIVE', 'DELAY'], ['COMPRESSOR', 'TS DRIVE', 'MS1959 DRIVE', 'GUITAR GRAPHIC EQ7', 'CLONE CHORUS', 'HALL REVERB']];
    for (const [i, href] of links.entries()) {
      await page.goto('about:blank'); // a change of the fragment alone would not reload the builder
      await page.goto(`${base}/ms-50g/${href}`);
      await page.waitForSelector('#chain-list .chain-item');
      assert.deepEqual(await page.evaluate(() => state.effects.map(slot => catalog[slot.index].name)), expected[i], `test patch ${i + 1}`);
      assert.ok(Math.abs(parseFloat(await page.locator('#dsp-total').textContent()) - claimed[i]) < 0.1, `test patch ${i + 1}: the builder shows the DSP load the page quotes`);
      await page.evaluate(() => { state.effects = []; state.name = ''; render(); save(); }); // a link asks before it replaces an unsaved patch
    }
    // the amp and add-on lists come from the data
    await open('ms-50g/help.html', SIZES[1]);
    const text = await page.locator('#doc').innerText();
    assert.match(text, /The 22 amp models: MS45OS DRIVE,/);
    assert.match(text, /The 24 add-on effects: OPTICAL COMPRESSOR,/);
  });

  await test('under 800 × 640 px a notice says so, suggests a bigger screen or full screen, and says what the site does', async () => {
    await open('index.html', PHONE);
    const text = await page.locator('.fs-small').innerText();
    assert.match(text, /This window is too small/);
    assert.match(text, /at least 800 × 640 px; this one is 390 × 700 px/, 'it says how big the window is');
    assert.match(text, /full screen/i, 'and suggests the full-screen mode');
    assert.match(text, /F11/);
    for (const word of ['MS-60B+', 'MS-50G+', 'Effects', 'Patch builder', 'Pedal manager', 'Tone ideas', '.zptc', 'Handy Guitar Lab', 'free account']) assert.ok(text.includes(word), `what the site does: ${word}`);
    assert.equal(await page.locator('.fs-small a[href$="/landing/"]').count(), 1, 'a link to the presentation page');
    // the notice follows the window
    await page.setViewportSize({ width: 500, height: 640 });
    await page.waitForFunction(() => document.querySelector('.fs-small [data-size]').textContent === '500 × 640 px');
    // every edge of the limit, on the two main pages and with the other pedal
    for (const file of ['index.html', 'builder.html', 'ms-50g/index.html']) {
      for (const [size, small] of [[[799, 700], true], [[1280, 639], true], [[800, 640], false], [[1024, 640], false], [[800, 700], false]]) {
        await open(file, size);
        const shown = await page.evaluate(smallScreen);
        assert.equal(shown.notice, small, `${file} ${size.join(' × ')}: notice ${small ? 'shown' : 'hidden'}`);
        if (small) assert.deepEqual(shown, { notice: true, restHidden: true, sideways: 0 }, `${file} ${size.join(' × ')}`);
        else assert.deepEqual((await page.evaluate(check, ALL_PAGES[file])).issues, [], `${file} ${size.join(' × ')}: the layout fits`);
      }
    }
    // back to a big window: the page is there again
    await page.setViewportSize({ width: 1280, height: 680 });
    assert.equal(await page.locator('.fs-main').isVisible(), true);
    assert.equal(await page.locator('.fs-small').isVisible(), false);
  });

  await test('the old addresses of the test version redirect to the site', async () => {
    // (the Effects page adds the first effect to the address)
    for (const [from, to] of [['_fullscreen/index.html', '/ms-60b/'], ['_fullscreen/guide.html#shortcuts', '/ms-60b/guide.html#shortcuts'], ['_fullscreen/privacy.html', '/privacy.html']]) {
      await page.goto(`${base}/${from}`);
      await page.waitForURL(url => (url.pathname + url.search + url.hash).startsWith(to) && !url.pathname.includes('_fullscreen'));
    }
    // ?add=<effect> still reaches the builder (which uses it and cleans the address)
    await open('index.html', SIZES[1]);
    const slug = await page.evaluate(() => { localStorage.clear(); return effects[3].slug; });
    await page.goto(`${base}/_fullscreen/builder.html?add=${slug}`);
    await page.waitForURL(url => url.pathname === '/ms-60b/builder.html');
    await page.waitForSelector('#chain-list .chain-item');
    assert.equal(await page.locator('#chain-list .chain-item').count(), 1, 'the effect named in the old address is in the chain');
  });

  await test('no errors in the browser console', async () => { assert.deepEqual(errors, []); });
} finally {
  await browser.close();
  server.kill();
  await rm(dataDir, { recursive: true, force: true });
}
console.log(`\n${passed} passed${failures.length ? `, ${failures.length} failed` : ''}`);
if (failures.length) process.exitCode = 1;
