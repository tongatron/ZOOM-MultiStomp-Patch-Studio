// Beta pedal audition player for the MS-60B+ builder.
// It deliberately uses the computer's normal audio output. USB is handled separately by Live mode:
// the browser cannot verify the analog cable or hear the pedal's output.
(() => {
  const $ = selector => document.querySelector(selector);
  const panel = $('#audition-mode');
  if (!panel) return;

  const loops = [
    {
      id: 'low-notes', label: 'Low notes · 70 BPM', bpm: 70, bars: 2,
      notes: [[0, 35, 1.65, .9], [2, 40, 1.65, .75], [4, 38, 1.65, .8], [6, 35, 1.65, .9]]
    },
    {
      id: 'finger-groove', label: 'Finger groove · 96 BPM', bpm: 96, bars: 4,
      notes: [[0, 40, .42, .85], [.75, 40, .35, .62], [1.5, 43, .42, .72], [2.25, 40, .35, .62],
        [4, 38, .42, .8], [4.75, 38, .35, .58], [5.5, 40, .42, .72], [6.25, 43, .35, .64],
        [8, 40, .42, .85], [8.75, 40, .35, .62], [9.5, 45, .42, .75], [10.25, 43, .35, .62],
        [12, 38, .42, .8], [12.75, 40, .35, .62], [13.5, 38, .42, .72], [14.5, 35, .7, .82]]
    },
    {
      id: 'chromatic-attack', label: 'Chromatic attack · 120 BPM', bpm: 120, bars: 2,
      notes: [[0, 35, .32, .75], [.5, 36, .32, .65], [1, 37, .32, .7], [1.5, 38, .32, .7],
        [2, 39, .32, .75], [2.5, 40, .32, .7], [3, 41, .32, .7], [3.5, 42, .32, .72],
        [4, 43, .32, .78], [4.5, 42, .32, .68], [5, 41, .32, .68], [5.5, 40, .32, .7],
        [6, 38, .32, .72], [6.5, 37, .32, .66], [7, 36, .32, .66], [7.5, 35, .6, .8]]
    },
    {
      id: 'slap-pulse', label: 'Muted pulse · 110 BPM', bpm: 110, bars: 2,
      notes: [[0, 35, .22, .9], [.75, 35, .18, .42], [1.5, 42, .22, .72], [2.25, 35, .18, .44],
        [3, 38, .22, .7], [3.75, 35, .18, .42], [4.5, 35, .22, .82], [5.25, 40, .18, .5],
        [6, 42, .22, .72], [6.75, 35, .55, .75]]
    }
  ];
  const loopById = id => loops.find(loop => loop.id === id) || loops[0];
  const engine = {
    access: false,
    context: null,
    master: null,
    source: null,
    nodes: new Set(),
    fileBuffer: null,
    fileName: '',
    playing: false,
    loopId: loops[0].id,
    volumeDb: -18,
    generation: 0,
    nextCycle: 0,
    scheduleTimer: 0
  };

  const state = $('#audition-state');
  const play = $('#audition-play');
  const stopButton = $('#audition-stop');
  const loopSelect = $('#audition-loop');
  const volume = $('#audition-volume');
  const volumeValue = $('#audition-volume-value');
  const fileInput = $('#audition-file');
  const fileName = $('#audition-file-name');

  loopSelect.innerHTML = loops.map(loop => `<option value="${loop.id}">${loop.label}</option>`).join('');

  const dbToGain = db => Math.pow(10, Number(db) / 20);
  const setState = (text, kind = '') => {
    state.textContent = text;
    state.dataset.kind = kind;
  };
  const updateVolumeLabel = () => { volumeValue.value = `${volume.value} dB`; volumeValue.textContent = `${Number(volume.value) < 0 ? '−' : ''}${Math.abs(Number(volume.value))} dB`; };
  const setMasterGain = (when = 0) => {
    if (!engine.master || !engine.context) return;
    const time = Math.max(engine.context.currentTime, when);
    engine.master.gain.cancelScheduledValues(time);
    engine.master.gain.setTargetAtTime(dbToGain(engine.volumeDb), time, .015);
  };

  function ensureContext() {
    if (engine.context) return engine.context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('This browser has no Web Audio support.');
    engine.context = new AudioContextClass();
    engine.master = engine.context.createGain();
    engine.master.gain.value = dbToGain(engine.volumeDb);
    engine.master.connect(engine.context.destination);
    return engine.context;
  }

  const midiToHz = midi => 440 * Math.pow(2, (midi - 69) / 12);
  const rememberNode = node => {
    engine.nodes.add(node);
    node.addEventListener?.('ended', () => engine.nodes.delete(node));
    return node;
  };

  function scheduleNote(start, midi, duration, velocity) {
    const ctx = engine.context;
    const end = start + duration;
    const releaseEnd = end + .12;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, start);
    filter.frequency.exponentialRampToValueAtTime(620, Math.min(end, start + .18));
    filter.Q.value = .65;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.02, velocity * .22), start + .012);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.012, velocity * .12), Math.min(end, start + .16));
    envelope.gain.setTargetAtTime(.0001, end, .055);
    filter.connect(envelope).connect(engine.master);

    const fundamental = rememberNode(ctx.createOscillator());
    fundamental.type = 'sawtooth';
    fundamental.frequency.setValueAtTime(midiToHz(midi), start);
    fundamental.detune.value = -2;
    fundamental.connect(filter);
    const body = rememberNode(ctx.createOscillator());
    body.type = 'sine';
    body.frequency.setValueAtTime(midiToHz(midi) / 2, start);
    body.connect(filter);
    fundamental.start(start);
    body.start(start);
    fundamental.stop(releaseEnd);
    body.stop(releaseEnd);
  }

  function scheduleCycle(loop, start) {
    const beat = 60 / loop.bpm;
    for (const [offset, midi, duration, velocity] of loop.notes) scheduleNote(start + offset * beat, midi, duration * beat, velocity);
  }

  function scheduleSynthLoop(token) {
    const loop = loopById(engine.loopId);
    const duration = loop.bars * 4 * 60 / loop.bpm;
    const horizon = .35;
    const tick = () => {
      if (!engine.playing || token !== engine.generation || !engine.context) return;
      const until = engine.context.currentTime + horizon;
      while (engine.nextCycle < until) {
        scheduleCycle(loop, engine.nextCycle);
        engine.nextCycle += duration;
      }
      engine.scheduleTimer = window.setTimeout(tick, 100);
    };
    tick();
  }

  function stopNodes(now) {
    if (engine.source) {
      try { engine.source.stop(now + .02); } catch {}
      engine.source.disconnect();
      engine.source = null;
    }
    for (const node of engine.nodes) {
      try { node.stop(now + .02); } catch {}
    }
    engine.nodes.clear();
  }

  function stop() {
    engine.generation++;
    engine.playing = false;
    window.clearTimeout(engine.scheduleTimer);
    engine.scheduleTimer = 0;
    if (engine.context) {
      const now = engine.context.currentTime;
      if (engine.master) {
        engine.master.gain.cancelScheduledValues(now);
        engine.master.gain.setTargetAtTime(.0001, now, .012);
      }
      stopNodes(now);
    }
    play.disabled = false;
    stopButton.disabled = true;
    setState('Stopped');
  }

  async function playLoop() {
    try {
      const ctx = ensureContext();
      await ctx.resume();
      stop();
      engine.playing = true;
      engine.generation++;
      const token = engine.generation;
      setMasterGain(ctx.currentTime);
      if (engine.fileBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = engine.fileBuffer;
        source.loop = true;
        source.connect(engine.master);
        source.start();
        engine.source = source;
      } else {
        engine.nextCycle = ctx.currentTime + .04;
        scheduleSynthLoop(token);
      }
      play.disabled = true;
      stopButton.disabled = false;
      setState(engine.fileBuffer ? `Playing: ${engine.fileName}` : `Playing: ${loopById(engine.loopId).label}`, 'playing');
    } catch (error) {
      stop();
      setState(error.message, 'error');
    }
  }

  async function loadFile(file) {
    if (!file) return;
    try {
      stop();
      const ctx = ensureContext();
      engine.fileBuffer = await ctx.decodeAudioData(await file.arrayBuffer());
      engine.fileName = file.name;
      fileName.textContent = `Local file: ${file.name}`;
      setState('Local file loaded');
    } catch (error) {
      engine.fileBuffer = null;
      engine.fileName = '';
      fileName.textContent = 'Built-in reference loop';
      setState(`Audio file error: ${error.message}`, 'error');
    }
  }

  function setAccess(allowed) {
    engine.access = !!allowed;
    panel.hidden = !engine.access;
    if (!engine.access) stop();
  }

  loopSelect.addEventListener('change', () => {
    engine.loopId = loopSelect.value;
    engine.fileBuffer = null;
    engine.fileName = '';
    fileName.textContent = 'Built-in reference loop';
    if (engine.playing) playLoop();
  });
  volume.addEventListener('input', () => {
    engine.volumeDb = Number(volume.value);
    updateVolumeLabel();
    setMasterGain();
  });
  play.addEventListener('click', playLoop);
  stopButton.addEventListener('click', stop);
  fileInput.addEventListener('change', () => { const file = fileInput.files?.[0]; fileInput.value = ''; loadFile(file); });
  window.addEventListener('pagehide', stop);

  window.PEDALAUDITION = { setAccess, stop };
  loopSelect.value = engine.loopId;
  updateVolumeLabel();
})();
