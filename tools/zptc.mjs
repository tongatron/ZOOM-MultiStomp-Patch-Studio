#!/usr/bin/env node
// CLI for the ZOOM MS-60B+ .zptc patch files (Handy Guitar Lab).
// The codec lives in site/zptc.js, shared with the site's patch builder.
//
//   node tools/zptc.mjs decode <file.zptc>            → readable JSON on stdout
//   node tools/zptc.mjs encode <spec.json> <out.zptc> → generates a patch
//   node tools/zptc.mjs roundtrip <file.zptc>...      → decode + encode, checks byte for byte
//   node tools/zptc.mjs compare-r-out <a.zptc> <b.zptc> → compares the R OUT PRM2 field and its changed bytes
//   ZPTC_PEDAL=ms-50g node tools/zptc.mjs …            → uses the MS-50G+ effects (site/ms-50g/), not tested yet

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const SITE = new URL('../site/', import.meta.url);
const ctx = vm.createContext({});
const DATA = `${process.env.ZPTC_PEDAL || 'ms-60b'}/`; // the pedal's own folder: site/ms-60b/ (default) or site/ms-50g/
const source = [`${DATA}pedal.js`, `${DATA}effects-data.js`, `${DATA}firmware-data.js`, 'zptc.js'].map(file => readFileSync(new URL(file, SITE), 'utf8')).join('\n;\n');
vm.runInContext(`${source}\n;globalThis.ZPTC = ZPTC;`, ctx);
const { ZPTC } = ctx;

export const decode = bytes => ZPTC.decode(new Uint8Array(bytes));
export const encode = spec => { const { file, warnings, dsp } = ZPTC.encode(spec); return { file: Buffer.from(file), warnings, dsp }; };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'decode') {
    console.log(JSON.stringify(decode(readFileSync(args[0])), null, 2));
  } else if (cmd === 'encode') {
    const { file, warnings } = encode(JSON.parse(readFileSync(args[0], 'utf8')));
    writeFileSync(args[1], file);
    warnings.forEach(w => console.error('⚠', w));
    console.log(`Wrote ${args[1]} (${file.length} bytes)`);
  } else if (cmd === 'roundtrip') {
    let failed = 0;
    for (const path of args) {
      const ok = ZPTC.roundtrip(new Uint8Array(readFileSync(path)));
      if (!ok) failed++;
      console.log(`${ok ? '✓' : '✗'} ${path}`);
    }
    process.exitCode = failed ? 1 : 0;
  } else if (cmd === 'compare-r-out') {
    if (args.length !== 2) throw new Error('Usage: zptc.mjs compare-r-out <first.zptc> <second.zptc>');
    const firstBytes = readFileSync(args[0]);
    const secondBytes = readFileSync(args[1]);
    const first = decode(firstBytes);
    const second = decode(secondBytes);
    const a = Buffer.from(first._prm2, 'hex');
    const b = Buffer.from(second._prm2, 'hex');
    const changedBytes = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) changedBytes.push({ byte: i, first: a[i], second: b[i] });
    console.log(JSON.stringify({
      first: { file: args[0], name: first.name, rightPositionRaw: first.rightPositionRaw },
      second: { file: args[1], name: second.name, rightPositionRaw: second.rightPositionRaw },
      sameEffects: JSON.stringify(first.effects) === JSON.stringify(second.effects),
      changedPrm2Bytes: changedBytes
    }, null, 2));
  } else {
    console.log('Usage: zptc.mjs decode <file> | encode <spec.json> <out.zptc> | roundtrip <file>... | compare-r-out <a> <b>');
  }
}
