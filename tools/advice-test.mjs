#!/usr/bin/env node
// Tests for the advice engine (site/advice-engine.js + site/advice-rules.js).
//   node tools/advice-test.mjs

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const SITE = new URL('../site/', import.meta.url);
const ctx = vm.createContext({ console });
const files = ['effects-data.js', 'firmware-data.js', 'zptc.js', 'advice-engine.js', 'advice-rules.js', 'rule-packs.js', 'tone-ideas.js'];
vm.runInContext(`${files.map(f => readFileSync(new URL(f, SITE), 'utf8')).join('\n;\n')}\n;globalThis.ADVICE = ADVICE; globalThis.ZPTC = ZPTC; globalThis.RULEPACK = RULEPACK; globalThis.TONE_IDEAS = TONE_IDEAS;`, ctx);
const { ADVICE, ZPTC, RULEPACK, TONE_IDEAS } = ctx;
// Values created inside the vm context have their own Array prototype: compare as plain JSON
const same = (actual, expected, message) => assert.equal(JSON.stringify(actual), JSON.stringify(expected), message);

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log(`✓ ${name}`); }
  catch (error) { console.log(`✗ ${name}\n  ${error.message}`); process.exitCode = 1; }
};

const index = name => { const fx = ADVICE.byName.get(name); assert.ok(fx, `unknown effect ${name}`); return fx.index; };
const patch = (...effects) => ({ name: 'TEST', effects: effects.map(([name, values = {}, on = true]) => ({ index: index(name), on, values })) });
const ids = (p, style) => ADVICE.analyze(p, { style }).map(f => f.ruleId);
const find = (p, id, style) => ADVICE.analyze(p, { style }).find(f => f.ruleId === id);
const order = p => p.effects.map(e => ADVICE.effects[e.index].name);
// Applies the fix of `id` and checks the finding is gone
const fixes = (p, id, style) => {
  const finding = find(p, id, style);
  assert.ok(finding, `${id} should fire`);
  assert.ok(finding.fix, `${id} should offer a fix`);
  const fixed = finding.fix.apply(p);
  assert.ok(!ids(fixed, style).includes(id), `${id} still fires after its fix`);
  return fixed;
};

test('every rule references known sources and styles', () => {
  ADVICE.rules.forEach(rule => {
    assert.ok(ADVICE.SEVERITIES.includes(rule.severity), rule.id);
    (rule.sources || []).forEach(key => assert.ok(ADVICE.sources[key], `${rule.id}: unknown source ${key}`));
    (rule.styles || []).forEach(id => assert.ok(ADVICE.styles.some(s => s.id === id), `${rule.id}: unknown style ${id}`));
  });
  ADVICE.styles.forEach(style => Object.keys(style.severity).forEach(id => assert.ok(ADVICE.rules.some(r => r.id === id), `${style.id}: unknown rule ${id}`)));
});

test('every effect has a role with placement tips', () => {
  ADVICE.effects.forEach(fx => assert.ok(ADVICE.effectTips(fx.index), `${fx.name} (${fx.role}) has no tips`));
});

test('empty patch gives no findings', () => same(ADVICE.analyze({ name: '', effects: [] }), []));

test('octaver after drive → move before the drive', () => {
  const p = patch(['BASS OVERDRIVE', { GAIN: 50, TONE: 50, BALANCE: 50, VOL: 80 }], ['BASS OCTAVER', { OCT: 50, LO: 5, HI: 5, DRY: 50 }]);
  same(order(fixes(p, 'order.tracking-after-gain')), ['BASS OCTAVER', 'BASS OVERDRIVE']);
});

test('reverb before amp → move after the amp', () => {
  const p = patch(['ROOM REVERB', { MIX: 20 }], ['FLIPTOP', { VOL: 70 }], ['DYNAMIC COMPRESSOR', { VOL: 80 }]);
  same(order(fixes(p, 'order.time-before-gain')), ['FLIPTOP', 'ROOM REVERB', 'DYNAMIC COMPRESSOR']);
});

test('noise reduction after delay → move before the delay', () => {
  const p = patch(['DARK OVERDRIVE', { GAIN: 60, BLEND: 50, VOL: 80 }], ['DELAY', { MIX: 20 }], ['ZOOM NOISE REDUCTION', {}]);
  same(order(fixes(p, 'order.gate-after-time')), ['DARK OVERDRIVE', 'ZOOM NOISE REDUCTION', 'DELAY']);
});

