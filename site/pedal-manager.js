// Pedal manager (pedal-manager.html, experimental): the patch memories of the pedal, read over Web MIDI (pedal-midi.js),
// next to the patches saved in this browser (My patches of the builder). A pedal patch can be opened in the
// builder, copied to My patches or downloaded; a local patch can be sent to the selected memory. Every write first
// reads the target memory and keeps it as a backup (localStorage and a downloaded .zptc), asks for confirmation,
// then reads the memory back and compares it with what was sent.
(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const NO_MIDI = 'This browser has no Web MIDI. Use Chrome or Edge on a computer.';
  const LIBRARY_KEY = `${PEDAL.id}-library`; // shared with the builder: [{ id, name, effects: [{ index, on, values }], output, updatedAt }]
  const DRAFT_KEY = `${PEDAL.id}-builder`;
  const EDIT_KEY = `${PEDAL.id}-pedal-edit`; // { memory, name, base: base64 PTCF, at } while a memory is edited in the builder
  const CLEARED_NAME = 'Empty'; // name of a cleared memory: no effects, only the BLANK slot
  // [{ id, memory, name, at, data: base64 of the whole memory }], newest first. A deleted backup stays as { id, deleted: true, at }
  // for 90 days, so that an account does not bring it back (backups are only ever added when two copies are merged)
  const BACKUP_KEY = `${PEDAL.id}-usb-backups`;
  const MAX_BACKUPS = 30;
  const GRAVE_MS = 90 * 864e5;
  // The memories as last read, so the list stays visible (greyed, read-only) while the pedal is not connected:
  // { at, count, memories: { n: base64 of the PTCF file | null for an empty memory } }
  const LAST_READ_KEY = `${PEDAL.id}-usb-last-read`;
  const PEDAL_HINT = 'Select a memory: it is where a patch from the left goes.';
  const lines = [];
  let info = null; // { count, size, bankSize } from the pedal
  let connected = false;
  let reading = 0; // bumps on every full read, so an older read stops
  let busy = false; // a full read or a write is running: one exchange with the pedal at a time
  let fullRead = false; // readAll() is running: the last-read list is saved once, at the end
  const memories = new Map(); // number → { state: 'loading' | 'ok' | 'empty' | 'error', data, memory, decoded, error }
  let selected = null; // memory number where a local patch goes
  let fileItem = null; // { name, bytes } from "Send a .zptc file"
  let renaming = null; // memory number whose rename field is open
  let moving = null; // { n, swap } while the move or swap form of memory n is open
  let staleOpen = null; // memory number whose saved patch is open in the list shown while the pedal is not connected
  // "Send to memory N" in the builder opens this page with #send=N: once the pedal is read, the builder's patch goes there
  let pendingSend = Number(new URLSearchParams(location.hash.replace(/^#/, '')).get('send')) || null;
  if (pendingSend) history.replaceState(null, '', location.pathname);

  // ---- log and status --------------------------------------------------------------------------------
  const showLog = () => { $('#usb-log').textContent = lines.join('\n'); };
  PEDALMIDI.onLog((dir, bytes) => {
    const text = PEDALMIDI.hex(bytes);
    lines.push(`${new Date().toISOString().slice(11, 23)} ${dir === 'out' ? '→' : '←'} ${bytes.length} B  ${text.length > 600 ? `${text.slice(0, 600)} …` : text}`);
    if (lines.length > 2000) lines.splice(0, lines.length - 2000);
    showLog();
  });
  const note = text => { lines.push(`   ${text}`); showLog(); };
  // Octicons "upload": the send button of each patch (its tooltip names the memory)
  const ICON_SEND = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/><path fill="currentColor" d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z"/></svg>';
  const status = (text, kind = '') => { $('#usb-status').textContent = text; $('#usb-status').dataset.kind = kind; };
  const result = (ok, text) => { $('#usb-result').innerHTML = text ? `<p class="usb-result" data-ok="${ok}">${escapeHtml(text)}</p>` : ''; };
  // Runs one step; a failure shows in the status line and the log
  async function step(label, fn) {
    status(`${label}…`);
    try { return { ok: true, value: await fn() }; } catch (error) {
      status(error.message, 'danger');
      note(`${label} failed: ${error.message}`);
      return { ok: false, value: null, error };
    }
  }

  // ---- helpers ---------------------------------------------------------------------------------------
  const toBase64 = bytes => btoa(String.fromCharCode(...bytes));
  const fromBase64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
  const ptcfOf = bytes => bytes.slice(0, Math.min(bytes.length, new DataView(bytes.buffer, bytes.byteOffset).getUint32(4, true) || bytes.length));
  const sameBytes = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const when = iso => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const fileName = text => text.replace(/[^A-Za-z0-9 ._-]/g, '').trim() || 'PATCH';
  const download = (bytes, name) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
    Object.assign(document.createElement('a'), { href: url, download: name }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const chainText = names => names.length ? names.join(' → ') : 'no effects';
  // The chain of a decoded patch as effect cards with their pedal images, in signal order
  const chainCards = d => d.effects.length ? `<ol class="usb-fx">${d.effects.map(e => {
    const index = EFFECTS_DATA.findIndex(fx => fx[0] === e.effect);
    const category = CATEGORIES[EFFECTS_DATA[index]?.[1]];
    return `<li class="${e.on ? '' : 'is-off'}">
      ${index === -1 ? '' : `<img class="fx-thumb" src="assets/effects/fx-${String(index).padStart(3, '0')}.png" alt="" width="40" height="50" loading="lazy" />`}
      <span><b>${escapeHtml(e.effect)}</b><span class="usb-fx-tags">${category ? `<span class="Label">${escapeHtml(category.label)}</span>` : ''}${e.on ? '' : '<span class="Label">Off</span>'}</span></span>
    </li>`;
  }).join('')}</ol>` : '<p class="usb-chain-line">No effects.</p>';

  // Decoded PTCF → builder patch: { name, effects: [{ index, on, values }] }
  function toPatch(decoded) {
    const effects = decoded.effects.flatMap(e => {
      const index = EFFECTS_DATA.findIndex(fx => fx[0] === e.effect);
      if (index === -1) return [];
      const values = Object.fromEntries(Object.entries(e.params).map(([n, v]) => [n, v && typeof v === 'object' ? v.raw : v]));
      return [{ index, on: e.on, values }];
    });
    return { name: decoded.name.replace(/[^!%&'+,\-.=_ A-Za-z0-9]/g, '').trim().slice(0, 28) || 'PEDAL', effects };
  }
  // Builder patch → PTCF bytes, encoded like the builder's Download .zptc. With base (the PTCF of the pedal
  // memory it was opened from), the data the builder does not edit is kept: description, header, slot layout and
  // the patch data in PRM2 (the bits that follow the chain are recomputed).
  function toFile(patch, base = null) {
    if (!patch.effects?.length) throw new Error('The patch has no effects.');
    if (!String(patch.name || '').trim()) throw new Error('The patch has no name. Give it one in the patch builder first.');
    let kept = {};
    if (base) {
      const b = ZPTC.decode(base);
      kept = { _version: b._version, _header: b._header, _txj1: b._txj1, _slot0: b._slot0, _noBlank: b._noBlank, _prm2: b._prm2, _prm2Refresh: true,
        description: b.description, shortName: patch.name.trim() === b.name ? b.shortName : undefined };
      Object.keys(kept).forEach(k => kept[k] === undefined && delete kept[k]);
    }
    return ZPTC.encode({
      ...kept,
      name: patch.name.trim(),
      effects: patch.effects.filter(e => EFFECTS_DATA[e.index]).map(e => ({
        effect: EFFECTS_DATA[e.index][0], on: e.on !== false,
        params: Object.fromEntries(EFFECTS_DATA[e.index][5].map(([n, , range]) => [n, ZPTC.codec(range, n) ? e.values?.[n] : { raw: Number(e.values?.[n]) || 0 }]))
      }))
    }).file;
  }

  // ---- connection ------------------------------------------------------------------------------------
  async function listPorts() {
    const { inputs, outputs } = await PEDALMIDI.ports();
    const options = list => list.map(p => `<option value="${escapeHtml(p.id)}"${/zoom/i.test(p.name) ? ' selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
    $('#usb-in').innerHTML = options(inputs);
    $('#usb-out').innerHTML = options(outputs);
  }
  function setConnected(on) {
    connected = on;
    staleOpen = null;
    $('#usb-connect').hidden = on;
    $('#usb-disconnect').hidden = !on;
    $('#usb-steps').hidden = on;
    $('#usb-refresh').disabled = !on || !info;
    renderMemories();
    renderLocals();
    renderBackups();
  }

  $('#usb-connect').addEventListener('click', async () => {
    if (!PEDALMIDI.supported()) { status(NO_MIDI, 'danger'); return; }
    if (!(await step('Asking for MIDI access', listPorts)).ok) return;
    const ports = await step('Connecting', () => PEDALMIDI.connect($('#usb-in').value, $('#usb-out').value));
    if (!ports.ok) return;
    note(`Ports: ${ports.value.input} / ${ports.value.output}`);
    const id = await step('Identifying the pedal', PEDALMIDI.identify);
    if ((await step('Editor mode', PEDALMIDI.editorOn)).ok) info = (await step('Reading the patch memory size', PEDALMIDI.patchInfo)).value;
    $('#usb-facts').textContent = [ports.value.output, id.ok && `firmware ${id.value.version}`, info && `${info.count} memories`].filter(Boolean).join(' · ');
    setConnected(true);
    if (info) readAll();
  });
  async function disconnect() {
    reading++;
    try { await PEDALMIDI.editorOff(); } catch {}
    PEDALMIDI.disconnect();
    info = null;
    $('#usb-facts').textContent = '';
    setConnected(false);
    status('Not connected');
  }
  $('#usb-disconnect').addEventListener('click', disconnect);
  window.addEventListener('pagehide', () => { PEDALMIDI.editorOff().catch(() => {}); });

  // ---- pedal memories --------------------------------------------------------------------------------
  async function readOne(number) {
    memories.set(number, { state: 'loading' });
    try {
      const r = await PEDALMIDI.readMemory(number, info);
      if (!r) { memories.set(number, { state: 'empty' }); return; }
      let decoded = null, error = null;
      try { decoded = ZPTC.decode(r.data); } catch (e) { error = e.message; }
      memories.set(number, { state: decoded ? 'ok' : 'error', data: r.data, memory: r.memory, crcOk: r.crcOk, decoded, error: error || (r.crcOk ? null : 'checksum mismatch') });
    } catch (e) {
      memories.set(number, { state: 'error', error: e.message });
      note(`Memory ${number}: ${e.message}`);
    }
    if (!fullRead) saveLastRead();
  }
  function saveLastRead() {
    if (!info) return;
    const saved = readJson(LAST_READ_KEY, null);
    const list = saved?.count === info.count ? { ...saved.memories } : {};
    memories.forEach((m, n) => { if (m.state === 'ok') list[n] = toBase64(m.data); else if (m.state === 'empty') list[n] = null; });
    try { localStorage.setItem(LAST_READ_KEY, JSON.stringify({ at: new Date().toISOString(), count: info.count, memories: list })); } catch {}
  }
  // Rows of the last-read list: name and summary of each memory, decoded again from the saved files; a readable
  // memory also carries its file (data) and what it holds (decoded: the effects), so it can be opened without the pedal
  function lastRead() {
    const saved = readJson(LAST_READ_KEY, null);
    if (!saved?.count) return null;
    const rows = Array.from({ length: saved.count }, (_, i) => {
      const n = i + 1, data = saved.memories?.[n];
      if (data === null) return { n, state: 'empty', name: '(empty)', meta: '' };
      if (!data) return { n, state: 'empty', name: 'Not read', meta: '' };
      try {
        const bytes = fromBase64(data);
        const decoded = ZPTC.decode(bytes);
        return { n, state: 'ok', name: decoded.name || '(no name)', meta: `${decoded.effects.length} fx · ${decoded.dspTotal.toFixed(1)}%`, data: bytes, decoded };
      } catch { return { n, state: 'error', name: 'Unreadable', meta: '' }; }
    });
    return { at: saved.at, rows };
  }
  async function readAll() {
    const run = ++reading;
    busy = true;
    fullRead = true;
    renderLocals();
    memories.clear();
    for (let n = 1; n <= info.count; n++) memories.set(n, { state: 'loading' });
    renderMemories();
    for (let n = 1; n <= info.count; n++) {
      if (run !== reading || !connected) { busy = false; fullRead = false; return; }
      status(`Reading memory ${n} of ${info.count}…`);
      await readOne(n);
      renderMemory(n);
    }
    busy = false;
    fullRead = false;
    saveLastRead();
    renderLocals();
    const failed = [...memories.values()].filter(m => m.state === 'error').length;
    status(failed ? `Connected: ${failed} of ${info.count} memories with errors (see the MIDI log)` : 'Connected', failed ? 'danger' : 'ok');
    if (pendingSend) sendPending();
  }
  function sendPending() {
    const n = pendingSend;
    pendingSend = null;
    const item = localItems().find(i => i.key === 'draft');
    if (!item?.bytes) { status(item?.error || 'The builder has no patch to send.', 'danger'); return; }
    if (n > info.count) return;
    if (selected !== n) select(n);
    $(`#usb-memories [data-n="${n}"]`)?.scrollIntoView({ block: 'nearest' });
    send(n, item.bytes);
  }
  $('#usb-refresh').addEventListener('click', () => { if (info) readAll(); });

  function memoryHtml(n) {
    const m = memories.get(n) || { state: 'loading' };
    const d = m.decoded;
    const isSelected = n === selected;
    const name = m.state === 'ok' ? d.name || '(no name)' : m.state === 'loading' ? 'Reading…' : m.state === 'empty' ? '(empty)' : `Unreadable: ${m.error}`;
    const meta = m.state === 'ok' ? `${d.effects.length} fx · ${d.dspTotal.toFixed(1)}%` : '';
    return `<li class="usb-mem${isSelected ? ' is-selected' : ''}" data-n="${n}" data-state="${m.state}">
      <button class="usb-mem-main" data-act="select" aria-pressed="${isSelected}" ${m.state === 'loading' ? 'disabled' : ''}>
        <span class="usb-num">${n}</span><span class="usb-name">${escapeHtml(name)}</span><span class="usb-meta">${escapeHtml(meta)}</span>
      </button>
      ${isSelected && m.state === 'ok' ? `<div class="usb-mem-detail">
        ${chainCards(d)}
        ${renaming === n ? `<form class="usb-row usb-rename" data-rename="${n}">
          <label>New name <input class="form-control form-control--sm" name="name" maxlength="28" value="${escapeHtml(d.name)}" required spellcheck="false" autocomplete="off" /></label>
          <button class="btn btn-sm btn-primary" type="submit">Rename on the pedal</button>
          <button class="btn btn-sm btn-invisible" type="button" data-act="rename-cancel">Cancel</button>
        </form>` : ''}
        ${moving?.n === n ? `<form class="usb-row usb-move" data-move="${n}" data-swap="${moving.swap}">
          <label>${moving.swap ? 'Swap with memory' : 'Move to memory'} <select class="form-control form-control--sm" name="target" required>
            ${Array.from({ length: info.count }, (_, i) => i + 1).filter(t => t !== n).map(t => `<option value="${t}">${t} · ${escapeHtml(memoryName(t))}</option>`).join('')}
          </select></label>
          <button class="btn btn-sm btn-primary" type="submit">${moving.swap ? 'Swap' : 'Move'}</button>
          <button class="btn btn-sm btn-invisible" type="button" data-act="move-cancel">Cancel</button>
        </form>` : ''}
        <div class="usb-row">
          <a class="btn btn-sm btn-primary" href="${PATCHLINK.url(toPatch(d))}&m=${n}" data-act="edit">Edit in builder</a>
          <button class="btn btn-sm" data-act="rename" ${connected && !busy ? '' : 'disabled'}>Rename</button>
          <button class="btn btn-sm" data-act="move" ${connected && !busy ? '' : 'disabled'}>Move to…</button>
          <button class="btn btn-sm" data-act="swap" ${connected && !busy ? '' : 'disabled'}>Swap with…</button>
          <button class="btn btn-sm" data-act="copy">Copy to My patches</button>
          <button class="btn btn-sm" data-act="download">Download .zptc</button>
          <button class="btn btn-sm btn-invisible" data-act="reread">Read again</button>
          <button class="btn btn-sm btn-danger usb-clear" data-act="clear" ${connected && !busy && d.effects.length ? '' : 'disabled'}>Clear patch</button>
        </div>
      </div>` : ''}
    </li>`;
  }
  // Not connected: a memory of the saved list. A readable one opens to its effects, and can be copied or downloaded
  // (what needs the pedal stays out of this list)
  let staleRows = null;
  function staleHtml(r) {
    const open = r.n === staleOpen && !!r.decoded;
    return `<li class="usb-mem is-stale${open ? ' is-selected' : ''}" data-n="${r.n}" data-state="${r.state}">
      <button class="usb-mem-main" data-act="stale-open" aria-pressed="${open}" ${r.decoded ? '' : 'disabled'}>
        <span class="usb-num">${r.n}</span><span class="usb-name">${escapeHtml(r.name)}</span><span class="usb-meta">${escapeHtml(r.meta)}</span>
      </button>
      ${open ? `<div class="usb-mem-detail">
        ${chainCards(r.decoded)}
        <div class="usb-row">
          <button class="btn btn-sm" data-act="copy">Copy to My patches</button>
          <button class="btn btn-sm" data-act="download">Download .zptc</button>
        </div>
      </div>` : ''}
    </li>`;
  }
  function renderMemories() {
    const hint = $('#usb-pedal-hint');
    const last = !connected && lastRead();
    hint.textContent = PEDAL_HINT;
    delete hint.dataset.kind;
    if (last) {
      const when = new Date(last.at).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      hint.textContent = `Not connected: the patches and their effects as last read on ${when}. Select a patch to see its effects. They may have changed on the pedal since; connect it to work on them.`;
      hint.dataset.kind = 'stale';
      staleRows = last.rows;
      $('#usb-pedal-count').textContent = last.rows.length;
      $('#usb-memories').innerHTML = last.rows.map(staleHtml).join('');
      return;
    }
    staleRows = null;
    const count = info?.count ?? 0;
    $('#usb-pedal-count').textContent = count;
    $('#usb-memories').innerHTML = !connected ? '<li class="usb-empty">Connect the pedal to see its patch memories.</li>'
      : !count ? '<li class="usb-empty">The pedal did not report its patch memories.</li>'
      : Array.from({ length: count }, (_, i) => memoryHtml(i + 1)).join('');
  }
  function renderMemory(n) {
    const item = $(`#usb-memories [data-n="${n}"]`);
    if (item) item.outerHTML = memoryHtml(n);
  }
  function select(n) {
    const previous = selected;
    selected = selected === n ? null : n;
    if (previous) renderMemory(previous);
    if (selected) renderMemory(selected);
    renderLocals();
  }

  $('#usb-memories').addEventListener('click', async event => {
    const button = event.target.closest('[data-act]');
    if (!button) return;
    const n = Number(button.closest('[data-n]').dataset.n);
    const m = connected ? memories.get(n) : staleRows?.find(r => r.n === n); // saved copy while the pedal is not connected
    switch (button.dataset.act) {
      case 'stale-open': {
        const previous = staleOpen;
        staleOpen = staleOpen === n ? null : n;
        for (const k of new Set([previous, staleOpen])) {
          const row = staleRows.find(r => r.n === k);
          if (row) $(`#usb-memories [data-n="${k}"]`).outerHTML = staleHtml(row);
        }
        $(`#usb-memories [data-n="${n}"] .usb-mem-main`)?.focus();
        break;
      }
      case 'select': renaming = null; moving = null; select(n); break;
      case 'edit': // remember where the patch comes from, so the builder can send it back to this memory
        try { localStorage.setItem(EDIT_KEY, JSON.stringify({ memory: n, name: m.decoded.name, base: toBase64(m.data), at: new Date().toISOString(), pending: true })); } catch {}
        break;
      case 'rename': renaming = n; renderMemory(n); $(`[data-rename="${n}"] input`)?.select(); break;
      case 'rename-cancel': renaming = null; renderMemory(n); break;
      case 'move': case 'swap': renaming = null; moving = { n, swap: button.dataset.act === 'swap' }; renderMemory(n); $(`[data-move="${n}"] select`)?.focus(); break;
      case 'move-cancel': moving = null; renderMemory(n); break;
      case 'download': download(m.data, `${String(n).padStart(3, '0')} ${fileName(m.decoded.name)}.zptc`); break;
      case 'clear': send(n, ZPTC.encode({ name: CLEARED_NAME, empty: true, effects: [] }).file, true); break;
      case 'reread': await readOne(n); renderMemory(n); status(`Memory ${n} read again`, 'ok'); break;
      case 'copy': {
        const patch = toPatch(m.decoded);
        const list = readJson(LIBRARY_KEY, []);
        const taken = new Set(list.map(e => String(e.name).toLowerCase()));
        let name = patch.name;
        for (let i = 2; taken.has(name.toLowerCase()); i++) name = `${patch.name.slice(0, 28 - ` ${i}`.length)} ${i}`;
        list.unshift({ id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name, effects: patch.effects, output: null, updatedAt: new Date().toISOString() });
        try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(list)); } catch { status('This browser does not allow this site to store data.', 'danger'); return; }
        renderLocals();
        status(`“${name}” copied to My patches`, 'ok');
        break;
      }
    }
  });

  // Rename: the same patch re-encoded with the new name (raw values, slots and patch data kept), then written
  // through the usual backup → confirm → write → read-back flow
  function renamed(bytes, name) {
    if (!ZPTC.roundtrip(bytes)) throw new Error('This patch cannot be re-encoded byte for byte yet, so it is not renamed.');
    const spec = ZPTC.decode(bytes);
    return ZPTC.encode({ ...spec, name, shortName: name, empty: !spec.effects.length, effects: spec.effects.map(({ id, on, raw, tail }) => ({ id, on, raw, tail })) }).file;
  }
  $('#usb-memories').addEventListener('submit', event => {
    const move = event.target.closest('[data-move]');
    if (move) {
      event.preventDefault();
      const n = Number(move.dataset.move);
      const target = Number(move.elements.target.value);
      moving = null;
      relocate(n, target, move.dataset.swap === 'true');
      return;
    }
    const form = event.target.closest('[data-rename]');
    if (!form) return;
    event.preventDefault();
    const n = Number(form.dataset.rename);
    const name = form.elements.name.value.trim();
    const m = memories.get(n);
    if (!name || !ZPTC.NAME_CHARS.test(name)) { status('Use letters, digits, spaces and ! % & \' + , - . = _ only.', 'danger'); return; }
    if (name === m.decoded.name) { renaming = null; renderMemory(n); return; }
    let bytes;
    try { bytes = renamed(m.data, name); } catch (error) { status(error.message, 'danger'); return; }
    renaming = null;
    send(n, bytes);
  });

  const activeEdit = () => { const edit = readJson(EDIT_KEY, null); return edit?.memory && !edit.pending ? edit : null; };

  // ---- local patches ---------------------------------------------------------------------------------
  // [{ key, name, label, chain, bytes | error }]: the builder's open patch, a chosen .zptc file, then My patches
  function localItems() {
    const items = [];
    const make = (key, label, getPatch) => {
      try {
        const patch = getPatch();
        const chain = patch.effects.filter(e => EFFECTS_DATA[e.index]).map(e => EFFECTS_DATA[e.index][0]);
        const edit = key === 'draft' ? activeEdit() : null;
        try { items.push({ key, label, name: patch.name || '(no name)', chain, bytes: toFile(patch, edit?.memory ? fromBase64(edit.base) : null), memory: edit?.memory ?? null }); }
        catch (error) { items.push({ key, label, name: patch.name || '(no name)', chain, error: error.message }); }
      } catch {}
    };
    if (fileItem) {
      try { const d = ZPTC.decode(fileItem.bytes); items.push({ key: 'file', label: `File ${fileItem.fileName}`, name: d.name, chain: d.effects.map(e => e.effect), bytes: fileItem.bytes }); }
      catch (error) { items.push({ key: 'file', label: `File ${fileItem.fileName}`, name: fileItem.fileName, chain: [], error: error.message }); }
    }
    const draft = readJson(DRAFT_KEY, null);
    const edit = activeEdit();
    if (draft?.effects?.length) make('draft', edit?.memory ? `Open in the builder · editing memory ${edit.memory}` : 'Open in the builder', () => draft);
    readJson(LIBRARY_KEY, []).forEach(entry => make(`lib:${entry.id}`, entry.updatedAt ? `Saved ${when(entry.updatedAt)}` : '', () => entry));
    return items;
  }
  function renderLocals() {
    updateArrangeButton();
    const items = localItems();
    $('#usb-local-count').textContent = items.filter(i => i.key.startsWith('lib:')).length;
    const target = selected && memories.get(selected)?.state !== 'loading' ? selected : null;
    $('#usb-locals').innerHTML = items.length ? items.map(item => `<li class="usb-local" data-key="${escapeHtml(item.key)}">
        <div class="usb-local-main"><span class="usb-name">${escapeHtml(item.name)}</span><small>${escapeHtml(item.label)}</small>
          <span class="usb-chain-line">${escapeHtml(item.error || chainText(item.chain))}</span></div>
        <button class="btn btn-sm btn-icon usb-send${target ? ' btn-primary' : ''}" data-act="send" ${!connected || !target || item.error || busy ? 'disabled' : ''}
          aria-label="${target ? `Send to memory ${target}` : 'Send to a memory'}"
          title="${!connected ? 'Connect the pedal first' : busy ? 'Wait until the pedal has been read' : !target ? 'Select a memory on the right first' : `Send to memory ${target}`}">${ICON_SEND}</button>
      </li>`).join('') : '<li class="usb-empty">No patches yet. Build one in the <a href="builder.html">patch builder</a> and save it, or send a <code>.zptc</code> file.</li>';
  }
  $('#usb-locals').addEventListener('click', event => {
    const button = event.target.closest('[data-act="send"]');
    if (!button || !selected) return;
    const item = localItems().find(i => i.key === button.closest('[data-key]').dataset.key);
    if (item?.bytes) send(selected, item.bytes);
  });
  $('#usb-file').addEventListener('change', async event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    fileItem = { fileName: file.name, bytes: new Uint8Array(await file.arrayBuffer()) };
    renderLocals();
    status(selected ? `“${file.name}” ready: press its send button to write it to memory ${selected}` : `“${file.name}” ready: select a memory on the right, then press its send button`);
  });
  window.addEventListener('storage', event => { if (event.key === LIBRARY_KEY || event.key === DRAFT_KEY) renderLocals(); });
  window.addEventListener('focus', renderLocals);
  window.addEventListener('account-synced', event => { if (event.detail.pedal === PEDAL.id) { renderLocals(); renderBackups(); } });

  // ---- writing ---------------------------------------------------------------------------------------
  const storedBackups = () => { const list = readJson(BACKUP_KEY, []); return Array.isArray(list) ? list : []; };
  const readBackups = () => storedBackups().filter(b => !b.deleted);
  // The last MAX_BACKUPS, and no more than about 190 kB so the list still fits in an account (see account-sync.mjs).
  // The deletion records of the last 90 days are kept next to them.
  const writeBackups = (list, graves = storedBackups().filter(b => b.deleted)) => {
    const kept = list.slice(0, MAX_BACKUPS);
    const recent = graves.filter(g => Date.now() - Date.parse(g.at) < GRAVE_MS);
    while (kept.length > 1 && JSON.stringify([...kept, ...recent]).length > 190_000) kept.pop();
    try { localStorage.setItem(BACKUP_KEY, JSON.stringify([...kept, ...recent])); return true; } catch { return false; }
  };
  const removeBackups = ids => {
    const at = new Date().toISOString();
    const live = readBackups();
    return writeBackups(live.filter(b => !ids.includes(b.id)), [...storedBackups().filter(b => b.deleted), ...live.filter(b => ids.includes(b.id)).map(b => ({ id: b.id, deleted: true, at }))]);
  };
  function renderBackups() {
    const list = readBackups();
    $('#usb-backup-count').textContent = list.length;
    $('#usb-backups-clear').disabled = !list.length;
    $('#usb-backups').innerHTML = list.length ? list.map(b => b.group ? `<li data-id="${escapeHtml(b.id)}">
        <span><b>${b.group.length} memories</b> · ${escapeHtml(b.name)} <small>${escapeHtml(when(b.at))}</small></span>
        <span class="usb-row"><button class="btn btn-sm" data-backup="restore" ${connected && info && !busy ? '' : 'disabled'}>Restore all ${b.group.length}</button><button class="btn btn-sm btn-invisible" data-backup="delete" aria-label="Delete this backup">Delete</button></span>
      </li>` : `<li data-id="${escapeHtml(b.id)}">
        <span><b>Memory ${b.memory}</b> · ${escapeHtml(b.name)} <small>${escapeHtml(when(b.at))}</small></span>
        <span class="usb-row"><button class="btn btn-sm" data-backup="download">Download</button><button class="btn btn-sm" data-backup="restore" ${connected && info ? '' : 'disabled'}>Restore to memory ${b.memory}</button><button class="btn btn-sm btn-invisible" data-backup="delete" aria-label="Delete this backup">Delete</button></span>
      </li>`).join('') : '<li class="usb-empty">No backups yet.</li>';
  }

  // ---- arranging the pedal ---------------------------------------------------------------------------
  // A new order is planned in the page first: plan[i] is the memory whose patch goes to memory i + 1. Selected patches
  // move as a block. Writing keeps one backup of every memory that changes, checks that the pedal still holds what was
  // read, then writes and reads back each memory in turn.
  let arranging = null; // { plan: [memory numbers], snap: Map(memory → { memory: bytes, name }), selection: Set, anchor }
  const allRead = () => info && [...Array(info.count).keys()].every(i => { const m = memories.get(i + 1); return m?.state === 'ok' && m.crcOk; });
  function updateArrangeButton() {
    const button = $('#usb-arrange');
    button.disabled = !connected || busy || !allRead();
    button.title = !connected ? 'Connect the pedal first' : busy ? 'Wait until the pedal is free' : !allRead() ? 'Every memory must be read correctly first: press Read again' : 'Change the order of the patches on the pedal';
  }
  function startArranging() {
    if (!connected || busy || !allRead()) return;
    const snap = new Map();
    for (let n = 1; n <= info.count; n++) { const m = memories.get(n); snap.set(n, { memory: m.memory, name: m.decoded.name || '(no name)' }); }
    arranging = { plan: Array.from({ length: info.count }, (_, i) => i + 1), snap, selection: new Set(), anchor: null };
    busy = true; // nothing else talks to the pedal or changes it while a new order is planned
    selected = null;
    $('#usb-memories').hidden = true;
    $('#usb-arrange-panel').hidden = false;
    $('#usb-pedal-hint').hidden = true;
    renderArrange();
    renderLocals();
    renderBackups();
  }
  function stopArranging() {
    arranging = null;
    busy = false;
    $('#usb-memories').hidden = false;
    $('#usb-arrange-panel').hidden = true;
    $('#usb-pedal-hint').hidden = false;
    renderMemories();
    renderLocals();
    renderBackups();
  }
  const changesOf = plan => plan.map((from, i) => ({ to: i + 1, from })).filter(c => c.to !== c.from);
  function renderArrange(focusId) {
    const { plan, snap, selection } = arranging;
    $('#usb-arrange-list').innerHTML = plan.map((from, i) => `<li class="usb-arr-item${selection.has(from) ? ' is-checked' : ''}${from !== i + 1 ? ' is-moved' : ''}" draggable="true" data-from="${from}" tabindex="-1">
        <input type="checkbox" ${selection.has(from) ? 'checked' : ''} aria-label="Select ${escapeHtml(snap.get(from).name)}" />
        <span class="usb-num">${i + 1}</span><span class="usb-name">${escapeHtml(snap.get(from).name)}</span>
        <span class="usb-meta">${from !== i + 1 ? `from ${from}` : ''}</span><span class="usb-grip" aria-hidden="true">⠿</span>
      </li>`).join('');
    const changes = changesOf(plan);
    $('#usb-arr-selected').textContent = selection.size ? `${selection.size} selected` : 'No patch selected';
    for (const id of ['#usb-arr-up', '#usb-arr-down', '#usb-arr-to', '#usb-arr-none']) $(id).disabled = !selection.size;
    $('#usb-arr-pos').max = info.count;
    $('#usb-arr-changes').textContent = changes.length ? `${changes.length} ${changes.length === 1 ? 'memory changes' : 'memories change'}` : 'No changes yet';
    $('#usb-arr-write').disabled = !changes.length;
    $('#usb-arr-write').textContent = changes.length ? `Write ${changes.length} ${changes.length === 1 ? 'memory' : 'memories'}` : 'Write to the pedal';
    $('#usb-arr-reset').disabled = !changes.length;
    if (focusId) $(`#usb-arrange-list [data-from="${focusId}"]`)?.focus();
  }
  // Puts the selected patches, in their current order, at index k of the list without them
  function placeBlock(k) {
    const { plan, selection } = arranging;
    const block = plan.filter(id => selection.has(id));
    const rest = plan.filter(id => !selection.has(id));
    k = Math.max(0, Math.min(k, rest.length));
    arranging.plan = [...rest.slice(0, k), ...block, ...rest.slice(k)];
  }
  function shift(dir) {
    const { plan, selection } = arranging;
    const p = [...plan];
    const order = p.map((id, i) => (selection.has(id) ? i : -1)).filter(i => i >= 0);
    for (const i of dir < 0 ? order : order.reverse()) {
      const j = i + dir;
      if (j >= 0 && j < p.length && !selection.has(p[j])) [p[i], p[j]] = [p[j], p[i]];
    }
    arranging.plan = p;
  }
  function choose(from, { range = false, toggle = true } = {}) {
    const { plan, selection } = arranging;
    if (range && arranging.anchor != null) {
      const [x, y] = [plan.indexOf(arranging.anchor), plan.indexOf(from)].sort((a, b) => a - b);
      for (const id of plan.slice(x, y + 1)) selection.add(id);
    } else if (toggle) {
      if (selection.has(from)) selection.delete(from); else selection.add(from);
      arranging.anchor = from;
    }
  }
  $('#usb-arrange').addEventListener('click', startArranging);
  $('#usb-arr-cancel').addEventListener('click', stopArranging);
  $('#usb-arr-reset').addEventListener('click', () => { arranging.plan = Array.from({ length: info.count }, (_, i) => i + 1); renderArrange(); });
  $('#usb-arr-none').addEventListener('click', () => { arranging.selection.clear(); renderArrange(); });
  $('#usb-arr-up').addEventListener('click', () => { shift(-1); renderArrange(); });
  $('#usb-arr-down').addEventListener('click', () => { shift(1); renderArrange(); });
  $('#usb-arr-to').addEventListener('click', () => {
    const to = Number($('#usb-arr-pos').value);
    if (!Number.isInteger(to) || to < 1 || to > info.count) { status(`Choose a memory from 1 to ${info.count}.`, 'danger'); return; }
    placeBlock(to - 1);
    renderArrange();
    $(`#usb-arrange-list [data-from="${arranging.plan[to - 1]}"]`)?.scrollIntoView({ block: 'nearest' });
  });
  const list = $('#usb-arrange-list');
  list.addEventListener('click', event => {
    const item = event.target.closest('[data-from]');
    if (!item) return;
    choose(Number(item.dataset.from), { range: event.shiftKey });
    renderArrange();
  });
  list.addEventListener('keydown', event => {
    const item = event.target.closest('[data-from]');
    if (!item || !arranging.selection.size || !event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    shift(event.key === 'ArrowUp' ? -1 : 1);
    renderArrange(Number(item.dataset.from));
  });
  // Drag and drop: dragging a patch that is not selected moves only that patch
  const dropMarks = () => list.querySelectorAll('.drop-before, .drop-after').forEach(el => el.classList.remove('drop-before', 'drop-after'));
  const dropSide = (item, event) => { const r = item.getBoundingClientRect(); return event.clientY < r.top + r.height / 2 ? 'before' : 'after'; };
  list.addEventListener('dragstart', event => {
    const item = event.target.closest('[data-from]');
    if (!item) return;
    const from = Number(item.dataset.from);
    if (!arranging.selection.has(from)) { arranging.selection = new Set([from]); arranging.anchor = from; }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(from));
    requestAnimationFrame(() => list.querySelectorAll('.usb-arr-item').forEach(el => el.classList.toggle('is-dragging', arranging.selection.has(Number(el.dataset.from)))));
  });
  list.addEventListener('dragover', event => {
    const item = event.target.closest('[data-from]');
    if (!item) return;
    event.preventDefault();
    dropMarks();
    if (!arranging.selection.has(Number(item.dataset.from))) item.classList.add(`drop-${dropSide(item, event)}`);
  });
  list.addEventListener('dragleave', event => { if (!list.contains(event.relatedTarget)) dropMarks(); });
  list.addEventListener('drop', event => {
    event.preventDefault();
    const item = event.target.closest('[data-from]');
    dropMarks();
    if (!item || arranging.selection.has(Number(item.dataset.from))) return;
    const rest = arranging.plan.filter(id => !arranging.selection.has(id));
    placeBlock(rest.indexOf(Number(item.dataset.from)) + (dropSide(item, event) === 'after' ? 1 : 0));
    renderArrange();
  });
  list.addEventListener('dragend', () => { dropMarks(); renderArrange(); });

  $('#usb-arr-write').addEventListener('click', async () => {
    const { plan, snap } = arranging;
    const changes = changesOf(plan);
    if (!changes.length) return;
    const shown = changes.slice(0, 12).map(c => `<li>Memory ${c.to}: <b>${escapeHtml(snap.get(c.from).name)}</b> (now in ${c.from})</li>`).join('');
    const yes = await confirmWrite(`<p>Write the new order? ${changes.length} ${changes.length === 1 ? 'memory changes' : 'memories change'}:</p><ul>${shown}${changes.length > 12 ? `<li>and ${changes.length - 12} more</li>` : ''}</ul>
      <p>A backup of these memories as they are now is kept in Backups, as one entry you can restore at once.</p>`, `Write ${changes.length} ${changes.length === 1 ? 'memory' : 'memories'}`);
    if (!yes) return;
    result(true, '');
    // The pedal must still hold what was read when arranging started
    for (const [k, c] of changes.entries()) {
      status(`Checking memory ${c.to} (${k + 1} of ${changes.length})`);
      await readOne(c.to);
      const now = memories.get(c.to);
      if (now.state !== 'ok' || !now.crcOk || !sameBytes(now.memory, snap.get(c.to).memory)) {
        result(false, `Memory ${c.to} changed on the pedal (or could not be read) since it was read: nothing was written. Press Read again and arrange again.`);
        status('Nothing written', 'danger');
        stopArranging();
        return;
      }
    }
    const at = new Date().toISOString();
    const stored = writeBackups([{ id: `${Date.now()}-arrange`, memory: changes[0].to, name: `Before rearranging ${changes.length} memories`, at,
      group: changes.map(c => ({ memory: c.to, name: snap.get(c.to).name, data: toBase64(snap.get(c.to).memory) })) }, ...readBackups()]);
    if (!stored) { result(false, 'This browser could not keep the backup, so nothing was written.'); status('Nothing written', 'danger'); return; }
    renderBackups();
    for (const [k, c] of changes.entries()) {
      status(`Writing memory ${c.to} (${k + 1} of ${changes.length})`);
      const r = await writeAndCheck(c.to, snap.get(c.from).memory);
      if (!r.ok) {
        result(false, `${r.text} Stopped after ${k} of ${changes.length} memories: restore “Before rearranging ${changes.length} memories” in Backups to go back.`);
        status('Check the pedal', 'danger');
        stopArranging();
        return;
      }
    }
    result(true, `New order written: ${changes.length} ${changes.length === 1 ? 'memory' : 'memories'}, each read back and identical.`);
    status('Arranged', 'ok');
    stopArranging();
  });

  // Resolves true when the user confirms
  function confirmWrite(html, action, title = 'Write to the pedal') {
    const dialog = $('#usb-confirm');
    $('#usb-confirm-title').textContent = title;
    $('#usb-confirm-body').innerHTML = html;
    $('#usb-confirm-yes').textContent = action;
    dialog.showModal();
    return new Promise(resolve => {
      dialog.onclick = event => {
        const choice = event.target.closest('[data-confirm]')?.dataset.confirm;
        if (!choice && event.target !== dialog) return;
        dialog.close();
        resolve(choice === 'yes');
      };
      dialog.oncancel = () => resolve(false);
    });
  }

  // Writes bytes to a memory, reads it back into the list and compares the PTCF data
  async function writeAndCheck(number, bytes) {
    const sent = await step(`Writing memory ${number}`, () => PEDALMIDI.writeMemory(number, info, bytes));
    if (!sent.ok && !/No answer/.test(sent.error?.message || '')) return { ok: false, text: `Writing failed: ${sent.error.message}` };
    await readOne(number);
    renderMemory(number);
    const back = memories.get(number);
    if (back.state !== 'ok') return { ok: false, text: `Memory ${number} could not be read back (${back.error || back.state}): check it on the pedal.` };
    const ok = back.crcOk && sameBytes(back.data, ptcfOf(bytes));
    note(`Read back memory ${number}: ${ok ? 'identical' : 'DIFFERENT'} (${back.data.length} bytes)`);
    return ok ? { ok: true, text: `Memory ${number} now holds “${back.decoded.name}”: read back and identical.` }
      : { ok: false, text: `Memory ${number} was read back but differs from what was sent. Restore the backup if the patch is wrong.` };
  }

  const memoryName = n => { const m = memories.get(n); return m?.state === 'ok' ? m.decoded.name || '(no name)' : m?.state === 'empty' ? '(empty)' : m?.state === 'loading' ? 'reading…' : 'unreadable'; };

  // Move (a → b, then a is cleared) or swap (a ↔ b). Both memories are read fresh and backed up first; b is written
  // before a, so if anything fails the patch of a is still on the pedal (in a, or in b as well).
  async function relocate(a, b, swap) {
    if (busy) return;
    busy = true;
    renderLocals();
    try { await relocateNow(a, b, swap); } finally { busy = false; renderLocals(); renderMemory(a); renderMemory(b); }
  }
  async function relocateNow(a, b, swap) {
    result(true, '');
    await step(`Backing up memories ${a} and ${b}`, async () => { await readOne(a); await readOne(b); });
    renderMemory(a);
    renderMemory(b);
    const A = memories.get(a), B = memories.get(b);
    const unsafe = [[a, A], [b, B]].find(([, m]) => m.state !== 'ok' || !m.crcOk);
    if (unsafe) { status(`Memory ${unsafe[0]} could not be read safely, so nothing was written.`, 'danger'); return; }
    const nameA = A.decoded.name || '(no name)', nameB = B.decoded.name || '(no name)';
    const at = new Date().toISOString();
    const stored = writeBackups([
      { id: `${Date.now()}-${a}`, memory: a, name: nameA, at, data: toBase64(A.memory) },
      { id: `${Date.now()}-${b}`, memory: b, name: nameB, at, data: toBase64(B.memory) }, ...readBackups()]);
    renderBackups();
    status('Waiting for your confirmation');
    const yes = await confirmWrite((swap
      ? `<p>Swap <b>memory ${a}</b> (<b>${escapeHtml(nameA)}</b>) and <b>memory ${b}</b> (<b>${escapeHtml(nameB)}</b>)?</p>`
      : `<p>Move <b>${escapeHtml(nameA)}</b> from <b>memory ${a}</b> to <b>memory ${b}</b>?</p><p>It replaces <b>${escapeHtml(nameB)}</b> in memory ${b}, and memory ${a} is cleared.</p>`)
      + `<p>${stored ? `Backups of both memories are in Backups on this page.` : 'This browser could not keep the backups: download both memories first if you need them.'}</p>`,
      swap ? `Swap memories ${a} and ${b}` : `Move to memory ${b}`);
    if (!yes) { status('Nothing written'); return; }
    const first = await writeAndCheck(b, A.memory);
    if (!first.ok) { result(false, `${first.text} Memory ${a} was not changed.`); status('Check the pedal', 'danger'); return; }
    const second = await writeAndCheck(a, swap ? B.memory : ZPTC.encode({ name: CLEARED_NAME, empty: true, effects: [] }).file);
    if (!second.ok) {
      result(false, `Memory ${b} now holds “${nameA}”, but memory ${a} could not be ${swap ? 'written' : 'cleared'}: ${second.text}${swap ? ` “${nameB}” is in Backups.` : ''}`);
      status('Check the pedal', 'danger');
      return;
    }
    result(true, swap ? `Memories ${a} and ${b} swapped: both read back and identical.` : `“${nameA}” moved to memory ${b} and memory ${a} cleared: both read back and checked.`);
    status(swap ? 'Swapped' : 'Moved', 'ok');
    if (!swap) select(b);
  }

  async function send(number, bytes, clearing = false) {
    if (busy) return;
    busy = true;
    renderLocals();
    try { await sendNow(number, bytes, clearing); } finally { busy = false; renderLocals(); }
  }
  async function sendNow(number, bytes, clearing = false) {
    result(true, '');
    let d;
    try { d = ZPTC.decode(bytes); } catch (error) { status(`Not a patch: ${error.message}`, 'danger'); return; }
    if (bytes.length > info.size) { status(`The patch has ${bytes.length} bytes; a memory holds ${info.size}.`, 'danger'); return; }
    // 1. Backup of the memory about to be replaced (read fresh, not from the list)
    await step(`Backing up memory ${number}`, () => readOne(number));
    renderMemory(number);
    const old = memories.get(number);
    if (old.state !== 'ok' || !old.crcOk) { status(`Memory ${number} could not be read safely, so nothing was written.`, 'danger'); return; }
    const stored = writeBackups([{ id: `${Date.now()}`, memory: number, name: old.decoded.name || '(no name)', at: new Date().toISOString(), data: toBase64(old.memory) }, ...readBackups()]);
    download(old.data, `backup ${String(number).padStart(3, '0')} ${fileName(old.decoded.name)}.zptc`);
    renderBackups();
    // 2. Confirmation
    status('Waiting for your confirmation');
    const yes = await confirmWrite(`<p>${clearing ? `Clear <b>memory ${number}</b>: it becomes <b>${escapeHtml(d.name)}</b>, with no effects.` : `Write <b>${escapeHtml(d.name)}</b> (${d.effects.length} effects, DSP ${d.dspTotal.toFixed(1)}%) to <b>memory ${number}</b>?`}</p>
      <p>It replaces <b>${escapeHtml(old.decoded.name || '(no name)')}</b>. A backup of it ${stored ? 'is in Backups on this page and ' : ''}was downloaded as a <code>.zptc</code> file.</p>
      ${d.dspTotal > 100 ? '<p class="usb-warn">The estimated DSP load is over 100%: the pedal will show PROCESS OVERFLOW.</p>' : ''}`, clearing ? `Clear memory ${number}` : `Write to memory ${number}`);
    if (!yes) { status('Nothing written'); return; }
    // 3. Write and read back
    const r = await writeAndCheck(number, bytes);
    result(r.ok, r.text);
    status(r.ok ? (clearing ? 'Cleared' : 'Written') : 'Check the pedal', r.ok ? 'ok' : 'danger');
  }

  $('#usb-backups').addEventListener('click', async event => {
    const button = event.target.closest('[data-backup]');
    if (!button) return;
    const list = readBackups();
    const backup = list.find(b => b.id === button.closest('li').dataset.id);
    if (!backup) return;
    const memory = backup.group ? null : fromBase64(backup.data); // an "arrange" backup holds several memories (group)
    if (button.dataset.backup === 'download') download(ptcfOf(memory), `backup ${String(backup.memory).padStart(3, '0')} ${fileName(backup.name)}.zptc`);
    if (button.dataset.backup === 'delete') { removeBackups([backup.id]); renderBackups(); }
    if (button.dataset.backup === 'restore' && backup.group) {
      const yes = await confirmWrite(`<p>Put back the ${backup.group.length} memories of <b>${escapeHtml(backup.name)}</b> (${escapeHtml(when(backup.at))})?</p><p>Memories ${backup.group.map(g => g.memory).join(', ')} get back what they held then.</p>`, `Restore ${backup.group.length} memories`);
      if (!yes || busy) return;
      busy = true;
      renderLocals();
      try {
        for (const [k, g] of backup.group.entries()) {
          status(`Restoring memory ${g.memory} (${k + 1} of ${backup.group.length})`);
          const r = await writeAndCheck(g.memory, fromBase64(g.data));
          if (!r.ok) { result(false, `${r.text} Stopped after ${k} of ${backup.group.length} memories.`); status('Check the pedal', 'danger'); return; }
        }
        result(true, `${backup.group.length} memories restored: each read back and identical.`);
        status('Restored', 'ok');
      } finally { busy = false; renderLocals(); renderBackups(); }
      return;
    }
    if (button.dataset.backup === 'restore') {
      const yes = await confirmWrite(`<p>Put <b>${escapeHtml(backup.name)}</b> (backup of ${escapeHtml(when(backup.at))}) back into <b>memory ${backup.memory}</b>?</p><p>It replaces what that memory holds now.</p>`, `Restore memory ${backup.memory}`);
      if (!yes || busy) return;
      busy = true;
      const r = await writeAndCheck(backup.memory, memory).finally(() => { busy = false; renderLocals(); });
      result(r.ok, r.ok ? r.text.replace('now holds', 'holds its backup again,') : r.text);
      status(r.ok ? 'Restored' : 'Check the pedal', r.ok ? 'ok' : 'danger');
    }
  });

  $('#usb-backups-clear').addEventListener('click', async () => {
    const list = readBackups();
    if (!list.length) return;
    const count = `${list.length} ${list.length === 1 ? 'backup' : 'backups'}`;
    const yes = await confirmWrite(`<p>Delete all <b>${count}</b>?</p>
      <p>They hold the patches the pedal had before each write. Once deleted they cannot be restored from this page, and if you are signed in they are deleted from your account too. The <code>.zptc</code> files that were downloaded with them are not touched.</p>`,
      `Delete ${list.length === 1 ? 'the backup' : `all ${list.length}`}`, 'Delete all backups');
    if (!yes) return;
    removeBackups(readBackups().map(b => b.id));
    renderBackups();
    status(`${count} deleted`, 'ok');
  });

  // MIDI log full screen: the whole box, through the Fullscreen API when the browser has it (Esc leaves), else the window
  const logBox = $('#usb-log-box');
  const logFull = $('#usb-log-full');
  function setLogFull(on) {
    if (on) logBox.open = true;
    logBox.classList.toggle('is-full', on);
    logFull.setAttribute('aria-pressed', String(on));
    logFull.setAttribute('aria-label', on ? 'Leave full screen' : 'Full screen');
    logFull.title = on ? 'Leave full screen (Esc)' : 'Full screen';
    if (on && logBox.requestFullscreen) logBox.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement === logBox) document.exitFullscreen().catch(() => {});
  }
  logFull.addEventListener('click', () => setLogFull(!logBox.classList.contains('is-full')));
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && logBox.classList.contains('is-full')) setLogFull(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && logBox.classList.contains('is-full') && !document.fullscreenElement && !$('#usb-confirm').open) setLogFull(false); });

  $('#usb-copy-log').addEventListener('click', () => navigator.clipboard?.writeText($('#usb-log').textContent).then(() => status('Log copied', 'ok')));
  $('#usb-clear-log').addEventListener('click', () => { lines.length = 0; showLog(); });
  if (!PEDALMIDI.supported()) status(NO_MIDI, 'danger');
  setConnected(false);
  if (pendingSend) {
    status(`Connect the pedal to send the builder's patch to memory ${pendingSend}`);
    $('#usb-connect').click(); // works without a click when MIDI access was granted before; otherwise press Connect
  }
})();
