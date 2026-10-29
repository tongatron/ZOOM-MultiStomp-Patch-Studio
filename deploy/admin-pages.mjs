// Pages of the user console (/admin), for administrators only. Rendered by the server like the sign-in pages.
import { esc, page } from './pages.mjs';

const date = value => (value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const dateTime = value => (value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const size = bytes => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const STYLE = `<style>
  body { align-items: stretch; }
  .auth-brand, .admin { width: 100%; max-width: 1100px; margin-left: auto; margin-right: auto; }
  .admin .auth-card, .admin .auth-ok, .admin .auth-error { max-width: none; margin-bottom: 16px; }
  .admin h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .admin-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .admin-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
  .admin-stat { padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); }
  .admin-stat b { display: block; font-size: 22px; font-weight: 600; }
  .admin-stat span { color: var(--fg-muted); font-size: 12px; }
  .admin-search { display: flex; gap: 8px; margin-bottom: 12px; }
  .admin-search input { margin: 0; max-width: 320px; }
  .admin-search .btn { flex: none; }
  .admin-table { overflow-x: auto; }
  .admin table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .admin th, .admin td { padding: 8px; text-align: left; border-bottom: 1px solid var(--border-muted); white-space: nowrap; vertical-align: middle; }
  .admin th a { color: var(--fg-muted); }
  .admin th a[aria-current] { color: var(--fg); font-weight: 600; }
  .admin .acts { display: flex; gap: 4px; }
  .admin .acts form { margin: 0; }
  .admin .btn { width: auto; }
  .admin .tag { padding: 0 7px; border: 1px solid var(--border); border-radius: 2em; font-size: 12px; color: var(--fg-muted); }
  .admin .tag.admin-role { color: #d29922; border-color: rgba(210, 153, 34, .5); }
  .admin .muted { color: var(--fg-muted); }
  .admin code { font: 12px var(--mono); overflow-wrap: anywhere; white-space: normal; }
</style>`;

const bar = `<nav class="admin-bar"><a class="btn btn-sm" href="/">&larr; Back to the site</a><a class="btn btn-sm" href="/admin">Users</a><a class="btn btn-sm" href="/account">Your account</a></nav>`;
const act = (action, id, label, extra = '') => `<form method="post" action="/admin/${action}"><input type="hidden" name="id" value="${esc(id)}">${extra}<button class="btn btn-sm" type="submit">${esc(label)}</button></form>`;

const COLUMNS = [['email', 'Email'], ['name', 'Name'], ['created', 'Signed up'], ['login', 'Last sign-in'], ['ms60b', 'MS-60B+'], ['ms50g', 'MS-50G+'], ['change', 'Last change']];

export function adminPage({ me, stats, users, query = '', sort = 'created', dir = 'desc', note = '', error = '', link = '', confirm = null, log }) {
  const sortLink = key => {
    const nextDir = sort === key && dir === 'desc' ? 'asc' : 'desc';
    const params = new URLSearchParams({ ...(query ? { q: query } : {}), sort: key, dir: nextDir });
    return `<a href="/admin?${esc(params)}"${sort === key ? ' aria-current="true"' : ''}>${sort === key ? (dir === 'desc' ? '↓ ' : '↑ ') : ''}`;
  };
  const rows = users.map(u => `<tr>
    <td><a href="/admin/user/${esc(u.id)}">${esc(u.email)}</a> ${u.role === 'admin' ? '<span class="tag admin-role">admin</span>' : ''} ${u.email_verified_at ? '' : '<span class="tag" title="Email not confirmed">unconfirmed</span>'}</td>
    <td>${esc(u.name) || '<span class="muted">—</span>'}</td><td>${date(u.created_at)}</td><td>${date(u.last_login)}</td>
    <td>${u.ms60b}</td><td>${u.ms50g}</td><td>${dateTime(u.last_change)}</td>
    <td>${u.id === me.id ? '<span class="muted">you</span>' : `<div class="acts">
      ${act('reset', u.id, 'Send reset link')}${act('signout', u.id, 'Sign out everywhere')}
      ${act('role', u.id, u.role === 'admin' ? 'Remove admin' : 'Make admin', `<input type="hidden" name="role" value="${u.role === 'admin' ? 'user' : 'admin'}">`)}
      <a class="btn btn-sm" href="/admin/user/${esc(u.id)}/export" download>Download data</a>
      <a class="btn btn-sm btn-danger" href="/admin?delete=${esc(u.id)}">Delete</a></div>`}</td></tr>`).join('');
  return page('Users', `${STYLE}<main class="admin">${bar}
${error ? `<div class="auth-error" role="alert">${esc(error)}</div>` : ''}${note ? `<div class="auth-ok" role="status">${esc(note)}${link ? `<br><code>${esc(link)}</code>` : ''}</div>` : ''}
${confirm ? `<form class="auth-card" method="post" action="/admin/delete"><p>Delete the account of <b>${esc(confirm.email)}</b> and everything kept in it (${confirm.ms60b + confirm.ms50g} patches)? Patches stored in their browsers stay there. This can't be undone.</p>
  <input type="hidden" name="id" value="${esc(confirm.id)}"><div class="acts"><a class="btn" href="/admin">Cancel</a><button class="btn btn-danger" type="submit">Delete the account</button></div></form>` : ''}
<section class="auth-card"><h2>Summary</h2><div class="admin-stats">
  <div class="admin-stat"><b>${stats.users}</b><span>accounts</span></div>
  <div class="admin-stat"><b>${stats.new7}</b><span>new in the last 7 days</span></div>
  <div class="admin-stat"><b>${stats.new30}</b><span>new in the last 30 days</span></div>
  <div class="admin-stat"><b>${stats.active30}</b><span>signed in in the last 30 days</span></div>
  <div class="admin-stat"><b>${stats.ms60b}</b><span>MS-60B+ patches</span></div>
  <div class="admin-stat"><b>${stats.ms50g}</b><span>MS-50G+ patches</span></div>
  <div class="admin-stat"><b>${size(stats.dbBytes)}</b><span>database</span></div>
</div></section>
<section class="auth-card"><h2>Accounts</h2>
  <form class="admin-search" method="get" action="/admin"><input name="q" type="search" placeholder="Search by email or name" value="${esc(query)}" aria-label="Search accounts">
  <input type="hidden" name="sort" value="${esc(sort)}"><input type="hidden" name="dir" value="${esc(dir)}"><button class="btn btn-sm" type="submit">Search</button></form>
  <div class="admin-table"><table><thead><tr>${COLUMNS.map(([key, label]) => `<th>${sortLink(key)}${label}</a></th>`).join('')}<th></th></tr></thead>
  <tbody>${rows || `<tr><td colspan="8" class="muted">No accounts${query ? ' match this search' : ''}.</td></tr>`}</tbody></table></div>
</section>
<section class="auth-card"><h2>Admin log</h2>
  ${log.length ? `<div class="admin-table"><table><tbody>${log.map(l => `<tr><td>${dateTime(l.at)}</td><td>${esc(l.admin_email || '(deleted)')}</td><td>${esc(l.action)}</td><td>${esc(l.target_email || l.target_id || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No admin actions yet.</p>'}
</section></main>`);
}

export function adminUserPage({ user, pedals }) {
  const names = { ms60b: 'MS-60B+', ms50g: 'MS-50G+' };
  const sections = Object.entries(names).map(([pedal, label]) => {
    const list = pedals[pedal] || [];
    return `<section class="auth-card"><h2>${label} patches (${list.length})</h2>${list.length ? `<div class="admin-table"><table><thead><tr><th>Name</th><th>Effects</th><th>Last change</th></tr></thead><tbody>
      ${list.map(p => `<tr><td>${esc(p.name) || '<span class="muted">(no name)</span>'}</td><td>${p.effects?.length ?? 0}</td><td>${dateTime(p.updatedAt)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">None.</p>'}</section>`;
  }).join('');
  return page(user.email, `${STYLE}<main class="admin">${bar}
<section class="auth-card"><p><b>${esc(user.email)}</b>${user.name ? ` · ${esc(user.name)}` : ''} · ${user.role === 'admin' ? 'admin' : 'user'} · ${user.email_verified_at ? 'email confirmed' : 'email not confirmed'}<br>
<span class="muted">Signed up ${dateTime(user.created_at)} · last sign-in ${dateTime(user.last_login)}</span></p>
<p class="muted">Read only: this page shows the account's patches to help with problems; it cannot change them.</p></section>
${sections}</main>`);
}
