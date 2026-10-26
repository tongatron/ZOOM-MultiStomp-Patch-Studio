// Accounts database (SQLite through Node's built-in node:sqlite, no dependencies).
// One file, by default DATA_DIR/studio.db. The schema version lives in PRAGMA user_version.

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const MIGRATIONS = [
  `CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
   CREATE TABLE users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE COLLATE NOCASE,
     name TEXT NOT NULL DEFAULT '',
     pw_hash TEXT NOT NULL, pw_salt TEXT NOT NULL, pw_iter INTEGER NOT NULL,
     pwv INTEGER NOT NULL DEFAULT 1,
     role TEXT NOT NULL DEFAULT 'user',
     email_verified_at TEXT, created_at TEXT NOT NULL, last_login TEXT
   );
   CREATE TABLE tokens (
     hash TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     purpose TEXT NOT NULL,
     expires_at INTEGER NOT NULL, used_at INTEGER
   );
   CREATE INDEX tokens_user ON tokens (user_id, purpose);
   CREATE TABLE patches (
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     pedal TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, pos INTEGER NOT NULL,
     updated_at TEXT NOT NULL, deleted_at TEXT,
     PRIMARY KEY (user_id, pedal, id)
   );
   CREATE TABLE docs (
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     pedal TEXT NOT NULL, kind TEXT NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL,
     PRIMARY KEY (user_id, pedal, kind)
   );
   CREATE TABLE admin_log (at TEXT NOT NULL, admin_id TEXT NOT NULL, action TEXT NOT NULL, target_id TEXT);`
];

export function openDb(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  const version = db.prepare('PRAGMA user_version').get().user_version;
  for (let v = version; v < MIGRATIONS.length; v++) {
    db.exec('BEGIN');
    try { db.exec(MIGRATIONS[v]); db.exec(`PRAGMA user_version = ${v + 1}`); db.exec('COMMIT'); }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  return accounts(db);
}

// Queries used by the server and the command-line scripts.
function accounts(db) {
  const q = sql => db.prepare(sql);
  const now = () => new Date().toISOString();
  const s = {
    getMeta: q('SELECT value FROM meta WHERE key = ?'),
    setMeta: q('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value'),
    byEmail: q('SELECT * FROM users WHERE email = ?'),
    byId: q('SELECT * FROM users WHERE id = ?'),
    insertUser: q(`INSERT INTO users (id, email, name, pw_hash, pw_salt, pw_iter, role, created_at, last_login)
                   VALUES (:id, :email, :name, :hash, :salt, :iterations, :role, :created_at, :last_login)`),
    setPassword: q('UPDATE users SET pw_hash = :hash, pw_salt = :salt, pw_iter = :iterations, pwv = pwv + 1 WHERE id = :id'),
    bumpPwv: q('UPDATE users SET pwv = pwv + 1 WHERE id = ?'),
    removeUser: q('DELETE FROM users WHERE id = ?'),
    setRole: q('UPDATE users SET role = ? WHERE id = ?'),
    setName: q('UPDATE users SET name = ? WHERE id = ?'),
    loggedIn: q('UPDATE users SET last_login = ? WHERE id = ?'),
    verified: q('UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?'),
    addToken: q('INSERT INTO tokens (hash, user_id, purpose, expires_at) VALUES (?, ?, ?, ?)'),
    findToken: q('SELECT * FROM tokens WHERE hash = ? AND purpose = ? AND used_at IS NULL AND expires_at > ?'),
    useToken: q('UPDATE tokens SET used_at = ? WHERE hash = ?'),
    dropTokens: q('DELETE FROM tokens WHERE user_id = ? AND purpose = ?'),
    purgeTokens: q('DELETE FROM tokens WHERE expires_at <= ? OR used_at IS NOT NULL')
  };
  return {
    db,
    meta: key => s.getMeta.get(key)?.value ?? null,
    setMeta: (key, value) => s.setMeta.run(key, value),
    userByEmail: email => s.byEmail.get(email) ?? null,
    userById: id => s.byId.get(id) ?? null,
    // hashed = { hash, salt, iterations } from auth.hashPassword
    createUser: ({ id, email, name = '', role = 'user', hashed }) => {
      s.insertUser.run({ id, email, name, role, ...hashed, created_at: now(), last_login: now() });
      return s.byId.get(id);
    },
    setPassword: (id, hashed) => s.setPassword.run({ id, ...hashed }), // pwv + 1 closes every open session
    signOutEverywhere: id => s.bumpPwv.run(id),
    removeUser: id => s.removeUser.run(id), // patches, docs and tokens go with it (ON DELETE CASCADE)
    setRole: (id, role) => s.setRole.run(role, id),
    setName: (id, name) => s.setName.run(name, id),
    touchLogin: id => s.loggedIn.run(now(), id),
    markVerified: id => s.verified.run(now(), id),
    addToken: (hash, userId, purpose, ttlSeconds, at = Date.now()) => s.addToken.run(hash, userId, purpose, at + ttlSeconds * 1000),
    // The token's user, or null if the token is unknown, used or expired. `consume` marks it used.
    tokenUser: (hash, purpose, consume = false) => {
      const token = s.findToken.get(hash, purpose, Date.now());
      if (!token) return null;
      if (consume) s.useToken.run(Date.now(), hash);
      return s.byId.get(token.user_id) ?? null;
    },
    dropTokens: (userId, purpose) => s.dropTokens.run(userId, purpose),
    purgeTokens: () => s.purgeTokens.run(Date.now()),
    close: () => db.close()
  };
}
