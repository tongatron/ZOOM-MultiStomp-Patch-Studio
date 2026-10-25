// Patch builder: compone una catena di effetti e scarica il file .zptc (codec in zptc.js).

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

// Metadati effetto: dati di catalogo + codec dei parametri
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
const pct = n => `${n.toFixed(1).replace('.', ',')}%`;
const dspLevel = dsp => dsp < 10 ? 'low' : dsp < 20 ? 'mid' : dsp < 40 ? 'high' : 'max';
const totalDsp = () => state.effects.reduce((s, slot) => s + catalog[slot.index].dsp, 0);

// ---- stato ------------------------------------------------------------------------------------
let uid = 0;
const state = { name: '', effects: [] }; // effects: [{ uid, index, on, values, open }]

function slotFor(index, values = null) {
  const fx = catalog[index];
  const defaults = Object.fromEntries(fx.params.map(p => [p.name, p.codec ? p.codec.fallback : 0]));
  return { uid: ++uid, index, on: true, values: { ...defaults, ...values }, open: true };
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: state.name, effects: state.effects.map(({ index, on, values }) => ({ index, on, values })) })); } catch {}
}
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return;
    state.name = typeof saved.name === 'string' ? saved.name : '';
    state.effects = (saved.effects || []).filter(e => catalog[e.index]).slice(0, ZPTC.MAX_EFFECTS)
      .map(e => ({ ...slotFor(e.index, e.values), on: e.on !== false, open: false }));
  } catch {}
}

// ---- catena -----------------------------------------------------------------------------------
function paramControl(slot, p) {
  const value = slot.values[p.name];
  const id = `p-${slot.uid}-${p.name.replace(/[^a-z0-9]/gi, '')}`;
  const c = p.codec;
  let control;
  let shown = value;
  if (!c) {
    control = `<input class="form-control form-control--sm" type="number" id="${id}" min="0" max="${2 ** p.bits - 1}" step="1" value="${value}" data-raw="1" />`;
    shown = `grezzo ${value}`;
  } else if (c.kind === 'enum') {
    control = `<select class="form-control form-control--sm" id="${id}">${c.options.map(o => `<option${o === value ? ' selected' : ''}>${escapeHtml(o)}</option>`).join('')}</select>`;
  } else {
    const isOff = c.kind === 'off-number';
    const min = isOff ? c.min - 1 : c.min;
    const current = isOff && value === 'OFF' ? min : value;
    control = `<input type="range" class="slider" id="${id}" min="${min}" max="${c.max}" step="${c.step}" value="${current}" ${isOff ? 'data-off="1"' : ''} />`;
    shown = isOff && value === 'OFF' ? 'OFF' : c.step < 1 ? Number(value).toFixed(1) : value;
  }
  const badge = !c ? '<span class="Label Label--attention" title="Formato non ancora decifrato: inserisci il valore memorizzato">grezzo</span>'
    : !c.verified ? '<span class="Label Label--attention" title="Codifica dedotta per analogia: controlla il valore sul pedale">da verificare</span>' : '';
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
    list.innerHTML = `<li class="blankslate"><h3>Patch vuota</h3><p>Aggiungi il primo effetto: il segnale va dall'alto (INPUT) verso il basso (OUTPUT).</p><button class="btn btn-sm" data-action="open-picker">${icon(ICON_PLUS)} Aggiungi effetto</button></li>`;
    return;
  }
  list.innerHTML = state.effects.map((slot, i) => {
    const fx = catalog[slot.index];
    return `<li class="chain-item${slot.on ? '' : ' is-off'}" data-uid="${slot.uid}" style="--c:${color(fx)}">
      <div class="chain-head">
        <span class="chain-slot">${i + 1}</span>
        <img class="fx-thumb" src="${fx.image}" alt="" width="40" height="50" />
        <button class="chain-title" data-action="toggle-open" aria-expanded="${slot.open}">
          <span class="chain-name">${escapeHtml(fx.name)}</span>
          <span class="chain-meta">${categoryLabel(fx)}<span class="dsp-inline" data-level="${dspLevel(fx.dsp)}">DSP ${pct(fx.dsp)}</span></span>
        </button>
        <div class="chain-actions">
          <label class="switch" title="Effetto ${slot.on ? 'acceso' : 'spento'}"><input type="checkbox" data-action="toggle-on" ${slot.on ? 'checked' : ''} /><span></span><b>${slot.on ? 'ON' : 'OFF'}</b></label>
          <button class="btn btn-sm btn-icon" data-action="up" ${i === 0 ? 'disabled' : ''} aria-label="Sposta verso l'ingresso" title="Sposta su">${icon(ICON_UP)}</button>
          <button class="btn btn-sm btn-icon" data-action="down" ${i === n - 1 ? 'disabled' : ''} aria-label="Sposta verso l'uscita" title="Sposta giù">${icon(ICON_DOWN)}</button>
          <button class="btn btn-sm btn-icon btn-danger" data-action="remove" aria-label="Rimuovi ${escapeHtml(fx.name)}" title="Rimuovi">${icon(ICON_TRASH)}</button>
          <button class="btn btn-sm btn-icon btn-invisible chain-chevron" data-action="toggle-open" aria-expanded="${slot.open}" aria-label="Mostra parametri">${icon(ICON_CHEVRON)}</button>
        </div>
      </div>
      ${slot.open ? `<div class="param-grid">${fx.params.map(p => paramControl(slot, p)).join('')}</div>` : ''}
    </li>`;
  }).join('');
}

