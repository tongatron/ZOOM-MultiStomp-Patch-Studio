#!/usr/bin/env node
// Inventory remaining multi-pedal catalog gaps. This reports missing evidence;
// it deliberately never invents effect IDs.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SITE = new URL('site/', new URL('..', import.meta.url));
const specs = [
  { id: 'ms-50g', label: 'MS-50G+', files: ['effects-data.js', 'firmware-data.js'] },
  { id: 'ms-80ir', label: 'MS-80IR+', files: ['effects-data.js', 'firmware-data.js'] },
  { id: 'ms-200d', label: 'MS-200D+', files: ['effects-data.js', 'firmware-data.js'] }
];

function audit(spec) {
  const context = vm.createContext({});
  for (const file of spec.files) vm.runInContext(readFileSync(new URL(`${spec.id}/${file}`, SITE), 'utf8'), context, { filename: file });
  const data = vm.runInContext('({ effects: EFFECTS_DATA, firmware: FIRMWARE_DATA })', context);
  const missingIds = data.effects.map((effect, index) => ({ name: effect[0], index })).filter(({ index }) => !data.firmware[index]?.[2]);
  return { pedal: spec.label, effects: data.effects.length, knownIds: data.effects.length - missingIds.length, missingIds };
}

const result = specs.map(audit);
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
else for (const item of result) {
  console.log(`${item.pedal}: ${item.knownIds}/${item.effects} effect IDs known; ${item.missingIds.length} gap(s)`);
  if (item.missingIds.length) console.log(`  ${item.missingIds.map(effect => effect.name).join(', ')}`);
}
