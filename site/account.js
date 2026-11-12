// Account sync: keeps My patches and the other stored data of all supported pedals in the signed-in user's account.
// Needs library-merge.js. Without an account nothing changes: the data stays in this browser only.
// The data of each pedal is sent to /api/account/sync/<pedal> and the merged copy is stored back. A stored value that
// differs from the one sent last time counts as a change made here (with the time it was noticed).
// Events on window: 'account-change' (detail: /api/me answer), 'account-synced' (detail: { pedal, changed: [keys] }).

const BETA_KEY = 'site-beta-features';
const BETA_FEATURES = Object.freeze({
  audition: { label: 'Pedal audition', hint: 'Play a clean reference loop through the pedal.' },
  live: { label: 'Live mode', hint: 'Send supported edits to the pedal edit buffer.' }
});
const readBetaSettings = () => {
  try {
    const value = JSON.parse(localStorage.getItem(BETA_KEY) || '{}');
    return Object.fromEntries(Object.keys(BETA_FEATURES).map(name => [name, value?.[name] === true]));
  } catch {
    return Object.fromEntries(Object.keys(BETA_FEATURES).map(name => [name, false]));
  }
};
const setBetaSetting = (name, enabled) => {
  if (!Object.hasOwn(BETA_FEATURES, name)) return readBetaSettings();
  const settings = { ...readBetaSettings(), [name]: !!enabled };
  try { localStorage.setItem(BETA_KEY, JSON.stringify(settings)); } catch {}
  return settings;
};
const siteVersion = () => typeof window !== 'undefined' && window.SITE_UPDATES?.version ? window.SITE_UPDATES.version : '1.0';

