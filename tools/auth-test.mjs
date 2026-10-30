// Tests for the accounts: SMTP client, tokens, and the sign-in flows of deploy/server.mjs (pages, cookies, CSRF, rate limits).
// Run: node tools/auth-test.mjs  (emails and Telegram notices go to temporary outbox folders)
import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { connect, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { hashPassword, hashToken, makeSession, newToken, newUserId } from '../deploy/auth.mjs';
import { openDb } from '../deploy/db.mjs';
import { buildMessage, smtpSend } from '../deploy/mail.mjs';

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };
const deploy = file => fileURLToPath(new URL(`../deploy/${file}`, import.meta.url));

// ---- SMTP client against a fake server ----------------------------------------------------------
await test('the SMTP client logs in, sends one message and dot-stuffs it', async () => {
  const seen = [];
  let data = '';
  const smtp = createServer(socket => {
    let inData = false;
    let buffer = '';
    socket.write('220 fake ESMTP\r\n');
    socket.on('data', chunk => {
      buffer += chunk.toString();
      let at;
      while ((at = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, at);
        buffer = buffer.slice(at + 2);
        if (inData) {
          if (line === '.') { inData = false; socket.write('250 queued\r\n'); } else data += `${line}\n`;
          continue;
        }
        seen.push(line);
        if (line.startsWith('EHLO')) socket.write('250-fake\r\n250 AUTH LOGIN\r\n');
        else if (line === 'AUTH LOGIN') socket.write('334 VXNlcm5hbWU6\r\n');
        else if (seen.length === 3) socket.write('334 UGFzc3dvcmQ6\r\n');
        else if (seen.length === 4) socket.write(Buffer.from(line, 'base64').toString() === 'app pass' ? '235 ok\r\n' : '535 no\r\n');
        else if (line === 'DATA') { inData = true; socket.write('354 go\r\n'); }
        else if (line === 'QUIT') socket.end('221 bye\r\n');
        else socket.write('250 ok\r\n');
      }
    });
  });
  await new Promise(ok => smtp.listen(0, '127.0.0.1', ok));
  const cfg = { host: '127.0.0.1', port: smtp.address().port, secure: false, user: 'sender@example.com', password: 'app pass', fromName: 'ZOOM MultiStomp Studio' };
  const message = buildMessage({ from: cfg.user, fromName: cfg.fromName, to: 'you@example.com', subject: 'Hello – test', text: 'one', html: '<p>two</p>' }) + '\r\n.hidden line';
  await smtpSend(cfg, 'you@example.com', message);
  assert.deepEqual(seen.filter(l => /^(MAIL|RCPT)/.test(l)), ['MAIL FROM:<sender@example.com>', 'RCPT TO:<you@example.com>']);
  assert.match(data, /Subject: =\?UTF-8\?B\?/);
  assert.match(data, /\n\.\.hidden line\n/, 'a line starting with a dot is stuffed');
  seen.length = 0;
  await assert.rejects(smtpSend({ ...cfg, password: 'wrong' }, 'you@example.com', message), /SMTP 535/);
  smtp.close();
});

// ---- tokens in the database ---------------------------------------------------------------------
await test('a token works once and not after it expires', async () => {
  const store = openDb(':memory:');
  const user = store.createUser({ id: newUserId(), email: 'a@example.com', hashed: await hashPassword('x'.repeat(10), undefined, 1000) });
  const fresh = newToken();
  const old = newToken();
  store.addToken(fresh.hash, user.id, 'reset', 3600);
  store.addToken(old.hash, user.id, 'reset', 3600, Date.now() - 2 * 3600_000);
  assert.equal(store.tokenUser(old.hash, 'reset'), null, 'expired');
  assert.equal(store.tokenUser(fresh.hash, 'verify'), null, 'wrong purpose');
  assert.equal(store.tokenUser(fresh.hash, 'reset', true).email, 'a@example.com');
  assert.equal(store.tokenUser(fresh.hash, 'reset'), null, 'used');
  assert.equal(store.userByEmail('A@EXAMPLE.COM').id, user.id, 'emails ignore case');
  store.close();
});

