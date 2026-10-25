// Patch builder: composes an effect chain and downloads the .zptc file (codec in zptc.js).

const STORAGE_KEY = 'ms60b-builder';
const PARAM_BITS = [12, 12, 12, 12, 12, 8, 8, 8, 12, 12, 12, 12];

const $ = selector => document.querySelector(selector);
const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icon = (paths, size = 16) => `<svg viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true">${paths}</svg>`;
const ICON_UP = '<path fill="currentColor" d="M3.47 7.78a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1-1.06 1.06L9 4.81v7.44a.75.75 0 0 1-1.5 0V4.81L4.53 7.78a.75.75 0 0 1-1.06 0Z"/>';
const ICON_DOWN = '<path fill="currentColor" d="M13.03 8.22a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.47 9.28a.75.75 0 0 1 1.06-1.06l2.97 2.97V3.75a.75.75 0 0 1 1.5 0v7.44l2.97-2.97a.75.75 0 0 1 1.06 0Z"/>';
const ICON_TRASH = '<path fill="currentColor" d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>';
const ICON_CHEVRON = '<path fill="currentColor" d="M12.78 5.22a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 6.28a.75.75 0 0 1 1.06-1.06L8 8.94l3.72-3.72a.75.75 0 0 1 1.06 0Z"/>';
const ICON_PLUS = '<path fill="currentColor" d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/>';

// Effect metadata: catalog data + parameter codecs
const catalog = EFFECTS_DATA.map(([name, category, , description, , params], index) => ({
  index, name, category, description,
  params: params.map(([pname, desc, range], p) => ({ name: pname, desc, range, bits: PARAM_BITS[p], codec: ZPTC.codec(range, pname) })),
  dsp: ZPTC.effects[index].dsp,
  lcd: ZPTC.effects[index].lcd,
  slug: name.toLowerCase().replace(/\+/g, '-plus-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  image: `assets/effects/fx-${String(index).padStart(3, '0')}.png`
}));
const color = fx => CATEGORIES[fx.category].color;
const categoryLabel = fx => `<span class="Label Label--cat" style="--c:${color(fx)}">${CATEGORIES[fx.category].label}</span>`;
const pct = n => `${n.toFixed(1)}%`;
const dspLevel = dsp => dsp < 10 ? 'low' : dsp < 20 ? 'mid' : dsp < 40 ? 'high' : 'max';
const totalDsp = () => state.effects.reduce((s, slot) => s + catalog[slot.index].dsp, 0);

// ---- state ------------------------------------------------------------------------------------
// Current draft (STORAGE_KEY) and saved patch library (LIBRARY_KEY), both in the browser's localStorage.
const LIBRARY_KEY = 'ms60b-library';
let uid = 0;
const state = { name: '', effects: [], currentId: null }; // effects: [{ uid, index, on, values, open }]

function slotFor(index, values = null) {
  const fx = catalog[index];
  const defaults = Object.fromEntries(fx.params.map(p => [p.name, p.codec ? p.codec.fallback : 0]));
  return { uid: ++uid, index, on: true, values: { ...defaults, ...values }, open: true };
}
// Serializable patch shape: { name, effects: [{ index, on, values }] }
const serialize = source => ({ name: source.name, effects: source.effects.map(({ index, on, values }) => ({ index, on, values: { ...values } })) });
const sameContent = (a, b) => JSON.stringify(serialize(a)) === JSON.stringify(serialize(b));
function hydrate(patch) {
  return (patch.effects || []).filter(e => catalog[e.index]).slice(0, ZPTC.MAX_EFFECTS)
    .map(e => ({ ...slotFor(e.index, e.values), on: e.on !== false, open: false }));
}
function save() {
  recordHistory();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...serialize(state), currentId: state.currentId })); } catch {}
}

// ---- undo / redo ------------------------------------------------------------------------------
// Every change goes through save(). Each distinct patch content is kept as a snapshot together with the saved
// patch it belonged to (so undoing never makes "Save" overwrite another patch). Changes less than 700 ms apart,
// like dragging a slider or typing a name, collapse into one undo step. History lives in memory only.
const patchHistory = { undo: [], redo: [], last: null, lastChangeAt: 0, restoring: false };
function updateHistoryButtons() {
  $('#undo').disabled = !patchHistory.undo.length;
  $('#redo').disabled = !patchHistory.redo.length;
}
function recordHistory() {
  if (patchHistory.restoring) return;
  const content = JSON.stringify(serialize(state));
  if (patchHistory.last && patchHistory.last.content === content) { patchHistory.last.id = state.currentId; return; }
  const now = Date.now();
  if (patchHistory.last) {
    if (now - patchHistory.lastChangeAt > 700) { patchHistory.undo.push(patchHistory.last); if (patchHistory.undo.length > 100) patchHistory.undo.shift(); }
    patchHistory.redo = [];
  }
  patchHistory.last = { content, id: state.currentId };
  patchHistory.lastChangeAt = now;
  updateHistoryButtons();
}
function restoreSnapshot(snap) {
  const patch = JSON.parse(snap.content);
  patchHistory.restoring = true;
  state.name = patch.name;
  state.effects = hydrate(patch);
  state.currentId = snap.id;
  $('#patch-name').value = state.name;
  render();
  patchHistory.restoring = false;
  patchHistory.last = snap;
  patchHistory.lastChangeAt = 0;
  updateHistoryButtons();
}
function undo() { if (patchHistory.undo.length) { patchHistory.redo.push(patchHistory.last); restoreSnapshot(patchHistory.undo.pop()); } }
function redo() { if (patchHistory.redo.length) { patchHistory.undo.push(patchHistory.last); restoreSnapshot(patchHistory.redo.pop()); } }
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return;
    state.name = typeof saved.name === 'string' ? saved.name : '';
    state.effects = hydrate(saved);
    state.currentId = saved.currentId ?? null;
  } catch {}
}

