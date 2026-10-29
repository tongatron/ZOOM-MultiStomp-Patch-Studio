// Zoom MS-60B+ effects catalog — original text from the official ZOOM Effects List (Z2I-5216-01, 2024).
// Order = Effects List order; the index matches assets/effects/fx-NNN.png.
// Format: [name, category, reference model, description, tags, parameters]
// Parameters: [display name, description, range]
// Tags: fs = footswitch controlled, st = stereo output, sync = tempo sync (metronome), dry = dry signal blend

// Categories: label and color used by the catalog and the patch builder.
const CATEGORIES = {
  DYNAMICS: { label: 'Dynamics', color: '#3fb950' },
  FILTER: { label: 'Filter', color: '#39c5cf' },
  DRIVE: { label: 'Drive', color: '#f0883e' },
  PREAMP: { label: 'Preamp', color: '#db61a2' },
  MODULATION: { label: 'Modulation', color: '#a371f7' },
  'PITCH SHIFT': { label: 'Pitch Shift', color: '#d29922' },
  SYNTH: { label: 'Synth', color: '#ff7b72' },
  DELAY: { label: 'Delay', color: '#58a6ff' },
  REVERB: { label: 'Reverb', color: '#7ee2b8' },
  SFX: { label: 'SFX', color: '#8b949e' },
  'BASS AMP': { label: 'Bass Amp', color: '#e3b341' }
};

const VOL = ['VOL', 'Adjusts the volume.', '0 – 100'];
const MIX = ['MIX', 'Adjusts the amount of effected sound that is mixed with the original sound.', '0 – 100'];
const DRY = ['DRY', 'Adjusts the volume of the unaffected sound.', '0 – 100'];
const BAL = ['BALANCE', 'Adjusts the balance between original and effect sounds.', '0 – 100'];
const BLEND = ['BLEND', 'Adjusts the balance between original and effect sounds.', '0 – 100'];
const PRE_BLEND = ['BLEND', 'Adjusts the balance between the original sound and the effected sound.', '0 – 100'];
const TAIL = ['TAIL', 'When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.', 'OFF, ON'];
const CAB = ['CABINET', 'Adjusts the mix balance of the signal after the pre-amp and the signal after the cabinet.', '0 – 100'];
const DLY_MODE = ['MODE', 'Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.', 'SHORT, LONG, ♩'];
const REPEAT = ['REPEAT', 'Adjusts the number of repeats.', '0 – 100'];
const PREDLY = ['PRE DLY', 'Adjusts the delay between input of the original sound and start of the reverb sound.', '1 – 100'];
const DECAY = ['DECAY', 'Sets the duration of the reverberations.', '1 – 30'];
const FS_LATCH = ['ON/OFF', 'Sets the foot switch function.', 'LATCH, UNLATCH'];
const GAIN = ['GAIN', 'Adjusts the gain.', '0 – 100'];
const TONE = (range = '0 – 100') => ['TONE', 'Adjusts the tone.', range];
const LOWS = (range = '0 – 100', name = 'BASS') => [name, 'Adjusts volume of low frequencies.', range];
const HIGHS = (range = '0 – 100', name = 'TREBLE') => [name, 'Adjusts volume of high frequencies.', range];
const MIDS = (range = '0 – 100') => ['MID', 'Adjusts volume of middle frequencies.', range];
const PRE_MID = ['MID', 'Adjusts the volume of middle frequencies.', '0 – 100'];
const PRESENC = ['PRESENC', 'Adjusts volume of super-high frequencies.', '0 – 100'];
const MID_FREQ = range => ['MID-FREQ', 'Adjusts the center frequency of the mid-range.', range];
const DEPTH = (range = '0 – 100') => ['DEPTH', 'Sets the depth of the modulation.', range];
const RATE = (range = '0 – 100', name = 'RATE') => [name, 'Sets the speed of the modulation.', range];
const RESO = range => ['RESO', 'Sets effect resonance.', range];
const SENSE = range => ['SENSE', 'Adjusts the sensitivity of the effect.', range];
const LOCUT = ['LOCUT', 'Sets the cut-off frequency in the low range of the effect sound.', 'OFF, 60 Hz – 800 Hz'];
const GEQ = ['50 Hz', '120 Hz', '400 Hz', '500 Hz', '800 Hz', '4.5 kHz', '10 kHz'].map(band => [band.replace(' ', ''), `Boosts or cuts the low (${band}) frequency band.`, '-12.0 – 12.0']);
const AMP_LOW = range => LOWS(range);
const AMP_HIGH = range => HIGHS(range);
const AMP_BRIGHT = ['BRIGHT', 'Adjusts the high-frequency character.', 'OFF, ON'];
const AMP_DEEP = ['DEEP', 'Adjusts the low-frequency character.', 'OFF, ON'];

