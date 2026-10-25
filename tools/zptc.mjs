#!/usr/bin/env node
// Decoder/encoder sperimentale per i file patch .zptc dello Zoom MS-60B+ (Handy Guitar Lab).
//
//   node tools/zptc.mjs decode <file.zptc>            → JSON leggibile su stdout
//   node tools/zptc.mjs encode <spec.json> <out.zptc> → genera una patch
//   node tools/zptc.mjs roundtrip <file.zptc>...      → decode + encode, verifica byte per byte
//
// Struttura ricavata dalle patch esportate in patches/ e da mungewell/zoom-zt2 (decode_preset.py):
//   "PTCF" u32 size, u32 version(2), u32 slotCount, 10 byte (00 00 08 00 …), nome 10 char, slotCount × u32 ID effetto
//   "TXJ1" u32 len + testo, "TXE1" u32 len + descrizione
//   "EDTB" u32 len, slotCount × 24 byte: bit 0 = ON, bit 1–29 = ID, poi parametri 5×12 / 3×8 / 4×12 bit (little endian)
//   "PRM2" u32 len(32) + dati di patch (parzialmente noti), "NAME" u32 len(32) + nome 28 char + 4 byte a zero
// Lo slot 0 è sempre vuoto (ID 0, ON) nelle patch esportate: lo replichiamo.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const SITE = new URL('../site/', import.meta.url);
const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL('effects-data.js', SITE), 'utf8') + ';globalThis.E = EFFECTS_DATA', ctx);
vm.runInContext(readFileSync(new URL('firmware-data.js', SITE), 'utf8') + ';globalThis.F = FIRMWARE_DATA; globalThis.S = DSP_SCALE', ctx);

const effects = ctx.E.map(([name, category, , , , params], i) => {
  const [dsp, lcd, fxId] = ctx.F[i];
  return { name, category, params, dsp: +(dsp * ctx.S).toFixed(2), lcd, id: parseInt(fxId, 16) }; // dsp in scala "Processor %" di Handy Guitar Lab
});
const byId = new Map(effects.map(e => [e.id, e]));
const byName = new Map(effects.flatMap(e => [[e.name.toLowerCase(), e], [e.lcd.toLowerCase(), e]]));

const WIDTHS = [12, 12, 12, 12, 12, 8, 8, 8, 12, 12, 12, 12];
const ENTRY = 24;
const HEADER_MAGIC = Buffer.from('00000800000000000000', 'hex');
// PRM2 di una patch esportata con un solo effetto e nessun ampli (patches/01base.zptc).
const PRM2_TEMPLATE = Buffer.from('000000000000000000802c000000000000000000000000000000000000008007', 'hex');
// Parametri nascosti (oltre quelli documentati) osservati nelle esportazioni.
const HIDDEN_DEFAULTS = { 'BASS AMP': { 8: 2 } };

// ---- conversione valore visualizzato ⇄ valore memorizzato -----------------------------------
// Regole verificate sulle esportazioni: liste di opzioni → indice; intervalli interi "a – b" → v - a;
// intervalli "±x.0" con |x| ≥ 10 (EQ ±12.0, ampli ±20.0) → passi da 0.5 (0 dB = centro).
// Gli altri formati (frequenze, "OFF, 1 – 6", ecc.) per ora richiedono il valore grezzo { "raw": n }.
function codec(range) {
  const r = range.replace(/\s+/g, ' ').trim();
  const num = r.match(/^(-?\d+(?:\.\d+)?) – (-?\d+(?:\.\d+)?)$/);
  if (num) {
    const [min, max] = [parseFloat(num[1]), parseFloat(num[2])];
    const decimal = num[1].includes('.');
    if (decimal && !(/\.0$/.test(num[1]) && Math.abs(min) >= 10)) return null; // es. Q 0.5 – 16.0: passo non verificato
    const step = decimal ? 0.5 : 1;
    return {
      encode: v => { const n = Number(v); if (!(n >= min && n <= max)) throw new Error(`${v} fuori da ${r}`); return Math.round((n - min) / step); },
      decode: s => +(min + s * step).toFixed(decimal ? 1 : 0)
    };
  }
  if (!r.includes('–') && !r.includes(' Hz') && r.split(',').length > 1) {
    const options = r.split(',').map(o => o.trim());
    return {
      encode: v => { const i = options.findIndex(o => o.toLowerCase() === String(v).toLowerCase()); if (i < 0) throw new Error(`${v} non è tra ${options.join(', ')}`); return i; },
      decode: s => options[s] ?? { raw: s, range: r }
    };
  }
  return null;
}

