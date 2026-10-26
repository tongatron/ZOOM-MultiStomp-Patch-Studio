// Pedal over USB page (experimental): connects with Web MIDI (pedal-midi.js), identifies the pedal and reads
// the current patch or a patch memory. Read-only: nothing is written to the pedal.
(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const NO_MIDI = 'This browser has no Web MIDI. Use Chrome or Edge on a computer.';
  const lines = [];
  let info = null; // { count, size, bankSize } from the pedal
  let lastPatch = null; // { name, bytes }

  const showLog = () => { $('#usb-log').textContent = lines.join('\n'); };
  PEDALMIDI.onLog((dir, bytes) => {
    const text = PEDALMIDI.hex(bytes);
    lines.push(`${new Date().toISOString().slice(11, 23)} ${dir === 'out' ? '→' : '←'} ${bytes.length} B  ${text.length > 600 ? `${text.slice(0, 600)} …` : text}`);
    showLog();
  });
  const note = text => { lines.push(`   ${text}`); showLog(); };
  const status = (text, kind = '') => { $('#usb-status').textContent = text; $('#usb-status').dataset.kind = kind; };
  const setConnected = on => {
    $('#usb-connect').disabled = on;
    $('#usb-disconnect').disabled = !on;
    $('#usb-current').disabled = !on;
    $('#usb-read-memory').disabled = !on || !info;
  };

  // Runs one step; a failure shows in the status line and the log
  async function step(label, fn) {
    status(`${label}…`);
    try { return { ok: true, value: await fn() }; } catch (error) {
      status(error.message, 'danger');
      note(`${label} failed: ${error.message}`);
      return { ok: false, value: null };
    }
  }

  async function listPorts() {
    const { inputs, outputs } = await PEDALMIDI.ports();
    const options = list => list.map(p => `<option value="${escapeHtml(p.id)}"${/zoom/i.test(p.name) ? ' selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
    $('#usb-in').innerHTML = options(inputs);
    $('#usb-out').innerHTML = options(outputs);
    $('#usb-ports').hidden = inputs.length + outputs.length === 0;
  }

  $('#usb-connect').addEventListener('click', async () => {
    if (!PEDALMIDI.supported()) { status(NO_MIDI, 'danger'); return; }
    if (!(await step('Asking for MIDI access', listPorts)).ok) return;
    const ports = await step('Connecting', () => PEDALMIDI.connect($('#usb-in').value, $('#usb-out').value));
    if (!ports.ok) return;
    note(`Ports: ${ports.value.input} / ${ports.value.output}`);
    const facts = [['MIDI port', ports.value.output]];
    const id = await step('Identifying the pedal', PEDALMIDI.identify);
    if (id.ok) facts.push(['Model byte', `0x${id.value.device.toString(16)}`], ['Firmware', id.value.version || '—']);
    const editor = await step('Editor mode', PEDALMIDI.editorOn);
    if (editor.ok) {
      const memory = await step('Reading the patch memory size', PEDALMIDI.patchInfo);
      info = memory.value;
      if (info) {
        facts.push(['Patch memories', info.count], ['Patch size', `${info.size} bytes`], ['Patches per bank', info.bankSize]);
        $('#usb-memory').max = info.count;
      }
    }
    $('#usb-facts').innerHTML = facts.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('');
    setConnected(true);
    if (id.ok && info) status('Connected', 'ok');
  });

  async function disconnect() {
    try { await PEDALMIDI.editorOff(); } catch {}
    PEDALMIDI.disconnect();
    info = null;
    setConnected(false);
    status('Not connected');
  }
  $('#usb-disconnect').addEventListener('click', disconnect);
  window.addEventListener('pagehide', () => { PEDALMIDI.editorOff().catch(() => {}); });

  // Decoded PTCF → builder patch: { name, effects: [{ index, on, values }] }
  function toPatch(decoded) {
    const effects = decoded.effects.flatMap(e => {
      const index = EFFECTS_DATA.findIndex(fx => fx[0] === e.effect);
      if (index === -1) return [];
      const values = Object.fromEntries(Object.entries(e.params).map(([n, v]) => [n, v && typeof v === 'object' ? v.raw : v]));
      return [{ index, on: e.on, values }];
    });
    return { name: decoded.name.replace(/[^!%&'+,\-.=_ A-Za-z0-9]/g, '').trim() || 'PEDAL', effects };
  }

  function showPatch(label, result) {
    lastPatch = null;
    if (!result) { $('#usb-patch').innerHTML = `<p class="usb-empty">${escapeHtml(label)}: the pedal sent no patch data.</p>`; return; }
    let decoded;
    try { decoded = ZPTC.decode(result.data); } catch (error) {
      note(`Decode failed: ${error.message}`);
      $('#usb-patch').innerHTML = `<p class="usb-empty">${escapeHtml(label)}: ${result.data.length} bytes received${result.crcOk ? '' : ' (checksum mismatch)'}, but they are not a patch this site can read (${escapeHtml(error.message)}).</p>`;
      return;
    }
    const patch = toPatch(decoded);
    lastPatch = { name: patch.name, bytes: result.data };
    note(`${label}: ${result.data.length} bytes, checksum ${result.crcOk ? 'OK' : 'MISMATCH'}, ${decoded.effects.length} effects`);
    $('#usb-patch').innerHTML = `<div class="usb-patch">
      <div class="usb-patch-head"><strong>${escapeHtml(decoded.name || '(no name)')}</strong><span>${escapeHtml(label)} · DSP ${decoded.dspTotal.toFixed(1)}% · ${result.crcOk ? 'checksum OK' : 'checksum mismatch'}</span></div>
      <ol class="usb-chain">${decoded.effects.map(e => `<li><b>${escapeHtml(e.effect)}</b> <span>${e.on ? 'ON' : 'OFF'}</span></li>`).join('')}</ol>
      <div class="usb-row">
        <a class="btn btn-sm btn-primary" href="${PATCHLINK.url(patch)}">Open in builder</a>
        <button class="btn btn-sm" id="usb-save">Download .zptc</button>
      </div>
    </div>`;
  }

  $('#usb-current').addEventListener('click', async () => {
    const result = await step('Reading the current patch', PEDALMIDI.readCurrent);
    if (result.ok) { showPatch('Current patch', result.value); status('Connected', 'ok'); }
  });
  $('#usb-read-memory').addEventListener('click', async () => {
    const number = Number($('#usb-memory').value);
    if (!info || !Number.isInteger(number) || number < 1 || number > info.count) { status(`Choose a memory from 1 to ${info?.count ?? '?'}.`, 'danger'); return; }
    const result = await step(`Reading memory ${number}`, () => PEDALMIDI.readMemory(number, info));
    if (result.ok) { showPatch(`Memory ${number}`, result.value); status('Connected', 'ok'); }
  });
  $('#usb-patch').addEventListener('click', event => {
    if (event.target.id !== 'usb-save' || !lastPatch) return;
    const url = URL.createObjectURL(new Blob([lastPatch.bytes], { type: 'application/octet-stream' }));
    Object.assign(document.createElement('a'), { href: url, download: `${lastPatch.name}.zptc` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $('#usb-copy-log').addEventListener('click', () => navigator.clipboard?.writeText($('#usb-log').textContent).then(() => status('Log copied', 'ok')));
  $('#usb-clear-log').addEventListener('click', () => { lines.length = 0; showLog(); });
  if (!PEDALMIDI.supported()) status(NO_MIDI, 'danger');
})();
