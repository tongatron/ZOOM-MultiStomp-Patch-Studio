// Advice engine: runs rules against a patch and returns findings.
// Rules are registered from each pedal's advice-rules.js (ADVICE.addRules), and the styles for Tone ideas with ADVICE.addStyles,
// so new advice can be added without touching the engine or the UI. The rules every pedal shares (ADVICE.sharedRules) and
// the helpers for order rules (ADVICE.kit) live here.
// Requires EFFECTS_DATA, FIRMWARE_DATA and DSP_SCALE.
//
// Patch shape (same as the builder): { name, effects: [{ index, on, values: { PARAM: value } }] }
// Rule shape:
//   { id, severity: 'error' | 'warning' | 'tip', topic, title, why, sources: [sourceKey],
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

  // Roles set by a pedal's advice-rules.js (addRoles): its names beat the names above, its categories beat the categories above.
  const pedalRoles = { names: {}, categories: {} };
  const roleOf = (name, category) => pedalRoles.names[name] || ROLE_BY_NAME[name] || pedalRoles.categories[category] || ROLE_BY_CATEGORY[category] || 'other';

  const effects = EFFECTS_DATA.map(([name, category, model, , tags, params], index) => ({
    index, name, category, model, tags,
    role: roleOf(name, category),
    params: params.map(([pname, , range]) => ({ name: pname, range })),
    lcd: FIRMWARE_DATA[index]?.[1] ?? '',
    dsp: +((FIRMWARE_DATA[index]?.[0] ?? 0) * DSP_SCALE).toFixed(2)
  }));
  const byName = new Map(effects.map(e => [e.name, e]));
  const inGroup = (role, group) => (GROUPS[group] || [group]).includes(role);

  // ---- analysis context -----------------------------------------------------------------------------
  function context(patch) {
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
      patch, slots, active, of,
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
  function remove(patch, slot) {
    const next = clone(patch);
    next.effects.splice(slot, 1);
    return next;
  }

  // ---- building blocks for the rules of each pedal's advice-rules.js ------------------------------------
  const names = list => list.map(s => s.fx.name).join(', ');
  // Order rule: each active `subject` effect for which when(s, reference) holds → one finding with a fix.
  const order = ({ subject, reference, when, message, fix }) => ctx => {
    const ref = reference(ctx);
    if (!ref) return [];
    return ctx.of(subject).filter(s => s.i !== ref.i && when(s, ref)).map(s => ({ slots: [s.i, ref.i], message: message(s, ref), fix: fix(s, ref) }));
  };
  const kit = {
    names, order,
    before: (s, ref) => ({ label: `Move before ${ref.fx.name}`, apply: p => moveBefore(p, s.i, ref.i) }),
    after: (s, ref) => ({ label: `Move after ${ref.fx.name}`, apply: p => moveAfter(p, s.i, ref.i) }),
    comesAfter: (s, ref) => `${s.fx.name} comes after ${ref.fx.name}.`,
    comesBefore: (s, ref) => `${s.fx.name} comes before ${ref.fx.name}.`
  };

  // Rules that hold on every pedal, word for word. A pedal adds them with ADVICE.addRules(ADVICE.sharedRules('level.muted', …))
  // and must define the source key 'zoomFxList' (its own Effects List).
  const SHARED_RULES = {
    'level.muted': {
      severity: 'error', topic: 'levels', title: 'Effect volume at zero',
      why: 'VOL sets the output level of the effect. At 0 the effect is switched on but nothing comes out of it, so the whole patch goes silent.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.has('VOL') && s.num('VOL') === 0).map(s => ({
        slots: [s.i], message: `${s.label} has VOL at 0.`,
        fix: { label: 'Set VOL to 80', apply: p => setValue(p, s.i, 'VOL', 80) }
      }))
    },
    'chain.all-off': {
      severity: 'warning', topic: 'chain', title: 'Every effect is off',
      why: 'With all effects bypassed the patch only passes the dry signal.',
      sources: [],
      check: ctx => ctx.slots.length && !ctx.active.length ? [{ message: 'Switch on at least one effect.' }] : []
    },
    'mix.silent-effect': {
      severity: 'warning', topic: 'levels', title: 'Effect mixed out completely',
      why: 'MIX (or WET) sets how much of the effect is blended with the original sound. At 0 the effect uses processing power but is inaudible.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.flatMap(s => {
        const param = ['MIX', 'WET'].find(p => s.has(p) && s.num(p) === 0);
        return param ? [{ slots: [s.i], message: `${s.label} has ${param} at 0, so it cannot be heard.`, fix: { label: `Set ${param} to 30`, apply: p => setValue(p, s.i, param, 30) } }] : [];
      })
    },
    'linesel.last': {
      severity: 'warning', topic: 'routing', title: 'Line Selector at the end does nothing',
      why: 'LINE SELECTOR sends the signal either to the next effect or straight to the outputs. As the last effect both routes end at the outputs.',
      sources: ['zoomFxList'],
      check: ctx => {
        const last = ctx.active.at(-1);
        return last && last.role === 'linesel' && ctx.active.length > 1 ? [{ slots: [last.i], message: 'Move LINE SELECTOR in front of the effects you want to be able to skip.' }] : [];
      }
    },
    'usage.tempo-sync': {
      severity: 'tip', topic: 'usage', title: 'Delay synced to the tempo',
      why: 'When the delay MODE is set to the metronome symbol, the delay time follows the tempo, so the result depends on the tempo of the patch.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.has('MODE') && String(s.v('MODE')).includes('♩')).map(s => ({
        slots: [s.i], message: `${s.fx.name}: the delay time follows the tempo. Set the tempo of this patch on the pedal.`
      }))
    }
  };
  const sharedRules = (...ids) => ids.map(id => {
    if (!SHARED_RULES[id]) throw new Error(`Unknown shared advice rule ${id}`);
    return { id, ...SHARED_RULES[id] };
  });

  // ---- public API -------------------------------------------------------------------------------------
  function analyze(patch, options = {}) {
    const ignored = new Set(options.ignored || []);
    // Personal preferences silence the rules they list (see addPreferences)
    preferences.filter(p => (options.preferences || []).includes(p.id)).forEach(p => p.silences.forEach(id => ignored.add(id)));
    const ctx = context(patch);
    ctx.output = options.output === 'amp' || options.output === 'mixer' ? options.output : null; // where the pedal plugs in
    if (!ctx.slots.length) return [];
    const findings = [];
    for (const rule of rules) {
      if (ignored.has(rule.id)) continue;
      let results;
      try { results = rule.check(ctx) || []; } catch (error) { console.error(`Advice rule ${rule.id} failed`, error); continue; }
      results.forEach(result => findings.push({
        ruleId: rule.id, severity: rule.severity, topic: rule.topic, title: rule.title, why: rule.why,
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
  // Rules and sources from imported rule packs (ids start with 'user.'): replaces the previous set, built-in rules stay.
  function setUserRules(list, sourceMap) {
    for (let i = rules.length - 1; i >= 0; i--) if (rules[i].id.startsWith('user.')) rules.splice(i, 1);
    Object.keys(sources).filter(key => key.startsWith('user.')).forEach(key => { delete sources[key]; });
    addRules(list);
    addSources(sourceMap);
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

  // Roles for the effects of another pedal: { names: { 'EFFECT NAME': role }, categories: { CATEGORY: role } }.
  function addRoles({ names = {}, categories = {} } = {}) {
    Object.assign(pedalRoles.names, names);
    Object.assign(pedalRoles.categories, categories);
    effects.forEach(fx => { fx.role = roleOf(fx.name, fx.category); });
  }

  // Placement guidance for one effect, used by the catalog: the tip of its role, plus a note for that effect if there is one.
  const roleTips = {};
  const effectNotes = {};
  const addRoleTips = map => { Object.assign(roleTips, map); };
  // Note shape: { 'EFFECT NAME': { text, sources: [sourceKey] } }
  const addEffectTips = map => { Object.assign(effectNotes, map); };
  function effectTips(index) {
    const tip = roleTips[effects[index].role];
    if (!tip) return null;
    const note = effectNotes[effects[index].name];
    const keys = [...new Set([...(tip.sources || []), ...(note?.sources || [])])];
    return { ...tip, note: note?.text || null, sources: keys.map(key => sources[key]).filter(Boolean) };
  }

  return {
    SEVERITIES, rules, styles, sources, preferences, effects, byName, GROUPS, inGroup,
    analyze, addRules, setUserRules, addStyles, addPreferences, addSources, addRoles, addRoleTips, addEffectTips, effectTips,
    sharedRules, kit,
    edit: { clone, move, moveBefore, moveAfter, setValue, remove }
  };
})();
