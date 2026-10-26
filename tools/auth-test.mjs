// Tests for the accounts: SMTP client, tokens, and the sign-in flows of deploy/server.mjs (pages, cookies, CSRF, rate limits).
// Run: node tools/auth-test.mjs  (emails and Telegram notices go to temporary outbox folders)
import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { connect, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  const cfg = { host: '127.0.0.1', port: smtp.address().port, secure: false, user: 'sender@example.com', password: 'app pass', fromName: 'ZOOM Patch Studio' };
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
    assert.match(await readFile(join(telegramDir, notices[0]), 'utf8'), /New user signed up on ZOOM Patch Studio\nEmail: Player@Example\.com\nName: Ron/);
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

  await test('the static site and the sync API still work next to the accounts', async () => {
    assert.equal((await get('/builder.html')).status, 200);
    const sync = await fetch(`${base}/api/sync/${hashToken('sync')}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patches: [], deleted: {} }) });
    assert.equal(sync.status, 200);
  });

  console.log(`\n${passed} tests passed`);
} finally {
  server.kill();
  await rm(dataDir, { recursive: true, force: true });
}
