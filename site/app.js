const CATEGORIES = {
  DYNAMICS: { label: 'Dynamics', color: '#3fb950' },
  FILTER: { label: 'Filter', color: '#39c5cf' },
  DRIVE: { label: 'Drive', color: '#f0883e' },
  PREAMP: { label: 'Preamp', color: '#db61a2' },
  MODULATION: { label: 'Modulation', color: '#a371f7' },
  'PITCH SHIFT': { label: 'Pitch Shift', color: '#d29922' },
  SYNTH: { label: 'Synth', color: '#ff7b72' },
  DELAY: { label: 'Delay', color: '#58a6ff' },
  REVERB: { label: 'Reverb', color: '#7ee2b8' },
  SFX: { label: 'SFX', color: '#8b949e' },
  'BASS AMP': { label: 'Bass Amp', color: '#e3b341' }
};
const FEATURES = {
  fs: { label: 'Footswitch', hint: 'Controllo dal footswitch' },
  sync: { label: 'Tempo sync', hint: 'Sincronizzabile al tempo' },
  st: { label: 'Stereo', hint: 'Uscita stereo' },
  dry: { label: 'Mix dry/wet', hint: 'Segnale pulito miscelabile' }
};
const PDF_URL = 'https://zoomcorp.com/media/documents/E_MS-60Bplus_FX-list.pdf';
const MANUAL_URL = 'https://zoomcorp.com/manuals/ms-60bplus-it/#unique_41';
const KNOBS = 4;

const slugify = text => text.toLowerCase().replace(/\+/g, '-plus-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const effects = EFFECTS_DATA.map(([name, category, model, description, tags, params], index) => ({
  index, name, category, model, description, tags, params,
  slug: slugify(name),
  image: `assets/effects/fx-${String(index).padStart(3, '0')}.png`,
  haystack: [name, category, model, description, ...params.map(p => p[0])].join(' ').toLowerCase()
}));

const state = { query: '', category: null, features: new Set(), sort: 'zoom', view: 'list', visible: [] };
try { state.view = localStorage.getItem('ms60b-view') === 'grid' ? 'grid' : 'list'; } catch {}

const $ = selector => document.querySelector(selector);
const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icon = (paths, size = 16) => `<svg viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true">${paths}</svg>`;
const ICON_X = '<path fill="currentColor" d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>';
const ICON_CHECK = '<path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>';
const ICON_SLIDERS = '<path fill="currentColor" d="M5.75 7.5a.75.75 0 0 1 .75.75v1.5h1a.75.75 0 0 1 0 1.5h-1v3a.75.75 0 0 1-1.5 0v-3h-1a.75.75 0 0 1 0-1.5h1v-1.5a.75.75 0 0 1 .75-.75Zm4.5-6a.75.75 0 0 1 .75.75v3h1a.75.75 0 0 1 0 1.5h-1v7.5a.75.75 0 0 1-1.5 0v-7.5h-1a.75.75 0 0 1 0-1.5h1v-3a.75.75 0 0 1 .75-.75Z"/>';
const ICON_SEARCH = '<path fill="currentColor" d="M10.68 11.74a6 6 0 0 1-7.92-8.98 6 6 0 0 1 8.98 7.92l3.04 3.04a.75.75 0 0 1-1.06 1.06ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z"/>';
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

function renderStats() {
  const params = effects.reduce((sum, effect) => sum + effect.params.length, 0);
  const models = effects.filter(effect => effect.model && !effect.model.startsWith('Originale')).length;
  $('#repo-stats').innerHTML = [
    [effects.length, 'effetti'], [Object.keys(CATEGORIES).length, 'categorie'], [params, 'parametri documentati'], [models, 'ispirati a hardware reale']
  ].map(([n, label]) => `<li><strong>${n}</strong> ${label}</li>`).join('');
  const bar = document.createElement('div');
  bar.className = 'lang-bar';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = Object.entries(CATEGORIES).map(([key, { label, color }]) => {
    const count = effects.filter(effect => effect.category === key).length;
    return `<span style="--c:${color};flex:${count}" title="${label}: ${count}"></span>`;
  }).join('');
  $('#repo-stats').after(bar);
}

function renderFilters() {
  const base = effects.filter(effect => matches(effect, { ignoreCategory: true }));
  const categories = [[null, 'Tutte', null, base.length], ...Object.entries(CATEGORIES).map(([key, { label, color }]) => [key, label, color, base.filter(effect => effect.category === key).length])];
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
  return list;
}

