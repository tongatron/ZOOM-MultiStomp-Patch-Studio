import assert from 'node:assert/strict';
import { convertLegacyBytes } from './zoom-explorer-convert.mjs';

const reversed = new Uint8Array(18);
function setBits(data, start, end, value) {
  for (let bit = end; bit >= start; bit--) {
    const on = (value >> (end - bit)) & 1;
    const byte = Math.floor(bit / 8), offset = 7 - (bit % 8);
    data[byte] = (data[byte] & ~(1 << offset)) | (on << offset);
  }
}
setBits(reversed, 143, 143, 1);
setBits(reversed, 115, 142, 0x06000070); // original MS-70CDR CHORUS
const binary = new Uint8Array(122);
binary.set(reversed.slice().reverse());
binary.set(new TextEncoder().encode('BIN TEST'), 111);
const result = convertLegacyBytes(binary, 'binary-test.bin');
assert.ok(result.encoded?.length > 0);
assert.equal(result.report.input.format, 'original-ms-binary');
assert.equal(result.report.converted[0].source, 'Chorus');
assert.equal(result.report.unmapped.length, 0);
console.log('✓ binary patch decodes and converts end-to-end');
