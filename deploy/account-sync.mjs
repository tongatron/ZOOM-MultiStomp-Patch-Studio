// Account sync: POST /api/account/sync/<pedal> with { patches, deleted, docs } merges the browser's data with the
// copy kept in the signed-in user's account and returns the merged state (site/account.js stores it back).
// Patches use the same merge rules as the anonymous sync (site/library-merge.js); docs are the other stored data.

// The browser keys `${pedal}-${kind}` kept in an account, with their maximum size in characters
export const DOC_LIMITS = { advice: 4_000, view: 100, builder: 20_000, rulepacks: 200_000, 'usb-backups': 200_000 };
export const PEDALS = ['ms60b', 'ms50g'];
const isoDate = value => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));

export function cleanDocs(docs) {
  const clean = {};
  if (!docs || typeof docs !== 'object') return clean;
  for (const [kind, limit] of Object.entries(DOC_LIMITS)) {
    const doc = docs[kind];
    if (!doc || !isoDate(doc.updatedAt)) continue;
    if (doc.data === null || (typeof doc.data === 'string' && doc.data.length <= limit)) clean[kind] = { data: doc.data, updatedAt: doc.updatedAt };
  }
  return clean;
}

export function createAccountSync({ store, LIBMERGE, maxPatches }) {
  const { db } = store;
  const q = {
    patches: db.prepare('SELECT id, data, updated_at, deleted_at FROM patches WHERE user_id = ? AND pedal = ? ORDER BY pos'),
    dropPatches: db.prepare('DELETE FROM patches WHERE user_id = ? AND pedal = ?'),
    addPatch: db.prepare('INSERT INTO patches (user_id, pedal, id, data, pos, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)'),
    docs: db.prepare('SELECT kind, data, updated_at FROM docs WHERE user_id = ? AND pedal = ?'),
    putDoc: db.prepare(`INSERT INTO docs (user_id, pedal, kind, data, updated_at) VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT (user_id, pedal, kind) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`)
  };

  // The account's copy: { patches, deleted, docs }. A doc removed in the browser is kept as data null.
  function load(userId, pedal) {
    const patches = [];
    const deleted = {};
    for (const row of q.patches.all(userId, pedal)) {
      if (row.deleted_at) deleted[row.id] = row.deleted_at;
      else patches.push(JSON.parse(row.data));
    }
    const docs = {};
    for (const row of q.docs.all(userId, pedal)) docs[row.kind] = { data: row.data === null ? null : JSON.parse(row.data), updatedAt: row.updated_at };
    return { patches, deleted, docs };
  }

  // incoming is already cleaned (cleanState + cleanDocs). One transaction: the merge is atomic.
  function sync(userId, pedal, incoming) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const stored = load(userId, pedal);
      const merged = LIBMERGE.merge(stored, incoming);
      merged.patches = merged.patches.slice(0, maxPatches);
      merged.docs = LIBMERGE.mergeDocs(stored.docs, incoming.docs);
      q.dropPatches.run(userId, pedal);
      merged.patches.forEach((p, pos) => q.addPatch.run(userId, pedal, p.id, JSON.stringify(p), pos, p.updatedAt, null));
      for (const [id, at] of Object.entries(merged.deleted)) q.addPatch.run(userId, pedal, id, '{}', -1, at, at);
      for (const [kind, doc] of Object.entries(merged.docs)) q.putDoc.run(userId, pedal, kind, JSON.stringify(doc.data), doc.updatedAt);
      db.exec('COMMIT');
      return merged;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  return { sync, load };
}
