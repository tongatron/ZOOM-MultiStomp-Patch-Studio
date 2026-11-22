import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { decodeMSOG } from './msog-decode.mjs';

const mapContext = vm.createContext({});
vm.runInContext(fs.readFileSync('site/ms-70cdr/patch-converter-map.js', 'utf8'), mapContext);

const bytes = new Uint8Array(122);
bytes.set(new TextEncoder().encode('TEST PATCH'), 111);
const decoded = decodeMSOG(bytes);
assert.equal(decoded.name, 'TEST PATCH');
assert.equal(decoded.slots.length, 6);
assert.equal(decoded.effects.length, 0);
assert.equal(decoded.tempo, 0);
assert.equal(decoded.raw.length, 244);

// One synthetic Chorus slot: the source format stores each 18-byte block reversed.
const reversed = new Uint8Array(18);
function setBits(data, start, end, value) {
  for (let bit = end; bit >= start; bit--) {
    const shift = end - bit;
    const on = (value >> shift) & 1;
    const byte = Math.floor(bit / 8), offset = 7 - (bit % 8);
    data[byte] = (data[byte] & ~(1 << offset)) | (on << offset);
  }
}
setBits(reversed, 143, 143, 1);
setBits(reversed, 115, 142, 0x06000070);
setBits(reversed, 102, 114, 10);
const original = reversed.slice().reverse();
const withEffect = new Uint8Array(122);
withEffect.set(original, 0);
const effectDecoded = decodeMSOG(withEffect, { map: mapContext.PATCH_CONVERTER_MAP });
assert.equal(effectDecoded.effects[0].id, '0x06000070');
assert.equal(effectDecoded.effects[0].effect, 'Chorus');
assert.equal(effectDecoded.effects[0].raw[0], 10);
console.log('✓ original MS patch decoder reads the fixed layout and preserves raw data');
