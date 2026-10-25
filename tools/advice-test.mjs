#!/usr/bin/env node
// Tests for the advice engine (site/advice-engine.js + site/advice-rules.js).
//   node tools/advice-test.mjs

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const SITE = new URL('../site/', import.meta.url);
const ctx = vm.createContext({ console });
const files = ['effects-data.js', 'firmware-data.js', 'zptc.js', 'advice-engine.js', 'advice-rules.js'];
vm.runInContext(`${files.map(f => readFileSync(new URL(f, SITE), 'utf8')).join('\n;\n')}\n;globalThis.ADVICE = ADVICE; globalThis.ZPTC = ZPTC;`, ctx);
const { ADVICE, ZPTC } = ctx;
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
    const { file, dsp } = ZPTC.encode({ name: p.name, effects: style.starter.effects.map(e => ({ effect: e.effect, params: e.values })) });
    assert.ok(file.length > 0);
    assert.ok(dsp <= 100, `DSP ${dsp}`);
    const serious = ADVICE.analyze(p, { style: style.id }).filter(f => f.severity !== 'tip');
    same(serious.map(f => `${f.ruleId}: ${f.message}`), []);
  });
}

console.log(`\n${passed} passed${process.exitCode ? ', some failed' : ''}`);
