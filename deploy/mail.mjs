// Email (Gmail SMTP) and Telegram notices, configured like PatternMachine:
//   mail.json      { "user", "app_password", "from_name", "host", "port" }  written by deploy/set-mail.mjs (mode 600)
//                  or SMTP_USER / SMTP_PASS in the environment. Without it no email is sent (sign-up still works).
//   telegram.json  { "token", "chat_id" }  written by deploy/set-telegram.mjs, or TELEGRAM_TOKEN / TELEGRAM_CHAT.
//   MAIL_OUTBOX=<dir> / TELEGRAM_OUTBOX=<dir> write files instead of sending: for tests and local runs.
// Node has no SMTP client: smtpSend() is a minimal one (SMTPS on 465, AUTH LOGIN, one recipient), no dependencies.

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { connect as connectTcp } from 'node:net';
import { connect as connectTls } from 'node:tls';
import { join } from 'node:path';

const readJson = file => { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return {}; } };

export function mailConfig(file = process.env.MAIL_FILE) {
  const cfg = file ? readJson(file) : {};
  const user = process.env.SMTP_USER || cfg.user;
  const password = process.env.SMTP_PASS || cfg.app_password;
  if (!(user && password) && !process.env.MAIL_OUTBOX) return null;
  return {
    user: user || 'studio@localhost', password: password || '', fromName: cfg.from_name || 'ZOOM MultiStomp Studio',
    host: cfg.host || 'smtp.gmail.com', port: Number(cfg.port || 465), secure: cfg.secure !== false
  };
}

