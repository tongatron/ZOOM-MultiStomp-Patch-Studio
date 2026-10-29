#!/usr/bin/env node
// CLI for the ZOOM MS-60B+ .zptc patch files (Handy Guitar Lab).
// The codec lives in site/zptc.js, shared with the site's patch builder.
//
//   node tools/zptc.mjs decode <file.zptc>            → readable JSON on stdout
//   node tools/zptc.mjs encode <spec.json> <out.zptc> → generates a patch
//   node tools/zptc.mjs roundtrip <file.zptc>...      → decode + encode, checks byte for byte
//   ZPTC_PEDAL=ms-50g node tools/zptc.mjs …            → uses the MS-50G+ effects (site/ms-50g/), not tested yet

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const SITE = new URL('../site/', import.meta.url);
const ctx = vm.createContext({});
const DATA = `${process.env.ZPTC_PEDAL || 'ms-60b'}/`; // the pedal's own folder: site/ms-60b/ (default) or site/ms-50g/
const source = [`${DATA}effects-data.js`, `${DATA}firmware-data.js`, 'zptc.js'].map(file => readFileSync(new URL(file, SITE), 'utf8')).join('\n;\n');
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
  } else {
    console.log('Usage: zptc.mjs decode <file> | encode <spec.json> <out.zptc> | roundtrip <file>...');
  }
}
