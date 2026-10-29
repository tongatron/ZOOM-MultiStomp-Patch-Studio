// End-to-end test of the patch builder in a real browser (Playwright): build, save, share, compare, download, and the
// accounts (signed-out notice, sign-up, first sign-in with local patches, sync between devices, sign-out).
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
const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', fileURLToPath(new URL('../deploy/server.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, PBKDF2_ITER: '1000', MAIL_OUTBOX: join(dataDir, 'mail') }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise(resolve => server.stdout.once('data', resolve));
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });

let passed = 0;
const errors = [];
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };
// Each context is a separate "device" with its own storage; service workers are blocked so every load hits the server
// welcome: true leaves the reminder dialog for visitors without an account switched on (it has its own test); by default it is
// ignored, because it would cover every signed-out page
async function device({ welcome = false } = {}) {
  const context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: true });
  if (!welcome) await context.addInitScript(() => { try { localStorage.setItem('account-welcome', 'ignored'); } catch {} });
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

  await test('replace an effect with another one in the same slot', async () => {
    const before = await chain(page);
    const first = page.locator('#chain-list .chain-item').first();
    await first.locator('[data-action="replace"]').click();
    assert.match(await page.textContent('#picker-title'), /^Replace /);
    assert.equal(await page.locator('#picker-cats [data-cat=""][aria-pressed="true"]').count(), 0, 'the category of the effect is preselected');
    await page.locator('#picker-cats [data-cat=""]').click();
    await page.fill('#picker-query', 'OPTICAL COMPRESSOR');
    await page.locator('.picker-item', { hasText: 'OPTICAL COMPRESSOR' }).first().click();
    assert.equal(await chain(page), before);
    assert.match(await page.locator('#chain-list .chain-item').first().innerText(), /OPTICAL COMPRESSOR/);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'replace', 'focus stays on the replaced slot');
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

  await test('a patch link (Tone ideas, Pedal manager, an old share link) opens the same patch on another device', async () => {
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

  const PASSWORD = 'e2e password 123';
  const signIn = async (target, email) => {
    await target.goto(`${base}/login?next=/builder.html`);
    await target.fill('#email', email);
    await target.fill('#password', PASSWORD);
    await target.click('button[type="submit"]');
    await target.waitForURL(/builder\.html/);
    await target.locator('.account-name').waitFor();
  };
  // Signed in, the header shows only the user's name; Sign out starts from the account page and the studio then asks what to do with the data
  const signOut = async (target, choice) => {
    await target.goto(`${base}/account`);
    await target.click('.account-links a[href="/?signout=1"]');
    await target.locator('.account-dialog button', { hasText: choice }).click();
    await target.waitForLoadState('load');
    await target.locator('.account-signin').waitFor();
  };

  await test('signed out: a Sign in button and a notice that the patches stay in this browser', async () => {
    await page.reload();
    await page.locator('.account-notice').waitFor();
    assert.match(await page.locator('.account-notice').innerText(), /stored only in this browser/);
    assert.ok(await page.locator('.account-local', { hasText: 'Saved in this browser only' }).isVisible());
    await page.locator('.account-notice button', { hasText: 'Dismiss' }).click();
    assert.equal(await page.locator('.account-notice').count(), 0);
    await page.reload();
    await page.locator('.account-signin').waitFor();
    assert.equal(await page.locator('.account-notice').count(), 0, 'dismissed for this session');
    await page.goto(`${base}/`);
    await page.locator('.account-signin').waitFor();
    assert.equal(await page.locator('.account-notice').count(), 0, 'the Effects page saves nothing: no notice');
  });

  await test('signing up keeps the patches of this browser in the new account', async () => {
    await page.goto(`${base}/builder.html`);
    await page.click('.account-signin');
    await page.click('text=Create an account');
    await page.fill('#email', 'e2e@example.com');
    await page.fill('#password', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/builder\.html/);
    await page.locator('.account-name').waitFor();
    assert.equal(await page.locator('.account-name').innerText(), 'e2e@example.com', 'the header shows the user name (the email when there is no name)');
    assert.equal(await page.locator('.account-slot details, .account-dropdown').count(), 0, 'and no menu');
    await page.locator('.update-bar', { hasText: 'now kept in your account' }).waitFor();
    assert.equal(await page.locator('.account-local').isVisible(), false);
  });

  await test('another device signs in and gets the same patches', async () => {
    const laptop = await device();
    await signIn(laptop.page, 'e2e@example.com');
    await laptop.page.waitForFunction(() => document.querySelector('#library-count').textContent === '2');
    await laptop.context.close();
  });

  // The reminder for visitors without an account (pages with <body data-account-welcome>)
  const reminder = target => target.locator('.account-welcome[open]');
  const settle = async target => { await target.locator('.account-signin').waitFor(); await target.waitForTimeout(300); };
  await test('signed out: the reminder shows the advantages and the links; Maybe later hides it for this visit, Ignore for good', async () => {
    const { context, page: first } = await device({ welcome: true });
    await reminder(first).waitFor();
    assert.match(await reminder(first).innerText(), /free account[\s\S]*every device/);
    assert.equal(await reminder(first).locator('a[href="/register?next=%2Fbuilder.html"]').count(), 1, 'sign-up link back to this page');
    assert.equal(await reminder(first).locator('a[href="/login?next=%2Fbuilder.html"]').count(), 1, 'sign-in link back to this page');
    // Esc counts as "Maybe later": not again in this tab, whatever the page...
    await first.keyboard.press('Escape');
    await first.locator('.account-welcome').waitFor({ state: 'detached', timeout: 3000 });
    await first.reload();
    await settle(first);
    assert.equal(await first.locator('.account-welcome').count(), 0, 'not again after a reload');
    await first.goto(`${base}/tones.html`);
    await settle(first);
    assert.equal(await first.locator('.account-welcome').count(), 0, 'not again on another page of the same visit');
    // ...but the next visit (a new tab) asks again
    const second = await context.newPage();
    await second.goto(`${base}/tones.html`);
    await reminder(second).waitFor();
    assert.equal(await reminder(second).locator('a[href="/register?next=%2Ftones.html"]').count(), 1);
    await reminder(second).locator('button', { hasText: 'Ignore this message' }).click();
    await second.locator('.account-welcome').waitFor({ state: 'detached', timeout: 3000 });
    assert.equal(await second.evaluate(() => localStorage.getItem('account-welcome')), 'ignored');
    // ignored: no more reminders, in new visits either
    const third = await context.newPage();
    await third.goto(`${base}/`);
    await settle(third);
    assert.equal(await third.locator('.account-welcome').count(), 0, 'ignored for good');
    await context.close();
  });

  await test('the reminder shows on the Effects page, not on the documents, and not when signed in', async () => {
    const visitor = await device({ welcome: true });
    await visitor.page.goto(`${base}/`);
    await reminder(visitor.page).waitFor();
    for (const file of ['guide.html', 'privacy.html', 'resources.html', 'landing/']) {
      const tab = await visitor.context.newPage();
      await tab.goto(`${base}/${file}`);
      await settle(tab);
      assert.equal(await tab.locator('.account-welcome').count(), 0, `${file}: no reminder`);
      await tab.close();
    }
    await visitor.context.close();
    const member = await device({ welcome: true });
    await signIn(member.page, 'e2e@example.com');
    await member.page.waitForTimeout(500);
    assert.equal(await member.page.locator('.account-welcome').count(), 0, 'signed in: no reminder');
    await member.context.close();
  });

  await test('first sign-in on a browser with its own patches: Not now keeps them aside, then they can be added', async () => {
    const tablet = await device();
    await addEffect(tablet.page, 'DYNAMIC COMPRESSOR');
    await tablet.page.fill('#patch-name', 'TABLET ONLY');
    await tablet.page.click('#save-patch');
    await tablet.page.goto(`${base}/login?next=/builder.html`);
    await tablet.page.fill('#email', 'e2e@example.com');
    await tablet.page.fill('#password', PASSWORD);
    await tablet.page.click('button[type="submit"]');
    const dialog = tablet.page.locator('.account-dialog');
    await dialog.waitFor();
    assert.match(await dialog.innerText(), /This browser has 1 patch that is not in your account/);
    await dialog.locator('button', { hasText: 'Not now' }).click();
    await tablet.page.waitForFunction(() => document.querySelector('#library-count').textContent === '2');
    assert.doesNotMatch(await tablet.page.locator('#library-list').innerText(), /TABLET ONLY/);
    assert.equal(await tablet.page.locator('.account-aside').innerText(), '+1', 'a small button next to the name adds the patches kept aside');
    await tablet.page.click('[data-action="aside"]');
    await tablet.page.waitForFunction(() => document.querySelector('#library-count').textContent === '3');
    await tablet.page.waitForFunction(() => /Synced at/.test(document.querySelector('.account-name')?.title || ''));
    assert.equal(await tablet.page.locator('.account-aside').count(), 0, 'nothing is kept aside any more');
    await tablet.context.close();
  });

  await test('sign-out removes the data from this browser by default; it comes back at the next sign-in', async () => {
    await page.goto(`${base}/builder.html`);
    await page.locator('.account-name').waitFor();
    await page.waitForFunction(() => document.querySelector('#library-count').textContent === '3');
    await signOut(page, 'Remove from this browser');
    await page.goto(`${base}/builder.html`);
    await page.waitForFunction(() => document.querySelector('#library-count'));
    assert.equal(await page.locator('#library-count').innerText(), '0');
    assert.equal(await page.evaluate(() => localStorage.getItem('ms60b-library')), null);
    await signIn(page, 'e2e@example.com');
    await page.waitForFunction(() => document.querySelector('#library-count').textContent === '3');
  });

  await test('the account page shows the saved patches', async () => {
    await page.goto(`${base}/account`);
    assert.match(await page.locator('body').innerText(), /3 MS-60B\+ patches/);
  });

  await test('a tone idea opens in the builder with its chain', async () => {
    const fresh = await device();
    await fresh.page.goto(`${base}/tones.html`);
    assert.ok(await fresh.page.locator('#tone-styles .tone-card').count() >= 5);
    await fresh.page.locator('#bassist-wolstenholme .btn-primary').click();
    await fresh.page.waitForURL(/builder\.html/);
    assert.equal(await fresh.page.inputValue('#patch-name'), 'FUZZ SYNTH');
    assert.equal(await chain(fresh.page), 2);
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
