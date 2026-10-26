// Form editor for rule packs (opens in the #pack-editor dialog). The pure parts (form model, conversion, validation) live in rule-packs.js.
// RULEEDITOR.open(pack | null, onSave): edits a copy of `pack` (or a blank one); onSave(validatedPack) runs when the pack is valid.
// Requires ADVICE, RULEPACK and escapeHtml (builder.js).

const RULEEDITOR = (() => {
  const dialog = document.getElementById('pack-editor');
  const body = document.getElementById('pack-editor-body');
  const errorBox = document.getElementById('pack-editor-errors');
  const esc = text => escapeHtml(String(text ?? ''));
  let form = null;
  let existingId = null;
  let onSaveCallback = null;
  let openRules = new Set([0]);

  // ---- bound inputs: data-bind="rules.0.title" reads and writes form.rules[0].title ----------------------
  // "rules.N.fixAction" is a virtual path for the fix select: the fix object only exists once an action is chosen.
  const fixPath = path => path.match(/^rules\.(\d+)\.fixAction$/);
  const walk = path => {
    const keys = path.split('.');
    const last = keys.pop();
    return [keys.reduce((target, key) => target[key], form), last];
  };
  const get = path => {
    const fix = fixPath(path);
    if (fix) return form.rules[Number(fix[1])].fix?.action ?? '';
    const [target, key] = walk(path);
    return target[key];
  };
  const set = (path, value) => {
    const fix = fixPath(path);
    if (fix) {
      const rule = form.rules[Number(fix[1])];
      rule.fix = value ? { action: value, label: rule.fix?.label || '', param: rule.fix?.param || '', value: rule.fix?.value || '', target: rule.fix?.target || RULEPACK.blankSelector() } : null;
      return;
    }
    const [target, key] = walk(path);
    target[key] = value;
  };

  const field = (label, control, hint = '') => `<label class="pe-field"><span>${label}</span>${control}${hint ? `<small>${hint}</small>` : ''}</label>`;
  const text = (path, { placeholder = '', max = 200, type = 'text' } = {}) =>
    `<input class="form-control" type="${type}" data-bind="${path}" maxlength="${max}" placeholder="${esc(placeholder)}" value="${esc(get(path))}" autocomplete="off" spellcheck="false" />`;
  const area = (path, { max = 400 } = {}) => `<textarea class="form-control" data-bind="${path}" maxlength="${max}" rows="2">${esc(get(path))}</textarea>`;
  const select = (path, options, { rerender = false } = {}) =>
    `<select class="form-control" data-bind="${path}"${rerender ? ' data-rerender' : ''}>${options.map(([value, label]) => `<option value="${esc(value)}"${String(get(path)) === String(value) ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select>`;
  const check = (path, label) => `<label class="pe-check"><input type="checkbox" data-bind="${path}" data-bool data-rerender${get(path) ? ' checked' : ''} /> ${label}</label>`;

  const selectorHtml = (path, { position = false } = {}) => {
    const sel = get(path);
    const roles = RULEPACK.roleNames(ADVICE).map(r => [r, r]);
    const effects = ADVICE.effects.map(fx => fx.name).sort().map(n => [n, n]);
    return `<div class="pe-selector">
      <div class="pe-row">${select(`${path}.kind`, [['role', 'Any effect with the role'], ['effect', 'This effect']], { rerender: true })}
        ${select(`${path}.value`, sel.kind === 'effect' ? effects : roles)}</div>
      ${check(`${path}.paramOn`, 'only if a parameter matches')}
      ${sel.paramOn ? `<div class="pe-row">${text(`${path}.pname`, { placeholder: 'Parameter, e.g. GAIN', max: 40 })}
        ${select(`${path}.op`, ['<', '<=', '>', '>=', '==', '!='].map(o => [o, o]))}
        ${text(`${path}.pvalue`, { placeholder: 'Value', max: 40 })}</div>` : ''}
      ${position ? field('Position in the chain', select(`${path}.position`, [['', 'Anywhere'], ['first', 'First effect that is on'], ['last', 'Last effect that is on']])) : ''}
    </div>`;
  };

  const sourcesHtml = () => `<section class="pe-section"><h3>Sources</h3>
    <p class="field-hint">Every rule must cite at least one source: a page that explains the advice.</p>
    ${form.sources.map((src, i) => `<div class="pe-source">
      ${text(`sources.${i}.title`, { placeholder: 'Title of the page', max: 120 })}
      ${text(`sources.${i}.url`, { placeholder: 'https://…', max: 300, type: 'url' })}
      <button class="btn btn-sm btn-invisible btn-danger" data-act="remove-source" data-i="${i}" aria-label="Remove source ${i + 1}">Remove</button>
    </div>`).join('')}
    <button class="btn btn-sm" data-act="add-source">+ Add source</button></section>`;

  const ruleHtml = (r, i) => `<details class="pe-rule" data-rule="${i}"${openRules.has(i) ? ' open' : ''}>
      <summary><span class="pe-rule-title">${esc(r.title || 'New rule')}</span> <span class="Label">${esc(r.severity)}</span></summary>
      <div class="pe-rule-body">
        ${field('Title', text(`rules.${i}.title`, { max: 80, placeholder: 'Compressor after a drive' }))}
        <div class="pe-row">
          ${field('Level', select(`rules.${i}.severity`, [['tip', 'Tip'], ['warning', 'Warning']]))}
          ${field('Topic (optional)', text(`rules.${i}.topic`, { max: 24, placeholder: 'order' }))}
        </div>
        ${field('Why (shown under "Why")', area(`rules.${i}.why`))}
        ${field('Message', text(`rules.${i}.message`, { max: 200, placeholder: '{effect} comes after a drive.' }), 'Use {effect} for the effect names and {count} for how many.')}
        <fieldset class="pe-fieldset"><legend>Sources cited</legend>${form.sources.filter(s => s.key).map(src => `<label class="pe-check"><input type="checkbox" data-cite="${i}" data-key="${esc(src.key)}"${r.sources.includes(src.key) ? ' checked' : ''} /> ${esc(src.title || src.url || src.key)}</label>`).join('') || '<small>Add a source above first.</small>'}</fieldset>
        <fieldset class="pe-fieldset"><legend>When does it apply?</legend>
          ${field('Fires', select(`rules.${i}.mode`, [['each', 'For each matching effect'], ['once', 'Once, when enough effects match'], ['absent', 'When no effect matches']], { rerender: true }))}
          ${r.mode === 'once' ? field('At least how many', text(`rules.${i}.min`, { type: 'number', max: 1 })) : ''}
          <div class="pe-sub"><b>Effects that are on and…</b>${selectorHtml(`rules.${i}.match`, { position: true })}</div>
          ${['after', 'before'].map(side => r[side]
            ? `<div class="pe-sub"><b>…come ${side} an effect like:</b>${selectorHtml(`rules.${i}.${side}`)}<button class="btn btn-sm btn-invisible" data-act="drop-side" data-i="${i}" data-side="${side}">Remove this condition</button></div>`
            : `<button class="btn btn-sm btn-invisible" data-act="add-side" data-i="${i}" data-side="${side}">+ Only if it comes ${side} another effect</button>`).join('')}
        </fieldset>
        ${r.mode === 'each' ? `<fieldset class="pe-fieldset"><legend>One-click fix (optional)</legend>
          ${field('Action', select(`rules.${i}.fixAction`, [['', 'None'], ['move-before', 'Move the effect before…'], ['move-after', 'Move the effect after…'], ['set', 'Set a parameter']], { rerender: true }))}
          ${r.fix?.action === 'set' ? `<div class="pe-row">${text(`rules.${i}.fix.param`, { placeholder: 'Parameter', max: 40 })}${text(`rules.${i}.fix.value`, { placeholder: 'New value', max: 40 })}</div>` : ''}
          ${r.fix && r.fix.action !== 'set' ? `<div class="pe-sub"><b>Target:</b>${selectorHtml(`rules.${i}.fix.target`)}</div>` : ''}
          ${r.fix ? field('Button text (optional)', text(`rules.${i}.fix.label`, { max: 40 })) : ''}
        </fieldset>` : ''}
        <button class="btn btn-sm btn-invisible btn-danger" data-act="remove-rule" data-i="${i}">Remove this rule</button>
      </div></details>`;

  const render = () => {
    body.innerHTML = `
      <section class="pe-section"><div class="pe-row">${field('Pack name', text('name', { max: 60, placeholder: 'My bass rules' }))}${field('Author (optional)', text('author', { max: 60 }))}</div></section>
      ${sourcesHtml()}
      <section class="pe-section"><h3>Rules</h3>${form.rules.map(ruleHtml).join('')}<button class="btn btn-sm" data-act="add-rule">+ Add rule</button></section>`;
  };

  body.addEventListener('input', event => {
    const target = event.target;
    if (target.dataset.bind === undefined || target.dataset.rerender !== undefined) return;
    set(target.dataset.bind, target.value);
    if (/^rules\.\d+\.title$/.test(target.dataset.bind)) target.closest('.pe-rule').querySelector('.pe-rule-title').textContent = target.value || 'New rule';
  });
  body.addEventListener('change', event => {
    const target = event.target;
    if (target.dataset.cite !== undefined) {
      const rule = form.rules[Number(target.dataset.cite)];
      rule.sources = target.checked ? [...new Set([...rule.sources, target.dataset.key])] : rule.sources.filter(k => k !== target.dataset.key);
      return;
    }
    if (target.dataset.bind === undefined) return;
    set(target.dataset.bind, target.dataset.bool !== undefined ? target.checked : target.value);
    if (target.dataset.rerender === undefined) return;
    if (/\.kind$/.test(target.dataset.bind)) { // switching between role and effect needs a valid first value for the new kind
      set(target.dataset.bind.replace(/\.kind$/, '.value'), target.value === 'effect' ? ADVICE.effects[0].name : RULEPACK.roleNames(ADVICE)[0]);
    }
    render();
  });
  body.addEventListener('toggle', event => {
    const index = Number(event.target.dataset?.rule);
    if (Number.isNaN(index)) return;
    if (event.target.open) openRules.add(index); else openRules.delete(index);
  }, true);
  body.addEventListener('click', event => {
    const button = event.target.closest('[data-act]');
    if (!button) return;
    const i = Number(button.dataset.i);
    switch (button.dataset.act) {
      case 'add-source': {
        let n = form.sources.length + 1;
        while (form.sources.some(s => s.key === `src${n}`)) n++;
        form.sources.push({ key: `src${n}`, title: '', url: '' });
        break;
      }
      case 'remove-source': {
        const [gone] = form.sources.splice(i, 1);
        form.rules.forEach(r => { r.sources = r.sources.filter(k => k !== gone.key); });
        break;
      }
      case 'add-rule': form.rules.push(RULEPACK.blankRule()); openRules.add(form.rules.length - 1); break;
      case 'remove-rule': form.rules.splice(i, 1); openRules = new Set(); break;
      case 'add-side': form.rules[i][button.dataset.side] = RULEPACK.blankSelector(); break;
      case 'drop-side': form.rules[i][button.dataset.side] = null; break;
      default: return;
    }
    render();
  });

  function save() {
    const raw = RULEPACK.fromForm(form);
    if (existingId) raw.id = existingId;
    const checked = RULEPACK.validate(raw, ADVICE);
    if (!checked.pack) {
      errorBox.hidden = false;
      errorBox.innerHTML = `<b>Fix this before saving:</b><ul>${checked.errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul>`;
      errorBox.scrollIntoView({ block: 'nearest' });
      return;
    }
    dialog.close();
    onSaveCallback(checked.pack);
  }
  document.getElementById('pack-editor-save').addEventListener('click', save);
  document.getElementById('pack-editor-cancel').addEventListener('click', () => dialog.close());
  document.getElementById('pack-editor-close').addEventListener('click', () => dialog.close());

  function open(pack, onSave) {
    form = pack ? RULEPACK.toForm(JSON.parse(JSON.stringify(pack))) : RULEPACK.blankForm();
    if (!pack) form.sources[0].key = 'src1';
    existingId = pack ? pack.id : null;
    onSaveCallback = onSave;
    openRules = new Set([0]);
    errorBox.hidden = true;
    document.getElementById('pack-editor-title').textContent = pack ? `Edit "${pack.name}"` : 'New rule pack';
    render();
    dialog.showModal();
  }

  return { open };
})();
