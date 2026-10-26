// Accounts for the ZOOM MultiStomp Patch Studio: sign-up, sign-in, password reset, email confirmation, sign-out, /api/me.
// The site stays open to everyone; an account only keeps the user's data on the server.
// Environment: DB_FILE (default DATA_DIR/studio.db), SESSION_SECRET (64 hex; otherwise one is generated and kept in the
// database), SITE_URL (links in emails), MAIL_FILE / TELEGRAM_FILE (see mail.mjs).

import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  EMAIL_RE, MIN_PASSWORD, SESSION_COOKIE, SESSION_DAYS, checkPassword, cleanEmail, cleanName, crossSite, fakeCheck, hashPassword,
  hashToken, isHttps, makeSession, newToken, newUserId, passwordProblem, rateLimiter, readCookie, safeNext, sessionCookie, sessionUser
} from './auth.mjs';
import { openDb } from './db.mjs';
import { mailConfig, mailHtml, sendMail, sendTelegram } from './mail.mjs';
import { forgotPage, loginPage, logoutPage, messagePage, registerPage, resetPage } from './pages.mjs';

const RESET_TTL = 3600; // seconds
const VERIFY_TTL = 24 * 3600;
const MAX_FORM = 16_384;
// Per 15 minutes: failed sign-ins per address and per email, sign-ups, reset requests, token links
const LIMITS = { login: 10, loginEmail: 5, register: 5, forgot: 5, forgotEmail: 3, token: 20 };
const PAGE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer', // reset links carry their token in the URL
  'Content-Security-Policy': "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
};

export const clientIp = request => request.headers['cf-connecting-ip'] || String(request.headers['x-forwarded-for'] || '').split(',')[0].trim() || request.socket.remoteAddress;

export function createAccounts({ dataDir }) {
  const store = openDb(process.env.DB_FILE || join(dataDir, 'studio.db'));
  const siteUrl = (process.env.SITE_URL || 'https://zoom.tongatron.org').replace(/\/$/, '');
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

  async function readForm(request) {
    let size = 0;
    const chunks = [];
    for await (const chunk of request) {
      size += chunk.length;
      if (size > MAX_FORM) { const big = new Error('too large'); big.status = 413; throw big; }
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
    'GET /api/me': (request, response) => {
      const session = current(request);
      if (!session) return json(response, 200, { signedIn: false });
      const { user, expires } = session;
      // A session used in its last week is renewed for another 30 days
      const renew = expires - Date.now() < 7 * 864e5 ? { 'Set-Cookie': signIn(request, user) } : {};
      json(response, 200, { signedIn: true, email: user.email, name: user.name, verified: !!user.email_verified_at, admin: user.role === 'admin' }, renew);
    }
  };

  // Answers the request if it belongs to the accounts and returns true; false lets the server go on.
  async function handle(request, response, url) {
    const method = request.method === 'HEAD' ? 'GET' : request.method;
    const route = routes[`${method} ${url.pathname}`];
    if (!route) {
      if (!Object.keys(routes).some(key => key.endsWith(` ${url.pathname}`))) return false;
      response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Method not allowed');
      return true;
    }
    const ip = clientIp(request);
    if (method === 'GET') { await route(request, response, url, ip); return true; }
    if (crossSite(request.headers)) {
      html(response, 403, messagePage('Request refused', 'This request came from another site and was refused.'));
      return true;
    }
    await route(request, response, await readForm(request), ip);
    return true;
  }

  return { handle, current, store };
}
