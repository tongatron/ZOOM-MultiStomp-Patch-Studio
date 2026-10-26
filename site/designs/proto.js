// Shared model for the three design prototypes in site/designs/ (repo, punk, stage).
// They use the real effects data, DSP values and advice engine, and share one chain in localStorage,
// so the same patch can be compared across designs (the compare page reloads the others on every change).
// Requires EFFECTS_DATA, CATEGORIES, ZPTC, ADVICE and PATCHLINK.

const PROTO = (() => {
  const KEY = 'ms60b-design-lab';
  const MAX = ZPTC.MAX_EFFECTS;
  const effects = ADVICE.effects;
  const thumb = index => `../assets/effects/fx-${String(index).padStart(3, '0')}.png`;
  const desc = index => EFFECTS_DATA[index][3];
  const color = index => CATEGORIES[effects[index].category].color;
  const categoryLabel = index => CATEGORIES[effects[index].category].label;

  const fromStyle = id => {
    const style = ADVICE.styles.find(s => s.id === id && s.starter);
    return { name: style.starter.name, style: style.id, chain: style.starter.effects.map(e => ({ index: ADVICE.byName.get(e.effect).index, on: true, values: { ...e.values } })) };
  };
  const read = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && Array.isArray(s.chain) ? s : null; } catch { return null; } };
  let state = read() || fromStyle('grunge');

  const listeners = [];
  const emit = () => listeners.forEach(fn => fn(state));
  const commit = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked: the change stays on this page */ } emit(); };
  window.addEventListener('storage', event => { if (event.key === KEY) { state = read() || state; emit(); } });

  // Parameter controls a prototype can show: a numeric range or a list of options; anything else is left as it is
  function control(p) {
    const num = p.range.match(/^(-?\d+(?:\.\d+)?) – (-?\d+(?:\.\d+)?)$/);
    if (num) return { type: 'range', min: Number(num[1]), max: Number(num[2]), step: num[1].includes('.') ? 0.5 : 1 };
    if (!p.range.includes('–') && p.range.includes(',')) return { type: 'options', options: p.range.split(',').map(o => o.trim()) };
    return null;
  }
  const defaults = index => Object.fromEntries(effects[index].params.map(p => {
    const c = control(p);
    return [p.name, c?.type === 'range' ? Math.round((c.min + c.max) / 2 / c.step) * c.step : c?.type === 'options' ? c.options[0] : 0];
  }));

  const actions = {
    add(index) { if (state.chain.length >= MAX) return false; state.chain.push({ index, on: true, values: defaults(index) }); commit(); return true; },
    remove(i) { state.chain.splice(i, 1); commit(); },
    move(i, delta) { const j = i + delta; if (j < 0 || j >= state.chain.length) return; [state.chain[i], state.chain[j]] = [state.chain[j], state.chain[i]]; commit(); },
    toggle(i) { state.chain[i].on = !state.chain[i].on; commit(); },
    set(i, name, value) { state.chain[i].values[name] = value; commit(); },
    rename(name) { state.name = name.toUpperCase().replace(/[^!%&'+,\-.=_ A-Z0-9]/g, '').slice(0, 10); commit(); },
    style(id) { state.style = id; commit(); },
    loadStyle(id) { state = fromStyle(id); commit(); },
    applyFix(finding) { const next = finding.fix.apply({ name: state.name, effects: state.chain }); state.chain = next.effects; commit(); }
  };

  const dsp = () => state.chain.reduce((sum, e) => sum + effects[e.index].dsp, 0);
  const advice = () => ADVICE.analyze({ name: state.name, effects: state.chain }, { style: state.style });
  const builderLink = () => `../${PATCHLINK.url({ name: state.name, effects: state.chain }, state.style)}`;
  const search = query => {
    const q = query.trim().toLowerCase();
    return effects.filter(fx => !q || `${fx.name} ${fx.category} ${fx.model || ''} ${fx.role}`.toLowerCase().includes(q));
  };
  const styles = () => ADVICE.styles.filter(s => s.starter);
  const escapeHtml = text => String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  return {
    MAX, effects, thumb, desc, color, categoryLabel, control, actions, dsp, advice, builderLink, search, styles, escapeHtml,
    get state() { return state; },
    onChange(fn) { listeners.push(fn); fn(state); }
  };
})();