// ---- library ----------------------------------------------------------------------------------
let storageOk = true;
function readLibrary() {
  try { const list = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]'); return Array.isArray(list) ? list : []; }
  catch { storageOk = false; return []; }
}
function writeLibrary(list) {
  try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(list)); storageOk = true; return true; }
  catch { storageOk = false; notify('danger', 'Cannot save: this browser does not allow this site to store data.'); return false; }
}
const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const findEntry = id => readLibrary().find(entry => entry.id === id);
function uniqueName(name, list, ignoreId = null) {
  const taken = new Set(list.filter(e => e.id !== ignoreId).map(e => e.name.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  for (let i = 2; ; i++) {
    const suffix = ` ${i}`;
    const candidate = name.slice(0, 28 - suffix.length) + suffix;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}
function addToLibrary(patch, list = readLibrary()) {
  const entry = { id: newId(), ...serialize(patch), name: uniqueName(patch.name || 'PATCH', list), updatedAt: new Date().toISOString() };
  list.unshift(entry);
  return entry;
}
function isDirty() {
  if (!state.currentId) return state.effects.length > 0;
  const entry = findEntry(state.currentId);
  return !entry || !sameContent(state, entry);
}

// ---- chain ------------------------------------------------------------------------------------
function paramControl(slot, p) {
  const value = slot.values[p.name];
  const id = `p-${slot.uid}-${p.name.replace(/[^a-z0-9]/gi, '')}`;
  const c = p.codec;
  let control;
  let shown = value;
  if (!c) {
    control = `<input class="form-control form-control--sm" type="number" id="${id}" min="0" max="${2 ** p.bits - 1}" step="1" value="${value}" data-raw="1" />`;
    shown = `raw ${value}`;
  } else if (c.kind === 'enum') {
    control = `<select class="form-control form-control--sm" id="${id}">${c.options.map(o => `<option${o === value ? ' selected' : ''}>${escapeHtml(o)}</option>`).join('')}</select>`;
  } else {
    const isOff = c.kind === 'off-number';
    const min = isOff ? c.min - 1 : c.min;
    const current = isOff && value === 'OFF' ? min : value;
    control = `<input type="range" class="slider" id="${id}" min="${min}" max="${c.max}" step="${c.step}" value="${current}" ${isOff ? 'data-off="1"' : ''} />`;
    shown = isOff && value === 'OFF' ? 'OFF' : c.step < 1 ? Number(value).toFixed(1) : value;
  }
  const badge = !c ? '<span class="Label Label--attention" title="Format not decoded yet: enter the stored value">raw</span>'
    : !c.verified ? '<span class="Label Label--attention" title="Encoding inferred by analogy: check the value on the pedal">unverified</span>' : '';
  return `<div class="param" title="${escapeHtml(p.desc)}">
    <label class="param-head" for="${id}"><code>${escapeHtml(p.name)}</code><span class="param-val">${escapeHtml(shown)}</span></label>
    ${control}
    <div class="param-foot"><span>${escapeHtml(p.range)}</span>${badge}</div>
  </div>`;
}

function renderChain() {
  const list = $('#chain-list');
  const n = state.effects.length;
  $('#chain-count').textContent = `${n} / ${ZPTC.MAX_EFFECTS}`;
  $('#tab-count').textContent = n;
  $('#add-effect').disabled = n >= ZPTC.MAX_EFFECTS;
  if (!n) {
    list.innerHTML = `<li class="blankslate"><h3>Empty patch</h3><p>Add the first effect: the signal flows from the top (INPUT) to the bottom (OUTPUT).</p><button class="btn btn-sm" data-action="open-picker">${icon(ICON_PLUS)} Add effect</button></li>`;
    return;
  }
  list.innerHTML = state.effects.map((slot, i) => {
    const fx = catalog[slot.index];
    return `<li class="chain-item${slot.on ? '' : ' is-off'}" data-uid="${slot.uid}" style="--c:${color(fx)}">
      <div class="chain-head">
        <button class="chain-grip" data-grip aria-label="Drag to reorder ${escapeHtml(fx.name)}" title="Drag to reorder" tabindex="-1"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M5 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM5 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-6 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg></button>
        <span class="chain-slot">${i + 1}</span>
        <img class="fx-thumb" src="${fx.image}" alt="" width="40" height="50" />
        <button class="chain-title" data-action="toggle-open" aria-expanded="${slot.open}">
          <span class="chain-name">${escapeHtml(fx.name)}</span>
          <span class="chain-meta">${categoryLabel(fx)}<span class="dsp-inline" data-level="${dspLevel(fx.dsp)}">DSP ${pct(fx.dsp)}</span></span>
        </button>
        <div class="chain-actions">
          <label class="switch" title="Effect ${slot.on ? 'on' : 'off'}"><input type="checkbox" data-action="toggle-on" ${slot.on ? 'checked' : ''} /><span></span><b>${slot.on ? 'ON' : 'OFF'}</b></label>
          <button class="btn btn-sm btn-icon" data-action="up" ${i === 0 ? 'disabled' : ''} aria-label="Move towards the input" title="Move up">${icon(ICON_UP)}</button>
          <button class="btn btn-sm btn-icon" data-action="down" ${i === n - 1 ? 'disabled' : ''} aria-label="Move towards the output" title="Move down">${icon(ICON_DOWN)}</button>
          <button class="btn btn-sm btn-icon btn-danger" data-action="remove" aria-label="Remove ${escapeHtml(fx.name)}" title="Remove">${icon(ICON_TRASH)}</button>
          <button class="btn btn-sm btn-icon btn-invisible chain-chevron" data-action="toggle-open" aria-expanded="${slot.open}" aria-label="Show parameters">${icon(ICON_CHEVRON)}</button>
        </div>
      </div>
      ${slot.open ? `<div class="param-grid">${fx.params.map(p => paramControl(slot, p)).join('')}</div>` : ''}
    </li>`;
  }).join('');
}

// ---- summary ----------------------------------------------------------------------------------
function buildSpec(source = state) {
  return {
    name: source.name,
    effects: source.effects.map(slot => {
      const fx = catalog[slot.index];
      const params = Object.fromEntries(fx.params.map(p => [p.name, p.codec ? slot.values[p.name] : { raw: Number(slot.values[p.name]) || 0 }]));
      return { effect: fx.name, on: slot.on, params };
    })
  };
}

function renderSummary() {
  const total = totalDsp();
  const scale = Math.max(100, total);
  const totalEl = $('#dsp-total');
  totalEl.textContent = pct(total);
  totalEl.dataset.level = total > 100 ? 'over' : total > 95 ? 'near' : 'ok';
  $('#dsp-stack').innerHTML = state.effects.map(slot => {
    const fx = catalog[slot.index];
    return `<span style="--c:${color(fx)};width:${fx.dsp / scale * 100}%" title="${escapeHtml(fx.name)} ${pct(fx.dsp)}"></span>`;
  }).join('') + (total > 100 ? `<i class="dsp-limit" style="left:${100 / scale * 100}%"></i>` : '');
  $('#dsp-legend').innerHTML = state.effects.map(slot => {
    const fx = catalog[slot.index];
    return `<li><span class="dot" style="--c:${color(fx)}"></span><span class="name">${escapeHtml(fx.lcd)}</span><span class="val">${pct(fx.dsp)}</span></li>`;
  }).join('') + (state.effects.length ? `<li class="free"><span class="dot"></span><span class="name">Free</span><span class="val">${pct(Math.max(0, 100 - total))}</span></li>` : '');

  const notices = [];
  const nameOk = state.name.trim() && ZPTC.NAME_CHARS.test(state.name);
  if (!state.effects.length) notices.push(['muted', 'Add at least one effect.']);
  if (!state.name.trim()) notices.push(['muted', 'Give the patch a name.']);
  else if (!ZPTC.NAME_CHARS.test(state.name)) notices.push(['danger', 'The name contains characters the pedal does not accept.']);
  // With advice on, the DSP warnings appear in the Advice panel instead
  if (!adviceSettings.enabled && total > 100) notices.push(['danger', `Estimated load ${pct(total)}: above 100% the pedal shows PROCESS OVERFLOW. Remove or replace an effect.`]);
  else if (!adviceSettings.enabled && total > 95) notices.push(['attention', 'Close to the limit: the estimate is accurate to about ±1%.']);
  const unverified = [];
  const raw = [];
  state.effects.forEach(slot => catalog[slot.index].params.forEach(p => {
    if (!p.codec) raw.push(`${catalog[slot.index].lcd} ${p.name}`);
    else if (!p.codec.verified) unverified.push(`${catalog[slot.index].lcd} ${p.name}`);
  }));
  if (unverified.length) notices.push(['attention', `Check on the pedal: ${unverified.join(', ')}.`]);
  if (raw.length) notices.push(['attention', `Raw values (format not decoded): ${raw.join(', ')}.`]);
  $('#notices').innerHTML = notices.map(([kind, text]) => `<li class="notice notice--${kind}">${escapeHtml(text)}</li>`).join('');
  $('#download').disabled = !state.effects.length || !nameOk || total > 100;
  $('#patch-name').classList.toggle('is-invalid', Boolean(state.name) && !ZPTC.NAME_CHARS.test(state.name));
  renderSaveState();
  renderAdvice();
}

const formatDate = iso => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function renderSaveState() {
  const entry = state.currentId ? findEntry(state.currentId) : null;
  if (state.currentId && !entry) state.currentId = null;
  const dirty = isDirty();
  const canSave = state.effects.length > 0 && state.name.trim() && ZPTC.NAME_CHARS.test(state.name);
  $('#save-patch').disabled = !canSave || (entry && !dirty);
  $('#save-as-new').hidden = !entry;
  $('#save-label').textContent = entry ? (dirty ? 'Save changes' : 'Saved') : 'Save';
  $('#save-status').innerHTML = !storageOk ? '<span class="status status--danger">Saving is not available in this browser</span>'
    : entry ? `<span class="status ${dirty ? 'status--attention' : 'status--ok'}">${dirty ? 'Unsaved changes' : `Saved ${formatDate(entry.updatedAt)}`}</span>`
    : state.effects.length ? '<span class="status status--attention">Patch not saved yet</span>' : '';
}

function renderLibrary() {
  const list = readLibrary();
  $('#library-count').textContent = list.length;
  $('#library-list').innerHTML = list.length ? list.map(entry => {
    const effects = entry.effects.filter(e => catalog[e.index]);
    const dsp = effects.reduce((s, e) => s + catalog[e.index].dsp, 0);
    const chain = effects.map(e => catalog[e.index].lcd).join(' → ');
    return `<li class="library-item${entry.id === state.currentId ? ' is-current' : ''}" data-id="${entry.id}">
      <button class="library-open" data-lib="open" title="Open in the builder">
        <span class="library-name">${escapeHtml(entry.name)}</span>
        <span class="library-chain">${escapeHtml(chain || '—')}</span>
        <span class="library-meta">${effects.length} effects · DSP ${pct(dsp)} · ${formatDate(entry.updatedAt)}</span>
      </button>
      <div class="library-tools">
        <button class="btn btn-sm btn-icon btn-invisible" data-lib="download" title="Download .zptc" aria-label="Download ${escapeHtml(entry.name)} as .zptc" ${dsp > 100 || !effects.length ? 'disabled' : ''}><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/><path fill="currentColor" d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 6.78a.75.75 0 1 1 1.06-1.06l1.97 1.969Z"/></svg></button>
        <button class="btn btn-sm btn-icon btn-invisible" data-lib="duplicate" title="Duplicate" aria-label="Duplicate ${escapeHtml(entry.name)}"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path fill="currentColor" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg></button>
        <button class="btn btn-sm btn-icon btn-invisible btn-danger" data-lib="delete" title="Delete" aria-label="Delete ${escapeHtml(entry.name)}">${icon(ICON_TRASH)}</button>
      </div>
    </li>`;
  }).join('') : '<li class="library-empty">No saved patches yet. Build a chain and press <b>Save</b>, or import some <code>.zptc</code> files.</li>';
  $('#export-library').disabled = !list.length;
  $('#compare-open').disabled = list.length + (state.effects.length ? 1 : 0) < 2;
}

function render() { renderChain(); renderSummary(); renderLibrary(); save(); }
const notify = (kind, text) => $('#notices').insertAdjacentHTML('afterbegin', `<li class="notice notice--${kind}">${escapeHtml(text)}</li>`);

// ---- chain interactions -----------------------------------------------------------------------
$('#chain-list').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.dataset.action === 'toggle-on') return;
  if (button.dataset.action === 'open-picker') { openPicker(); return; }
  const item = button.closest('.chain-item');
  const i = state.effects.findIndex(slot => slot.uid === Number(item.dataset.uid));
  const slot = state.effects[i];
  switch (button.dataset.action) {
    case 'up': [state.effects[i - 1], state.effects[i]] = [state.effects[i], state.effects[i - 1]]; break;
    case 'down': [state.effects[i + 1], state.effects[i]] = [state.effects[i], state.effects[i + 1]]; break;
    case 'remove': state.effects.splice(i, 1); break;
    case 'toggle-open': slot.open = !slot.open; break;
    default: return;
  }
  render();
});

