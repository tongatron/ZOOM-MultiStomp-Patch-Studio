// Layout of the site, both pedals (MS-60B+ in site/, MS-50G+ in site/ms-50g/): every page must fit the window at each target size without scrolling.
// The page and the work area are never cut, every pane fits, the main controls are on screen and each work area keeps
// a useful height. Below 760 × 560 px the pages scroll on purpose (phone fallback): there only sideways overflow
// is an error, and the effect detail opens as a window. The builder is also checked with a full chain of 6 effects, signed out (with the account notice).
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
const base = `http://127.0.0.1:${port}`;
const dataDir = await mkdtemp(join(tmpdir(), 'ms60b-fullscreen-'));
const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', fileURLToPath(new URL('../deploy/server.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, PBKDF2_ITER: '1000', MAIL_OUTBOX: join(dataDir, 'mail') }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(resolve => server.stdout.once('data', resolve));
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });

const SIZES = [[1440, 820], [1280, 680], [1024, 700]];
const PHONE = [390, 700];
// [selector, label, least useful height in px]: the controls must be on screen
const PAGES = {
  'index.html': [['#search', 'search'], ['#sort', 'sort'], ['.fx-link', 'effect list'], ['#fx-dialog .detail-head', 'detail pane'], ['.results .fs-pane-body', 'effect list', 240], ['#dialog-body', 'effect detail', 240]],
  'builder.html': [['#add-effect', 'Add effect'], ['.builder-chain a[href="tones.html"]', 'Tone ideas'], ['#patch-name', 'patch name'], ['#save-patch', 'Save'], ['#download', 'Download .zptc'], ['#patch-toggle', 'Patch box arrow'],['#clear-chain', 'Create new patch'], ['.builder-chain .fs-pane-body', 'chain', 200], ['#library-list', 'My patches list', 48]],
  'pedal-manager.html': [['#usb-connect', 'Connect the pedal'], ['#usb-local-title', 'My patches'], ['#usb-pedal-title', 'On the pedal'], ['#usb-locals', 'My patches list', 160], ['#usb-memories', 'memory list', 160]],
  'tones.html': [['#tone-filter', 'filter'], ['#tone-styles-title', 'By style'], ['#tone-bassists-title', 'By bassist'], ['.tone-pane .fs-pane-body', 'tone list', 200]],
  'resources.html': [['.resource-list', 'manuals'], ['#check-title', 'Still to check'], ['.check-pane .fs-pane-body', 'checks', 200]],
  'technical-notes.html': [['#toc a', 'contents'], ['#doc-title', 'title'], ['.fs-doc .fs-pane-body', 'document', 300]],
  'privacy.html': [['#toc a', 'contents'], ['#doc-title', 'title'], ['.fs-doc .fs-pane-body', 'document', 300]],
  'guide.html': [['.fs-guide', 'Guide button'], ['#toc a', 'contents'], ['#doc-title', 'title'], ['.fs-doc .fs-pane-body', 'document', 300]]
};
// The MS-50G+ has Effects, Patch builder, Resources and the Guide (no Pedal manager, no Tone ideas)
const PAGES_50G = {
  'ms-50g/index.html': PAGES['index.html'],
  'ms-50g/builder.html': PAGES['builder.html'].filter(([selector]) => !selector.includes('tones.html')),
  'ms-50g/resources.html': PAGES['resources.html'],
  'ms-50g/guide.html': PAGES['guide.html']
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
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push(message.text()); });
const open = async (file, [width, height]) => {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}/${file}`);
  if (/(technical-notes|privacy|guide)\.html$/.test(file)) await page.waitForSelector('#toc a', { state: 'attached' });
  await page.waitForSelector('.account-slot > *', { timeout: 3000 }).catch(() => {}); // the Sign in button is part of the bar
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

  await test('builder: the patch alerts are in the Advice pane; Save and Download are small', async () => {
    await open('builder.html', SIZES[1]);
    await page.evaluate(() => {
      const fx = catalog.find(f => f.dsp !== null && f.params.some(p => p.codec && !p.codec.verified));
      state.effects = [slotFor(fx.index)];
      render();
    });
    assert.equal(await page.locator('#advice #notices').count(), 1, 'the alerts list is in Advice');
    assert.equal(await page.locator('.builder-side #notices').count(), 0, 'and not in the patch box');
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

  await test('the status bar: Privacy, Source on GitHub and tongatron.org on the left, the data note and the update time on the right', async () => {
    for (const file of Object.keys(ALL_PAGES)) {
      for (const size of SIZES) {
        await open(file, size);
        const labels = await page.locator('.fs-status > *').evaluateAll(els => els.map(el => el.textContent.trim().replace(/\s+/g, ' ')));
        assert.equal(labels.length, 5, `${file}: ${labels.join(' | ')}`);
        assert.deepEqual(labels.slice(0, 3), ['Privacy', 'Source on GitHub', 'tongatron.org'], file);
        assert.match(labels[3], new RegExp(`^Data: Zoom ${file.startsWith('ms-50g') ? 'MS-50G' : 'MS-60B'}\\+ Effects List © 2024 ZOOM CORPORATION`), file);
        assert.match(labels[4], /^Last update /, file);
        const edges = await page.evaluate(() => [...document.querySelectorAll('.fs-status > *')].map(el => { const r = el.getBoundingClientRect(); return [r.left, r.right]; }));
        edges.forEach(([left], i) => { if (i) assert.ok(left >= edges[i - 1][1] - 1, `${file} ${size.join(' × ')}: item ${i} overlaps the previous one`); });
        assert.ok(edges[4][1] >= size[0] - 20, `${file}: the update time is at the right edge`);
        assert.ok(edges[2][1] < size[0] / 2, `${file}: the tongatron.org button is on the left`);
      }
      assert.equal(await page.locator('.fs-status a[href="resources.html"]').count(), 0, `${file}: no Resources in the status bar`);
      assert.equal(await page.locator('.fs-status').getByText('Classic view').count(), 0, `${file}: no Classic view in the status bar`);
    }
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

  await test('the header has no "Full screen" tag; the Guide button comes right before the account menu on every page and opens the guide', async () => {
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
      assert.deepEqual(place, { onlyAccountAfter: true, rightOfNav: true, atRight: true }, `${file}: Guide at the right, before the account menu`);
      assert.equal(await page.locator('.fs-guide').getAttribute('href'), 'guide.html');
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
    assert.equal((await page.locator('.fs-menu-list a[aria-current]').textContent()).trim(), await page.locator('.fs-menu-current').textContent(), 'the menu marks the pedal the button shows');
    assert.equal(await page.locator('.fs-menu-list a[href="ms-50g/builder.html"]').count(), 1, 'the other pedal opens on the same page');
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
    assert.equal(await page.locator('#fx-dialog .Overlay-header').isHidden(), true, 'the buttons that are at the top of the page are not repeated in the pane');
    for (const id of ['#dialog-prev', '#dialog-next', '#dialog-pos', '#dialog-close']) assert.equal(await page.locator(id).isHidden(), true, id);
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

  await test('the advice cannot be turned off: no switch in the builder or in the effect detail, even if the classic page saved it off', async () => {
    await open('index.html', SIZES[1]);
    await page.evaluate(() => localStorage.setItem(`${PEDAL.id}-advice`, JSON.stringify({ enabled: false })));
    const slug = await page.evaluate(() => effects.find(effect => ADVICE.effectTips(effect.index)).slug);
    await page.goto(`${base}/index.html#${slug}`);
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

  await test('builder: the patch box is in the middle and Advice on the right; the DSP bar is thin', async () => {
    // below 1280 px the builder has two columns (Advice under the chain), so the three columns are checked from there up
    for (const size of SIZES.filter(([width]) => width >= 1280)) {
      await open('builder.html', size);
      const left = await page.evaluate(() => ['.builder-chain', '.patch-box', '#advice'].map(s => document.querySelector(s).getBoundingClientRect().left));
      assert.ok(left[0] < left[1] && left[1] < left[2], `${size.join(' × ')}: chain, patch box, advice from left to right (${left.map(Math.round)})`);
    }
    await open('builder.html', SIZES[0]);
    await page.evaluate(() => { state.effects = catalog.filter(fx => fx.dsp !== null).slice(0, 3).map(fx => slotFor(fx.index)); render(); });
    const bar = await page.locator('#dsp-stack').boundingBox();
    assert.ok(bar.height <= 8 && bar.height >= 3, `the DSP bar is ${bar.height} px tall`);
    assert.ok(bar.width > 150, 'and still as wide as the box');
  });

  await test('builder: the arrow closes the Patch box, My patches takes the room, and the choice is remembered', async () => {
    await open('builder.html', SIZES[1]);
    await page.evaluate(() => localStorage.removeItem(`${PEDAL.id}-fs-patch-collapsed`));
    await page.reload();
    const list = () => page.locator('#library-list').boundingBox();
    const before = await list();
    assert.equal(await page.locator('#patch-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#patch-name').isVisible(), true);
    await page.fill('#patch-name', 'FOLD ME');
    await page.locator('#patch-toggle').click();
    assert.equal(await page.locator('#patch-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#patch-body').isHidden(), true, 'the name, the load and the buttons are folded away');
    assert.match(await page.locator('#patch-summary').textContent(), /^FOLD ME · \d/, 'the header keeps the name and the load');
    assert.ok((await list()).height > before.height + 100, 'My patches takes the room');
    assert.equal(await page.evaluate(() => document.querySelector('.fs-main').scrollHeight <= document.querySelector('.fs-main').clientHeight + 1), true, 'nothing is cut');
    await open('builder.html', SIZES[1]);
    assert.equal(await page.locator('#patch-body').isHidden(), true, 'still closed after a reload');
    assert.match(await page.locator('#patch-summary').textContent(), /· \d/);
    await page.locator('#patch-toggle').click();
    assert.equal(await page.locator('#patch-name').isVisible(), true, 'the arrow opens it again');
    assert.equal(await page.locator('#patch-summary').isHidden(), true);
    await page.evaluate(() => localStorage.removeItem(`${PEDAL.id}-fs-patch-collapsed`));
  });

  await test('the pedal menu switches to the same page of the other pedal', async () => {
    await open('builder.html', SIZES[1]);
    await page.locator('.fs-menu-button').click();
    await page.locator('.fs-menu-list a[href="ms-50g/builder.html"]').click();
    await page.waitForURL(/\/ms-50g\/builder\.html$/);
    await page.locator('.fs-menu-button').click();
    await page.locator('.fs-menu-list a[href="../builder.html"]').click();
    await page.waitForURL(url => url.pathname === '/builder.html');
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
    assert.match(await page.locator('.flash a').getAttribute('href'), /ms-50gplus-en/);
    await page.locator('.fs-menu-button').click();
    const items = await page.locator('.fs-menu-list a').allTextContents();
    assert.deepEqual(items.map(t => t.replace(/\s+/g, ' ').trim()), ['MS-60B+ bass', 'MS-50G+ guitar Not tested']);
    assert.equal(await page.locator('.fs-menu-list a[href="../"]').count(), 1);
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

  await test('on a phone the effect detail opens as a window with its own buttons, and becomes the pane again on a big screen', async () => {
    await open('index.html', PHONE);
    assert.equal(await page.evaluate(() => document.querySelector('#fx-dialog').open), false, 'nothing is open at first');
    assert.equal(await page.locator('#fx-dialog').isVisible(), false, 'and nothing of it is shown');
    await page.locator('.fx-link').nth(2).click();
    assert.equal(await page.evaluate(() => document.querySelector('#fx-dialog').matches(':modal')), true, 'a window');
    assert.equal(await page.locator('#dialog-close').isVisible(), true);
    assert.equal(await page.locator('#dialog-pos').textContent(), '3 of 97');
    await page.locator('#dialog-next').click();
    assert.equal(await page.locator('#dialog-pos').textContent(), '4 of 97');
    assert.equal(await page.locator('#dialog-body .detail-add a').count(), 1, 'Add to patch is under the description here too');
    assert.equal(await page.locator('[data-advice-off]').count(), 0, 'and the advice has no switch');
    await page.locator('#dialog-close').click();
    assert.equal(await page.evaluate(() => document.querySelector('#fx-dialog').open), false);
    // an address that names an effect opens it
    const slug = await page.evaluate(() => effects[5].slug);
    await page.goto(`${base}/index.html#${slug}`);
    await page.waitForFunction(() => document.querySelector('#fx-dialog').matches(':modal'));
    assert.equal(await page.locator('#dialog-title').textContent(), await page.evaluate(() => effects[5].name));
    // the window gets big: the same detail becomes the pane next to the list
    await page.setViewportSize({ width: 1280, height: 680 });
    await page.waitForFunction(() => { const d = document.querySelector('#fx-dialog'); return d.open && !d.matches(':modal'); });
    assert.equal(await page.locator('#dialog-title').textContent(), await page.evaluate(() => effects[5].name), 'still the same effect');
    assert.equal(await page.locator('#dialog-close').isHidden(), true);
    const layout = await page.evaluate(() => ({ list: document.querySelector('.results .fs-pane-body').getBoundingClientRect().height, detail: document.querySelector('#dialog-body').getBoundingClientRect().height, scrolls: document.documentElement.scrollHeight > innerHeight }));
    assert.ok(layout.list >= 240 && layout.detail >= 240 && !layout.scrolls, `the panes fit again: ${JSON.stringify(layout)}`);
  });

  await test('the old addresses of the test version redirect to the site', async () => {
    // (the Effects page adds the first effect to the address)
    for (const [from, to] of [['_fullscreen/index.html', '/'], ['_fullscreen/guide.html#shortcuts', '/guide.html#shortcuts'], ['_fullscreen/privacy.html', '/privacy.html']]) {
      await page.goto(`${base}/${from}`);
      await page.waitForURL(url => (url.pathname + url.search + url.hash).startsWith(to) && !url.pathname.includes('_fullscreen'));
    }
    // ?add=<effect> still reaches the builder (which uses it and cleans the address)
    await open('index.html', SIZES[1]);
    const slug = await page.evaluate(() => { localStorage.clear(); return effects[3].slug; });
    await page.goto(`${base}/_fullscreen/builder.html?add=${slug}`);
    await page.waitForURL(url => url.pathname === '/builder.html');
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
