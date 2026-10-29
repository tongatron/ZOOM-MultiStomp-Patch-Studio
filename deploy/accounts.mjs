// Accounts for the ZOOM MultiStomp Patch Studio: sign-up, sign-in, password reset, email confirmation, sign-out, /api/me,
// the account page (/account: password, export, sign out everywhere, delete), the user console for admins (/admin) and
// "Report a problem" (POST /api/report: the message goes to the administrator's Telegram bot, see mail.mjs).
// The site stays open to everyone; an account only keeps the user's data on the server.
// Environment: DB_FILE (default DATA_DIR/studio.db), SESSION_SECRET (64 hex; otherwise one is generated and kept in the
// database), SITE_URL (links in emails, see site-url.mjs), MAIL_FILE / TELEGRAM_FILE (see mail.mjs).

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  EMAIL_RE, MIN_PASSWORD, SESSION_COOKIE, SESSION_DAYS, checkPassword, cleanEmail, cleanName, crossSite, fakeCheck, hashPassword,
  hashToken, isHttps, makeSession, newToken, newUserId, passwordProblem, rateLimiter, readCookie, safeNext, sessionCookie, sessionUser
} from './auth.mjs';
import { adminPage, adminUserPage } from './admin-pages.mjs';
import { openDb } from './db.mjs';
import { mailConfig, mailHtml, sendMail, sendTelegram, telegramConfig } from './mail.mjs';
import { SITE_URL } from './site-url.mjs';
import { accountPage, forgotPage, loginPage, logoutPage, messagePage, registerPage, resetPage } from './pages.mjs';

const RESET_TTL = 3600; // seconds
const VERIFY_TTL = 24 * 3600;
const MAX_FORM = 16_384;
const MAX_REPORT_FORM = 48_000; // a report of 3000 characters can grow to 9 bytes per character once percent-encoded
// Per 15 minutes: failed sign-ins per address and per email, sign-ups, reset requests, token links, problem reports
const LIMITS = { login: 10, loginEmail: 5, register: 5, forgot: 5, forgotEmail: 3, token: 20, report: 5 };
const PAGE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer', // reset links carry their token in the URL
  'Content-Security-Policy': "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
};

export const clientIp = request => request.headers['cf-connecting-ip'] || String(request.headers['x-forwarded-for'] || '').split(',')[0].trim() || request.socket.remoteAddress;