$('#chain-list').addEventListener('change', event => {
  if (event.target.dataset.action !== 'toggle-on') return;
  const slot = state.effects.find(s => s.uid === Number(event.target.closest('.chain-item').dataset.uid));
  slot.on = event.target.checked;
  render();
});

$('#chain-list').addEventListener('input', event => {
  const input = event.target;
  const card = input.closest('.param');
  if (!card) return;
  const slot = state.effects.find(s => s.uid === Number(input.closest('.chain-item').dataset.uid));
  const name = card.querySelector('code').textContent;
  const p = catalog[slot.index].params.find(param => param.name === name);
  let value = input.value;
  let shown = value;
  if (input.dataset.raw) { value = Math.max(0, Math.min(2 ** p.bits - 1, Math.round(Number(value) || 0))); shown = `raw ${value}`; }
  else if (input.type === 'range') {
    value = Number(value);
    if (input.dataset.off && value < p.codec.min) { value = 'OFF'; shown = 'OFF'; }
    else shown = p.codec.step < 1 ? value.toFixed(1) : value;
  }
  slot.values[name] = value;
  card.querySelector('.param-val').textContent = shown;
  renderSummary();
  save();
});

$('#patch-name').addEventListener('input', event => { state.name = event.target.value; renderSummary(); save(); });
const confirmDiscard = () => !isDirty() || !state.effects.length || confirm('The current patch has unsaved changes. Continue and lose them?');
function loadPatch(patch, currentId = null) {
  state.name = patch.name;
  state.effects = hydrate(patch);
  state.currentId = currentId;
  $('#patch-name').value = patch.name;
  render();
}
$('#clear-chain').addEventListener('click', () => {
  if (!confirmDiscard()) return;
  loadPatch({ name: '', effects: [] });
  $('#patch-name').focus();
});