// ---- bit packing ------------------------------------------------------------------------------
function unpackEntry(buf) {
  let e = 0n;
  for (let i = ENTRY - 1; i >= 0; i--) e = (e << 8n) | BigInt(buf[i]);
  const on = (e & 1n) === 1n;
  const id = Number((e >> 1n) & ((1n << 29n) - 1n));
  let pos = 30n;
  const raw = WIDTHS.map(w => { const v = Number((e >> pos) & ((1n << BigInt(w)) - 1n)); pos += BigInt(w); return v; });
  return { on, id, raw, tail: Number(e >> pos) }; // tail: bit residui oltre i 12 parametri
}
function packEntry({ on, id, raw, tail = 0 }) {
  let e = BigInt(tail);
  for (let i = WIDTHS.length - 1; i >= 0; i--) {
    const w = BigInt(WIDTHS[i]); const v = BigInt(raw[i] ?? 0);
    if (v >= 1n << w) throw new Error(`parametro ${i + 1} = ${v} non entra in ${w} bit`);
    e = (e << w) | v;
  }
  e = (e << 29n) | BigInt(id);
  e = (e << 1n) | (on ? 1n : 0n);
  const out = Buffer.alloc(ENTRY);
  for (let i = 0; i < ENTRY; i++) { out[i] = Number(e & 0xffn); e >>= 8n; }
  return out;
}

// ---- decode -----------------------------------------------------------------------------------
export function decode(buf) {
  if (buf.toString('latin1', 0, 4) !== 'PTCF') throw new Error('Non è un file PTCF');
  const size = buf.readUInt32LE(4), version = buf.readUInt32LE(8), slots = buf.readUInt32LE(12);
  if (size !== buf.length) throw new Error(`Dimensione dichiarata ${size} ≠ ${buf.length}`);
  const header = buf.subarray(16, 26);
  const shortName = buf.toString('latin1', 26, 36);
  let off = 36;
  const ids = []; for (let i = 0; i < slots; i++, off += 4) ids.push(buf.readUInt32LE(off));
  const chunks = {};
  while (off < buf.length) {
    const tag = buf.toString('latin1', off, off + 4), len = buf.readUInt32LE(off + 4);
    chunks[tag] = buf.subarray(off + 8, off + 8 + len); off += 8 + len;
  }
  const entries = [];
  for (let i = 0; i < slots; i++) entries.push(unpackEntry(chunks.EDTB.subarray(i * ENTRY, (i + 1) * ENTRY)));
  entries.forEach((e, i) => { if (e.id !== ids[i]) throw new Error(`ID slot ${i} incoerente tra intestazione e EDTB`); });
  const slot0 = entries[0];
  return {
    name: chunks.NAME.toString('latin1', 0, 28).trimEnd(),
    shortName: shortName.trimEnd(),
    description: chunks.TXE1?.toString('latin1').replace(/\0+$/, '').trimEnd() || '',
    dspTotal: +entries.slice(1).reduce((s, e) => s + (byId.get(e.id)?.dsp ?? 0), 0).toFixed(2),
    effects: entries.slice(1).map((entry, i) => {
      const fx = byId.get(entry.id);
      const params = {};
      fx?.params.forEach(([pname, , range], p) => {
        const c = codec(range);
        params[pname] = c ? c.decode(entry.raw[p]) : { raw: entry.raw[p], range };
      });
      return {
        slot: i + 1,
        effect: fx ? fx.name : `UNKNOWN 0x${entry.id.toString(16)}`,
        id: `0x${entry.id.toString(16).padStart(8, '0')}`,
        on: entry.on,
        dsp: fx?.dsp ?? null,
        params,
        raw: entry.raw,
        ...(entry.tail ? { tail: entry.tail } : {})
      };
    }),
    ...(slot0.on && slot0.id === 0 && slot0.raw.every(v => v === 0) && !slot0.tail ? {} : { _slot0: slot0 }),
    ...(version !== 2 ? { _version: version } : {}),
    ...(header.equals(HEADER_MAGIC) ? {} : { _header: header.toString('hex') }),
    ...(chunks.TXJ1?.length ? { _txj1: chunks.TXJ1.toString('hex') } : {}),
    _prm2: chunks.PRM2.toString('hex')
  };
}

// ---- encode -----------------------------------------------------------------------------------
function chunk(tag, data) {
  const head = Buffer.alloc(8); head.write(tag, 0, 'latin1'); head.writeUInt32LE(data.length, 4);
  return Buffer.concat([head, data]);
}
const padText = (text, len) => Buffer.from(String(text).padEnd(len, ' ').slice(0, len), 'latin1');

