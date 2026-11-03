// Tone ideas by bassist, shown on tones.html. Every fact cites a source registered in advice-rules.js (ADVICE.sources).
// A bassist without its own `chain` uses the starter chain of its style. Chains are starting points built from Zoom MS-60B+
// models that come closest to the documented gear; manufacturer names only describe sonic character.
// Requires ADVICE (advice-engine.js + advice-rules.js).

const TONE_IDEAS = [
  {
    id: 'novoselic', name: 'Krist Novoselic', band: 'Nirvana', style: 'grunge',
    summary: 'Big, gritty grunge bass: a RAT-style distortion in front of an Ampeg SVT.',
    facts: [
      { text: 'The ProCo Rat 2 was his distortion pedal of choice; an MXR Distortion+ was used in the Bleach era.', source: 'novoselicGear' },
      { text: 'An Ampeg SVT 400T saw a lot of road and was most likely used to record Nevermind.', source: 'novoselicGear' }
    ],
    approach: 'SQUEAK DISTORTION models the ProCo RAT and AMPG SVT the Ampeg SVT. DRY keeps some clean low end under the distortion.'
  },
  {
    id: 'hook', name: 'Peter Hook', band: 'Joy Division, New Order', style: 'postpunk',
    summary: 'Melodic lead bass high on the neck, with a heavy chorus.',
    facts: [
      { text: 'He often used the bass as a lead instrument, playing melodies on the high strings with a heavy chorus effect.', source: 'hookWiki' },
      { text: 'His distinctive tone comes from a chorus pedal, an Electro-Harmonix Clone Theory.', source: 'hookWiki' }
    ],
    approach: 'CLONE CHORUS models the Electro-Harmonix Small Clone, the closest chorus on the Zoom MS-60B+. Play the melodies high on the neck.'
  },
  {
    id: 'deal', name: 'Kim Deal', band: 'Pixies', style: 'indie',
    summary: 'Driving, no-frills pick playing: a Precision bass straight into an Ampeg SVT.',
    facts: [
      { text: 'Her main bass was a 1962 Fender Precision reissue, run live into an Ampeg SVT.', source: 'dealMixdown' },
      { text: 'She plays with a pick, a habit from guitar, and uses a compressor on stage.', source: 'dealMixdown' }
    ],
    approach: 'AMPG SVT with a light DYNAMIC COMPRESSOR in front. Play with a pick.'
  },
  {
    id: 'chancellor', name: 'Justin Chancellor', band: 'Tool', style: 'altmetal',
    summary: 'Punchy, driven midrange with delays set for different speeds.',
    facts: [
      { text: 'A Boss GEB-7 bass EQ and a Pro Co Turbo RAT reinforce his bass tone.', source: 'chancellorPG' },
      { text: 'Two Boss DD-3 delays are set for different speeds, one for "The Grudge" and one for steadier repeats.', source: 'chancellorPG' }
    ],
    approach: 'SQUEAK DISTORTION for the RAT, BASS GRAPHIC EQ for the GEB-7 (a lift around 800 Hz) and DELAY for the DD-3.'
  },
  {
    id: 'kerr', name: 'Mike Kerr', band: 'Royal Blood', style: 'fuzzrock',
    summary: 'One bass that sounds like bass and guitar: octaves and fuzz.',
    facts: [
      { text: 'The Electro-Harmonix POG2 octave pedal is the center of Royal Blood’s signature sound.', source: 'kerrMixdown' },
      { text: 'A Big Muff Pi gives his big, open live tone; Fender amps cover both the bass and the guitar side.', source: 'kerrMixdown' }
    ],
    approach: 'POLYPHONIC OCTAVER adds the octave up and down (the "guitar" layer), NEW YORK MUFF FUZZ models the Big Muff and B-MAN100 the Fender Bassman. The Zoom MS-60B+ has one output, so bass and guitar amps cannot be split.'
  },
  {
    id: 'wolstenholme', name: 'Chris Wolstenholme', band: 'Muse', style: 'fuzzrock',
    summary: 'Overdriven fuzz bass layered with synth.',
    facts: [
      { text: 'He uses effects such as distortion and octavers to create overdriven fuzz bass tones, and combines them with synthesisers.', source: 'wolstenholmeWiki' },
      { text: 'One of his amp setups is distorted with a Big Muff; he mostly plays with his fingers.', source: 'wolstenholmeWiki' }
    ],
    approach: 'BASS SYNTHESIZER first (its OCT adds the octave below), then NEW YORK MUFF FUZZ for the Big Muff. Keep the synth before the fuzz so it tracks the clean notes.',
    chain: { name: 'FUZZ SYNTH', effects: [
      { effect: 'BASS SYNTHESIZER', values: { MODE: 'UP', SENSE: 60, ATTACK: 20, RANGE: 50, RESO: 40, OCT: 50, BALANCE: 50, VOL: 75 } },
      { effect: 'NEW YORK MUFF FUZZ', values: { SUSTAIN: 70, TONE: 45, BALANCE: 70, VOL: 70 } }
    ] }
  }
];