// ---- drag to reorder ----------------------------------------------------------------------------
// Pointer events cover mouse, pen and touch; the grip handle is the only drag source, so scrolling still works.
{
  const list = $('#chain-list');
  let drag = null;
  // The chain is a row on wide screens (pedalboard) and a column on narrow ones: follow the layout direction
  const isRow = () => { const style = getComputedStyle(list); return style.display === 'flex' && style.flexDirection === 'row'; };
  const targetIndex = event => {
    const others = [...list.querySelectorAll('.chain-item')].filter(item => item !== drag.item);
    return others.filter(item => { const r = item.getBoundingClientRect(); return drag.row ? event.clientX > r.left + r.width / 2 : event.clientY > r.top + r.height / 2; }).length;
  };
  const clearMarks = () => list.querySelectorAll('.drop-before, .drop-after').forEach(el => el.classList.remove('drop-before', 'drop-after'));
  list.addEventListener('pointerdown', event => {
    const grip = event.target.closest('[data-grip]');
    if (!grip || event.button > 0) return;
    const item = grip.closest('.chain-item');
    drag = { item, from: state.effects.findIndex(s => String(s.uid) === item.dataset.uid), startX: event.clientX, startY: event.clientY, row: isRow(), to: null };
    grip.setPointerCapture(event.pointerId);
    item.classList.add('is-dragging');
    event.preventDefault();
  });
  list.addEventListener('pointermove', event => {
    if (!drag) return;
    drag.item.style.transform = drag.row ? `translateX(${event.clientX - drag.startX}px)` : `translateY(${event.clientY - drag.startY}px)`;
    drag.to = targetIndex(event);
    clearMarks();
    const others = [...list.querySelectorAll('.chain-item')].filter(item => item !== drag.item);
    if (drag.to < others.length) others[drag.to].classList.add('drop-before'); else others.at(-1)?.classList.add('drop-after');
  });
  const finish = event => {
    if (!drag) return;
    const { from, to } = drag;
    drag = null;
    clearMarks();
    if (event.type !== 'pointercancel' && to !== null && to !== from) {
      const [moved] = state.effects.splice(from, 1);
      state.effects.splice(to, 0, moved);
    }
    render();
  };
  list.addEventListener('pointerup', finish);
  list.addEventListener('pointercancel', finish);
}

// ---- compare two patches ------------------------------------------------------------------------
{
  const dialog = $('#compare');
  const sources = () => {
    const list = readLibrary().map(entry => ({ key: entry.id, label: entry.name, effects: entry.effects.filter(e => catalog[e.index]) }));
    if (state.effects.length) list.unshift({ key: '__editor', label: `${state.name.trim() || 'Untitled'} (editor)`, effects: serialize(state).effects });
    return list;
  };
  // Longest common subsequence of effect indexes keeps the same effects on one row, even when others move around it
  function align(a, b) {
    const t = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) t[i][j] = a[i].index === b[j].index ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    const rows = [];
    let i = 0, j = 0;
    while (i < a.length || j < b.length) {
      if (i < a.length && j < b.length && a[i].index === b[j].index) rows.push({ a: a[i++], b: b[j++] });
      else if (j >= b.length || (i < a.length && t[i + 1][j] >= t[i][j + 1])) rows.push({ a: a[i++] });
      else rows.push({ b: b[j++] });
    }
    return rows;
  }
  const fmt = v => (v === undefined || v === null || v === '') ? '—' : String(v);
  function diffs(row) {
    const fx = catalog[(row.a || row.b).index];
    const list = [];
    if ((row.a.on !== false) !== (row.b.on !== false)) list.push({ name: 'State', a: row.a.on !== false ? 'ON' : 'OFF', b: row.b.on !== false ? 'ON' : 'OFF' });
    fx.params.forEach(p => { const x = row.a.values?.[p.name], y = row.b.values?.[p.name]; if (fmt(x) !== fmt(y)) list.push({ name: p.name, a: fmt(x), b: fmt(y) }); });
    return list;
  }
  const cell = (slot, changes, side) => {
    if (!slot) return '<div class="cmp-cell cmp-empty">—</div>';
    const fx = catalog[slot.index];
    return `<div class="cmp-cell" style="--c:${color(fx)}">
      <img class="fx-thumb" src="${fx.image}" alt="" width="32" height="40" />
      <div class="cmp-main"><strong>${escapeHtml(fx.name)}</strong>${slot.on === false ? ' <span class="Label">OFF</span>' : ''}
        ${changes ? changes.map(c => `<div class="cmp-chg"><span>${escapeHtml(c.name)}</span> <b>${escapeHtml(c[side])}</b></div>`).join('') : ''}</div>
    </div>`;
  };
  const dspOf = effects => effects.reduce((sum, e) => sum + catalog[e.index].dsp, 0);
  function renderCompare() {
    const list = sources();
    const a = list.find(s => s.key === $('#compare-a').value), b = list.find(s => s.key === $('#compare-b').value);
    if (!a || !b) { $('#compare-body').innerHTML = '<p class="muted">Pick two patches.</p>'; return; }
    const rows = align(a.effects, b.effects).map(row => {
      if (!row.a || !row.b) return `<div class="cmp-row cmp-only-${row.a ? 'a' : 'b'}">${cell(row.a, null, 'a')}${cell(row.b, null, 'b')}</div>`;
      const changes = diffs(row);
      return `<div class="cmp-row ${changes.length ? 'cmp-diff' : 'cmp-same'}">${cell(row.a, changes.length ? changes : null, 'a')}${cell(row.b, changes.length ? changes : null, 'b')}</div>`;
    });
    const same = rows.every(r => r.includes('cmp-same'));
    $('#compare-body').innerHTML = `
      <div class="cmp-head"><div><b>${escapeHtml(a.label)}</b><span>${a.effects.length} effects · DSP ${pct(dspOf(a.effects))}</span></div><div><b>${escapeHtml(b.label)}</b><span>${b.effects.length} effects · DSP ${pct(dspOf(b.effects))}</span></div></div>
      ${same && rows.length ? '<p class="cmp-note">The two patches are identical.</p>' : ''}${rows.join('') || '<p class="muted">Both patches are empty.</p>'}`;
  }
  function openCompare() {
    const list = sources();
    const options = list.map(s => `<option value="${s.key}">${escapeHtml(s.label)}</option>`).join('');
    $('#compare-a').innerHTML = options; $('#compare-b').innerHTML = options;
    $('#compare-a').value = list[0].key;
    $('#compare-b').value = list[1].key;
    renderCompare();
    dialog.showModal();
  }
  $('#compare-open').addEventListener('click', openCompare);
  $('#compare-close').addEventListener('click', () => dialog.close());
  $('#compare-a').addEventListener('change', renderCompare);
  $('#compare-b').addEventListener('change', renderCompare);
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

