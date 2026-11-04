#!/usr/bin/env node
// Tests for the advice engine (site/advice-engine.js) and the rules of each pedal (site/ms-*/advice-rules.js).
//   node tools/advice-test.mjs

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const SITE = new URL('../site/', import.meta.url);
const ctx = vm.createContext({ console });
const files = ['ms-60b/effects-data.js', 'ms-60b/firmware-data.js', 'zptc.js', 'advice-engine.js', 'ms-60b/advice-rules.js', 'rule-packs.js', 'tone-ideas.js'];
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
const ids = p => ADVICE.analyze(p).map(f => f.ruleId);
const find = (p, id) => ADVICE.analyze(p).find(f => f.ruleId === id);
const order = p => p.effects.map(e => ADVICE.effects[e.index].name);
// Applies the fix of `id` and checks the finding is gone
const fixes = (p, id) => {
  const finding = find(p, id);
  assert.ok(finding, `${id} should fire`);
  assert.ok(finding.fix, `${id} should offer a fix`);
  const fixed = finding.fix.apply(p);
  assert.ok(!ids(fixed).includes(id), `${id} still fires after its fix`);
  return fixed;
};

test('every rule references known sources', () => {
  ADVICE.rules.forEach(rule => {
    assert.ok(ADVICE.SEVERITIES.includes(rule.severity), rule.id);
    (rule.sources || []).forEach(key => assert.ok(ADVICE.sources[key], `${rule.id}: unknown source ${key}`));
  });
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

for (const style of ADVICE.styles.filter(s => s.starter)) {
  test(`starter chain "${style.name}" is valid, encodable and clean`, () => {
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
    const serious = ADVICE.analyze(p).filter(f => f.severity !== 'tip');
    same(serious.map(f => `${f.ruleId}: ${f.message}`), []);
  });
}

// ---- tone ideas by bassist ------------------------------------------------------------------------------
for (const idea of TONE_IDEAS) {
  test(`tone idea "${idea.name}": facts cite known sources, the chain is valid and clean`, () => {
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
    same(ADVICE.analyze(p).filter(f => f.severity !== 'tip').map(f => f.ruleId), []);
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

const withOutput = (p, output) => ADVICE.analyze(p, { output });
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
  G.ADVICE.effects.forEach(fx => G.ADVICE.analyze({ name: 'T', effects: [{ index: fx.index, on: true, values: {} }] }));
  const amps = G.ADVICE.effects.filter(fx => fx.category === 'PREAMP').slice(0, 4).map(fx => ({ index: fx.index, on: true, values: {} }));
  assert.ok(G.ADVICE.analyze({ name: 'T', effects: amps }, {}).some(f => f.ruleId === 'dsp.overflow'), 'four amps overflow');
});

// ---- checks shared by the pedals with their own rules (MS-50G+, MS-70CDR+) -----------------------------
// Rules that state a fact about the pedal or the patch itself may cite no source; every other rule must.
const OBJECTIVE = new Set(['dsp.overflow', 'dsp.near-limit', 'chain.all-off']);
const helpers = A => {
  const idx = name => { const fx = A.byName.get(name); assert.ok(fx, `unknown effect ${name}`); return fx.index; };
  const make = (...effects) => ({ name: 'TEST', effects: effects.map(([name, values = {}, on = true]) => ({ index: idx(name), on, values })) });
  const run = (p, output) => A.analyze(p, { output });
  const has = (p, id, output) => run(p, output).some(f => f.ruleId === id);
  const get = (p, id, output) => run(p, output).find(f => f.ruleId === id);
  const names = p => p.effects.map(e => A.effects[e.index].name);
  const fix = (p, id, output) => {
    const finding = get(p, id, output);
    assert.ok(finding, `${id} should fire`);
    assert.ok(finding.fix, `${id} should offer a fix`);
    const fixed = finding.fix.apply(p);
    assert.ok(!has(fixed, id, output), `${id} still fires after its fix`);
    return fixed;
  };
  return { idx, make, run, has, get, names, fix };
};
// Small deterministic random generator, so a failing chain can be reproduced
const random = seed => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

function sharedChecks(label, A) {
  const { make, run } = helpers(A);
  test(`${label}: every rule cites a known source (objective checks excepted), every preference names a rule`, () => {
    A.rules.forEach(rule => {
      assert.ok(OBJECTIVE.has(rule.id) || rule.sources.length, `${rule.id} cites no source`);
      rule.sources.forEach(key => assert.ok(A.sources[key], `${rule.id}: unknown source ${key}`));
      if (rule.id.startsWith('order.')) assert.notEqual(rule.severity, 'error', `${rule.id}: order rules are warnings or tips`);
    });
    A.preferences.forEach(pref => pref.silences.forEach(id => assert.ok(A.rules.some(r => r.id === id), `${pref.id}: ${id}`)));
  });
  test(`${label}: no bass source in the advice of this pedal`, () => {
    Object.entries(A.sources).forEach(([key, src]) => assert.ok(!/bass/i.test(`${src.title} ${src.url}`), `${key}: ${src.title}`));
  });
  test(`${label}: every effect, add-ons included, has placement tips with sources`, () => {
    A.effects.forEach(fx => {
      const tip = A.effectTips(fx.index);
      assert.ok(tip, `${fx.name} (${fx.role}) has no tips`);
      assert.ok(tip.place && tip.text, fx.name);
      assert.ok(tip.sources.length || fx.role === 'eq', `${fx.name}: tip without sources`);
    });
  });
  test(`${label}: random chains analyse without errors and every fix gives a valid patch`, () => {
    const next = random(42);
    const usable = A.effects.filter(fx => fx.dsp > 0);
    for (let n = 0; n < 400; n++) {
      const effects = Array.from({ length: 1 + Math.floor(next() * 6) }, () => {
        const fx = usable[Math.floor(next() * usable.length)];
        // Random values in each numeric range, so the value checks get exercised too
        const values = Object.fromEntries(fx.params.map(p => {
          const m = p.range.match(/^(-?\d+(?:\.\d+)?) – (-?\d+(?:\.\d+)?)$/);
          return [p.name, m ? Math.round(+m[1] + next() * (m[2] - m[1])) : undefined];
        }).filter(([, v]) => v !== undefined));
        return { index: fx.index, on: next() > 0.1, values };
      });
      const p = { name: 'RANDOM', effects };
      for (const output of [null, 'amp', 'mixer']) {
        run(p, output).filter(f => f.fix).forEach(f => {
          const fixed = f.fix.apply(p);
          assert.ok(fixed.effects.length <= p.effects.length && fixed.effects.length >= p.effects.length - 1, `${f.ruleId}: fix changed the chain length`);
          assert.equal(p.effects.length, effects.length, `${f.ruleId}: fix changed the original patch`);
          run(fixed, output);
        });
      }
    }
  });
  test(`${label}: an empty patch gives no findings`, () => same(run(make(), null), []));
}

// ---- MS-50G+ guitar advice ------------------------------------------------------------------------------
{
  const A = G.ADVICE;
  const { make, has, get, names, fix } = helpers(A);
  sharedChecks('MS-50G+', A);
  const drive = ['TS DRIVE', { GAIN: 50, TONE: 50, VOL: 70 }];
  const amp = ['MS1959 DRIVE', { IN1: 60, IN2: 40, VOL: 60 }];

  test('MS-50G+: guitar roles (amp models, filters, simulators, octaver)', () => {
    same(A.effects.filter(fx => fx.category === 'PREAMP').map(fx => fx.role).filter(r => r !== 'amp'), []);
    assert.equal(A.byName.get('AUTO WAH').role, 'envfilter');
    assert.equal(A.byName.get('NOISE GATE').role, 'gate');
    assert.equal(A.byName.get('ACOUSTIC SIMULATOR').role, 'simulator');
    assert.equal(A.byName.get('OCTAVER').role, 'octave');
    assert.equal(A.byName.get('GUITAR GRAPHIC EQ7').role, 'eq');
  });

  test('MS-50G+: a second amp model is an error, its fix removes it', () => {
    const p = make(amp, ['FD TWIN-R DRIVE', { GAIN: 40, VOL: 60 }, false]);
    assert.equal(get(p, 'amp.one-preamp').severity, 'error', 'counts amps that are off too');
    same(names(fix(p, 'amp.one-preamp')), ['MS1959 DRIVE']);
  });

  test('MS-50G+: a second Line Selector is an error', () => {
    same(names(fix(make(['LINE SELECTOR'], drive, ['LINE SELECTOR']), 'linesel.multiple')), ['LINE SELECTOR', 'TS DRIVE']);
  });

  test('MS-50G+: octaver after the drive → warning, move it first', () => {
    const p = make(drive, ['OCTAVER', { OCT1: 50, OCT2: 0, TONE: 5, DRY: 80 }]);
    assert.equal(get(p, 'order.octave-after-gain').severity, 'warning');
    same(names(fix(p, 'order.octave-after-gain')), ['OCTAVER', 'TS DRIVE']);
  });

  test('MS-50G+: delay before the amp model → move it after', () => {
    same(names(fix(make(['DELAY', { MIX: 30 }], amp), 'order.time-before-gain')), ['MS1959 DRIVE', 'DELAY']);
  });

  test('MS-50G+: gate after the reverb → move it before', () => {
    same(names(fix(make(drive, ['HALL REVERB', { MIX: 20 }], ['NOISE GATE', {}]), 'order.gate-after-time')), ['TS DRIVE', 'NOISE GATE', 'HALL REVERB']);
  });

  test('MS-50G+: compressor before the auto-wah, and after the drive', () => {
    same(names(fix(make(['COMPRESSOR', { SENSE: 5, VOL: 80 }], ['AUTO WAH', { SENSE: 5 }]), 'order.comp-before-envfilter')), ['AUTO WAH', 'COMPRESSOR']);
    same(names(fix(make(drive, ['COMPRESSOR', { SENSE: 5, VOL: 80 }]), 'order.comp-after-gain')), ['COMPRESSOR', 'TS DRIVE']);
  });

  test('MS-50G+: modulation before the amp, reverb before the delay', () => {
    same(names(fix(make(['CHORUS ONE', { MIX: 50 }], amp), 'order.mod-before-gain')), ['MS1959 DRIVE', 'CHORUS ONE']);
    same(names(fix(make(['ROOM REVERB', { MIX: 20 }], ['DELAY', { MIX: 30 }]), 'order.reverb-before-delay')), ['DELAY', 'ROOM REVERB']);
  });

  test('MS-50G+: high gain asks for a gate, until there is one', () => {
    const loud = ['BG MARK3 DRIVE', { GAIN1: 40, GAIN2: 85, VOL: 60 }];
    assert.ok(has(make(loud), 'gate.suggest'), 'GAIN2 counts');
    assert.ok(!has(make(loud, ['ZOOM NOISE REDUCTION', {}]), 'gate.suggest'));
    assert.ok(!has(make(drive), 'gate.suggest'), 'moderate gain');
  });

  test('MS-50G+: "Plug into" advice for amp models', () => {
    assert.ok(has(make(amp), 'output.amp-clean', 'amp'));
    assert.ok(!has(make(amp), 'output.amp-clean', 'mixer'));
    assert.ok(has(make(drive), 'output.no-amp-mixer', 'mixer'));
    assert.ok(!has(make(drive, amp), 'output.no-amp-mixer', 'mixer'));
  });

  test('MS-50G+: values: repeats, delay mix, ratio, two reverbs', () => {
    assert.equal(fix(make(['DUAL DELAY', { 'REP A': 90, 'REP B': 20 }]), 'delay.repeat-high').effects[0].values['REP A'], 30);
    assert.equal(fix(make(['DELAY', { MIX: 80 }]), 'delay.mix-high').effects[0].values.MIX, 35);
    assert.equal(fix(make(['1176 LIMITER', { RATIO: '20:1' }]), 'comp.ratio-high').effects[0].values.RATIO, '4:1');
    assert.ok(has(make(['ROOM REVERB', { MIX: 20 }], ['HALL REVERB', { MIX: 20 }]), 'time.two-reverbs'));
  });

  test('MS-50G+: preferences silence their rules, effect notes show in the catalog', () => {
    const p = make(['CHORUS ONE', { MIX: 50 }], amp);
    assert.ok(!A.analyze(p, { preferences: ['mod-before-gain'] }).some(f => f.ruleId === 'order.mod-before-gain'));
    assert.match(A.effectTips(A.byName.get('OCTAVER').index).note, /POLYPHONIC OCTAVER/);
    assert.equal(A.effectTips(A.byName.get('TS DRIVE').index).note, null);
  });
}

// ---- MS-70CDR+ (chorus, delay and reverb) -----------------------------------------------------------------
const cctx = vm.createContext({ console });
const cfiles = ['ms-70cdr/effects-data.js', 'ms-70cdr/firmware-data.js', 'zptc.js', 'advice-engine.js', 'ms-70cdr/advice-rules.js'];
vm.runInContext(`${cfiles.map(f => readFileSync(new URL(f, SITE), 'utf8')).join('\n;\n')}\n;globalThis.ADVICE = ADVICE; globalThis.EFFECTS_DATA = EFFECTS_DATA; globalThis.FIRMWARE_DATA = FIRMWARE_DATA;`, cctx);
{
  const A = cctx.ADVICE;
  const { make, has, get, names, fix } = helpers(A);
  test('MS-70CDR+: data and firmware tables line up', () => assert.equal(cctx.EFFECTS_DATA.length, cctx.FIRMWARE_DATA.length));
  sharedChecks('MS-70CDR+', A);

  test('MS-70CDR+: roles (pitch trackers, envelope filters, bit crusher)', () => {
    ['OCTAVER', 'BASS OCTAVER', 'POLYPHONIC OCTAVER'].forEach(n => assert.equal(A.byName.get(n).role, 'octave', n));
    assert.equal(A.byName.get('MONO SYNTH').role, 'synth');
    assert.equal(A.byName.get('AUTO WAH').role, 'envfilter');
    assert.equal(A.byName.get('BIT CRUSHER').role, 'drive');
    assert.equal(A.byName.get('DIRTY GATE').role, 'gate');
    assert.equal(A.byName.get('Z-ORGAN').role, 'sfx');
  });

  test('MS-70CDR+: a second Line Selector is an error', () => {
    assert.equal(get(make(['LINE SELECTOR'], ['DELAY', { MIX: 30 }], ['LINE SELECTOR']), 'linesel.multiple').severity, 'error');
  });

  test('MS-70CDR+: octaver after the delay → warning, move it first', () => {
    const p = make(['DELAY', { MIX: 30 }], ['POLYPHONIC OCTAVER', { LO: 50, HI: 0, WET: 50, DRY: 80 }]);
    assert.equal(get(p, 'order.tracking-after-time').severity, 'warning');
    same(names(fix(p, 'order.tracking-after-time')), ['POLYPHONIC OCTAVER', 'DELAY']);
  });

  test('MS-70CDR+: chorus after the reverb, gate after the delay, reverb before the delay', () => {
    same(names(fix(make(['HALL REVERB', { MIX: 30 }], ['CHORUS ONE', { MIX: 50 }]), 'order.mod-after-time')), ['CHORUS ONE', 'HALL REVERB']);
    same(names(fix(make(['DELAY', { MIX: 30 }], ['NOISE GATE', {}]), 'order.gate-after-time')), ['NOISE GATE', 'DELAY']);
    same(names(fix(make(['PLATE REVERB', {}], ['TAPE ECHO', { MIX: 30 }]), 'order.reverb-before-delay')), ['TAPE ECHO', 'PLATE REVERB']);
  });

  test('MS-70CDR+: compressor and auto-wah after the delay', () => {
    same(names(fix(make(['DELAY', { MIX: 30 }], ['COMPRESSOR', { SENSE: 5, VOL: 80 }]), 'order.comp-after-time')), ['COMPRESSOR', 'DELAY']);
    same(names(fix(make(['DELAY', { MIX: 30 }], ['AUTO WAH', { SENSE: 5 }]), 'order.envfilter-after-time')), ['AUTO WAH', 'DELAY']);
  });

  test('MS-70CDR+: two reverbs, many repeats, mono trackers', () => {
    assert.ok(has(make(['ROOM REVERB', {}], ['SHIMMER REVERB', {}]), 'time.two-reverbs'));
    assert.ok(!has(make(['DUAL REVERB', {}]), 'time.two-reverbs'), 'one effect with two reverbs');
    assert.equal(fix(make(['STOMP DELAY', { REPEAT: 95 }]), 'delay.repeat-high').effects[0].values.REPEAT, 30);
    assert.match(get(make(['MONO SYNTH', {}]), 'pitch.mono-chords').message, /one note at a time/);
  });
}

console.log(`\n${passed} passed${process.exitCode ? ', some failed' : ''}`);
