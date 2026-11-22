#!/usr/bin/env node
// Convert a decoded MS-70CDR patch JSON to an experimental MS-70CDR+ .zptc.
// The input shape is { name, effects: [{ id, on, params?, raw? }] }.
// The report is written next to the output unless a third path is supplied.
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { decodeMSOG } from './msog-decode.mjs';

const ctx = vm.createContext({ console });
for (const file of ['pedal.js', 'effects-data.js', 'firmware-data.js', 'zptc.js', 'patch-converter-map.js', 'patch-converter.js']) {
  const folder = ['pedal.js', 'effects-data.js', 'firmware-data.js', 'patch-converter-map.js', 'patch-converter.js'].includes(file) ? 'ms-70cdr/' : '';
  vm.runInContext(readFileSync(`site/${folder}${file}`, 'utf8'), ctx, { filename: file });
}
const { LEGACY_PATCH_CONVERTER } = vm.runInContext('({ LEGACY_PATCH_CONVERTER })', ctx);
export function convertLegacyBytes(inputBytes, inputPath = '<memory>') {
  let legacy;
  let inputFormat;
  if (inputBytes[0] === 0x7b || inputBytes[0] === 0x5b) {
    legacy = JSON.parse(Buffer.from(inputBytes).toString('utf8'));
    inputFormat = 'decoded-json';
  } else {
    legacy = decodeMSOG(inputBytes);
    inputFormat = 'original-ms-binary';
  }
  const result = LEGACY_PATCH_CONVERTER.convert(legacy);
  result.report.input = { path: inputPath, format: inputFormat };
  return result;
}

if (process.argv[1]?.endsWith('zoom-explorer-convert.mjs')) {
  const [inputPath, outputPath, reportPath = `${outputPath || 'converted'}.report.json`] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    console.error('Usage: node tools/zoom-explorer-convert.mjs <legacy.json|patch.bin> <out.zptc> [report.json]');
    process.exit(2);
  }
  const result = convertLegacyBytes(readFileSync(inputPath), inputPath);
  if (!result.encoded) throw new Error('No effect could be converted; no .zptc was written.');
  writeFileSync(outputPath, Buffer.from(result.encoded));
  writeFileSync(reportPath, JSON.stringify(result.report, null, 2) + '\n');
  console.log(`Wrote ${outputPath} and ${reportPath}`);
  if (result.report.unmapped.length) {
    console.error(`⚠ ${result.report.unmapped.length} effect(s) were not converted; inspect the report.`);
    process.exitCode = 1;
  }
}
