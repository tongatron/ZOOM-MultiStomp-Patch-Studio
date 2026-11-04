// Pages of the user console (/admin), for administrators only. Rendered by the server like the sign-in pages.
import { esc, messageHtml, page } from './pages.mjs';

const date = value => (value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const dateTime = value => (value ? new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const STYLE = `<style>
  body { align-items: stretch; }
  .auth-brand, .admin { width: 100%; max-width: 1280px; margin-left: auto; margin-right: auto; }
  .admin { padding-left: 16px; padding-right: 16px; }
  .admin .auth-card, .admin .auth-ok, .admin .auth-error { max-width: none; margin-bottom: 16px; }
  .admin h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .admin-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .admin-table-tools { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
  .admin-search, .admin-page-size { display: flex; align-items: end; gap: 8px; margin: 0; }
  .admin-search input { margin: 0; max-width: 320px; }
  .admin-search .btn, .admin-page-size .btn { flex: none; }
  .admin-page-size label { display: flex; align-items: center; gap: 8px; color: var(--fg-muted); font-size: 12px; }
  .admin-page-size select { min-width: 120px; margin: 0; padding: 7px 10px; color: var(--fg); background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); font: inherit; }
  .admin-message select, .admin-message textarea { display: block; width: 100%; margin: 0 0 16px; padding: 7px 12px; color: var(--fg); background: var(--bg);
    border: 1px solid var(--border); border-radius: var(--radius); font: inherit; font-size: 14px; }
  .admin-message select { height: 36px; }
  .admin-message textarea { min-height: 160px; resize: vertical; line-height: 1.5; }
  .admin-message .hint { display: block; margin: -10px 0 16px; color: var(--fg-muted); font-size: 12px; }
  .admin-table { max-width: 100%; overflow: visible; }
  .admin table { width: 100%; max-width: 100%; border-collapse: collapse; font-size: 13px; }
  .admin th, .admin td { padding: 8px; text-align: left; border-bottom: 1px solid var(--border-muted); white-space: normal; overflow-wrap: anywhere; vertical-align: middle; }
  .admin th a { color: var(--fg-muted); }
  .admin th a[aria-current] { color: var(--fg); font-weight: 600; }
  .admin-accounts-table table { table-layout: fixed; }
  .admin-accounts-table th:nth-child(1), .admin-accounts-table td:nth-child(1) { width: 23%; }
  .admin-accounts-table th:nth-child(2), .admin-accounts-table td:nth-child(2) { width: 10%; }
  .admin-accounts-table th:nth-child(3), .admin-accounts-table td:nth-child(3) { width: 11%; }
  .admin-accounts-table th:nth-child(4), .admin-accounts-table td:nth-child(4),
  .admin-accounts-table th:nth-child(5), .admin-accounts-table td:nth-child(5),
  .admin-accounts-table th:nth-child(6), .admin-accounts-table td:nth-child(6) { width: 6%; }
  .admin-accounts-table th:nth-child(7), .admin-accounts-table td:nth-child(7) { width: 10%; }
  .admin-accounts-table th:nth-child(8), .admin-accounts-table td:nth-child(8) { width: 16%; }
  .admin .acts { display: flex; flex-wrap: nowrap; align-items: center; gap: 4px; }
  .admin .acts form { margin: 0; }
  .admin .btn { width: auto; }
  .admin .acts .btn { width: auto; white-space: nowrap; }
  .admin .tag { padding: 0 7px; border: 1px solid var(--border); border-radius: 2em; font-size: 12px; color: var(--fg-muted); }
  .admin .tag.admin-role { color: #d29922; border-color: rgba(210, 153, 34, .5); }
  .admin .muted { color: var(--fg-muted); }
  .admin code { font: 12px var(--mono); overflow-wrap: anywhere; white-space: normal; }
  .admin-table-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; }
  .admin-pagination { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  .admin-pagination .current { color: var(--fg); border-color: var(--accent); background: var(--bg-inset); }
  .admin-pagination .disabled { opacity: .45; pointer-events: none; }
  .admin-results { margin: 8px 0 0; color: var(--fg-muted); font-size: 12px; }
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
    .admin-table-tools { align-items: stretch; }
    .admin-search, .admin-page-size { align-items: stretch; flex-wrap: wrap; }
    .admin-search input { flex: 1 1 180px; max-width: none; }
    .admin-page-size label { flex: 1 1 180px; }
    .admin-page-size select { width: 100%; }
    .admin-table-footer { align-items: stretch; }
    .admin-pagination { justify-content: center; }
  }
  @media (max-width: 560px) {
    .admin-accounts-table tr { grid-template-columns: 1fr; }
    .admin-accounts-table td { grid-template-columns: minmax(6rem, 30%) minmax(0, 1fr); }
  }
</style>`;

const bar = `<nav class="admin-bar"><a class="btn btn-sm" href="/">&larr; Back to the site</a><a class="btn btn-sm" href="/admin">Users</a><a class="btn btn-sm" href="/account">Your account</a></nav>`;
const act = (action, id, label, extra = '') => `<form method="post" action="/admin/${action}"><input type="hidden" name="id" value="${esc(id)}">${extra}<button class="btn btn-sm" type="submit">${esc(label)}</button></form>`;
const confirmDelete = id => `<form method="get" action="/admin"><input type="hidden" name="delete" value="${esc(id)}"><button class="btn btn-sm btn-danger" type="submit">Delete</button></form>`;

const COLUMNS = [['email', 'Email'], ['name', 'Name'], ['created', 'Signed up'], ['ms60b', 'MS-60B+'], ['ms50g', 'MS-50G+'], ['ms70cdr', 'MS-70CDR+'], ['change', 'Last change']];

export function adminPage({ me, users, recipients = users, query = '', sort = 'created', dir = 'desc', pageNumber = 1, pageSize = 25, pageCount = 1, totalUsers = users.length, note = '', error = '', link = '', confirm = null, log, inbox = [], message = {} }) {
  const sizeParam = pageSize === 0 ? 'all' : String(pageSize);
  const navigationParams = (targetPage, extra = {}) => new URLSearchParams({ ...(query ? { q: query } : {}), sort, dir, size: sizeParam, page: String(targetPage), ...extra });
  const sortLink = key => {
    const nextDir = sort === key && dir === 'desc' ? 'asc' : 'desc';
    const params = new URLSearchParams({ ...(query ? { q: query } : {}), sort: key, dir: nextDir, size: sizeParam, page: '1' });
    return `<a href="/admin?${esc(params)}"${sort === key ? ' aria-current="true"' : ''}>${sort === key ? (dir === 'desc' ? '↓ ' : '↑ ') : ''}`;
  };
  const pageLink = (target, label, extraClass = '') => `<a class="btn btn-sm${extraClass ? ` ${extraClass}` : ''}" href="/admin?${esc(navigationParams(target))}">${esc(label)}</a>`;
  const pageButtons = pageCount <= 7 ? Array.from({ length: pageCount }, (_, i) => i + 1) : [1, ...(pageNumber > 3 ? ['…'] : []), ...new Set([pageNumber - 1, pageNumber, pageNumber + 1].filter(n => n > 1 && n < pageCount)), ...(pageNumber < pageCount - 2 ? ['…'] : []), pageCount];
  const pagination = pageCount > 1 ? `<nav class="admin-pagination" aria-label="Users pages">
    ${pageLink(Math.max(1, pageNumber - 1), 'Previous', pageNumber === 1 ? 'disabled' : '')}
    ${pageButtons.map(value => value === '…' ? '<span class="muted" aria-hidden="true">…</span>' : pageLink(value, String(value), value === pageNumber ? 'current' : '')).join('')}
    ${pageLink(Math.min(pageCount, pageNumber + 1), 'Next', pageNumber === pageCount ? 'disabled' : '')}
  </nav>` : '';
  const rows = users.map(u => `<tr>
    <td data-label="Email"><a href="/admin/user/${esc(u.id)}">${esc(u.email)}</a> ${u.role === 'admin' ? '<span class="tag admin-role">admin</span>' : ''} ${u.email_verified_at ? '' : '<span class="tag" title="Email not confirmed">unconfirmed</span>'}</td>
    <td data-label="Name">${esc(u.name) || '<span class="muted">—</span>'}</td><td data-label="Signed up">${date(u.created_at)}</td>
    <td data-label="MS-60B+">${u.ms60b}</td><td data-label="MS-50G+">${u.ms50g}</td><td data-label="MS-70CDR+">${u.ms70cdr}</td><td data-label="Last change">${dateTime(u.last_change)}</td>
    <td data-label="Actions">${u.id === me.id ? '<span class="muted">you</span>' : `<div class="acts">
      ${act('reset', u.id, 'Send reset link')}
      ${confirmDelete(u.id)}</div>`}</td></tr>`).join('');
  const messageDate = message.date || new Date().toISOString().slice(0, 10);
  const recipientOptions = recipients.map(u => `<option value="${esc(u.id)}"${message.recipient === u.id ? ' selected' : ''}>${esc(u.email)}${u.name ? ` — ${esc(u.name)}` : ''}${u.role === 'admin' ? ' (admin)' : ''}</option>`).join('');
  const inboxSection = inbox.length ? `<section class="auth-card admin-inbox"><h2>New messages</h2>${inbox.map(m => `<article class="account-message">
    <div class="account-message-head"><h3>${esc(m.title)}</h3><time datetime="${esc(m.message_date)}">${esc(date(m.message_date))}</time></div>
    <div class="account-message-body">${messageHtml(m.objects)}</div>
  </article>`).join('')}</section>` : '';
  return page('Users', `${STYLE}<main class="admin">${bar}
${error ? `<div class="auth-error" role="alert">${esc(error)}</div>` : ''}${note ? `<div class="auth-ok" role="status">${esc(note)}${link ? `<br><code>${esc(link)}</code>` : ''}</div>` : ''}
${confirm ? `<form class="auth-card" method="post" action="/admin/delete"><p>Delete the account of <b>${esc(confirm.email)}</b> and everything kept in it (${confirm.ms60b + confirm.ms50g + confirm.ms70cdr} patches)? Patches stored in their browsers stay there. This can't be undone.</p>
  <input type="hidden" name="id" value="${esc(confirm.id)}"><div class="acts"><a class="btn" href="/admin">Cancel</a><button class="btn btn-danger" type="submit">Delete the account</button></div></form>` : ''}
${inboxSection}
<section class="auth-card"><h2>Accounts</h2>
  <div class="admin-table-tools">
    <form class="admin-search" method="get" action="/admin"><input name="q" type="search" placeholder="Search by email or name" value="${esc(query)}" aria-label="Search accounts">
      <input type="hidden" name="sort" value="${esc(sort)}"><input type="hidden" name="dir" value="${esc(dir)}"><input type="hidden" name="size" value="${esc(sizeParam)}"><input type="hidden" name="page" value="1"><button class="btn btn-sm" type="submit">Search</button></form>
    <form class="admin-page-size" method="get" action="/admin"><input type="hidden" name="q" value="${esc(query)}"><input type="hidden" name="sort" value="${esc(sort)}"><input type="hidden" name="dir" value="${esc(dir)}"><input type="hidden" name="page" value="1">
      <label>Show <select name="size"><option value="25"${pageSize === 25 ? ' selected' : ''}>25 users</option><option value="50"${pageSize === 50 ? ' selected' : ''}>50 users</option><option value="100"${pageSize === 100 ? ' selected' : ''}>100 users</option><option value="all"${pageSize === 0 ? ' selected' : ''}>All users</option></select></label><button class="btn btn-sm" type="submit">Apply</button></form>
  </div>
  <div class="admin-table admin-accounts-table"><table aria-label="Accounts"><thead><tr>${COLUMNS.map(([key, label]) => `<th scope="col">${sortLink(key)}${label}</a></th>`).join('')}<th scope="col">Actions</th></tr></thead>
  <tbody>${rows || `<tr><td colspan="8" class="muted">No accounts${query ? ' match this search' : ''}.</td></tr>`}</tbody></table></div>
  <div class="admin-table-footer">${pagination}<a class="btn btn-sm" href="/admin/users.xlsx?${esc(navigationParams(1))}">Download users (.xlsx)</a></div>
  <p class="admin-results">${totalUsers ? `Showing ${(pageNumber - 1) * (pageSize || totalUsers) + 1}–${Math.min(totalUsers, pageNumber * (pageSize || totalUsers))} of ${totalUsers} users` : 'No users found'}</p>
</section>
<section class="auth-card"><h2>Admin log</h2>
  ${log.length ? `<div class="admin-table"><table><tbody>${log.map(l => `<tr><td>${dateTime(l.at)}</td><td>${esc(l.admin_email || '(deleted)')}</td><td>${esc(l.action)}</td><td>${esc(l.target_email || l.target_id || '')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No admin actions yet.</p>'}
</section>
<section class="auth-card admin-message"><h2>Send a message</h2>
  <p>Create an in-app message for one account or every account. Administrator accounts are included, and you can select yourself for an admin-to-admin test. Full <code>http(s)</code> links in Objects become clickable links.</p>
  ${message.error ? `<div class="auth-error" role="alert">${esc(message.error)}</div>` : ''}
  <form method="post" action="/admin/message">
    <label for="message-recipient">To</label>
    <select id="message-recipient" name="recipient" required>
      <option value="all"${message.recipient === 'all' || !message.recipient ? ' selected' : ''}>All users (including admins)</option>
      ${recipientOptions}
    </select>
    <label for="message-date">Date</label>
    <input id="message-date" name="date" type="date" value="${esc(messageDate)}" required>
    <label for="message-title">Title</label>
    <input id="message-title" name="title" type="text" maxlength="160" value="${esc(message.title || '')}" required>
    <label for="message-objects">Objects</label>
    <textarea id="message-objects" name="objects" maxlength="10000" required>${esc(message.objects || '')}</textarea>
    <span class="hint">The message appears in the recipient's interface on the next access. Paste complete http:// or https:// links to make them clickable.</span>
    <button class="btn btn-primary" type="submit">Send message</button>
  </form>
</section></main>`);
}

export function adminUserPage({ user, pedals }) {
  const names = { ms60b: 'MS-60B+', ms50g: 'MS-50G+', ms70cdr: 'MS-70CDR+' };
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