test('reverb before delay → swap', () => {
  const p = patch(['HALL REVERB', { MIX: 20 }], ['ANALOG DELAY', { MIX: 20 }]);
  same(order(fixes(p, 'order.reverb-before-delay')), ['ANALOG DELAY', 'HALL REVERB']);
});

test('VOL at 0 is an error with a fix', () => {
  const p = patch(['DYNAMIC COMPRESSOR', { SENSE: 5, VOL: 0 }]);
  assert.equal(find(p, 'level.muted').severity, 'error');
  assert.equal(fixes(p, 'level.muted').effects[0].values.VOL, 80);
});

test('an effect that is off is ignored', () => {
  const p = patch(['DYNAMIC COMPRESSOR', { VOL: 0 }, false], ['FLIPTOP', { VOL: 70 }]);
  assert.ok(!ids(p).includes('level.muted'));
});

test('DSP over 100% is an error', () => {
  const p = patch(['SUN CB', { VOL: 70 }], ['BASS TALK SYNTHESIZER', { VOL: 70 }], ['AG 750', { VOL: 70 }]);
  assert.equal(find(p, 'dsp.overflow').severity, 'error');
});

test('drive with DRY at 0 → set DRY', () => {
  const p = patch(['SQUEAK DISTORTION', { GAIN: 70, VOL: 80, DRY: 0 }]);
  assert.equal(fixes(p, 'lowend.drive-no-dry').effects[0].values.DRY, 40);
});

test('drive blend at maximum with high gain → tip', () => {
  const p = patch(['BLUEBERRY DRIVE', { GAIN: 80, BLEND: 100, VOL: 70 }]);
  assert.equal(fixes(p, 'lowend.drive-blend').effects[0].values.BLEND, 60);
});

test('extreme EQ boost is flagged', () => {
  const p = patch(['BASS GRAPHIC EQ', { '50Hz': 12, VOL: 80 }]);
  assert.match(find(p, 'eq.extreme-boost').message, /50Hz is \+12 dB/);
});

test('two amps are flagged', () => {
  assert.ok(ids(patch(['FLIPTOP', { VOL: 70 }], ['AG 750', { VOL: 70 }])).includes('gain.multiple-amps'));
});

test('Line Selector last is flagged', () => {
  assert.ok(ids(patch(['DYNAMIC COMPRESSOR', { VOL: 80 }], ['LINE SELECTOR', {}])).includes('linesel.last'));
});

test('ignored rules are skipped', () => {
  const p = patch(['DYNAMIC COMPRESSOR', { VOL: 0 }]);
  assert.ok(!ADVICE.analyze(p, { ignored: ['level.muted'] }).some(f => f.ruleId === 'level.muted'));
});

test('style rules only run in their style', () => {
  const p = patch(['DYNAMIC COMPRESSOR', { ATTACK: 'SLOW', VOL: 80 }]);
  assert.ok(!ids(p, 'general').includes('funk.comp-attack'));
  assert.equal(fixes(p, 'funk.comp-attack', 'funk').effects[0].values.ATTACK, 'FAST');
});

test('style severity overrides apply', () => {
  const p = patch(['BASS METAL DRIVE', { GAIN: 85, TONE: 50, BALANCE: 50, VOL: 70 }]);
  assert.equal(find(p, 'gate.suggest', 'general').severity, 'tip');
  assert.equal(find(p, 'gate.suggest', 'metal').severity, 'warning');
});

test('synth style wants the synth first', () => {
  const p = patch(['DYNAMIC COMPRESSOR', { VOL: 80 }], ['Z-SYNTHESIZER', { VOL: 70 }]);
  same(order(fixes(p, 'synth.first', 'synth')), ['Z-SYNTHESIZER', 'DYNAMIC COMPRESSOR']);
});

