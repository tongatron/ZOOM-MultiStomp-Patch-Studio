// Advice rules and placement tips for the Zoom MS-70CDR+ (chorus, delay and reverb; not tested on the pedal yet).
// The order advice comes from guitar and effects sources, not from the bass advice of the MS-60B+. Effect order is
// convention, not law: order rules are 'warning' or 'tip', never 'error'. 'error' is reserved for objective problems.
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
    zoomManual: { title: 'ZOOM MS-70CDR+ Operation Manual', url: 'https://zoomcorp.com/manuals/ms-70cdrplus-en/' },
    zoomManualModules: { title: 'ZOOM MS-70CDR+ Operation Manual — LINE SELECTOR and BPM modules', url: 'https://zoomcorp.com/manuals/ms-70cdrplus-en/#unique_44' },
    zoomManualOverflow: { title: 'ZOOM MS-70CDR+ Operation Manual — Processing capability (PROCESS OVERFLOW)', url: 'https://zoomcorp.com/manuals/ms-70cdrplus-en/#unique_45' },
    zoomFxList: { title: 'ZOOM MS-70CDR+ Effects List', url: 'https://zoomcorp.com/media/documents/E_MS-70CDRplus_FX-list.pdf' }
  });

  // ---- roles of the MS-70CDR+ effects (the engine's defaults are the MS-60B+ names) -------------------
  ADVICE.addRoles({
    categories: { FILTER: 'filter', SFX: 'sfx' },
    names: {
      'NOISE GATE': 'gate', 'DIRTY GATE': 'gate',
      'AUTO WAH': 'envfilter', 'RESONANCE FILTER': 'envfilter', 'LOW PASS FILTER': 'envfilter', 'CRY FILTER': 'envfilter', 'SLOW FILTER': 'envfilter',
      'GUITAR GRAPHIC EQ': 'eq', 'STEREO GUITAR GRAPHIC EQ': 'eq', 'PARAMETRIC EQ': 'eq', 'BOTTOM UP': 'eq',
      OCTAVER: 'octave', 'MONO SYNTH': 'synth', 'BIT CRUSHER': 'drive',
      'AUTO PAN': 'mod', 'ROTO CLOSET': 'mod'
    }
  });

  // ---- helpers ----------------------------------------------------------------------------------------
  const { setValue, remove: removeSlot } = ADVICE.edit;
  const { names, order, before, after, comesAfter, comesBefore } = ADVICE.kit;
  // Effects the Effects List describes as operated with the foot switch
  const footswitchFx = new Set(EFFECTS_DATA.filter(([, , , description]) => /foot ?switch/i.test(description)).map(([name]) => name));
  const MONO_TRACKERS = ['OCTAVER', 'BASS OCTAVER', 'BASS ANALOG OCTAVER', 'MONO SYNTH'];

  ADVICE.addRules([
    // ---- objective problems ----
    {
      id: 'dsp.overflow', severity: 'error', topic: 'dsp', title: 'Processing load over 100%',
      why: 'Above the processing capability of the pedal it shows PROCESS OVERFLOW and bypasses the effects. Values are estimates from the MS-70CDR+ firmware catalogue and still need a real-pedal check.',
      sources: ['zoomManualOverflow'],
      check: ctx => ctx.dsp > 100 ? [{ message: `Estimated load is ${ctx.dsp.toFixed(1)}%. Remove or replace an effect (the big reverbs are the heaviest).` }] : []
    },
    {
      id: 'dsp.near-limit', severity: 'tip', topic: 'dsp', title: 'Close to the processing limit',
      why: 'The DSP estimate comes from an independent MS-70CDR+ firmware catalogue and is not yet checked against the pedal. A patch right at the limit may not fit.',
      sources: ['zoomManualOverflow'],
      check: ctx => ctx.dsp > 95 && ctx.dsp <= 100 ? [{ message: `Estimated load is ${ctx.dsp.toFixed(1)}%. Leave a little headroom if the pedal reports PROCESS OVERFLOW.` }] : []
    },
    {
      id: 'linesel.multiple', severity: 'error', topic: 'routing', title: 'More than one Line Selector',
      why: 'Each patch memory of the MS-70CDR+ can only have one LINE SELECTOR module.',
      sources: ['zoomManualModules'],
      check: ctx => {
        const list = ctx.slots.filter(s => s.role === 'linesel');
        return list.slice(1).map(s => ({ slots: [list[0].i, s.i], message: `${s.label} is a second LINE SELECTOR.`, fix: { label: 'Remove it', apply: p => removeSlot(p, s.i) } }));
      }
    },
    ...ADVICE.sharedRules('level.muted', 'chain.all-off', 'mix.silent-effect', 'linesel.last'),

    // ---- order ----
    {
      id: 'order.tracking-after-time', severity: 'warning', topic: 'order', title: 'Octaver or pitch effect after delay or reverb',
      why: 'Octavers, pitch shifters and MONO SYNTH detect the note you play and need a clean signal to track it, so they go at the front of the chain. After a delay or reverb the repeats and tails overlap the next notes.',
      sources: ['andertonsPitch', 'thomannOrder'],
      check: order({ subject: 'tracking', reference: c => c.first('time'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.tracking-after-mod', severity: 'tip', topic: 'order', title: 'Octaver or pitch effect after modulation',
      why: 'Octavers and pitch shifters are typically placed at the front of the chain, so the signal they track stays clean. Modulation in front of them changes the signal they follow: chorus and vibrato move its pitch, tremolo chops its level.',
      sources: ['andertonsPitch'],
      check: order({ subject: 'tracking', reference: c => c.first('mod'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.gate-after-time', severity: 'warning', topic: 'order', title: 'Noise reduction after delay or reverb',
      why: 'A gate after a delay or reverb chops off their repeats and tails. Place it before any delay or reverb, never at the very end of the chain.',
      sources: ['gearnews', 'sos'],
      check: order({ subject: 'gate', reference: c => c.first('time'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.time-before-gain', severity: 'warning', topic: 'order', title: 'Delay or reverb before the bit crusher',
      why: 'A delay should repeat the finished sound: in front of a distorting effect every repeat, and every reverb tail, is distorted again.',
      sources: ['thomannOrder', 'sos'],
      check: order({ subject: 'time', reference: c => c.last('gain'), when: (s, ref) => s.i < ref.i, message: comesBefore, fix: after })
    },
    {
      id: 'order.comp-after-time', severity: 'tip', topic: 'order', title: 'Compressor after delay or reverb',
      why: 'Compressors are typically placed at the beginning of the chain, where they react to your playing. After a delay or reverb they also raise the quiet repeats and tails.',
      sources: ['neuralComp', 'thomannOrder', 'sos'],
      check: order({ subject: 'comp', reference: c => c.first('time'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.envfilter-after-time', severity: 'tip', topic: 'order', title: 'Auto-wah after delay or reverb',
      why: 'Auto-wahs and envelope filters respond to the attack of your picking, so nothing that blurs the attack should come before them. Delay repeats and reverb tails smear it.',
      sources: ['bossOrder', 'thomannOrder'],
      check: order({ subject: 'envfilter', reference: c => c.first('time'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.comp-before-envfilter', severity: 'tip', topic: 'order', title: 'Compressor before an auto-wah',
      why: 'Filters that respond to your attack work best with nothing in front that mutes it. Put the wah or auto-wah before the compressor.',
      sources: ['neuralComp', 'bossOrder'],
      check: order({ subject: 'comp', reference: c => c.first('envfilter'), when: (s, ref) => s.i < ref.i, message: (s, ref) => `${s.fx.name} evens out your attack before ${ref.fx.name}.`, fix: after })
    },
    {
      id: 'order.mod-after-time', severity: 'tip', topic: 'order', title: 'Modulation after delay or reverb',
      why: 'Modulation usually comes before delay and reverb, which then add ambience to the modulated sound. After them, the repeats and tails are modulated too.',
      sources: ['bossOrder', 'neuralDelay'],
      check: order({ subject: 'mod', reference: c => c.first('time'), when: (s, ref) => s.i > ref.i, message: comesAfter, fix: before })
    },
    {
      id: 'order.reverb-before-delay', severity: 'tip', topic: 'order', title: 'Reverb before delay',
      why: 'Delays are most often placed before the reverb, which then adds size to the repeats. Reverb first makes the repeats larger and can quickly muddy the sound.',
      sources: ['musicGuyDelay', 'neuralDelay'],
      check: order({ subject: 'reverb', reference: c => c.last('delay'), when: (s, ref) => s.i < ref.i, message: comesBefore, fix: after })
    },

    // ---- dynamics and time effects ----
    {
      id: 'time.two-reverbs', severity: 'tip', topic: 'time', title: 'Two reverbs in the chain',
      why: 'Stacked reverbs work when they contrast, such as a short room into a long hall. Two washed-out reverbs on top of each other quickly turn to mush.',
      sources: ['musicradarStack'],
      check: ctx => ctx.of('reverb').length > 1 ? [{ slots: ctx.of('reverb').map(s => s.i), message: `${names(ctx.of('reverb'))} are all on. Make them different: one short, one long.` }] : []
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
      id: 'delay.mix-high', severity: 'tip', topic: 'time', title: 'Delay louder than the dry signal',
      why: 'MIX balances the dry signal against the echoes: at zero only the dry signal is heard, at maximum the echoes dominate.',
      sources: ['neuralDelay'],
      check: ctx => ctx.of('delay').filter(s => s.has('MIX') && (s.num('MIX') ?? 0) >= 70).map(s => ({
        slots: [s.i], message: `${s.label} has MIX at ${s.num('MIX')}: the echoes cover the dry signal.`,
        fix: { label: 'Set MIX to 35', apply: p => setValue(p, s.i, 'MIX', 35) }
      }))
    },
    {
      id: 'comp.ratio-high', severity: 'tip', topic: 'dynamics', title: 'Very high compression ratio',
      why: 'A low ratio such as 2:1 adds sustain and keeps your playing expressive. From about 6:1 the compressor keeps the peaks in check, and higher settings squash the signal heavily.',
      sources: ['neuralComp'],
      check: ctx => ctx.active.filter(s => ['RACK COMPRESSOR', '160 COMPRESSOR'].includes(s.fx.name) && (s.num('RATIO') ?? 0) >= 8).map(s => ({
        slots: [s.i], message: `${s.label} has RATIO ${s.num('RATIO')}:1. Try 2:1 to 4:1 to keep the playing expressive.`,
        fix: { label: 'Set RATIO to 3', apply: p => setValue(p, s.i, 'RATIO', 3) }
      }))
    },

    // ---- effect-specific usage ----
    {
      id: 'pitch.mono-chords', severity: 'tip', topic: 'usage', title: 'Single-note tracking',
      why: 'MONO SYNTH detects the pitch of single notes, and POLYPHONIC OCTAVER is the octaver the Effects List describes as supporting chord playing. Octavers that are not polyphonic can struggle with chords.',
      sources: ['zoomFxList', 'andertonsPitch'],
      check: ctx => ctx.active.filter(s => MONO_TRACKERS.includes(s.fx.name)).map(s => ({
        slots: [s.i], message: s.fx.name === 'MONO SYNTH' ? `${s.fx.name}: play one note at a time.` : `${s.fx.name}: play single notes, or use POLYPHONIC OCTAVER for chords.`
      }))
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
    ...ADVICE.sharedRules('usage.tempo-sync')
  ]);

  // ---- personal preferences: a pinned choice hides the rules that would argue with it ------------------
  ADVICE.addPreferences([
    { id: 'mod-after-time', label: 'Modulation after delay or reverb is deliberate', hint: 'Hides the tip about modulation after a delay or reverb.', silences: ['order.mod-after-time'] },
    { id: 'reverb-before-delay', label: 'Reverb before delay is deliberate', hint: 'Hides the tip about swapping reverb and delay.', silences: ['order.reverb-before-delay'] },
    { id: 'comp-after-time', label: 'Compressor after delay or reverb is deliberate', hint: 'Hides the tip about compressors after a delay or reverb.', silences: ['order.comp-after-time'] },
    { id: 'comp-before-envfilter', label: 'Compressor before the auto-wah is deliberate', hint: 'Hides the tip about compression ahead of an auto-wah.', silences: ['order.comp-before-envfilter'] },
    { id: 'envfilter-after-time', label: 'Auto-wah after delay or reverb is deliberate', hint: 'Hides the tip about auto-wahs after a delay or reverb.', silences: ['order.envfilter-after-time'] },
    { id: 'tracking-after-mod', label: 'Pitch effects after modulation are deliberate', hint: 'Hides the tip about octavers and pitch shifters after modulation.', silences: ['order.tracking-after-mod'] },
    { id: 'two-reverbs', label: 'I stack reverbs on purpose', hint: 'Hides the tip about two reverbs in one patch.', silences: ['time.two-reverbs'] }
  ]);

  // ---- placement tips shown in the Effects list, by effect role ---------------------------------------
  ADVICE.addRoleTips({
    octave: { place: 'First in the chain', text: 'Octavers detect the note you play and need a clean signal to track it: put them at the front, before modulation, delay and reverb.', sources: ['andertonsPitch', 'thomannOrder'] },
    pitch: { place: 'First in the chain', text: 'Pitch shifters track your notes and work best on a clean signal at the front of the chain, before modulation, delay and reverb.', sources: ['andertonsPitch', 'thomannOrder'] },
    synth: { place: 'First in the chain', text: 'MONO SYNTH detects the pitch of single notes (see the Effects List): keep it at the front, on a clean signal, and play one note at a time.', sources: ['zoomFxList', 'andertonsPitch'] },
    envfilter: { place: 'First, before compressors and time effects', text: 'Auto-wahs and envelope filters respond to the attack of your picking. Keep compressors after them, and delay and reverb too, since repeats and tails blur the attack.', sources: ['bossOrder', 'neuralComp'] },
    filter: { place: 'Early, before delay and reverb', text: 'Filters sit at the front of the chain in the usual order, so the repeats and the reverb carry the filtered sound.', sources: ['bossOrder'] },
    comp: { place: 'Near the start', text: 'Compressors usually go at the beginning of the chain, after a wah or auto-wah and before delay and reverb, so they react to your playing and not to the echoes. About 2:1 adds sustain and keeps the playing expressive.', sources: ['neuralComp', 'bossOrder', 'sos'] },
    swell: { place: 'Near the start', text: 'Effects that react to your input signal go early in the chain, where each picked note still has its own attack.', sources: ['thomannOrder'] },
    gate: { place: 'Before delay and reverb', text: 'A gate after a delay or reverb chops off their repeats and tails. Place it before them, never at the very end of the chain.', sources: ['gearnews', 'sos'] },
    eq: { place: 'Where it should act', text: 'An EQ shapes everything that reaches it: at the start it changes the instrument before the other effects, at the end it also shapes the repeats and the reverb tails.', sources: [] },
    drive: { place: 'Before delay and reverb', text: 'BIT CRUSHER distorts whatever reaches it. Before delay and reverb the echoes repeat the crushed sound; after them every repeat and tail is crushed again.', sources: ['thomannOrder'] },
    mod: { place: 'Before delay and reverb', text: 'Chorus, flanger, phaser and tremolo usually come before delay and reverb, which then add ambience to the modulated sound. After them, the repeats and tails are modulated too.', sources: ['bossOrder', 'neuralDelay'] },
    delay: { place: 'After modulation, before reverb', text: 'Delays are most often placed after modulation and before reverb, which then adds size to the repeats.', sources: ['neuralDelay', 'musicGuyDelay'] },
    reverb: { place: 'Last', text: 'Reverb usually closes the chain, where its tails stay natural. To stack two reverbs, make them contrast: a short room into a long hall.', sources: ['thomannOrder', 'musicradarStack'] },
    sfx: { place: 'Anywhere — experiment', text: 'Special effects act on whatever reaches them: place them where that is the sound you want. LOOP ROLL and BOMBER are played from the footswitch (see the Effects List).', sources: ['zoomFxList'] },
    linesel: { place: 'In front of the effects to skip', text: 'LINE SELECTOR sends the signal to the next effect or straight to the outputs, so effects after it can be skipped. It does nothing as the last effect, and a patch can hold only one.', sources: ['zoomFxList', 'zoomManualModules'] }
  });

  // ---- notes for single effects, shown under the role tip --------------------------------------------
  const singleNotes = { text: 'POLYPHONIC OCTAVER is the octaver the Effects List describes as supporting chord playing: with this one, play single notes.', sources: ['zoomFxList', 'andertonsPitch'] };
  ADVICE.addEffectTips({
    OCTAVER: singleNotes, 'BASS OCTAVER': singleNotes, 'BASS ANALOG OCTAVER': singleNotes,
    'HARMONY PITCH SHIFTER': { text: 'The harmony follows the SCALE and KEY settings: set KEY to the key of the song.', sources: ['zoomFxList', 'andertonsPitch'] },
    'STOMP DELAY': { text: 'Turned up, REPEAT makes this delay self-oscillate (see the Effects List): the echoes keep growing.', sources: ['zoomFxList'] }
  });
})();
