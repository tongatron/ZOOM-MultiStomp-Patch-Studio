// Small synthetic test for the experimental MS-70CDR → MS-70CDR+ converter.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { console };
vm.createContext(ctx);
for (const file of ['pedal.js', 'effects-data.js', 'firmware-data.js', 'zptc.js', 'patch-converter-map.js', 'patch-converter.js']) {
  const folder = ['pedal.js', 'effects-data.js', 'firmware-data.js', 'patch-converter-map.js', 'patch-converter.js'].includes(file) ? 'ms-70cdr/' : '';
  vm.runInContext(fs.readFileSync(`site/${folder}${file}`, 'utf8'), ctx, { filename: file });
}
const { LEGACY_PATCH_CONVERTER, ZPTC } = vm.runInContext('({ LEGACY_PATCH_CONVERTER, ZPTC })', ctx);
const result = LEGACY_PATCH_CONVERTER.convert({ name: 'Legacy test', effects: [
  { id: '0x06000070', effect: 'Chorus', on: true, raw: [10, 20, 30, 40, 50] },
  { id: '0xdeadbeef', effect: 'Unknown', on: true, raw: [1, 2, 3] }
] });
assert.ok(result.encoded && result.encoded.length > 0);
assert.equal(result.report.converted.length, 1);
assert.equal(result.report.unmapped.length, 1);
assert.match(result.report.warnings[0], /Raw parameter values/);
assert.equal(ZPTC.decode(result.encoded).effects.length, 1);
console.log('✓ experimental converter maps known IDs, preserves raw values and reports unknown effects');