for (const style of ADVICE.styles.filter(s => s.starter)) {
  test(`starter chain "${style.name}" is valid, encodable and clean in its style`, () => {
    const p = { name: style.starter.name, effects: style.starter.effects.map(e => ({ index: index(e.effect), on: true, values: e.values })) };
    p.effects.forEach(e => {
      const fx = ADVICE.effects[e.index];
      const missing = fx.params.map(x => x.name).filter(n => !(n in e.values));
      same(missing, [], `${fx.name} is missing ${missing.join(', ')}`);
      Object.keys(e.values).forEach(n => assert.ok(fx.params.some(x => x.name === n), `${fx.name} has no parameter ${n}`));
    });
    // Like the builder: parameters whose format is not decoded yet hold the raw stored number
    const asSpec = e => Object.fromEntries(Object.entries(e.values).map(([n, v]) => {
      const range = ADVICE.effects[index(e.effect)].params.find(x => x.name === n).range;
      return [n, ZPTC.codec(range, n) ? v : { raw: v }];
    }));
    const { file, dsp } = ZPTC.encode({ name: p.name, effects: style.starter.effects.map(e => ({ effect: e.effect, params: asSpec(e) })) });
    assert.ok(file.length > 0);
    assert.ok(dsp <= 100, `DSP ${dsp}`);
    const serious = ADVICE.analyze(p, { style: style.id }).filter(f => f.severity !== 'tip');
    same(serious.map(f => `${f.ruleId}: ${f.message}`), []);
  });
}

// ---- tone ideas by bassist ------------------------------------------------------------------------------
for (const idea of TONE_IDEAS) {
  test(`tone idea "${idea.name}": facts cite known sources, the chain is valid and clean in its style`, () => {
    const style = ADVICE.styles.find(st => st.id === idea.style);
    assert.ok(style?.starter, `unknown style ${idea.style}`);
    assert.ok(idea.facts.length >= 1);
    idea.facts.forEach(f => assert.ok(ADVICE.sources[f.source], `unknown source ${f.source}`));
    const chain = idea.chain || style.starter;
    assert.ok(chain.name.length <= 10, 'patch names on the pedal have 10 characters');
    chain.effects.forEach(e => {
      const fx = ADVICE.byName.get(e.effect);
      assert.ok(fx, `unknown effect ${e.effect}`);
      same(fx.params.map(x => x.name).filter(n => !(n in e.values)), [], `${fx.name} misses parameters`);
    });
    const { dsp } = ZPTC.encode({ name: chain.name, effects: chain.effects.map(e => ({ effect: e.effect, params: Object.fromEntries(Object.entries(e.values).map(([n, v]) => [n, ZPTC.codec(ADVICE.byName.get(e.effect).params.find(x => x.name === n).range, n) ? v : { raw: v }])) })) });
    assert.ok(dsp <= 100, `DSP ${dsp}`);
    const p = { name: chain.name, effects: chain.effects.map(e => ({ index: index(e.effect), on: true, values: e.values })) };
    same(ADVICE.analyze(p, { style: style.id }).filter(f => f.severity !== 'tip').map(f => f.ruleId), []);
  });
}

test('footswitch effects get a usage tip', () => {
  assert.ok(find(patch(['HOLD DELAY', {}]), 'usage.footswitch'));
  assert.ok(!find(patch(['DELAY', {}]), 'usage.footswitch'));
});

test('tempo-synced delay gets a tip, free-time delay does not', () => {
  assert.ok(find(patch(['DELAY', { MODE: '♩' }]), 'usage.tempo-sync'));
  assert.ok(!find(patch(['DELAY', { MODE: 'SHORT' }]), 'usage.tempo-sync'));
});

test('several loud gain stages get a level tip, a single one does not', () => {
  const drives = Object.keys(Object.fromEntries([...ADVICE.byName]))
    .filter(n => ADVICE.byName.get(n).role === 'drive' && ADVICE.byName.get(n).params.some(p => p.name === 'VOL')).slice(0, 2);
  assert.equal(drives.length, 2);
  assert.ok(find(patch(...drives.map(n => [n, { VOL: 100 }])), 'level.stacked-boosts'));
  assert.ok(!find(patch([drives[0], { VOL: 100 }]), 'level.stacked-boosts'));
  assert.ok(!find(patch(...drives.map(n => [n, { VOL: 50 }])), 'level.stacked-boosts'));
});

