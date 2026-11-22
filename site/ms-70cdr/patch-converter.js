// Experimental MS-70CDR → MS-70CDR+ patch conversion.
// The effect-ID map comes from zoom-explorer (MIT). Parameters are translated
// by compatible names where possible; raw values are copied as a fallback
// because legacy and Plus scales are not always equivalent.
const LEGACY_PATCH_CONVERTER = (() => {
  const id = value => typeof value === 'number' ? value : parseInt(String(value).replace(/^0x/i, ''), 16);
  const hexId = value => `0x${id(value).toString(16).padStart(8, '0')}`;
  const key = value => String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const aliases = {
    BAL: ['MIX', 'LEVEL', 'EFXLVL', 'FXLVL'], MIX: ['BAL', 'LEVEL', 'EFXLVL', 'FXLVL'],
    VOL: ['LEVEL', 'OUT', 'OUTPUT', 'OUTLVL'], OUTPUT: ['VOL', 'LEVEL', 'OUTLVL'],
    REPEAT: ['FDBK', 'FEEDBACK', 'FB'], FDBK: ['REPEAT', 'FEEDBACK', 'FB'],
    RATE: ['SPEED', 'CYCLE'], SPEED: ['RATE', 'CYCLE'], CYCLE: ['RATE', 'SPEED'],
    DEPTH: ['MOD'], MOD: ['DEPTH'], DECAY: ['DCY', 'DWELL'], DWELL: ['DECAY', 'DCY'],
    TONE: ['TREBLE'], TREBLE: ['TONE'], MODE: ['DRCTN', 'TYPE'], TYPE: ['MODE', 'DRCTN'],
    TIME: ['SYNC', 'TIMEA', 'TIMEB', 'TIMEL', 'TIMER'],
    PREDLY: ['PDLY', 'MNL', 'PRED'], PREDELAY: ['PDLY', 'MNL', 'PRED'],
    THRSHLD: ['THRSH', 'TRGGR'], FREQ: ['FREQ1', 'FREQUENCY'],
    HI: ['HIGH'], LO: ['LOW'], HIDMP: ['HIDAMP'], LODMP: ['LODAMP']
  };
  function translatedParams(source, target) {
    if (!source.params || typeof source.params !== 'object') return null;
    const sourceEntries = Object.entries(source.params);
    const sourceByKey = new Map(sourceEntries.map(([name, value]) => [key(name), value]));
    const params = {};
    const matched = new Set();
    let mapped = 0;
    for (const [name] of target.params || []) {
      const candidates = [key(name), ...(aliases[key(name)] || [])];
      const found = candidates.find(candidate => sourceByKey.has(candidate));
      if (found) {
        const value = sourceByKey.get(found);
        const definition = (target.params || []).find(([parameter]) => parameter === name);
        const codec = definition ? ZPTC.codec(definition[2], name, target.name) : null;
        try { if (codec && typeof value !== 'object') codec.encode(value); }
        catch { continue; } // Different scale: keep the whole effect on raw fallback.
        params[name] = value; mapped++;
        matched.add(found);
      }
    }
    const unmapped = sourceEntries.filter(([name]) => !matched.has(key(name))).map(([name]) => name);
    return mapped ? { params, mapped, total: (target.params || []).length, unmapped } : null;
  }
  function convert(input) {
    const report = { converted: [], unmapped: [], warnings: ['Converted patches are experimental. Verify every effect and parameter on the pedal.'] };
    const effects = [];
    for (const [slot, source] of (input.effects || []).entries()) {
      const sourceId = id(source.id);
      const mapping = PATCH_CONVERTER_MAP.get(sourceId);
      if (!mapping || !mapping.msplusID) {
        report.unmapped.push({ slot: slot + 1, sourceId: hexId(sourceId), source: source.effect || mapping?.msogName || 'unknown' });
        continue;
      }
      // The original Delay's ping-pong variant has a dedicated Plus effect.
      const pingPong = mapping.msogName === 'Delay' && source.params && Number(source.params['P-P'] ?? source.params['P-P Delay']) === 1;
      const targetId = pingPong ? 0x08000080 : mapping.msplusID;
      const target = ZPTC.byId.get(targetId);
      if (!target) {
        report.unmapped.push({ slot: slot + 1, sourceId: hexId(sourceId), source: mapping.msogName, targetId: hexId(mapping.msplusID), target: mapping.msplusName });
        continue;
      }
      const translated = translatedParams(source, target);
      if (translated) {
        effects.push({ id: hexId(targetId), on: source.on !== false, params: translated.params });
        report.converted.push({ slot: slot + 1, sourceId: hexId(sourceId), source: mapping.msogName, targetId: hexId(targetId), target: target.name, ...(pingPong ? { variant: 'ping-pong' } : {}), parameterMode: 'names', mappedParameters: translated.mapped, targetParameters: translated.total, ...(translated.unmapped.length ? { unmappedParameters: translated.unmapped } : {}) });
      } else {
        const raw = Array.from(source.raw || []).slice(0, 12);
        while (raw.length < 12) raw.push(0);
        effects.push({ id: hexId(targetId), on: source.on !== false, raw });
        report.converted.push({ slot: slot + 1, sourceId: hexId(sourceId), source: mapping.msogName, targetId: hexId(targetId), target: target.name, ...(pingPong ? { variant: 'ping-pong' } : {}), parameterMode: 'raw' });
      }
    }
    report.summary = {
      inputEffects: (input.effects || []).length,
      convertedEffects: report.converted.length,
      unmappedEffects: report.unmapped.length,
      namedParameterEffects: report.converted.filter(effect => effect.parameterMode === 'names').length,
      rawFallbackEffects: report.converted.filter(effect => effect.parameterMode === 'raw').length,
      effectsWithUnmappedParameters: report.converted.filter(effect => effect.unmappedParameters?.length).length
    };
    const encoded = effects.length ? ZPTC.encode({ name: input.name || 'Converted patch', description: `Experimental conversion from MS-70CDR: ${input.name || ''}`.trim(), effects }).file : null;
    return { encoded, report };
  }
  return Object.freeze({ convert });
})();