function renderList() {
  state.visible = sorted(effects.filter(effect => matches(effect)));
  const list = $('#fx-list');
  list.dataset.view = state.view;
  $('#result-count').textContent = `${state.visible.length} ${state.visible.length === 1 ? 'effetto' : 'effetti'}`;

  const chips = [];
  if (state.query) chips.push(`<button class="chip" data-clear="query">“${escapeHtml(state.query)}” ${icon(ICON_X, 12)}</button>`);
  if (state.category) chips.push(`<button class="chip" data-clear="category">${CATEGORIES[state.category].label} ${icon(ICON_X, 12)}</button>`);
  state.features.forEach(key => chips.push(`<button class="chip" data-clear="feature" data-key="${key}">${FEATURES[key].label} ${icon(ICON_X, 12)}</button>`));
  if (chips.length > 1) chips.push('<button class="clear-link" data-clear="all">Azzera filtri</button>');
  $('#active-filters').innerHTML = chips.join('');

  if (!state.visible.length) {
    list.innerHTML = `<li class="blankslate">${icon(ICON_SEARCH, 24)}<h3>Nessun effetto trovato</h3><p>Prova un altro termine o rimuovi qualche filtro.</p><button class="btn btn-sm" data-clear="all">Azzera filtri</button></li>`;
    return;
  }
  list.innerHTML = state.visible.map(effect => {
    const paramChips = effect.params.map(([name]) => `<span class="param-chip${state.query && name.toLowerCase().includes(state.query) ? ' hit' : ''}">${escapeHtml(name)}</span>`).join('');
    return `<li class="fx-row"><a class="fx-link" href="#${effect.slug}" data-slug="${effect.slug}">
      <img class="fx-thumb" src="${effect.image}" alt="" loading="lazy" width="56" height="70" />
      <div class="fx-main">
        <div class="fx-title"><span class="fx-name">${highlight(effect.name)}</span>${categoryLabel(effect.category)}</div>
        ${effect.model ? `<div class="fx-model">Modello: <b>${highlight(effect.model)}</b></div>` : ''}
        <p class="fx-desc">${highlight(effect.description)}</p>
        <div class="fx-params" aria-label="Parametri">${paramChips}</div>
      </div>
      <div class="fx-side">
        <span class="fx-num">#${String(effect.index + 1).padStart(2, '0')}</span>
        <span>${effect.params.length} parametri</span>
        <span class="fx-tags">${effect.tags.map(featureLabel).join('')}</span>
      </div>
    </a></li>`;
  }).join('');
}

function render() { renderFilters(); renderList(); }

// Dettaglio effetto
const dialog = $('#fx-dialog');
let current = null;

function openEffect(effect) {
  current = effect;
  const pos = state.visible.indexOf(effect);
  const pages = Math.ceil(effect.params.length / KNOBS);
  $('#dialog-pos').textContent = pos >= 0 ? `${pos + 1} di ${state.visible.length}` : `#${effect.index + 1}`;
  $('#dialog-prev').disabled = pos <= 0;
  $('#dialog-next').disabled = pos < 0 || pos >= state.visible.length - 1;
  $('#dialog-body').innerHTML = `
    <div class="detail-head">
      <img class="fx-thumb" src="${effect.image}" alt="Icona di ${escapeHtml(effect.name)} sul display del pedale" width="96" height="120" />
      <div>
        <h2 id="dialog-title">${escapeHtml(effect.name)}</h2>
        <div class="detail-meta">${categoryLabel(effect.category)}${effect.tags.map(featureLabel).join('')}</div>
        <p class="detail-desc">${escapeHtml(effect.description)}</p>
        ${effect.model ? `<p class="detail-model">Modello di riferimento: <b>${escapeHtml(effect.model)}</b></p>` : ''}
      </div>
    </div>
    <section class="detail-section">
      <h3>${icon(ICON_SLIDERS)} Parametri <span class="Counter">${effect.params.length}</span></h3>
      <table class="ptable">
        <thead><tr><th class="pknob" title="Pagina · manopola">Pos.</th><th>Parametro</th><th class="pdesc-col">Descrizione</th><th>Range</th></tr></thead>
        <tbody>${effect.params.map(([name, desc, range], i) => `<tr>
          <td class="pknob">${pages > 1 ? `P${Math.floor(i / KNOBS) + 1}·` : ''}${(i % KNOBS) + 1}</td>
          <td class="pname">${escapeHtml(name)}<small>${escapeHtml(desc)}</small></td>
          <td class="pdesc">${escapeHtml(desc)}</td>
          <td class="prange">${escapeHtml(range)}</td></tr>`).join('')}</tbody>
      </table>
      <p class="page-hint">${pages > 1 ? `Sul pedale i parametri sono distribuiti su ${pages} pagine da ${KNOBS} manopole.` : `Tutti i parametri stanno sulle ${KNOBS} manopole della prima pagina.`}${effect.tags.includes('sync') ? ' Il simbolo ♩ indica la sincronizzazione al tempo.' : ''}</p>
    </section>
    <div class="detail-foot">
      <a class="btn btn-sm" href="${PDF_URL}" target="_blank" rel="noreferrer">${icon(ICON_LINK)} Effects List PDF</a>
      <a class="btn btn-sm" href="${MANUAL_URL}" target="_blank" rel="noreferrer">${icon(ICON_LINK)} Come si usa sul pedale</a>
    </div>`;
  $('#dialog-body').scrollTop = 0;
  if (!dialog.open) dialog.showModal();
  if (location.hash !== `#${effect.slug}`) history.replaceState(null, '', `#${effect.slug}`);
}

const closeEffect = () => { if (dialog.open) dialog.close(); };
dialog.addEventListener('close', () => {
  current = null;
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
});
dialog.addEventListener('click', event => { if (event.target === dialog) closeEffect(); });
$('#dialog-close').addEventListener('click', closeEffect);
const step = delta => {
  const next = current && state.visible[state.visible.indexOf(current) + delta];
  if (next) openEffect(next);
};
$('#dialog-prev').addEventListener('click', () => step(-1));
$('#dialog-next').addEventListener('click', () => step(1));

// Filtri e controlli
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
  try { localStorage.setItem('ms60b-view', state.view); } catch {}
  syncViewButtons();
  renderList();
}));

document.addEventListener('keydown', event => {
  if (dialog.open) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    return;
  }
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if (event.key === '/' && !typing) { event.preventDefault(); search.focus(); search.select(); }
  if (event.key === 'Escape' && document.activeElement === search && search.value) { search.value = ''; state.query = ''; render(); }
});

function openFromHash() {
  const slug = decodeURIComponent(location.hash.slice(1));
  const effect = effects.find(item => item.slug === slug);
  if (effect) openEffect(effect); else closeEffect();
}
window.addEventListener('hashchange', openFromHash);

renderStats();
syncViewButtons();
render();
openFromHash();
