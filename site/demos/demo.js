// Shared renderer for the UI demos: the same real data and DOM, restyled by one CSS file per theme.
// Uses EFFECTS_DATA, CATEGORIES (effects-data.js), FIRMWARE_DATA and DSP_SCALE (firmware-data.js).

const FX = EFFECTS_DATA.map(([name, category, model, desc, tags, params], index) => ({
  index, name, category, model, desc, tags, params,
  lcd: FIRMWARE_DATA[index][1],
  dsp: +(FIRMWARE_DATA[index][0] * DSP_SCALE).toFixed(1),
  img: `../assets/effects/fx-${String(index).padStart(3, '0')}.png`
}));
const byName = name => FX.find(fx => fx.name === name);
const esc = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pad = n => String(n + 1).padStart(2, '0');

const SAMPLE_CHAIN = ['DYNAMIC COMPRESSOR', 'DARK OVERDRIVE', 'FLIPTOP', 'ANALOG DELAY', 'HALL REVERB'].map(name => ({ fx: byName(name), on: true }));
const ADVICE = [
  { sev: 'warning', title: 'Drive with no clean signal', text: 'DARK OVERDRIVE: BLEND is at 100. Mix some clean signal back in to keep the low end.' },
  { sev: 'tip', title: 'Reverb after delay', text: 'This order is the usual one: delay first, reverb last.' },
  { sev: 'tip', title: 'Set CABINET for where you plug in', text: 'FLIPTOP: keep CABINET high for PA or headphones, low for a real bass amp.' }
];

const state = { query: '', category: null, view: location.hash === '#builder' ? 'builder' : 'library' };

function shell() {
  const theme = document.body.dataset.theme;
  document.getElementById('app').innerHTML = `
    <header class="top">
      <a class="brand" href="./"><span class="mark">MS</span><span class="brand-name">MS-60B+</span></a>
      <nav class="tabs" aria-label="Sections">
        <button data-view="library">Effects <span class="count">${FX.length}</span></button>
        <button data-view="builder">Patch builder</button>
      </nav>
      <a class="back" href="./">All demos</a>
    </header>
    <main>
      <section id="view-library">
        <div class="intro">
          <h1>Effects library</h1>
          <p>Every effect on the pedal with the original descriptions, parameters and estimated DSP load.</p>
        </div>
        <div class="tools">
          <input id="q" type="search" placeholder="Search effect, model or parameter" autocomplete="off" spellcheck="false" aria-label="Search" />
          <div class="chips" id="chips" role="group" aria-label="Categories"></div>
        </div>
        <div class="result-line" id="result-line"></div>
        <ul class="grid" id="grid"></ul>
      </section>
      <section id="view-builder" hidden>
        <div class="intro">
          <h1>Patch builder</h1>
          <p>Compose a chain of up to 6 effects and download it as a <code>.zptc</code> file for Handy Guitar Lab.</p>
        </div>
        <div class="builder">
          <div class="chain-col">
            <label class="name-field">Patch name <input id="patch-name" value="FUNK DRIVE" maxlength="28" /></label>
            <ol class="chain" id="chain"></ol>
            <button class="add" id="add">+ Add effect</button>
          </div>
          <aside class="side">
            <div class="panel dsp" id="dsp"></div>
            <div class="panel"><div class="panel-title">Advice <span class="count">${ADVICE.length}</span></div><ul class="advice" id="advice"></ul></div>
            <button class="download">Download .zptc</button>
          </aside>
        </div>
      </section>
    </main>
    <dialog id="detail"></dialog>`;
  document.documentElement.dataset.theme = theme;
}

function renderChips() {
  const all = `<button data-cat="" aria-pressed="${!state.category}">All <span class="count">${FX.length}</span></button>`;
  document.getElementById('chips').innerHTML = all + Object.entries(CATEGORIES).map(([key, { label, color }]) =>
    `<button data-cat="${key}" style="--c:${color}" aria-pressed="${state.category === key}"><i class="dot"></i>${label} <span class="count">${FX.filter(f => f.category === key).length}</span></button>`).join('');
}

function renderGrid() {
  const q = state.query.trim().toLowerCase();
  const list = FX.filter(fx => (!state.category || fx.category === state.category) &&
    (!q || [fx.name, fx.model || '', fx.lcd, fx.desc, ...fx.params.map(p => p[0])].join(' ').toLowerCase().includes(q)));
  document.getElementById('result-line').textContent = `${list.length} effect${list.length === 1 ? '' : 's'}`;
  document.getElementById('grid').innerHTML = list.map(fx => {
    const cat = CATEGORIES[fx.category];
    return `<li><a class="card" href="#fx-${fx.index}" data-i="${fx.index}" style="--c:${cat.color}">
      <span class="art"><img src="${fx.img}" alt="" loading="lazy" /></span>
      <span class="meta">
        <span class="num">${pad(fx.index)}</span>
        <span class="title">${esc(fx.name)}</span>
        <span class="cat"><i class="dot"></i>${cat.label}</span>
        <span class="load"><span class="bar"><b style="width:${Math.min(100, fx.dsp * 1.9)}%"></b></span><span class="pct">${fx.dsp.toFixed(1)}%</span></span>
      </span></a></li>`;
  }).join('') || '<li class="empty">No effects found.</li>';
}

