// Sign-in pages, rendered by the server: plain HTML forms (they work with password managers and without scripts),
// styled with the site's own styles.css and theme.css.

export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nextQuery = next => (next && next !== '/' ? `?next=${encodeURIComponent(next)}` : '');
const MESSAGE_URL_RE = /https?:\/\/[^\s<>"']+/gi;
const trimMessageUrl = url => url.replace(/[.,!?;:]+$/, '');
const messageLine = line => {
  let html = '';
  let last = 0;
  for (const match of line.matchAll(MESSAGE_URL_RE)) {
    const raw = match[0];
    const link = trimMessageUrl(raw);
    html += esc(line.slice(last, match.index));
    html += `<a href="${esc(link)}" target="_blank" rel="noreferrer">${esc(link)}</a>${esc(raw.slice(link.length))}`;
    last = match.index + raw.length;
  }
  return html + esc(line.slice(last));
};
export const messageHtml = value => String(value ?? '').replace(/\r\n?/g, '\n').split('\n').map(messageLine).join('<br>\n');
const messageDate = value => (value ? new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '—');
const messageCards = messages => messages.map(m => `<article class="account-message">
  <div class="account-message-head"><h3>${esc(m.title)}</h3><time datetime="${esc(m.message_date)}">${esc(messageDate(m.message_date))}</time></div>
  <div class="account-message-body">${messageHtml(m.objects)}</div>
</article>`).join('');
const SITE_FOOTER = `<footer class="gh-footer container">
  <div class="gh-footer-left">
    <a class="site-badge A2" href="https://tongatron.org" target="_blank" rel="noreferrer" style="--accent:#ffcc00; font-family:system-ui; font-size:14px;"><span class="mark mark-dot"></span><span>tongatron.org</span></a>
    <a class="btn gh-repo" href="https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio" target="_blank" rel="noreferrer" aria-label="Source code on GitHub"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg><span>Source on GitHub</span></a>
  </div>
  <div class="gh-footer-right">
    <span class="gh-data">Data: ZOOM MS-60B+ and MS-50G+ Effects Lists © 2024 ZOOM CORPORATION. Not affiliated with ZOOM. Manufacturer names are used only to describe sonic character.</span>
    <div class="gh-footer-meta">
      <a class="gh-privacy" href="/privacy.html">Privacy</a>
      <time class="gh-updated" datetime="2026-11-03T17:53Z">Last update 3 November 2026 18:53 CET</time>
    </div>
  </div>
</footer>`;

export function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0d1117">
<title>${esc(title)} · ZOOM MultiStomp Studio</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/theme.css">
<style>
  body { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 16px; }
  .auth-brand { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--fg); }
  .auth-brand:hover { text-decoration: none; }
  .auth-brand h1 { margin: 0; font-size: 24px; font-weight: 300; letter-spacing: -.5px; }
  .auth-card { width: 100%; max-width: 340px; padding: 16px; background: var(--bg-subtle); border: 1px solid var(--border-muted); border-radius: var(--radius); }
  .auth-card label { display: block; margin: 0 0 6px; font-size: 14px; font-weight: 400; }
  .auth-card label .hint { color: var(--fg-muted); font-size: 12px; }
  .auth-card input { display: block; width: 100%; height: 32px; margin: 0 0 16px; padding: 5px 12px; color: var(--fg); background: var(--bg);
    border: 1px solid var(--border); border-radius: var(--radius); font: inherit; font-size: 14px; }
  .auth-card input:focus { outline: none; border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
  .auth-card .btn { width: 100%; justify-content: center; }
  .auth-card p { margin: 0 0 16px; font-size: 14px; line-height: 1.5; }
  .auth-row { display: flex; justify-content: space-between; align-items: baseline; }
  .auth-row a { font-size: 12px; }
  .auth-error { width: 100%; max-width: 340px; margin: 0 0 16px; padding: 12px 16px; font-size: 13px; color: #ffdcd7; background: rgba(248, 81, 73, .1); border: 1px solid rgba(248, 81, 73, .4); border-radius: var(--radius); }
  .auth-ok { width: 100%; max-width: 340px; margin: 0 0 16px; padding: 12px 16px; font-size: 13px; background: rgba(46, 160, 67, .15); border: 1px solid rgba(46, 160, 67, .4); border-radius: var(--radius); }
  .auth-alt { width: 100%; max-width: 340px; margin-top: 16px; padding: 16px; text-align: center; font-size: 14px; border: 1px solid var(--border); border-radius: var(--radius); }
  .auth-alt + .auth-alt { margin-top: 8px; }
  .auth-alt p { margin: 4px 0 0; color: var(--fg-muted); font-size: 12px; }
  .auth-card .hint { color: var(--fg-muted); font-size: 12px; }
  .account-section { margin-top: 16px; }
  .account-section h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .account-messages { max-width: none; }
  .account-message + .account-message { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-muted); }
  .account-message-head { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; margin-bottom: 8px; }
  .account-message-head h3 { margin: 0; font-size: 16px; font-weight: 600; }
  .account-message-head time { flex: none; color: var(--fg-muted); font-size: 12px; }
  .account-message-body { font-size: 14px; line-height: 1.6; overflow-wrap: anywhere; }
  .account-danger { border-color: rgba(248, 81, 73, .4); }
  .btn-danger { color: #f85149; }
  .btn-danger:hover { color: #fff; background: #da3633; border-color: #f85149; }
</style>
</head>
<body>
<!--email_off-->
<a class="auth-brand" href="/"><img src="/favicon.svg" alt="" width="48" height="48"><h1>${esc(title)}</h1></a>
${body}
${SITE_FOOTER}
<!--/email_off-->
</body>
</html>`;
}

const errorBox = error => (error ? `<div class="auth-error" role="alert">${esc(error)}</div>` : '');
const okBox = note => (note ? `<div class="auth-ok" role="status">${esc(note)}</div>` : '');
const later = next => `<div class="auth-alt"><a href="${esc(next)}">Continue without an account</a>
  <p>You can use the whole site without signing in, but your patches are kept only in this browser.</p></div>`;

export const loginPage = ({ error = '', note = '', email = '', next = '/' } = {}) => page('Sign in', `${errorBox(error)}${okBox(note)}
<form class="auth-card" method="post" action="/login">
  <label for="email">Email address</label>
  <input id="email" name="email" type="email" autocomplete="username" value="${esc(email)}" ${email ? '' : 'autofocus'} required>
  <div class="auth-row"><label for="password">Password</label><a href="/forgot">Forgot password?</a></div>
  <input id="password" name="password" type="password" autocomplete="current-password" ${email ? 'autofocus' : ''} required>
  <input type="hidden" name="next" value="${esc(next)}">
  <button class="btn btn-primary" type="submit">Sign in</button>
</form>
<div class="auth-alt">New here? <a href="/register${esc(nextQuery(next))}">Create an account</a></div>
${later(next)}`);

export const registerPage = ({ error = '', email = '', name = '', next = '/', minPassword = 10 } = {}) => page('Create an account', `${errorBox(error)}
<form class="auth-card" method="post" action="/register">
  <label for="email">Email address</label>
  <input id="email" name="email" type="email" autocomplete="email" value="${esc(email)}" autofocus required>
  <label for="name">Name <span class="hint">(optional)</span></label>
  <input id="name" name="name" autocomplete="nickname" maxlength="60" value="${esc(name)}">
  <label for="password">Password <span class="hint">(at least ${minPassword} characters)</span></label>
  <input id="password" name="password" type="password" autocomplete="new-password" minlength="${minPassword}" required>
  <label for="password-confirm">Confirm password</label>
  <input id="password-confirm" name="passwordConfirm" type="password" autocomplete="new-password" minlength="${minPassword}" required>
  <input type="hidden" name="next" value="${esc(next)}">
  <button class="btn btn-primary" type="submit">Create account</button>
</form>
<div class="auth-alt">Already have an account? <a href="/login${esc(nextQuery(next))}">Sign in</a>
  <p>What an account stores and how to delete it: <a href="/privacy.html">Privacy</a></p></div>
${later(next)}`);

export const forgotPage = ({ error = '', done = false, email = '' } = {}) => page('Reset your password', done
  ? `<div class="auth-card"><p>If an account uses this address, we've sent it a link to choose a new password. The link is valid for one hour and works only once.</p>
  <a class="btn" href="/login">Back to sign in</a></div>`
  : `${errorBox(error)}
<form class="auth-card" method="post" action="/forgot">
  <p>Enter your account's email address and we'll send you a link to choose a new password.</p>
  <label for="email">Email address</label>
  <input id="email" name="email" type="email" autocomplete="username" value="${esc(email)}" autofocus required>
  <button class="btn btn-primary" type="submit">Send me the link</button>
</form>
<div class="auth-alt"><a href="/login">Back to sign in</a></div>`);

export const resetPage = ({ token = '', email = '', error = '', minPassword = 10 } = {}) => page('Choose a new password', email
  ? `${errorBox(error)}
<form class="auth-card" method="post" action="/reset">
  <p>Choose a new password for <b>${esc(email)}</b>. Your other devices will be signed out.</p>
  <label for="password">New password <span class="hint">(at least ${minPassword} characters)</span></label>
  <input id="password" name="password" type="password" autocomplete="new-password" minlength="${minPassword}" autofocus required>
  <input type="hidden" name="token" value="${esc(token)}">
  <button class="btn btn-primary" type="submit">Save and sign in</button>
</form>`
  : `<div class="auth-card"><p>This link is invalid or has expired. A link is valid for one hour and works only once.</p>
  <a class="btn btn-primary" href="/forgot">Ask for a new link</a></div>`);

export const messagePage = (title, text, link = '/', label = 'Back to the site') => page(title, `<div class="auth-card"><p>${esc(text)}</p>
  <a class="btn" href="${esc(link)}">${esc(label)}</a></div>`);

export const logoutPage = (next = '/') => page('Sign out', `<form class="auth-card" method="post" action="/logout">
  <p>Sign out of ZOOM MultiStomp Studio on this device?</p>
  <input type="hidden" name="next" value="${esc(next)}">
  <button class="btn btn-primary" type="submit">Sign out</button>
</form>`);

const ACCOUNT_DONE = {
  password: 'Your password has been changed. Your other devices are signed out.'
};

export const accountPage = ({ user, counts = {}, messages = [], done = '', error = '', minPassword = 10 }) => page('Your account', `${errorBox(error)}${okBox(ACCOUNT_DONE[done] || '')}
<div class="auth-card">
  <p><b>${esc(user.email)}</b>${user.name ? `<br>${esc(user.name)}` : ''}<br>
  <span class="hint">Member since ${esc(new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}</span></p>
  <p>Saved in your account: ${counts.ms60b || 0} MS-60B+ ${counts.ms60b === 1 ? 'patch' : 'patches'}, ${counts.ms50g || 0} MS-50G+ ${counts.ms50g === 1 ? 'patch' : 'patches'}, ${counts.ms70cdr || 0} MS-70CDR+ ${counts.ms70cdr === 1 ? 'patch' : 'patches'}.</p>
</div>
${messages.length ? `<section class="auth-card account-section account-messages"><h2>Messages</h2>${messageCards(messages)}</section>` : ''}
<form class="auth-card account-section" method="post" action="/account/password">
  <h2>Change password</h2>
  <input type="email" name="email" value="${esc(user.email)}" autocomplete="username" hidden>
  <label for="current">Current password</label>
  <input id="current" name="current" type="password" autocomplete="current-password" required>
  <label for="password">New password <span class="hint">(at least ${minPassword} characters)</span></label>
  <input id="password" name="password" type="password" autocomplete="new-password" minlength="${minPassword}" required>
  <button class="btn" type="submit">Change password</button>
</form>
<div class="auth-card account-section">
  <h2>Your data</h2>
  <p>Download everything kept in your account (patches, settings, rule packs, pedal backups) as a JSON file.</p>
  <a class="btn" href="/account/export" download>Download my data</a>
</div>
<form class="auth-card account-section" method="post" action="/account/signout-everywhere">
  <h2>Devices</h2>
  <p>Signs out every browser where you are signed in, this one included.</p>
  <button class="btn" type="submit">Sign out everywhere</button>
</form>
<form class="auth-card account-section account-danger" method="post" action="/account/delete">
  <h2>Delete account</h2>
  <p>Deletes your account and everything kept in it. Patches stored in your browsers stay there. This can't be undone.</p>
  <label for="delete-password">Password</label>
  <input id="delete-password" name="password" type="password" autocomplete="current-password" required>
  <button class="btn btn-danger" type="submit">Delete my account</button>
</form>
<div class="auth-alt"><a href="/">Back to the site</a> · <a href="/privacy.html">Privacy</a></div>`);