// ---- rule packs -----------------------------------------------------------------------------------------
const packWith = (rule, extra = {}) => ({ ...RULEPACK.EXAMPLE, ...extra, rules: [{ ...RULEPACK.EXAMPLE.rules[0], ...rule }] });
const userFindings = (pack, p) => {
  const checked = RULEPACK.validate(pack, ADVICE);
  assert.ok(checked.pack, JSON.stringify(checked.errors));
  const compiled = RULEPACK.compile([checked.pack], ADVICE);
  ADVICE.setUserRules(compiled.rules, compiled.sources);
  return ADVICE.analyze(p).filter(f => f.ruleId.startsWith('user.'));
};
test('the example rule pack is valid and its rules fire', () => {
  const drive = ADVICE.effects.find(fx => fx.role === 'drive' && fx.params.some(p => p.name === 'GAIN')).name;
  const found = userFindings(RULEPACK.EXAMPLE, patch([drive, { GAIN: 95 }], ['DYNAMIC COMPRESSOR', {}]));
  same(found.map(f => f.ruleId).sort(), ['user.example.comp-after-drive', 'user.example.drive-gain-high']);
  assert.ok(found.every(f => f.sources.length === 1 && f.sources[0].url.startsWith('https://')), 'sources resolve');
  same(userFindings(RULEPACK.EXAMPLE, patch(['DYNAMIC COMPRESSOR', {}], [drive, { GAIN: 20 }])), []);
  ADVICE.setUserRules([], {});
  assert.equal(ADVICE.rules.some(r => r.id.startsWith('user.')), false, 'removing a pack removes its rules');
});
test('rule pack fixes move or set, and only exist with mode each', () => {
  const drive = ADVICE.effects.find(fx => fx.role === 'drive' && fx.params.some(p => p.name === 'GAIN')).name;
  const p = patch([drive, { GAIN: 95 }], ['DYNAMIC COMPRESSOR', {}]);
  const found = userFindings(RULEPACK.EXAMPLE, p);
  const move = found.find(f => f.ruleId === 'user.example.comp-after-drive').fix;
  assert.match(move.label, /Move before/);
  same(move.apply(p).effects.map(e => ADVICE.effects[e.index].name), ['DYNAMIC COMPRESSOR', drive]);
  const set = found.find(f => f.ruleId === 'user.example.drive-gain-high').fix;
  assert.equal(set.apply(p).effects[0].values.GAIN, 70);
  assert.equal(p.effects[0].values.GAIN, 95, 'the original patch is untouched');
  assert.match(RULEPACK.validate(packWith({ mode: 'once', fix: { action: 'set', param: 'GAIN', value: 1 } }), ADVICE).errors.join(' '), /mode each/);
  assert.match(RULEPACK.validate(packWith({ fix: { action: 'run', target: { role: 'drive' } } }), ADVICE).errors.join(' '), /fix action/);
  ADVICE.setUserRules([], {});
});
test('the pack editor form model round-trips and blank forms stay invalid until filled', () => {
  const original = RULEPACK.validate(RULEPACK.EXAMPLE, ADVICE).pack;
  const again = RULEPACK.validate(RULEPACK.fromForm(RULEPACK.toForm(original)), ADVICE);
  assert.ok(again.pack, JSON.stringify(again.errors));
  same(again.pack, original);
  const blank = RULEPACK.blankForm();
  assert.ok(RULEPACK.validate(RULEPACK.fromForm(blank), ADVICE).errors, 'an empty form is rejected');
  Object.assign(blank, { name: 'My Pack' });
  Object.assign(blank.sources[0], { key: 'src1', title: 'Some page', url: 'https://example.com/a' });
  Object.assign(blank.rules[0], { title: 'No gate', why: 'because', message: 'add a gate', sources: ['src1'], mode: 'absent', match: { ...blank.rules[0].match, kind: 'effect', value: 'ZOOM NOISE REDUCTION' } });
  const made = RULEPACK.validate(RULEPACK.fromForm(blank), ADVICE);
  assert.ok(made.pack, JSON.stringify(made.errors));
  assert.equal(made.pack.id, 'my-pack');
  assert.equal(made.pack.rules[0].id, 'no-gate');
});
test('rule pack modes: once, absent and position', () => {
  const once = packWith({ id: 'two-drives', fix: undefined, mode: 'once', min: 2, match: { role: 'drive' }, message: '{count} drives: {effect}' });
  const drives = ADVICE.effects.filter(fx => fx.role === 'drive').slice(0, 2).map(fx => [fx.name, {}]);
  assert.equal(userFindings(once, patch(...drives)).length, 1);
  assert.equal(userFindings(once, patch(drives[0])).length, 0);
  const absent = packWith({ id: 'no-comp', fix: undefined, mode: 'absent', match: { role: 'comp' }, message: 'Add a compressor.' });
  assert.equal(userFindings(absent, patch(drives[0])).length, 1);
  assert.equal(userFindings(absent, patch(['DYNAMIC COMPRESSOR', {}])).length, 0);
  const last = packWith({ id: 'comp-last', fix: undefined, match: { role: 'comp', position: 'last' }, message: '{effect} last' });
  assert.equal(userFindings(last, patch(drives[0], ['DYNAMIC COMPRESSOR', {}])).length, 1);
  assert.equal(userFindings(last, patch(['DYNAMIC COMPRESSOR', {}], drives[0])).length, 0);
  ADVICE.setUserRules([], {});
});
test('rule packs reject unsafe or incomplete content', () => {
  const bad = rule => RULEPACK.validate(packWith(rule), ADVICE).errors?.join(' ') ?? '';
  assert.match(bad({ severity: 'error' }), /severity/);
  assert.match(bad({ sources: [] }), /source/);
  assert.match(bad({ sources: ['nope'] }), /unknown source/);
  assert.match(bad({ match: { role: 'nonsense' } }), /unknown role/);
  assert.match(bad({ match: { effect: 'NOT AN EFFECT' } }), /unknown effect/);
  assert.match(bad({ match: { role: 'drive', param: { name: 'GAIN', op: 'eval', value: 1 } } }), /param/);
  assert.match(bad({ id: 'Bad Id' }), /id/);
  assert.match(RULEPACK.validate(packWith({}, { sources: { boss: { title: 'x', url: 'javascript:alert(1)' } } }), ADVICE).errors.join(' '), /url/);
  assert.match(RULEPACK.validate({ format: 'other' }, ADVICE).errors[0], /not a rule pack/);
  assert.ok(RULEPACK.validate(packWith({ message: 'x'.repeat(500) }), ADVICE).errors);
});
test('imported rules take the same severity filter as built-in ones and can be ignored by id', () => {
  const p = patch(['DYNAMIC COMPRESSOR', {}], [ADVICE.effects.find(fx => fx.role === 'drive').name, {}]);
  userFindings(RULEPACK.EXAMPLE, p);
  assert.equal(ADVICE.analyze(p, { ignored: ['user.example.comp-after-drive'] }).some(f => f.ruleId === 'user.example.comp-after-drive'), false);
  ADVICE.setUserRules([], {});
});