// ---- saving -----------------------------------------------------------------------------------
function saveCurrent(asNew = false) {
  if (!state.effects.length || !state.name.trim() || !ZPTC.NAME_CHARS.test(state.name)) return;
  const list = readLibrary();
  const existing = !asNew && state.currentId ? list.find(e => e.id === state.currentId) : null;
  if (existing) {
    Object.assign(existing, serialize(state), { name: uniqueName(state.name.trim(), list, existing.id), updatedAt: new Date().toISOString() });
    state.name = existing.name;
  } else {
    const entry = addToLibrary({ ...state, name: state.name.trim() }, list);
    state.currentId = entry.id;
    state.name = entry.name;
  }
  if (!writeLibrary(list)) return;
  $('#patch-name').value = state.name;
  render();
}
$('#save-patch').addEventListener('click', () => saveCurrent());
$('#save-as-new').addEventListener('click', () => saveCurrent(true));
$('#undo').addEventListener('click', undo);
$('#redo').addEventListener('click', redo);
document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && (key === 'z' || key === 'y')) {
    // Text fields keep their own undo; everywhere else Ctrl/⌘+Z steps through the patch history
    if (event.target.matches?.('textarea, input:not([type="range"]):not([type="checkbox"])')) return;
    event.preventDefault();
    if (key === 'y' || event.shiftKey) redo(); else undo();
  }
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!$('#save-patch').disabled) saveCurrent(); }
});

