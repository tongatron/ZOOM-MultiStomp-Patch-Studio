const FEATURES = {
  fs: { label: 'Footswitch', hint: 'Controlled by the footswitch' },
  sync: { label: 'Tempo sync', hint: 'Can sync to tempo' },
  st: { label: 'Stereo', hint: 'Stereo output' },
  dry: { label: 'Mix dry/wet', hint: 'Dry signal can be blended in' }
};
const PDF_URL = PEDAL.fxListUrl;
const MANUAL_URL = PEDAL.manualUrl;
const FW_SOURCE_URL = PEDAL.fwSourceUrl;
const ADVICE_KEY = `${PEDAL.id}-advice`;
const KNOBS = 4;
const SLOTS = 6;

const slugify = text => text.toLowerCase().replace(/\+/g, '-plus-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const effects = EFFECTS_DATA.map(([name, category, model, description, tags, params], index) => {
  // No firmware entry: a Handy Guitar Lab additional effect whose ID is not known, so the builder cannot use it
  const [dspRaw, lcd, fxId, zd2, version] = FIRMWARE_DATA[index] ?? [null, '', null, null, null];
  return {
    index, name, category, model, description, tags, params, lcd, fxId, zd2, version,
    extra: !fxId,
    dsp: dspRaw === null ? null : dspRaw * DSP_SCALE,
    slug: slugify(name),
    image: `${PEDAL.base ?? ''}assets/effects/fx-${String(index).padStart(3, '0')}.png`,
    haystack: [name, lcd, category, model, description, ...params.map(p => p[0])].join(' ').toLowerCase()
  };
});

const lcdBadge = (effect, text = escapeHtml(effect.lcd)) => !effect.lcd || effect.lcd.replace(/\s/g, '').toLowerCase() === effect.name.replace(/\s/g, '').toLowerCase() ? '' : `<code class="fx-lcd" title="Name on the pedal display">${text}</code>`;
const dspLevel = dsp => dsp < 10 ? 'low' : dsp < 20 ? 'mid' : dsp < 40 ? 'high' : 'max';
const dspText = dsp => `${dsp.toFixed(1)}%`;
const EXTRA_LABEL = '<span class="Label" title="Additional effect downloaded with Handy Guitar Lab. Its ID is not known yet, so the Patch builder cannot use it.">Handy Guitar Lab add-on</span>';
const dspMeter = (dsp, wide = false) => dsp === null ? EXTRA_LABEL : `<span class="dsp${wide ? ' dsp--wide' : ''}" data-level="${dspLevel(dsp)}" title="Estimated DSP load: ${dspText(dsp)} of capacity"><span class="dsp-bar"><span style="width:${Math.min(dsp, 100)}%"></span></span><span class="dsp-val">${dspText(dsp)}</span></span>`;

const state = { query: '', category: null, features: new Set(), sort: 'zoom', view: 'list', visible: [] };
try { state.view = localStorage.getItem(`${PEDAL.id}-view`) === 'grid' ? 'grid' : 'list'; } catch {}

const $ = selector => document.querySelector(selector);
const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icon = (paths, size = 16) => `<svg viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true">${paths}</svg>`;
const ICON_X = '<path fill="currentColor" d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>';
const ICON_CHECK = '<path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>';
const ICON_SLIDERS = '<path fill="currentColor" d="M5.75 7.5a.75.75 0 0 1 .75.75v1.5h1a.75.75 0 0 1 0 1.5h-1v3a.75.75 0 0 1-1.5 0v-3h-1a.75.75 0 0 1 0-1.5h1v-1.5a.75.75 0 0 1 .75-.75Zm4.5-6a.75.75 0 0 1 .75.75v3h1a.75.75 0 0 1 0 1.5h-1v7.5a.75.75 0 0 1-1.5 0v-7.5h-1a.75.75 0 0 1 0-1.5h1v-3a.75.75 0 0 1 .75-.75Z"/>';
const ICON_SEARCH = '<path fill="currentColor" d="M10.68 11.74a6 6 0 0 1-7.92-8.98 6 6 0 0 1 8.98 7.92l3.04 3.04a.75.75 0 0 1-1.06 1.06ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/>';
const ICON_PLUS = '<path fill="currentColor" d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/>';
const ICON_LINK = '<path fill="currentColor" d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.75.75 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>';