test('new sourced rules: delay, reverb tail, deep lows, compression ratio, gate threshold', () => {
  const fires = (fx, values, id, yes = true) => assert.equal(ids(patch([fx, values])).includes(id), yes, `${fx} ${JSON.stringify(values)} → ${id}`);
  fires('DELAY', { REPEAT: 80, MIX: 20 }, 'delay.repeat-high');
  fires('DELAY', { REPEAT: 30, MIX: 20 }, 'delay.repeat-high', false);
  fires('HOLD DELAY', { REPEAT: 90, MIX: 20 }, 'delay.repeat-high', false);
  fires('ANALOG DELAY', { REPEAT: 20, MIX: 60 }, 'delay.mix-high');
  fires('ANALOG DELAY', { REPEAT: 20, MIX: 30 }, 'delay.mix-high', false);
  fires('HALL REVERB', { DECAY: 25, MIX: 30 }, 'reverb.long-tail');
  fires('HALL REVERB', { DECAY: 25, MIX: 10 }, 'reverb.long-tail', false);
  fires('HALL REVERB', { DECAY: 25, MIX: 60 }, 'reverb.long-tail', false); // reverb.mix-high covers it
  fires('BASS GRAPHIC EQ', { '50Hz': 6 }, 'eq.sub-boost');
  fires('BASS GRAPHIC EQ', { '50Hz': 3 }, 'eq.sub-boost', false);
  fires('BASS GRAPHIC EQ', { '50Hz': 12 }, 'eq.sub-boost', false); // eq.extreme-boost covers it
  fires('160 COMPRESSOR', { RATIO: 10 }, 'comp.ratio-high');
  fires('160 COMPRESSOR', { RATIO: 4 }, 'comp.ratio-high', false);
  fires('1176 LIMITER', { RATIO: '20:1' }, 'comp.ratio-high');
  fires('1176 LIMITER', { RATIO: '4:1' }, 'comp.ratio-high', false);
  fires('ZOOM NOISE REDUCTION', { THRSHLD: 85 }, 'gate.threshold-high');
  fires('ZOOM NOISE REDUCTION', { THRSHLD: 30 }, 'gate.threshold-high', false);
  fires('BASS SYNTHESIZER', { BALANCE: 100 }, 'synth.no-dry');
  fires('BASS SYNTHESIZER', { BALANCE: 60 }, 'synth.no-dry', false);
  fires('DYNAMIC COMPRESSOR', { SENSE: 10 }, 'comp.heavy');
  fires('DYNAMIC COMPRESSOR', { SENSE: 5 }, 'comp.heavy', false);
  fires('BLACK OPTICAL COMPRESSOR', { COMP: 95 }, 'comp.heavy');
  const fix = find(patch(['DELAY', { REPEAT: 90, MIX: 20 }]), 'delay.repeat-high').fix;
  assert.equal(fix.apply(patch(['DELAY', { REPEAT: 90, MIX: 20 }])).effects[0].values.REPEAT, 30);
});

