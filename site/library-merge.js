// Merge rules for syncing "My patches" between devices, shared by the site (builder.js) and the sync server (deploy/server.mjs).
// State shape: { patches: [{ id, name, effects, output, updatedAt }], deleted: { [id]: ISO time } }
// The newest edit of each patch wins; a deletion wins over an edit that is not newer than it.
// mergeDocs: the other data kept in an account (settings, rule packs, pedal backups), see site/account.js.

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

  // Docs: { [kind]: { data: the browser's stored string or null, updatedAt } }. The newest copy of each kind wins,
  // except pedal backups, which are only ever added: both sides are kept (by id, the newest MAX_BACKUPS).
  // A deleted backup stays as { id, deleted: true, at } for 90 days, so the other copy does not bring it back.
  const MAX_BACKUPS = 30;
  const GRAVE_DAYS = 90;
  const parseList = text => { try { const list = JSON.parse(text); return Array.isArray(list) ? list : []; } catch { return []; } };
  function mergeBackups(a, b, now = Date.now()) {
    if (a == null && b == null) return null;
    const byId = new Map();
    const graves = new Map();
    for (const item of [...parseList(a), ...parseList(b)]) {
      if (!item || typeof item.id !== 'string') continue;
      if (item.deleted) graves.set(item.id, item);
      else if (!byId.has(item.id)) byId.set(item.id, item);
    }
    const live = [...byId.values()].filter(item => !graves.has(item.id)).sort((x, y) => time(y.at) - time(x.at)).slice(0, MAX_BACKUPS);
    const recent = [...graves.values()].filter(grave => time(grave.at) >= now - GRAVE_DAYS * 864e5);
    return JSON.stringify([...live, ...recent]);
  }
  function mergeDocs(local = {}, remote = {}, now = Date.now()) {
    const docs = {};
    for (const kind of new Set([...Object.keys(local), ...Object.keys(remote)])) {
      const a = local[kind], b = remote[kind];
      if (!a || !b) { docs[kind] = a || b; continue; }
      const newer = time(b.updatedAt) > time(a.updatedAt) ? b : a;
      docs[kind] = kind === 'usb-backups' ? { data: mergeBackups(a.data, b.data, now), updatedAt: newer.updatedAt } : newer;
    }
    return docs;
  }

  return { merge, mergeDocs, time };
})();

if (typeof module !== 'undefined') module.exports = LIBMERGE;