// ---- message ------------------------------------------------------------------------------------
const b64 = text => Buffer.from(text, 'utf8').toString('base64').replace(/.{76}/g, '$&\r\n');
const word = text => /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${Buffer.from(text, 'utf8').toString('base64')}?=`;
const plainHeader = value => String(value).replace(/[\r\n]/g, ' ');

export function buildMessage({ from, fromName, to, subject, text, html }) {
  const boundary = `zms-${randomBytes(12).toString('hex')}`;
  const domain = from.split('@')[1] || 'localhost';
  return [
    `From: ${word(plainHeader(fromName).replace(/["\\<>]/g, ''))} <${plainHeader(from)}>`,
    `To: <${plainHeader(to)}>`,
    `Subject: ${word(plainHeader(subject))}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: <${randomBytes(16).toString('hex')}@${domain}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`, 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64', '', b64(text),
    `--${boundary}`, 'Content-Type: text/html; charset=utf-8', 'Content-Transfer-Encoding: base64', '', b64(html),
    `--${boundary}--`, ''
  ].join('\r\n');
}

// ---- SMTP ---------------------------------------------------------------------------------------
export function smtpSend(cfg, to, message, timeoutMs = 20_000) {
  return new Promise((resolve, reject) => {
    const options = { host: cfg.host, port: cfg.port, servername: cfg.host };
    const socket = cfg.secure ? connectTls(options) : connectTcp(options);
    socket.setTimeout(timeoutMs, () => socket.destroy(new Error('SMTP timeout')));
    let buffer = '';
    let waiting = null;
    let failed = null;
    socket.on('error', error => { failed = error; if (waiting) { const done = waiting; waiting = null; done(0, error.message); } });
    // A reply ends with a line "NNN text" (the lines before it are "NNN-text").
    const check = () => {
      const match = buffer.match(/(?:^|\r\n)(\d{3}) [^\r\n]*\r\n$/);
      if (match && waiting) { const done = waiting; waiting = null; const reply = buffer; buffer = ''; done(Number(match[1]), reply); }
    };
    socket.on('data', chunk => { buffer += chunk.toString('utf8'); check(); });
    const step = (line, expect) => new Promise((ok, fail) => {
      if (failed) return fail(failed);
      waiting = (code, reply) => expect.includes(code) ? ok(code) : fail(new Error(`SMTP ${code}: ${String(reply).trim().split('\r\n').pop()}`));
      if (line !== null) socket.write(`${line}\r\n`);
      else check(); // the greeting may already be here
    });
    (async () => {
      await step(null, [220]); // the greeting
      await step(`EHLO ${cfg.user.split('@')[1] || 'localhost'}`, [250]);
      await step('AUTH LOGIN', [334]);
      await step(Buffer.from(cfg.user).toString('base64'), [334]);
      await step(Buffer.from(cfg.password).toString('base64'), [235]);
      await step(`MAIL FROM:<${cfg.user}>`, [250]);
      await step(`RCPT TO:<${to}>`, [250, 251]);
      await step('DATA', [354]);
      // Dot-stuffing: a line starting with "." gets a second one
      await step(`${message.replace(/\r\n\./g, '\r\n..')}\r\n.`, [250]);
      socket.end('QUIT\r\n');
    })().then(resolve, error => { socket.destroy(); reject(error); });
  });
}

// Sends in the background: the page answers at once. Errors go to the service log only.
export function sendMail(to, subject, text, html) {
  const cfg = mailConfig();
  if (!cfg || !to) return false;
  const message = buildMessage({ from: cfg.user, fromName: cfg.fromName, to, subject, text, html });
  const outbox = process.env.MAIL_OUTBOX;
  const work = outbox
    ? mkdir(outbox, { recursive: true }).then(() => writeFile(join(outbox, `${Date.now()}-${randomBytes(3).toString('hex')}.eml`), message))
    : smtpSend(cfg, to, message);
  work.catch(error => console.error(`email to ${to} not sent: ${error.message}`));
  return true;
}

// ---- Telegram -----------------------------------------------------------------------------------
export function telegramConfig(file = process.env.TELEGRAM_FILE) {
  const cfg = file ? readJson(file) : {};
  const token = process.env.TELEGRAM_TOKEN || cfg.token;
  const chat = process.env.TELEGRAM_CHAT || cfg.chat_id;
  if (process.env.TELEGRAM_OUTBOX) return { token: token || '', chat: String(chat || '') };
  return token && chat ? { token, chat: String(chat) } : null;
}

export async function sendTelegram(text) {
  const cfg = telegramConfig();
  if (!cfg) return false;
  const outbox = process.env.TELEGRAM_OUTBOX;
  try {
    if (outbox) {
      await mkdir(outbox, { recursive: true });
      await writeFile(join(outbox, `${Date.now()}-${randomBytes(3).toString('hex')}.txt`), text);
      return true;
    }
    const response = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ chat_id: cfg.chat, text: text.slice(0, 4000), disable_web_page_preview: true })
    });
    return (await response.json()).ok === true;
  } catch (error) {
    console.error(`Telegram notice not sent: ${error.name}`); // never log the token
    return false;
  }
}

// ---- template -----------------------------------------------------------------------------------
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// One layout for every email, in the site's GitHub colours (light, so it reads well in every mail app).
export function mailHtml({ title, intro, button, url, outro = '' }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"></head>
<body style="margin:0;background:#f6f8fa;padding:24px 12px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2328;">
<div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #d0d7de;border-radius:6px;padding:24px;">
<div style="font-size:14px;font-weight:600;">ZOOM MultiStomp <span style="color:#656d76;">STUDIO</span></div>
<div style="height:1px;background:#d0d7de;margin:12px 0 20px;"></div>
<h1 style="font-size:20px;font-weight:600;margin:0 0 10px;">${esc(title)}</h1>
<p style="font-size:14px;line-height:1.5;margin:0 0 20px;">${esc(intro)}</p>
${button ? `<a href="${esc(url)}" style="display:inline-block;background:#1f883d;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:8px 16px;border-radius:6px;">${esc(button)}</a>` : ''}
${outro ? `<p style="font-size:12px;line-height:1.5;color:#656d76;margin:20px 0 0;">${esc(outro)}</p>` : ''}
</div></body></html>`;
}