// ---- the server ---------------------------------------------------------------------------------
const dataDir = await mkdtemp(join(tmpdir(), 'zms-auth-'));
const mailDir = join(dataDir, 'mail');
const telegramDir = join(dataDir, 'telegram');
const SECRET = 'ab'.repeat(32);
const port = await new Promise(ok => { const s = createServer().listen(0, () => { const p = s.address().port; s.close(() => ok(p)); }); });
const base = `http://127.0.0.1:${port}`;
const env = { ...process.env, PORT: String(port), DATA_DIR: dataDir, MAIL_OUTBOX: mailDir, TELEGRAM_OUTBOX: telegramDir, SESSION_SECRET: SECRET, SITE_URL: base, PBKDF2_ITER: '1000' };
const server = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', deploy('server.mjs')], { env, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((ok, fail) => {
  const tryConnect = n => connect(port, '127.0.0.1').on('connect', function () { this.end(); ok(); }).on('error', () => (n ? setTimeout(() => tryConnect(n - 1), 100) : fail(new Error('server did not start'))));
  tryConnect(50);
});

let ipCounter = 0;
const freshIp = () => `10.0.0.${++ipCounter}`;
const post = (path, fields, { cookie = '', ip = freshIp(), headers = {} } = {}) => fetch(base + path, {
  method: 'POST', redirect: 'manual', body: new URLSearchParams(fields),
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'CF-Connecting-IP': ip, ...(cookie ? { Cookie: cookie } : {}), ...headers }
});
const get = (path, { cookie = '', ip = freshIp() } = {}) => fetch(base + path, { redirect: 'manual', headers: { 'CF-Connecting-IP': ip, ...(cookie ? { Cookie: cookie } : {}) } });
const sessionOf = response => (response.headers.get('set-cookie') || '').split(';')[0];
const me = async cookie => (await get('/api/me', { cookie })).json();

