// Loop tools of the MS-90LP+ (loop-tools.html): loop length, tempo for a length, tap tempo with a metronome and a song
// planner. Nothing here talks to the pedal. The limits come from the manual (loop-data.js): tempo 40–300, 90 minutes for
// one loop. The song plan is kept in this browser only (localStorage ms90lp-song-plan); every storage access is guarded.
(() => {
  const $ = id => document.getElementById(id);
  const esc = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TEMPO_MIN = 40, TEMPO_MAX = 300, LOOP_MAX_SECONDS = 90 * 60;
  const PLAN_KEY = 'ms90lp-song-plan';
  // The time signatures of the rhythm patterns (all in quarter notes); METRONOME (63) has none in the manual
  const SIGNATURES = [...new Set(RHYTHMS.map(r => r[2]).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));
  const beatsPerBar = sig => parseInt(sig, 10) || 4;
  const seconds = (tempo, sig, bars) => bars * beatsPerBar(sig) * 60 / tempo;
  const number = (value, digits = 1) => Number(value).toFixed(digits);
  // 16 → "0:16.0", 4000 → "1:06:40.0"
  function clock(total) {
    const tenths = Math.round(total * 10);
    const h = Math.floor(tenths / 36000), m = Math.floor(tenths / 600) % 60, s = (tenths % 600) / 10;
    const ss = s.toFixed(1).padStart(4, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
  }
  // "1:30", "90", "1:02:03" → seconds; null when it cannot be read
  function parseLength(text) {
    const parts = String(text).trim().split(':');
    if (!parts.length || parts.length > 3 || parts.some(p => !/^\d+([.,]\d+)?$/.test(p.trim()))) return null;
    return parts.map(p => Number(p.trim().replace(',', '.'))).reduce((total, p) => total * 60 + p, 0);
  }
  const inRange = tempo => tempo >= TEMPO_MIN && tempo <= TEMPO_MAX;
  const fillSignatures = select => { select.innerHTML = SIGNATURES.map(s => `<option${s === '4/4' ? ' selected' : ''}>${esc(s)}</option>`).join(''); };
  ['len-sig', 'fit-sig', 'met-sig'].forEach(id => fillSignatures($(id)));
  const result = (el, html, warning = false) => { el.innerHTML = html; el.classList.toggle('is-warning', warning); };

  // ---- loop length ------------------------------------------------------------------------------------------------
  function showLength() {
    const tempo = Number($('len-tempo').value), sig = $('len-sig').value, bars = Math.round(Number($('len-bars').value));
    if (!(tempo > 0) || !(bars > 0)) return result($('len-result'), 'Enter a tempo and a number of bars.', true);
    const total = seconds(tempo, sig, bars);
    const notes = [];
    if (!inRange(tempo)) notes.push(`The pedal sets tempos from ${TEMPO_MIN} to ${TEMPO_MAX}.`);
    if (total > LOOP_MAX_SECONDS) notes.push('That is longer than the 90 minutes one loop can hold.');
    result($('len-result'), `${bars} ${bars === 1 ? 'bar' : 'bars'} of ${esc(sig)} at ${number(tempo, tempo % 1 ? 1 : 0)} BPM last <b>${clock(total)}</b> (${number(total)} seconds, ${bars * beatsPerBar(sig)} beats): ${number(total / LOOP_MAX_SECONDS * 100, 2)}% of the 90 minutes of one loop.${notes.length ? ` ${notes.join(' ')}` : ''}`, notes.length > 0);
  }
  ['len-tempo', 'len-sig', 'len-bars'].forEach(id => $(id).addEventListener('input', showLength));

  // ---- tempo for a length -----------------------------------------------------------------------------------------
  function showFit() {
    const length = parseLength($('fit-length').value), sig = $('fit-sig').value, bars = Math.round(Number($('fit-bars').value));
    if (!(length > 0)) return result($('fit-result'), 'Write the length in seconds (40) or as minutes:seconds (0:40).', true);
    if (!(bars > 0)) return result($('fit-result'), 'Enter a number of bars.', true);
    const tempo = bars * beatsPerBar(sig) * 60 / length;
    let text = `${bars} ${bars === 1 ? 'bar' : 'bars'} of ${esc(sig)} last ${clock(length)} at <b>${number(tempo)} BPM</b>.`;
    if (!inRange(tempo)) {
      // The same length with twice or half the bars halves or doubles the tempo: find a count that fits the pedal's range
      let fit = bars;
      while (fit * beatsPerBar(sig) * 60 / length < TEMPO_MIN && fit < 9999) fit *= 2;
      while (fit * beatsPerBar(sig) * 60 / length > TEMPO_MAX && fit > 1) fit = Math.max(1, Math.round(fit / 2));
      const other = fit * beatsPerBar(sig) * 60 / length;
      text += ` The pedal sets tempos from ${TEMPO_MIN} to ${TEMPO_MAX}${fit !== bars && inRange(other) ? `: with ${fit} bars the tempo is ${number(other)} BPM` : ''}.`;
    }
    if (length > LOOP_MAX_SECONDS) text += ' That is longer than the 90 minutes one loop can hold.';
    result($('fit-result'), text, !inRange(tempo) || length > LOOP_MAX_SECONDS);
  }
  ['fit-length', 'fit-sig', 'fit-bars'].forEach(id => $(id).addEventListener('input', showFit));

  // ---- tap tempo ----------------------------------------------------------------------------------------------------
  let taps = [], tapped = null;
  function tap() {
    const now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
    taps = [...taps, now].slice(-9); // the last 8 intervals
    if (taps.length < 2) { $('tap-bpm').textContent = 'Tap again'; return; }
    const interval = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
    tapped = Math.round(60000 / interval * 10) / 10;
    $('tap-bpm').textContent = `${number(tapped)} BPM`;
    $('tap-use').disabled = !inRange(tapped);
    $('tap-use').title = inRange(tapped) ? 'Put this tempo in Loop length and in the metronome' : `The pedal sets tempos from ${TEMPO_MIN} to ${TEMPO_MAX}`;
  }
  $('tap').addEventListener('click', tap);
  document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() !== 't' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest('input, select, textarea, [contenteditable]')) return;
    event.preventDefault();
    tap();
  });
  $('tap-use').addEventListener('click', () => {
    if (tapped === null) return;
    const tempo = String(Math.round(tapped));
    $('len-tempo').value = tempo;
    $('met-tempo').value = tempo;
    showLength();
    if (metronome.running) metronome.restart();
  });

  // ---- metronome (Web Audio clicks scheduled a little ahead, so they keep time while the page is busy) --------------
  const metronome = {
    running: false, context: null, timer: null, next: 0, beat: 0,
    tempo() { const t = Number($('met-tempo').value); return inRange(t) ? t : Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, t || 120)); },
    beats() { return beatsPerBar($('met-sig').value); },
    drawBeats() { $('met-beats').innerHTML = Array.from({ length: this.beats() }, (_, i) => `<span${i === 0 ? ' class="is-first"' : ''}></span>`).join(''); },
    click(at, beat) {
      const osc = this.context.createOscillator(), gain = this.context.createGain();
      osc.frequency.value = beat === 0 ? 1600 : 1000;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.4, at + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
      osc.connect(gain).connect(this.context.destination);
      osc.start(at);
      osc.stop(at + 0.07);
      setTimeout(() => {
        if (!this.running) return;
        [...$('met-beats').children].forEach((dot, i) => dot.classList.toggle('is-on', i === beat));
      }, Math.max(0, (at - this.context.currentTime) * 1000));
    },
    schedule() {
      while (this.next < this.context.currentTime + 0.12) {
        if (this.beat >= this.beats()) this.beat = 0;
        this.click(this.next, this.beat);
        this.next += 60 / this.tempo();
        this.beat = (this.beat + 1) % this.beats();
      }
    },
    start() {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) { DIALOGS.alert({ title: 'No sound', text: 'This browser cannot play the metronome (no Web Audio).' }); return; }
      this.context = this.context || new Context();
      this.context.resume();
      this.running = true;
      this.beat = 0;
      this.next = this.context.currentTime + 0.05;
      this.drawBeats();
      this.timer = setInterval(() => this.schedule(), 25);
      this.schedule();
      $('met-toggle').textContent = 'Stop';
      $('met-toggle').setAttribute('aria-pressed', 'true');
    },
    stop() {
      this.running = false;
      clearInterval(this.timer);
      [...$('met-beats').children].forEach(dot => dot.classList.remove('is-on'));
      $('met-toggle').textContent = 'Start';
      $('met-toggle').setAttribute('aria-pressed', 'false');
    },
    restart() { this.stop(); this.start(); }
  };
  metronome.drawBeats();
  $('met-toggle').addEventListener('click', () => (metronome.running ? metronome.stop() : metronome.start()));
  $('met-sig').addEventListener('change', () => { metronome.drawBeats(); metronome.beat = 0; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && metronome.running) metronome.stop(); });

  // ---- song planner -------------------------------------------------------------------------------------------------
  const rhythmByNumber = new Map(RHYTHMS.map(r => [r[0], r]));
  const FX_NAMES = LOOP_FX.map(([name]) => name).filter(name => name !== 'TAP TEMPO'); // TAP TEMPO sets the tempo, it changes no sound
  const newPart = (from = {}) => ({ name: '', rhythm: 0, tempo: from.tempo || 120, sig: from.sig || '4/4', bars: 8, fx: '' });
  function readPlan() {
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_KEY));
      if (saved && Array.isArray(saved.parts)) return { title: String(saved.title || '').slice(0, 60), parts: saved.parts.slice(0, 50).map(p => ({ ...newPart(), ...p })) };
    } catch {}
    return { title: '', parts: [{ ...newPart(), name: 'Intro' }, { ...newPart(), name: 'Verse', bars: 16 }, { ...newPart(), name: 'Chorus' }] };
  }
  let plan = readPlan();
  const savePlan = () => { try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch {} };
  const partSig = part => (part.rhythm && rhythmByNumber.get(part.rhythm)?.[2]) || part.sig || '4/4';
  const partSeconds = part => (part.tempo > 0 && part.bars > 0 ? seconds(part.tempo, partSig(part), part.bars) : 0);
  const rhythmOptions = selected => `<option value="0"${selected ? '' : ' selected'}>No rhythm</option>` + RHYTHMS.map(([n, name, sig]) =>
    `<option value="${n}"${n === selected ? ' selected' : ''}>${n} ${esc(name)}${sig ? ` (${esc(sig)})` : ''}</option>`).join('');
  const fxOptions = selected => `<option value=""${selected ? '' : ' selected'}>No loop effect</option>` + FX_NAMES.map(name =>
    `<option${name === selected ? ' selected' : ''}>${esc(name)}</option>`).join('');
  const sigOptions = selected => SIGNATURES.map(s => `<option${s === selected ? ' selected' : ''}>${esc(s)}</option>`).join('');

  function renderPlan() {
    $('plan-title').value = plan.title;
    $('plan-print-title').textContent = plan.title || 'Song plan';
    $('plan-parts').innerHTML = plan.parts.length ? plan.parts.map((part, i) => {
      const fixedSig = part.rhythm && rhythmByNumber.get(part.rhythm)?.[2];
      return `<li class="lt-part" data-i="${i}">
        <label>Part <input class="form-control form-control--sm lt-name" data-field="name" type="text" maxlength="30" value="${esc(part.name)}" placeholder="Part ${i + 1}" /></label>
        <label>Rhythm <select class="form-control form-control--sm lt-rhythm" data-field="rhythm">${rhythmOptions(part.rhythm)}</select></label>
        <label>Time sig. ${fixedSig ? `<input class="form-control form-control--sm" type="text" value="${esc(fixedSig)}" readonly title="The time signature of the rhythm pattern" />` : `<select class="form-control form-control--sm" data-field="sig">${sigOptions(part.sig)}</select>`}</label>
        <span class="lt-break" aria-hidden="true"></span>
        <label>Tempo <input class="form-control form-control--sm" data-field="tempo" type="number" min="${TEMPO_MIN}" max="${TEMPO_MAX}" step="1" value="${esc(part.tempo)}" /></label>
        <label>Bars <input class="form-control form-control--sm" data-field="bars" type="number" min="1" max="9999" step="1" value="${esc(part.bars)}" /></label>
        <label>Loop effect <select class="form-control form-control--sm lt-fx" data-field="fx">${fxOptions(part.fx)}</select></label>
        <output data-length>${clock(partSeconds(part))}</output>
        <span class="lt-tools">
          <button class="btn btn-sm" type="button" data-act="up" aria-label="Move part ${i + 1} up" title="Move up"${i === 0 ? ' disabled' : ''}>↑</button>
          <button class="btn btn-sm" type="button" data-act="down" aria-label="Move part ${i + 1} down" title="Move down"${i === plan.parts.length - 1 ? ' disabled' : ''}>↓</button>
          <button class="btn btn-sm" type="button" data-act="delete" aria-label="Delete part ${i + 1}" title="Delete">✕</button>
        </span>
      </li>`;
    }).join('') : '<li class="lt-empty">No parts yet: press <b>Add a part</b>.</li>';
    showTotal();
  }
  function showTotal() {
    const total = plan.parts.reduce((sum, part) => sum + partSeconds(part), 0);
    const long = plan.parts.filter(part => partSeconds(part) > LOOP_MAX_SECONDS).length;
    const outside = plan.parts.filter(part => part.tempo && !inRange(part.tempo)).length;
    const notes = [long && `${long} ${long === 1 ? 'part is' : 'parts are'} longer than the 90 minutes of one loop.`, outside && `${outside} ${outside === 1 ? 'part has a tempo' : 'parts have tempos'} outside ${TEMPO_MIN}–${TEMPO_MAX}.`].filter(Boolean);
    result($('plan-total'), `${plan.parts.length} ${plan.parts.length === 1 ? 'part' : 'parts'}, <b>${clock(total)}</b> in all.${notes.length ? ` ${notes.join(' ')}` : ''}`, notes.length > 0);
  }
  $('plan-parts').addEventListener('input', event => {
    const field = event.target.dataset.field, row = event.target.closest('.lt-part');
    if (!field || !row) return;
    const i = Number(row.dataset.i), part = plan.parts[i];
    part[field] = ['rhythm', 'tempo', 'bars'].includes(field) ? Number(event.target.value) : event.target.value;
    savePlan();
    if (field === 'rhythm') { // the time signature may now come from the rhythm
      renderPlan();
      $('plan-parts').querySelector(`[data-i="${i}"] [data-field="rhythm"]`)?.focus();
      return;
    }
    row.querySelector('[data-length]').textContent = clock(partSeconds(part));
    showTotal();
  });
  $('plan-parts').addEventListener('click', event => {
    const button = event.target.closest('button[data-act]');
    if (!button) return;
    const i = Number(button.closest('.lt-part').dataset.i);
    if (button.dataset.act === 'delete') {
      const [removed] = plan.parts.splice(i, 1);
      savePlan();
      renderPlan();
      DIALOGS.toast(`Deleted ${removed.name || `part ${i + 1}`}.`, { action: 'Undo', onAction: () => { plan.parts.splice(i, 0, removed); savePlan(); renderPlan(); } });
      return;
    }
    const j = button.dataset.act === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= plan.parts.length) return;
    [plan.parts[i], plan.parts[j]] = [plan.parts[j], plan.parts[i]];
    savePlan();
    renderPlan();
    $('plan-parts').querySelector(`[data-i="${j}"] [data-act="${button.dataset.act}"]:not(:disabled)`)?.focus();
  });
  $('plan-title').addEventListener('input', () => { plan.title = $('plan-title').value.slice(0, 60); $('plan-print-title').textContent = plan.title || 'Song plan'; savePlan(); });
  $('plan-add').addEventListener('click', () => {
    if (plan.parts.length >= 50) { DIALOGS.toast('A plan holds up to 50 parts.'); return; }
    plan.parts.push(newPart(plan.parts[plan.parts.length - 1]));
    savePlan();
    renderPlan();
    $('plan-parts').querySelector(`[data-i="${plan.parts.length - 1}"] [data-field="name"]`)?.focus();
  });
  $('plan-print').addEventListener('click', () => window.print());
  $('plan-clear').addEventListener('click', async () => {
    if (!plan.parts.length && !plan.title) return;
    const ok = await DIALOGS.confirm({ title: 'Clear the plan?', text: `This removes the song title and its ${plan.parts.length} ${plan.parts.length === 1 ? 'part' : 'parts'} from this browser.`, ok: 'Clear', danger: true });
    if (!ok) return;
    plan = { title: '', parts: [] };
    savePlan();
    renderPlan();
  });

  showLength();
  showFit();
  renderPlan();
  FS.toc(document.getElementById('doc'), document.getElementById('toc'));
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
})();