export function encode(spec) {
  if (!spec.name) throw new Error('Serve "name"');
  const list = spec.effects ?? [];
  if (list.length < 1 || list.length > 6) throw new Error('Una patch contiene da 1 a 6 effetti');
  const warnings = [];
  const entries = [spec._slot0 ?? { on: true, id: 0, raw: [] }];
  for (const item of list) {
    const fx = item.id ? byId.get(parseInt(item.id, 16)) : byName.get(String(item.effect).toLowerCase());
    if (!fx) throw new Error(`Effetto sconosciuto: ${item.effect ?? item.id}`);
    const raw = item.raw ? [...item.raw] : new Array(12).fill(0);
    if (!item.raw) Object.entries(HIDDEN_DEFAULTS[fx.category] ?? {}).forEach(([i, v]) => { raw[i] = v; });
    fx.params.forEach(([pname, , range], p) => {
      if (!item.params || !(pname in item.params)) { if (!item.raw) warnings.push(`${fx.name}: ${pname} non indicato, uso il valore grezzo 0`); return; }
      const value = item.params[pname];
      if (value && typeof value === 'object') { raw[p] = value.raw; return; }
      const c = codec(range);
      if (!c) throw new Error(`${fx.name} ${pname}: range "${range}" non ancora decifrato, usa { "raw": n }`);
      raw[p] = c.encode(value);
    });
    entries.push({ on: item.on !== false, id: fx.id, raw, tail: item.tail ?? 0 });
  }
  const dsp = entries.reduce((s, e) => s + (byId.get(e.id)?.dsp ?? 0), 0);
  if (dsp > 100) warnings.push(`Carico DSP stimato ${dsp.toFixed(1)}%: il pedale mostrerà PROCESS OVERFLOW`);

  const prm2 = spec._prm2 ? Buffer.from(spec._prm2, 'hex') : Buffer.from(PRM2_TEMPLATE);
  if (!spec._prm2) {
    // byte 20: un bit per ogni slot con un ampli (bit = slot + 1); byte 10, bit 5–7: slot selezionato in modifica
    entries.forEach((e, i) => { if (byId.get(e.id)?.category === 'BASS AMP') prm2[20] |= 1 << (i + 1); });
    const selected = spec.selected ?? 1;
    if (!(selected >= 1 && selected <= list.length)) throw new Error(`"selected" deve essere tra 1 e ${list.length}`);
    prm2[10] = (prm2[10] & 0x1f) | (selected << 5);
  }

  const head = Buffer.alloc(16); head.write('PTCF', 0, 'latin1'); head.writeUInt32LE(spec._version ?? 2, 8); head.writeUInt32LE(entries.length, 12);
  const ids = Buffer.alloc(4 * entries.length); entries.forEach((e, i) => ids.writeUInt32LE(e.id, i * 4));
  const description = spec.description ? padText(spec.description, (spec.description.length + 4) & ~3) : Buffer.alloc(0);
  const file = Buffer.concat([
    head,
    spec._header ? Buffer.from(spec._header, 'hex') : HEADER_MAGIC,
    padText(spec.shortName ?? spec.name, 10),
    ids,
    chunk('TXJ1', spec._txj1 ? Buffer.from(spec._txj1, 'hex') : Buffer.alloc(0)),
    chunk('TXE1', description),
    chunk('EDTB', Buffer.concat(entries.map(packEntry))),
    chunk('PRM2', prm2),
    chunk('NAME', Buffer.concat([padText(spec.name, 28), Buffer.alloc(4)]))
  ]);
  file.writeUInt32LE(file.length, 4);
  return { file, warnings };
}

// ---- CLI ---------------------------------------------------------------------------------------
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'decode') {
    console.log(JSON.stringify(decode(readFileSync(args[0])), null, 2));
  } else if (cmd === 'encode') {
    const { file, warnings } = encode(JSON.parse(readFileSync(args[0], 'utf8')));
    writeFileSync(args[1], file);
    warnings.forEach(w => console.error('⚠', w));
    console.log(`Scritto ${args[1]} (${file.length} byte)`);
  } else if (cmd === 'roundtrip') {
    let failed = 0;
    for (const path of args) {
      const original = readFileSync(path);
      const spec = decode(original);
      const { file } = encode({ ...spec, effects: spec.effects.map(({ id, on, raw, tail }) => ({ id, on, raw, tail })) });
      const ok = file.equals(original);
      if (!ok) failed++;
      console.log(`${ok ? '✓' : '✗'} ${path}`);
    }
    process.exitCode = failed ? 1 : 0;
  } else {
    console.log('Uso: zptc.mjs decode <file> | encode <spec.json> <out.zptc> | roundtrip <file>...');
  }
}