// The text part of email number `count` in the outbox (written in the background, so wait a little)
async function mailNumber(count) {
  for (let i = 0; i < 40; i++) {
    const files = (await readdir(mailDir).catch(() => [])).sort();
    if (files.length >= count) {
      const raw = await readFile(join(mailDir, files[count - 1]), 'utf8');
      const part = raw.split(/\r\n--zms-/).find(p => p.includes('text/plain'));
      return { raw, text: Buffer.from(part.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString() };
    }
    await new Promise(ok => setTimeout(ok, 50));
  }
  throw new Error(`email ${count} not written`);
}
const linkToken = (text, path) => new URL(text.match(new RegExp(`${base}${path}\\?token=\\S+`))[0]).searchParams.get('token');

try {
  const EMAIL = 'Player@Example.com';
  const PASSWORD = 'low end theory';
  let cookie;

  await test('sign-in pages are served with strict headers; signed out, /api/me says so', async () => {
    const page = await get('/login');
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal(page.headers.get('cache-control'), 'no-store');
    assert.match(await page.text(), /Continue without an account/);
    assert.equal((await get('/register')).status, 200);
    assert.deepEqual(await me(''), { signedIn: false });
    assert.equal((await fetch(`${base}/login`, { method: 'PUT' })).status, 405);
  });

  await test('sign-up checks the email and the password', async () => {
    assert.equal((await post('/register', { email: 'not-an-email', password: PASSWORD })).status, 400);
    const short = await post('/register', { email: EMAIL, password: 'short' });
    assert.equal(short.status, 400);
    assert.match(await short.text(), /at least 10 characters/);
  });

  await test('sign-up opens a session, sends a welcome email without the password and a Telegram notice', async () => {
    const response = await post('/register', { email: EMAIL, name: 'Ron', password: PASSWORD, next: '/builder.html' });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/builder.html');
    assert.match(response.headers.get('set-cookie'), /^zms_session=v2\.[a-f0-9]{32}\.1\.\d+\.[a-f0-9]{64}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=2592000$/);
    cookie = sessionOf(response);
    assert.deepEqual(await me(cookie), { signedIn: true, email: EMAIL, name: 'Ron', verified: false, admin: false });
    const { raw, text } = await mailNumber(1);
    assert.match(raw, /^To: <Player@Example\.com>/m);
    assert.ok(!text.includes(PASSWORD), 'the password is never emailed');
    assert.ok(linkToken(text, '/verify'));
    const notices = await readdir(telegramDir);
    assert.equal(notices.length, 1);
    assert.match(await readFile(join(telegramDir, notices[0]), 'utf8'), /New user signed up on ZOOM MultiStomp Studio\nEmail: Player@Example\.com\nName: Ron/);
  });

  await test('the same email cannot sign up twice, whatever its case', async () => {
    assert.equal((await post('/register', { email: 'player@example.COM', password: PASSWORD })).status, 409);
  });

  await test('the confirmation link marks the email as confirmed, once', async () => {
    const token = linkToken((await mailNumber(1)).text, '/verify');
    assert.equal((await get(`/verify?token=${token}`)).status, 200);
    assert.equal((await me(cookie)).verified, true);
    assert.equal((await get(`/verify?token=${token}`)).status, 400);
  });

  await test('sign-in accepts the right password only and never redirects to another site', async () => {
    const wrong = await post('/login', { email: EMAIL, password: 'wrong password' });
    assert.equal(wrong.status, 401);
    assert.match(await wrong.text(), /Incorrect email address or password/);
    assert.equal((await post('/login', { email: 'nobody@example.com', password: PASSWORD })).status, 401);
    const ok = await post('/login', { email: 'player@example.com', password: PASSWORD, next: '//evil.example/x' });
    assert.equal(ok.status, 303);
    assert.equal(ok.headers.get('location'), '/');
    assert.equal((await me(sessionOf(ok))).signedIn, true);
    assert.equal((await get('/login?next=/tones.html', { cookie })).headers.get('location'), '/tones.html', 'signed in: the page goes on');
  });

  await test('a forged, tampered or expired session cookie is refused', async () => {
    const id = cookie.split('.')[1];
    const store = openDb(join(dataDir, 'studio.db'));
    const user = store.userById(id);
    store.close();
    const secret = Buffer.from(SECRET, 'hex');
    assert.equal((await me(`zms_session=${makeSession(secret, user, Date.now() - 31 * 864e5)}`)).signedIn, false, 'expired');
    assert.equal((await me(`zms_session=${makeSession(Buffer.alloc(32), user)}`)).signedIn, false, 'wrong key');
    assert.equal((await me(cookie.replace('.1.', '.2.'))).signedIn, false, 'changed password version');
    assert.equal((await me('zms_session=garbage')).signedIn, false);
    const old = await get('/api/me', { cookie: `zms_session=${makeSession(secret, user, Date.now() - 25 * 864e5)}` });
    assert.match(old.headers.get('set-cookie') || '', /^zms_session=/, 'a session in its last week is renewed');
  });

  await test('writes from another site are refused (CSRF)', async () => {
    assert.equal((await post('/login', { email: EMAIL, password: PASSWORD }, { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
    assert.equal((await post('/logout', {}, { cookie, headers: { Origin: 'https://evil.example' } })).status, 403);
    assert.equal((await post('/login', { email: EMAIL, password: PASSWORD }, { headers: { 'Sec-Fetch-Site': 'same-origin' } })).status, 303);
  });

  await test('forgot password: same answer for unknown emails, a one-hour single-use link for real ones', async () => {
    const unknown = await post('/forgot', { email: 'nobody@example.com' });
    assert.equal(unknown.status, 200);
    const unknownText = await unknown.text();
    const known = await post('/forgot', { email: EMAIL });
    assert.equal(await known.text(), unknownText);
    const { text } = await mailNumber(2);
    const token = linkToken(text, '/reset');
    assert.match(await (await get(`/reset?token=${token}`)).text(), /Player@Example\.com/);
    assert.equal((await post('/reset', { token, password: 'short' })).status, 400, 'a short password keeps the link valid');
    const reset = await post('/reset', { token, password: 'new password 2' });
    assert.equal(reset.status, 303);
    assert.equal((await me(sessionOf(reset))).signedIn, true);
    assert.equal((await me(cookie)).signedIn, false, 'the old sessions are closed');
    assert.equal((await post('/reset', { token, password: 'another one 3' })).status, 400, 'the link works once');
    assert.equal((await get('/reset?token=nope')).status, 400);
    assert.equal((await post('/login', { email: EMAIL, password: PASSWORD })).status, 401);
    cookie = sessionOf(await post('/login', { email: EMAIL, password: 'new password 2' }));
    assert.equal((await me(cookie)).signedIn, true);
  });

  await test('sign-out clears the cookie (POST only)', async () => {
    assert.match(await (await get('/logout')).text(), /method="post" action="\/logout"/);
    const out = await post('/logout', { next: '/builder.html' }, { cookie });
    assert.equal(out.headers.get('location'), '/builder.html');
    assert.match(out.headers.get('set-cookie'), /^zms_session=; .*Max-Age=0/);
  });

  await test('rate limits: 5 wrong passwords per email, 10 per address, 5 sign-ups per address', async () => {
    assert.equal((await post('/register', { email: 'locked@example.com', password: PASSWORD })).status, 303);
    for (let i = 0; i < 5; i++) assert.equal((await post('/login', { email: 'locked@example.com', password: `wrong ${i}` })).status, 401);
    assert.equal((await post('/login', { email: 'LOCKED@example.com', password: PASSWORD })).status, 429, 'locked even with the right password');
    const ip = freshIp();
    for (let i = 0; i < 10; i++) assert.equal((await post('/login', { email: `x${i}@example.com`, password: 'wrong' }, { ip })).status, 401);
    assert.equal((await post('/login', { email: 'y@example.com', password: 'wrong' }, { ip })).status, 429);
    const signUpIp = freshIp();
    for (let i = 0; i < 5; i++) assert.equal((await post('/register', { email: `new${i}@example.com`, password: PASSWORD }, { ip: signUpIp })).status, 303);
    assert.equal((await post('/register', { email: 'new5@example.com', password: PASSWORD }, { ip: signUpIp })).status, 429);
  });

  await test('add-user.mjs creates an admin from the terminal', async () => {
    const child = execFile(process.execPath, ['--disable-warning=ExperimentalWarning', deploy('add-user.mjs'), '--email', 'admin@example.com', '--name', 'Giovanni', '--admin', '--stdin'], { env });
    child.stdin.end('admin password 1\n');
    const code = await new Promise(ok => child.on('exit', ok));
    assert.equal(code, 0);
    const session = sessionOf(await post('/login', { email: 'admin@example.com', password: 'admin password 1' }));
    assert.deepEqual(await me(session), { signedIn: true, email: 'admin@example.com', name: 'Giovanni', verified: false, admin: true });
  });

  await test('the user console is for admins only and never acts on the admin themselves', async () => {
    assert.equal((await get('/admin')).headers.get('location'), '/login?next=%2Fadmin');
    const userSession = sessionOf(await post('/login', { email: 'new1@example.com', password: PASSWORD }));
    assert.equal((await get('/admin', { cookie: userSession })).status, 403);
    const store = openDb(join(dataDir, 'studio.db'));
    const idOf = email => store.userByEmail(email).id;
    assert.equal((await post('/admin/role', { id: idOf('new2@example.com'), role: 'admin' }, { cookie: userSession })).status, 403);
    assert.equal(store.userByEmail('new2@example.com').role, 'user');
    const admin = sessionOf(await post('/login', { email: 'admin@example.com', password: 'admin password 1' }));
    const page = await (await get('/admin', { cookie: admin })).text();
    assert.doesNotMatch(page, /<h2>Summary<\/h2>/, 'the Summary section is gone');
    assert.match(page, /admin-accounts-table/);
    assert.match(page, /data-label="Email"/);
    assert.match(page, /overflow: visible/);
    assert.match(page, /new3@example\.com/);
    assert.doesNotMatch(page, /<h2>Service<\/h2>|test email/i, 'the Service section is gone');
    assert.equal((await post('/admin/test-mail', {}, { cookie: admin })).status, 405, 'and so is its test email route');
    assert.match(page, /<!--email_off-->[\s\S]*new3@example\.com[\s\S]*<!--\/email_off-->/, 'the emails are marked so that Cloudflare does not hide them');
    const found = await (await get('/admin?q=PLAYER&sort=bogus&dir=up', { cookie: admin })).text();
    assert.match(found, /Player@Example\.com/);
    assert.doesNotMatch(found, /new3@example\.com/);
    assert.match(await (await get('/admin?q=%25', { cookie: admin })).text(), /No accounts match this search/, '% is searched literally');

    assert.match(await (await post('/admin/role', { id: idOf('new2@example.com'), role: 'admin' }, { cookie: admin })).text(), /is now an administrator/);
    assert.equal(store.userByEmail('new2@example.com').role, 'admin');
    await post('/admin/role', { id: idOf('new2@example.com'), role: 'user' }, { cookie: admin });
    assert.equal(store.userByEmail('new2@example.com').role, 'user');
    assert.match(await (await post('/admin/reset', { id: idOf('new1@example.com') }, { cookie: admin })).text(), /A new-password link was sent to new1@example\.com/);
    await post('/admin/signout', { id: idOf('new1@example.com') }, { cookie: admin });
    assert.equal((await me(userSession)).signedIn, false, 'signed out by the admin');
    assert.equal((await post('/admin/delete', { id: idOf('admin@example.com') }, { cookie: admin })).status, 400, 'not their own account');
    assert.equal((await post('/admin/role', { id: idOf('admin@example.com'), role: 'user' }, { cookie: admin })).status, 400);
    assert.equal((await post('/admin/role', { id: idOf('new2@example.com'), role: 'admin' }, { cookie: admin, headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);

    const target = idOf('new3@example.com');
    assert.match(await (await get(`/admin/user/${target}`, { cookie: admin })).text(), /MS-60B\+ patches \(0\)/);
    assert.equal((await (await get(`/admin/user/${target}/export`, { cookie: admin })).json()).account.email, 'new3@example.com');
    assert.equal((await get(`/admin/user/${target}`, { cookie: userSession })).headers.get('location'), `/login?next=%2Fadmin%2Fuser%2F${target}`);
    assert.match(await (await get(`/admin?delete=${target}`, { cookie: admin })).text(), /Delete the account of <b>new3@example\.com<\/b>/);
    assert.match(await (await post('/admin/delete', { id: target }, { cookie: admin })).text(), /The account of new3@example\.com has been deleted/);
    assert.equal(store.userById(target), null);
    const log = await (await get('/admin', { cookie: admin })).text();
    for (const action of ['make admin', 'remove admin', 'reset link', 'sign out everywhere', 'download data', 'delete account new3@example.com']) assert.match(log, new RegExp(action));
    store.close();
  });

  await test('the account page: password change, export, sign out everywhere, delete', async () => {
    assert.equal((await get('/account')).headers.get('location'), '/login?next=/account', 'signed out: sign in first');
    const email = 'page@example.com';
    let session = sessionOf(await post('/register', { email, password: PASSWORD }));
    const other = sessionOf(await post('/login', { email, password: PASSWORD }));
    const page = await (await get('/account', { cookie: session })).text();
    assert.match(page, /page@example\.com/);
    assert.match(page, /0 MS-60B\+ patches/);
    assert.match(page, /<!--email_off-->[\s\S]*page@example\.com[\s\S]*<!--\/email_off-->/, 'the email is marked so that Cloudflare does not hide it');
    assert.equal((await post('/account/password', { current: 'wrong password', password: 'brand new password' }, { cookie: session })).status, 400);
    const changed = await post('/account/password', { current: PASSWORD, password: 'brand new password' }, { cookie: session });
    assert.equal(changed.headers.get('location'), '/account?done=password');
    session = sessionOf(changed);
    assert.equal((await me(session)).signedIn, true, 'this browser stays signed in');
    assert.equal((await me(other)).signedIn, false, 'the other devices are signed out');
    await fetch(`${base}/api/account/sync/ms60b`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: session },
      body: JSON.stringify({ patches: [{ id: 'p1', name: 'MINE', effects: [], updatedAt: new Date().toISOString() }], deleted: {}, docs: { view: { data: 'grid', updatedAt: new Date().toISOString() } } }) });
    const exported = await get('/account/export', { cookie: session });
    assert.match(exported.headers.get('content-disposition'), /attachment; filename="zoom-patch-studio-/);
    const data = await exported.json();
    assert.equal(data.account.email, email);
    assert.deepEqual(data.pedals.ms60b.patches.map(p => p.name), ['MINE']);
    assert.equal(data.pedals.ms60b.docs.view.data, 'grid');
    assert.equal((await get('/account/export')).status, 401);
    const second = sessionOf(await post('/login', { email, password: 'brand new password' }));
    await post('/account/signout-everywhere', {}, { cookie: second });
    assert.equal((await me(session)).signedIn, false, 'signed out everywhere');
    session = sessionOf(await post('/login', { email, password: 'brand new password' }));
    assert.equal((await post('/account/delete', { password: 'wrong password' }, { cookie: session })).status, 400);
    const deleted = await post('/account/delete', { password: 'brand new password' }, { cookie: session });
    assert.equal(deleted.status, 200);
    assert.match(deleted.headers.get('set-cookie'), /Max-Age=0/);
    assert.equal((await me(session)).signedIn, false);
    assert.equal((await post('/login', { email, password: 'brand new password' })).status, 401, 'the account is gone');
    const store = openDb(join(dataDir, 'studio.db'));
    assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM patches WHERE id = ?').get('p1').n, 0, 'its patches are gone too');
    store.close();
  });

  await test('the daily backup copies the live database into a private archive', async () => {
    const backupDir = join(dataDir, 'backups');
    const run = promisify(execFile);
    const { stdout } = await run('sh', [deploy('backup-data.sh')], { env: { ...process.env, APP_DIR: fileURLToPath(new URL('../deploy', import.meta.url)), DATA_DIR: dataDir, BACKUP_DIR: backupDir, NODE: process.execPath } });
    assert.match(stdout, /backup written to .*data-\d{4}-\d{2}-\d{2}\.tar\.gz/);
    const [archive] = await readdir(backupDir);
    assert.equal((await stat(join(backupDir, archive))).mode & 0o077, 0, 'only the owner can read it');
    const restored = join(dataDir, 'restored');
    await mkdir(restored);
    await run('tar', ['-xzf', join(backupDir, archive), '-C', restored]);
    const live = openDb(join(dataDir, 'studio.db'));
    const copy = openDb(join(restored, 'studio.db'));
    const count = store => store.db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
    assert.ok(count(copy) > 5);
    assert.equal(count(copy), count(live));
    live.close();
    copy.close();
    await assert.rejects(run('sh', [deploy('backup-data.sh')], { env: { ...process.env, APP_DIR: fileURLToPath(new URL('../deploy', import.meta.url)), DATA_DIR: join(dataDir, 'nothing'), BACKUP_DIR: backupDir, NODE: process.execPath } }), 'no database: the script fails');
  });

  await test('Report a problem: the message reaches Telegram with its account, page and details; bad input and floods are refused', async () => {
    // Notices are written in the background, in files named by the millisecond: look for the report by what it says, not by its position
    const names = async () => (await readdir(telegramDir)).sort();
    const seen = new Set(await names());
    const waitFor = async test => {
      for (let i = 0; i < 60; i++) {
        for (const name of await names()) {
          if (seen.has(name)) continue;
          const text = await readFile(join(telegramDir, name), 'utf8');
          if (test(text)) { seen.add(name); return text; }
        }
        await new Promise(ok => setTimeout(ok, 50));
      }
      throw new Error('the notice did not arrive');
    };
    const isReport = text => /^(Problem report|Message from) /.test(text);
    const report = (fields, options) => post('/api/report', fields, options);
    const delivered = async (fields, options) => { const response = await report(fields, options); assert.equal(response.status, 200); return waitFor(isReport); };

    assert.equal(await delivered({ name: ' Bass\nPlayer ', email: 'bass@example.com', message: 'The  chain\r\nlost an effect\x07', page: '/builder.html?x=1', info: 'Zoom MS-60B+ · window 1280×800' }),
      'Problem report from ZOOM MultiStomp Studio\nFrom: Bass Player <bass@example.com> (not signed in)\nPage: /builder.html?x=1\n\nThe  chain\nlost an effect\n\n---\nZoom MS-60B+ · window 1280×800');

    const session = sessionOf(await post('/register', { email: 'reporter@example.com', password: PASSWORD }));
    await waitFor(text => /^New user signed up[\s\S]*reporter@example\.com/.test(text)); // the sign-up notice of this account
    assert.equal(await delivered({ message: 'Hello' }, { cookie: session }), 'Problem report from ZOOM MultiStomp Studio\nFrom: (no name) (account reporter@example.com)\n\nHello');

    assert.equal((await delivered({ message: 'q'.repeat(5000) })).match(/q+/)[0].length, 3000, 'the message is cut at 3000 characters');
    assert.equal((await delivered({ message: '€'.repeat(3000) })).match(/€+/)[0].length, 3000, 'a long message of 3-byte characters still fits');

    const empty = await report({ name: 'x', message: ' \n ' });
    assert.equal(empty.status, 400);
    assert.deepEqual(await empty.json(), { error: 'Write your message.' });
    assert.equal((await report({ message: 'Hi', email: 'not an email' })).status, 400);
    assert.equal((await report({ message: 'a'.repeat(60_000) })).status, 413, 'a huge body is refused');
    const foreign = await report({ message: 'Hi' }, { headers: { 'Sec-Fetch-Site': 'cross-site' } });
    assert.equal(foreign.status, 403, 'writes from another site are refused');
    assert.match(foreign.headers.get('content-type'), /json/);
    assert.equal((await get('/api/report')).status, 405);

    // Contact us (the MS-50G+ help page) needs an email address and has its own title
    const noReply = await report({ kind: 'contact', message: 'Two hours' });
    assert.equal(noReply.status, 400);
    assert.deepEqual(await noReply.json(), { error: 'Add your email address, so we can answer you.' });
    assert.equal((await report({ kind: 'contact', message: 'Two hours', email: 'nope' })).status, 400);
    assert.equal(await delivered({ kind: 'contact', name: 'Ann', email: 'ann@example.com', message: 'Two hours', page: '/ms-50g/help.html' }),
      'Message from ZOOM MultiStomp Studio (Contact us)\nFrom: Ann <ann@example.com> (not signed in)\nPage: /ms-50g/help.html\n\nTwo hours');
    assert.match(await delivered({ kind: 'anything else', message: 'Hi' }), /^Problem report from ZOOM MultiStomp Studio/, 'an unknown kind is a problem report');

    // Nothing that was refused reached Telegram: every report notice that exists was one of the deliveries above
    const reports = [];
    for (const name of await names()) { const text = await readFile(join(telegramDir, name), 'utf8'); if (isReport(text)) reports.push(text); }
    assert.equal(reports.length, 6, 'bass, Hello, q, €, Ann and the unknown kind, and nothing else');

    const ip = freshIp();
    for (let i = 0; i < 5; i++) assert.equal((await report({ message: `Flood ${i}` }, { ip })).status, 200);
    const flood = await report({ message: 'One more' }, { ip });
    assert.equal(flood.status, 429, '5 reports per address in 15 minutes');
    assert.match((await flood.json()).error, /Too many reports/);
  });

  await test('the MS-60B+ pages are in /ms-60b/; the old addresses are small pages that send the browser there (not redirects, so a returning visitor\'s service worker can store them)', async () => {
    for (const path of ['/ms-60b/', '/ms-60b/index.html', '/ms-60b/builder.html', '/ms-60b/technical-notes.md', '/ms-60b/effects-data.js', '/ms-50g/', '/privacy.html']) assert.equal((await get(path)).status, 200, path);
    const goesTo = async (path, target) => {
      const response = await get(path);
      assert.equal(response.status, 200, `${path} is a page`);
      assert.match(await response.text(), new RegExp(`location\\.replace\\('${target.replace(/[./]/g, '\\$&')}' \\+ location\\.search \\+ location\\.hash\\)`), `${path} leads to ${target} and keeps the query and the fragment`);
    };
    await goesTo('/', 'ms-60b/');
    await goesTo('/index.html', 'ms-60b/');
    for (const name of ['builder', 'tones', 'pedal-manager', 'resources', 'technical-notes', 'guide']) await goesTo(`/${name}.html`, `ms-60b/${name}.html`);
    await goesTo('/usb.html', 'ms-60b/pedal-manager.html');
    const notes = await get('/technical-notes.md');
    assert.deepEqual([notes.status, notes.headers.get('location')], [301, '/ms-60b/technical-notes.md'], 'the text file of a cached old page is redirected');
    assert.equal((await get('/ms-60b')).status, 301, 'a folder without its slash goes to the folder');
  });

  await test('the static site works next to the accounts; the old sync codes answer 410', async () => {
    assert.equal((await get('/ms-60b/builder.html')).status, 200);
    const sync = await fetch(`${base}/api/sync/${hashToken('sync')}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(sync.status, 410);
  });

  console.log(`\n${passed} tests passed`);
} finally {
  server.kill();
  await rm(dataDir, { recursive: true, force: true });
}
