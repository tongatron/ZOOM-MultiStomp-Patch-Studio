// Passwords, sessions, one-time tokens, rate limits and request checks for the accounts.
// Same scheme as PatternMachine (server.py): PBKDF2 passwords, a stateless signed session cookie
// v2.<user id>.<password version>.<expiry>.<HMAC-SHA256>, tokens stored only as their SHA-256.

import { createHash, createHmac, pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const pbkdf2Async = promisify(pbkdf2);
export const ITERATIONS = Number(process.env.PBKDF2_ITER || 600_000);
export const SESSION_COOKIE = 'zms_session';
export const SESSION_DAYS = 30;
export const MIN_PASSWORD = 10;
export const MAX_PASSWORD = 200;
export const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]+\.[^@\s]+$/;

// ---- passwords ----------------------------------------------------------------------------------
export async function hashPassword(password, salt = randomBytes(16), iterations = ITERATIONS) {
  const digest = await pbkdf2Async(password, salt, iterations, 32, 'sha256');
  return { hash: digest.toString('hex'), salt: salt.toString('hex'), iterations };
}

export async function checkPassword(user, password) {
  const { hash } = await hashPassword(password, Buffer.from(user.pw_salt, 'hex'), user.pw_iter);
  return safeEqual(hash, user.pw_hash);
}

// Spends the same time as a real check, so an unknown email is not faster than a wrong password.
const DUMMY = { pw_salt: '00'.repeat(16), pw_iter: ITERATIONS, pw_hash: '' };
export const fakeCheck = password => checkPassword(DUMMY, password).then(() => false);

export function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) return `Choose a password of at least ${MIN_PASSWORD} characters.`;
  if (password.length > MAX_PASSWORD) return `The password can be at most ${MAX_PASSWORD} characters long.`;
  return '';
}

export const cleanEmail = email => String(email || '').trim().slice(0, 254);
export const cleanName = name => String(name || '').replace(/[\x00-\x1f\x7f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);

// ---- sessions -----------------------------------------------------------------------------------
const sign = (secret, payload) => createHmac('sha256', secret).update(payload).digest('hex');
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export function makeSession(secret, user, now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_DAYS * 86400;
  const payload = `v2.${user.id}.${user.pwv}.${expires}`;
  return `${payload}.${sign(secret, payload)}`;
}

// The user of a session cookie, or null. `findUser(id)` reads the account; a changed password version ends the session.
export function sessionUser(secret, value, findUser, now = Date.now()) {
  const parts = typeof value === 'string' ? value.split('.') : [];
  if (parts.length !== 5) return null;
  const [version, id, pwv, expires, sig] = parts;
  if (version !== 'v2' || !/^\d+$/.test(expires) || Number(expires) * 1000 <= now) return null;
  if (!safeEqual(sig, sign(secret, `${version}.${id}.${pwv}.${expires}`))) return null;
  const user = findUser(id);
  return user && String(user.pwv) === pwv ? { user, expires: Number(expires) * 1000 } : null;
}

// ---- one-time tokens (password reset, email confirmation) ---------------------------------------
export const hashToken = token => createHash('sha256').update(String(token)).digest('hex');
export function newToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}
export const newUserId = () => randomBytes(16).toString('hex');

// ---- rate limits (in memory, per action and key, sliding window) -------------------------------
export function rateLimiter(limits, windowMs = 15 * 60_000) {
  const hits = new Map();
  const recent = key => (hits.get(key) || []).filter(t => t > Date.now() - windowMs);
  setInterval(() => { for (const key of hits.keys()) { const r = recent(key); r.length ? hits.set(key, r) : hits.delete(key); } }, 60_000).unref();
  return {
    tooMany: (kind, key) => recent(`${kind}:${key}`).length >= limits[kind],
    note: (kind, key) => hits.set(`${kind}:${key}`, [...recent(`${kind}:${key}`), Date.now()])
  };
}

// ---- requests -----------------------------------------------------------------------------------
// Writes come only from the site's own pages: a request started by another site (CSRF) is refused.
// Behind the Cloudflare tunnel the Host may be the internal one, so Origin is compared only without Sec-Fetch-Site.
export function crossSite(headers) {
  const site = headers['sec-fetch-site'];
  if (site) return site !== 'same-origin' && site !== 'none';
  const origin = headers.origin;
  if (!origin) return false;
  try { return ![headers['x-forwarded-host'], headers.host].includes(new URL(origin).host); } catch { return true; }
}

// Only paths on this site: no "//other-site", no absolute URLs (open redirect).
export function safeNext(target) {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && !target.includes('\\') && target.length <= 500 ? target : '/';
}

export function readCookie(header, name) {
  for (const part of String(header || '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

export function sessionCookie(value, maxAgeSeconds, secure) {
  return [`${SESSION_COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`, ...(secure ? ['Secure'] : [])].join('; ');
}

export const isHttps = headers => headers['x-forwarded-proto'] === 'https' || String(headers['cf-visitor'] || '').includes('"https"');
