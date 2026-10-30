// Pages of the user console (/admin), for administrators only. Rendered by the server like the sign-in pages.
import { esc, page } from './pages.mjs';

const date = value => (value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const dateTime = value => (value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const STYLE = `<style>
  body { align-items: stretch; }
  .auth-brand, .admin { width: 100%; max-width: 1100px; margin-left: auto; margin-right: auto; }
  .admin .auth-card, .admin .auth-ok, .admin .auth-error { max-width: none; margin-bottom: 16px; }
  .admin h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .admin-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .admin-search { display: flex; gap: 8px; margin-bottom: 12px; }
  .admin-search input { margin: 0; max-width: 320px; }
  .admin-search .btn { flex: none; }
  .admin-table { max-width: 100%; overflow: visible; }
  .admin table { width: 100%; max-width: 100%; border-collapse: collapse; font-size: 13px; }
  .admin th, .admin td { padding: 8px; text-align: left; border-bottom: 1px solid var(--border-muted); white-space: normal; overflow-wrap: anywhere; vertical-align: middle; }
  .admin th a { color: var(--fg-muted); }
  .admin th a[aria-current] { color: var(--fg); font-weight: 600; }
  .admin-accounts-table table { table-layout: fixed; }
  .admin-accounts-table th:nth-child(1), .admin-accounts-table td:nth-child(1) { width: 23%; }
  .admin-accounts-table th:nth-child(2), .admin-accounts-table td:nth-child(2) { width: 10%; }
  .admin-accounts-table th:nth-child(3), .admin-accounts-table td:nth-child(3) { width: 11%; }
  .admin-accounts-table th:nth-child(4), .admin-accounts-table td:nth-child(4) { width: 12%; }
  .admin-accounts-table th:nth-child(5), .admin-accounts-table td:nth-child(5),
  .admin-accounts-table th:nth-child(6), .admin-accounts-table td:nth-child(6) { width: 7%; }
  .admin-accounts-table th:nth-child(7), .admin-accounts-table td:nth-child(7) { width: 12%; }
  .admin-accounts-table th:nth-child(8), .admin-accounts-table td:nth-child(8) { width: 18%; }
  .admin .acts { display: grid; grid-template-columns: 1fr; gap: 4px; }
  .admin .acts form { margin: 0; }
  .admin .btn { width: auto; }
  .admin .acts .btn { width: 100%; white-space: normal; }
  .admin .tag { padding: 0 7px; border: 1px solid var(--border); border-radius: 2em; font-size: 12px; color: var(--fg-muted); }
  .admin .tag.admin-role { color: #d29922; border-color: rgba(210, 153, 34, .5); }
  .admin .muted { color: var(--fg-muted); }
  .admin code { font: 12px var(--mono); overflow-wrap: anywhere; white-space: normal; }
  @media (max-width: 900px) {
    .admin-accounts-table thead { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
    .admin-accounts-table tbody { display: grid; gap: 12px; }
    .admin-accounts-table tr { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 16px; padding: 12px 0; border-bottom: 1px solid var(--border-muted); }
    .admin-accounts-table td { display: grid; grid-template-columns: minmax(6.5rem, 34%) minmax(0, 1fr); gap: 8px; align-items: start; padding: 4px 0; border: 0; }
    .admin-accounts-table td::before { content: attr(data-label); color: var(--fg-muted); font-size: 12px; }
    .admin-accounts-table td:last-child { grid-column: 1 / -1; }
    .admin-accounts-table td:last-child::before { content: none; }
  }
  @media (max-width: 560px) {
    .admin-accounts-table tr { grid-template-columns: 1fr; }
    .admin-accounts-table td { grid-template-columns: minmax(6rem, 30%) minmax(0, 1fr); }
    .admin .acts { grid-template-columns: 1fr; }
  }
</style>`;

const bar = `<nav class="admin-bar"><a class="btn btn-sm" href="/">&larr; Back to the site</a><a class="btn btn-sm" href="/admin">Users</a><a class="btn btn-sm" href="/account">Your account</a></nav>`;
const act = (action, id, label, extra = '') => `<form method="post" action="/admin/${action}"><input type="hidden" name="id" value="${esc(id)}">${extra}<button class="btn btn-sm" type="submit">${esc(label)}</button></form>`;

const COLUMNS = [['email', 'Email'], ['name', 'Name'], ['created', 'Signed up'], ['login', 'Last sign-in'], ['ms60b', 'MS-60B+'], ['ms50g', 'MS-50G+'], ['change', 'Last change']];

export function adminPage({ me, users, query = '', sort = 'created', dir = 'desc', note = '', error = '', link = '', confirm = null, log }) {
  const sortLink = key => {
    const nextDir = sort === key && dir === 'desc' ? 'asc' : 'desc';
    const params = new URLSearchParams({ ...(query ? { q: query } : {}), sort: key, dir: nextDir });
    return `<a href="/admin?${esc(params)}"${sort === key ? ' aria-current="true"' : ''}>${sort === key ? (dir === 'desc' ? '↓ ' : '↑ ') : ''}`;
  };
  const rows = users.map(u => `<tr>
    <td data-label="Email"><a href="/admin/user/${esc(u.id)}">${esc(u.email)}</a> ${u.role === 'admin' ? '<span class="tag admin-role">admin</span>' : ''} ${u.email_verified_at ? '' : '<span class="tag" title="Email not confirmed">unconfirmed</span>'}</td>
    <td data-label="Name">${esc(u.name) || '<span class="muted">—</span>'}</td><td data-label="Signed up">${date(u.created_at)}</td><td data-label="Last sign-in">${date(u.last_login)}</td>
    <td data-label="MS-60B+">${u.ms60b}</td><td data-label="MS-50G+">${u.ms50g}</td><td data-label="Last change">${dateTime(u.last_change)}</td>
    <td data-label="Actions">${u.id === me.id ? '<span class="muted">you</span>' : `<div class="acts">
      ${act('reset', u.id, 'Send reset link')}
      <a class="btn btn-sm btn-danger" href="/admin?delete=${esc(u.id)}">Delete</a></div>`}</td></tr>`).join('');
  return page('Users', `${STYLE}<main class="admin">${bar}
${error ? `<div class="auth-error" role="alert">${esc(error)}</div>` : ''}${note ? `<div class="auth-ok" role="status">${esc(note)}${link ? `<br><code>${esc(link)}</code>` : ''}</div>` : ''}
${confirm ? `<form class="auth-card" method="post" action="/admin/delete"><p>Delete the account of <b>${esc(confirm.email)}</b> and everything kept in it (${confirm.ms60b + confirm.ms50g} patches)? Patches stored in their browsers stay there. This can't be undone.</p>
  <input type="hidden" name="id" value="${esc(confirm.id)}"><div class="acts"><a class="btn" href="/admin">Cancel</a><button class="btn btn-danger" type="submit">Delete the account</button></div></form>` : ''}
<section class="auth-card"><h2>Accounts</h2>
  <form class="admin-search" method="get" action="/admin"><input name="q" type="search" placeholder="Search by email or name" value="${esc(query)}" aria-label="Search accounts">
  <input type="hidden" name="sort" value="${esc(sort)}"><input type="hidden" name="dir" value="${esc(dir)}"><button class="btn btn-sm" type="submit">Search</button></form>
  <div class="admin-table admin-accounts-table"><table aria-label="Accounts"><thead><tr>${COLUMNS.map(([key, label]) => `<th scope="col">${sortLink(key)}${label}</a></th>`).join('')}<th scope="col">Actions</th></tr></thead>
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
