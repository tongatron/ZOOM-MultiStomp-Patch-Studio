// Advice rules, placement tips and style profiles for the MS-60B+.
// Every rule cites where its reasoning comes from. Effect order is mostly convention, not law:
// order rules are 'warning' or 'tip', never 'error'. 'error' is reserved for objective problems.
//
// To add advice: append a rule to the ADVICE.addRules([...]) list below (see advice-engine.js for the shape),
// then run `node tools/advice-test.mjs`.

(() => {
  ADVICE.addSources({
    boss: { title: 'BOSS — Order of operation: a guide to bass effects signal chain', url: 'https://articles.boss.info/order-of-operation-a-guide-to-bass-effects-signal-chain/' },
    yamaha: { title: 'Yamaha — How to build a pedalboard for bass', url: 'https://hub.yamaha.com/guitars/bass/how-to-build-a-pedalboard-for-bass/' },
    alderete: { title: "Guitar World — Juan Alderete's primer on pedal order", url: 'https://guitarworld.com/gear/juan-alderetes-primer-on-pedal-order' },
    ebs: { title: 'EBS OctaBass — placement notes (Effects Database)', url: 'https://www.effectsdatabase.com/model/ebs/octabass' },
    sos: { title: 'Sound On Sound — Multi-effects explained, part 3', url: 'https://www.soundonsound.com/techniques/multi-effects-explained-part-3' },
    gearnews: { title: 'Gearnews — The best guitar pedal order', url: 'https://www.gearnews.com/best-guitar-pedal-order/' },
    reverbOD: { title: 'Reverb — Choosing and using a bass overdrive pedal', url: 'https://reverb.com/news/choosing-and-using-a-bass-overdrive-pedal' },
    bassMusician: { title: 'Bass Musician — Losing low end with bass overdrive? Tips you can try', url: 'https://bassmusicianmagazine.com/2017/05/losing-low-end-bass-overdrive-tips-can-try/' },
    mxrM83: { title: 'MXR M83 Bass Chorus Deluxe — X-Over keeps the lows unaffected', url: 'https://jimdunlop.com/mxr-bass-chorus-deluxe' },
    talkbassPod: { title: 'TalkBass — Cab simulation into a real bass cab', url: 'https://www.talkbass.com/threads/pod-x3-users.700305/' },
    darkglass: { title: 'Darkglass Element — cab sims for headphones and PA', url: 'https://russomusic.com/blogs/news/darkglass-element-announced' },
    soundbridge: { title: 'Soundbridge — Reverb and delay tips for cleaner, deeper mixes', url: 'https://www.soundbridge.io/reverb-and-delay-tips-for-cleaner-deeper-mixes' },
    yamahaComp: { title: "Yamaha — A bassist's guide to compression", url: 'https://hub.yamaha.com/guitars/bass/a-bassists-guide-to-compression' },
    aguilar: { title: 'Aguilar — Demystifying bass compression', url: 'https://aguilaramp.com/blogs/news/demystifying-bass-compression' },
    talkbassEnv: { title: 'TalkBass — Compressor before or after octave & envelope filter', url: 'https://www.talkbass.com/threads/put-limiter-enhancer-before-or-after-octave-envelope-filter.1208887/' },
    perfectCircuit: { title: 'Perfect Circuit — Making your bass guitar sound like a synthesizer', url: 'https://perfectcircuit.com/signal/bass-guitar-synth-sounds' },
    premierFunk: { title: 'Premier Guitar — How to funk up your bass', url: 'https://www.premierguitar.com/how-to-funk-up-your-bass' },
    thomannFunk: { title: "Thomann — Hit the tone! '70s funk bass", url: 'https://www.thomann.de/blog/en/hit-the-tone-funk-bass' },
    nailthemix: { title: 'Nail The Mix — Handling different types of bass in your metal mix', url: 'https://www.nailthemix.com/different-types-of-bass' },
    neuraldsp: { title: 'Neural DSP — How to get a good bass tone', url: 'https://neuraldsp.com/articles/how-to-get-a-good-bass-tone' },
    soundfingers: { title: 'Soundfingers — Authentic reggae dub bass tutorial', url: 'https://soundfingers.com/techniques/authentic-reggae-dub-bass-tutorial/' },
    premierReggae: { title: 'Premier Guitar — On bass: covering your basses, part 2', url: 'https://www.premierguitar.com/on-bass-covering-your-basses-pt-2' },
    fenderRumble: { title: 'Fender Rumble Studio presets ("Dub & Reggae Deep")', url: 'https://www.guitarchalk.com/fender-rumble-studio-settings/' },
    talkbassJazz: { title: 'TalkBass — Tone on a Jazz Bass', url: 'https://www.talkbass.com/threads/tone-on-jazz-bass.135480/' },
    zoomManual: { title: 'ZOOM MS-60B+ Operation Manual', url: 'https://zoomcorp.com/manuals/ms-60bplus-en/' },
    zoomFxList: { title: 'ZOOM MS-60B+ Effects List', url: 'https://zoomcorp.com/media/documents/E_MS-60Bplus_FX-list.pdf' }
  });

  // ---- helpers ----------------------------------------------------------------------------------------
  const { moveBefore, moveAfter, setValue, move } = ADVICE.edit;
  const gainOf = s => ['GAIN', 'SUSTAIN', 'BOOST', 'DIST', 'INPUT'].map(p => s.num(p)).find(n => n !== null) ?? null;
  const blendParam = s => ['BLEND', 'BALANCE'].find(p => s.has(p));
  // Parameters with a symmetric dB range (EQ bands, amp tone stacks): [{ name, value, max }]
  const boostParams = s => s.fx.params
    .map(p => ({ p, m: p.range.match(/^-(\d+(?:\.\d+)?) – (\d+(?:\.\d+)?)$/) }))
    .filter(({ m }) => m && m[1] === m[2])
    .map(({ p, m }) => ({ name: p.name, value: s.num(p.name), max: Number(m[2]) }))
    .filter(x => x.value !== null);
  const names = list => list.map(s => s.fx.name).join(', ');
  // Order rule factory: `subject` effects should come before (or after) the reference effect.
  const orderRule = ({ subject, reference, when }) => ctx => {
    const ref = reference(ctx);
    if (!ref) return [];
    return ctx.of(subject).filter(s => when(s, ref)).map(s => ({ s, ref }));
  };

  ADVICE.addRules([
    // ---- objective problems ----
    {
      id: 'dsp.overflow', severity: 'error', topic: 'dsp', title: 'Processing load over 100%',
      why: 'When the processing capacity is exceeded the pedal shows PROCESS OVERFLOW and bypasses the effects. Values are estimated on the Handy Guitar Lab "Processor" scale.',
      sources: ['zoomManual'],
      check: ctx => ctx.dsp > 100 ? [{ message: `Estimated load is ${ctx.dsp.toFixed(1)}%. Remove or replace an effect (amps and synths are the heaviest).` }] : []
    },
    {
      id: 'dsp.near-limit', severity: 'tip', topic: 'dsp', title: 'Close to the processing limit',
      why: 'The DSP estimate is accurate to about ±1%. A patch right at the limit may still overflow on the pedal.',
      sources: ['zoomManual'],
      check: ctx => ctx.dsp > 95 && ctx.dsp <= 100 ? [{ message: `Estimated load is ${ctx.dsp.toFixed(1)}%. Leave a little headroom if the pedal reports PROCESS OVERFLOW.` }] : []
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
      check: ctx => ctx.active.filter(s => (s.has('MIX') && s.num('MIX') === 0) || (s.has('WET') && s.num('WET') === 0)).map(s => {
        const param = s.has('MIX') ? 'MIX' : 'WET';
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
      id: 'order.tracking-after-gain', severity: 'warning', topic: 'order', title: 'Pitch-tracking effect after a drive or amp',
      why: 'Octavers, synths and pitch shifters follow the pitch of your note. Distortion adds harmonics that confuse the tracking and squashes the low octave, so these effects usually go first.',
      sources: ['alderete', 'ebs', 'boss'],
      check: ctx => orderRule({ subject: 'tracking', reference: c => c.first('gain'), when: (s, ref) => s.i > ref.i })(ctx).map(({ s, ref }) => ({
        slots: [s.i, ref.i], message: `${s.fx.name} comes after ${ref.fx.name}.`,
        fix: { label: `Move before ${ref.fx.name}`, apply: p => moveBefore(p, s.i, ref.i) }
      }))
    },
    {
      id: 'order.time-before-gain', severity: 'warning', topic: 'order', title: 'Delay or reverb before a drive or amp',
      why: 'Time-based effects are normally last. Distorting delay repeats or reverb tails turns them into mud.',
      sources: ['boss', 'yamaha'],
      check: ctx => orderRule({ subject: 'time', reference: c => c.last('gain'), when: (s, ref) => s.i < ref.i })(ctx).map(({ s, ref }) => ({
        slots: [s.i, ref.i], message: `${s.fx.name} comes before ${ref.fx.name}.`,
        fix: { label: `Move after ${ref.fx.name}`, apply: p => moveAfter(p, s.i, ref.i) }
      }))
    },
    {
      id: 'order.gate-after-time', severity: 'warning', topic: 'order', title: 'Noise reduction after delay or reverb',
      why: 'A gate at the end cuts off delay repeats and reverb tails. Placed before them, the tails hide any early cut.',
      sources: ['sos', 'gearnews'],
      check: ctx => orderRule({ subject: 'gate', reference: c => c.first('time'), when: (s, ref) => s.i > ref.i })(ctx).map(({ s, ref }) => ({
        slots: [s.i, ref.i], message: `${s.fx.name} comes after ${ref.fx.name}.`,
        fix: { label: `Move before ${ref.fx.name}`, apply: p => moveBefore(p, s.i, ref.i) }
      }))
    },
    {
      id: 'order.gate-before-gain', severity: 'tip', topic: 'order', title: 'Noise reduction before the drive',
      why: 'Drives raise the noise floor. A gate placed right after the distortion catches the noise it creates.',
      sources: ['sos'],
      check: ctx => orderRule({ subject: 'gate', reference: c => c.last('gain'), when: (s, ref) => s.i < ref.i })(ctx).map(({ s, ref }) => ({
        slots: [s.i, ref.i], message: `${s.fx.name} comes before ${ref.fx.name}.`,
        fix: { label: `Move after ${ref.fx.name}`, apply: p => moveAfter(p, s.i, ref.i) }
      }))
    },
    {
      id: 'order.amp-before-drive', severity: 'tip', topic: 'order', title: 'Drive or preamp after the amp',
      why: 'Amp models include the cabinet and usually sit after drives and preamps. Distorting an amp-and-cab tone sounds harsher and fizzier.',
      sources: ['boss'],
      check: ctx => {
        const stages = ctx.active.filter(s => s.role === 'drive' || s.role === 'preamp');
        return ctx.of('amp').flatMap(amp => {
          const after = stages.filter(s => s.i > amp.i).at(-1);
          return after ? [{ slots: [amp.i, after.i], message: `${amp.fx.name} comes before ${after.fx.name}.`, fix: { label: `Move ${amp.fx.name} after ${after.fx.name}`, apply: p => moveAfter(p, amp.i, after.i) } }] : [];
        });
      }
    },
    {
      id: 'order.envfilter-after-drive', severity: 'tip', topic: 'order', title: 'Envelope filter after a drive',
      why: 'Envelope filters react to how hard you play. After a drive they see a compressed signal and sweep less. Fuzz into a filter is also a classic sound, so try both.',
      sources: ['yamaha', 'talkbassEnv'],
      check: ctx => orderRule({ subject: 'envfilter', reference: c => c.first('drive'), when: (s, ref) => s.i > ref.i })(ctx).map(({ s, ref }) => ({
        slots: [s.i, ref.i], message: `${s.fx.name} comes after ${ref.fx.name}.`,
        fix: { label: `Move before ${ref.fx.name}`, apply: p => moveBefore(p, s.i, ref.i) }
      }))
    },
    {
      id: 'order.comp-before-envfilter', severity: 'tip', topic: 'order', title: 'Compressor before an envelope filter',
      why: 'Heavy compression evens out your dynamics, which is exactly what an envelope filter reacts to. Many players put the filter first, others keep a light compressor in front: it depends on the sound you want.',
      sources: ['talkbassEnv', 'boss'],
      check: ctx => orderRule({ subject: 'comp', reference: c => c.first('envfilter'), when: (s, ref) => s.i < ref.i })(ctx).map(({ s, ref }) => ({
        slots: [s.i, ref.i], message: `${s.fx.name} squeezes the dynamics before ${ref.fx.name}.`,
        fix: { label: `Move after ${ref.fx.name}`, apply: p => moveAfter(p, s.i, ref.i) }
      }))
    },
    {
      id: 'order.mod-before-gain', severity: 'tip', topic: 'order', title: 'Modulation before a drive or amp',
      why: 'Chorus, flanger and phaser are usually placed after drives and amps so they add shimmer to the finished tone instead of being distorted.',
      sources: ['yamaha', 'boss'],
      check: ctx => orderRule({ subject: 'mod', reference: c => c.last('gain'), when: (s, ref) => s.i < ref.i })(ctx).map(({ s, ref }) => ({
        slots: [s.i, ref.i], message: `${s.fx.name} comes before ${ref.fx.name}.`,
        fix: { label: `Move after ${ref.fx.name}`, apply: p => moveAfter(p, s.i, ref.i) }
      }))
    },
    {
      id: 'order.reverb-before-delay', severity: 'tip', topic: 'order', title: 'Reverb before delay',
      why: 'Most players put delay before reverb so the repeats sit inside the space. Reverb first gives washier repeats; try both.',
      sources: ['yamaha'],
      check: ctx => orderRule({ subject: 'reverb', reference: c => c.last('delay'), when: (s, ref) => s.i < ref.i })(ctx).map(({ s, ref }) => ({
        slots: [s.i, ref.i], message: `${s.fx.name} comes before ${ref.fx.name}.`,
        fix: { label: `Move after ${ref.fx.name}`, apply: p => moveAfter(p, s.i, ref.i) }
      }))
    },

    // ---- gain staging and low end ----
    {
      id: 'gain.multiple-amps', severity: 'warning', topic: 'gain', title: 'More than one amp model',
      why: 'Each amp model includes a cabinet. Stacking them stacks cabinet filtering and gain, which tends to sound muddy, and amps are the heaviest effects for the DSP.',
      sources: ['talkbassPod'],
      check: ctx => ctx.of('amp').length > 1 ? [{ slots: ctx.of('amp').map(s => s.i), message: `${names(ctx.of('amp'))} are all active.` }] : []
    },
    {
      id: 'lowend.drive-no-dry', severity: 'warning', topic: 'low end', title: 'Drive with no clean signal',
      why: 'Clipping adds harmonics above the fundamental and squares off low notes, so a fully distorted bass loses its low end. Blending some clean signal back in restores it.',
      sources: ['reverbOD', 'bassMusician'],
      check: ctx => ctx.of('drive').filter(s => s.has('DRY') && s.num('DRY') === 0).map(s => ({
        slots: [s.i], message: `${s.label} has DRY at 0.`,
        fix: { label: 'Set DRY to 40', apply: p => setValue(p, s.i, 'DRY', 40) }
      }))
    },
    {
      id: 'lowend.drive-blend', severity: 'tip', topic: 'low end', title: 'Keep some clean low end under the drive',
      why: 'Clipping thins out the low end. Bass drives use a blend control to mix the clean signal back in; on the hardware these models are based on, a blend near maximum leaves almost only the distorted signal.',
      sources: ['reverbOD', 'bassMusician', 'nailthemix'],
      check: ctx => ctx.of('gain').filter(s => {
        const param = blendParam(s);
        return param && s.num(param) >= 90 && (gainOf(s) ?? 0) >= 50;
      }).map(s => {
        const param = blendParam(s);
        return { slots: [s.i], message: `${s.label}: ${param} is ${s.num(param)} with high gain.`, fix: { label: `Set ${param} to 60`, apply: p => setValue(p, s.i, param, 60) } };
      })
    },
    {
      id: 'gate.suggest', severity: 'tip', topic: 'noise', title: 'High gain without noise reduction',
      why: 'High-gain drives raise hiss and hum between notes. ZOOM NOISE REDUCTION placed right after the drive cleans up the pauses.',
      sources: ['sos', 'zoomFxList'],
      check: ctx => {
        if (ctx.of('gate').length) return [];
        const loud = ctx.active.filter(s => (s.role === 'drive' || s.role === 'preamp') && (gainOf(s) ?? 0) >= 70);
        return loud.length ? [{ slots: loud.map(s => s.i), message: `${names(loud)} ${loud.length > 1 ? 'run' : 'runs'} with high gain. Add ZOOM NOISE REDUCTION after it.` }] : [];
      }
    },
    {
      id: 'eq.extreme-boost', severity: 'warning', topic: 'eq', title: 'Extreme EQ boost',
      why: 'Large boosts add a lot of level in one band, which can clip the following effects or make the low end boom. Cutting other bands is often cleaner than boosting.',
      sources: ['sos'],
      check: ctx => ctx.active.flatMap(s => boostParams(s).filter(b => b.value >= b.max * 0.75)
        .map(b => ({ slots: [s.i], message: `${s.label}: ${b.name} is +${b.value} dB.` })))
    },
    {
      id: 'reverb.mix-high', severity: 'warning', topic: 'low end', title: 'Very wet reverb on bass',
      why: 'Low frequencies in reverb build up quickly and muddy the mix. On bass, keep reverb subtle.',
      sources: ['soundbridge'],
      check: ctx => ctx.of('reverb').filter(s => (s.num('MIX') ?? 0) > 40).map(s => ({
        slots: [s.i], message: `${s.label} has MIX at ${s.num('MIX')}.`,
        fix: { label: 'Set MIX to 25', apply: p => setValue(p, s.i, 'MIX', 25) }
      }))
    },
    {
      id: 'mod.locut', severity: 'tip', topic: 'low end', title: 'Keep the lows out of the modulation',
      why: 'Modulating the lowest frequencies makes the low end wobble. Bass chorus pedals filter the lows out of the effect; LOCUT does the same here.',
      sources: ['mxrM83'],
      check: ctx => ctx.of('mod').filter(s => s.has('LOCUT') && (s.v('LOCUT') === 0 || s.v('LOCUT') === 'OFF')).map(s => ({
        slots: [s.i], message: `${s.label} has LOCUT off: try a cut around 100–200 Hz.`
      }))
    },

    // ---- effect-specific usage ----
    {
      id: 'amp.cabinet', severity: 'tip', topic: 'output', title: 'Set CABINET for where you plug in',
      why: 'Cabinet simulation is meant for PA systems and headphones. Into a real bass cabinet it stacks a second speaker colour and often sounds dark and lifeless.',
      sources: ['talkbassPod', 'darkglass'],
      check: ctx => ctx.output ? [] : ctx.of('amp').filter(s => s.has('CABINET')).map(s => ({
        slots: [s.i], message: `${s.fx.name}: keep CABINET high for PA or headphones, low when you play through a real bass amp. Choose where you plug in (Advice panel) for an exact check.`
      }))
    },
    {
      id: 'output.cab-into-amp', severity: 'warning', topic: 'output', title: 'Cabinet simulation into a real amp',
      why: 'CABINET blends the signal after the cabinet simulation with the raw pre-amp signal (0 = pre-amp only). Cabinet simulation is meant for PA systems and headphones; into a real bass cabinet it stacks a second speaker colour and often sounds dark and lifeless.',
      sources: ['zoomFxList', 'talkbassPod', 'darkglass'],
      check: ctx => ctx.output !== 'amp' ? [] : ctx.of('amp').filter(s => s.has('CABINET') && (s.num('CABINET') ?? 0) > 50).map(s => ({
        slots: [s.i], message: `${s.fx.name}: CABINET is ${s.num('CABINET')} but you plug into a bass amp. Lower it so the amp's own speaker is the only cabinet.`,
        fix: { label: 'Set CABINET to 0', apply: p => setValue(p, s.i, 'CABINET', 0) }
      }))
    },
    {
      id: 'output.cab-into-mixer', severity: 'warning', topic: 'output', title: 'No cabinet simulation into a mixer',
      why: 'Straight into a mixer, PA or headphones nothing colours the sound like a speaker would. With CABINET low the amp model sends its raw pre-amp signal, which tends to sound harsh and fizzy. Cabinet simulation is designed for exactly this case.',
      sources: ['zoomFxList', 'talkbassPod', 'darkglass'],
      check: ctx => ctx.output !== 'mixer' ? [] : ctx.of('amp').filter(s => s.has('CABINET') && (s.num('CABINET') ?? 0) < 50).map(s => ({
        slots: [s.i], message: `${s.fx.name}: CABINET is ${s.num('CABINET') ?? 0} but you plug into a mixer. Raise it to hear the cabinet.`,
        fix: { label: 'Set CABINET to 100', apply: p => setValue(p, s.i, 'CABINET', 100) }
      }))
    },
    {
      id: 'output.no-cab-mixer', severity: 'tip', topic: 'output', title: 'Distortion into a mixer without an amp model',
      why: 'A drive on its own has no speaker character. Straight into a mixer or PA it can sound fizzy; an amp model with CABINET up (cabinet simulation is made for PA and headphones) rounds it off.',
      sources: ['talkbassPod', 'darkglass'],
      check: ctx => ctx.output !== 'mixer' || ctx.of('amp').length || !ctx.of('drive').length ? [] : [{
        slots: [ctx.of('drive')[0].i], message: 'If the drive sounds fizzy in the mixer, add an amp model with CABINET high after it.'
      }]
    },
    {
      id: 'pitch.mono-chords', severity: 'tip', topic: 'usage', title: 'Mono pitch shifter: single notes only',
      why: 'BASS MONO PITCH SHIFTER is designed for single notes in the bass range. Use POLYPHONIC PITCH SHIFTER or POLYPHONIC OCTAVER for chords.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.fx.name === 'BASS MONO PITCH SHIFTER').map(s => ({ slots: [s.i], message: 'Play single notes with this effect.' }))
    },
    {
      id: 'pitch.harmony-key', severity: 'tip', topic: 'usage', title: 'Set the key for the harmonizer',
      why: 'HARMONY PITCH SHIFTER shifts according to the KEY and SCALE settings. A wrong key gives out-of-key harmonies.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => s.fx.name === 'HARMONY PITCH SHIFTER').map(s => ({ slots: [s.i], message: `KEY is ${s.v('KEY') ?? 'not set'}: match it to the song.` }))
    },
    {
      id: 'tracking.comp-help', severity: 'tip', topic: 'usage', title: 'Tracking glitches? Try light compression first',
      why: 'Octavers and synths track an even signal better. A lightly set compressor in front can help, while a heavy one can squash the attack they need.',
      sources: ['perfectCircuit'],
      check: ctx => {
        const tracker = ctx.first('tracking');
        if (!tracker || ctx.of('comp').some(s => s.i < tracker.i)) return [];
        return [{ slots: [tracker.i], message: `If ${tracker.fx.name} glitches, add a light compressor in front of it or play higher on the neck.` }];
      }
    },

    {
      id: 'usage.footswitch', severity: 'tip', topic: 'usage', title: 'Footswitch-controlled effect',
      why: 'This effect is operated with the footswitch (see its description in the Effects List), so its sound depends on how you press it. Try it on the pedal before relying on it.',
      sources: ['zoomFxList'],
      check: ctx => ctx.active.filter(s => ['HOLD DELAY', 'LOOP ROLL', 'KICK FLANGER', 'BOMBER'].includes(s.fx.name)).map(s => ({
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
    },

    // ---- style-specific ----
    {
      id: 'funk.comp-attack', severity: 'tip', topic: 'style', styles: ['funk'], title: 'Fast attack for slap',
      why: 'For slap and percussive funk playing a fast compressor attack tames popped notes and evens out the thumb.',
      sources: ['aguilar', 'yamahaComp'],
      check: ctx => ctx.active.filter(s => s.fx.name === 'DYNAMIC COMPRESSOR' && s.v('ATTACK') === 'SLOW').map(s => ({
        slots: [s.i], message: `${s.label} uses a SLOW attack.`, fix: { label: 'Set ATTACK to FAST', apply: p => setValue(p, s.i, 'ATTACK', 'FAST') }
      }))
    },
    {
      id: 'funk.no-comp', severity: 'tip', topic: 'style', styles: ['funk'], title: 'Funk usually starts with a compressor',
      why: 'Slap and funk lines have big level differences between thumb and pops; a compressor keeps them even.',
      sources: ['yamahaComp', 'thomannFunk'],
      check: ctx => ctx.of('comp').length ? [] : [{ message: 'Add DYNAMIC COMPRESSOR or OPTICAL COMPRESSOR near the start.' }]
    },
    {
      id: 'funk.no-envfilter', severity: 'tip', topic: 'style', styles: ['funk'], title: 'Try an envelope filter',
      why: 'The envelope filter (Mu-Tron style) is the signature funk bass effect: it opens with your attack like an automatic wah.',
      sources: ['premierFunk', 'thomannFunk'],
      check: ctx => ctx.of('envfilter').length ? [] : [{ message: 'Add ENVELOPE FILTER, Z TRON FILTER or BASS AUTO WAH early in the chain.' }]
    },
    {
      id: 'reggae.drive', severity: 'tip', topic: 'style', styles: ['reggae'], title: 'Reggae bass is usually clean',
      why: 'Reggae and dub bass is deep, warm and round. Distortion adds upper harmonics that work against it.',
      sources: ['soundfingers', 'premierReggae'],
      check: ctx => ctx.of('drive').map(s => ({ slots: [s.i], message: `${s.fx.name} adds grit; consider removing it.` }))
    },
    {
      id: 'reggae.treble', severity: 'tip', topic: 'style', styles: ['reggae'], title: 'Roll off the treble',
      why: 'Dub tones boost the bass and roll the treble (and often the mids) down for a deep, slightly muted sound.',
      sources: ['soundfingers', 'fenderRumble', 'premierReggae'],
      check: ctx => ctx.active.filter(s => s.role === 'amp' || s.role === 'preamp').filter(s => {
        const treble = boostParams(s).find(b => b.name === 'TREBLE');
        return treble ? treble.value > 0 : (s.num('TREBLE') ?? 0) > 50;
      }).map(s => ({ slots: [s.i], message: `${s.label}: TREBLE is ${s.num('TREBLE')}; turn it down.` }))
    },
    {
      id: 'jazz.gain', severity: 'tip', topic: 'style', styles: ['jazz'], title: 'Keep jazz tones clean',
      why: 'Jazz bass tones are warm and round, with the highs rolled back; drive is rarely part of it.',
      sources: ['talkbassJazz'],
      check: ctx => ctx.of('drive').filter(s => (gainOf(s) ?? 0) > 40).map(s => ({ slots: [s.i], message: `${s.label} has a lot of gain for a jazz tone.` }))
    },
    {
      id: 'jazz.reverb', severity: 'tip', topic: 'style', styles: ['jazz'], title: 'Just a touch of room',
      why: 'A small, low-mix room reverb adds air without blurring walking lines.',
      sources: ['soundbridge'],
      check: ctx => ctx.of('reverb').filter(s => (s.num('MIX') ?? 0) > 25).map(s => ({ slots: [s.i], message: `${s.label} has MIX at ${s.num('MIX')}.`, fix: { label: 'Set MIX to 15', apply: p => setValue(p, s.i, 'MIX', 15) } }))
    },
    {
      id: 'synth.first', severity: 'warning', topic: 'style', styles: ['synth'], title: 'Put the synth or octaver first',
      why: 'Synth and octave effects need the cleanest possible signal to track your notes, so they go at the very start of the chain.',
      sources: ['alderete', 'perfectCircuit'],
      check: ctx => {
        const first = ctx.active[0];
        const tracker = ctx.first('tracking');
        return tracker && first && tracker.i !== first.i ? [{ slots: [tracker.i], message: `${tracker.fx.name} is not the first effect.`, fix: { label: 'Move to the start', apply: p => move(p, tracker.i, 0) } }] : [];
      }
    }
  ]);

  // ---- personal preferences: a pinned choice hides the rules that would argue with it ------------------
  ADVICE.addPreferences([
    { id: 'gate-first', label: 'Noise reduction goes where I put it', hint: 'No tip about placing noise reduction before the drive.', silences: ['order.gate-before-gain'] },
    { id: 'time-before-gain', label: 'Delay or reverb before the drive is deliberate', hint: 'Hides the warning about time effects ahead of a drive or amp.', silences: ['order.time-before-gain'] },
    { id: 'mod-before-gain', label: 'Modulation before the drive is deliberate', hint: 'Hides the tip about modulation ahead of a drive or amp.', silences: ['order.mod-before-gain'] },
    { id: 'reverb-before-delay', label: 'Reverb before delay is deliberate', hint: 'Hides the tip about swapping reverb and delay.', silences: ['order.reverb-before-delay'] },
    { id: 'envfilter-after-drive', label: 'Envelope filter after the drive is deliberate', hint: 'Hides the tip about envelope filters after a drive.', silences: ['order.envfilter-after-drive'] },
    { id: 'comp-after-envfilter', label: 'Compressor after the envelope filter is deliberate', hint: 'Hides the tip about compression ahead of an envelope filter.', silences: ['order.comp-before-envfilter'] },
    { id: 'wet-drive', label: 'I like fully wet drives', hint: 'Hides the low-end warnings about drives with no clean signal.', silences: ['lowend.drive-no-dry', 'lowend.drive-blend'] },
    { id: 'wet-reverb', label: 'I like a very wet reverb', hint: 'Hides the warning about a high reverb mix.', silences: ['reverb.mix-high'] }
  ]);

  // ---- placement tips shown in the catalog, by effect role -------------------------------------------
  ADVICE.addRoleTips({
    octave: { place: 'First in the chain', text: 'Octavers track your pitch and need a clean, undistorted signal. Put them before compressors, drives and amps; a light compressor in front can help tracking.', sources: ['alderete', 'ebs', 'perfectCircuit'] },
    synth: { place: 'First in the chain', text: 'Synths track your notes like an octaver: keep them at the start, play single notes and mute between them for clean triggering.', sources: ['perfectCircuit', 'alderete'] },
    pitch: { place: 'Early, before drives', text: 'Pitch shifters track the incoming note and work best on a clean signal, before any distortion.', sources: ['alderete', 'boss'] },
    envfilter: { place: 'Early, before drives', text: 'Envelope filters react to your playing dynamics. Place them before drives; heavy compression in front reduces the sweep.', sources: ['yamaha', 'talkbassEnv'] },
    filter: { place: 'Early to middle', text: 'Filters shape the tone before drives and time effects. Try them before and after a drive: both are valid sounds.', sources: ['boss'] },
    comp: { place: 'Near the start', text: 'A compressor near the start evens out your dynamics before the rest of the chain. For slap use a fast attack; around 4:1 is a common starting ratio.', sources: ['boss', 'yamahaComp', 'aguilar'] },
    swell: { place: 'Near the start', text: 'Volume swell effects work on the attack of each note; keep them before drives and time effects.', sources: ['boss'] },
    gate: { place: 'After drives, before delay and reverb', text: 'Put noise reduction right after the drive or preamp that makes the noise, and before delay and reverb so their tails are not cut.', sources: ['sos', 'gearnews'] },
    drive: { place: 'After dynamics and filters', text: 'Drives sit after compressors, filters and octavers, before modulation and time effects. Keep some clean signal with BLEND, BALANCE or DRY to hold on to the low end.', sources: ['boss', 'reverbOD', 'bassMusician'] },
    preamp: { place: 'After drives, before amp and time effects', text: 'Preamps act as your tone and DI stage. Use their blend to keep the low end, and avoid stacking them with an amp model unless you want extra grit.', sources: ['boss', 'reverbOD'] },
    amp: { place: 'Late, before modulation and time effects', text: 'Amp models include the cabinet. Keep CABINET high for PA or headphones and low when you play through a real bass cabinet.', sources: ['talkbassPod', 'darkglass', 'boss'] },
    eq: { place: 'After drives and amps', text: 'An EQ after the drive or amp shapes the final tone. Prefer cuts over large boosts to avoid clipping and boom.', sources: ['sos', 'boss'] },
    mod: { place: 'After drives and amps', text: 'Modulation adds shimmer to the finished tone. On bass keep the lows steady with LOCUT where available.', sources: ['yamaha', 'mxrM83'] },
    delay: { place: 'Near the end, before reverb', text: 'Delays go after drives and amps; most players put them before reverb. Keep the mix moderate on bass.', sources: ['yamaha', 'soundbridge'] },
    reverb: { place: 'Last', text: 'Reverb usually closes the chain. On bass keep the mix low: reverberant lows quickly muddy the mix.', sources: ['yamaha', 'soundbridge'] },
    linesel: { place: 'In front of the effects to skip', text: 'LINE SELECTOR sends the signal to the next effect or straight to the outputs, so effects after it can be skipped. It does nothing as the last effect.', sources: ['zoomFxList'] },
    fretless: { place: 'Early, before drives', text: "The fretless simulator reshapes each note's attack; keep it before drives and time effects.", sources: ['boss'] },
    sfx: { place: 'Anywhere — experiment', text: 'Special effects are controlled from the footswitch; place them where the sound they act on is the one you want.', sources: ['zoomFxList'] }
  });

  // ---- style profiles ---------------------------------------------------------------------------------
  // severity: per-rule overrides while the style is active. starter: a chain to load (values in display units).
  // avoids: effect roles that work against the style (backed by that style's own rules); used by the style suggestions.
  ADVICE.addStyles([
    { id: 'general', name: 'General', summary: 'Neutral advice for any style.', severity: {}, sources: ['boss', 'yamaha'], starter: null },
    {
      id: 'funk', name: 'Funk & Slap', summary: 'Even dynamics, a quick envelope filter and a punchy preamp. Fast compressor attack for slap.',
      severity: {}, sources: ['premierFunk', 'thomannFunk', 'yamahaComp'],
      starter: { name: 'FUNK SLAP', effects: [
        { effect: 'ENVELOPE FILTER', values: { THRSHLD: 50, ATTACK: 60, MODE: 'UP', VOL: 80 } },
        { effect: 'DYNAMIC COMPRESSOR', values: { SENSE: 6, ATTACK: 'FAST', TONE: 55, VOL: 80 } },
        { effect: 'BASS DRIVER PREAMP', values: { BASS: 55, TREBLE: 60, PRESENC: 55, BLEND: 40, GAIN: 30, VOL: 70, 'MID-FREQ': '1.0 kHz', MID: 45 } }
      ] }
    },
    {
      id: 'rock', name: 'Rock', summary: 'Mild overdrive with the clean low end blended in, into a classic amp.',
      severity: {}, sources: ['reverbOD', 'bassMusician', 'boss'],
      starter: { name: 'ROCK DRIVE', effects: [
        { effect: 'DYNAMIC COMPRESSOR', values: { SENSE: 4, ATTACK: 'SLOW', TONE: 50, VOL: 80 } },
        { effect: 'BLUEBERRY DRIVE', values: { GAIN: 55, TONE: 55, BLEND: 50, VOL: 75 } },
        { effect: 'AG 750', values: { GAIN: 40, VOL: 70, CABINET: 60, DEEP: 'OFF', BRIGHT: 'OFF', BASS: 55, MID: 55, TREBLE: 50 } }
      ] }
    },
    {
      id: 'metal', name: 'Metal & Djent', summary: 'Tight distortion that keeps a clean low end, noise reduction after the drive, EQ for definition.',
      severity: { 'gate.suggest': 'warning', 'lowend.drive-blend': 'warning' }, sources: ['nailthemix', 'neuraldsp', 'sos'],
      starter: { name: 'METAL GRIND', effects: [
        { effect: '1176 LIMITER', values: { INPUT: 40, RATIO: '4:1', RELEASE: 40, OUTPUT: 40 } },
        { effect: 'DARK OVERDRIVE', values: { GAIN: 65, ATTACK: 'BOOST', BLEND: 50, VOL: 75 } },
        { effect: 'ZOOM NOISE REDUCTION', values: { DETECT: 'GTRIN', DEPTH: 60, THRSHLD: 35, DECAY: 30 } },
        { effect: 'BASS GRAPHIC EQ', values: { '50Hz': 2, '120Hz': 0, '400Hz': -3, '500Hz': -2, '800Hz': 2, '4.5kHz': 3, '10kHz': 0, VOL: 80 } }
      ] }
    },
    {
      id: 'reggae', name: 'Reggae & Dub', summary: 'Deep, warm and round: lows up, treble rolled off, no distortion.',
      severity: {}, avoids: ['drive'], sources: ['soundfingers', 'premierReggae', 'fenderRumble'],
      starter: { name: 'DUB DEEP', effects: [
        { effect: 'OPTICAL COMPRESSOR', values: { DRIVE: 4, LO: 60, HI: 30, VOL: 80 } },
        { effect: 'SUPER LOW PREAMP', values: { GAIN: 30, ENHANCE: 60, SUB: 40, LO: 70, MID: 40, HI: 20, BALANCE: 60, VOL: 70 } },
        { effect: 'FLIPTOP', values: { GAIN: 25, VOL: 70, CABINET: 60, ULTRA: 'LOW', BRIGHT: 'OFF', BASS: 6, MID: -3, TREBLE: -8 } }
      ] }
    },
    {
      id: 'jazz', name: 'Jazz & Fretless', summary: 'Warm and round, light compression, a touch of room.',
      severity: {}, avoids: ['drive'], sources: ['talkbassJazz', 'soundbridge'],
      starter: { name: 'JAZZ WARM', effects: [
        { effect: 'OPTICAL COMPRESSOR', values: { DRIVE: 3, LO: 50, HI: 40, VOL: 80 } },
        { effect: 'FLIPTOP', values: { GAIN: 20, VOL: 70, CABINET: 50, ULTRA: 'OFF', BRIGHT: 'OFF', BASS: 2, MID: 0, TREBLE: -4 } },
        { effect: 'ROOM REVERB', values: { 'PRE DLY': 10, DECAY: 5, MIX: 15, TAIL: 'ON' } }
      ] }
    },
    {
      id: 'synth', name: 'Synth & Electronic', summary: 'Synth first on a clean signal, then dynamics and space.',
      severity: {}, sources: ['perfectCircuit', 'alderete'],
      starter: { name: 'SYNTH BASS', effects: [
        { effect: 'Z-SYNTHESIZER', values: { FREQ: 5, RANGE: 10, DECAY: 50, RESO: 8, WAVE: 'SAW', TONE: 6, BALANCE: 70, VOL: 75 } },
        { effect: 'DYNAMIC COMPRESSOR', values: { SENSE: 5, ATTACK: 'FAST', TONE: 50, VOL: 80 } },
        { effect: 'MODULATION DELAY', values: { TIME: 350, MODE: 'SHORT', REPEAT: 25, MIX: 20 } }
      ] }
    }
  ]);
})();
