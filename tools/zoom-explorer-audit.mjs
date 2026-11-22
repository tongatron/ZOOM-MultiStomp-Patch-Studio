// Audit the legacy MS-70CDR → MS-70CDR+ ID map derived from zoom-explorer.
// This is intentionally an audit, not a converter: parameter semantics still
// need the original MS-70CDR effect metadata and per-effect conversion rules.
import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { console };
vm.createContext(ctx);
for (const file of ['effects-data.js', 'firmware-data.js', 'patch-converter-map.js']) {
  vm.runInContext(fs.readFileSync(`site/ms-70cdr/${file}`, 'utf8'), ctx, { filename: file });
}
const { FIRMWARE_DATA, PATCH_CONVERTER_MAP } = vm.runInContext('({ FIRMWARE_DATA, PATCH_CONVERTER_MAP })', ctx);
const plusIds = new Set(FIRMWARE_DATA.map(([, , id]) => id && parseInt(id, 16)).filter(Number.isInteger));
const missingTargets = [];
const duplicateTargets = new Map();
for (const [sourceId, mapping] of PATCH_CONVERTER_MAP) {
  if (mapping.msplusID !== 0 && !plusIds.has(mapping.msplusID)) missingTargets.push({ sourceId, targetId: mapping.msplusID, target: mapping.msplusName });
  duplicateTargets.set(mapping.msplusID, (duplicateTargets.get(mapping.msplusID) || 0) + 1);
}
const duplicateCount = [...duplicateTargets.values()].filter(count => count > 1).length;
console.log(`zoom-explorer legacy map: ${PATCH_CONVERTER_MAP.size} source effects → ${new Set([...PATCH_CONVERTER_MAP.values()].map(value => value.msplusID)).size} MS-70CDR+ targets`);
console.log(`Targets present in the local MS-70CDR+ catalog or intentional THRU: ${PATCH_CONVERTER_MAP.size - missingTargets.length}/${PATCH_CONVERTER_MAP.size}`);
console.log(`Many-to-one target mappings: ${duplicateCount}`);
if (missingTargets.length) {
  console.error('Missing target IDs:');
  for (const item of missingTargets) console.error(`  0x${item.sourceId.toString(16).padStart(8, '0')} → 0x${item.targetId.toString(16).padStart(8, '0')} ${item.target}`);
  process.exitCode = 1;
}
