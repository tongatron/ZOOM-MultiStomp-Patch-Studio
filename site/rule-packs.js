// Rule packs: advice rules shared as .json files, shared by the site (builder.js) and the tests (tools/advice-test.mjs).
// A pack is data only, never code, so importing one is safe. Format (version 1):
//   { format: 'ms60b-rule-pack', version: 1, id: 'my-pack', name, author?,
//     sources: { key: { title, url } },
//     rules: [{ id, severity: 'tip' | 'warning', title, why, topic?, sources: [key], match, mode?, min?, message, fix? }] }
// match selects effects that are ON:    { effect: 'NAME' | role: 'drive', param?: { name, op, value }, position?: 'first' | 'last',
//                                         before?: selector, after?: selector }       (selector = { effect | role, param? })
// mode: 'each' (default, one finding per matching effect) | 'once' (one finding when at least `min` match) | 'absent' (when none match)
// message may use {effect} (names of the matching effects) and {count}.
// fix (only with mode 'each', adds a one-click button): { action: 'move-before' | 'move-after', target: selector }  moves the matching effect
//   next to the first (before) or last (after) effect the target selects; or { action: 'set', param, value }  sets a parameter of the matching effect.
// Like the built-in rules, every rule must cite a source, and none can be an 'error' (order and levels are convention).

