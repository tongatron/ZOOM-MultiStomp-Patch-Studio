// Read-only Pedal manager for the beta pedals (MS-200D+, MS-80IR+): connects over USB, reads every memory, lists the patches
// with the effects it can name, and keeps backups of the raw memories in this browser. It never writes to the pedal:
// the patch format of these pedals has not been checked on hardware, and the MS-60B+ rule is no write without a backup and
// a read-back check. Needs PEDAL, EFFECTS_DATA, FIRMWARE_DATA, PEDALMIDI and DIALOGS (all loaded before it).
(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const BACKUP_KEY = `${PEDAL.id}-usb-backups`;
  const LAST_READ_KEY = `${PEDAL.id}-usb-last-read`;
  const MAX_BACKUPS = 5;
  const NO_MIDI = 'This browser has no Web MIDI. Use Chrome or Edge on a computer.';

  // Effect ID → name, for the effects whose firmware ID is known
  const nameById = new Map();
  FIRMWARE_DATA.forEach((entry, index) => { if (entry?.[2]) nameById.set(Number(entry[2]), EFFECTS_DATA[index][0]); });

  const toBase64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };
  const fromBase64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
  const latin1 = (bytes, from, to) => String.fromCharCode(...bytes.subarray(from, to));

  // The PTCF file: "PTCF" u32 size, u32 version, u32 slot count, 10 bytes, 10-character name, one u32 ID per slot, then
  // sections (tag, u32 length, data); the NAME section holds the full 28-character name
  function parsePatch(data) {
    if (data.length < 36 || latin1(data, 0, 4) !== 'PTCF') throw new Error('not a PTCF patch');
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const slots = view.getUint32(12, true);
    if (slots > 16 || 36 + slots * 4 > data.length) throw new Error('unexpected slot count');
    let name = latin1(data, 26, 36).replace(/\0.*$/s, '').trimEnd();
    const ids = Array.from({ length: slots }, (_, i) => view.getUint32(36 + i * 4, true));
    for (let at = 36 + slots * 4; at + 8 <= data.length;) {
      const tag = latin1(data, at, at + 4), length = view.getUint32(at + 4, true);
      if (tag === 'NAME') name = latin1(data, at + 8, at + 8 + Math.min(length, 28)).replace(/\0.*$/s, '').trimEnd();
      if (length > data.length) break;
      at += 8 + length;
    }
    return { name, ids };
  }
  const effectLabel = id => id === 0 ? null : nameById.get(id) || `ID 0x${id.toString(16).padStart(8, '0')}`;

  let info = null, connected = false, reading = 0, selected = null;
  const memories = new Map(); // number → { state: 'empty' | 'ok' | 'error', data, memory, patch, error }

  function status(text, tone = '') {
    const el = $('#rd-status');
    el.textContent = text;
    el.dataset.tone = tone;
  }
  function download(content, fileName, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = Object.assign(document.createElement('a'), { href: url, download: fileName });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---- memory list -----------------------------------------------------------------------------------
  function renderList() {
    const list = $('#rd-list');
    if (!info) { list.innerHTML = '<li class="rd-hint">Connect the pedal to list its memories.</li>'; return; }
    const rows = [];
    for (let n = 1; n <= info.count; n++) {
      const m = memories.get(n);
      const label = !m ? '…' : m.state === 'empty' ? '<span class="rd-dim">empty</span>' : m.state === 'error' ? `<span class="rd-bad" title="${escapeHtml(m.error)}">cannot read</span>` : escapeHtml(m.patch.name || '(no name)');
      rows.push(`<li><button type="button" class="rd-row${n === selected ? ' is-selected' : ''}" data-n="${n}"><span class="rd-num">${n}</span><span class="rd-name">${label}</span></button></li>`);
    }
    list.innerHTML = rows.join('');
  }
  function renderDetail() {
    const box = $('#rd-detail');
    const m = memories.get(selected);
    if (!m || m.state === 'empty') { box.innerHTML = '<p class="rd-hint">Select a memory to see its effects.</p>'; return; }
    if (m.state === 'error') { box.innerHTML = `<h3>Memory ${selected}</h3><p class="rd-bad">${escapeHtml(m.error)}</p>`; return; }
    const effects = m.patch.ids.map(effectLabel).filter(Boolean);
    box.innerHTML = `<h3>${escapeHtml(m.patch.name || '(no name)')} <small>memory ${selected}</small></h3>
      <ol class="rd-effects">${effects.length ? effects.map(e => `<li>${escapeHtml(e)}</li>`).join('') : '<li class="rd-dim">no effects</li>'}</ol>
      ${m.crcOk ? '' : '<p class="rd-bad">The checksum of this memory did not match: read it again.</p>'}
      <button class="btn btn-sm" type="button" id="rd-download">Download .zptc</button>`;
    $('#rd-download').addEventListener('click', () => download(m.data, `${(m.patch.name || 'patch').replace(/[^A-Za-z0-9 _.-]/g, '').trim() || 'patch'}-${selected}.zptc`, 'application/octet-stream'));
  }
  $('#rd-list').addEventListener('click', event => {
    const row = event.target.closest('.rd-row');
    if (!row) return;
    selected = Number(row.dataset.n);
    renderList();
    renderDetail();
  });

  // ---- connection and reading ------------------------------------------------------------------------
  async function listPorts() {
    const { inputs, outputs } = await PEDALMIDI.ports();
    const options = list => list.map(p => `<option value="${escapeHtml(p.id)}"${/zoom/i.test(p.name) ? ' selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
    $('#rd-in').innerHTML = options(inputs);
    $('#rd-out').innerHTML = options(outputs);
  }
  function setConnected(on) {
    connected = on;
    $('#rd-connect').hidden = on;
    $('#rd-disconnect').hidden = !on;
    $('#rd-reread').disabled = !on;
    $('#rd-backup').disabled = !on;
    document.querySelector('.rd-connect').classList.toggle('is-connected', on);
    renderList();
    renderDetail();
  }
  async function readAll() {
    const run = ++reading;
    memories.clear();
    renderList();
    for (let n = 1; n <= info.count; n++) {
      if (run !== reading || !connected) return;
      status(`Reading memory ${n} of ${info.count}…`);
      try {
        const r = await PEDALMIDI.readMemory(n, info);
        if (!r) memories.set(n, { state: 'empty' });
        else {
          try { memories.set(n, { state: 'ok', data: r.data, memory: r.memory, crcOk: r.crcOk, patch: parsePatch(r.data) }); }
          catch (error) { memories.set(n, { state: 'error', error: error.message, memory: r.memory }); }
        }
      } catch (error) { memories.set(n, { state: 'error', error: error.message }); }
      if (n % 10 === 0 || n === info.count) renderList();
    }
    renderList();
    renderDetail();
    const bad = [...memories.values()].filter(m => m.state === 'error').length;
    status(`${info.count} memories read${bad ? `; ${bad} could not be read` : ''}. Nothing was written to the pedal.`, bad ? 'danger' : 'ok');
    try {
      localStorage.setItem(LAST_READ_KEY, JSON.stringify({ at: new Date().toISOString(), memories: [...memories].filter(([, m]) => m.memory).map(([n, m]) => [n, toBase64(m.memory)]) }));
    } catch {}
  }
  $('#rd-connect').addEventListener('click', async () => {
    if (!PEDALMIDI.supported()) { status(NO_MIDI, 'danger'); return; }
    try {
      status('Asking for MIDI access…');
      await listPorts();
      await PEDALMIDI.connect($('#rd-in').value, $('#rd-out').value);
      status('Identifying the pedal…');
      const id = await PEDALMIDI.identify();
      await PEDALMIDI.editorOn();
      info = await PEDALMIDI.patchInfo();
      $('#rd-facts').textContent = `firmware ${id.version} · MIDI model ${id.model} · ${info.count} memories`;
      setConnected(true);
      readAll();
    } catch (error) {
      try { PEDALMIDI.disconnect(); } catch {}
      info = null;
      setConnected(false);
      status(`Could not connect: ${error.message}`, 'danger');
    }
  });
  async function disconnect() {
    reading++;
    try { await PEDALMIDI.editorOff(); } catch {}
    PEDALMIDI.disconnect();
    info = null;
    $('#rd-facts').textContent = '';
    setConnected(false);
    status('Not connected');
  }
  $('#rd-disconnect').addEventListener('click', disconnect);
  $('#rd-reread').addEventListener('click', () => { if (connected && info) readAll(); });
  window.addEventListener('pagehide', () => { PEDALMIDI.editorOff().catch(() => {}); });

  // ---- backups (raw memories, kept in this browser) --------------------------------------------------
  const loadBackups = () => { try { const v = JSON.parse(localStorage.getItem(BACKUP_KEY)); return Array.isArray(v) ? v : []; } catch { return []; } };
  const saveBackups = list => { try { localStorage.setItem(BACKUP_KEY, JSON.stringify(list)); return true; } catch { return false; } };
  function renderBackups() {
    const list = loadBackups();
    $('#rd-backups').innerHTML = list.length ? list.map(b => `<li data-id="${escapeHtml(b.id)}"><span>${escapeHtml(new Date(b.at).toLocaleString('en-GB'))} · ${b.memories.length} memories</span>
      <button class="btn btn-sm" type="button" data-act="download">Download</button> <button class="btn btn-sm btn-danger" type="button" data-act="delete">Delete</button></li>`).join('')
      : '<li class="rd-hint">No backup yet.</li>';
  }
  $('#rd-backup').addEventListener('click', () => {
    const rows = [...memories].filter(([, m]) => m.memory).map(([n, m]) => ({ n, data: toBase64(m.memory) }));
    if (!rows.length) { status('Nothing to back up yet: wait until the memories are read.', 'danger'); return; }
    const list = loadBackups();
    list.unshift({ id: String(Date.now()), at: new Date().toISOString(), memories: rows });
    if (!saveBackups(list.slice(0, MAX_BACKUPS))) { status('The browser has no room for this backup. Delete an older one first.', 'danger'); return; }
    renderBackups();
    DIALOGS.toast(`Backup of ${rows.length} memories saved in this browser`);
  });
  $('#rd-backups').addEventListener('click', async event => {
    const button = event.target.closest('[data-act]');
    if (!button) return;
    const id = button.closest('li').dataset.id;
    const backup = loadBackups().find(b => b.id === id);
    if (!backup) return;
    if (button.dataset.act === 'download') {
      download(JSON.stringify({ format: `${PEDAL.id}-usb-backup`, version: 1, at: backup.at, memories: backup.memories }, null, 2), `${PEDAL.id}-backup-${backup.at.slice(0, 10)}.json`, 'application/json');
    } else if (await DIALOGS.confirm({ title: 'Delete this backup?', text: 'It is only kept in this browser: it cannot be brought back.', ok: 'Delete', danger: true })) {
      saveBackups(loadBackups().filter(b => b.id !== id));
      renderBackups();
    }
  });

  // ---- start -----------------------------------------------------------------------------------------
  // The memories as last read are shown while the pedal is not connected
  try {
    const last = JSON.parse(localStorage.getItem(LAST_READ_KEY));
    if (last?.memories?.length) {
      info = { count: Math.max(...last.memories.map(([n]) => n)) };
      for (const [n, b64] of last.memories) {
        const memory = fromBase64(b64);
        const size = memory.length >= 8 ? new DataView(memory.buffer).getUint32(4, true) : 0;
        const data = size > 0 && size <= memory.length ? memory.slice(0, size) : memory;
        try { memories.set(n, { state: 'ok', data, memory, crcOk: true, patch: parsePatch(data) }); } catch (error) { memories.set(n, { state: 'error', error: error.message, memory }); }
      }
      for (let n = 1; n <= info.count; n++) if (!memories.has(n)) memories.set(n, { state: 'empty' });
      status(`Showing the memories as last read on ${new Date(last.at).toLocaleString('en-GB')}.`);
    }
  } catch {}
  if (!PEDALMIDI.supported()) status(NO_MIDI, 'danger');
  setConnected(false);
  renderBackups();
})();