// ---- riepilogo --------------------------------------------------------------------------------
function buildSpec() {
  return {
    name: state.name,
    effects: state.effects.map(slot => {
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
  }).join('') + (state.effects.length ? `<li class="free"><span class="dot"></span><span class="name">Libero</span><span class="val">${pct(Math.max(0, 100 - total))}</span></li>` : '');

  const notices = [];
  const nameOk = state.name.trim() && ZPTC.NAME_CHARS.test(state.name);
  if (!state.effects.length) notices.push(['muted', 'Aggiungi almeno un effetto.']);
  if (!state.name.trim()) notices.push(['muted', 'Dai un nome alla patch.']);
  else if (!ZPTC.NAME_CHARS.test(state.name)) notices.push(['danger', 'Il nome contiene caratteri non ammessi dal pedale.']);
  if (total > 100) notices.push(['danger', `Carico stimato ${pct(total)}: oltre il 100% il pedale mostra PROCESS OVERFLOW. Togli o sostituisci un effetto.`]);
  else if (total > 95) notices.push(['attention', 'Vicino al limite: la stima ha un margine di circa ±1%.']);
  const unverified = [];
  const raw = [];
  state.effects.forEach(slot => catalog[slot.index].params.forEach(p => {
    if (!p.codec) raw.push(`${catalog[slot.index].lcd} ${p.name}`);
    else if (!p.codec.verified) unverified.push(`${catalog[slot.index].lcd} ${p.name}`);
  }));
  if (unverified.length) notices.push(['attention', `Da verificare sul pedale: ${unverified.join(', ')}.`]);
  if (raw.length) notices.push(['attention', `Valori grezzi (formato non decifrato): ${raw.join(', ')}.`]);
  $('#notices').innerHTML = notices.map(([kind, text]) => `<li class="notice notice--${kind}">${escapeHtml(text)}</li>`).join('');
  $('#download').disabled = !state.effects.length || !nameOk || total > 100;
  $('#patch-name').classList.toggle('is-invalid', Boolean(state.name) && !ZPTC.NAME_CHARS.test(state.name));
}

function render() { renderChain(); renderSummary(); save(); }
const notify = (kind, text) => $('#notices').insertAdjacentHTML('afterbegin', `<li class="notice notice--${kind}">${escapeHtml(text)}</li>`);

// ---- interazioni catena -----------------------------------------------------------------------
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
  if (input.dataset.raw) { value = Math.max(0, Math.min(2 ** p.bits - 1, Math.round(Number(value) || 0))); shown = `grezzo ${value}`; }
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
$('#clear-chain').addEventListener('click', () => {
  if (state.effects.length && !confirm('Svuotare la patch?')) return;
  state.effects = [];
  state.name = '';
  $('#patch-name').value = '';
  render();
});

// ---- download / apertura file -----------------------------------------------------------------
$('#download').addEventListener('click', () => {
  try {
    const { file } = ZPTC.encode(buildSpec());
    const url = URL.createObjectURL(new Blob([file], { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.name.trim().replace(/[^A-Za-z0-9_-]+/g, '_') || 'patch'}.zptc`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    notify('danger', error.message);
  }
});

$('#open-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    const patch = ZPTC.decode(new Uint8Array(await file.arrayBuffer()));
    const skipped = [];
    state.effects = patch.effects.flatMap(e => {
      const fx = catalog.find(item => item.name === e.effect);
      if (!fx) { skipped.push(e.effect); return []; }
      const values = {};
      fx.params.forEach(p => {
        const v = e.params[p.name];
        if (!p.codec) values[p.name] = v && typeof v === 'object' ? v.raw : 0;
        else if (v !== undefined && typeof v !== 'object') values[p.name] = v;
      });
      return [{ ...slotFor(fx.index, values), on: e.on, open: false }];
    });
    state.name = patch.name;
    $('#patch-name').value = patch.name;
    render();
    if (skipped.length) notify('attention', `Effetti non riconosciuti saltati: ${skipped.join(', ')}.`);
  } catch (error) {
    notify('danger', `File non valido: ${error.message}`);
  }
});

// ---- picker effetti ---------------------------------------------------------------------------
const picker = $('#picker');
const pickerState = { query: '', category: null };

function renderPicker() {
  const total = totalDsp();
  $('#picker-cats').innerHTML = [[null, 'Tutte'], ...Object.entries(CATEGORIES).map(([key, c]) => [key, c.label])]
    .map(([key, label]) => `<button class="chip-filter" data-cat="${key ?? ''}" aria-pressed="${pickerState.category === key}">${key ? `<span class="dot" style="--c:${CATEGORIES[key].color}"></span>` : ''}${label}</button>`).join('');
  const items = catalog.filter(fx => (!pickerState.category || fx.category === pickerState.category)
    && (!pickerState.query || `${fx.name} ${fx.lcd} ${fx.category}`.toLowerCase().includes(pickerState.query)));
  $('#picker-list').innerHTML = items.length ? items.map(fx => {
    const over = total + fx.dsp > 100;
    return `<li><button class="picker-item" data-index="${fx.index}">
      <img class="fx-thumb" src="${fx.image}" alt="" loading="lazy" width="36" height="45" />
      <span class="picker-main"><span class="picker-name">${escapeHtml(fx.name)} ${categoryLabel(fx)}</span><span class="picker-desc" lang="en">${escapeHtml(fx.description)}</span></span>
      <span class="picker-dsp${over ? ' is-over' : ''}" title="${over ? 'Con questo effetto la patch supera il 100%' : 'Carico DSP e totale risultante'}">${pct(fx.dsp)}<small>→ ${pct(total + fx.dsp)}</small></span>
    </button></li>`;
  }).join('') : '<li class="blankslate"><p>Nessun effetto trovato.</p></li>';
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

// ---- avvio ------------------------------------------------------------------------------------
load();
const addSlug = new URLSearchParams(location.search).get('add');
if (addSlug) {
  const fx = catalog.find(item => item.slug === addSlug);
  if (fx && state.effects.length < ZPTC.MAX_EFFECTS) {
    state.effects.forEach(slot => { slot.open = false; });
    state.effects.push(slotFor(fx.index));
  }
  history.replaceState(null, '', location.pathname);
}
$('#patch-name').value = state.name;
render();