const ACCOUNT = (() => {
  const PEDALS = ['ms60b', 'ms50g', 'ms70cdr'];
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

  const account = {
    PEDALS, KINDS, createSync, me: null,
    status: { syncing: false, lastSync: 0, error: '' },
    betaSettings: readBetaSettings,
    betaEnabled: name => readBetaSettings()[name] === true,
    setBetaFeature: setBetaSetting,
    changed: () => {}
  };

  // ---- in the page ------------------------------------------------------------------------------
  // Header entry ("Sign in" or the account menu), the signed-out notice (pages with <body data-account-notice>), the
  // reminder dialog for visitors without an account (pages with <body data-account-welcome>), the first sign-in on a
  // browser that already has patches, and sign-out (by default it removes the data from here).
  const OWNER_KEY = 'account-owner'; // email of the account this browser's data was last synced with
  const WELCOME_KEY = 'account-welcome'; // localStorage 'ignored': never show the reminder; sessionStorage 'later': not again in this visit
  const ASIDE = pedal => `${pedal}-library-aside`; // patches kept out of the account ("Not now" at the first sign-in)
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const here = () => location.pathname + location.search;

  function start() {
    const REQUEST_TIMEOUT = 15000;
    const requestWithTimeout = (input, init = {}) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
    };
    const sync = createSync({ storage: localStorage, request: requestWithTimeout, merge: LIBMERGE });
    const showMessagesHere = /^\/ms-(?:60b|50g|70cdr)(?:\/|$)/.test(location.pathname);
    const seen = {}; // fingerprint of each pedal after its last sync
    let running = null;
    let again = false;
    let timer = null;
    let ready = false; // false until the first sign-in check of this browser is done
    const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
    const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
    const list = key => { const value = readJson(key, []); return Array.isArray(value) ? value : []; };
    for (const pedal of PEDALS) localStorage.removeItem(`${pedal}-sync`); // the old anonymous sync codes

    let answered = false; // the last /api/me request was answered by the server (not the offline fallback below)
    let messageDialog = null;
    const MESSAGE_URL_RE = /https?:\/\/[^\s<>"']+/gi;
    const trimMessageUrl = url => url.replace(/[.,!?;:]+$/, '');
    const messageLine = line => {
      let html = '';
      let last = 0;
      for (const match of line.matchAll(MESSAGE_URL_RE)) {
        const raw = match[0];
        const link = trimMessageUrl(raw);
        html += esc(line.slice(last, match.index));
        html += `<a href="${esc(link)}" target="_blank" rel="noreferrer">${esc(link)}</a>${esc(raw.slice(link.length))}`;
        last = match.index + raw.length;
      }
      return html + esc(line.slice(last));
    };
    const messageBody = value => String(value ?? '').replace(/\r\n?/g, '\n').split('\n').map(messageLine).join('<br>\n');
    const messageDate = value => value ? new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
    function showMessages(messages) {
      if (!messages.length || messageDialog) return;
      const latest = messages[0];
      messageDialog = document.createElement('dialog');
      messageDialog.className = 'Overlay account-dialog account-message-dialog';
      messageDialog.innerHTML = `<div class="Overlay-header"><h2 class="Overlay-title">New messages</h2></div>
        <div class="Overlay-body">
          ${[latest].map(message => `<article class="account-message-card">
            <div class="account-message-card-date"><span class="account-message-card-label">Date</span><time datetime="${esc(message.message_date)}">${esc(messageDate(message.message_date))}</time></div>
            <div class="account-message-card-title"><span class="account-message-card-label">Title</span><h3>${esc(message.title)}</h3></div>
            <div class="account-message-card-object"><span class="account-message-card-label">Object</span><div class="account-message-card-body">${messageBody(message.objects)}</div></div>
          </article>`).join('')}
          <div class="account-actions"><a class="btn" href="/change-log">Change log</a><button class="btn btn-primary" type="button">Close</button></div>
        </div>`;
      messageDialog.addEventListener('click', event => { if (event.target.closest('button')) messageDialog.close(); });
      messageDialog.addEventListener('close', () => { messageDialog.remove(); messageDialog = null; });
      document.body.append(messageDialog);
      messageDialog.showModal();
      messageDialog.querySelector('.btn-primary').focus();
      // Acknowledge only after the messages are visible, not when /api/me is queried.
      requestWithTimeout('/api/messages/read', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    }
    async function refreshMe() {
      try {
        const response = await requestWithTimeout('/api/me', { credentials: 'same-origin', cache: 'no-store' });
        account.me = await response.json();
        answered = true;
        try { sessionStorage.setItem('account-me', JSON.stringify(account.me)); } catch {}
      } catch {
        answered = false;
        try { account.me = JSON.parse(sessionStorage.getItem('account-me')) || { signedIn: false }; } catch { account.me = { signedIn: false }; }
      }
      render();
      if (showMessagesHere && account.me?.signedIn && Array.isArray(account.me.messages)) showMessages(account.me.messages);
      emit('account-change', account.me);
      return account.me;
    }

    // Syncs all supported pedals; resolves true when everything reached the server
    function syncAll() {
      if (!account.me?.signedIn || !ready) return Promise.resolve(false);
      if (running) { again = true; return running; }
      if (!navigator.onLine) { account.status.error = 'Offline: changes are saved here and synced when the connection is back.'; render(); return Promise.resolve(false); }
      account.status = { ...account.status, syncing: true, error: '' };
      render();
      running = (async () => {
        try {
          for (const pedal of PEDALS) {
            const { changed, pending } = await sync.syncPedal(pedal);
            seen[pedal] = pending ? '' : sync.fingerprint(pedal);
            if (changed.length) emit('account-synced', { pedal, changed });
          }
          account.status.lastSync = Date.now();
          return true;
        } catch (error) {
          if (error.signedOut) await refreshMe();
          else account.status.error = error instanceof TypeError || error?.name === 'AbortError' ? 'Cannot reach the server: will retry.' : error.message;
          return false;
        } finally {
          account.status.syncing = false;
          running = null;
          render();
          emit('account-change', account.me);
          if (again) { again = false; schedule(); }
        }
      })();
      return running;
    }
    function schedule(delay = 2000) { clearTimeout(timer); timer = setTimeout(syncAll, delay); }

    // ---- first sign-in on this browser ----
    // The account's copy without changing it: a sync that sends nothing
    async function peek(pedal) {
      const response = await requestWithTimeout(`/api/account/sync/${pedal}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{"patches":[],"deleted":{}}' });
      if (!response.ok) throw new Error(`Server error ${response.status}.`);
      return response.json();
    }
    async function firstSignIn() {
      const owner = (localStorage.getItem(OWNER_KEY) || '').toLowerCase();
      const email = account.me.email.toLowerCase();
      if (owner === email) return;
      const ownerChanged = owner && owner !== email;
      const hasLocalData = ownerChanged && PEDALS.some(pedal => ['library', 'deleted', 'pedal-edit', ...KINDS].some(kind => localStorage.getItem(`${pedal}-${kind}`) !== null));
      if (hasLocalData) {
        const add = await choose({
          title: 'Dati locali e nuovo account',
          text: 'Questo browser contiene dati associati a un altro account.',
          note: 'Aggiungerli invierà i dati locali al nuovo account. Iniziare dai dati del nuovo account rimuoverà la copia locale da questo browser.',
          primary: 'Aggiungi al nuovo account', secondary: 'Inizia dai dati account'
        });
        if (add !== true) clearBrowser();
      }
      if (ownerChanged) for (const pedal of PEDALS) localStorage.removeItem(`${pedal}-account-sync`); // synced with another account
      const local = PEDALS.flatMap(pedal => list(`${pedal}-library`).map(p => ({ pedal, id: p.id })));
      let missing = local;
      let accountHas = 0;
      if (local.length) {
        const remote = {};
        for (const pedal of PEDALS) remote[pedal] = new Set((await peek(pedal)).patches.map(p => p.id));
        accountHas = PEDALS.reduce((n, pedal) => n + remote[pedal].size, 0);
        missing = local.filter(p => !remote[p.pedal].has(p.id));
      }
      if (missing.length && accountHas) {
        const add = await choose({
          title: 'Patches in this browser',
          text: `This browser has ${missing.length} ${missing.length === 1 ? 'patch' : 'patches'} that ${missing.length === 1 ? 'is' : 'are'} not in your account.`,
          note: 'Not now keeps them aside in this browser only: you can add them later from the account menu.',
          primary: 'Add them to my account', secondary: 'Not now'
        });
        if (!add) {
          for (const pedal of PEDALS) {
            const aside = LIBMERGE.merge({ patches: list(ASIDE(pedal)), deleted: {} }, { patches: list(`${pedal}-library`), deleted: {} });
            if (aside.patches.length) localStorage.setItem(ASIDE(pedal), JSON.stringify(aside.patches));
            localStorage.removeItem(`${pedal}-library`);
            localStorage.removeItem(`${pedal}-deleted`);
          }
        } else toast(`${missing.length} ${missing.length === 1 ? 'patch' : 'patches'} from this browser added to your account.`);
      } else if (missing.length) toast(`Your ${missing.length} ${missing.length === 1 ? 'patch is' : 'patches are'} now kept in your account.`);
      localStorage.setItem(OWNER_KEY, email);
    }

    function addAside() {
      for (const pedal of PEDALS) {
        const aside = list(ASIDE(pedal));
        if (!aside.length) continue;
        const merged = LIBMERGE.merge({ patches: list(`${pedal}-library`), deleted: readJson(`${pedal}-deleted`, {}) }, { patches: aside, deleted: {} });
        localStorage.setItem(`${pedal}-library`, JSON.stringify(merged.patches));
        localStorage.removeItem(ASIDE(pedal));
        emit('account-synced', { pedal, changed: [`${pedal}-library`] });
      }
      render();
      syncAll();
    }

    // ---- sign out ----
    function clearBrowser() {
      for (const pedal of PEDALS) {
        for (const kind of ['library', 'deleted', 'library-aside', 'account-sync', 'pedal-edit', 'usb-last-read', ...KINDS]) localStorage.removeItem(`${pedal}-${kind}`);
      }
      localStorage.removeItem(OWNER_KEY);
    }
    async function signOut() {
      const remove = await choose({
        title: 'Sign out',
        text: 'Your patches, settings and pedal backups stay in your account.',
        note: 'Remove them from this browser on a shared computer; keep a copy to keep working here without signing in.',
        primary: 'Remove from this browser', secondary: 'Keep a copy here', cancel: true
      });
      if (remove === null) return;
      if (remove && !(await syncAll())) {
        const anyway = await choose({
          title: 'Sign out',
          text: "Can't reach the server: your latest changes are only in this browser.",
          note: 'Sign out anyway and keep them here?', primary: 'Sign out and keep them', secondary: 'Cancel'
        });
        if (!anyway) return;
        return finishSignOut(false);
      }
      if (!remove) await syncAll();
      finishSignOut(remove);
    }
    async function finishSignOut(remove) {
      try { await fetch('/logout', { method: 'POST', credentials: 'same-origin', redirect: 'manual', body: new URLSearchParams({ next: '/' }) }); } catch {}
      if (remove) clearBrowser();
      try { sessionStorage.removeItem('account-me'); } catch {}
      location.reload();
    }

    // ---- interface ----
    const header = document.querySelector('.gh-header');
    const slot = document.createElement('div');
    slot.className = 'account-slot';
    header?.append(slot);
    let notice = null;

    // What the slot shows now. A render that changes nothing leaves the button alone, and one that only changes
    // the menu (the sync state) keeps the button too: rebuilding it makes the header flicker and drops keyboard focus.
    let shown = { button: '', menu: '' };
    function paint(button, menu = '') {
      if (button === shown.button && menu === shown.menu) return;
      const details = slot.querySelector('details');
      if (menu && details && button === shown.button) {
        details.querySelector('.account-dropdown').outerHTML = menu;
      } else {
        slot.innerHTML = menu ? `<details class="account-menu"${details?.open ? ' open' : ''}>${button}${menu}</details>` : button;
      }
      shown = { button, menu };
    }

    function render() {
      const me = account.me;
      document.documentElement.classList.toggle('signed-out', !me?.signedIn);
      document.documentElement.classList.toggle('signed-in', !!me?.signedIn);
      if (!me) return;
      if (!me.signedIn) {
        paint(`<a class="btn btn-sm account-signin" href="/login?next=${encodeURIComponent(here())}">Sign in</a>`);
      } else {
        const s = account.status;
        const state = s.syncing ? 'Syncing…' : s.error || (s.lastSync ? `Synced at ${new Date(s.lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Not synced yet');
        const aside = PEDALS.reduce((n, pedal) => n + list(ASIDE(pedal)).length, 0);
        const beta = readBetaSettings();
        const betaCount = Object.values(beta).filter(Boolean).length;
        paint(
          `<summary class="btn btn-sm account-button${s.error ? ' has-error' : ''}" aria-label="Account: ${esc(me.email)}" title="${esc(me.email)}">${esc((me.name || me.email).charAt(0).toUpperCase())}</summary>`,
          `<div class="account-dropdown" role="menu">
            <div class="account-who"><b>${esc(me.name || me.email)}</b>${me.name ? `<span>${esc(me.email)}</span>` : ''}<small class="account-version">v. ${esc(siteVersion())}</small></div>
            <div class="account-state" role="status">${esc(state)}</div>
            ${aside ? `<button class="account-item" type="button" data-action="aside">Add ${aside} ${aside === 1 ? 'patch' : 'patches'} kept aside in this browser</button>` : ''}
            <div class="account-beta" role="group" aria-labelledby="account-beta-title">
              <div class="account-beta-title" id="account-beta-title"><b>Beta features</b><small>${betaCount ? `${betaCount} enabled` : 'Off by default'}</small></div>
              ${Object.entries(BETA_FEATURES).map(([name, feature]) => `<label class="account-beta-option"><input type="checkbox" data-beta="${name}"${beta[name] ? ' checked' : ''}><span><b>${feature.label}</b><small>${feature.hint}</small></span></label>`).join('')}
            </div>
            <a class="account-item" href="/change-log">Change log</a>
            ${me.admin ? '<a class="account-item" href="/admin">Users</a>' : ''}
            <button class="account-item" type="button" data-action="signout">Sign out</button>
          </div>`
        );
      }
      renderNotice();
    }
    slot.addEventListener('click', event => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'signout') { slot.querySelector('details').open = false; signOut(); }
      if (action === 'aside') addAside();
    });
    slot.addEventListener('change', event => {
      const input = event.target.closest('input[data-beta]');
      if (!input || !account.me?.signedIn) return;
      const settings = account.setBetaFeature(input.dataset.beta, input.checked);
      render();
      emit('beta-change', { feature: input.dataset.beta, enabled: settings[input.dataset.beta], settings });
    });
    document.addEventListener('click', event => { const menu = slot.querySelector('details[open]'); if (menu && !menu.contains(event.target)) menu.open = false; });

    function renderNotice() {
      const show = document.body.hasAttribute('data-account-notice') && account.me && !account.me.signedIn && sessionStorage.getItem('account-notice') !== 'dismissed';
      if (!show) { notice?.remove(); notice = null; return; }
      if (notice) return;
      const next = encodeURIComponent(here());
      notice = document.createElement('div');
      notice.className = 'account-notice';
      notice.setAttribute('role', 'note');
      notice.innerHTML = `<p><b>Not signed in.</b> Your patches, settings and pedal backups are stored only in this browser.
        Clearing browsing data, a private window or another device won't have them.
        <a href="/login?next=${next}">Sign in</a> or <a href="/register?next=${next}">create a free account</a> to keep them safe.</p>
        <button class="btn btn-sm btn-invisible" type="button">Dismiss</button>`;
      notice.querySelector('button').addEventListener('click', () => {
        try { sessionStorage.setItem('account-notice', 'dismissed'); } catch {}
        renderNotice();
      });
      header ? header.after(notice) : document.body.prepend(notice);
    }

    // ---- reminder for visitors without an account ----
    // The advantages of an account, with the links to sign up or sign in. "Ignore this message" hides it for good in
    // this browser; closing it any other way hides it for this visit only, so it comes back the next time the site is opened.
    let welcome = null;
    const stored = (storage, key) => { try { return storage.getItem(key); } catch { return null; } };
    const welcomeHidden = () => stored(localStorage, WELCOME_KEY) === 'ignored' || stored(sessionStorage, WELCOME_KEY) === 'later';
    function showWelcome() {
      if (welcome || !document.body.hasAttribute('data-account-welcome') || account.me?.signedIn || welcomeHidden()) return;
      const next = encodeURIComponent(here());
      welcome = document.createElement('dialog');
      welcome.className = 'Overlay Overlay--small account-dialog account-welcome';
      welcome.setAttribute('aria-labelledby', 'account-welcome-title');
      welcome.innerHTML = `<div class="Overlay-header"><h2 class="Overlay-title" id="account-welcome-title">Keep your patches safe with a free account</h2></div>
        <div class="Overlay-body">
          <p>You are using the studio without an account, so your patches, settings and pedal backups are stored only in this browser.</p>
          <ul class="account-perks">
            <li>Everything is saved on the server for all supported pedals and is the same on every device where you sign in.</li>
            <li>The patches already in this browser come with you when you sign up.</li>
            <li>Only an email and a password are needed. Download everything or delete the account whenever you want.</li>
          </ul>
          <div class="account-actions">
            <a class="btn" href="/login?next=${next}">Sign in</a>
            <a class="btn btn-primary" href="/register?next=${next}">Create a free account</a>
          </div>
          <div class="account-later">
            <button class="btn btn-sm btn-invisible" type="button" data-welcome="later">Maybe later</button>
            <button class="btn btn-sm btn-invisible" type="button" data-welcome="ignore">Ignore this message</button>
          </div>
          <p class="account-note">Maybe later asks again the next time you visit. Ignore this message hides it for good in this browser. <a href="/privacy.html">What is stored</a></p>
        </div>`;
      welcome.addEventListener('click', event => {
        const choice = event.target.closest('[data-welcome]')?.dataset.welcome;
        if (!choice) return;
        if (choice === 'ignore') { try { localStorage.setItem(WELCOME_KEY, 'ignored'); } catch {} }
        welcome.close();
      });
      welcome.addEventListener('close', () => { // also Esc
        try { sessionStorage.setItem(WELCOME_KEY, 'later'); } catch {}
        welcome.remove();
        welcome = null;
      });
      document.body.append(welcome);
      welcome.showModal();
      welcome.querySelector('.btn-primary').focus();
    }

    // A small dialog; resolves true (primary), false (secondary) or null (cancelled)
    function choose({ title, text, note = '', primary, secondary, cancel = false }) {
      return new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.className = 'Overlay Overlay--small account-dialog';
        dialog.innerHTML = `<div class="Overlay-header"><h2 class="Overlay-title">${esc(title)}</h2></div>
          <div class="Overlay-body"><p>${esc(text)}</p>${note ? `<p class="account-note">${esc(note)}</p>` : ''}
          <div class="account-actions">${cancel ? '<button class="btn" type="button" value="">Cancel</button>' : ''}
          <button class="btn" type="button" value="no">${esc(secondary)}</button><button class="btn btn-primary" type="button" value="yes">${esc(primary)}</button></div></div>`;
        let answer = null;
        dialog.addEventListener('click', event => {
          const button = event.target.closest('button');
          if (!button) return;
          answer = button.value === 'yes' ? true : button.value === 'no' ? false : null;
          dialog.close();
        });
        dialog.addEventListener('close', () => { dialog.remove(); resolve(answer); });
        document.body.append(dialog);
        dialog.showModal();
        dialog.querySelector('.btn-primary').focus();
      });
    }

    function toast(text) {
      const bar = document.createElement('div');
      bar.className = 'update-bar';
      bar.setAttribute('role', 'status');
      bar.innerHTML = `<span>${esc(text)}</span><button class="btn btn-sm btn-invisible" type="button" aria-label="Dismiss">OK</button>`;
      bar.querySelector('button').addEventListener('click', () => bar.remove());
      document.body.append(bar);
      setTimeout(() => bar.remove(), 8000);
    }

    // Pages write localStorage directly: a cheap check every few seconds notices their changes
    const changedHere = () => PEDALS.some(pedal => seen[pedal] !== undefined && seen[pedal] !== sync.fingerprint(pedal));
    setInterval(() => { if (account.me?.signedIn && !running && changedHere()) schedule(); }, 5000);
    window.addEventListener('storage', event => {
      if (event.key === OWNER_KEY) return refreshMe();
      if (PEDALS.some(p => event.key?.startsWith(`${p}-`)) && !event.key.endsWith('-account-sync')) schedule();
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncAll(); });
    window.addEventListener('online', syncAll);

    account.syncNow = syncAll;
    account.changed = () => schedule(500);
    // Every page is a new document: paint the header from this tab's last /api/me answer at once (refreshMe confirms it)
    // instead of leaving the slot empty until the request returns
    try { account.me = JSON.parse(sessionStorage.getItem('account-me')); } catch { account.me = null; }
    render();
    refreshMe().then(async me => {
      if (me.signedIn) {
        try {
          await firstSignIn();
          ready = true;
          await syncAll();
        } catch {
          account.status.error = 'Cannot reach the server: reload the page to sync.';
          render();
        }
      } else if (answered) showWelcome();
    });
  }

  function loadUpdates() {
    if (typeof window === 'undefined' || window.SITE_UPDATES || typeof document === 'undefined') return Promise.resolve();
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = '/updates.js?v=updates2-20261112';
      script.onload = resolve;
      script.onerror = resolve; // the account remains usable if an offline cache has no manifest yet
      (document.head || document.documentElement).append(script);
    });
  }

  if (typeof window !== 'undefined') window.ACCOUNT = account;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof LIBMERGE !== 'undefined') loadUpdates().finally(start);
  return account;
})();

if (typeof module !== 'undefined') module.exports = ACCOUNT;