export function createAccounts({ dataDir }) {
  const dbFile = process.env.DB_FILE || join(dataDir, 'studio.db');
  const store = openDb(dbFile);
  const siteUrl = SITE_URL;
  let secretHex = process.env.SESSION_SECRET || store.meta('session_secret');
  if (!/^[a-f0-9]{64}$/.test(secretHex || '')) {
    if (process.env.SESSION_SECRET) throw new Error('SESSION_SECRET must be 64 hex characters');
    secretHex = newToken().hash; // 64 hex from 32 random bytes
    store.setMeta('session_secret', secretHex);
  }
  const secret = Buffer.from(secretHex, 'hex');
  const limits = rateLimiter(LIMITS);
  store.purgeTokens();
  setInterval(() => store.purgeTokens(), 3600_000).unref();

  // ---- helpers ----------------------------------------------------------------------------------
  const current = request => sessionUser(secret, readCookie(request.headers.cookie, SESSION_COOKIE), store.userById);
  const signIn = (request, user) => sessionCookie(makeSession(secret, user), SESSION_DAYS * 86400, isHttps(request.headers));
  const html = (response, status, body, headers = {}) => { response.writeHead(status, { ...PAGE_HEADERS, ...headers }); response.end(body); };
  const redirect = (response, location, headers = {}) => { response.writeHead(303, { Location: location, 'Cache-Control': 'no-store', ...headers }); response.end(); };
  const json = (response, status, data, headers = {}) => {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
    response.end(JSON.stringify(data));
  };
  const tooManyPage = response => html(response, 429, messagePage('Too many attempts', 'Too many attempts. Try again in a few minutes.'));

  async function readForm(request, limit = MAX_FORM) {
    let size = 0;
    const chunks = [];
    for await (const chunk of request) {
      size += chunk.length;
      if (size > limit) { const big = new Error('too large'); big.status = 413; throw big; }
      chunks.push(chunk);
    }
    return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString('utf8')));
  }

  function welcome(user, token) {
    const url = `${siteUrl}/verify?token=${token}`;
    const hello = user.name ? `Hi ${user.name}, welcome` : 'Welcome';
    sendMail(user.email, 'Welcome to ZOOM Patch Studio',
      `${hello} to ZOOM MultiStomp Patch Studio!\n\nYour account is ready: your patches are now kept in your account.\n\n` +
      `Confirm your email address (optional, link valid for 24 hours):\n${url}\n\nSite: ${siteUrl}/\n`,
      mailHtml({ title: `${hello}!`, intro: 'Your account is ready: your patches are now kept in your account. Please confirm your email address, so you can always reset your password.',
        button: 'Confirm your email', url, outro: "If you didn't create this account, ignore this email." }));
  }

  function resetMail(user, token) {
    const url = `${siteUrl}/reset?token=${token}`;
    sendMail(user.email, 'ZOOM Patch Studio: new password',
      `To choose a new password open this link (valid for one hour, it works only once):\n${url}\n\n` +
      "If you didn't ask for this, ignore this email: your password stays the same.\n",
      mailHtml({ title: 'Choose a new password', intro: 'Use the button below to choose a new password. The link is valid for one hour and works only once.',
        button: 'Choose a new password', url, outro: "If you didn't ask for this, ignore this email: your password stays the same." }));
  }

  const patchCounts = userId => Object.fromEntries(store.db.prepare('SELECT pedal, COUNT(*) AS n FROM patches WHERE user_id = ? AND deleted_at IS NULL GROUP BY pedal').all(userId).map(r => [r.pedal, r.n]));
  function exportData(user) {
    const pedals = {};
    for (const row of store.db.prepare('SELECT pedal, data FROM patches WHERE user_id = ? AND deleted_at IS NULL ORDER BY pedal, pos').all(user.id)) {
      (pedals[row.pedal] ||= { patches: [], docs: {} }).patches.push(JSON.parse(row.data));
    }
    for (const row of store.db.prepare('SELECT pedal, kind, data, updated_at FROM docs WHERE user_id = ?').all(user.id)) {
      (pedals[row.pedal] ||= { patches: [], docs: {} }).docs[row.kind] = { data: JSON.parse(row.data), updatedAt: row.updated_at };
    }
    return { format: 'zoom-patch-studio-account', exportedAt: new Date().toISOString(),
      account: { email: user.email, name: user.name, createdAt: user.created_at, emailConfirmedAt: user.email_verified_at }, pedals };
  }

  // ---- user console (admins only) --------------------------------------------------------------
  const BACKUP_DIR = process.env.BACKUP_DIR || '/srv/apps/zoom-ms60b-backups';
  const SORTS = { email: 'u.email', name: 'u.name', created: 'u.created_at', login: 'u.last_login', ms60b: 'ms60b', ms50g: 'ms50g', change: 'last_change' };
  const countOf = pedal => `(SELECT COUNT(*) FROM patches p WHERE p.user_id = u.id AND p.pedal = '${pedal}' AND p.deleted_at IS NULL)`;
  const USERS_SQL = `SELECT u.*, ${countOf('ms60b')} AS ms60b, ${countOf('ms50g')} AS ms50g,
    MAX(COALESCE((SELECT MAX(updated_at) FROM patches WHERE user_id = u.id), ''), COALESCE((SELECT MAX(updated_at) FROM docs WHERE user_id = u.id), '')) AS last_change
    FROM users u WHERE (u.email LIKE :q ESCAPE '\\' OR u.name LIKE :q ESCAPE '\\')`;
  const logAdmin = (admin, action, target) => store.db.prepare('INSERT INTO admin_log (at, admin_id, action, target_id) VALUES (?, ?, ?, ?)')
    .run(new Date().toISOString(), admin.id, action, target?.id ?? null);

  function adminOnly(request, response, next = '/admin') {
    const session = current(request);
    if (!session) { redirect(response, `/login?next=${encodeURIComponent(next)}`); return null; }
    if (session.user.role !== 'admin') { html(response, 403, messagePage('Administrators only', 'This page is for the administrators of the site.')); return null; }
    return session.user;
  }

  function serviceState() {
    const mail = mailConfig();
    let backup = null;
    try {
      for (const name of readdirSync(BACKUP_DIR)) {
        const at = statSync(join(BACKUP_DIR, name)).mtimeMs;
        if (!backup || at > backup.at) backup = { name, at };
      }
    } catch {}
    return { mail: mail && !process.env.MAIL_OUTBOX ? mail.user : mail ? 'outbox (test)' : '', telegram: !!telegramConfig(), backup };
  }

  function showAdmin(response, me, { status = 200, query = '', sort = 'created', dir = 'desc', ...rest } = {}) {
    if (!SORTS[sort]) sort = 'created';
    dir = dir === 'asc' ? 'asc' : 'desc';
    const like = `%${query.replace(/[\\%_]/g, c => `\\${c}`)}%`;
    const users = store.db.prepare(`${USERS_SQL} ORDER BY ${SORTS[sort]} ${dir}, u.email LIMIT 500`).all({ q: like });
    const since = days => new Date(Date.now() - days * 864e5).toISOString();
    const one = (sql, ...args) => Object.values(store.db.prepare(sql).get(...args))[0];
    const fileSize = file => { try { return statSync(file).size; } catch { return 0; } };
    const stats = {
      users: one('SELECT COUNT(*) FROM users'), new7: one('SELECT COUNT(*) FROM users WHERE created_at >= ?', since(7)),
      new30: one('SELECT COUNT(*) FROM users WHERE created_at >= ?', since(30)), active30: one('SELECT COUNT(*) FROM users WHERE last_login >= ?', since(30)),
      ms60b: one("SELECT COUNT(*) FROM patches WHERE pedal = 'ms60b' AND deleted_at IS NULL"), ms50g: one("SELECT COUNT(*) FROM patches WHERE pedal = 'ms50g' AND deleted_at IS NULL"),
      dbBytes: fileSize(dbFile) + fileSize(`${dbFile}-wal`)
    };
    const log = store.db.prepare(`SELECT l.*, a.email AS admin_email, t.email AS target_email FROM admin_log l
      LEFT JOIN users a ON a.id = l.admin_id LEFT JOIN users t ON t.id = l.target_id ORDER BY l.at DESC LIMIT 100`).all();
    html(response, status, adminPage({ me, stats, users, query, sort, dir, service: serviceState(), log, ...rest }));
  }

  // The account an admin action is about; never the admin's own (so an admin cannot lock themselves out)
  function adminTarget(response, me, id) {
    const target = typeof id === 'string' ? store.userById(id) : null;
    if (!target) { showAdmin(response, me, { status: 404, error: 'This account does not exist (any more).' }); return null; }
    if (target.id === me.id) { showAdmin(response, me, { status: 400, error: 'You cannot do this to your own account.' }); return null; }
    return target;
  }

  const adminRoutes = {
    'GET /admin': (request, response, url) => {
      const me = adminOnly(request, response);
      if (!me) return;
      const p = url.searchParams;
      const confirmId = p.get('delete');
      const confirm = confirmId && confirmId !== me.id ? store.db.prepare(`${USERS_SQL} AND u.id = :id`).get({ q: '%', id: confirmId }) : null;
      showAdmin(response, me, { query: (p.get('q') || '').slice(0, 100), sort: p.get('sort') || 'created', dir: p.get('dir') || 'desc', confirm });
    },
    'GET /admin/user': (request, response, url) => {
      const me = adminOnly(request, response, url.pathname);
      if (!me) return;
      const user = store.userById(url.adminTarget);
      if (!user) return html(response, 404, messagePage('Not found', 'This account does not exist (any more).', '/admin', 'Back to the users'));
      html(response, 200, adminUserPage({ user, pedals: Object.fromEntries(Object.entries(exportData(user).pedals).map(([pedal, d]) => [pedal, d.patches])) }));
    },
    'GET /admin/user/export': (request, response, url) => {
      const me = adminOnly(request, response);
      if (!me) return;
      const user = store.userById(url.adminTarget);
      if (!user) return json(response, 404, { error: 'not found' });
      logAdmin(me, 'download data', user);
      json(response, 200, exportData(user), { 'Content-Disposition': `attachment; filename="zoom-patch-studio-${user.id.slice(0, 8)}.json"` });
    },
    'POST /admin/reset': (request, response, form) => {
      const me = adminOnly(request, response);
      const target = me && adminTarget(response, me, form.id);
      if (!target) return;
      store.dropTokens(target.id, 'reset');
      const { token, hash } = newToken();
      store.addToken(hash, target.id, 'reset', RESET_TTL);
      logAdmin(me, 'reset link', target);
      if (mailConfig()) { resetMail(target, token); return showAdmin(response, me, { note: `A new-password link was sent to ${target.email}.` }); }
      showAdmin(response, me, { note: `Email is not configured: send this link to ${target.email} yourself (valid for one hour, works once).`, link: `${siteUrl}/reset?token=${token}` });
    },
    'POST /admin/signout': (request, response, form) => {
      const me = adminOnly(request, response);
      const target = me && adminTarget(response, me, form.id);
      if (!target) return;
      store.signOutEverywhere(target.id);
      logAdmin(me, 'sign out everywhere', target);
      showAdmin(response, me, { note: `${target.email} is signed out on every device.` });
    },
    'POST /admin/role': (request, response, form) => {
      const me = adminOnly(request, response);
      const target = me && adminTarget(response, me, form.id);
      if (!target) return;
      const role = form.role === 'admin' ? 'admin' : 'user';
      store.setRole(target.id, role);
      logAdmin(me, role === 'admin' ? 'make admin' : 'remove admin', target);
      showAdmin(response, me, { note: `${target.email} is now ${role === 'admin' ? 'an administrator' : 'a normal user'}.` });
    },
    'POST /admin/delete': (request, response, form) => {
      const me = adminOnly(request, response);
      const target = me && adminTarget(response, me, form.id);
      if (!target) return;
      logAdmin(me, `delete account ${target.email}`, target);
      store.removeUser(target.id);
      showAdmin(response, me, { note: `The account of ${target.email} has been deleted.` });
    },
    'POST /admin/test-mail': (request, response) => {
      const me = adminOnly(request, response);
      if (!me) return;
      const sent = sendMail(me.email, 'ZOOM Patch Studio: test email', 'If you can read this, the emails of ZOOM Patch Studio work.',
        mailHtml({ title: 'Test email', intro: 'If you can read this, the emails of ZOOM Patch Studio work.' }));
      logAdmin(me, 'test email', me);
      showAdmin(response, me, sent ? { note: `Test email sent to ${me.email}: check the inbox (and the service log if it does not arrive).` } : { status: 503, error: 'Email is not configured.' });
    }
  };

  // ---- routes -----------------------------------------------------------------------------------
  const routes = {
    'GET /login': (request, response, url) => {
      const next = safeNext(url.searchParams.get('next'));
      if (current(request)) return redirect(response, next);
      html(response, 200, loginPage({ next }));
    },
    'POST /login': async (request, response, form, ip) => {
      const email = cleanEmail(form.email);
      const next = safeNext(form.next);
      const key = email.toLowerCase();
      if (limits.tooMany('login', ip) || limits.tooMany('loginEmail', key)) {
        return html(response, 429, loginPage({ error: 'Too many attempts. Try again in a few minutes.', email, next }));
      }
      const user = email ? store.userByEmail(email) : null;
      const ok = user ? await checkPassword(user, String(form.password || '')) : await fakeCheck(String(form.password || ''));
      if (!ok) {
        limits.note('login', ip);
        limits.note('loginEmail', key);
        await sleep(400);
        return html(response, 401, loginPage({ error: 'Incorrect email address or password.', email, next }));
      }
      store.touchLogin(user.id);
      redirect(response, next, { 'Set-Cookie': signIn(request, user) });
    },
    'GET /register': (request, response, url) => {
      const next = safeNext(url.searchParams.get('next'));
      if (current(request)) return redirect(response, next);
      html(response, 200, registerPage({ next, minPassword: MIN_PASSWORD }));
    },
    'POST /register': async (request, response, form, ip) => {
      const email = cleanEmail(form.email);
      const name = cleanName(form.name);
      const next = safeNext(form.next);
      const password = String(form.password || '');
      const again = (status, error) => html(response, status, registerPage({ error, email, name, next, minPassword: MIN_PASSWORD }));
      if (limits.tooMany('register', ip)) return again(429, 'Too many sign-ups from this network. Try again in a few minutes.');
      if (!EMAIL_RE.test(email)) return again(400, 'Enter a valid email address.');
      const problem = passwordProblem(password);
      if (problem) return again(400, problem);
      const taken = 'An account with this email address already exists: sign in, or reset your password if you forgot it.';
      if (store.userByEmail(email)) return again(409, taken);
      let user;
      try { user = store.createUser({ id: newUserId(), email, name, hashed: await hashPassword(password) }); }
      catch (error) { if (String(error.message).includes('UNIQUE')) return again(409, taken); throw error; }
      limits.note('register', ip);
      const { token, hash } = newToken();
      store.addToken(hash, user.id, 'verify', VERIFY_TTL);
      welcome(user, token);
      sendTelegram(`New user signed up on ZOOM Patch Studio\nEmail: ${user.email}${user.name ? `\nName: ${user.name}` : ''}\nDate: ${user.created_at}`);
      redirect(response, next, { 'Set-Cookie': signIn(request, user) });
    },
    'GET /forgot': (request, response) => html(response, 200, forgotPage()),
    'POST /forgot': async (request, response, form, ip) => {
      const email = cleanEmail(form.email);
      const key = email.toLowerCase();
      if (limits.tooMany('forgot', ip) || limits.tooMany('forgotEmail', key)) {
        return html(response, 429, forgotPage({ error: 'Too many requests. Try again in a few minutes.', email }));
      }
      limits.note('forgot', ip);
      limits.note('forgotEmail', key);
      if (!mailConfig()) return html(response, 503, forgotPage({ error: 'Password recovery by email is not active: ask the site administrator.', email }));
      const user = EMAIL_RE.test(email) ? store.userByEmail(email) : null;
      if (user) {
        store.dropTokens(user.id, 'reset');
        const { token, hash } = newToken();
        store.addToken(hash, user.id, 'reset', RESET_TTL);
        resetMail(user, token);
      }
      html(response, 200, forgotPage({ done: true })); // the same answer whether the account exists or not
    },
    'GET /reset': (request, response, url, ip) => {
      if (limits.tooMany('token', ip)) return tooManyPage(response);
      limits.note('token', ip);
      const token = url.searchParams.get('token') || '';
      const user = store.tokenUser(hashToken(token), 'reset');
      html(response, user ? 200 : 400, resetPage({ token, email: user?.email, minPassword: MIN_PASSWORD }));
    },
    'POST /reset': async (request, response, form, ip) => {
      if (limits.tooMany('token', ip)) return tooManyPage(response);
      limits.note('token', ip);
      const token = String(form.token || '');
      const user = store.tokenUser(hashToken(token), 'reset');
      if (!user) return html(response, 400, resetPage());
      const problem = passwordProblem(String(form.password || ''));
      if (problem) return html(response, 400, resetPage({ token, email: user.email, error: problem, minPassword: MIN_PASSWORD }));
      const hashed = await hashPassword(String(form.password));
      if (!store.tokenUser(hashToken(token), 'reset', true)) return html(response, 400, resetPage()); // used meanwhile
      store.setPassword(user.id, hashed); // closes the sessions on every other device
      store.dropTokens(user.id, 'reset');
      store.markVerified(user.id); // the link reached the inbox: the address works
      store.touchLogin(user.id);
      redirect(response, '/', { 'Set-Cookie': signIn(request, store.userById(user.id)) });
    },
    'GET /verify': (request, response, url, ip) => {
      if (limits.tooMany('token', ip)) return tooManyPage(response);
      limits.note('token', ip);
      const user = store.tokenUser(hashToken(url.searchParams.get('token') || ''), 'verify', true);
      if (!user) return html(response, 400, messagePage('Link not valid', 'This confirmation link is invalid, already used or expired (it is valid for 24 hours).'));
      store.markVerified(user.id);
      html(response, 200, messagePage('Email confirmed', `Thank you: ${user.email} is confirmed.`, '/', 'Open the site'));
    },
    'GET /logout': (request, response, url) => html(response, 200, logoutPage(safeNext(url.searchParams.get('next')))),
    'POST /logout': (request, response, form) => redirect(response, safeNext(form.next), { 'Set-Cookie': sessionCookie('', 0, isHttps(request.headers)) }),
    'GET /account': (request, response, url) => {
      const session = current(request);
      if (!session) return redirect(response, '/login?next=/account');
      html(response, 200, accountPage({ user: session.user, counts: patchCounts(session.user.id), done: url.searchParams.get('done') || '', minPassword: MIN_PASSWORD }));
    },
    'POST /account/password': async (request, response, form) => {
      const session = current(request);
      if (!session) return redirect(response, '/login?next=/account');
      const { user } = session;
      const key = user.email.toLowerCase();
      const again = (status, error) => html(response, status, accountPage({ user, counts: patchCounts(user.id), error, minPassword: MIN_PASSWORD }));
      if (limits.tooMany('loginEmail', key)) return again(429, 'Too many attempts. Try again in a few minutes.');
      if (!(await checkPassword(user, String(form.current || '')))) { limits.note('loginEmail', key); return again(400, 'The current password is not correct.'); }
      const problem = passwordProblem(String(form.password || ''));
      if (problem) return again(400, problem);
      store.setPassword(user.id, await hashPassword(String(form.password)));
      redirect(response, '/account?done=password', { 'Set-Cookie': signIn(request, store.userById(user.id)) });
    },
    'POST /account/verify': (request, response) => {
      const session = current(request);
      if (!session) return redirect(response, '/login?next=/account');
      const key = session.user.email.toLowerCase();
      if (limits.tooMany('forgotEmail', key)) return tooManyPage(response);
      limits.note('forgotEmail', key);
      store.dropTokens(session.user.id, 'verify');
      const { token, hash } = newToken();
      store.addToken(hash, session.user.id, 'verify', VERIFY_TTL);
      welcome(session.user, token);
      redirect(response, '/account?done=verify');
    },
    'POST /account/signout-everywhere': (request, response) => {
      const session = current(request);
      if (session) store.signOutEverywhere(session.user.id);
      redirect(response, '/login', { 'Set-Cookie': sessionCookie('', 0, isHttps(request.headers)) });
    },
    'GET /account/export': (request, response) => {
      const session = current(request);
      if (!session) return json(response, 401, { error: 'sign in first' });
      const date = new Date().toISOString().slice(0, 10);
      json(response, 200, exportData(session.user), { 'Content-Disposition': `attachment; filename="zoom-patch-studio-${date}.json"` });
    },
    'POST /account/delete': async (request, response, form) => {
      const session = current(request);
      if (!session) return redirect(response, '/login?next=/account');
      const { user } = session;
      const key = user.email.toLowerCase();
      const again = (status, error) => html(response, status, accountPage({ user, counts: patchCounts(user.id), error, minPassword: MIN_PASSWORD }));
      if (limits.tooMany('loginEmail', key)) return again(429, 'Too many attempts. Try again in a few minutes.');
      if (!(await checkPassword(user, String(form.password || '')))) { limits.note('loginEmail', key); return again(400, 'The password is not correct: the account was not deleted.'); }
      store.removeUser(user.id);
      html(response, 200, messagePage('Account deleted', 'Your account and everything kept in it have been deleted. Patches stored in your browsers stay there.'),
        { 'Set-Cookie': sessionCookie('', 0, isHttps(request.headers)) });
    },
    // "Report a problem": open to everyone, answered in JSON. The message goes to the Telegram bot (nothing is stored here).
    'POST /api/report': async (request, response, form, ip) => {
      if (limits.tooMany('report', ip)) return json(response, 429, { error: 'Too many reports from this network. Try again in a few minutes.' });
      const line = (key, max) => String(form[key] || '').replace(/[\x00-\x1f\x7f\s]+/g, ' ').trim().slice(0, max);
      const message = String(form.message || '').replace(/\r\n?/g, '\n').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').trim().slice(0, 3000);
      const name = line('name', 80);
      const email = line('email', 200);
      const page = line('page', 300);
      const info = line('info', 600);
      if (!message) return json(response, 400, { error: 'Write your message.' });
      if (email && !EMAIL_RE.test(email)) return json(response, 400, { error: 'The email address does not look valid.' });
      limits.note('report', ip);
      const session = current(request);
      const text = ['Problem report from ZOOM Patch Studio',
        `From: ${[name || '(no name)', email && `<${email}>`].filter(Boolean).join(' ')} (${session ? `account ${session.user.email}` : 'not signed in'})`,
        ...(page ? [`Page: ${page}`] : []), '', message, ...(info ? ['', '---', info] : [])].join('\n');
      if (await sendTelegram(text)) return json(response, 200, { ok: true });
      json(response, 503, { error: 'Reports are not available right now. Please open an issue on GitHub instead.' });
    },
    'GET /api/me': (request, response) => {
      const session = current(request);
      if (!session) return json(response, 200, { signedIn: false });
      const { user, expires } = session;
      // A session used in its last week is renewed for another 30 days
      const renew = expires - Date.now() < 7 * 864e5 ? { 'Set-Cookie': signIn(request, user) } : {};
      json(response, 200, { signedIn: true, email: user.email, name: user.name, verified: !!user.email_verified_at, admin: user.role === 'admin' }, renew);
    }
  };

  Object.assign(routes, adminRoutes);

  // Answers the request if it belongs to the accounts and returns true; false lets the server go on.
  async function handle(request, response, url) {
    const method = request.method === 'HEAD' ? 'GET' : request.method;
    let path = url.pathname;
    const userPage = path.match(/^\/admin\/user\/([a-f0-9]{32})(\/export)?$/);
    if (userPage) { path = `/admin/user${userPage[2] || ''}`; url.adminTarget = userPage[1]; }
    const route = routes[`${method} ${path}`];
    if (!route) {
      if (!Object.keys(routes).some(key => key.endsWith(` ${path}`))) return false;
      response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Method not allowed');
      return true;
    }
    const ip = clientIp(request);
    if (method === 'GET') { await route(request, response, url, ip); return true; }
    if (crossSite(request.headers)) {
      if (path.startsWith('/api/')) json(response, 403, { error: 'This request came from another site and was refused.' });
      else html(response, 403, messagePage('Request refused', 'This request came from another site and was refused.'));
      return true;
    }
    await route(request, response, await readForm(request, path === '/api/report' ? MAX_REPORT_FORM : MAX_FORM), ip);
    return true;
  }

  return { handle, current, store };
}
