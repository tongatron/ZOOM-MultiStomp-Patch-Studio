// Creates an account of the ZOOM MultiStomp Studio, or changes its password and role, from the server's terminal.
//   node add-user.mjs --email you@example.com --name Giovanni --admin   asks for the password without showing it
//   printf %s 'new password' | node add-user.mjs --email you@example.com --stdin
// --admin makes the account an administrator, --user makes it a normal user again. Changing the password signs the
// account out everywhere. DB_FILE or DATA_DIR (default /srv/apps/zoom-ms60b-data) pick the database. No restart needed.
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { EMAIL_RE, cleanEmail, cleanName, hashPassword, newUserId, passwordProblem } from './auth.mjs';
import { openDb } from './db.mjs';
import { ask } from './prompt.mjs';

const { values: args } = parseArgs({ options: {
  email: { type: 'string' }, name: { type: 'string' }, admin: { type: 'boolean' }, user: { type: 'boolean' }, stdin: { type: 'boolean' }
} });
const email = cleanEmail(args.email);
if (!EMAIL_RE.test(email) || (args.admin && args.user)) {
  console.error('usage: node add-user.mjs --email you@example.com [--name Name] [--admin | --user] [--stdin]');
  process.exit(1);
}
const store = openDb(process.env.DB_FILE || join(process.env.DATA_DIR || '/srv/apps/zoom-ms60b-data', 'studio.db'));
const existing = store.userByEmail(email);
let password = '';
if (args.stdin) { for await (const chunk of process.stdin) password += chunk; }
else if (!existing || !(args.admin || args.user || args.name)) password = await ask('Password: ', { hidden: true });
password = password.replace(/\r?\n$/, '');
const problem = password || !existing ? passwordProblem(password) : '';
if (problem) { console.error(problem); process.exit(1); }

const role = args.admin ? 'admin' : args.user ? 'user' : null;
if (existing) {
  if (password) store.setPassword(existing.id, await hashPassword(password));
  if (role) store.setRole(existing.id, role);
  if (args.name !== undefined) store.setName(existing.id, cleanName(args.name));
  console.log(`updated ${email}${password ? ' (new password: its sessions are closed)' : ''}${role ? `, role ${role}` : ''}`);
} else {
  store.createUser({ id: newUserId(), email, name: cleanName(args.name), role: role || 'user', hashed: await hashPassword(password) });
  console.log(`created ${email}${role === 'admin' ? ' (admin)' : ''}`);
}
store.close();