function downloadBytes(bytes, filename, type = 'application/octet-stream') {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const fileName = name => `${name.trim().replace(/[^A-Za-z0-9_-]+/g, '_') || 'patch'}.zptc`;
function downloadPatch(source) {
  try { downloadBytes(ZPTC.encode(buildSpec(source)).file, fileName(source.name)); }
  catch (error) { notify('danger', error.message); }
}
$('#download').addEventListener('click', () => downloadPatch(state));

$('#library-list').addEventListener('click', event => {
  const button = event.target.closest('[data-lib]');
  if (!button) return;
  const id = button.closest('.library-item').dataset.id;
  const list = readLibrary();
  const entry = list.find(e => e.id === id);
  if (!entry) return;
  switch (button.dataset.lib) {
    case 'open':
      if (id === state.currentId || !confirmDiscard()) return;
      loadPatch(entry, id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
    case 'download':
      downloadPatch({ name: entry.name, effects: hydrate(entry) });
      break;
    case 'duplicate': {
      const copy = addToLibrary({ ...entry, name: `${entry.name.slice(0, 24)} COPY` }, list);
      if (writeLibrary(list)) { renderLibrary(); notify('muted', `Created "${copy.name}".`); }
      break;
    }
    case 'delete':
      if (!confirm(`Delete "${entry.name}" from My patches?`)) return;
      if (!writeLibrary(list.filter(e => e.id !== id))) return;
      if (id === state.currentId) state.currentId = null;
      render();
      break;
  }
});

$('#export-library').addEventListener('click', () => {
  const list = readLibrary();
  if (!list.length) return;
  const backup = { format: 'ms60b-patch-library', version: 1, exportedAt: new Date().toISOString(), patches: list };
  downloadBytes(JSON.stringify(backup, null, 2), `ms60b-patch-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
});

// ---- import -----------------------------------------------------------------------------------
// .zptc (one or more files) → new library patches; .json → library backup (merged by id).
function patchFromZptc(bytes) {
  const decoded = ZPTC.decode(bytes);
  const skipped = [];
  const effects = decoded.effects.flatMap(e => {
    const fx = catalog.find(item => item.name === e.effect);
    if (!fx) { skipped.push(e.effect); return []; }
    const values = {};
    fx.params.forEach(p => {
      const v = e.params[p.name];
      if (!p.codec) values[p.name] = v && typeof v === 'object' ? v.raw : 0;
      else if (v !== undefined && typeof v !== 'object') values[p.name] = v;
    });
    return [{ index: fx.index, on: e.on, values }];
  });
  const name = decoded.name.replace(/[^!%&'+,\-.=_ A-Za-z0-9]/g, '').trim() || 'IMPORT';
  return { patch: { name, effects }, skipped };
}
function patchesFromBackup(text) {
  const data = JSON.parse(text);
  const patches = Array.isArray(data) ? data : data?.patches;
  if (!Array.isArray(patches)) throw new Error('not a patch backup');
  return patches.filter(p => p && typeof p.name === 'string' && Array.isArray(p.effects))
    .map(p => ({ id: typeof p.id === 'string' ? p.id : null, updatedAt: p.updatedAt, name: p.name.slice(0, 28), effects: p.effects.filter(e => catalog[e?.index]).slice(0, ZPTC.MAX_EFFECTS) }));
}

async function importFiles(files) {
  if (!files.length) return;
  const list = readLibrary();
  const added = [];
  const problems = [];
  let updated = 0;
  for (const file of files) {
    try {
      if (/\.json$/i.test(file.name) || file.type === 'application/json') {
        const fresh = [];
        for (const p of patchesFromBackup(await file.text())) {
          const existing = p.id && list.find(e => e.id === p.id);
          if (existing) {
            if (!sameContent(existing, p) || existing.name !== p.name) { Object.assign(existing, serialize(p), { updatedAt: p.updatedAt || new Date().toISOString() }); updated++; }
          } else {
            fresh.push({ ...serialize(p), id: p.id || newId(), name: uniqueName(p.name, [...list, ...fresh]), updatedAt: p.updatedAt || new Date().toISOString() });
          }
        }
        list.unshift(...fresh); // keeps the backup order
        added.push(...fresh);
      } else {
        const { patch, skipped } = patchFromZptc(new Uint8Array(await file.arrayBuffer()));
        if (skipped.length) problems.push(`${file.name}: skipped unrecognized effects (${skipped.join(', ')})`);
        if (patch.effects.length) added.push(addToLibrary(patch, list));
        else problems.push(`${file.name}: no recognized effects`);
      }
    } catch (error) {
      problems.push(`${file.name}: ${error.message}`);
    }
  }
  if ((added.length || updated) && !writeLibrary(list)) return;
  // A single imported .zptc opens straight in the builder
  const single = files.length === 1 && added.length === 1 && !/\.json$/i.test(files[0].name);
  if (single && confirmDiscard()) loadPatch(added[0], added[0].id);
  else render();
  problems.forEach(p => notify('attention', p));
  if (added.length || updated) notify('muted', `Imported ${added.length} patch${added.length === 1 ? '' : 'es'}${updated ? `, updated ${updated}` : ''}.`);
}
$('#import-files').addEventListener('change', event => {
  const files = [...event.target.files];
  event.target.value = '';
  importFiles(files);
});

// Drag & drop files onto the page
let dragDepth = 0;
const hasFiles = event => [...(event.dataTransfer?.types || [])].includes('Files');
document.addEventListener('dragenter', event => { if (!hasFiles(event)) return; dragDepth++; document.body.classList.add('is-dropping'); });
document.addEventListener('dragleave', event => { if (!hasFiles(event)) return; dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) document.body.classList.remove('is-dropping'); });
document.addEventListener('dragover', event => { if (hasFiles(event)) event.preventDefault(); });
document.addEventListener('drop', event => {
  if (!hasFiles(event)) return;
  event.preventDefault();
  dragDepth = 0;
  document.body.classList.remove('is-dropping');
  importFiles([...event.dataTransfer.files].filter(f => /\.(zptc|json)$/i.test(f.name)));
});

// ---- effect picker ----------------------------------------------------------------------------
const picker = $('#picker');
const pickerState = { query: '', category: null };

function renderPicker() {
  const total = totalDsp();
  $('#picker-cats').innerHTML = [[null, 'All'], ...Object.entries(CATEGORIES).map(([key, c]) => [key, c.label])]
    .map(([key, label]) => `<button class="chip-filter" data-cat="${key ?? ''}" aria-pressed="${pickerState.category === key}">${key ? `<span class="dot" style="--c:${CATEGORIES[key].color}"></span>` : ''}${label}</button>`).join('');
  const items = catalog.filter(fx => (!pickerState.category || fx.category === pickerState.category)
    && (!pickerState.query || `${fx.name} ${fx.lcd} ${fx.category}`.toLowerCase().includes(pickerState.query)));
  $('#picker-list').innerHTML = items.length ? items.map(fx => {
    const over = total + fx.dsp > 100;
    return `<li><button class="picker-item" data-index="${fx.index}">
      <img class="fx-thumb" src="${fx.image}" alt="" loading="lazy" width="36" height="45" />
      <span class="picker-main"><span class="picker-name">${escapeHtml(fx.name)} ${categoryLabel(fx)}</span><span class="picker-desc" lang="en">${escapeHtml(fx.description)}</span></span>
      <span class="picker-dsp${over ? ' is-over' : ''}" title="${over ? 'With this effect the patch goes over 100%' : 'DSP load and resulting total'}">${pct(fx.dsp)}<small>→ ${pct(total + fx.dsp)}</small></span>
    </button></li>`;
  }).join('') : '<li class="blankslate"><p>No effects found.</p></li>';
}
function openPicker() {
  if (state.effects.length >= ZPTC.MAX_EFFECTS) return;
  renderPicker();
  picker.showModal();
  $('#picker-query').focus();
}
$('#add-effect').addEventListener('click', openPicker);
$('#picker-close').addEventListener('click', () => picker.close());
picker.addEventListener('click', event => {
  if (event.target === picker) { picker.close(); return; }
  const cat = event.target.closest('[data-cat]');
  if (cat) { pickerState.category = cat.dataset.cat || null; renderPicker(); return; }
  const item = event.target.closest('.picker-item');
  if (!item) return;
  state.effects.forEach(slot => { slot.open = false; });
  state.effects.push(slotFor(Number(item.dataset.index)));
  picker.close();
  render();
  document.querySelector('.chain-item:last-child')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
$('#picker-query').addEventListener('input', event => { pickerState.query = event.target.value.trim().toLowerCase(); renderPicker(); });

// ---- advice -----------------------------------------------------------------------------------
// Settings are shared with the catalog page (ms60b-advice in localStorage).
const SEVERITY_LABEL = { error: 'Errors', warning: 'Warnings', tip: 'Tips' };
const SEVERITY_ICON = {
  error: '<path fill="currentColor" d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"/>',
  warning: '<path fill="currentColor" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>',
  tip: '<path fill="currentColor" d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"/>'
};
const adviceSettings = (() => {
  const defaults = { enabled: true, style: 'general', output: null, ignored: [], preferences: [], show: { error: true, warning: true, tip: true } };
  try { return { ...defaults, ...JSON.parse(localStorage.getItem('ms60b-advice') || '{}') }; } catch { return defaults; }
})();
const saveAdvice = () => { try { localStorage.setItem('ms60b-advice', JSON.stringify(adviceSettings)); } catch {} };
let findings = [];

// Style ideas: how close the chain is to the selected style (and what is missing), plus the closest other styles.
const ROLE_LABEL = { comp: 'compressor', drive: 'drive', preamp: 'preamp', amp: 'amp model', envfilter: 'envelope filter', gate: 'noise reduction', eq: 'EQ', synth: 'synth or octaver', delay: 'delay', reverb: 'reverb', mod: 'modulation' };
const roleName = role => ROLE_LABEL[role] || role;
function renderIdeas() {
  const box = $('#advice-ideas');
  if (!state.effects.length) { box.innerHTML = ''; return; }
  const { active, others } = ADVICE.suggestStyles(serialize(state), adviceSettings.style);
  const full = state.effects.length >= ZPTC.MAX_EFFECTS;
  const parts = [];
  if (active) {
    const { style, fit, missing, conflicts } = active;
    parts.push(`<div class="idea">
      <div class="idea-head"><strong>${escapeHtml(style.name)}</strong><span class="fit" data-fit="${fit >= 75 ? 'high' : fit >= 40 ? 'mid' : 'low'}">${fit}% match</span></div>
      ${conflicts.length ? `<p class="idea-note">Works against this style: ${conflicts.map(roleName).join(', ')}.</p>` : ''}
      ${missing.length ? `<p class="idea-note">${escapeHtml(style.name)} usually has a ${missing.map(m => roleName(m.role)).join(', ')}:</p>
        <div class="idea-actions">${missing.map(m => `<button class="btn btn-sm" data-advice="add-role" data-style="${style.id}" data-role="${m.role}" ${full ? 'disabled title="The chain is full"' : ''}>+ ${escapeHtml(m.entry.effect)}</button>`).join('')}</div>`
        : '<p class="idea-note">The chain covers every part of this style\'s starter chain.</p>'}
    </div>`);
  }
  const close = others.filter(f => f.fit > 0).slice(0, 2);
  if (close.length) {
    parts.push(`<div class="idea-alt"><div class="idea-title">${active ? 'Other styles this chain is close to' : 'Closest styles for this chain'}</div>
      ${close.map(f => `<div class="idea-row"><span><b>${escapeHtml(f.style.name)}</b> <span class="fit" data-fit="${f.fit >= 75 ? 'high' : f.fit >= 40 ? 'mid' : 'low'}">${f.fit}%</span>
        <small>${[...f.missing.map(m => `+ ${roleName(m.role)}`), ...f.conflicts.map(c => `− ${roleName(c)}`)].join(', ') || 'nothing to change'}</small></span>
        <button class="btn btn-sm btn-invisible" data-advice="use-style" data-id="${f.style.id}">Use style</button></div>`).join('')}</div>`);
  }
  box.innerHTML = parts.join('');
}

function renderAdvice() {
  const on = adviceSettings.enabled;
  $('#advice-toggle').checked = on;
  $('#advice-toggle-label').textContent = on ? 'ON' : 'OFF';
  $('#advice-body').hidden = !on;
  $('#advice-off').hidden = on;
  $('#advice-style').disabled = !on;
  document.querySelectorAll('.advice-dot').forEach(dot => dot.remove());
  if (!on) { $('#advice-count').textContent = '–'; findings = []; return; }

  const style = ADVICE.styles.find(s => s.id === adviceSettings.style) || ADVICE.styles[0];
  $('#advice-style').innerHTML = ADVICE.styles.map(s => `<option value="${s.id}"${s.id === style.id ? ' selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
  const sourceLinks = list => list.map(src => `<a href="${src.url}" target="_blank" rel="noreferrer">${escapeHtml(src.title)}</a>`).join('');
  $('#advice-style-card').innerHTML = style.id === 'general' ? '' : `
    <div class="style-card">
      <div class="style-card-main"><strong>${escapeHtml(style.name)}</strong><p>${escapeHtml(style.summary)}</p>
        <details class="sources"><summary>Sources</summary>${sourceLinks(style.sources.map(k => ADVICE.sources[k]).filter(Boolean))}</details></div>
      ${style.starter ? `<button class="btn btn-sm" data-advice="starter" title="Replace the current chain with a starting point for this style">Load starter chain</button>` : ''}
    </div>`;

  $('#advice-prefs-count').textContent = adviceSettings.preferences.length;
  $('#advice-prefs-list').innerHTML = ADVICE.preferences.map(pref => `<label class="pref-row" title="${escapeHtml(pref.hint)}"><input type="checkbox" data-advice="pref" data-id="${pref.id}"${adviceSettings.preferences.includes(pref.id) ? ' checked' : ''} /> <span>${escapeHtml(pref.label)}</span></label>`).join('');
  $('#advice-output').innerHTML = `<span class="advice-output-label">Plugging into</span>${[['amp', 'Bass amp'], ['mixer', 'Mixer / PA / headphones']].map(([id, label]) =>
    `<button class="chip-filter" data-advice="output" data-id="${id}" aria-pressed="${adviceSettings.output === id}">${label}</button>`).join('')}`;
  renderIdeas();
  findings = ADVICE.analyze(serialize(state), { output: adviceSettings.output, style: style.id, ignored: adviceSettings.ignored, preferences: adviceSettings.preferences });
  const counts = Object.fromEntries(ADVICE.SEVERITIES.map(sev => [sev, findings.filter(f => f.severity === sev).length]));
  $('#advice-count').textContent = findings.length;
  $('#advice-filters').innerHTML = ADVICE.SEVERITIES.map(sev => `<button class="chip-filter sev-${sev}" data-advice="filter" data-sev="${sev}" aria-pressed="${adviceSettings.show[sev] !== false}">${icon(SEVERITY_ICON[sev], 14)} ${SEVERITY_LABEL[sev]} <span class="Counter">${counts[sev]}</span></button>`).join('');

  const visible = findings.map((f, i) => ({ f, i })).filter(({ f }) => adviceSettings.show[f.severity] !== false);
  $('#advice-list').innerHTML = !state.effects.length ? '<li class="advice-empty">Add effects to get advice on the chain.</li>'
    : !visible.length ? `<li class="advice-empty">${findings.length ? 'Nothing to show with the current filters.' : 'No issues found for this chain.'}</li>`
    : visible.map(({ f, i }) => `<li class="advice-item sev-${f.severity}">
        <span class="advice-icon" title="${f.severity}">${icon(SEVERITY_ICON[f.severity])}</span>
        <div class="advice-main">
          <div class="advice-title">${escapeHtml(f.title)}</div>
          <p class="advice-msg">${escapeHtml(f.message)}</p>
          <details class="advice-why"><summary>Why</summary><p>${escapeHtml(f.why)}</p>${f.sources.length ? `<div class="sources">${sourceLinks(f.sources)}</div>` : ''}</details>
        </div>
        <div class="advice-actions">
          ${f.fix ? `<button class="btn btn-sm" data-advice="fix" data-i="${i}">${escapeHtml(f.fix.label)}</button>` : ''}
          <button class="btn btn-sm btn-invisible" data-advice="ignore" data-i="${i}" title="Stop showing this rule">Ignore</button>
        </div>
      </li>`).join('');
  const ignored = adviceSettings.ignored.length;
  $('#advice-foot').innerHTML = ignored ? `${ignored} rule${ignored === 1 ? '' : 's'} ignored · <button class="clear-link" data-advice="restore">Show again</button>` : '';

  // Severity dot on the affected chain items
  const worst = {};
  visible.forEach(({ f }) => f.slots.forEach(slot => {
    if (!worst[slot] || ADVICE.SEVERITIES.indexOf(f.severity) < ADVICE.SEVERITIES.indexOf(worst[slot])) worst[slot] = f.severity;
  }));
  document.querySelectorAll('.chain-item').forEach((item, slot) => {
    if (!worst[slot]) return;
    item.querySelector('.chain-meta').insertAdjacentHTML('beforeend', `<span class="advice-dot sev-${worst[slot]}" title="See Advice">${icon(SEVERITY_ICON[worst[slot]], 12)}</span>`);
  });
}

$('#advice-on').addEventListener('click', () => { adviceSettings.enabled = true; saveAdvice(); renderSummary(); });
$('#advice-toggle').addEventListener('change', event => { adviceSettings.enabled = event.target.checked; saveAdvice(); renderSummary(); });
$('#advice-style').addEventListener('change', event => { adviceSettings.style = event.target.value; saveAdvice(); renderAdvice(); });
$('#advice').addEventListener('click', event => {
  const button = event.target.closest('[data-advice]');
  if (!button) return;
  const finding = findings[Number(button.dataset.i)];
  switch (button.dataset.advice) {
    case 'filter': {
      const sev = button.dataset.sev;
      adviceSettings.show[sev] = adviceSettings.show[sev] === false;
      break;
    }
    case 'ignore': adviceSettings.ignored = [...new Set([...adviceSettings.ignored, finding.ruleId])]; break;
    case 'restore': adviceSettings.ignored = []; break;
    case 'use-style': adviceSettings.style = button.dataset.id; break;
    case 'output': adviceSettings.output = adviceSettings.output === button.dataset.id ? null : button.dataset.id; break;
    case 'add-role': {
      const style = ADVICE.styles.find(s => s.id === button.dataset.style);
      const patch = serialize(state);
      const fit = ADVICE.styleFit(patch, style);
      const entry = fit.missing.find(m => m.role === button.dataset.role)?.entry;
      if (!entry || state.effects.length >= ZPTC.MAX_EFFECTS) return;
      const index = catalog.find(fx => fx.name === entry.effect).index;
      state.effects.forEach(slot => { slot.open = false; });
      state.effects.splice(ADVICE.insertPosition(patch, fit, button.dataset.role), 0, slotFor(index, entry.values));
      render();
      return;
    }
    case 'pref': {
      const id = button.dataset.id;
      adviceSettings.preferences = button.checked ? [...new Set([...adviceSettings.preferences, id])] : adviceSettings.preferences.filter(p => p !== id);
      break;
    }
    case 'fix': {
      const next = finding.fix.apply(serialize(state));
      state.effects = hydrate(next);
      render();
      return;
    }
    case 'starter': {
      const style = ADVICE.styles.find(s => s.id === adviceSettings.style);
      if (!style?.starter || !confirmDiscard()) return;
      const effects = style.starter.effects.map(e => ({ index: catalog.find(fx => fx.name === e.effect).index, on: true, values: e.values }));
      loadPatch({ name: style.starter.name, effects });
      return;
    }
    default: return;
  }
  saveAdvice();
  renderAdvice();
});

// ---- startup ----------------------------------------------------------------------------------
// "Add to patch" from the catalog (?add=slug): with a patch already in the editor, ask where the effect goes.
const addChoice = $('#add-choice');
let pendingAdd = null;
function appendEffect(fx) {
  state.effects.forEach(slot => { slot.open = false; });
  state.effects.push(slotFor(fx.index));
  render();
  document.querySelector('.chain-item:last-child')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function askWhereToAdd(fx) {
  const name = state.name.trim() || 'Untitled patch';
  const full = state.effects.length >= ZPTC.MAX_EFFECTS;
  const dirty = isDirty();
  const canSave = state.name.trim() && ZPTC.NAME_CHARS.test(state.name);
  const over = totalDsp() + fx.dsp > 100;
  pendingAdd = fx;
  $('#add-choice-title').textContent = `Add ${fx.name}`;
  $('#add-choice-body').innerHTML = `
    <p>The editor already holds <b>${escapeHtml(name)}</b> (${state.effects.length} of ${ZPTC.MAX_EFFECTS} effects${dirty ? ', unsaved changes' : ''}).</p>
    <div class="choice-list">
      <button class="choice" data-choice="current" ${full ? 'disabled' : ''}>
        <strong>Add to “${escapeHtml(name)}”</strong>
        <span>${full ? 'This patch already has 6 effects.' : `Appended as effect ${state.effects.length + 1}. DSP ${pct(totalDsp())} → ${pct(totalDsp() + fx.dsp)}${over ? ' — over the limit' : ''}.`}</span>
      </button>
      ${dirty && canSave ? `<button class="choice" data-choice="save-new">
        <strong>Save “${escapeHtml(name)}” and start a new patch</strong>
        <span>The current patch goes to My patches; the new one starts with ${escapeHtml(fx.name)}.</span>
      </button>` : ''}
      <button class="choice" data-choice="new">
        <strong>${dirty ? 'Start a new patch without saving' : 'Start a new patch'}</strong>
        <span>${dirty ? 'Unsaved changes to the current patch will be lost.' : `A new patch with ${escapeHtml(fx.name)} only.`}</span>
      </button>
    </div>`;
  addChoice.showModal();
  addChoice.querySelector('.choice:not([disabled])')?.focus();
}
addChoice.addEventListener('click', event => {
  if (event.target === addChoice) { addChoice.close(); return; }
  const choice = event.target.closest('[data-choice]')?.dataset.choice;
  if (!choice) return;
  const fx = pendingAdd;
  addChoice.close();
  if (choice === 'current') appendEffect(fx);
  if (choice === 'save-new') saveCurrent();
  if (choice === 'save-new' || choice === 'new') loadPatch({ name: '', effects: [{ index: fx.index, on: true, values: {} }] });
});
addChoice.addEventListener('close', () => { pendingAdd = null; });

load();
const addSlug = new URLSearchParams(location.search).get('add');
history.replaceState(null, '', location.pathname);
$('#patch-name').value = state.name;
render();
const addFx = addSlug && catalog.find(item => item.slug === addSlug);
if (addFx) {
  if (state.effects.length) askWhereToAdd(addFx);
  else appendEffect(addFx);
}