function highlight(text) {
  const safe = escapeHtml(text);
  if (!state.query) return safe;
  const pattern = new RegExp(`(${escapeHtml(state.query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return safe.replace(pattern, '<mark>$1</mark>');
}
const categoryLabel = category => `<span class="Label Label--cat" style="--c:${CATEGORIES[category].color}">${CATEGORIES[category].label}</span>`;
const featureLabel = key => `<span class="Label" title="${FEATURES[key].hint}">${FEATURES[key].label}</span>`;

function matches(effect, { ignoreCategory = false } = {}) {
  if (!ignoreCategory && state.category && effect.category !== state.category) return false;
  for (const feature of state.features) if (!effect.tags.includes(feature)) return false;
  return !state.query || effect.haystack.includes(state.query);
}

function renderFilters() {
  const base = effects.filter(effect => matches(effect, { ignoreCategory: true }));
  const categories = [[null, 'All', null, base.length], ...Object.entries(CATEGORIES).map(([key, { label, color }]) => [key, label, color, base.filter(effect => effect.category === key).length])];
  $('#category-list').innerHTML = categories.map(([key, label, color, count]) => `<li><button class="filter-item" data-category="${key ?? ''}" aria-pressed="${state.category === key}" ${count || state.category === key ? '' : 'disabled'}>${color ? `<span class="dot" style="--c:${color}"></span>` : ''}<span class="name">${label}</span><span class="Counter">${count}</span></button></li>`).join('');
  const scoped = effects.filter(effect => (!state.category || effect.category === state.category) && (!state.query || effect.haystack.includes(state.query)));
  $('#feature-list').classList.add('feature-list');
  $('#feature-list').innerHTML = Object.entries(FEATURES).map(([key, { label, hint }]) => {
    const count = scoped.filter(effect => effect.tags.includes(key)).length;
    return `<li><button class="filter-item" data-feature="${key}" aria-pressed="${state.features.has(key)}" title="${hint}"><span class="check">${icon(ICON_CHECK, 12)}</span><span class="name">${label}</span><span class="Counter">${count}</span></button></li>`;
  }).join('');
}

function sorted(list) {
  if (state.sort === 'az') return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === 'params') return [...list].sort((a, b) => b.params.length - a.params.length || a.index - b.index);
  if (state.sort === 'dsp-asc') return [...list].sort((a, b) => (a.dsp ?? Infinity) - (b.dsp ?? Infinity) || a.index - b.index);
  if (state.sort === 'dsp-desc') return [...list].sort((a, b) => (b.dsp ?? -1) - (a.dsp ?? -1) || a.index - b.index);
  return list;
}

function renderList() {
  state.visible = sorted(effects.filter(effect => matches(effect)));
  const list = $('#fx-list');
  list.dataset.view = state.view;
  $('#result-count').textContent = `${state.visible.length} ${state.visible.length === 1 ? 'effect' : 'effects'}`;

  const chips = [];
  if (state.query) chips.push(`<button class="chip" data-clear="query">“${escapeHtml(state.query)}” ${icon(ICON_X, 12)}</button>`);
  if (state.category) chips.push(`<button class="chip" data-clear="category">${CATEGORIES[state.category].label} ${icon(ICON_X, 12)}</button>`);
  state.features.forEach(key => chips.push(`<button class="chip" data-clear="feature" data-key="${key}">${FEATURES[key].label} ${icon(ICON_X, 12)}</button>`));
  if (chips.length > 1) chips.push('<button class="clear-link" data-clear="all">Clear filters</button>');
  $('#active-filters').innerHTML = chips.join('');

  if (!state.visible.length) {
    list.innerHTML = `<li class="blankslate">${icon(ICON_SEARCH, 24)}<h3>No effects found</h3><p>Try another term or remove some filters.</p><button class="btn btn-sm" data-clear="all">Clear filters</button></li>`;
    return;
  }
  list.innerHTML = state.visible.map(effect => {
    const paramChips = effect.params.map(([name]) => `<span class="param-chip${state.query && name.toLowerCase().includes(state.query) ? ' hit' : ''}">${escapeHtml(name)}</span>`).join('');
    return `<li class="fx-row"><a class="fx-link" href="#${effect.slug}" data-slug="${effect.slug}" style="--cat:${CATEGORIES[effect.category].color}">
      <img class="fx-thumb" src="${effect.image}" alt="" loading="lazy" width="56" height="70" />
      <div class="fx-main">
        <div class="fx-title"><span class="fx-name">${highlight(effect.name)}</span>${lcdBadge(effect, highlight(effect.lcd))}${categoryLabel(effect.category)}</div>
        ${effect.model ? `<div class="fx-model">Model: <b>${highlight(effect.model)}</b></div>` : ''}
        <p class="fx-desc" lang="en">${highlight(effect.description)}</p>
        <div class="fx-params" aria-label="Parameters">${paramChips}</div>
      </div>
      <div class="fx-side">
        <span class="fx-num">#${String(effect.index + 1).padStart(2, '0')}</span>
        ${dspMeter(effect.dsp)}
        <span class="fx-pcount">${effect.params.length} parameters</span>
        <span class="fx-tags">${effect.tags.map(featureLabel).join('')}</span>
      </div>
    </a></li>`;
  }).join('');
  if (docked) markCurrent();
}

function render() { renderFilters(); renderList(); }

// Placement tips from the advice engine; shares the on/off setting with the Patch builder
const adviceEnabled = () => { try { return JSON.parse(localStorage.getItem(ADVICE_KEY) || '{}').enabled !== false; } catch { return true; } };
function setAdviceEnabled(enabled) {
  try {
    const settings = JSON.parse(localStorage.getItem(ADVICE_KEY) || '{}');
    localStorage.setItem(ADVICE_KEY, JSON.stringify({ ...settings, enabled }));
  } catch {}
}
function placementTips(effect) {
  if (!adviceEnabled()) return `<section class="detail-section"><p class="advice-off-note">Placement tips are off. <button class="clear-link" data-advice-on>Turn advice on</button></p></section>`;
  const tip = ADVICE.effectTips(effect.index);
  if (!tip) return '';
  return `<section class="detail-section">
      <h3>Placement &amp; tips <button class="clear-link" data-advice-off>Turn advice off</button></h3>
      <div class="tip-card">
        <span class="Label">${escapeHtml(tip.place)}</span>
        <p>${escapeHtml(tip.text)}</p>
        ${tip.sources.length ? `<details class="sources"><summary>Sources</summary>${tip.sources.map(src => `<a href="${src.url}" target="_blank" rel="noreferrer">${escapeHtml(src.title)}</a>`).join('')}</details>` : ''}
      </div>
    </section>`;
}

// Effect detail
const dialog = $('#fx-dialog');
// A docked detail (data-docked, on the full-screen pages) is a pane next to the list: it opens without a backdrop,
// stays open and shows the first effect when the address names none
const docked = dialog.hasAttribute('data-docked');
let current = null;

function openEffect(effect) {
  current = effect;
  const pos = state.visible.indexOf(effect);
  const pages = Math.ceil(effect.params.length / KNOBS);
  $('#dialog-pos').textContent = pos >= 0 ? `${pos + 1} of ${state.visible.length}` : `#${effect.index + 1}`;
  $('#dialog-prev').disabled = pos <= 0;
  $('#dialog-next').disabled = pos < 0 || pos >= state.visible.length - 1;
  $('#dialog-body').innerHTML = `
    <div class="detail-head">
      <img class="fx-thumb" src="${effect.image}" alt="${escapeHtml(effect.name)} icon on the pedal display" width="96" height="120" />
      <div>
        <h2 id="dialog-title">${escapeHtml(effect.name)}</h2>
        <div class="detail-meta">${lcdBadge(effect)}${categoryLabel(effect.category)}${effect.tags.map(featureLabel).join('')}</div>
        <p class="detail-desc" lang="en">${escapeHtml(effect.description)}</p>
        ${effect.model ? `<p class="detail-model">Reference model: <b>${escapeHtml(effect.model)}</b></p>` : ''}
      </div>
    </div>
    ${placementTips(effect)}
    ${effect.extra ? `<section class="detail-section">
      <h3>Handy Guitar Lab add-on</h3>
      <p>This effect is downloaded to the pedal with Handy Guitar Lab (★ in the Effects List). Its effect ID and DSP load are not known yet, so the Patch builder cannot add it.</p>
    </section>` : `<section class="detail-section">
      <h3>DSP load</h3>
      <div class="dsp-card">
        ${dspMeter(effect.dsp, true)}
        <details class="dsp-note">
          <summary>How this load is estimated</summary>
        <p>Uses about <b>${dspText(effect.dsp)}</b> of the processing capacity, leaving <b>${dspText(Math.max(0, 100 - effect.dsp))}</b> for the other ${SLOTS - 1} slots of the patch${effect.dsp > 100 / SLOTS ? '' : `; up to ${Math.min(SLOTS, Math.floor(100 / effect.dsp))} copies would fit`}. Above 100% the pedal shows <code>PROCESS OVERFLOW</code> and bypasses the effects.</p>
        <p class="dsp-source">Unofficial estimate: values read from the firmware files (<a href="${FW_SOURCE_URL}" target="_blank" rel="noreferrer">zoom-zt2</a>) and calibrated against the Handy Guitar Lab "Processor" meter (within ±1% on tested patches). The sum of a patch's effects matches that meter.${PEDAL.tested ? '' : ' The calibration comes from the MS-60B+ and has not been checked on this pedal yet.'}</p>
        </details>
      </div>
    </section>`}
    <section class="detail-section">
      <h3>${icon(ICON_SLIDERS)} Parameters <span class="Counter">${effect.params.length}</span></h3>
      <table class="ptable">
        <thead><tr><th class="pknob" title="Page · knob">Pos.</th><th>Parameter</th><th class="pdesc-col">Description</th><th>Range</th></tr></thead>
        <tbody>${effect.params.map(([name, desc, range], i) => `<tr>
          <td class="pknob">${pages > 1 ? `P${Math.floor(i / KNOBS) + 1}·` : ''}${(i % KNOBS) + 1}</td>
          <td class="pname">${escapeHtml(name)}<small lang="en">${escapeHtml(desc)}</small></td>
          <td class="pdesc" lang="en">${escapeHtml(desc)}</td>
          <td class="prange">${escapeHtml(range)}</td></tr>`).join('')}</tbody>
      </table>
      <p class="page-hint">${pages > 1 ? `On the pedal the parameters span ${pages} pages of ${KNOBS} knobs.` : `All parameters fit on the ${KNOBS} knobs of the first page.`}${effect.tags.includes('sync') ? ' The ♩ symbol means the value is synced to the tempo.' : ''}</p>
    </section>
    <div class="detail-foot">
      ${effect.extra ? '' : `<a class="btn btn-sm btn-primary" href="builder.html?add=${effect.slug}">${icon(ICON_PLUS)} Add to patch</a>`}
      <a class="btn btn-sm" href="${PDF_URL}" target="_blank" rel="noreferrer">${icon(ICON_LINK)} Effects List PDF</a>
      <a class="btn btn-sm" href="${MANUAL_URL}" target="_blank" rel="noreferrer">${icon(ICON_LINK)} Using it on the pedal</a>
    </div>`;
  $('#dialog-body').scrollTop = 0;
  if (!dialog.open) docked ? dialog.show() : dialog.showModal();
  if (location.hash !== `#${effect.slug}`) history.replaceState(null, '', `#${effect.slug}`);
  if (docked) markCurrent();
}

// Docked detail: the effect it shows is marked in the list
function markCurrent() {
  document.querySelectorAll('.fx-link').forEach(link => {
    const here = link.dataset.slug === current?.slug;
    link.toggleAttribute('aria-current', here);
    if (here) link.scrollIntoView({ block: 'nearest' });
  });
}

const closeEffect = () => { if (dialog.open && !docked) dialog.close(); };
dialog.addEventListener('close', () => {
  current = null;
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
});
dialog.addEventListener('click', event => {
  if (event.target === dialog && !docked) { closeEffect(); return; }
  if (event.target.closest('[data-advice-off]') && current) { setAdviceEnabled(false); openEffect(current); }
  if (event.target.closest('[data-advice-on]') && current) { setAdviceEnabled(true); openEffect(current); }
});
$('#dialog-close').addEventListener('click', closeEffect);
const step = delta => {
  const next = current && state.visible[state.visible.indexOf(current) + delta];
  if (next) openEffect(next);
};
$('#dialog-prev').addEventListener('click', () => step(-1));
$('#dialog-next').addEventListener('click', () => step(1));

// Filters and controls
const search = $('#search');
search.addEventListener('input', () => { state.query = search.value.trim().toLowerCase(); render(); });

document.addEventListener('click', event => {
  const link = event.target.closest('.fx-link');
  if (link) {
    event.preventDefault();
    openEffect(effects.find(effect => effect.slug === link.dataset.slug));
    return;
  }
  const category = event.target.closest('[data-category]');
  if (category) {
    state.category = category.dataset.category || null;
    render();
    return;
  }
  const feature = event.target.closest('[data-feature]');
  if (feature) {
    const key = feature.dataset.feature;
    if (state.features.has(key)) state.features.delete(key); else state.features.add(key);
    render();
    return;
  }
  const clear = event.target.closest('[data-clear]');
  if (clear) {
    const what = clear.dataset.clear;
    if (what === 'query' || what === 'all') { state.query = ''; search.value = ''; }
    if (what === 'category' || what === 'all') state.category = null;
    if (what === 'feature') state.features.delete(clear.dataset.key);
    if (what === 'all') state.features.clear();
    render();
  }
});

$('#sort').addEventListener('change', event => { state.sort = event.target.value; renderList(); });
function syncViewButtons() {
  document.querySelectorAll('button[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === state.view)));
}
document.querySelectorAll('button[data-view]').forEach(button => button.addEventListener('click', () => {
  state.view = button.dataset.view;
  try { localStorage.setItem(`${PEDAL.id}-view`, state.view); } catch {}
  syncViewButtons();
  renderList();
}));

document.addEventListener('keydown', event => {
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  // A docked detail leaves the arrows to the field being typed in, and the search keys keep working
  if (dialog.open && !(docked && typing)) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (!docked) return;
  }
  if (event.key === '/' && !typing) { event.preventDefault(); search.focus(); search.select(); }
  if (event.key === 'Escape' && document.activeElement === search && search.value) { search.value = ''; state.query = ''; render(); }
});

function openFromHash() {
  const slug = decodeURIComponent(location.hash.slice(1));
  const effect = effects.find(item => item.slug === slug);
  if (effect) openEffect(effect);
  else if (docked && state.visible.length) openEffect(state.visible[0]);
  else closeEffect();
}
window.addEventListener('hashchange', openFromHash);

syncViewButtons();
render();
openFromHash();
