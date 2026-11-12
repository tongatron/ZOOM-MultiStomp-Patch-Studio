// Readable text export for one saved patch, shared by the builder and the Pedal manager.
const PATCHTEXT = (() => {
  const featureNames = { fs: 'footswitch', st: 'stereo output', sync: 'tempo sync', dry: 'dry signal mix' };
  const clean = value => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
  const date = value => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'unknown date' : parsed.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const value = raw => raw === undefined || raw === null || raw === '' ? '—' : clean(raw);
  const fileName = name => `${clean(name).replace(/[^A-Za-z0-9_-]+/g, '_') || 'patch'}.txt`;

  function format(patch) {
    const effects = (patch.effects || []).filter(effect => EFFECTS_DATA[effect.index]);
    const lines = [
      `${PEDAL.name} — Patch`,
      `Name: ${clean(patch.name) || '(untitled)'}`,
      patch.updatedAt ? `Modified: ${date(patch.updatedAt)}` : '',
      patch.output ? `Output: ${patch.output === 'amp' ? 'amp' : 'mixer'}` : '',
      '',
      `Effects used (${effects.length})`,
      ''
    ].filter(Boolean);

    effects.forEach((effect, i) => {
      const [name, category, model, description, tags = [], params = []] = EFFECTS_DATA[effect.index];
      lines.push(`${i + 1}. ${name}`);
      lines.push(`   Category: ${CATEGORIES[category]?.label || category}`);
      if (model) lines.push(`   Reference model: ${model}`);
      lines.push(`   Description: ${description}`);
      const features = tags.map(tag => featureNames[tag]).filter(Boolean);
      if (features.length) lines.push(`   Features: ${features.join(', ')}`);
      lines.push(`   Main controls: ${params.map(param => param[0]).join(', ') || 'none'}`, '');
    });

    lines.push(`Signal chain (${effects.length} effects)`, '');
    effects.forEach((effect, i) => {
      const [name, , , , , params = []] = EFFECTS_DATA[effect.index];
      lines.push(`${i + 1}. ${name} — ${effect.on === false ? 'OFF' : 'ON'}`);
      if (!params.length) lines.push('   Parameters: none');
      params.forEach(([param, description, range]) => lines.push(`   ${param}: ${value(effect.values?.[param])} — ${description} [${range}]`));
      lines.push('');
    });
    return `${lines.join('\n').trim()}\n`;
  }

  return { format, fileName };
})();
