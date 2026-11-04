// Advice rules and placement tips for the Zoom MS-50G+ (guitar; not tested on the pedal yet).
// Every rule cites guitar sources: the bass advice of the MS-60B+ does not carry over. Effect order is convention,
// not law: order rules are 'warning' or 'tip', never 'error'. 'error' is reserved for objective problems.
// Shapes: see advice-engine.js. After changing this file run `node tools/advice-test.mjs`.

(() => {
  ADVICE.addSources({
    bossOrder: { title: 'BOSS — Is there a perfect pedal order?', url: 'https://articles.boss.info/is-there-a-perfect-pedal-order/' },
    thomannOrder: { title: 'Thomann — Pedalboard basics: how to set up and organize your effects chain', url: 'https://www.thomannmusic.com/blog/gear/order-connect-effect-pedals/' },
    gearnews: { title: 'Gearnews — The best guitar pedal order', url: 'https://www.gearnews.com/best-guitar-pedal-order/' },
    sos: { title: 'Sound On Sound — Multi-effects explained, part 3', url: 'https://www.soundonsound.com/techniques/multi-effects-explained-part-3' },
    andertonsPitch: { title: 'Andertons — Ultimate guide to octave & pitch-shift pedals', url: 'https://www.andertons.co.uk/guitar-octave-pitch-shift-pedal-guide' },
    neuralComp: { title: 'Neural DSP — How to use a compressor pedal', url: 'https://neuraldsp.com/articles/how-to-use-a-compressor-pedal' },
    neuralDelay: { title: 'Neural DSP — How to use a delay pedal', url: 'https://neuraldsp.com/articles/how-to-use-a-delay-pedal' },
    musicGuyDelay: { title: 'Music Guy Mixing — Reverb after delay vs delay after reverb', url: 'https://www.musicguymixing.com/reverb-after-delay/' },
    musicradarStack: { title: 'MusicRadar — Why it is good to own two of the same type of effects pedal (stacking reverbs)', url: 'https://www.musicradar.com/news/effects-pedal-stacking' },
    thomannMultiFx: { title: 'Thomann Online Expert — Guitar multi-effects: applications', url: 'https://www.thomannmusic.com/onlineexpert_page_guitar_multi_fx_applications_653430f7d9fc0.html' },
    zoomManual: { title: 'ZOOM MS-50G+ Operation Manual', url: 'https://zoomcorp.com/manuals/ms-50gplus-en/' },
    zoomManualEffects: { title: 'ZOOM MS-50G+ Operation Manual — Switching effects', url: 'https://zoomcorp.com/manuals/ms-50gplus-en/#unique_43' },
    zoomFxList: { title: 'ZOOM MS-50G+ Effects List', url: 'https://zoomcorp.com/media/documents/E_MS-50Gplus_EffectsList.pdf' }
  });

  // ---- roles of the guitar effects (the engine's defaults are the MS-60B+ names) ----------------------
  // The PREAMP category of the MS-50G+ holds the amp models (MS1959 DRIVE, FD TWIN-R DRIVE, …).
  ADVICE.addRoles({
    categories: { PREAMP: 'amp', FILTER: 'filter', SFX: 'sfx' },
    names: {
      'NOISE GATE': 'gate', 'MUTE SWITCH': 'sfx',
      'AUTO WAH': 'envfilter', 'RESONANCE FILTER': 'envfilter', 'LOW-PASS FILTER': 'envfilter', 'CRY FILTER': 'envfilter',
      'GUITAR GRAPHIC EQ': 'eq', 'GUITAR GRAPHIC EQ7': 'eq', 'STEREO GUITAR GRAPHIC EQ': 'eq', 'PARAMETRIC EQ': 'eq',
      'ACOUSTIC SIMULATOR': 'simulator', 'SITAR SIMULATOR': 'simulator',
      OCTAVER: 'octave', AUTOPAN: 'mod'
    }
  });

  // ---- helpers ----------------------------------------------------------------------------------------
  const { clone, moveBefore, moveAfter, setValue } = ADVICE.edit;
  const removeSlot = (patch, slot) => { const next = clone(patch); next.effects.splice(slot, 1); return next; };
  // Highest gain-like control of a drive or amp model (amps with two channels have GAIN1 and GAIN2)
  const gainOf = s => {
    const values = ['GAIN', 'GAIN1', 'GAIN2', 'IN1', 'IN2', 'SUSTN', 'BOOST'].map(p => s.num(p)).filter(n => n !== null);
    return values.length ? Math.max(...values) : null;
  };
  const names = list => list.map(s => s.fx.name).join(', ');
  // Effects the Effects List describes as operated with the foot switch
  const footswitchFx = new Set(EFFECTS_DATA.filter(([, , , description]) => /foot ?switch/i.test(description)).map(([name]) => name));
  // Order rule: each active `subject` effect for which when(s, reference) holds → one finding with a fix.
  const order = ({ subject, reference, when, message, fix }) => ctx => {
    const ref = reference(ctx);
    if (!ref) return [];
    return ctx.of(subject).filter(s => s.i !== ref.i && when(s, ref)).map(s => ({ slots: [s.i, ref.i], message: message(s, ref), fix: fix(s, ref) }));
  };
  const before = (s, ref) => ({ label: `Move before ${ref.fx.name}`, apply: p => moveBefore(p, s.i, ref.i) });
  const after = (s, ref) => ({ label: `Move after ${ref.fx.name}`, apply: p => moveAfter(p, s.i, ref.i) });
  const comesAfter = (s, ref) => `${s.fx.name} comes after ${ref.fx.name}.`;
  const comesBefore = (s, ref) => `${s.fx.name} comes before ${ref.fx.name}.`;

  ADVICE.addRules([
    // ---- objective problems ----
    {
      id: 'dsp.overflow', severity: 'error', topic: 'dsp', title: 'Processing load over 100%',
      why: 'The effects of a patch share the processing capacity of the pedal. Values are estimated on the Handy Guitar Lab "Processor" scale (calibrated on the MS-60B+).',
      sources: [],
      check: ctx => ctx.dsp > 100 ? [{ message: `Estimated load is ${ctx.dsp.toFixed(1)}%. Remove or replace an effect (amp models are the heaviest).` }] : []
    },
    {
      id: 'dsp.near-limit', severity: 'tip', topic: 'dsp', title: 'Close to the processing limit',
      why: 'The DSP estimate is calibrated on the MS-60B+ and not yet checked on the MS-50G+. A patch right at the limit may not fit on the pedal.',
      sources: [],
      check: ctx => ctx.dsp > 95 && ctx.dsp <= 100 ? [{ message: `Estimated load is ${ctx.dsp.toFixed(1)}%. Leave a little headroom.` }] : []
    },
    {
      id: 'amp.one-preamp', severity: 'error', topic: 'chain', title: 'More than one amp model',
      why: 'The MS-50G+ accepts only one effect of the PREAMP category (the amp models) in a patch memory.',
      sources: ['zoomManualEffects'],
      check: ctx => {
        const amps = ctx.slots.filter(s => s.fx.category === 'PREAMP');
        return amps.slice(1).map(s => ({
          slots: [amps[0].i, s.i], message: `${s.label} is a second PREAMP effect after ${amps[0].fx.name}. Keep one of them.`,
          fix: { label: `Remove ${s.fx.name}`, apply: p => removeSlot(p, s.i) }
        }));
      }
    },
    {
      id: 'linesel.multiple', severity: 'error', topic: 'routing', title: 'More than one Line Selector',
      why: 'The MS-50G+ accepts only one LINE SELECTOR in a patch memory.',
      sources: ['zoomManualEffects'],
      check: ctx => {
        const list = ctx.slots.filter(s => s.role === 'linesel');
        return list.slice(1).map(s => ({ slots: [list[0].i, s.i], message: `${s.label} is a second LINE SELECTOR.`, fix: { label: 'Remove it', apply: p => removeSlot(p, s.i) } }));
      }
    },
    {
      id: 'level.muted', severity: 'error', topic: 'levels', title: 'Effect volume at zero',
      why: 'VOL sets the output level of the effect. At 0 the effect is switched on but nothing comes out of it, so the whole patch goes silent.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.has('VOL') && s.num('VOL') === 0).map(s => ({
        slots: [s.i], message: `${s.label} has VOL at 0.`,
        fix: { label: 'Set VOL to 80', apply: p => setValue(p, s.i, 'VOL', 80) }
      }))
    },
    {
      id: 'chain.all-off', severity: 'warning', topic: 'chain', title: 'Every effect is off',
      why: 'With all effects bypassed the patch only passes the dry signal.',
      sources: [],
      check: ctx => ctx.slots.length && !ctx.active.length ? [{ message: 'Switch on at least one effect.' }] : []
    },
    {
      id: 'mix.silent-effect', severity: 'warning', topic: 'levels', title: 'Effect mixed out completely',
      why: 'MIX (or WET) sets how much of the effect is blended with the original sound. At 0 the effect uses processing power but is inaudible.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => ['MIX', 'WET'].some(p => s.has(p) && s.num(p) === 0)).map(s => {
        const param = ['MIX', 'WET'].find(p => s.has(p) && s.num(p) === 0);
        return { slots: [s.i], message: `${s.label} has ${param} at 0, so it cannot be heard.`, fix: { label: `Set ${param} to 30`, apply: p => setValue(p, s.i, param, 30) } };
      })
    },
    {
      id: 'linesel.last', severity: 'warning', topic: 'routing', title: 'Line Selector at the end does nothing',
      why: 'LINE SELECTOR sends the signal either to the next effect or straight to the outputs. As the last effect both routes end at the outputs.',
      sources: ['zoomFxList'],
      check: ctx => {
        const last = ctx.active.at(-1);
        return last && last.role === 'linesel' && ctx.active.length > 1 ? [{ slots: [last.i], message: 'Move LINE SELECTOR in front of the effects you want to be able to skip.' }] : [];
      }
    },

    // ---- order ----
    {
      id: 'order.octave-after-gain', severity: 'warning', topic: 'order', title: 'Octaver after a drive or amp model',
      why: 'An octaver follows the pitch of the note you play and needs a clean signal to track it. The clipping and harmonics of a drive or amp model confuse the tracking, so octavers go at the front of the chain.',
      sources: ['andertonsPitch', 'thomannOrder'],
      check: order({ subject: 'octave', reference: c => c.first('gain'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.pitch-after-gain', severity: 'tip', topic: 'order', title: 'Pitch shifter after a drive or amp model',
      why: 'Pitch shifters detect your notes and usually give their best on a clean signal at the front of the chain. Some guides prefer harmonizers after the distortion, so treat this as a choice and try both.',
      sources: ['andertonsPitch', 'thomannOrder', 'gearnews'],
      check: order({ subject: 'pitch', reference: c => c.first('gain'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.time-before-gain', severity: 'warning', topic: 'order', title: 'Delay or reverb before a drive or amp model',
      why: 'A delay should repeat the finished sound: in front of a drive or amp model every repeat, and every reverb tail, is distorted and compressed again. Some vintage sounds put a delay before a low-gain drive on purpose.',
      sources: ['thomannOrder', 'bossOrder', 'gearnews'],
      check: order({ subject: 'time', reference: c => c.last('gain'), when: (s, ref) => s.i < ref.i, message: comesBefore, fix: after })
    },
    {
      id: 'order.gate-after-time', severity: 'warning', topic: 'order', title: 'Noise reduction after delay or reverb',
      why: 'A gate after a delay or reverb chops off their repeats and tails. Place it before any delay or reverb, never at the very end of the chain.',
      sources: ['gearnews', 'sos'],
      check: order({ subject: 'gate', reference: c => c.first('time'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.comp-after-gain', severity: 'tip', topic: 'order', title: 'Compressor after a drive or amp model',
      why: 'Compressors are usually placed at the beginning of the chain. After a drive the result can be an overly pronounced or muted distortion.',
      sources: ['neuralComp', 'thomannOrder'],
      check: order({ subject: 'comp', reference: c => c.first('gain'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.envfilter-after-gain', severity: 'tip', topic: 'order', title: 'Auto-wah after a drive or amp model',
      why: 'Auto-wahs and envelope filters respond to the attack of your picking, and a drive flattens it. They are usually placed before the distortion, but they also work on a distorted signal: try both.',
      sources: ['bossOrder', 'thomannOrder'],
      check: order({ subject: 'envfilter', reference: c => c.first('gain'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.comp-before-envfilter', severity: 'tip', topic: 'order', title: 'Compressor before an auto-wah',
      why: 'Filters that respond to your attack work best with nothing in front that mutes it. Put the wah or auto-wah before the compressor.',
      sources: ['neuralComp', 'bossOrder'],
      check: order({ subject: 'comp', reference: c => c.first('envfilter'), when: (s, ref) => s.i < ref.i, message: (s, ref) => `${s.fx.name} evens out your attack before ${ref.fx.name}.`, fix: after })
    },
    {
      id: 'order.simulator-after-gain', severity: 'tip', topic: 'order', title: 'Instrument simulator after a drive or amp model',
      why: 'ACOUSTIC SIMULATOR and SITAR SIMULATOR change the tone of the electric guitar itself. Effects that need the clean guitar go before the distortion, which would otherwise colour the result.',
      sources: ['zoomFxList', 'thomannOrder'],
      check: order({ subject: 'simulator', reference: c => c.first('gain'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.mod-before-gain', severity: 'tip', topic: 'order', title: 'Modulation before a drive or amp model',
      why: 'Drives work better on an unmodulated signal, and modulation after the distortion gives the stronger textures. Chorus and phaser in front of a drive are also popular: try both.',
      sources: ['bossOrder', 'thomannOrder', 'sos'],
      check: order({ subject: 'mod', reference: c => c.last('gain'), when: (s, ref) => s.i < ref.i, message: comesBefore, fix: after })
    },
    {
      id: 'order.reverb-before-delay', severity: 'tip', topic: 'order', title: 'Reverb before delay',
      why: 'Delays are most often placed before the reverb, which then adds size to the repeats. Reverb first makes the repeats larger and can quickly muddy the sound.',
      sources: ['musicGuyDelay', 'neuralDelay'],
      check: order({ subject: 'reverb', reference: c => c.last('delay'), when: (s, ref) => s.i < ref.i, message: comesBefore, fix: after })
    },

    // ---- gain, dynamics and time effects ----
    {
      id: 'gate.suggest', severity: 'tip', topic: 'noise', title: 'High gain without noise reduction',
      why: 'Drives, compressors and the amp\'s preamp are the main sources of noise. A gate after the distortion, and before any delay or reverb, cleans up the pauses.',
      sources: ['gearnews', 'sos'],
      check: ctx => {
        if (ctx.of('gate').length) return [];
        const loud = ctx.active.filter(s => (s.role === 'drive' || s.role === 'amp') && (gainOf(s) ?? 0) >= 70);
        return loud.length ? [{ slots: loud.map(s => s.i), message: `${names(loud)} ${loud.length > 1 ? 'run' : 'runs'} with high gain. Add ZOOM NOISE REDUCTION or NOISE GATE after it.` }] : [];
      }
    },
    {
      id: 'comp.ratio-high', severity: 'tip', topic: 'dynamics', title: 'Very high compression ratio',
      why: 'A low ratio such as 2:1 adds sustain and keeps your playing expressive. From about 6:1 the compressor keeps the peaks in check, and higher settings squash the signal heavily.',
      sources: ['neuralComp'],
      check: ctx => ctx.active.filter(s => (s.fx.name === 'RACK COMPRESSOR' && (s.num('RATIO') ?? 0) >= 8) || (s.fx.name === '1176 LIMITER' && ['12:1', '20:1'].includes(String(s.v('RATIO')))))
        .map(s => s.fx.name === 'RACK COMPRESSOR'
          ? { slots: [s.i], message: `${s.label} has RATIO ${s.num('RATIO')}:1. Try 2:1 to 4:1 to keep the playing expressive.`, fix: { label: 'Set RATIO to 3', apply: p => setValue(p, s.i, 'RATIO', 3) } }
          : { slots: [s.i], message: `${s.label} has RATIO ${s.v('RATIO')}. 4:1 squashes the playing less.`, fix: { label: 'Set RATIO to 4:1', apply: p => setValue(p, s.i, 'RATIO', '4:1') } })
    },
    {
      id: 'comp.heavy', severity: 'tip', topic: 'dynamics', title: 'Compression set very hard',
      why: 'Heavy compression squashes the signal, and a compressor that raises the quiet parts also raises the noise between notes.',
      sources: ['neuralComp', 'gearnews'],
      check: ctx => {
        const HARD = { COMPRESSOR: ['SENSE', 9], 'GRAY COMPRESSOR': ['SUSTN', 90], 'BLACK OPTICAL COMPRESSOR': ['COMP', 90] };
        return ctx.active.filter(s => HARD[s.fx.name] && (s.num(HARD[s.fx.name][0]) ?? 0) >= HARD[s.fx.name][1])
          .map(s => ({ slots: [s.i], message: `${s.label} has ${HARD[s.fx.name][0]} at ${s.num(HARD[s.fx.name][0])}. Back it off if the guitar sounds flat or hisses between notes.` }));
      }
    },
    {
      id: 'delay.repeat-high', severity: 'tip', topic: 'time', title: 'Many delay repeats',
      why: 'REPEAT (feedback) sets how many times the echo comes back: low settings give few repeats, high settings long trails and even endless loops.',
      sources: ['neuralDelay'],
      check: ctx => ctx.of('delay').filter(s => s.fx.name !== 'HOLD DELAY').flatMap(s => ['REPEAT', 'REP A', 'REP B']
        .filter(p => s.has(p) && (s.num(p) ?? 0) >= 70)
        .map(p => ({ slots: [s.i], message: `${s.label} has ${p} at ${s.num(p)}: the echoes will build up.`, fix: { label: `Set ${p} to 30`, apply: q => setValue(q, s.i, p, 30) } })))
    },
    {
      id: 'delay.mix-high', severity: 'tip', topic: 'time', title: 'Delay louder than the dry guitar',
      why: 'MIX balances the dry signal against the echoes: at zero only the dry signal is heard, at maximum the echoes dominate.',
      sources: ['neuralDelay'],
      check: ctx => ctx.of('delay').filter(s => s.has('MIX') && (s.num('MIX') ?? 0) >= 70).map(s => ({
        slots: [s.i], message: `${s.label} has MIX at ${s.num('MIX')}: the echoes cover the guitar.`,
        fix: { label: 'Set MIX to 35', apply: p => setValue(p, s.i, 'MIX', 35) }
      }))
    },
    {
      id: 'time.two-reverbs', severity: 'tip', topic: 'time', title: 'Two reverbs in the chain',
      why: 'Stacked reverbs work when they contrast, such as a short room into a long hall. Two washed-out reverbs on top of each other quickly turn to mush.',
      sources: ['musicradarStack'],
      check: ctx => ctx.of('reverb').length > 1 ? [{ slots: ctx.of('reverb').map(s => s.i), message: `${names(ctx.of('reverb'))} are all on. Make them different: one short, one long.` }] : []
    },

    // ---- where the pedal plugs in ("Plug into" in the Advice pane) ----
    {
      id: 'output.amp-clean', severity: 'tip', topic: 'output', title: 'Amp model into a guitar amp',
      why: 'When a multi-effects unit sits between the guitar and the amplifier, the amp is typically set to a clean sound and the drive comes from the unit.',
      sources: ['thomannMultiFx'],
      check: ctx => ctx.output !== 'amp' ? [] : ctx.of('amp').slice(0, 1).map(s => ({
        slots: [s.i], message: `${s.fx.name} already shapes the tone like an amplifier: set your guitar amp to a clean sound.`
      }))
    },
    {
      id: 'output.no-amp-mixer', severity: 'tip', topic: 'output', title: 'Drive into a mixer without an amp model',
      why: 'A multi-effects unit with amp modelling can be used without a guitar amplifier, through monitors, a full-range cabinet or headphones. Without an amp model nothing in the patch takes the place of the amp.',
      sources: ['thomannMultiFx'],
      check: ctx => ctx.output !== 'mixer' || ctx.of('amp').length || !ctx.of('drive').length ? [] : [{
        slots: [ctx.of('drive')[0].i], message: 'Straight into a mixer or headphones, add a PREAMP effect (amp model) after the drive.'
      }]
    },

    // ---- effect-specific usage ----
    {
      id: 'pitch.mono-chords', severity: 'tip', topic: 'usage', title: 'Octaver for single notes',
      why: 'POLYPHONIC OCTAVER is the octaver the Effects List describes as supporting chord playing. Octavers that are not polyphonic can struggle with chords and stray open strings.',
      sources: ['zoomFxList', 'andertonsPitch'],
      check: ctx => ctx.active.filter(s => s.fx.name === 'OCTAVER').map(s => ({ slots: [s.i], message: `${s.fx.name}: play single notes, or use POLYPHONIC OCTAVER for chords.` }))
    },
    {
      id: 'pitch.harmony-key', severity: 'tip', topic: 'usage', title: 'Set the key for the harmonizer',
      why: 'HARMONY PITCH SHIFTER shifts the pitch according to the SCALE and KEY settings, so the key must match the song.',
      sources: ['zoomFxList', 'andertonsPitch'],
      check: ctx => ctx.active.filter(s => s.fx.name === 'HARMONY PITCH SHIFTER').map(s => ({ slots: [s.i], message: `KEY is ${s.v('KEY') ?? 'not set'}: match it to the song.` }))
    },
    {
      id: 'usage.footswitch', severity: 'tip', topic: 'usage', title: 'Footswitch-controlled effect',
      why: 'This effect is operated with the footswitch (see its description in the Effects List), so its sound depends on how you press it. Try it on the pedal before relying on it.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => footswitchFx.has(s.fx.name)).map(s => ({
        slots: [s.i], message: `${s.fx.name} is controlled with the footswitch: practise the footwork before a gig.`
      }))
    },
    {
      id: 'usage.tempo-sync', severity: 'tip', topic: 'usage', title: 'Delay synced to the tempo',
      why: 'When the delay MODE is set to the metronome symbol, the delay time follows the tempo, so the result depends on the tempo of the patch.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.has('MODE') && String(s.v('MODE')).includes('♩')).map(s => ({
        slots: [s.i], message: `${s.fx.name}: the delay time follows the tempo. Set the tempo of this patch on the pedal.`
      }))
    }
  ]);

  // ---- personal preferences: a pinned choice hides the rules that would argue with it ------------------
  ADVICE.addPreferences([
    { id: 'time-before-gain', label: 'Delay or reverb before the drive is deliberate', hint: 'Hides the warning about time effects ahead of a drive or amp model.', silences: ['order.time-before-gain'] },
    { id: 'mod-before-gain', label: 'Modulation before the drive is deliberate', hint: 'Hides the tip about modulation ahead of a drive or amp model.', silences: ['order.mod-before-gain'] },
    { id: 'pitch-after-gain', label: 'Pitch shifter after the drive is deliberate', hint: 'Hides the tip about pitch shifters after a drive or amp model.', silences: ['order.pitch-after-gain'] },
    { id: 'envfilter-after-drive', label: 'Auto-wah after the drive is deliberate', hint: 'Hides the tip about auto-wahs after a drive or amp model.', silences: ['order.envfilter-after-gain'] },
    { id: 'comp-after-gain', label: 'Compressor after the drive is deliberate', hint: 'Hides the tip about compressors after a drive or amp model.', silences: ['order.comp-after-gain'] },
    { id: 'comp-before-envfilter', label: 'Compressor before the auto-wah is deliberate', hint: 'Hides the tip about compression ahead of an auto-wah.', silences: ['order.comp-before-envfilter'] },
    { id: 'reverb-before-delay', label: 'Reverb before delay is deliberate', hint: 'Hides the tip about swapping reverb and delay.', silences: ['order.reverb-before-delay'] },
    { id: 'two-reverbs', label: 'I stack reverbs on purpose', hint: 'Hides the tip about two reverbs in one patch.', silences: ['time.two-reverbs'] }
  ]);

  // ---- placement tips shown in the Effects list, by effect role ---------------------------------------
  ADVICE.addRoleTips({
    envfilter: { place: 'First, before compressors and drives', text: 'Auto-wahs and envelope filters respond to the attack of your picking, so keep compressors and drives that flatten it after them. After a drive the sweep sounds harsher: try both.', sources: ['bossOrder', 'neuralComp', 'thomannOrder'] },
    filter: { place: 'Early to middle', text: 'Moving filters are usually placed before the distortion, but they also work on a distorted signal: both are valid sounds.', sources: ['thomannOrder'] },
    comp: { place: 'Near the start', text: 'Compressors usually go at the beginning of the chain, after a wah or auto-wah. About 2:1 adds sustain and keeps the playing expressive; for rhythm parts set the level so the sound matches the bypassed guitar.', sources: ['neuralComp', 'bossOrder'] },
    swell: { place: 'Near the start', text: 'Effects that react to your input signal go early in the chain, where each picked note still has its own attack.', sources: ['thomannOrder'] },
    gate: { place: 'After the drive, before delay and reverb', text: 'In front of the drive the gate reacts to the clean guitar; after it, it also catches the noise the drive adds. Never put it after delay or reverb, whose tails it would cut.', sources: ['gearnews', 'sos'] },
    simulator: { place: 'First, on the clean guitar', text: 'This effect changes the tone of the electric guitar itself (see the Effects List). Keep it in front of drives and amp models, which would otherwise colour the result.', sources: ['zoomFxList', 'thomannOrder'] },
    octave: { place: 'First in the chain', text: 'Octavers detect the note you play and need a clean signal to track it: put them at the front, before drives and amp models.', sources: ['andertonsPitch', 'thomannOrder'] },
    pitch: { place: 'Early, before drives', text: 'Pitch shifters track your notes and work best on a clean signal at the front of the chain. Some guides put harmonizers after the distortion: try both.', sources: ['andertonsPitch', 'thomannOrder', 'gearnews'] },
    drive: { place: 'After dynamics and filters', text: 'Drives work better on an unmodulated signal: place them after compressors, filters and pitch effects, and before modulation, delay and reverb. Some classic fuzz circuits like to be first.', sources: ['bossOrder', 'thomannOrder', 'gearnews'] },
    amp: { place: 'After the drives, before modulation and time effects', text: 'The PREAMP effects are the amp models, and a patch can hold only one. Like the gain stages, they go before modulation, delay and reverb. Into a real guitar amp, set the amp to a clean sound.', sources: ['zoomManualEffects', 'bossOrder', 'thomannMultiFx'] },
    eq: { place: 'Before or after the drive', text: 'Before a drive an EQ changes how it distorts (boosts tend to work better than cuts there, and a mid scoop reduces the distortion); after the drive or amp model it shapes the final tone.', sources: ['gearnews', 'thomannOrder'] },
    mod: { place: 'After drives and amp models', text: 'Modulation after the distortion gives the stronger textures, and drives work better on an unmodulated signal. Chorus and phaser in front of a drive are popular too.', sources: ['bossOrder', 'thomannOrder', 'sos'] },
    delay: { place: 'Near the end, before reverb', text: 'Delays usually come after drives and modulation and before reverb, so they repeat the finished sound. In front of a drive every repeat is distorted again.', sources: ['neuralDelay', 'thomannOrder'] },
    reverb: { place: 'Last', text: 'Reverb usually closes the chain, where its tails stay natural. To stack two reverbs, make them contrast: a short room into a long hall.', sources: ['thomannOrder', 'musicradarStack'] },
    sfx: { place: 'Anywhere — experiment', text: 'Special effects act on whatever reaches them: place them where that is the sound you want. Several are played from the footswitch (see the Effects List).', sources: ['zoomFxList'] },
    linesel: { place: 'In front of the effects to skip', text: 'LINE SELECTOR sends the signal to the next effect or straight to the outputs, so effects after it can be skipped. It does nothing as the last effect, and a patch can hold only one.', sources: ['zoomFxList', 'zoomManualEffects'] }
  });

  // ---- notes for single effects, shown under the role tip --------------------------------------------
  ADVICE.addEffectTips({
    OCTAVER: { text: 'POLYPHONIC OCTAVER is the octaver the Effects List describes as supporting chord playing: with this one, play single notes.', sources: ['zoomFxList', 'andertonsPitch'] },
    'HARMONY PITCH SHIFTER': { text: 'The harmony follows the SCALE and KEY settings: set KEY to the key of the song.', sources: ['zoomFxList', 'andertonsPitch'] }
  });
})();