test('a pinned preference silences its rules', () => {
  const p = patch(['HALL REVERB', { MIX: 20 }], ['ANALOG DELAY', { MIX: 20 }]);
  assert.ok(ids(p).includes('order.reverb-before-delay'));
  assert.ok(!ADVICE.analyze(p, { preferences: ['reverb-before-delay'] }).some(f => f.ruleId === 'order.reverb-before-delay'));
});

test('every preference silences existing rules only', () => {
  assert.ok(ADVICE.preferences.length > 0);
  ADVICE.preferences.forEach(pref => pref.silences.forEach(id => assert.ok(ADVICE.rules.some(r => r.id === id), `${pref.id}: ${id}`)));
});

const starterPatch = style => patch(...style.starter.effects.map(e => [e.effect, e.values]));

test('every starter chain fits its own style at 100%', () => {
  ADVICE.styles.filter(s => s.starter).forEach(style => {
    const fit = ADVICE.styleFit(starterPatch(style), style);
    assert.equal(fit.fit, 100, `${style.id}: ${fit.fit}`);
    assert.equal(fit.missing.length, 0);
    assert.equal(fit.conflicts.length, 0);
  });
});

test('a drive lowers the reggae fit and is reported as a conflict', () => {
  const reggae = ADVICE.styles.find(s => s.id === 'reggae');
  const clean = ADVICE.styleFit(starterPatch(reggae), reggae);
  const driven = ADVICE.styleFit(patch(...reggae.starter.effects.map(e => [e.effect, e.values]), ['DARK OVERDRIVE', {}]), reggae);
  assert.ok(driven.fit < clean.fit);
  same(driven.conflicts, ['drive']);
});

test('missing roles come with a starter effect and a sensible position', () => {
  const funk = ADVICE.styles.find(s => s.id === 'funk');
  const p = patch(['ENVELOPE FILTER', {}], ['BASS DRIVER PREAMP', {}]);
  const fit = ADVICE.styleFit(p, funk);
  const comp = fit.missing.find(m => m.role === 'comp');
  assert.equal(comp.entry.effect, 'DYNAMIC COMPRESSOR');
  assert.equal(ADVICE.insertPosition(p, fit, 'comp'), 1);
  assert.equal(ADVICE.insertPosition(patch(['BASS DRIVER PREAMP', {}]), fit, 'comp'), 0);
});

const withOutput = (p, output, style) => ADVICE.analyze(p, { style, output });
const ampPatch = cab => patch(['FLIPTOP', { GAIN: 30, VOL: 70, CABINET: cab }]);

test('without an output choice the generic cabinet tip is shown and the output rules stay quiet', () => {
  const found = ids(ampPatch(80));
  assert.ok(found.includes('amp.cabinet'));
  assert.ok(!found.some(id => id.startsWith('output.')));
});

test('into a bass amp: a high CABINET warns and the fix sets it to 0', () => {
  const p = ampPatch(80);
  const finding = withOutput(p, 'amp').find(f => f.ruleId === 'output.cab-into-amp');
  assert.ok(finding && finding.severity === 'warning');
  assert.ok(!withOutput(p, 'amp').some(f => f.ruleId === 'amp.cabinet'));
  const fixed = finding.fix.apply(p);
  assert.equal(fixed.effects[0].values.CABINET, 0);
  assert.ok(!withOutput(fixed, 'amp').some(f => f.ruleId === 'output.cab-into-amp'));
  assert.ok(!withOutput(ampPatch(20), 'amp').some(f => f.ruleId === 'output.cab-into-amp'));
});

