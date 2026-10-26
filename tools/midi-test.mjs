// Tests site/pedal-midi.js against a simulated pedal (tools/fake-pedal.mjs): node tools/midi-test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fakePedal } from './fake-pedal.mjs';

const ctx = { console, setTimeout, clearTimeout };
vm.createContext(ctx);
for (const file of ['pedal.js', 'effects-data.js', 'firmware-data.js', 'zptc.js', 'pedal-midi.js']) vm.runInContext(fs.readFileSync(`site/${file}`, 'utf8'), ctx, { filename: file });
const { PEDALMIDI, ZPTC } = vm.runInContext('({ PEDALMIDI, ZPTC })', ctx);

const patches = ['01base.zptc', '06FLIP.zptc', '07Big Black .zptc'].map(f => new Uint8Array(fs.readFileSync(`patches/${f}`)));
const answer = fakePedal(patches, { device: 0x6e });
// A fake Web MIDI access with one ZOOM input and output wired to the simulated pedal
const input = { id: 'in', name: 'ZOOM MS Plus Series', open: async () => {}, onmidimessage: null };
const output = { id: 'out', name: 'ZOOM MS Plus Series', open: async () => {}, send: message => { const r = answer(message); if (r) setTimeout(() => input.onmidimessage?.({ data: new Uint8Array(r) }), 1); } };
ctx.navigator = { requestMIDIAccess: async () => ({ inputs: new Map([['in', input]]), outputs: new Map([['out', output]]) }) };

let passed = 0;
const test = async (name, fn) => { try { await fn(); passed++; console.log(`✓ ${name}`); } catch (error) { process.exitCode = 1; console.log(`✗ ${name}\n  ${error.message}`); } };

await test('7-bit packing round-trips every patch and CRC32 matches the standard check value', () => {
  assert.equal(PEDALMIDI.crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
  patches.forEach(p => assert.deepEqual(Array.from(PEDALMIDI.unpack(PEDALMIDI.pack(p), p.length)), Array.from(p)));
});
await test('connect, identify and read the memory size', async () => {
  await PEDALMIDI.connect();
  const id = await PEDALMIDI.identify();
  assert.equal(id.device, 0x6e);
  assert.equal(id.version, '1.20');
  await PEDALMIDI.editorOn();
  assert.deepEqual({ ...(await PEDALMIDI.patchInfo()) }, { count: 100, size: 848, bankSize: 10 });
});
await test('the current patch arrives intact, checksum OK, and decodes', async () => {
  const r = await PEDALMIDI.readCurrent();
  assert.ok(r.crcOk);
  assert.deepEqual(Array.from(r.data), Array.from(patches[0]));
  assert.ok(ZPTC.decode(r.data).effects.length > 0);
});
await test('a patch memory arrives intact (bank and slot addressing)', async () => {
  const info = await PEDALMIDI.patchInfo();
  const r = await PEDALMIDI.readMemory(13, info); // bank 1, slot 2 → patch 12 % 3 = 0
  assert.ok(r.crcOk);
  assert.deepEqual(Array.from(r.data), Array.from(patches[12 % patches.length]));
  const big = await PEDALMIDI.readMemory(3, info);
  assert.equal(ZPTC.decode(big.data).name.trim().length > 0, true);
});
await test('a stored patch without the leading BLANK slot decodes its effects and round-trips', async () => {
  // Like factory memory 10 ("D.I Plus Preamp"): one slot, no BLANK in front
  const { file } = ZPTC.encode({ name: 'D.I Plus Preamp', _noBlank: true, effects: [{ effect: 'D.I PLUS PREAMP' }] });
  assert.equal(new DataView(file.buffer).getUint32(12, true), 1, 'one slot');
  const decoded = ZPTC.decode(file);
  assert.equal(decoded.effects.map(e => e.effect).join(), 'D.I PLUS PREAMP');
  assert.ok(ZPTC.roundtrip(file));
  const fake = fakePedal([file]);
  const r = fake([0xf0, 0x52, 0x00, 0x6e, 0x46, 0, 0, 0, 0, 9, 0, 0xf7]);
  assert.ok(r.length > 100);
});
PEDALMIDI.disconnect();
console.log(`\n${passed} passed${process.exitCode ? ', some failed' : ''}`);
