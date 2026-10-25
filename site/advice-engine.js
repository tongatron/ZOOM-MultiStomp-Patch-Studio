// Advice engine: runs rules against a patch and returns findings.
// Rules and style profiles are registered from advice-rules.js (ADVICE.addRules / ADVICE.addStyles),
// so new advice can be added without touching the engine or the UI.
// Requires EFFECTS_DATA, FIRMWARE_DATA and DSP_SCALE.
//
// Patch shape (same as the builder): { name, effects: [{ index, on, values: { PARAM: value } }] }
// Rule shape:
//   { id, severity: 'error' | 'warning' | 'tip', topic, title, why, sources: [sourceKey],
//     styles?: [styleId]            — only active for these styles
//     check(ctx) → [{ slots: [i], message, fix?: { label, apply(patch) → patch } }] }

const ADVICE = (() => {
  const SEVERITIES = ['error', 'warning', 'tip'];
  const rules = [];
  const styles = [];
  const sources = {};
  const preferences = [];

  // ---- effect roles -------------------------------------------------------------------------------
  const ROLE_BY_NAME = {
    'ZOOM NOISE REDUCTION': 'gate', 'SLOW ATTACK': 'swell',
    'BASS AUTO WAH': 'envfilter', 'ENVELOPE FILTER': 'envfilter', 'AUTO FILTER': 'envfilter', 'Z TRON FILTER': 'envfilter', 'BASS CRY FILTER': 'envfilter',
    'ENVELOPE GENERATOR FILTER': 'filter', 'SEQUENCE FILTER': 'filter',
    'BASS GRAPHIC EQ': 'eq', 'STEREO BASS GRAPHIC EQ': 'eq', 'BASS PARAMETRIC EQ': 'eq', 'LOW EQ': 'eq', 'HIGH EQ': 'eq', 'SPLITTER': 'eq', 'EXCITER': 'eq',
    'BASS OCTAVER': 'octave', 'BASS ANALOG OCTAVER': 'octave', 'POLYPHONIC OCTAVER': 'octave',
    'BASS MONO PITCH SHIFTER': 'pitch', 'HARMONY PITCH SHIFTER': 'pitch', 'POLYPHONIC PITCH SHIFTER': 'pitch',
    'LINE SELECTOR': 'linesel', 'LOOP ROLL': 'sfx', 'BOMBER': 'sfx', 'FRETLESS SIMULATOR': 'fretless', 'PHASER+DISTORTION': 'drive'
  };
  const ROLE_BY_CATEGORY = { DYNAMICS: 'comp', DRIVE: 'drive', PREAMP: 'preamp', 'BASS AMP': 'amp', MODULATION: 'mod', SYNTH: 'synth', DELAY: 'delay', REVERB: 'reverb' };
  const GROUPS = {
    gain: ['drive', 'preamp', 'amp'],
    time: ['delay', 'reverb'],
    tracking: ['octave', 'synth', 'pitch']
  };

  const effects = EFFECTS_DATA.map(([name, category, model, , tags, params], index) => ({
    index, name, category, model, tags,
    role: ROLE_BY_NAME[name] || ROLE_BY_CATEGORY[category] || 'other',
    params: params.map(([pname, , range]) => ({ name: pname, range })),
    lcd: FIRMWARE_DATA[index][1],
    dsp: +(FIRMWARE_DATA[index][0] * DSP_SCALE).toFixed(2)
  }));
  const byName = new Map(effects.map(e => [e.name, e]));
  const inGroup = (role, group) => (GROUPS[group] || [group]).includes(role);

  // ---- analysis context -----------------------------------------------------------------------------
  function context(patch, style) {
    const slots = (patch.effects || []).map((e, i) => {
      const fx = effects[e.index];
      return {
        i, fx, on: e.on !== false, role: fx.role,
        has: name => fx.params.some(p => p.name === name),
        v: name => e.values?.[name],
        num: name => { const n = Number(e.values?.[name]); return Number.isFinite(n) ? n : null; },
        label: `${i + 1}. ${fx.name}`
      };
    });
    const active = slots.filter(s => s.on);
    const of = group => active.filter(s => inGroup(s.role, group));
    return {
      patch, style, slots, active, of,
      first: group => of(group)[0] ?? null,
      last: group => of(group).at(-1) ?? null,
      dsp: slots.reduce((sum, s) => sum + s.fx.dsp, 0)
    };
  }

  // ---- patch edits used by fixes ------------------------------------------------------------------------
  const clone = patch => ({ ...patch, effects: patch.effects.map(e => ({ ...e, values: { ...e.values } })) });
  // Moves the effect at `from` so it lands right before the effect currently at `to`.
  function move(patch, from, to) {
    const next = clone(patch);
    const [item] = next.effects.splice(from, 1);
    next.effects.splice(from < to ? to - 1 : to, 0, item);
    return next;
  }
  const moveBefore = (patch, from, target) => move(patch, from, target);
  const moveAfter = (patch, from, target) => move(patch, from, target + 1);
  function setValue(patch, slot, name, value) {
    const next = clone(patch);
    next.effects[slot].values[name] = value;
    return next;
  }

  // ---- public API -------------------------------------------------------------------------------------
  function analyze(patch, options = {}) {
    const style = styles.find(s => s.id === options.style) || null;
    const ignored = new Set(options.ignored || []);
    // Personal preferences silence the rules they list (see addPreferences)
    preferences.filter(p => (options.preferences || []).includes(p.id)).forEach(p => p.silences.forEach(id => ignored.add(id)));
    const ctx = context(patch, style);
    if (!ctx.slots.length) return [];
    const findings = [];
    for (const rule of rules) {
      if (ignored.has(rule.id)) continue;
      if (rule.styles && !(style && rule.styles.includes(style.id))) continue;
      let results;
      try { results = rule.check(ctx) || []; } catch (error) { console.error(`Advice rule ${rule.id} failed`, error); continue; }
      const severity = style?.severity?.[rule.id] || rule.severity;
      results.forEach(result => findings.push({
        ruleId: rule.id, severity, topic: rule.topic, title: rule.title, why: rule.why,
        sources: (rule.sources || []).map(key => sources[key]).filter(Boolean),
        slots: result.slots || [], message: result.message, fix: result.fix || null
      }));
    }
    return findings.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity));
  }

  function addRules(list) {
    list.forEach(rule => {
      if (!rule.id || typeof rule.check !== 'function' || !SEVERITIES.includes(rule.severity)) throw new Error(`Invalid advice rule ${rule.id}`);
      if (rules.some(r => r.id === rule.id)) throw new Error(`Duplicate advice rule ${rule.id}`);
      rules.push(rule);
    });
  }
  const addStyles = list => { styles.push(...list); };
  // Preference shape: { id, label, hint, silences: [ruleId] } — a pinned choice that hides the matching rules.
  const addPreferences = list => {
    list.forEach(pref => {
      pref.silences.forEach(id => { if (!rules.some(r => r.id === id)) throw new Error(`Preference ${pref.id}: unknown rule ${id}`); });
      preferences.push(pref);
    });
  };
  const addSources = map => { Object.assign(sources, map); };

  // Placement guidance for one effect, used by the catalog.
  const roleTips = {};
  const addRoleTips = map => { Object.assign(roleTips, map); };
  function effectTips(index) {
    const tip = roleTips[effects[index].role];
    return tip ? { ...tip, sources: (tip.sources || []).map(key => sources[key]).filter(Boolean) } : null;
  }

  return {
    SEVERITIES, rules, styles, sources, preferences, effects, byName, GROUPS, inGroup,
    analyze, addRules, addStyles, addPreferences, addSources, addRoleTips, effectTips,
    edit: { clone, move, moveBefore, moveAfter, setValue }
  };
})();
