// Codec for Zoom MS-60B+ .zptc (PTCF) patch files, shared by the site (builder.js) and the CLI (tools/zptc.mjs).
// Requires EFFECTS_DATA, FIRMWARE_DATA and DSP_SCALE to be loaded first.
//
// Structure derived from the exported patches in patches/ and from mungewell/zoom-zt2 (decode_preset.py):
//   "PTCF" u32 size, u32 version(2), u32 slotCount, 10 bytes (00 00 08 00 …), 10-char name, slotCount × u32 effect ID
//   "TXJ1" u32 len + text, "TXE1" u32 len + description
//   "EDTB" u32 len, slotCount × 24 byte: bit 0 = ON, bit 1–29 = ID, then parameters 5×12 / 3×8 / 4×12 bits (little endian)
//   "PRM2" u32 len(32) + patch data (partly known), "NAME" u32 len(32) + 28-char name + 4 zero bytes
// Slot 0 is the BLANK that Handy Guitar Lab shows at the start of the chain (ID 0, ON): we reproduce it.

const ZPTC = (() => {
  const effects = EFFECTS_DATA.map(([name, category, , , , params], i) => {
    // No firmware entry (MS-50G+ Handy Guitar Lab add-ons): the effect ID is unknown, so it cannot be written
    const [dsp, lcd, fxId] = FIRMWARE_DATA[i] ?? [null, '', null];
    return { index: i, name, category, params, lcd, id: fxId ? parseInt(fxId, 16) : null, dsp: dsp === null ? null : +(dsp * DSP_SCALE).toFixed(2) };
  });
  const known = effects.filter(e => e.id !== null);
  const byId = new Map(known.map(e => [e.id, e]));
  const byName = new Map(known.flatMap(e => [[e.name.toLowerCase(), e], [e.lcd.toLowerCase(), e]]));

  const WIDTHS = [12, 12, 12, 12, 12, 8, 8, 8, 12, 12, 12, 12];
  const ENTRY = 24;
  const MAX_EFFECTS = 6;
  const NAME_CHARS = /^[!%&'+,\-.=_ A-Za-z0-9]*$/; // characters accepted by Handy Guitar Lab
  const hex = s => Uint8Array.from(s.match(/../g), b => parseInt(b, 16));
  const toHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const HEADER_MAGIC = '00000800000000000000';
  // PRM2 of an exported patch with a single effect and no amp (patches/01base.zptc).
  const PRM2_TEMPLATE = '000000000000000000802c000000000000000000000000000000000000008007';
  // Hidden parameters (beyond the documented ones) seen in exports.
  const HIDDEN_DEFAULTS = { 'BASS AMP': { 8: 2 } };
  // Decimal ranges whose encoding was confirmed by importing generated patches into Handy Guitar Lab.
  const VERIFIED_DECIMAL = new Set(['-12.0 – 12.0', '-20.0 – 20.0']);

  // ---- displayed value ⇄ stored value -----------------------------------------------------------
  // verified: rule confirmed on exports; otherwise inferred by analogy (check on the pedal).
  // Returns null when the format is not decoded yet: the raw value is needed.
  function codec(range, pname = '') {
    const r = range.replace(/\s+/g, ' ').trim();
    const num = r.match(/^(-?\d+(?:\.\d+)?) – (-?\d+(?:\.\d+)?)$/);
    if (num) {
      const [min, max] = [parseFloat(num[1]), parseFloat(num[2])];
      const decimal = num[1].includes('.');
      if (decimal && !(/\.0$/.test(num[1]) && Math.abs(min) >= 10)) return null; // e.g. Q 0.5 – 16.0: unknown step
      const step = decimal ? 0.5 : 1;
      const fallback = min < 0 && max > 0 ? 0 : /^(VOL|OUTPUT)$/.test(pname) ? Math.min(80, max) : min + Math.round((max - min) / 2 / step) * step;
      return {
        kind: 'number', min, max, step, verified: !decimal || VERIFIED_DECIMAL.has(r), fallback,
        encode: v => { const n = Number(v); if (!(n >= min && n <= max)) throw new Error(`${pname} ${v} is outside ${r}`); return Math.round((n - min) / step); },
        decode: s => +(min + s * step).toFixed(decimal ? 1 : 0)
      };
    }
    const offRange = r.match(/^OFF(?:,| –) (\d+)(?: – (\d+))?$/); // "OFF, 1 – 6" or "OFF – 100"
    if (offRange) {
      const [min, max] = offRange[2] ? [+offRange[1], +offRange[2]] : [1, +offRange[1]];
      return {
        kind: 'off-number', min, max, step: 1, verified: false, fallback: /^(IN|GAIN)\d?$/.test(pname) ? Math.round(max / 2) : 'OFF', // OFF on an amp input would silence it
        encode: v => { if (String(v).toUpperCase() === 'OFF') return 0; const n = Number(v); if (!(n >= min && n <= max)) throw new Error(`${pname} ${v} is outside ${r}`); return n - min + 1; },
        decode: s => s === 0 ? 'OFF' : s + min - 1
      };
    }
    if (!r.includes('–') && r.split(',').length > 1) {
      const options = r.split(',').map(o => o.trim());
      return {
        kind: 'enum', options, verified: !r.includes('♩'), fallback: options[0],
        encode: v => { const i = options.findIndex(o => o.toLowerCase() === String(v).toLowerCase()); if (i < 0) throw new Error(`${pname} ${v} is not one of ${options.join(', ')}`); return i; },
        decode: s => options[s] ?? { raw: s, range: r }
      };
    }
    return null;
  }

  // ---- bit packing --------------------------------------------------------------------------------
  function unpackEntry(bytes) {
    let e = 0n;
    for (let i = ENTRY - 1; i >= 0; i--) e = (e << 8n) | BigInt(bytes[i]);
    const on = (e & 1n) === 1n;
    const id = Number((e >> 1n) & ((1n << 29n) - 1n));
    let pos = 30n;
    const raw = WIDTHS.map(w => { const v = Number((e >> pos) & ((1n << BigInt(w)) - 1n)); pos += BigInt(w); return v; });
    return { on, id, raw, tail: Number(e >> pos) }; // tail: leftover bits after the 12 parameters
  }
  function packEntry({ on, id, raw, tail = 0 }) {
    let e = BigInt(tail);
    for (let i = WIDTHS.length - 1; i >= 0; i--) {
      const w = BigInt(WIDTHS[i]); const v = BigInt(raw[i] ?? 0);
      if (v >= 1n << w) throw new Error(`parameter ${i + 1} = ${v} does not fit in ${w} bits`);
      e = (e << w) | v;
    }
    e = (e << 29n) | BigInt(id);
    e = (e << 1n) | (on ? 1n : 0n);
    const out = new Uint8Array(ENTRY);
    for (let i = 0; i < ENTRY; i++) { out[i] = Number(e & 0xffn); e >>= 8n; }
    return out;
  }

  // ---- byte helpers -------------------------------------------------------------------------------
  const latin1 = (bytes, from, to) => String.fromCharCode(...bytes.subarray(from, to));
  const text = (str, len) => Uint8Array.from(String(str).padEnd(len, ' ').slice(0, len), c => c.charCodeAt(0) & 0xff);
  const u32 = (bytes, off) => new DataView(bytes.buffer, bytes.byteOffset).getUint32(off, true);
  const u32le = n => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
  const concat = parts => { const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0)); let o = 0; parts.forEach(p => { out.set(p, o); o += p.length; }); return out; };
  const chunk = (tag, data) => concat([text(tag, 4), u32le(data.length), data]);
  const equal = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  // ---- decode -------------------------------------------------------------------------------------
  function decode(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (latin1(bytes, 0, 4) !== 'PTCF') throw new Error('Not a PTCF file');
    const size = u32(bytes, 4), version = u32(bytes, 8), slots = u32(bytes, 12);
    if (size !== bytes.length) throw new Error(`Declared size ${size} ≠ ${bytes.length}`);
    const header = bytes.subarray(16, 26);
    const shortName = latin1(bytes, 26, 36);
    let off = 36;
    const ids = []; for (let i = 0; i < slots; i++, off += 4) ids.push(u32(bytes, off));
    const chunks = {};
    while (off < bytes.length) {
      const tag = latin1(bytes, off, off + 4), len = u32(bytes, off + 4);
      chunks[tag] = bytes.subarray(off + 8, off + 8 + len); off += 8 + len;
    }
    const entries = [];
    for (let i = 0; i < slots; i++) entries.push(unpackEntry(chunks.EDTB.subarray(i * ENTRY, (i + 1) * ENTRY)));
    entries.forEach((e, i) => { if (e.id !== ids[i]) throw new Error(`Slot ${i} ID differs between header and EDTB`); });
    // Exports from Handy Guitar Lab start with a BLANK slot (ID 0); patches stored on the pedal may not
    const slot0 = entries[0];
    const blank = slot0?.id === 0;
    const fxEntries = blank ? entries.slice(1) : entries;
    return {
      name: latin1(chunks.NAME, 0, 28).trimEnd(),
      shortName: shortName.trimEnd(),
      description: chunks.TXE1 ? latin1(chunks.TXE1, 0).replace(/\0+$/, '').trimEnd() : '',
      dspTotal: +fxEntries.reduce((s, e) => s + (byId.get(e.id)?.dsp ?? 0), 0).toFixed(2),
      effects: fxEntries.map((entry, i) => {
        const fx = byId.get(entry.id);
        const params = {};
        fx?.params.forEach(([pname, , range], p) => {
          const c = codec(range, pname);
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
      ...(!blank ? { _noBlank: true } : slot0.on && slot0.raw.every(v => v === 0) && !slot0.tail ? {} : { _slot0: slot0 }),
      ...(version !== 2 ? { _version: version } : {}),
      ...(toHex(header) === HEADER_MAGIC ? {} : { _header: toHex(header) }),
      ...(chunks.TXJ1?.length ? { _txj1: toHex(chunks.TXJ1) } : {}),
      _prm2: toHex(chunks.PRM2)
    };
  }

  // ---- encode -------------------------------------------------------------------------------------
  // spec: { name, selected?, effects: [{ effect | id, on?, params?: { NAME: value | { raw } }, raw?: [12] }] }
  function encode(spec) {
    const name = String(spec.name ?? '').trim();
    if (!name) throw new Error('The patch needs a name');
    if (!NAME_CHARS.test(name)) throw new Error('The name contains characters the pedal does not accept');
    const list = spec.effects ?? [];
    if (list.length < 1 || list.length > MAX_EFFECTS) throw new Error(`A patch holds 1 to ${MAX_EFFECTS} effects`);
    const warnings = [];
    const entries = spec._noBlank ? [] : [spec._slot0 ?? { on: true, id: 0, raw: [] }];
    for (const item of list) {
      const fx = item.id ? byId.get(parseInt(item.id, 16)) : byName.get(String(item.effect).toLowerCase());
      if (!fx) throw new Error(`Unknown effect: ${item.effect ?? item.id}`);
      const raw = item.raw ? [...item.raw] : new Array(12).fill(0);
      if (!item.raw) Object.entries(HIDDEN_DEFAULTS[fx.category] ?? {}).forEach(([i, v]) => { raw[i] = v; });
      fx.params.forEach(([pname, , range], p) => {
        const c = codec(range, pname);
        const given = item.params && pname in item.params;
        if (!given && item.raw) return;
        const value = given ? item.params[pname] : c ? c.fallback : { raw: 0 };
        if (!given) warnings.push(`${fx.name}: ${pname} not set, using ${typeof value === 'object' ? 'raw value 0' : value}`);
        if (value && typeof value === 'object') { raw[p] = value.raw; return; }
        if (!c) throw new Error(`${fx.name} ${pname}: range "${range}" is not decoded yet, use { "raw": n }`);
        raw[p] = c.encode(value);
      });
      entries.push({ on: item.on !== false, id: fx.id, raw, tail: item.tail ?? 0 });
    }
    const dsp = entries.reduce((s, e) => s + (byId.get(e.id)?.dsp ?? 0), 0);
    if (dsp > 100) warnings.push(`Estimated DSP load ${dsp.toFixed(1)}%: the pedal will show PROCESS OVERFLOW`);

    const prm2 = hex(spec._prm2 ?? PRM2_TEMPLATE);
    // _prm2Refresh: keep the patch data of an existing patch (_prm2) but recompute the bits that depend on the chain
    if (!spec._prm2 || spec._prm2Refresh) {
      // byte 20: one bit per slot holding an amp (bit = slot + 1); byte 10, bits 5–7: slot selected for editing
      if (spec._prm2Refresh) prm2[20] = 0;
      entries.forEach((e, i) => { if (byId.get(e.id)?.category === 'BASS AMP') prm2[20] |= 1 << (i + 1); });
      const kept = prm2[10] >> 5;
      const selected = spec.selected ?? (spec._prm2Refresh && kept >= 1 && kept <= list.length ? kept : 1);
      if (!(selected >= 1 && selected <= list.length)) throw new Error(`"selected" must be between 1 and ${list.length}`);
      prm2[10] = (prm2[10] & 0x1f) | (selected << 5);
    }

    const description = spec.description ? text(spec.description, (spec.description.length + 4) & ~3) : new Uint8Array(0);
    const file = concat([
      text('PTCF', 4), u32le(0), u32le(spec._version ?? 2), u32le(entries.length),
      hex(spec._header ?? HEADER_MAGIC),
      text(spec.shortName ?? name, 10),
      concat(entries.map(e => u32le(e.id))),
      chunk('TXJ1', spec._txj1 ? hex(spec._txj1) : new Uint8Array(0)),
      chunk('TXE1', description),
      chunk('EDTB', concat(entries.map(packEntry))),
      chunk('PRM2', prm2),
      chunk('NAME', concat([text(name, 28), new Uint8Array(4)]))
    ]);
    new DataView(file.buffer).setUint32(4, file.length, true);
    return { file, warnings, dsp };
  }

  // Re-encodes a decoded patch from its raw values: the result must be byte-for-byte identical.
  function roundtrip(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    const spec = decode(bytes);
    const { file } = encode({ ...spec, effects: spec.effects.map(({ id, on, raw, tail }) => ({ id, on, raw, tail })) });
    return equal(file, bytes);
  }

  return { effects, byId, byName, codec, decode, encode, roundtrip, MAX_EFFECTS, NAME_CHARS };
})();
