// Merge rules for syncing "My patches" between devices, shared by the site (builder.js) and the sync server (deploy/server.mjs).
// State shape: { patches: [{ id, name, effects, output, updatedAt }], deleted: { [id]: ISO time } }
// The newest edit of each patch wins; a deletion wins over an edit that is not newer than it.

const LIBMERGE = (() => {
  const TOMBSTONE_DAYS = 90;
  const time = value => { const t = Date.parse(value); return Number.isFinite(t) ? t : 0; };

  // `local` keeps its order; patches that exist only in `remote` are added at the top, newest first.
  function merge(local, remote, now = Date.now()) {
    const deleted = {};
    for (const source of [local.deleted || {}, remote.deleted || {}]) {
      for (const [id, at] of Object.entries(source)) if (time(at) > time(deleted[id])) deleted[id] = at;
    }
    const remoteById = new Map((remote.patches || []).map(p => [p.id, p]));
    const localIds = new Set((local.patches || []).map(p => p.id));
    const pick = (a, b) => (b && time(b.updatedAt) > time(a.updatedAt) ? b : a);
    const ordered = [
      ...[...remoteById.values()].filter(p => !localIds.has(p.id)).sort((a, b) => time(b.updatedAt) - time(a.updatedAt)),
      ...(local.patches || []).map(p => pick(p, remoteById.get(p.id)))
    ];
    const patches = ordered.filter(p => {
      if (deleted[p.id] && time(deleted[p.id]) >= time(p.updatedAt)) return false;
      delete deleted[p.id]; // the patch was edited after it was deleted: it lives
      return true;
    });
    const cutoff = now - TOMBSTONE_DAYS * 864e5;
    for (const [id, at] of Object.entries(deleted)) if (time(at) < cutoff) delete deleted[id];
    return { patches, deleted };
  }

  return { merge, time };
})();

if (typeof module !== 'undefined') module.exports = LIBMERGE;
