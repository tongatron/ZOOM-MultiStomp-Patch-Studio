import assert from 'node:assert/strict';
import { decodeMSOG } from './msog-decode.mjs';

const bytes = new Uint8Array(122);
bytes.set(new TextEncoder().encode('TEST PATCH'), 111);
const decoded = decodeMSOG(bytes);
assert.equal(decoded.name, 'TEST PATCH');
assert.equal(decoded.slots.length, 6);
assert.equal(decoded.effects.length, 0);
assert.equal(decoded.tempo, 0);
assert.equal(decoded.raw.length, 244);
console.log('✓ original MS patch decoder reads the fixed layout and preserves raw data');