const EFFECTS_DATA = [
  // DYNAMICS
  ['DYNAMIC COMPRESSOR', 'DYNAMICS', 'MXR Dyna Comp', 'This is a simulation of the MXR Dyna Comp. Added parameters allow you to adjust the tone and the compressor attack speed.', [], [
    SENSE('0 – 10'), ['ATTACK', 'Sets compressor attack speed to FAST or SLOW.', 'SLOW, FAST'], TONE(), VOL]],
  ['BLACK OPTICAL COMPRESSOR', 'DYNAMICS', 'Demeter COMP-1 Compulator', 'This is a simulation of the Demeter COMP-1 Compulator. Added parameters allow you to adjust the tone.', [], [
    ['COMP', 'Adjusts the depth of the compression.', '0 – 100'], LOWS('0 – 100', 'LO'), HIGHS('0 – 100', 'HI'), VOL]],
  ['OPTICAL COMPRESSOR', 'DYNAMICS', null, 'This is an optical compressor.', [], [
    ['DRIVE', 'Adjusts the depth of the compression.', '0 – 10'], LOWS('0 – 100', 'LO'), HIGHS('0 – 100', 'HI'), VOL]],
  ['DUAL COMPRESSOR', 'DYNAMICS', null, 'This is a compressor which allows separate settings for the low frequency and high frequency range.', [], [
    ['FREQ', 'Adjusts the crossover point between the high frequency and low frequency range.', '300 Hz – 1.5 kHz'], ['LOCOMP', 'Adjusts the compression depth in the low frequency range.', '0 – 50'], ['HICOMP', 'Adjusts the compression depth in the high frequency range.', '0 – 50'], VOL]],
  ['MULTIBAND COMPRESSOR', 'DYNAMICS', 'MultiComp (MODE: MB)', 'This is a simulation of the MultiComp (MODE:MB).', [], [
    ['COMP', 'Adjusts the depth of the compression.', '0 – 100'], ['LOTHR', 'Adjusts the threshold that triggers the low-frequency effect.', '0 – 100'], ['HITHR', 'Adjusts the threshold that triggers the high-frequency effect.', '0 – 100'], VOL]],
  ['GLAM COMPRESSOR', 'DYNAMICS', null, 'This compressor becomes a glamorous tone as increasing the Shape parameter. Also, you can mix the original sound.', ['dry'], [
    ['COMP', 'Adjusts the depth of the compression.', '0 – 100'], ['SHAPE', 'Emphasizes high and low frequencies.', '0 – 10'], VOL, DRY]],
  ['160 COMPRESSOR', 'DYNAMICS', 'dbx 160A', 'This compressor is in the style of the dbx 160A.', [], [
    ['THRSHLD', 'Adjusts the threshold that determines when the effect is activated.', '-60 – 0'], ['RATIO', 'Adjusts the compression ratio.', '1.0 – 10.0'], ['KNEE', 'Sets the type of knee.', 'SOFT, HARD'], VOL]],
  ['1176 LIMITER', 'DYNAMICS', 'UREI 1176LN', 'This is a simulation of the UREI 1176LN.', [], [
    ['INPUT', 'Adjusts the input level.', '0 – 80'], ['RATIO', 'Adjusts the compression ratio.', '4:1, 8:1, 12:1, 20:1'], ['RELEASE', 'This is a limiter that suppresses signal peaks above a certain reference level.', '10 – 70'], ['OUTPUT', 'Adjusts the output level.', '0 – 80']]],
  ['ZOOM NOISE REDUCTION', 'DYNAMICS', 'ZOOM original', 'ZOOM\'s unique noise reduction cuts noise during pauses in playing without affecting the tone.', [], [
    ['DETECT', 'Sets control signal detection level.', 'GTRIN, EFXIN'], ['DEPTH', 'Sets the depth of noise reduction.', '0 – 100'], ['THRSHLD', 'Adjusts the effect sensitivity.', '0 – 100'], ['DECAY', 'Adjust the envelope release.', '0 – 100']]],
  ['SLOW ATTACK', 'DYNAMICS', null, 'This effect slows the attack of each note, resulting in a violin-like performance.', [], [
    ['TIME', 'Adjusts the attack time.', '1 – 50'], ['CURVE', 'Set the curve of volume change during attack.', '0 – 10'], TONE(), VOL]],

  // FILTER
  ['BASS AUTO WAH', 'FILTER', null, 'You can adjust the mix of this bass guitar auto-wah with the original signal.', ['dry'], [
    SENSE('-10 – -1, 1 – 10'), RESO('0 – 10'), DRY, VOL]],
  ['ENVELOPE FILTER', 'FILTER', 'MXR Envelope Filter', 'This models the MXR envelope filter.', [], [
    ['THRSHLD', 'Adjusts the effect sensitivity.', '0 – 100'], ['ATTACK', 'Adjusts the attack speed.', '0 – 100'], ['MODE', 'Sets direction of movement of the filter.', 'UP, DOWN'], VOL]],
  ['AUTO FILTER', 'FILTER', null, 'This is a resonance filter with a sharp envelope.', ['dry'], [
    ['MODE', 'Sets direction of movement of the filter.', 'UP, DOWN'], SENSE('1 – 10'), ['PEAK', 'Adjusts the Q value of the filter.', '0 – 10'], DRY]],
  ['Z TRON FILTER', 'FILTER', 'Q-Tron (LP mode)', 'This is like a Q-Tron Envelope Filter in LP mode.', ['dry'], [
    SENSE('-10 – -1, 1 – 10'), RESO('0 – 10'), DRY, VOL]],
  ['BASS CRY FILTER', 'FILTER', null, 'This talking modulator is suitable for the bass frequency range.', ['dry'], [
    ['RANGE', 'Adjusts the frequency range processed by the effect.', '1 – 10'], RESO('0 – 10'), SENSE('-10 – -1, 1 – 10'), BAL]],
  ['ENVELOPE GENERATOR FILTER', 'FILTER', null, 'This filter effect is controlled using the foot switch.', ['fs', 'dry'], [
    ['FREQ1', 'Sets the frequency when the foot switch is off.', '0 – 100'], ['FREQ2', 'Sets the frequency when the foot switch is on.', '0 – 100'], RESO('0 – 100'), ['TYPE', 'Sets filter type.', 'HPF2 – LPF4'], RATE('0 – 100', 'SPEED'), BAL, VOL]],
  ['SEQUENCE FILTER', 'FILTER', 'Z.Vex Seek-Wah', 'The sequence filter has the flavor of a Z.Vex Seek-Wah.', [], [
    ['STEP', 'Adjusts number of sequence steps.', '2 – 8'], ['PATTERN', 'Sets effect pattern.', '1 – 8'], RATE('1 – 50', 'SPEED'), RESO('0 – 10')]],
  ['BASS GRAPHIC EQ', 'FILTER', null, 'This 7-band graphic equalizer is suitable for the bass frequency range.', [], [...GEQ, VOL]],
  ['STEREO BASS GRAPHIC EQ', 'FILTER', null, 'This stereo graphic equalizer has 7 bands that suit bass guitar frequencies.', ['st'], [...GEQ, VOL]],
  ['BASS PARAMETRIC EQ', 'FILTER', null, 'This 1-band parametric equalizer is suitable for the bass frequency range.', [], [
    ['FREQ', 'Sets the frequency of the equalizer.', '20 Hz – 20 kHz'], ['Q', 'Adjusts equalizer Q.', '0.5 – 16.0'], ['GAIN', 'Adjusts the gain.', '-20.0 – 20.0'], VOL]],
  ['LOW EQ', 'FILTER', null, 'Designed for low frequencies, this equalizer allows you to select the type.', [], [
    ['TYPE', 'Sets filter type.', 'SHELF, HPF'], ['FREQ', 'Sets the frequency of the filter.', '20 Hz – 640 Hz'], ['GAIN', 'Adjusts the gain. This setting is disabled when the Type parameter is set to HPF.', '-12.0 – 12.0'], VOL]],
  ['HIGH EQ', 'FILTER', null, 'Designed for high frequencies, this equalizer allows you to select the type.', [], [
    ['TYPE', 'Sets filter type.', 'SHELF, LPF'], ['FREQ', 'Sets the frequency of the filter.', '500 Hz – 20 kHz'], ['GAIN', 'Adjusts the gain. This setting is disabled when the Type parameter is set to LPF.', '-12.0 – 12.0'], VOL]],
  ['SPLITTER', 'FILTER', null, 'This effect divides the signal into two bands (high/low) and lets you freely adjust the mix ratio of the two bands.', [], [
    ['FREQ', 'Adjusts the crossover point between the high frequency and low frequency band.', '80 Hz – 2.5 kHz'], ['LO', 'Adjusts the mix ratio of the low frequency band.', '0 – 100'], ['HI', 'Adjusts the mix ratio of the high frequency band.', '0 – 100'], VOL]],
  ['EXCITER', 'FILTER', null, 'This exciter enables flexible control.', ['fs'], [
    ['BASS', 'Adjusts the amount of low-frequency phase correction.', '0 – 100'], ['TREBLE', 'Adjusts the amount of high-frequency phase correction.', '0 – 100'], VOL, FS_LATCH]],

  // DRIVE
  ['EP DRIVE', 'DRIVE', 'Maestro Echoplex (preamp)', 'This models the Maestro Echoplex preamp.', [], [
    GAIN, LOWS('-10 – 10'), HIGHS('-10 – 10'), VOL]],
  ['RC DRIVE', 'DRIVE', null, 'This booster covers sounds ranging from clean boosts to light drives.', [], [
    GAIN, LOWS(), HIGHS(), VOL]],
  ['BASS TS DRIVE', 'DRIVE', 'Ibanez TS808', 'Simulation of the Ibanez TS808. An added parameter allows you to adjust the balance of original sound and distortion.', ['dry'], [
    GAIN, TONE(), BAL, VOL]],
  ['BASS OVERDRIVE', 'DRIVE', 'BOSS ODB-3', 'Simulates the ODB-3 overdrive bass machine from BOSS.', ['dry'], [
    GAIN, TONE(), BAL, VOL]],
  ['BLUEBERRY DRIVE', 'DRIVE', 'Mad Professor Blueberry Bass Overdrive', 'This is a simulation of the MAD PROFESSOR Blueberry Bass Overdrive. An added parameter allows you to adjust the balance of original sound and distortion.', ['dry'], [
    GAIN, TONE(), BLEND, VOL]],
  ['DARK OVERDRIVE', 'DRIVE', 'Darkglass Microtubes B3K', 'This is a simulation of the Darkglass Electronics Microtubes B3K.', ['dry'], [
    GAIN, ['ATTACK', 'Adjusts volume of high frequencies.', 'CUT, FLAT, BOOST'], BLEND, VOL]],
  ['SQUEAK DISTORTION', 'DRIVE', 'ProCo RAT', 'This models a ProCo RAT. A parameter has been added that allows you to adjust the mix level of the original sound.', ['dry'], [
    GAIN, ['FILTER', 'Adjusts the tone.', '0 – 100'], VOL, DRY]],
  ['VOODOO-B DISTORTION', 'DRIVE', 'Roger Mayer Voodoo-Bass', 'This is a simulation of the ROGER MAYER VOODOO-BASS. An added parameter allows you to adjust the balance of original sound and distortion.', ['dry'], [
    GAIN, TONE(), BLEND, VOL]],
  ['BASS OCTAVE FUZZ', 'DRIVE', null, 'This fuzz effect adds an octave above.', ['dry'], [
    ['BOOST', 'Adjusts the gain.', '0 – 100'], TONE(), ['FUZZ', 'This adjusts the amount of fuzz in the mix.', '0 – 100'], DRY]],
  ['NEW YORK MUFF FUZZ', 'DRIVE', 'Electro-Harmonix Big Muff Pi', 'This models an Electro-Harmonix Big Muff Pi. An added parameter allows you to adjust the balance of original sound and distortion.', ['dry'], [
    ['SUSTAIN', 'Adjusts the gain.', '0 – 100'], TONE(), BAL, VOL]],
  ['BASS FUZZ SMILE', 'DRIVE', 'Fuzz Face', 'This models a FUZZ FACE. An added parameter allows you to adjust the balance of original sound and distortion.', ['dry'], [
    GAIN, TONE(), BAL, VOL]],
  ['BASS METAL DRIVE', 'DRIVE', 'BOSS Metal Zone', 'This models a BOSS Metal Zone. An added parameter allows you to adjust the balance of original sound and distortion.', ['dry'], [
    GAIN, TONE(), BAL, VOL]],
  ['TS+BOOST DRIVE', 'DRIVE', null, 'This effect combines TS Drive and Booster.', [], [
    ['GAIN', 'Adjusts gain of TS Drive.', '0 – 100'], ['TONE', 'Adjusts tone of TS Drive.', '0 – 100'], ['VOL', 'Adjusts volume of TS Drive.', '0 – 100'], ['COMP', 'Sets the clipping type of TS Drive.', '0 – 2'], ['BOOST', 'Adjusts gain of Booster.', '0 – 100'], ['BASS', 'Adjusts low frequencies volume of booster.', '0 – 100'], ['TREBLE', 'Adjusts high frequencies volume of booster.', '0 – 100'], ['ORDER', 'Set the connection order of TS Drive and Booster.', 'BOOST-OD, OD-BOOST']]],

  // PREAMP
  ['BASS DRIVER PREAMP', 'PREAMP', 'SansAmp Bass Driver DI', 'This is a simulation of the SansAmp BASS DRIVER DI.', ['dry'], [
    LOWS(), HIGHS(), PRESENC, PRE_BLEND, GAIN, VOL, MID_FREQ('500 Hz, 1.0 kHz'), PRE_MID]],
  ['D.I PLUS PREAMP', 'PREAMP', 'MXR Bass D.I.+', 'This is a simulation of the MXR Bass D.I.+, which has both clean and distortion channels.', ['dry'], [
    LOWS(), PRE_MID, HIGHS(), ['COLOR', 'This turns the preset EQ ON or OFF for the clean channel.', 'OFF, ON'], ['CHANNEL', 'Switches between clean and distortion channels.', 'CLEAN, DIST'], ['BLEND', 'Adjusts the balance between the original sound and the effected sound for the distortion channel.', '0 – 100'], ['GAIN', 'Adjusts the gain of the distortion channel.', '0 – 100'], VOL]],
  ['DARK PREAMP', 'PREAMP', 'Darkglass Microtubes B7K', 'This is a simulation of the Darkglass Electronics Microtubes B7K.', ['dry'], [
    LOWS(), ['LO-MID', 'Adjusts the volume of lower middle frequencies.', '0 – 100'], ['HI-MID', 'Adjusts the volume of higher middle frequencies.', '0 – 100'], HIGHS(), PRE_BLEND, GAIN, VOL, ['BOOST', 'This sets the frequency bands boosted.', 'OFF, LO, HI, LO+HI']]],
  ['CLEAR DRIVER PREAMP', 'PREAMP', 'ZOOM original', 'This original preamp model with distinct distortion uses linear phase EQ. When mixed with the original sound, a clear distortion without phase interference can be achieved.', ['dry'], [
    LOWS(), MID_FREQ('100 Hz – 1.0 kHz'), PRE_MID, HIGHS(), PRESENC, PRE_BLEND, GAIN, VOL]],
  ['1073 PREAMP', 'PREAMP', null, 'This sound models a vintage mic preamp characterized by its transformers.', [], [
    ['GAIN', 'Adjusts the gain.', '20 – 50'], ['BASS-F', 'Adjusts the center frequency of the low-range.', '55 Hz, 220 Hz'], ['BASS', 'Adjusts the volume of low frequencies.', '-50 – 50'], ['MID-F', 'Adjusts the center frequency of the mid-range.', '350 Hz – 3.2 kHz'], ['MID', 'Adjusts the volume of middle frequencies.', '-50 – 50'], ['TRBL-F', 'Adjusts the center frequency of the high-range.', '10 kHz, 16 kHz'], ['TREBLE', 'Adjusts the volume of high frequencies.', '-50 – 50'], VOL]],
  ['SOLID PREAMP', 'PREAMP', null, 'This models a solid-state mic preamp made by a console manufacturer. Control of harmonics is a feature.', [], [
    GAIN, ['HARMNIC', 'Use to adjust the amount of harmonics.', '0 – 100'], ['LOTYPE', 'Sets filter type of the low-range.', 'SHELF, PEQ'], ['LO-FREQ', 'Adjusts the center frequency of the low-range.', '40 Hz – 600 Hz'], LOWS('-50 – 50', 'LO'), ['HI-FREQ', 'Adjusts the center frequency of the high-range.', '1.5 kHz – 22.0 kHz'], HIGHS('-50 – 50', 'HI'), VOL]],
  ['DI-5 PREAMP', 'PREAMP', 'Avalon Design U5', 'This simulates the AVALON DESIGN U5 preamp.', [], [
    GAIN, TONE('OFF, 1 – 6'), ['HICUT', 'Cuts high frequencies when ON.', 'OFF, ON'], VOL]],
  ['SB PREAMP 1', 'PREAMP', null, 'This is a preamp model with a 3-band equalizer.', [], [
    LOWS('0 – 10'), MIDS('-10 – 10'), HIGHS('0 – 10'), VOL]],
  ['BBB PREAMP', 'PREAMP', 'Xotic Bass BB Preamp', 'This is a simulation of the Xotic Bass BB Preamp.', [], [
    GAIN, LOWS('-10 – 10'), HIGHS('-10 – 10'), VOL]],
  ['SUPER LOW PREAMP', 'PREAMP', 'ZOOM original', 'This original amp model achieves extremely low frequencies.', ['dry'], [
    ['GAIN', 'Adjusts the gain. Changes the ENHNC effect.', '0 – 100'], ['ENHANCE', 'Emphasizes low frequencies.', '0 – 100'], ['SUB', 'Adjust the volume of one octave down.', '0 – 100'], LOWS('0 – 100', 'LO'), PRE_MID, HIGHS('0 – 100', 'HI'), ['BALANCE', 'Adjusts the balance between the original sound and the effected sound.', '0 – 100'], VOL]],
  ['DJENT PREAMP', 'PREAMP', 'ZOOM original', 'This original amp model combines a distortion-free low end with an extremely distorted high end. This is perfect for Djent sounds using basses with 5 or more strings.', [], [
    LOWS(), ['LO-MID', 'Adjusts the volume of lower middle frequencies.', '0 – 100'], ['HI-MID', 'Adjusts the volume of higher middle frequencies.', '0 – 100'], HIGHS(), ['HIBOOST', 'Turns boost ON/OFF in the high frequencies.', 'OFF, ON'], ['LOCUT', 'Sets the cut-off frequency in the low range.', 'OFF, 20 Hz – 120 Hz'], GAIN, VOL]],

  // MODULATION
  ['CLONE CHORUS', 'MODULATION', 'Electro-Harmonix Small Clone', 'This analog chorus sound models the Electro-Harmonix SmallClone.', [], [
    DEPTH('1, 2'), RATE(), TONE(), MIX]],
  ['CHORUS ONE', 'MODULATION', 'BOSS CH-1 Super Chorus', 'This models the sound of a BOSS CH-1 SUPER CHORUS.', [], [
    DEPTH(), RATE(), TONE(), MIX]],
  ['TRI CHORUS', 'MODULATION', 'tc electronic Corona Tri-Chorus', 'This is a model of tc electronic\'s CORONA Tri-Chorus.', [], [
    DEPTH(), RATE('0 – 100', 'SPEED'), TONE(), MIX]],
  ['BASS STEREO CHORUS', 'MODULATION', null, 'This stereo chorus for bass has a clear sound quality.', ['st'], [
    DEPTH(), RATE('1 – 50'), LOCUT, MIX]],
  ['BASS VINTAGE FLANGER', 'MODULATION', 'MXR M-117R', 'This analog flanger sound is similar to an MXR M-117R. A parameter has been added to cut low frequencies from the effect sound.', [], [
    DEPTH(), RATE('0 – 50'), RESO('-10 – 10'), LOCUT]],
  ['KICK FLANGER', 'MODULATION', null, 'This flanger is controlled using the foot switch.', ['fs'], [
    ['PRE DLY', 'Sets pre-delay time of effect sound.', '0 – 100'], DEPTH(), RATE(), RESO('0 – 100'), MIX, ['RESET-F', 'Adjusts the LFO reset frequency.', '0 – 100'], FS_LATCH]],
  ['BASS DETUNE', 'MODULATION', null, 'By mixing a small amount of the pitch-shifted effect sound with the original sound, a natural bass chorus effect is achieved.', [], [
    ['CENT', 'Adjusts the detuning in cents, which are fine increments of 1/100-semitone.', '-50 – 50'], ['PRE DLY', 'Sets the pre-delay time of the effect sound.', '0 – 50'], TONE('0 – 10'), MIX]],
  ['ORANGE TREMOLO', 'MODULATION', null, 'This effect varies the volume at a regular rate.', [], [
    ['WAVE', 'Sets the modulation waveform.', 'TRIANGLE, TUBE, SQUARE'], DEPTH(), RATE(), VOL]],
  ['PHASER', 'MODULATION', null, 'This effect adds a phasing variation to the sound.', [], [
    ['COLOR', 'Sets the tone of the effect type.', '4 STG, 8 STG, INV 4, INV 8'], DEPTH(), RATE('1 – 50'), RESO('0 – 100')]],
  ['BASS PHASER', 'MODULATION', null, 'This phaser is good for bass frequencies.', [], [
    ['COLOR', 'Sets the sound color.', '1, 2'], DEPTH(), RATE(), RESO('0 – 100')]],
  ['THE VIBE', 'MODULATION', null, 'This vibe sound features unique undulations.', [], [
    RATE('0 – 50', 'SPEED'), DEPTH(), ['MODE', 'Sets effect to vibrato or chorus.', 'VIBRT, CHORS'], VOL]],

  // PITCH SHIFT
  ['BASS OCTAVER', 'PITCH SHIFT', null, 'This effect adds sound one octave below the original sound.', ['dry'], [
    ['OCT', 'Adjusts the level of the one-octave lower sound component.', '0 – 100'], LOWS('0 – 10', 'LO'), HIGHS('0 – 10', 'HI'), DRY]],
  ['BASS ANALOG OCTAVER', 'PITCH SHIFT', null, 'This simulates an analog octaver. Modulation can be applied to the octave below, adding depth to the sound.', ['dry'], [
    ['OCT1', 'Adjusts the level of the sound one octave below the effect sound.', '0 – 100'], ['OCT2', 'Adjusts the level of the sound two octaves below the effect sound.', '0 – 100'], ['MOD', 'Sets how much the octave below sound is modulated.', '0 – 100'], DRY]],
  ['POLYPHONIC OCTAVER', 'PITCH SHIFT', null, 'This octaver supports chord playing.', ['dry'], [
    LOWS('0 – 100', 'LO'), HIGHS('0 – 100', 'HI'), ['WET', 'Adjust the amount of the effect sound in the mix.', '0 – 100'], ['DRY', 'Adjust the amount of the original sound in the mix.', '0 – 100']]],
  ['BASS MONO PITCH SHIFTER', 'PITCH SHIFT', null, 'This pitch shifter was designed specifically for playing single notes in the bass frequency range.', ['dry'], [
    ['SHIFT', 'Adjusts the pitch shift amount in semitones. Selecting "0" gives a detuning effect.', '-12 – 12, 24'], ['FINE', 'Allows fine adjustment of pitch shift amount in Cent (1/100 semitone) steps.', '-25 – 25'], TONE('0 – 10'), BAL]],
  ['HARMONY PITCH SHIFTER', 'PITCH SHIFT', null, 'This intelligent pitch shifter outputs the effect sound with the pitch shifted according to scale and key settings.', [], [
    ['SCALE', 'Sets the pitch of the pitch-shifted sound added to the original sound. (-6/-5/-4/-3 = 6th/5th/4th/3rd down, Major · -m = 3rd down, Minor · m = 3rd up, Minor · 3/4/5/6 = 3rd/4th/5th/6th up, Major)', '-6, -5, -4, -3, -m, m, 3, 4, 5, 6'], ['KEY', 'Sets the tonic (root) of the scale used for pitch shifting.', 'C, C#, D, D#, E, F, F#, G, G#, A, A#, B'], TONE('0 – 10'), MIX]],
  ['POLYPHONIC PITCH SHIFTER', 'PITCH SHIFT', null, 'This pitch shifter supports chord playing.', ['dry'], [
    ['SHIFT', 'Adjusts the pitch shift amount in semitones.', '-24 – 24'], TONE(), ['WET', 'Adjust the amount of the effect sound in the mix.', '0 – 100'], ['DRY', 'Adjust the amount of the original sound in the mix.', '0 – 100']]],

  // SYNTH
  ['BASS SYNTHESIZER', 'SYNTH', 'ZOOM original', 'ZOOM original bass synthesizer sound.', ['dry'], [
    ['MODE', 'Sets direction of movement of the filter.', 'UP, DOWN'], ['SENSE', 'Adjusts the sensitivity for trigger detection.', '0 – 100'], ['ATTACK', 'Adjusts the attack speed.', '0 – 100'], ['RANGE', 'Adjusts the amount of cut-off frequency modulation.', '0 – 100'], RESO('0 – 100'), ['OCT', 'Adjusts the level of the one-octave lower sound component.', '0 – 100'], BAL, VOL]],
  ['Z-SYNTHESIZER', 'SYNTH', null, 'This bass synthesizer sound adds analog synth fatness.', ['dry'], [
    ['FREQ', 'Sets the cut-off frequency of the lowpass filter.', '0 – 10'], ['RANGE', 'Adjusts the amount of cut-off frequency modulation.', '0 – 20'], ['DECAY', 'Adjusts the speed of tone modulation.', '0 – 100'], RESO('0 – 20'), ['WAVE', 'Selects the waveform.', 'SAW, SQUARE'], TONE('0 – 10'), BAL, VOL]],
  ['BASS TALK SYNTHESIZER', 'SYNTH', null, 'This effect for bass produces a synthesizer sound similar to a talking modulator producing vowels.', ['dry'], [
    ['TYPE', 'Selects a vowel variation.', 'IA, UE, UA, OA'], ['SENSE', 'Adjusts the sensitivity for trigger detection.', '0 – 100'], ['ATTACK', 'Adjusts the attack speed.', '0 – 100'], RESO('0 – 100'), TONE('0 – 10'), ['OCT', 'Adjusts the level of the one-octave lower sound component.', '0 – 100'], BAL, VOL]],

  // DELAY
  ['DELAY', 'DELAY', null, 'This long delay has a maximum length of 4000 ms.', ['sync'], [
    ['TIME', 'Sets the delay time.', '1 – 4000'], DLY_MODE, REPEAT, MIX]],
  ['ANALOG DELAY', 'DELAY', null, 'This analog delay simulation has a long delay with a maximum length of 4000 ms.', ['sync'], [
    ['TIME', 'Sets the delay time.', '1 – 4000'], DLY_MODE, REPEAT, MIX]],
  ['TAPE ECHO', 'DELAY', null, 'This effect simulates a tape echo. Changing the "Time" parameter changes the pitch of the echoes.', ['sync'], [
    ['TIME', 'Sets the delay time.', '1 – 2000'], DLY_MODE, REPEAT, MIX]],
  ['DUAL DELAY', 'DELAY', 'Eventide TimeFactor DigitalDelay', 'This effect combines 2 delays and is based on the Eventide TimeFactor DigitalDelay.', ['sync', 'st', 'dry'], [
    ['TIMEA', 'Adjusts the delay time of Delay A.', '0 – 1490'], ['TIMEB', 'Adjusts the delay time of Delay B.', '0 – 1490'], ['MODE', 'Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.', 'TIME, ♩'], BAL, ['REP A', 'Adjusts the number of Delay A repeats.', '0 – 110'], ['REP B', 'Adjusts the number of Delay B repeats.', '0 – 110'], ['DLYMX', 'Adjust the mix of the Delay A and B effect sounds.', '0 – 100'], ['DEPTH', 'Sets the depth of the modulation. Also sets the output to mono (M0.M50) or stereo (S0.S50).', 'MN-0 – ST-50']]],
  ['REVERSE DELAY', 'DELAY', null, 'This reverse delay is a long delay with a maximum length of 2000 ms.', ['sync', 'dry'], [
    ['TIME', 'Sets the delay time.', '10 – 2000'], DLY_MODE, REPEAT, BAL]],
  ['MODULATION DELAY', 'DELAY', null, 'This delay effect allows the use of modulation.', ['sync'], [
    ['TIME', 'Sets the delay time.', '1 – 2000'], DLY_MODE, REPEAT, MIX]],
  ['HOLD DELAY', 'DELAY', null, 'This hold delay effect is controlled using the foot switch. When you press the foot switch, the effect turns on, and when you release it, the effect sound is held.', ['fs', 'sync', 'st'], [
    ['TIME', 'Sets the delay time.', '1 – 4000'], DLY_MODE, REPEAT, ['HI-DMP', 'Adjusts the treble attenuation of the delay sound.', '0 – 10'], TONE(), MIX, ['P-P', 'Sets delay output to mono or Ping Pong.', 'MONO, P-P'], TAIL]],

  // REVERB
  ['ROOM REVERB', 'REVERB', null, 'This reverb effect simulates the acoustics of a room.', [], [PREDLY, DECAY, MIX, TAIL]],
  ['BRIGHT ROOM REVERB', 'REVERB', null, 'This room reverb simulation can provide bright reverberations.', [], [PREDLY, DECAY, TONE('0 – 10'), MIX]],
  ['SPRING REVERB', 'REVERB', null, 'This reverb effect simulates a spring reverb.', [], [PREDLY, DECAY, MIX, TAIL]],
  ['HALL REVERB', 'REVERB', null, 'This reverb effect simulates the acoustics of a concert hall.', [], [PREDLY, DECAY, MIX, TAIL]],
  ['BRIGHT HALL REVERB', 'REVERB', null, 'This hall reverb simulation can provide bright reverberations.', [], [PREDLY, DECAY, TONE('0 – 10'), MIX]],
  ['AIR REVERB', 'REVERB', null, 'This effect reproduces the ambience of a room, to create spatial depth.', [], [
    ['SIZE', 'Sets the size of the space.', '1 – 100'], ['REFLECT', 'Adjusts the amount of reflection from the wall.', '0 – 10'], MIX, TAIL]],

  // SFX
  ['LOOP ROLL', 'SFX', null, 'This effect allows you use the footswitch to sample and hold what you play.', ['fs', 'dry'], [
    ['TIME', 'Sets the loop time.', '10 – 4000'], ['DUTY', 'Sets the time that the sample-and-hold sound is produced.', '25 – 100'], BAL, FS_LATCH]],
  ['PHASER+DISTORTION', 'SFX', 'Roland Jet Phaser', 'This effect combines a phaser and distortion in the style of the Roland JET PHASER.', [], [
    ['MODE', 'Selects the jet sound mode.', '1 – 4'], RATE('0 – 50'), RESO('0 – 10'), VOL]],
  ['FRETLESS SIMULATOR', 'SFX', null, 'Turns the sound from any bass guitar into a fretless bass sound.', [], [
    SENSE('0 – 30'), ['COLOR', 'Adjusts the harmonics contents of the sound. Higher setting values result in stronger effect character.', '1 – 10'], TONE('1 – 50'), VOL]],
  ['BOMBER', 'SFX', null, 'This effect generates explosive sounds.', ['fs'], [
    ['DECAY', 'Adjusts the length of the explosive sound.', '1 – 100'], TONE('0 – 10'), MIX, ['ON/OFF', 'Sets the foot switch function.', 'LATCH, TRIGGER']]],
  ['LINE SELECTOR', 'SFX', null, 'The LINE SELECTOR sets whether the input signal is sent to the next effect or the OUTPUT jacks. (ON = NEXT EFFECT, OFF = OUTPUT)', ['fs'], [
    ['EFX LVL', 'This adjusts the level sent to the next effect when set to NEXT EFFECT.', '0 – 150'], ['OUT LVL', 'This adjusts the level sent to the output jacks when set to OUTPUT.', '0 – 150']]],

  // BASS AMP
  ['FLIPTOP', 'BASS AMP', 'Ampeg B-15N', 'This models the sound of the Ampeg B-15N bass amplifier.', [], [
    GAIN, VOL, CAB, ['ULTRA', 'Emphasizes high and low frequencies.', 'OFF, HI, LOW, BOTH'], AMP_BRIGHT, AMP_LOW('-20.0 – 20.0'), MIDS('-20.0 – 20.0'), AMP_HIGH('-20.0 – 20.0')]],
  ['AMPG SVT', 'BASS AMP', 'Ampeg SVT', 'This models the sound of the Ampeg SVT.', [], [
    GAIN, VOL, CAB, ['ULTRA', 'Emphasizes high and low frequencies.', 'OFF, LOW, HI, BOTH, CUT'], AMP_LOW('-20.0 – 20.0'), MID_FREQ('32 Hz – 6.3 kHz'), MIDS('-20.0 – 20.0'), AMP_HIGH('-20.0 – 20.0')]],
  ['AG 750', 'BASS AMP', 'Aguilar DB 750', 'This models the sound of the Aguilar DB 750.', [], [
    GAIN, VOL, CAB, AMP_DEEP, AMP_BRIGHT, AMP_LOW('0 – 100'), MIDS(), AMP_HIGH('0 – 100')]],
  ['SMR400', 'BASS AMP', 'SWR SM-400', 'This models the sound of the SWR SM-400.', [], [
    GAIN, VOL, CAB, ['ENHANCE', 'This tone control changes the frequency and level according to the knob position.', '0 – 100'], AMP_LOW('-15.0 – 15.0'), MID_FREQ('32 Hz – 6.3 kHz'), MIDS('-15.0 – 15.0'), AMP_HIGH('-15.0 – 15.0')]],
  ['EBH360', 'BASS AMP', 'EBS HD360', 'This models the sound of the EBS HD360 bass amplifier.', [], [
    GAIN, VOL, CAB, ['CHARA', 'Emphasizes high and low frequencies.', 'OFF, ON'], AMP_LOW('-10.0 – 10.0'), MIDS('-10.0 – 10.0'), AMP_HIGH('-10.0 – 10.0'), ['BRIGHT', 'Adjusts the high-frequency character.', '0 – 100']]],
  ['MINI MARK-B', 'BASS AMP', 'Markbass Minimark 802', 'This models the sound of the Markbass MINIMARK 802 bass amplifier.', [], [
    GAIN, VOL, CAB, ['SHAPE', 'These filters boost low and high frequencies while cutting middle frequencies.', '0 – 100'], ['VINTAGE', 'Adjusts the tone.', '0 – 100']]],
  ['TE400SMX', 'BASS AMP', 'Trace Elliot AH400SMX', 'This models the sound of the Trace Elliot AH400SMX.', [], [
    GAIN, VOL, CAB, ['STYLE', 'Three preset tones can be used to match the playing style.', 'PICK, SLAP, FINGER'], ['SHAPE', 'These presets boost low and high frequencies while cutting middle frequencies.', 'OFF, 1, 2'], AMP_LOW('-15.0 – 15.0'), MIDS('-15.0 – 15.0'), AMP_HIGH('-15.0 – 15.0')]],
  ['B-MAN100', 'BASS AMP', 'Fender Bassman 100', 'This models the sound of the Fender Bassman 100.', [], [
    ['GAIN', 'Adjusts the gain.', '10 – 100'], ['VOL', 'Adjusts the volume.', '10 – 100'], ['CABINET', CAB[1], '10 – 100'], AMP_DEEP, AMP_LOW('10 – 100'), MID_FREQ('32 Hz – 6.3 kHz'), MIDS('10 – 100'), AMP_HIGH('10 – 100')]],
  ['AC 370', 'BASS AMP', 'Acoustic 370', 'This models the sound of the Acoustic 370 bass amplifier.', [], [
    GAIN, VOL, CAB, AMP_BRIGHT, AMP_LOW('0 – 100'), MID_FREQ('32 Hz – 6.3 kHz'), MIDS(), AMP_HIGH('0 – 100')]],
  ['SUN CB', 'BASS AMP', null, 'This models the sound of a vintage solid-state amp from the 70s.', [], [
    ['DIST', 'Adjusts the gain. Set this to OFF to switch to a clean channel.', 'OFF – 100'], VOL, CAB, ['INPUT', 'Selects the input channel.', 'NORMAL, BRIGHT'], ['HIBOOST', 'Turns boost ON/OFF in the high frequencies.', 'OFF, ON'], AMP_LOW('0 – 100'), MIDS(), AMP_HIGH('0 – 100')]],
  ['MONOTONE', 'BASS AMP', null, 'This models the sound of a solid-state combo amp that is great for jazz.', [], [
    VOL, CAB, ['MODE', 'Sets the tone of the character.', 'DARK, NORMAL, BRIGHT'], AMP_LOW('0 – 100'), MIDS(), AMP_HIGH('0 – 100'), PRESENC]]
];
