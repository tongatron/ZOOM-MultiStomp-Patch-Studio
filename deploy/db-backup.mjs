// Consistent copy of the accounts database, safe while the server is running (VACUUM INTO).
//   node db-backup.mjs <database> <copy>     the copy must not exist yet
// Used by backup-data.sh.
import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const [source, target] = process.argv.slice(2);
if (!source || !target) { console.error('usage: node db-backup.mjs <database> <copy>'); process.exit(1); }
if (!existsSync(source)) { console.error(`no database at ${source}`); process.exit(1); }
if (existsSync(target)) { console.error(`${target} already exists`); process.exit(1); }
const db = new DatabaseSync(source, { readOnly: true });
db.exec(`VACUUM INTO '${target.replaceAll("'", "''")}'`);
db.close();