function openDetail(i) {
  const fx = FX[i], cat = CATEGORIES[fx.category];
  const dlg = document.getElementById('detail');
  dlg.innerHTML = `<form method="dialog" class="detail" style="--c:${cat.color}">
    <button class="close" aria-label="Close">×</button>
    <div class="detail-head"><img src="${fx.img}" alt="" /><div>
      <div class="cat"><i class="dot"></i>${cat.label} · #${pad(fx.index)} · shows as <b>${esc(fx.lcd)}</b></div>
      <h2>${esc(fx.name)}</h2>${fx.model ? `<p class="model">Model: ${esc(fx.model)}</p>` : ''}
      <p>${esc(fx.desc)}</p>
      <div class="load"><span class="bar"><b style="width:${Math.min(100, fx.dsp * 1.9)}%"></b></span><span class="pct">${fx.dsp.toFixed(1)}% DSP</span></div>
    </div></div>
    <table class="params"><thead><tr><th>Parameter</th><th>Range</th><th>Description</th></tr></thead><tbody>
      ${fx.params.map(([n, d, r]) => `<tr><td class="pn">${esc(n)}</td><td class="pr">${esc(r)}</td><td>${esc(d)}</td></tr>`).join('')}
    </tbody></table></form>`;
  dlg.showModal();
}

function paramRow([name, , range], seed) {
  const m = String(range).match(/^(-?\d+(?:\.\d+)?) – (-?\d+(?:\.\d+)?)$/);
  if (!m) return `<div class="param"><span class="pn">${esc(name)}</span><span class="pill">${esc(String(range).split(',')[0])}</span></div>`;
  const min = +m[1], max = +m[2], value = Math.round(min + (max - min) * (((seed * 37) % 80) + 10) / 100);
  return `<label class="param"><span class="pn">${esc(name)}</span><input type="range" min="${min}" max="${max}" value="${value}" step="${max - min <= 30 ? 0.5 : 1}" /><output>${value}</output></label>`;
}

function renderBuilder() {
  document.getElementById('chain').innerHTML = SAMPLE_CHAIN.map((item, i) => {
    const cat = CATEGORIES[item.fx.category];
    return `<li class="node${item.on ? '' : ' is-off'}" style="--c:${cat.color}" data-i="${i}">
      <div class="node-head">
        <span class="pos">${i + 1}</span>
        <img src="${item.fx.img}" alt="" />
        <div class="node-title"><strong>${esc(item.fx.name)}</strong><span class="cat"><i class="dot"></i>${cat.label}</span></div>
        <span class="pct">${item.fx.dsp.toFixed(1)}%</span>
        <label class="switch"><input type="checkbox" data-toggle="${i}" ${item.on ? 'checked' : ''} aria-label="On/off" /><span></span></label>
      </div>
      <div class="params-grid">${item.fx.params.slice(0, 4).map((p, k) => paramRow(p, i * 7 + k)).join('')}</div>
    </li>`;
  }).join('');
  document.getElementById('advice').innerHTML = ADVICE.map(a => `<li class="sev-${a.sev}"><b>${a.title}</b><span>${a.text}</span></li>`).join('');
  renderDsp();
}

function renderDsp() {
  const total = SAMPLE_CHAIN.filter(i => i.on).reduce((s, i) => s + i.fx.dsp, 0);
  document.getElementById('dsp').innerHTML = `<div class="panel-title">Processor load</div>
    <div class="dsp-num">${total.toFixed(0)}<small>%</small></div>
    <div class="bar big"><b style="width:${Math.min(100, total)}%"></b></div>
    <div class="dsp-note">${SAMPLE_CHAIN.filter(i => i.on).length} of 6 effects · limit 100%</div>`;
}

function setView(view) {
  state.view = view;
  document.getElementById('view-library').hidden = view !== 'library';
  document.getElementById('view-builder').hidden = view !== 'builder';
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-current', String(b.dataset.view === view)));
  history.replaceState(null, '', view === 'builder' ? '#builder' : location.pathname);
}

shell();
renderChips(); renderGrid(); renderBuilder(); setView(state.view);
document.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (b) setView(b.dataset.view); });
document.getElementById('q').addEventListener('input', e => { state.query = e.target.value; renderGrid(); });
document.getElementById('chips').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; state.category = b.dataset.cat || null; renderChips(); renderGrid(); });
document.getElementById('grid').addEventListener('click', e => { const a = e.target.closest('.card'); if (!a) return; e.preventDefault(); openDetail(+a.dataset.i); });
document.getElementById('chain').addEventListener('change', e => {
  if (e.target.dataset.toggle !== undefined) { SAMPLE_CHAIN[+e.target.dataset.toggle].on = e.target.checked; e.target.closest('.node').classList.toggle('is-off', !e.target.checked); renderDsp(); }
});
document.getElementById('chain').addEventListener('input', e => { if (e.target.type === 'range') e.target.nextElementSibling.textContent = e.target.value; });
document.getElementById('detail').addEventListener('click', e => { if (e.target.id === 'detail') e.target.close(); });
