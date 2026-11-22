#!/usr/bin/env node
// Experimental decoder for the fixed-size patch payload used by the original
// MS pedals (MS-50G/MS-60B/MS-70CDR). Layout and bit fields are derived from
// thammer/zoom-explorer (MIT); the decoder preserves raw blocks for audit.
import { readFileSync } from 'node:fs';

const SLOT_BYTES = 18;
const SLOT_COUNT = 6;
const HEADER_BYTES = SLOT_BYTES * SLOT_COUNT;

function numberFromBits(data, startBit, endBit) {
  const startByte = Math.floor(startBit / 8), endByte = Math.floor(endBit / 8);
  const startOffset = startBit % 8, endOffset = endBit % 8;
  const startMask = 0xff >> startOffset;
  const endMask = (0xff00 >> (endOffset + 1)) & 0xff;
  let value = 0;
  for (let i = endByte; i >= startByte; i--) {
    let byte = data[i];
    if (i === startByte) byte &= startMask;
    if (i === endByte) byte &= endMask;
    value += byte << ((endByte - i) * 8);
  }
  return value >> (7 - endOffset);
}

const hex = bytes => Buffer.from(bytes).toString('hex');
const text = bytes => Buffer.from(bytes).toString('latin1').replace(/\0+$/, '').trimEnd();
const idText = id => `0x${id.toString(16).padStart(8, '0')}`;

export function decodeMSOG(input, { map = new Map() } = {}) {
  const data = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (data.length < HEADER_BYTES + 14) throw new Error(`An original MS patch must be at least ${HEADER_BYTES + 14} bytes`);
  const effects = [];
  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    const original = data.slice(slot * SLOT_BYTES, (slot + 1) * SLOT_BYTES);
    const reversed = original.slice().reverse();
    let bit = reversed.length * 8 - 1;
    const on = numberFromBits(reversed, bit, bit) === 1; bit -= 1;
    const id = numberFromBits(reversed, bit - 27, bit); bit -= 28;
    const raw = [];
    raw.push(numberFromBits(reversed, bit - 12, bit)); bit -= 13;
    raw.push(numberFromBits(reversed, bit - 12, bit)); bit -= 13;
    raw.push(numberFromBits(reversed, bit - 12, bit)); bit -= 13;
    for (let p = 3; p < 8 && bit - 8 >= 0; p++) { raw.push(numberFromBits(reversed, bit - 7, bit)); bit -= 8; }
    bit -= 20;
    raw.push(numberFromBits(reversed, bit - 7, bit));
    const effect = map.get(id);
    effects.push({ slot: slot + 1, id: idText(id), effect: effect?.msogName || (id ? `UNKNOWN ${idText(id)}` : 'THRU'), on, raw, rawBlock: hex(original) });
  }
  const unknown1 = data.slice(HEADER_BYTES, HEADER_BYTES + 3);
  const nameBytes = data.slice(HEADER_BYTES + 3, HEADER_BYTES + 13);
  const unknown2 = data.slice(HEADER_BYTES + 13, HEADER_BYTES + 14);
  const leftToRight = ((unknown1[0] & 0xc0) >> 6) + ((unknown1[1] & 1) << 2);
  const numEffectsField = (unknown1[1] & 0x1c) >> 2;
  const tempo = ((unknown1[1] & 0xe0) >> 5) + ((unknown1[2] & 0x1f) << 3);
  const effectsWithIds = effects.filter(effect => effect.id !== '0x00000000');
  return {
    name: text(nameBytes),
    effects: effectsWithIds,
    slots: effects,
    tempo,
    editEffectSlot: Math.max(0, Math.min(SLOT_COUNT - 1, 5 - leftToRight)),
    numEffectsField,
    unknown1: hex(unknown1),
    unknown2: hex(unknown2),
    raw: hex(data)
  };
}

if (process.argv[1] && process.argv[1].endsWith('msog-decode.mjs')) {
  const [path] = process.argv.slice(2);
  if (!path) { console.error('Usage: node tools/msog-decode.mjs <original-ms-patch>'); process.exit(2); }
  // The browser map is a script rather than an ESM module; the converter
  // enriches these IDs with names in its own VM context.
  console.log(JSON.stringify(decodeMSOG(readFileSync(path)), null, 2));
}
