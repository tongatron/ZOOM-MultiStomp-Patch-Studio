// Experimental MS-70CDR → MS-70CDR+ patch conversion.
// The effect-ID map comes from zoom-explorer (MIT). Raw parameters are copied
// conservatively because legacy and Plus parameter names/scales are not always
// equivalent. Callers must show the report and ask the user to verify the sound.
const LEGACY_PATCH_CONVERTER = (() => {
  const id = value => typeof value === 'number' ? value : parseInt(String(value).replace(/^0x/i, ''), 16);
  const hexId = value => `0x${id(value).toString(16).padStart(8, '0')}`;
  function convert(input) {
    const report = { converted: [], unmapped: [], warnings: ['Raw parameter values were copied; parameter names and scales were not converted. Verify every effect on the pedal.'] };
    const effects = [];
    for (const [slot, source] of (input.effects || []).entries()) {
      const sourceId = id(source.id);
      const mapping = PATCH_CONVERTER_MAP.get(sourceId);
      if (!mapping || !mapping.msplusID) {
        report.unmapped.push({ slot: slot + 1, sourceId: hexId(sourceId), source: source.effect || mapping?.msogName || 'unknown' });
        continue;
      }
      const target = ZPTC.byId.get(mapping.msplusID);
      if (!target) {
        report.unmapped.push({ slot: slot + 1, sourceId: hexId(sourceId), source: mapping.msogName, targetId: hexId(mapping.msplusID), target: mapping.msplusName });
        continue;
      }
      const raw = Array.from(source.raw || []).slice(0, 12);
      while (raw.length < 12) raw.push(0);
      effects.push({ id: hexId(mapping.msplusID), on: source.on !== false, raw });
      report.converted.push({ slot: slot + 1, sourceId: hexId(sourceId), source: mapping.msogName, targetId: hexId(mapping.msplusID), target: mapping.msplusName });
    }
    const encoded = effects.length ? ZPTC.encode({ name: input.name || 'Converted patch', description: `Experimental conversion from MS-70CDR: ${input.name || ''}`.trim(), effects }).file : null;
    return { encoded, report };
  }
  return Object.freeze({ convert });
})();
