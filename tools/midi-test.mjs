// Tests site/pedal-midi.js against a simulated pedal (tools/fake-pedal.mjs): node tools/midi-test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fakePedal } from './fake-pedal.mjs';

const ctx = { console, setTimeout, clearTimeout };
vm.createContext(ctx);
for (const file of ['pedal.js', 'effects-data.js', 'firmware-data.js', 'zptc.js', 'pedal-midi.js']) vm.runInContext(fs.readFileSync(`site/${['pedal.js', 'effects-data.js', 'firmware-data.js'].includes(file) ? 'ms-60b/' : ''}${file}`, 'utf8'), ctx, { filename: file });
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
await test('writing a memory sends the patch intact and reading it back gives the same bytes', async () => {
  const info = await PEDALMIDI.patchInfo();
  const before = await PEDALMIDI.readMemory(42, info);
  const { file } = ZPTC.encode({ name: 'USB WRITE', effects: [{ effect: 'DYNAMIC COMPRESSOR' }, { effect: 'FLIPTOP' }] });
  await PEDALMIDI.writeMemory(42, info, file);
  const after = await PEDALMIDI.readMemory(42, info);
  assert.ok(after.crcOk);
  assert.equal(Buffer.from(after.data).equals(Buffer.from(file)), true);
  // Restoring the backup (the whole memory as read) brings the old patch back
  await PEDALMIDI.writeMemory(42, info, before.memory);
  const restored = await PEDALMIDI.readMemory(42, info);
  assert.equal(Buffer.from(restored.data).equals(Buffer.from(before.data)), true);
  await assert.rejects(() => PEDALMIDI.writeMemory(101, info, file), /does not exist/);
  await assert.rejects(() => PEDALMIDI.writeMemory(1, info, new Uint8Array(info.size + 1)), /a memory holds/);
});
await test('renaming a patch changes only its names (the manager re-encodes it from raw values)', () => {
  const { file } = ZPTC.encode({ name: 'D.I Plus Preamp', _noBlank: true, description: 'This clean sound emphasizes high and low frequencies.', effects: [{ effect: 'D.I PLUS PREAMP' }] });
  assert.ok(ZPTC.roundtrip(file));
  const spec = ZPTC.decode(file);
  const out = ZPTC.encode({ ...spec, name: 'My DI', shortName: 'My DI', effects: spec.effects.map(({ id, on, raw, tail }) => ({ id, on, raw, tail })) }).file;
  const back = ZPTC.decode(out);
  assert.equal(back.name, 'My DI');
  assert.equal(back.shortName, 'My DI');
  assert.equal(back.description, spec.description);
  assert.equal(JSON.stringify(back.effects), JSON.stringify(spec.effects));
  assert.equal(back._noBlank, true);
});
await test('an edited pedal patch keeps its patch data and recomputes the amp bits', () => {
  const base = patches[2]; // "Big Black": AMPG SVT in slot 5 → PRM2 byte 20 = 0x40
  const spec = ZPTC.decode(base);
  const prm2 = spec._prm2;
  const edited = spec.effects.slice(1).map(({ id, on, raw, tail }) => ({ id, on, raw, tail })); // first effect removed
  const out = ZPTC.decode(ZPTC.encode({ ...spec, _prm2Refresh: true, effects: edited }).file);
  const bytes = h => h.match(/../g).map(x => parseInt(x, 16));
  const [before, after] = [bytes(prm2), bytes(out._prm2)];
  assert.equal(before[20], 0x40);
  assert.equal(after[20], 0x20, 'the amp moved to slot 4');
  before.forEach((v, i) => { if (i !== 20 && i !== 10) assert.equal(after[i], v, `PRM2 byte ${i} kept`); });
  assert.equal(out.effects.length, spec.effects.length - 1);
});
await test('clearing a memory writes an empty patch (BLANK slot only) that decodes and round-trips', async () => {
  assert.throws(() => ZPTC.encode({ name: 'Empty', effects: [] }), /1 to/);
  const { file } = ZPTC.encode({ name: 'Empty', empty: true, effects: [] });
  const d = ZPTC.decode(file);
  assert.equal(d.name, 'Empty');
  assert.equal(d.effects.length, 0);
  assert.ok(ZPTC.roundtrip(file));
  const info = await PEDALMIDI.patchInfo();
  await PEDALMIDI.writeMemory(7, info, file);
  const back = await PEDALMIDI.readMemory(7, info);
  assert.ok(back.crcOk);
  assert.deepEqual([...back.data], [...file]);
});
const SIX = ['BLACK OPTICAL COMPRESSOR', 'BLUEBERRY DRIVE', 'AMPG SVT', 'BASS GRAPHIC EQ', 'CLONE CHORUS', 'HALL REVERB'].map(effect => ({ effect }));
const slotCount = file => new DataView(file.buffer, file.byteOffset).getUint32(12, true);
const prm2Bytes = spec => spec._prm2.match(/../g).map(x => parseInt(x, 16));
await test('a full 6-effect chain is written without the BLANK slot: the pedal holds 6 entries and would lose the last effect', async () => {
  const { file: withBlank } = ZPTC.encode({ name: 'SIX FX', selected: 6, effects: SIX });
  assert.equal(slotCount(withBlank), 7, 'BLANK + 6 effects: one entry more than the pedal holds');
  const out = ZPTC.forPedal(withBlank);
  assert.equal(slotCount(out), 6);
  const [a, b] = [ZPTC.decode(withBlank), ZPTC.decode(out)];
  assert.equal(b._noBlank, true);
  assert.equal(b.name, a.name);
  assert.equal(JSON.stringify(b.effects), JSON.stringify(a.effects), 'same effects, values and slots');
  assert.ok(ZPTC.roundtrip(out));
  const [pa, pb] = [prm2Bytes(a), prm2Bytes(b)];
  assert.equal(pa[20], 1 << 4, 'AMPG SVT is entry 3 behind the BLANK: bit 4');
  assert.equal(pb[20], 1 << 3, 'and entry 2 without it: bit 3');
  assert.equal(pa[10] >> 5, 6, 'cursor on the last entry');
  assert.equal(pb[10] >> 5, 5, 'still the last entry, now number 5');
  pa.forEach((v, i) => { if (i !== 10 && i !== 20) assert.equal(pb[i], v, `PRM2 byte ${i} kept`); });
  assert.equal(Buffer.from(ZPTC.forPedal(out)).equals(Buffer.from(out)), true, 'twice gives the same bytes');
  const info = await PEDALMIDI.patchInfo();
  await PEDALMIDI.writeMemory(100, info, out);
  const back = await PEDALMIDI.readMemory(100, info);
  assert.ok(back.crcOk);
  assert.equal(Buffer.from(back.data).equals(Buffer.from(out)), true);
  assert.equal(ZPTC.decode(back.data).effects.length, 6);
});
await test('forPedal leaves the other patches as they are: up to 5 effects, no BLANK, exports and pedal patches', () => {
  // Same bytes, compared by content: the codec runs in its own vm context, so a Uint8Array made here is another class to it
  const same = file => assert.equal(Buffer.from(ZPTC.forPedal(file)).equals(Buffer.from(file)), true);
  const five = ZPTC.encode({ name: 'FIVE FX', effects: SIX.slice(0, 5) }).file;
  assert.equal(slotCount(five), 6);
  same(five);
  assert.equal(ZPTC.forPedal(five), five, 'and the very same array, which is how the manager tells nothing changed');
  same(ZPTC.encode({ name: 'SIX FX', _noBlank: true, effects: SIX }).file);
  patches.forEach(same);
  same(ZPTC.encode({ name: 'Empty', empty: true, effects: [] }).file);
});
await test('the edit cursor of a patch without BLANK starts on its first entry and an edit keeps it', () => {
  const { file } = ZPTC.encode({ name: 'TWO FX', _noBlank: true, effects: SIX.slice(0, 2) });
  assert.equal(prm2Bytes(ZPTC.decode(file))[10] >> 5, 0);
  const cursorOn2 = ZPTC.encode({ name: 'TWO FX', _noBlank: true, selected: 2, effects: SIX.slice(0, 2) }).file;
  const spec = ZPTC.decode(cursorOn2);
  assert.equal(prm2Bytes(spec)[10] >> 5, 1);
  const edited = ZPTC.encode({ ...spec, _prm2Refresh: true, effects: SIX.slice(0, 3).map(({ effect }) => ({ effect })) }).file;
  assert.equal(prm2Bytes(ZPTC.decode(edited))[10] >> 5, 1, 'the cursor stays on the same entry');
  assert.throws(() => ZPTC.encode({ name: 'X', _noBlank: true, selected: 3, effects: SIX.slice(0, 2) }), /between 1 and 2/);
});
PEDALMIDI.disconnect();
console.log(`\n${passed} passed${process.exitCode ? ', some failed' : ''}`);