test('into a mixer: a low CABINET warns and the fix sets it to 100', () => {
  const p = ampPatch(10);
  const finding = withOutput(p, 'mixer').find(f => f.ruleId === 'output.cab-into-mixer');
  assert.ok(finding && finding.severity === 'warning');
  const fixed = finding.fix.apply(p);
  assert.equal(fixed.effects[0].values.CABINET, 100);
  assert.ok(!withOutput(fixed, 'mixer').some(f => f.ruleId === 'output.cab-into-mixer'));
  assert.ok(!withOutput(ampPatch(80), 'mixer').some(f => f.ruleId === 'output.cab-into-mixer'));
});

test('into a mixer: a drive with no amp model gets a tip', () => {
  const drive = patch(['DARK OVERDRIVE', { GAIN: 60, BLEND: 50, VOL: 75 }]);
  assert.ok(withOutput(drive, 'mixer').some(f => f.ruleId === 'output.no-cab-mixer'));
  assert.ok(!withOutput(drive, 'amp').some(f => f.ruleId === 'output.no-cab-mixer'));
  assert.ok(!withOutput(patch(['DARK OVERDRIVE', { GAIN: 60, BLEND: 50, VOL: 75 }], ['FLIPTOP', { CABINET: 80 }]), 'mixer').some(f => f.ruleId === 'output.no-cab-mixer'));
});

// ---- MS-50G+ (site/ms-50g/: own data and rules, shared engine and codec) ------------------------------
const gctx = vm.createContext({ console });
const gfiles = ['ms-50g/effects-data.js', 'ms-50g/firmware-data.js', 'zptc.js', 'advice-engine.js', 'ms-50g/advice-rules.js'];
vm.runInContext(`${gfiles.map(f => readFileSync(new URL(f, SITE), 'utf8')).join('\n;\n')}\n;globalThis.ADVICE = ADVICE; globalThis.ZPTC = ZPTC; globalThis.EFFECTS_DATA = EFFECTS_DATA; globalThis.FIRMWARE_DATA = FIRMWARE_DATA;`, gctx);
const G = gctx;

test('MS-50G+: data and firmware tables line up, add-ons have no ID', () => {
  assert.equal(G.EFFECTS_DATA.length, G.FIRMWARE_DATA.length);
  assert.equal(G.FIRMWARE_DATA.filter(Boolean).length, 103);
  assert.equal(new Set(G.FIRMWARE_DATA.filter(Boolean).map(f => f[2])).size, 103, 'effect IDs are unique');
  G.ZPTC.effects.filter(e => e.id === null).forEach(e => assert.throws(() => G.ZPTC.encode({ name: 'X', effects: [{ effect: e.name }] }), e.name));
});

test('MS-50G+: every effect with an ID encodes with its defaults and decodes back', () => {
  G.ZPTC.effects.filter(e => e.id !== null).forEach(e => {
    const { file } = G.ZPTC.encode({ name: 'TEST', effects: [{ effect: e.name }] });
    assert.ok(G.ZPTC.roundtrip(file), e.name);
    assert.equal(G.ZPTC.decode(file).effects[0].effect, e.name);
  });
});

test('MS-50G+: rules cite known sources and run on every effect', () => {
  G.ADVICE.rules.forEach(rule => rule.sources.forEach(key => assert.ok(G.ADVICE.sources[key], `${rule.id}: ${key}`)));
  G.ADVICE.effects.forEach(fx => G.ADVICE.analyze({ name: 'T', effects: [{ index: fx.index, on: true, values: {} }] }, { style: 'general' }));
  const amps = G.ADVICE.effects.filter(fx => fx.category === 'PREAMP').slice(0, 4).map(fx => ({ index: fx.index, on: true, values: {} }));
  assert.ok(G.ADVICE.analyze({ name: 'T', effects: amps }, {}).some(f => f.ruleId === 'dsp.overflow'), 'four amps overflow');
});

console.log(`\n${passed} passed${process.exitCode ? ', some failed' : ''}`);