const RULEPACK = (() => {
  const FORMAT = 'ms60b-rule-pack';
  const LIMITS = { rules: 50, title: 80, why: 400, message: 200, topic: 24, packName: 60, sourceTitle: 120, url: 300, bytes: 100_000 };
  const SEVERITIES = ['tip', 'warning'];
  const OPS = ['<', '<=', '>', '>=', '==', '!='];
  const MODES = ['each', 'once', 'absent'];
  const FIX_ACTIONS = ['move-before', 'move-after', 'set'];
  const slug = /^[a-z0-9][a-z0-9-]{0,39}$/;
  const prefix = packId => `user.${packId}.`;

  // advice: the ADVICE engine (needed to know the effect names and roles)
  function validate(raw, advice) {
    const errors = [];
    const fail = message => { if (errors.length < 8) errors.push(message); };
    const text = (value, max, label) => {
      if (typeof value !== 'string' || !value.trim()) { fail(`${label} is missing`); return ''; }
      if (value.length > max) fail(`${label} is longer than ${max} characters`);
      return value.trim().slice(0, max);
    };
    if (!raw || typeof raw !== 'object' || raw.format !== FORMAT) return { errors: ['not a rule pack (format must be "ms60b-rule-pack")'] };
    if (raw.version !== 1) return { errors: [`unsupported version ${raw.version}`] };
    if (typeof raw.id !== 'string' || !slug.test(raw.id)) fail('pack id must be lowercase letters, digits and dashes (it is made from the pack name, so give the pack a name)');

    const roles = new Set([...advice.effects.map(fx => fx.role), ...Object.keys(advice.GROUPS)]);
    const selector = (sel, where, allowPosition) => {
      if (!sel || typeof sel !== 'object') { fail(`${where}: selector is missing`); return null; }
      const out = {};
      if ((sel.effect === undefined) === (sel.role === undefined)) fail(`${where}: use either "effect" or "role"`);
      if (sel.effect !== undefined) { if (!advice.byName.has(sel.effect)) fail(`${where}: unknown effect "${sel.effect}"`); else out.effect = sel.effect; }
      if (sel.role !== undefined) { if (!roles.has(sel.role)) fail(`${where}: unknown role "${sel.role}" (${[...roles].join(', ')})`); else out.role = sel.role; }
      if (sel.param !== undefined) {
        const p = sel.param;
        const numeric = typeof p?.value === 'number' && Number.isFinite(p.value);
        if (!p || typeof p.name !== 'string' || !OPS.includes(p.op) || !(numeric || typeof p.value === 'string')) fail(`${where}: param needs name, op (${OPS.join(' ')}) and value`);
        else if (!numeric && !['==', '!='].includes(p.op)) fail(`${where}: text values only work with == and !=`);
        else out.param = { name: p.name.slice(0, 40), op: p.op, value: numeric ? p.value : String(p.value).slice(0, 40) };
      }
      if (allowPosition && sel.position !== undefined) { if (sel.position === 'first' || sel.position === 'last') out.position = sel.position; else fail(`${where}: position must be first or last`); }
      return out;
    };

    const sources = {};
    for (const [key, src] of Object.entries(raw.sources && typeof raw.sources === 'object' ? raw.sources : {})) {
      if (!slug.test(key)) { fail(`source key "${key}" must be lowercase letters, digits and dashes`); continue; }
      const url = typeof src?.url === 'string' ? src.url.trim() : '';
      if (!/^https?:\/\/[^\s"'<>`]+$/.test(url) || url.length > LIMITS.url) { fail(`source "${key}" needs a valid http(s) url`); continue; }
      sources[key] = { title: text(src.title, LIMITS.sourceTitle, `source "${key}" title`), url };
    }

    const seen = new Set();
    const rules = (Array.isArray(raw.rules) ? raw.rules : []).slice(0, LIMITS.rules + 1).map((r, n) => {
      const where = `rule ${r?.id ?? n + 1}`;
      if (!r || typeof r !== 'object' || typeof r.id !== 'string' || !slug.test(r.id)) { fail(`${where}: id must be lowercase letters, digits and dashes`); return null; }
      if (seen.has(r.id)) fail(`${where}: duplicate id`);
      seen.add(r.id);
      if (!SEVERITIES.includes(r.severity)) fail(`${where}: severity must be tip or warning`);
      const cited = Array.isArray(r.sources) ? r.sources : [];
      if (!cited.length) fail(`${where}: cite at least one source`);
      cited.forEach(key => { if (!sources[key]) fail(`${where}: unknown source "${key}"`); });
      const mode = r.mode ?? 'each';
      if (!MODES.includes(mode)) fail(`${where}: mode must be ${MODES.join(', ')}`);
      const min = r.min === undefined ? 1 : r.min;
      if (!Number.isInteger(min) || min < 1 || min > 6) fail(`${where}: min must be 1 to 6`);
      const match = selector(r.match, `${where} match`, true);
      const rule = {
        id: r.id, severity: r.severity, mode, min, match,
        title: text(r.title, LIMITS.title, `${where} title`), why: text(r.why, LIMITS.why, `${where} why`), message: text(r.message, LIMITS.message, `${where} message`),
        topic: r.topic === undefined ? 'custom' : text(r.topic, LIMITS.topic, `${where} topic`), sources: cited.filter(key => sources[key])
      };
      let fix = null;
      if (r.fix !== undefined) {
        const x = r.fix;
        if (mode !== 'each') fail(`${where}: fix only works with mode each`);
        else if (!x || !FIX_ACTIONS.includes(x.action)) fail(`${where}: fix action must be ${FIX_ACTIONS.join(', ')}`);
        else if (x.action === 'set') {
          const ok = typeof x.param === 'string' && x.param && (typeof x.value === 'string' || (typeof x.value === 'number' && Number.isFinite(x.value)));
          if (ok) fix = { action: 'set', param: x.param.slice(0, 40), value: typeof x.value === 'string' ? x.value.slice(0, 40) : x.value }; else fail(`${where}: fix set needs param and value`);
        } else fix = { action: x.action, target: selector(x.target, `${where} fix target`, false) };
        if (fix && x.label !== undefined) fix.label = text(x.label, 40, `${where} fix label`);
      }
      rule.fix = fix;
      if (match && r.match.before !== undefined) match.before = selector(r.match.before, `${where} before`, false);
      if (match && r.match.after !== undefined) match.after = selector(r.match.after, `${where} after`, false);
      return rule;
    });
    if (!rules.length) fail('the pack has no rules');
    if (rules.length > LIMITS.rules) fail(`more than ${LIMITS.rules} rules`);
    if (errors.length) return { errors };
    return { pack: { format: FORMAT, version: 1, id: raw.id, name: text(raw.name, LIMITS.packName, 'name'), author: typeof raw.author === 'string' ? raw.author.slice(0, 60) : '', sources, rules } };
  }

  function paramHolds(slot, { name, op, value }) {
    if (!slot.has(name)) return false;
    if (typeof value === 'string') return op === '==' ? String(slot.v(name)) === value : String(slot.v(name)) !== value;
    const n = slot.num(name);
    if (n === null) return false;
    return { '<': n < value, '<=': n <= value, '>': n > value, '>=': n >= value, '==': n === value, '!=': n !== value }[op];
  }

  // Turns validated packs into engine rules and sources (ids are prefixed with user.<pack id>.)
  function compile(packs, advice) {
    const rules = [];
    const sourceMap = {};
    for (const pack of packs) {
      for (const [key, src] of Object.entries(pack.sources)) sourceMap[prefix(pack.id) + key] = src;
      for (const r of pack.rules) {
        rules.push({
          id: prefix(pack.id) + r.id, severity: r.severity, topic: r.topic, title: r.title, why: r.why,
          sources: r.sources.map(key => prefix(pack.id) + key),
          check: ctx => {
            const pick = sel => ctx.active.filter(s => (sel.effect ? s.fx.name === sel.effect : ctx.of(sel.role).includes(s)) && (!sel.param || paramHolds(s, sel.param)));
            const m = r.match;
            const hits = pick(m).filter(s =>
              (!m.position || s === (m.position === 'first' ? ctx.active[0] : ctx.active.at(-1))) &&
              (!m.before || pick(m.before).some(other => other.i > s.i)) &&
              (!m.after || pick(m.after).some(other => other.i < s.i)));
            const say = list => r.message.replaceAll('{effect}', list.map(s => s.fx.name).join(', ')).replaceAll('{count}', String(list.length));
            const fixFor = s => {
              if (!r.fix) return undefined;
              const f = r.fix;
              if (f.action === 'set') return s.has(f.param) ? { label: f.label || `Set ${f.param} to ${f.value}`, apply: p => advice.edit.setValue(p, s.i, f.param, f.value) } : undefined;
              const others = pick(f.target).filter(o => o.i !== s.i);
              const to = f.action === 'move-before' ? others[0] : others.at(-1);
              if (!to) return undefined;
              const move = f.action === 'move-before' ? advice.edit.moveBefore : advice.edit.moveAfter;
              return { label: f.label || `Move ${f.action === 'move-before' ? 'before' : 'after'} ${to.fx.name}`, apply: p => move(p, s.i, to.i) };
            };
            if (r.mode === 'absent') return !hits.length && ctx.slots.length ? [{ message: r.message.replaceAll('{effect}', '').replaceAll('{count}', '0') }] : [];
            if (r.mode === 'once') return hits.length >= r.min ? [{ slots: hits.map(s => s.i), message: say(hits) }] : [];
            return hits.map(s => ({ slots: [s.i], message: say([s]), fix: fixFor(s) }));
          }
        });
      }
    }
    return { rules, sources: sourceMap };
  }

  const EXAMPLE = {
    format: FORMAT, version: 1, id: 'example', name: 'Example pack', author: '',
    sources: { boss: { title: 'BOSS — Order of operation: a guide to bass effects signal chain', url: 'https://articles.boss.info/order-of-operation-a-guide-to-bass-effects-signal-chain/' } },
    rules: [
      {
        id: 'comp-after-drive', severity: 'tip', topic: 'order', title: 'Compressor after a drive',
        why: 'A compressor usually goes before the drive so the drive sees an even signal. Edit or delete this example rule.',
        sources: ['boss'], match: { role: 'comp', after: { role: 'drive' } }, message: '{effect} comes after a drive: try it before.',
        fix: { action: 'move-before', target: { role: 'drive' } }
      },
      {
        id: 'drive-gain-high', severity: 'warning', topic: 'gain', title: 'Drive gain very high',
        why: 'Very high gain on a bass drive tends to thin out the low end. Edit the numbers to taste.',
        sources: ['boss'], match: { role: 'drive', param: { name: 'GAIN', op: '>=', value: 90 } }, message: '{effect} has GAIN at 90 or more.',
        fix: { action: 'set', param: 'GAIN', value: 70 }
      }
    ]
  };

  // ---- form model used by the pack editor (rule-pack-editor.js) -----------------------------------------
  // Same data as a pack, but every field is a plain string/boolean so inputs can bind to it. fromForm() returns a raw pack
  // that still goes through validate().
  const slugify = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  const toNumberIfNumeric = text => { const n = Number(text); return String(text).trim() !== '' && Number.isFinite(n) ? n : String(text); };
  const blankSelector = () => ({ kind: 'role', value: 'drive', paramOn: false, pname: '', op: '>=', pvalue: '', position: '' });
  const selToForm = sel => ({
    kind: sel?.effect !== undefined ? 'effect' : 'role', value: sel?.effect ?? sel?.role ?? '', position: sel?.position ?? '',
    paramOn: !!sel?.param, pname: sel?.param?.name ?? '', op: sel?.param?.op ?? '>=', pvalue: sel?.param ? String(sel.param.value) : ''
  });
  const selFromForm = f => {
    const out = { [f.kind]: f.value };
    if (f.paramOn) out.param = { name: f.pname.trim(), op: f.op, value: toNumberIfNumeric(f.pvalue) };
    if (f.position) out.position = f.position;
    return out;
  };
  const blankRule = () => ({ id: '', title: '', severity: 'tip', topic: '', why: '', message: '', sources: [], mode: 'each', min: 1, match: blankSelector(), after: null, before: null, fix: null });
  const blankForm = () => ({ id: '', name: '', author: '', sources: [{ key: '', title: '', url: '' }], rules: [blankRule()] });

  function toForm(pack) {
    return {
      id: pack.id, name: pack.name, author: pack.author || '',
      sources: Object.entries(pack.sources).map(([key, src]) => ({ key, title: src.title, url: src.url })),
      rules: pack.rules.map(r => ({
        id: r.id, title: r.title, severity: r.severity, topic: r.topic === 'custom' ? '' : r.topic, why: r.why, message: r.message,
        sources: [...r.sources], mode: r.mode, min: r.min,
        match: selToForm(r.match), after: r.match.after ? selToForm(r.match.after) : null, before: r.match.before ? selToForm(r.match.before) : null,
        fix: r.fix ? { action: r.fix.action, label: r.fix.label || '', param: r.fix.param || '', value: r.fix.value === undefined ? '' : String(r.fix.value), target: selToForm(r.fix.target) } : null
      }))
    };
  }

  function fromForm(form) {
    const sources = {};
    form.sources.forEach((src, i) => {
      if (!src.title.trim() && !src.url.trim()) return; // an empty row is ignored
      const key = src.key || `src${i + 1}`;
      sources[key] = { title: src.title, url: src.url };
    });
    const used = new Set();
    const rules = form.rules.map((r, i) => {
      let id = r.id || slugify(r.title) || `rule-${i + 1}`;
      while (used.has(id)) id = `${id.slice(0, 36)}-${i + 1}`;
      used.add(id);
      const match = selFromForm(r.match);
      if (r.after) match.after = selFromForm({ ...r.after, position: '' });
      if (r.before) match.before = selFromForm({ ...r.before, position: '' });
      const out = {
        id, severity: r.severity, title: r.title, why: r.why, message: r.message, mode: r.mode, match,
        sources: r.sources.filter(key => sources[key])
      };
      if (r.topic.trim()) out.topic = r.topic.trim();
      if (r.mode === 'once') out.min = Number(r.min);
      if (r.fix && r.mode === 'each') {
        out.fix = r.fix.action === 'set' ? { action: 'set', param: r.fix.param.trim(), value: toNumberIfNumeric(r.fix.value) } : { action: r.fix.action, target: selFromForm({ ...r.fix.target, position: '' }) };
        if (r.fix.label.trim()) out.fix.label = r.fix.label.trim();
      }
      return out;
    });
    return { format: FORMAT, version: 1, id: form.id || slugify(form.name), name: form.name, author: form.author, sources, rules };
  }

  const roleNames = advice => [...new Set([...advice.effects.map(fx => fx.role), ...Object.keys(advice.GROUPS)])].sort();

  return { FORMAT, LIMITS, validate, compile, EXAMPLE, prefix, toForm, fromForm, blankForm, blankRule, blankSelector, slugify, roleNames };
})();

if (typeof module !== 'undefined') module.exports = RULEPACK;
