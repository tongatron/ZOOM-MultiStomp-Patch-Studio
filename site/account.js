// Account sync: keeps My patches and the other stored data of both pedals in the signed-in user's account.
// Needs library-merge.js. Without an account nothing changes: the data stays in this browser only.
// The data of each pedal is sent to /api/account/sync/<pedal> and the merged copy is stored back. A stored value that
// differs from the one sent last time counts as a change made here (with the time it was noticed).
// Events on window: 'account-change' (detail: /api/me answer), 'account-synced' (detail: { pedal, changed: [keys] }).

const ACCOUNT = (() => {
  const PEDALS = ['ms60b', 'ms50g'];
  const KINDS = ['advice', 'view', 'builder', 'rulepacks', 'usb-backups']; // stored as `${pedal}-${kind}`

  // storage: a localStorage-like object; request: fetch. Separate from the page so tools/sync-test.mjs can run it.
  function createSync({ storage, request, merge, now = () => new Date().toISOString() }) {
    const read = key => { try { return storage.getItem(key); } catch { return null; } };
    const readJson = (key, fallback) => { try { return JSON.parse(read(key)) ?? fallback; } catch { return fallback; } };
    const metaKey = pedal => `${pedal}-account-sync`; // { docs: { [kind]: { data, updatedAt } }, lastSync }
    const libraryOf = pedal => {
      const patches = readJson(`${pedal}-library`, []);
      const deleted = readJson(`${pedal}-deleted`, {});
      return { patches: Array.isArray(patches) ? patches : [], deleted: deleted && typeof deleted === 'object' && !Array.isArray(deleted) ? deleted : {} };
    };

    function snapshot(pedal) {
      const sent = readJson(metaKey(pedal), {}).docs || {};
      const docs = {};
      for (const kind of KINDS) {
        const data = read(`${pedal}-${kind}`);
        const last = sent[kind];
        if (last && last.data === data) docs[kind] = last; // unchanged since the last sync
        else if (data !== null || last) docs[kind] = { data, updatedAt: now() }; // changed, added or removed here
      }
      return { ...libraryOf(pedal), docs };
    }

    // Everything this browser keeps for a pedal, as one string: tells whether anything changed since a sync
    const fingerprint = pedal => ['library', 'deleted', ...KINDS].map(kind => read(`${pedal}-${kind}`)).join('\u0000');

    async function syncPedal(pedal) {
      const sent = snapshot(pedal);
      const response = await request(`/api/account/sync/${pedal}`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sent)
      });
      if (response.status === 401) { const out = new Error('Signed out.'); out.signedOut = true; throw out; }
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `Server error ${response.status}.`);
      const merged = await response.json();
      const changed = [];
      let pending = false;
      const write = (key, value) => {
        if (read(key) === value) return;
        if (value === null) storage.removeItem(key); else storage.setItem(key, value);
        changed.push(key);
      };
      // Changes made while the request was on its way are merged in again (and sent with the next sync)
      const current = libraryOf(pedal);
      if (JSON.stringify(current) !== JSON.stringify({ patches: sent.patches, deleted: sent.deleted })) pending = true;
      const library = merge.merge(current, merged);
      write(`${pedal}-library`, JSON.stringify(library.patches));
      write(`${pedal}-deleted`, JSON.stringify(library.deleted));
      const docs = {};
      for (const kind of KINDS) {
        const doc = merged.docs?.[kind];
        if (!doc) continue;
        docs[kind] = doc;
        const key = `${pedal}-${kind}`;
        if (read(key) !== (sent.docs[kind]?.data ?? null)) { pending = true; continue; } // changed meanwhile: it wins next time
        write(key, doc.data);
      }
      storage.setItem(metaKey(pedal), JSON.stringify({ docs, lastSync: Date.now() }));
      return { changed, pending };
    }

    return { syncPedal, snapshot, fingerprint };
  }

  const account = { PEDALS, KINDS, createSync, me: null, status: { syncing: false, lastSync: 0, error: '' } };

  // ---- in the page ------------------------------------------------------------------------------
  function start() {
    const sync = createSync({ storage: localStorage, request: (...args) => fetch(...args), merge: LIBMERGE });
    const seen = {}; // fingerprint of each pedal after its last sync
    let running = false;
    let again = false;
    let timer = null;
    const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

    async function refreshMe() {
      try {
        const response = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' });
        account.me = await response.json();
        try { sessionStorage.setItem('account-me', JSON.stringify(account.me)); } catch {}
      } catch {
        try { account.me = JSON.parse(sessionStorage.getItem('account-me')) || { signedIn: false }; } catch { account.me = { signedIn: false }; }
      }
      emit('account-change', account.me);
      return account.me;
    }

    async function syncAll() {
      if (!account.me?.signedIn) return;
      if (running) { again = true; return; }
      if (!navigator.onLine) { account.status.error = 'Offline: changes are saved here and synced when the connection is back.'; emit('account-change', account.me); return; }
      running = true;
      account.status = { ...account.status, syncing: true, error: '' };
      try {
        for (const pedal of PEDALS) {
          const { changed, pending } = await sync.syncPedal(pedal);
          seen[pedal] = pending ? '' : sync.fingerprint(pedal);
          if (changed.length) emit('account-synced', { pedal, changed });
        }
        account.status.lastSync = Date.now();
      } catch (error) {
        if (error.signedOut) await refreshMe();
        else account.status.error = error instanceof TypeError ? 'Cannot reach the server: will retry.' : error.message;
      } finally {
        account.status.syncing = false;
        running = false;
        emit('account-change', account.me);
        if (again) { again = false; schedule(); }
      }
    }

    function schedule(delay = 2000) { clearTimeout(timer); timer = setTimeout(syncAll, delay); }
    // Pages write localStorage directly: a cheap check every few seconds notices their changes
    const changedHere = () => PEDALS.some(pedal => seen[pedal] !== undefined && seen[pedal] !== sync.fingerprint(pedal));
    setInterval(() => { if (account.me?.signedIn && !running && changedHere()) schedule(); }, 5000);
    window.addEventListener('storage', event => { if (PEDALS.some(p => event.key?.startsWith(`${p}-`)) && !event.key.endsWith('-account-sync')) schedule(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncAll(); });
    window.addEventListener('online', syncAll);

    account.syncNow = syncAll;
    account.refresh = () => refreshMe().then(syncAll);
    refreshMe().then(syncAll);
  }

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof LIBMERGE !== 'undefined') start();
  return account;
})();

if (typeof module !== 'undefined') module.exports = ACCOUNT;
