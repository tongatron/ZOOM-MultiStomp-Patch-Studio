// Rule packs: advice rules shared as .json files, shared by the site (builder.js) and the tests (tools/advice-test.mjs).
// A pack is data only, never code, so importing one is safe. Format (version 1):
//   { format: 'ms60b-rule-pack', version: 1, id: 'my-pack', name, author?,
//     sources: { key: { title, url } },
//     rules: [{ id, severity: 'tip' | 'warning', title, why, topic?, sources: [key], match, mode?, min?, message }] }
// match selects effects that are ON:    { effect: 'NAME' | role: 'drive', param?: { name, op, value }, position?: 'first' | 'last',
//                                         before?: selector, after?: selector }       (selector = { effect | role, param? })
// mode: 'each' (default, one finding per matching effect) | 'once' (one finding when at least `min` match) | 'absent' (when none match)
// message may use {effect} (names of the matching effects) and {count}.
// Like the built-in rules, every rule must cite a source, and none can be an 'error' (order and levels are convention).

const RULEPACK = (() => {
  const FORMAT = 'ms60b-rule-pack';
  const LIMITS = { rules: 50, title: 80, why: 400, message: 200, topic: 24, packName: 60, sourceTitle: 120, url: 300, bytes: 100_000 };
  const SEVERITIES = ['tip', 'warning'];
  const OPS = ['<', '<=', '>', '>=', '==', '!='];
  const MODES = ['each', 'once', 'absent'];
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
    if (typeof raw.id !== 'string' || !slug.test(raw.id)) fail('pack id must be lowercase letters, digits and dashes');

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
  function compile(packs) {
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
            if (r.mode === 'absent') return !hits.length && ctx.slots.length ? [{ message: r.message.replaceAll('{effect}', '').replaceAll('{count}', '0') }] : [];
            if (r.mode === 'once') return hits.length >= r.min ? [{ slots: hits.map(s => s.i), message: say(hits) }] : [];
            return hits.map(s => ({ slots: [s.i], message: say([s]) }));
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
        sources: ['boss'], match: { role: 'comp', after: { role: 'drive' } }, message: '{effect} comes after a drive: try it before.'
      },
      {
        id: 'drive-gain-high', severity: 'warning', topic: 'gain', title: 'Drive gain very high',
        why: 'Very high gain on a bass drive tends to thin out the low end. Edit the numbers to taste.',
        sources: ['boss'], match: { role: 'drive', param: { name: 'GAIN', op: '>=', value: 90 } }, message: '{effect} has GAIN at 90 or more.'
      }
    ]
  };

  return { FORMAT, LIMITS, validate, compile, EXAMPLE, prefix };
})();

if (typeof module !== 'undefined') module.exports = RULEPACK;
