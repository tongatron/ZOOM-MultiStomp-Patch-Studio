// Zoom MS-70CDR+ effects catalog — original text from the official ZOOM Effects List (© 2024, E_MS-70CDRplus_FX-list.pdf).
// Extracted with tools/extract-effects-list.py; descriptions and parameter text are not reworded.
// Reference model and feature tags are derived from the descriptions.

const CATEGORIES = {
  "MODULATION": {
    "label": "Modulation",
    "color": "#a371f7"
  },
  "DELAY": {
    "label": "Delay",
    "color": "#58a6ff"
  },
  "REVERB": {
    "label": "Reverb",
    "color": "#7ee2b8"
  },
  "SFX": {
    "label": "SFX",
    "color": "#8b949e"
  },
  "DYNAMICS": {
    "label": "Dynamics",
    "color": "#3fb950"
  },
  "FILTER": {
    "label": "Filter",
    "color": "#39c5cf"
  }
};

const EFFECTS_DATA = [
  [
    "CHORUS",
    "MODULATION",
    null,
    "This effect moves the sound image cyclically left and right.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "CLONE CHORUS",
    "MODULATION",
    "Electro-Harmonix SmallClone",
    "This analog chorus sound models the Electro-Harmonix SmallClone.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "1 – 2"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "CHORUS ONE",
    "MODULATION",
    "BOSS CH-1 Super Chorus",
    "This models the sound of a BOSS CH-1 Super Chorus.",
    [
      "dry",
      "st"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "OUTPUT",
        "Sets output to mono or stereo. When stereo, effect sound is output from L channel and unchanged input sound is output from R channel.",
        "MONO, STEREO"
      ]
    ]
  ],
  [
    "GREEN CHORUS",
    "MODULATION",
    "TC Electronics's CORONA CHORUS",
    "This is a model of TC Electronics's CORONA CHORUS.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DRY",
        "When ON, the original sound and the effect sound are mixed and output together. When OFF, only the effect sound is output.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "TRI CHORUS",
    "MODULATION",
    "TC Electronics's CORONA Tri-Chorus",
    "This is a model of TC Electronics's CORONA Tri-Chorus.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DRY",
        "When ON, the original sound and the effect sound are mixed and output together. When OFF, only the effect sound is output.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "ANALOG CHORUS",
    "MODULATION",
    "analog chorus",
    "This effect simulates an analog chorus.",
    [
      "dry",
      "st"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets modulation speed.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "OUTPUT",
        "Sets output to mono or stereo. When stereo, effect sound is output from L channel and unchanged input sound is output from R channel.",
        "MONO, STEREO"
      ]
    ]
  ],
  [
    "VINTAGE CHORUS",
    "MODULATION",
    "BOSS CE-1",
    "This is a simulation of the BOSS CE-1.",
    [
      "dry"
    ],
    [
      [
        "COMP",
        "Sets the sensitivity of the compressor.",
        "0 – 9"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "CHORUS FIVE",
    "MODULATION",
    "BOSS CE-5",
    "This chorus is a model of the BOSS CE-5.",
    [
      "dry",
      "st"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "OUTPUT",
        "Sets output to mono or stereo. When stereo, effect sound is output from L channel and unchanged input sound is output from R channel.",
        "MONO, STEREO"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 120"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS CHORUS",
    "MODULATION",
    null,
    "You can cut the low frequencies of this bass chorus effect sound.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "LOCUT",
        "Specifies the low-range cutoff point for the effect sound.",
        "OFF – 800Hz"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "PRE DLY",
        "Turns pre-delay OFF or ON.",
        "OFF, ON"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ENSEMBLE CHORUS",
    "MODULATION",
    null,
    "Ensemble This is a chorus ensemble that features three-dimensional movement.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS ENSEMBLE CHORUS",
    "MODULATION",
    null,
    "This bass chorus ensemble features a sense of three-dimensional movement.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "STEREO CHORUS",
    "MODULATION",
    null,
    "This is a stereo chorus with a clear tone.",
    [
      "dry",
      "st"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BEND CHORUS",
    "MODULATION",
    null,
    "This effect provides pitch bending that uses the input signal as trigger and processes each note separately.",
    [
      "dry"
    ],
    [
      [
        "MODE",
        "Sets direction of pitch bend.",
        "UP, DOWN"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "TIME",
        "Sets time before effect starts.",
        "0 – 50"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ]
    ]
  ],
  [
    "SILKY CHORUS",
    "MODULATION",
    null,
    "This chorus effect combines 2 bands of detuning and chorus for precise control.",
    [],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "CHO MIX",
        "Adjusts the amount of chorus in the mix.",
        "0 – 100"
      ],
      [
        "LO-PIT",
        "Adjusts the amount of pitch modulation for the low-frequency detuning.",
        "-25 – 25"
      ],
      [
        "HI-PIT",
        "Adjusts the amount of pitch modulation for the high-frequency detuning.",
        "-25 – 25"
      ],
      [
        "LO MIX",
        "Adjusts the amount of low-frequency detuning in the mix.",
        "0 – 100"
      ],
      [
        "HI MIX",
        "Adjusts the amount of high-frequency detuning in the mix.",
        "0 – 100"
      ],
      [
        "PRE DLY",
        "Sets pre-delay time of effect sound.",
        "0 – 50"
      ]
    ]
  ],
  [
    "MIRAGE CHORUS",
    "MODULATION",
    null,
    "This chorus shimmers like a mirage.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "PRE DLY",
        "Sets pre-delay time of effect sound.",
        "1 – 20"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DETUNE",
    "MODULATION",
    "ZOOM original",
    "By mixing an effect sound that is slightly pitch-shifted with the original sound, this effect type has a chorus effect without much sense of modulation.",
    [
      "dry"
    ],
    [
      [
        "CENT",
        "Adjusts the detuning in cents, which are fine increments of 1/100-semitone.",
        "-25 – 25"
      ],
      [
        "PRE DLY",
        "Sets the pre-delay time of the effect sound.",
        "0 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS DETUNE",
    "MODULATION",
    "ZOOM original",
    "By mixing a small amount of the pitch-shifted effect sound with the original sound, a natural bass chorus effect is achieved.",
    [
      "dry"
    ],
    [
      [
        "CENT",
        "Adjusts the detuning in cents, which are fine increments of 1/100-semitone.",
        "-50 – 50"
      ],
      [
        "PRE DLY",
        "Sets the pre-delay time of the effect sound.",
        "0 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "LOCUT",
        "Sets the cut frequency in the low range of the effect sound.",
        "OFF – 800Hz"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "TREMOLO",
    "MODULATION",
    null,
    "This effect varies the volume at a regular rate.",
    [],
    [
      [
        "WAVE",
        "Sets the modulation waveform.",
        "UP 0 – TRI 9"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ORANGE TREMOLO",
    "MODULATION",
    null,
    "This effect varies the volume at a regular rate.",
    [],
    [
      [
        "WAVE",
        "Sets the modulation waveform.",
        "TRI, TUBE, SQR"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DUO TREMOLO",
    "MODULATION",
    null,
    "This effect combines two tremolos.",
    [],
    [
      [
        "WAVE A",
        "Sets the modulation waveform of Wave A.",
        "UP 0 – TRI 9"
      ],
      [
        "WAVE B",
        "Sets the modulation waveform of Wave B.",
        "UP 0 – TRI 9"
      ],
      [
        "DEPTH A",
        "Adjusts depth of Wave A modulation.",
        "0 – 100"
      ],
      [
        "DEPTH B",
        "Adjusts depth of Wave B modulation.",
        "0 – 100"
      ],
      [
        "RATE A",
        "Adjusts speed of Wave A modulation.",
        "0 – 50"
      ],
      [
        "RATE B",
        "Adjusts speed of Wave B modulation.",
        "0 – 50"
      ],
      [
        "LINK",
        "Sets how the two tremolos are connected.",
        "SERI, PARA, STR"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "PHASER",
    "MODULATION",
    null,
    "This effect adds a phasing variation to the sound.",
    [],
    [
      [
        "COLOR",
        "Sets the tone of the effect type.",
        "4 STG, 8 STG, INV 4, INV 8"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "STONE PHASER",
    "MODULATION",
    "Electro-Harmonix SmallStone",
    "This phaser sound models the Electro-Harmonix SmallStone.",
    [],
    [
      [
        "COLOR",
        "Sets the sound color.",
        "1 – 2"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 100"
      ]
    ]
  ],
  [
    "WARP PHASER",
    "MODULATION",
    null,
    "This phaser has a one way effect.",
    [],
    [
      [
        "MODE",
        "Sets direction of warping.",
        "GO, BACK"
      ],
      [
        "SPEED",
        "Sets modulation speed.",
        "1 – 50"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DUO PHASER",
    "MODULATION",
    null,
    "This effect combines two phasers.",
    [
      "st"
    ],
    [
      [
        "DEPTH A",
        "Sets the depth of LFO A modulation.",
        "1 – 100"
      ],
      [
        "RATE A",
        "Sets the speed of LFO A modulation.",
        "1 – 50"
      ],
      [
        "RESO A",
        "Sets the resonance of LFO A modulation.",
        "0 – 10"
      ],
      [
        "LINK",
        "Sets how 2 phasers are connected.",
        "SERIAL, PARALLEL, STEREO"
      ],
      [
        "DEPTH B",
        "Sets the depth of LFO B modulation.",
        "1 – 100"
      ],
      [
        "RATE B",
        "Sets the speed of LFO B modulation.",
        "1 – 50, SYNCA, RVRSA"
      ],
      [
        "RESO B",
        "Sets the resonance of LFO B modulation.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "THE VIBE",
    "MODULATION",
    null,
    "This vibe sound features unique undulations.",
    [],
    [
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets effect to vibrato or chorus.",
        "VIBRT, CHORS"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "WAVE",
        "Adjusts modulation waveform.",
        "0 – 100"
      ],
      [
        "BIAS",
        "Adjusts bias of waveform modulation.",
        "0 – 100"
      ]
    ]
  ],
  [
    "FLANGER",
    "MODULATION",
    null,
    "This is a jet sound like an A/DA Flanger.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Sets pre-delay time of effect sound.",
        "0 – 50"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "RESO",
        "Adjusts the intensity of the modulation resonance.",
        "-10 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS FLANGER",
    "MODULATION",
    "ZOOM original",
    "Modeled after the A/DA Flanger, this effect has an added parameter that allows you to adjust the volume balance between the original and effected sounds.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Sets pre-delay time of effect sound.",
        "0 – 50"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "RESO",
        "Adjusts the intensity of the modulation resonance.",
        "-10 – 10"
      ],
      [
        "LOCUT",
        "Sets the cut-off frequency in the low range of the effect sound.",
        "OFF – 800Hz"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "VINTAGE FLANGER",
    "MODULATION",
    null,
    "This analog flanger sound is similar to an MXR M-117R.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Sets pre-delay time of effect sound.",
        "0 – 50"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "-10 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS VINTAGE FLANGER",
    "MODULATION",
    null,
    "This analog flanger sound is similar to an MXR M-117R. A parameter has been added to cut low frequencies from the effect sound.",
    [],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "-10 – 10"
      ],
      [
        "LOCUT",
        "Sets the cut-off frequency in the low range of the effect sound.",
        "OFF – 800Hz"
      ]
    ]
  ],
  [
    "BF FLANGER 2",
    "MODULATION",
    "BOSS BF-2 Flanger",
    "This models a BOSS BF-2 Flanger.",
    [],
    [
      [
        "PRE DLY",
        "Sets pre-delay time of effect sound.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "RESO",
        "Adjusts the intensity of the modulation resonance.",
        "0 – 100"
      ]
    ]
  ],
  [
    "KICK FLANGER",
    "MODULATION",
    null,
    "This flanger is controlled using the foot switch.",
    [
      "dry",
      "fs"
    ],
    [
      [
        "PRE DLY",
        "Sets pre-delay time of effect sound.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "RESO",
        "Sets the foot switch function.",
        "0 – 100"
      ],
      [
        "MIX",
        "Sets effect resonance.",
        "0 – 100"
      ],
      [
        "RESET-F",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "ON/OFF",
        "Adjusts the LFO reset frequency.",
        "LATCH, UNLATCH"
      ]
    ]
  ],
  [
    "DYNAMIC FLANGER",
    "MODULATION",
    null,
    "The volume of the effect sound changes according to the input signal level with this dynamic flanger.",
    [],
    [
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "-10 – 10"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "RESO",
        "Adjusts the intensity of the modulation resonance.",
        "-10 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "VIBRATO",
    "MODULATION",
    null,
    "This effect automatically adds vibrato.",
    [
      "dry"
    ],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SWELL VIBRATO",
    "MODULATION",
    null,
    "This effect modulates the pitch after picking.",
    [],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "RISE",
        "Sets the time before the effect begins to modulate the pitch.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "OCTAVER",
    "MODULATION",
    "ZOOM original",
    "This effect adds sound one octave and two octaves below the original sound.",
    [
      "dry"
    ],
    [
      [
        "OCT1",
        "Adjusts the level of the sound one octave below the effect sound.",
        "0 – 100"
      ],
      [
        "OCT2",
        "Adjusts the level of the sound two octaves below the effect sound.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "DRY",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ],
      [
        "CHARA",
        "Adjusts effect character.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS OCTAVER",
    "MODULATION",
    "ZOOM original",
    "This effect adds sound one octave below the original sound.",
    [
      "dry"
    ],
    [
      [
        "OCT",
        "Adjusts the level of the one-octave lower sound component.",
        "0 – 100"
      ],
      [
        "DRY",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "0 – 10"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 10"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS ANALOG OCTAVER",
    "MODULATION",
    "analog octaver",
    "This simulates an analog octaver. Modulation can be applied to the octave below, adding depth to the sound.",
    [
      "dry"
    ],
    [
      [
        "OCT1",
        "Adjusts the level of the sound one octave below the effect sound.",
        "0 – 100"
      ],
      [
        "OCT2",
        "Adjusts the level of the sound two octaves below the effect sound.",
        "0 – 100"
      ],
      [
        "MOD",
        "Sets how much the octave below sound is modulated.",
        "0 – 100"
      ],
      [
        "DRY",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "POLYPHONIC OCTAVER",
    "MODULATION",
    null,
    "This octaver supports chord playing.",
    [
      "dry"
    ],
    [
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "WET",
        "Adjust the amount of the effect sound in the mix.",
        "0 – 100"
      ],
      [
        "DRY",
        "Adjust the amount of the original sound in the mix.",
        "0 – 100"
      ]
    ]
  ],
  [
    "HARMONY PITCH SHIFTER",
    "MODULATION",
    null,
    "This intelligent pitch shifter outputs the effect sound with the pitch shifted according to scale and key settings.",
    [
      "dry"
    ],
    [
      [
        "SCALE",
        "Sets the pitch of the pitch-shifted sound added to the original sound.",
        "-6 – 6 ( See Table 1 )"
      ],
      [
        "KEY",
        "Sets the tonic (root) of the scale used for pitch shifting.",
        "C – B"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "POLYPHONIC PITCH SHIFTER",
    "MODULATION",
    null,
    "This pitch shifter supports chord playing.",
    [
      "dry"
    ],
    [
      [
        "SHIFT",
        "Adjusts the pitch shift amount in semitones.",
        "-24 – 24"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "WET",
        "Adjust the amount of the effect sound in the mix.",
        "0 – 100"
      ],
      [
        "DRY",
        "Adjust the amount of the original sound in the mix.",
        "0 – 100"
      ]
    ]
  ],
  [
    "GEMINOS DOUBLER",
    "MODULATION",
    null,
    "This effect allows you to obtain doubling tracking in real time.",
    [
      "dry",
      "st"
    ],
    [
      [
        "TIGHT",
        "Adjusts the tightness of the doubling track king.",
        "0 – 100"
      ],
      [
        "MODE",
        "Select Stereo / Mono and select the number of tracks.",
        "MN-3, MN-2, MN-1, ST-1, ST-2, ST-3"
      ],
      [
        "WET",
        "Adjust the amount of the effect sound in the mix.",
        "0 – 100"
      ],
      [
        "DRY",
        "ust the amount of the original sound in the mix.",
        "0 – 100"
      ]
    ]
  ],
  [
    "RING MODULATOR",
    "MODULATION",
    null,
    "This effect produces a metallic ringing sound. Adjusting the \"Freq\" parameter results in a drastic change of sound character.",
    [
      "dry"
    ],
    [
      [
        "FREQ",
        "Sets the frequency of the modulation.",
        "1 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SLICER",
    "MODULATION",
    null,
    "This effect creates a rhythmical sound by continuously slicing the input.",
    [
      "dry"
    ],
    [
      [
        "PTTRN",
        "Sets effect pattern.",
        "1 – 20"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "THRSH",
        "Adjusts effect threshold.",
        "0 – 50"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DELAY",
    "DELAY",
    null,
    "This long delay has a maximum length of 4000 mS.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 4000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "HIDMP",
        "Adjusts the treble attenuation of the delay sound.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "ANALOG DELAY",
    "DELAY",
    null,
    "This analog delay simulation has a long delay with a maximum length of 4000 mS.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 4000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "HIDMP",
        "Adjusts the treble attenuation of the delay sound.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "P-P",
        "Sets delay output to mono or ping-pong.",
        "MONO, P-P"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off",
        "OFF, ON"
      ]
    ]
  ],
  [
    "TAPE ECHO",
    "DELAY",
    "tape echo",
    "This effect simulates a tape echo. Changing the \"Time\" parameter changes the pitch of the echoes.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "HIDMP",
        "Adjusts the treble attenuation of the delay sound.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "TAPE ECHO 3",
    "DELAY",
    "Maestro Echoplex EP-3",
    "This tape echo effect models the Maestro Echoplex EP-3.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "10 – 2900"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "P-AMP",
        "Sets whether the TapeEcho3 preamp affects the tone when the echo effect is off. When OFF, the input sound is output without being changed. When ON, the preamp affects the tone.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "AC TAPE ECHO",
    "DELAY",
    null,
    "This tape echo sound has been tailored for acoustic instruments.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Set the delay time.",
        "1 – 1000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjust the amount of effect sound mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, the effect sound is sustained even if the effect itself is turned off. When OFF, the effect sound also stops when the effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "DUAL DELAY",
    "DELAY",
    "Eventide TimeFactor DigitalDelay",
    "This effect combines 2 delays and is based on the Eventide TimeFactor DigitalDelay.",
    [
      "sync",
      "dry",
      "st"
    ],
    [
      [
        "TIMEA",
        "Adjusts the delay time of Delay A.",
        "0 – 1490"
      ],
      [
        "TIMEB",
        "Adjusts the delay time of Delay B.",
        "0 – 1490"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "TIME, ♩"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "REP A",
        "Adjusts the number of Delay A repeats.",
        "0 – 110"
      ],
      [
        "REP B",
        "Adjusts the number of Delay B repeats.",
        "0 – 110"
      ],
      [
        "DLYMX",
        "Adjust the mix of the Delay A and B effect sounds.",
        "0 – 100"
      ],
      [
        "FLTR",
        "Adjusts the tone.",
        "-100 – 100"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation. Also sets the output to mono (M0.M50) or stereo (S0.S50).",
        "MN-0 – ST-50"
      ],
      [
        "SPEED",
        "Sets modulation speed.",
        "0 – 50"
      ]
    ]
  ],
  [
    "MULTI TAP DELAY",
    "DELAY",
    null,
    "This effect produces several delay sounds with different delay times.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 3000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "PTTRN",
        "Sets the tap pattern, which varies from rhythmical to random patterns.",
        "1 – 8"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "SOFT ECHO",
    "DELAY",
    null,
    "This echo has a soft tone. This echo effect allows the use of modulation.",
    [
      "dry"
    ],
    [
      [
        "MOD",
        "Turns modulation ON or OFF.",
        "OFF, ON"
      ],
      [
        "TIME",
        "Sets the delay time.",
        "19 – 581"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "WIDTH",
        "Adjusts the width of the modulation.",
        "0 – 50"
      ],
      [
        "SPEED",
        "Sets modulation speed.",
        "0 – 50"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "SMOOTH DELAY",
    "DELAY",
    "BOSS DD-20 in SMOOTH mode",
    "This wide delay is modeled on the BOSS DD-20 in SMOOTH mode.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time. When Sync is chosen, the delay time is synchronized to the tempo.",
        "1 – 3000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "SLAP BACK DELAY",
    "DELAY",
    null,
    "This delay features a short delay time that is good for muted rhythm playing and rockabilly.",
    [
      "sync",
      "dry",
      "st"
    ],
    [
      [
        "TIME",
        "Sets the delay time. When Sync is chosen, the delay time is synchronized to the tempo.",
        "1 – 300, SYNC"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "SUBDV",
        "Set the note length of the delay sound. When P-P is chosen, L/R channels output delays in quarter/dotted eighth notes respectively.",
        "♩, P-P"
      ],
      [
        "OUTPUT",
        "Sets output to mono or stereo.",
        "MONO, STEREO"
      ],
      [
        "DRY",
        "When ON, the original sound and the effect sound are mixed and output together. When OFF, only the effect sound is output.",
        "OFF, ON"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "STOMP DELAY",
    "DELAY",
    null,
    "By turning the repeat up on this stomp-style delay, you can make it self-oscillate.",
    [
      "sync",
      "dry",
      "st"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 600"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "TIME, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts amount of effect sound mixed with original sound.",
        "0 – 120"
      ],
      [
        "OUTPUT",
        "Sets output to mono or stereo. When stereo, effect sound is output from L channel and unchanged input sound is output from R channel.",
        "MONO, STEREO"
      ],
      [
        "HI-DMP",
        "Adjusts the treble attenuation of the delay sound.",
        "0 – 10"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "STEREO DELAY",
    "DELAY",
    null,
    "This stereo delay allows the left and right delay times to be set separately.",
    [
      "sync",
      "dry",
      "st"
    ],
    [
      [
        "TIME L",
        "Adjusts delay time of left channel delay.",
        "1 – 2000"
      ],
      [
        "TIME R",
        "Adjusts delay time of right channel delay.",
        "1 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "REP L",
        "Adjusts the number of left channel delay repeats.",
        "0 – 100"
      ],
      [
        "REP R",
        "Adjusts the number of right channel delay repeats.",
        "0 – 100"
      ],
      [
        "VOL L",
        "Adjusts the volume of left channel.",
        "0 – 100"
      ],
      [
        "VOL R",
        "Adjusts the volume of right channel.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "PING PONG DELAY",
    "DELAY",
    null,
    "This delay outputs the delay sound alternately left and right.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 4000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "REVERSE DELAY",
    "DELAY",
    null,
    "This reverse delay is a long delay with a maximum length of 2000 mS.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "10 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "HIDMP",
        "Adjusts the treble attenuation of the delay sound.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "MODULATION DELAY",
    "DELAY",
    null,
    "This delay effect allows the use of modulation.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "MODULATION DELAY 2",
    "DELAY",
    null,
    "You can adjust the depth of this modulation delay effect.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Adjust the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "FILTER DELAY",
    "DELAY",
    null,
    "This effect filters a delayed sound.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "RESO",
        "Adjusts the intensity of the modulation resonance.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "FILTER PING PONG DELAY",
    "DELAY",
    null,
    "This effect combines a filter with delay like the FilterPong preset of the Eventide TimeFactor.",
    [
      "sync",
      "dry",
      "st"
    ],
    [
      [
        "TIME A",
        "Sets the delay time for Delay A.",
        "0 – 1900"
      ],
      [
        "TIME B",
        "Adjusts the delay time of Delay B.",
        "0 – 1900"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 110"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DLY MIX",
        "Adjusts the mix of Delay A and Delay B effect sounds.",
        "0 – 100"
      ],
      [
        "SLUR",
        "Softens the attack of the repeat sound.",
        "0 – 10"
      ],
      [
        "FILTER",
        "Adjusts the amount the filter is applied.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Adjusts the modulation depth. Also sets the output to mono (M-0–10) or stereo (S-0–10).",
        "M-0 – S-10"
      ],
      [
        "WAVE",
        "Sets the modulation wave type and speed of modulation.",
        "SN1 – SQ16"
      ]
    ]
  ],
  [
    "LO-FI DELAY",
    "DELAY",
    null,
    "This delay, which is like the Strymon TimeLine LO-FI setting, reduces the audio quality of the effect using bit depth and sample rate parameters.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "2 – 1900"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "SAMPLE",
        "Sets sampling rate.",
        "1/128 – 1/1"
      ],
      [
        "BIT",
        "Sets bit depth.",
        "4 – 32"
      ],
      [
        "BLEND",
        "Adjusts the balance between the original sound and the lo-fi sound.",
        "0 – 100"
      ],
      [
        "DAMP",
        "Adjusts how the repaet sound decays.",
        "0 – 10"
      ],
      [
        "FILTER",
        "Sets the character of the filter applied to the effect sound.",
        "OFF – 8"
      ],
      [
        "VINYL",
        "Adds noise that occurs randomly. With D:1-D:9, the noise occurs in time with the delay output.",
        "OFF – S:9"
      ]
    ]
  ],
  [
    "PITCH DELAY",
    "DELAY",
    null,
    "This effect applies pitch shift to a delayed sound.",
    [
      "dry"
    ],
    [
      [
        "PITCH",
        "Sets volume of pitch shift applied to delayed sound.",
        "-12 – 12"
      ],
      [
        "TIME",
        "Sets the delay time.",
        "1 – 2000"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "TREMOLO DELAY",
    "DELAY",
    null,
    "This effect combines a delay sound with tremolo like the Strymon TimeLine TREM setting.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "60 – 1900"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100 TRI, SQR, SINE, SAWUP, SAWDN"
      ],
      [
        "WAVE",
        "Selects the tremolo modulation waveform.",
        ""
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "SPEED",
        "Sets modulation speed.",
        "1/32 – 32/1"
      ],
      [
        "DAMP",
        "Adjusts how the repeat sound decays.",
        "0 – 10"
      ],
      [
        "HPF",
        "Adjusts the maximum range of the frequencies in the effect sound.",
        "OFF – 900"
      ],
      [
        "GRIT",
        "Adjusts the distortion of the effect sound.",
        "0 – 10"
      ]
    ]
  ],
  [
    "PHASE DELAY",
    "DELAY",
    null,
    "This effect applies a phaser to a delayed sound.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "COLOR",
        "Sets the tone of the effect type.",
        "4 SIG – INV 8"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "DRIVE ECHO",
    "DELAY",
    null,
    "This echo effect is inspired by Maestro Echoplex EP-1 and can add drive to the sound.",
    [
      "sync",
      "dry",
      "st"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "20 – 1990"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DRIVE",
        "Adjusts the amount of distortion.",
        "0 – 100"
      ],
      [
        "WOW",
        "Adjusts the wow and flutter effect.",
        "0 – 100"
      ],
      [
        "DRY",
        "Sets whether the DriveEcho DRIVE parameter affects the tone of the dry signal. Set to DRIVE, the DRIVE setting affects the \"dry\" sound. Set to THRU, the dry sound is output without being changed.",
        "DRIVE, THRU"
      ],
      [
        "OUTPUT",
        "Sets output to mono or stereo.",
        "MONO, STEREO"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. The dry sound also continues to have the same tone as when the effect was on. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "AUTO PAN DELAY",
    "DELAY",
    null,
    "This combines auto pan and delay to create the effect of the stereo image moving cyclically.",
    [
      "sync",
      "dry",
      "st"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 1500"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "LINK",
        "Sets the order that the auto pan and delay are connected.",
        "PAN-DLY, DLY-PAN"
      ],
      [
        "CYCLE",
        "Sets the speed of the sound movement.",
        "1/4 – 50"
      ],
      [
        "WIDTH",
        "Sets the width of the sound movement.",
        "L50 – R50"
      ],
      [
        "DEPTH",
        "Sets the depth of the sound movement.",
        "0 – 10"
      ],
      [
        "CLIP",
        "Adjusts the amount of waveform clipping.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SLOW ATTACK DELAY",
    "DELAY",
    null,
    "This effect combines slow attack and delay.",
    [
      "sync",
      "dry",
      "st"
    ],
    [
      [
        "SWELL",
        "Adjusts the attack time.",
        "1 – 50"
      ],
      [
        "TIME",
        "Sets the delay time.",
        "1 – 1900"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "OUTPUT",
        "Sets how the effect is applied. Set to MONO for a mono chorus effect. Set to STEREO for a stereo vibrato effect.",
        "MONO, STEREO"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "DYNAMIC DELAY",
    "DELAY",
    null,
    "This dynamic delay adjusts the volume of the effect sound according to the input signal level.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "SENSE",
        "Adjusts the effect sensitivity.",
        "-10 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "ICE DELAY",
    "DELAY",
    null,
    "This effect combines pitch shifting and delay.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "INTVL",
        "Sets the pitch modulation amount for the audio slices.",
        "-OCT – 2 OCT"
      ],
      [
        "TIME",
        "Sets the delay time.",
        "60 – 1300"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "BLEND",
        "Adjusts the balance between the dry and ICE signals.",
        "0 – 20"
      ],
      [
        "SMEAR",
        "Adjusts the amount that the attack of the repeat sound is softened.",
        "OFF – 20"
      ],
      [
        "DAMP",
        "Adjusts how the repeat sound decays.",
        "0 – 10"
      ],
      [
        "HPF",
        "Adjusts the maximum range of the frequencies in the effect sound.",
        "OFF – 900"
      ],
      [
        "SLICE",
        "Adjusts the length of the slices.",
        "SHORT, LONG"
      ]
    ]
  ],
  [
    "HOLD DELAY",
    "DELAY",
    null,
    "This hold delay effect is controlled using the foot switch. When you press the foot switch, the effect turns on, and when you release it, the effect sound is held.",
    [
      "sync",
      "dry",
      "fs"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 4000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "HI-DMP",
        "Adjusts the treble attenuation of the delay sound.",
        "0 – 10"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "P-P",
        "Sets delay output to mono or Ping Pong.",
        "MONO, P-P"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "TRIGGER HOLD DELAY",
    "DELAY",
    null,
    "This delay samples and holds using picking as the trigger.",
    [
      "sync",
      "dry"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "10 – 1000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "Short, Long, ♩"
      ],
      [
        "DUTY",
        "Sets the time that the sample-andhold sound is produced.",
        "25 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "SENSE",
        "Adjusts the effect sensitivity.",
        "0 – 30"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "ROOM REVERB",
    "REVERB",
    "acoustics of a room",
    "This reverb effect simulates the acoustics of a room.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "1 – 30"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "BRIGHT ROOM REVERB",
    "REVERB",
    null,
    "This room reverb simulation can provide bright reverberations.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "1 – 30"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "TILED ROOM REVERB",
    "REVERB",
    "acoustics of a tiled room",
    "This reverb effect simulates the acoustics of a tiled room.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "1 – 30"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "SPRING REVERB",
    "REVERB",
    "spring reverb",
    "This reverb effect simulates a spring reverb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "1 – 30"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "SPRING REVERB 63",
    "REVERB",
    "'63 Fender Reverb",
    "This spring reverb sound is modeled on a '63 Fender Reverb.",
    [],
    [
      [
        "DWELL",
        "Adjusts the amount of level that input to reverb.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the mix of volume the effect sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "FD SPRING REVERB",
    "REVERB",
    "spring reverb of the '65 Fender Twin Reverb",
    "This simulates the spring reverb of the '65 Fender Twin Reverb.",
    [
      "dry"
    ],
    [
      [
        "COLOR",
        "Sets the tone of the effect type.",
        "0 – 1"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "PLATE REVERB",
    "REVERB",
    "plate reverb",
    "This simulates a plate reverb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "COLOR",
        "Adjusts the reverb time of the low frequencies.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "LODMP",
        "Adjusts low frequency damping in reverb sound.",
        "0 – 100"
      ],
      [
        "HIDMP",
        "Adjusts high frequency damping in reverb sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "HALL REVERB",
    "REVERB",
    "plate reverb",
    "This simulates a plate reverb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "1 – 30"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "BRIGHT HALL REVERB",
    "REVERB",
    null,
    "This hall reverb simulation can provide bright reverberations.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "1 – 30"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "HD HALL REVERB",
    "REVERB",
    null,
    "This is a dense hall reverb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ],
      [
        "LODMP",
        "Adjusts low frequency damping in reverb sound.",
        "0 – 100"
      ],
      [
        "HIDMP",
        "Adjusts high frequency damping in reverb sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "CHURCH REVERB",
    "REVERB",
    "reverberations of a church",
    "This effect simulates the reverberations of a church.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "HIDMP",
        "Adjusts high frequency damping in reverb sound.",
        "0 – 100"
      ],
      [
        "DRY",
        "When ON, the original sound and the effect sound are mixed and output together. When OFF, only the effect sound is output.",
        "OFF, ON"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. The dry sound also continues to have the same tone as when the effect was on. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "ARENA REVERB",
    "REVERB",
    "acoustics of a large enclosure such as a sports arena",
    "This reverb effect simulates the acoustics of a large enclosure such as a sports arena.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "1 – 30"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "AMBIENCE REVERB",
    "REVERB",
    null,
    "This effect adds a natural ambience (air) to the sound.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DRY",
        "When ON, the original sound and the effect sound are mixed and output together. When OFF, only the effect sound is output.",
        "OFF, ON"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. The dry sound also continues to have the same tone as when the effect was on. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "CHAMBER REVERB",
    "REVERB",
    "reverberations of a chamber-sized room",
    "This effect simulates the reverberations of a chamber-sized room.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "AIR REVERB",
    "REVERB",
    null,
    "This effect reproduces the ambience of a room, to create spatial depth.",
    [
      "dry"
    ],
    [
      [
        "SIZE",
        "Sets the size of the space.",
        "1 – 100"
      ],
      [
        "REFLECT",
        "Adjusts the amount of reflection from the wall.",
        "0 – 10"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "EARLY REFLECTION REVERB",
    "REVERB",
    null,
    "This effect reproduces only the early reflections of reverb.",
    [
      "dry"
    ],
    [
      [
        "DECAY",
        "Adjusts the duration of the reverb.",
        "1 – 30"
      ],
      [
        "SHAPE",
        "Adjusts the effect envelope.",
        "-10 – 10"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "SLAP BACK REVERB",
    "REVERB",
    null,
    "This reverb creates a repeating echo effect.",
    [
      "dry"
    ],
    [
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "1 – 30"
      ],
      [
        "TIME",
        "Sets the delay time.",
        "1 – 1000"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "D-R BAL",
        "Sets the ratio of delay and reverb.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "GATE REVERB",
    "REVERB",
    null,
    "This unique reverb is good for percussive playing.",
    [
      "dry"
    ],
    [
      [
        "COLOR",
        "Sets the sound color.",
        "1 – 5"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, the original sound and the effect sound are mixed and output together. When OFF, only the effect sound is output.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "HOLD REVERB",
    "REVERB",
    null,
    "This hold reverb effect is controlled using the foot switch. When you press the foot switch, the effect turns on, and when you release it, the effect sound is held.",
    [
      "dry",
      "fs"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ],
      [
        "COLOR",
        "Adjusts the reverb time of the low frequencies.",
        "0 – 100"
      ],
      [
        "LO-DMP",
        "Adjusts low frequency damping in reverb sound.",
        "0 – 100"
      ],
      [
        "HI-DMP",
        "Adjusts high frequency damping in reverb sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SPACE HOLE REVERB",
    "REVERB",
    null,
    "This effect combines delay and reverb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 1000"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "-100 – 100"
      ],
      [
        "REPEAT",
        "Adjusts the number of repeats.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "0 – 100"
      ],
      [
        "LOW",
        "Adjusts volume of low frequencies.",
        "-100 – 100"
      ],
      [
        "HIGH",
        "Adjusts volume of high frequencies.",
        "-100 – 100"
      ],
      [
        "SIZE",
        "Adjusts the size of the reverb space.",
        "0 – 100"
      ]
    ]
  ],
  [
    "PARTICLE REVERB",
    "REVERB",
    null,
    "This is a unique complex reverb.",
    [
      "dry",
      "st"
    ],
    [
      [
        "MODE",
        "Sets how the reverb sound changes.",
        "STABLE, CRITICAL, HAZARD"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "GAIN",
        "Adjusts the output gain of the reverb sound.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "MONO",
        "When OFF, the effect sound is output in stereo. When ON, the effect sound is output as a mono mix.",
        "OFF, ON"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "MODULATION REVERB",
    "REVERB",
    null,
    "This reverb generates fluctuating echoes.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Adjusts the duration of the reverb.",
        "1 – 30"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "LO-FI REVERB",
    "REVERB",
    "LOFI setting of the TC Electronic HALL OF FAME",
    "This rough in-your-face reverb is modeled on the LOFI setting of the TC Electronic HALL OF FAME.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "SHORT, LONG"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the volume of the effect.",
        "0 – 100"
      ],
      [
        "DRY",
        "When ON, the original sound and the effect sound are mixed and output together. When OFF, only the effect sound is output.",
        "OFF, ON"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. The dry sound also continues to have the same tone as when the effect was on. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "CAVE REVERB",
    "REVERB",
    "reverberations of a cave",
    "This effect simulates the reverberations of a cave.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "REVERSE REVERB",
    "REVERB",
    "DigiTech RV-7 (Lexicon) Reverse setting, sounds like reverb in reverse",
    "This effect, which is modeled on the DigiTech RV-7 (Lexicon) Reverse setting, sounds like reverb in reverse.",
    [
      "dry"
    ],
    [
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "DRY",
        "When ON, the original sound and the effect sound are mixed and output together. When OFF, only the effect sound is output.",
        "OFF, ON"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "ECHO REVERB",
    "REVERB",
    null,
    "This effect can generate gorgeous echoes.",
    [
      "dry",
      "st"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "OUTPUT",
        "Sets output to mono or stereo.",
        "MONO, STEREO"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. The dry sound also continues to have the same tone as when the effect was on. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "TREMOLO REVERB",
    "REVERB",
    null,
    "This effect combines tremolo with just the reverb sound like the Eventide Space TremoloVerb.",
    [
      "dry",
      "st"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 500"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "SIZE",
        "Adjusts the size of the reverb space.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "WAVE",
        "Sets the modulation waveform.",
        "SINE, TRI, PEAK, RNDM, RAMP, SQR"
      ],
      [
        "DEPTH",
        "Sets the depth of modulation. Also sets whether the modulation is mono (MN0–99) or stereo (ST0–99) .",
        "MN0 – ST99"
      ],
      [
        "RATE",
        "Sets modulation speed.",
        "1.0 – 20.0"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "-100 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "-100 – 100"
      ]
    ]
  ],
  [
    "HOLY REVERB",
    "REVERB",
    "Electro-Harmonix Holy Grail set to FLERB",
    "This effect combines reverb and flanger in a model of an Electro-Harmonix Holy Grail set to FLERB.",
    [
      "dry"
    ],
    [
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "DYNAMIC REVERB",
    "REVERB",
    "TC Electronic NOVA REVERB, changes volume according to the dynamics of the input sound",
    "This reverb, which is modeled on the TC Electronic NOVA REVERB, changes volume according to the dynamics of the input sound.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "-100 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "COLOR",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "SHIMMER REVERB",
    "REVERB",
    null,
    "Modeling the Strymon blueSky in Shimmer mode, this effect adds pitch-shifting and delay to reverb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 100"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ],
      [
        "LO-DMP",
        "Adjusts the amount that the low frequencies of the reverb sound are reduced.",
        "0 – 100"
      ],
      [
        "HI-DMP",
        "Adjusts the amount that the high frequencies of the reverb sound are reduced.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SHIMMER REVERB+",
    "REVERB",
    null,
    "The pitch of the reverberation sound rises continuously in this magical reverb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "1 – 200"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TAIL",
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ],
      [
        "LO-DMP",
        "Adjusts the amount that the low frequencies of the reverb sound are reduced.",
        "0 – 100"
      ],
      [
        "HI-DMP",
        "Adjusts the amount that the high frequencies of the reverb sound are reduced.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MANGLED SPACE REVERB",
    "REVERB",
    null,
    "This reverb has wild echoes like the Eventide Space MangledVerb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY",
        "Adjusts the delay between input of the original sound and start of the reverb sound.",
        "0 – 500"
      ],
      [
        "DECAY",
        "Sets the duration of the reverberations.",
        "0 – 100"
      ],
      [
        "SIZE",
        "Adjusts the size of the reverb space.",
        "0 – 100"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "CLIP",
        "Adjusts the amount of distortion.",
        "0 – 100"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "-100 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "-100 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 200"
      ]
    ]
  ],
  [
    "DUAL REVERB",
    "REVERB",
    null,
    "This effect can combine two reverbs like the Eventide Space DualVerb.",
    [
      "dry"
    ],
    [
      [
        "PRE DLY A",
        "Sets the pre-delay time of Reverb A.",
        "0 – 750"
      ],
      [
        "PRE DLY B",
        "Sets the pre-delay time of Reverb B.",
        "0 – 750"
      ],
      [
        "A-B MIX",
        "Adjust the mix of the Reverb A and B effect sounds.",
        "A9B0 – A0B9"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "DECAY A",
        "Sets the reverberation length for Reverb A.",
        "0 – 100"
      ],
      [
        "DECAY B",
        "Sets the reverberation length for Reverb B.",
        "0 – 100"
      ],
      [
        "TONE A",
        "Adjusts the tone of Reverb A.",
        "-100 – 100"
      ],
      [
        "TONE B",
        "Adjusts the tone of Reverb B.",
        "-100 – 100 A1B1 ~"
      ],
      [
        "SIZE",
        "Adjusts the size of the reverb.",
        "A9B1 ~ A9B9 ~ A1B9 ~ A1B1"
      ]
    ]
  ],
  [
    "AUTO PAN",
    "SFX",
    null,
    "This effect moves the sound image cyclically left and right.",
    [],
    [
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "WIDTH",
        "Sets the width of the panning.",
        "L50 – R50"
      ],
      [
        "CLIP",
        "Adjusts the amount of waveform clipping. Higher values emphasize the auto-panning effect more.",
        "0 – 10"
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "LOOP ROLL",
    "SFX",
    null,
    "This effect allows you use the footswitch to sample and hold what you play.",
    [
      "dry",
      "fs"
    ],
    [
      [
        "TIME",
        "Sets the loop time.",
        "10 – 4000"
      ],
      [
        "DUTY",
        "Sets the time that the sample-and-hold sound is produced.",
        "25 – 100"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "ON/OFF",
        "Sets the foot switch function.",
        "LATCH, UNLATCH"
      ]
    ]
  ],
  [
    "BOMBER",
    "SFX",
    null,
    "This effect generates explosive sounds.",
    [
      "dry",
      "fs"
    ],
    [
      [
        "DECAY",
        "Adjusts the length of the explosive sound.",
        "1 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "TRGGR",
        "This sets the trigger for the bomb sound.",
        "INPUT, FOOT SW"
      ]
    ]
  ],
  [
    "BIT CRUSHER",
    "SFX",
    null,
    "This effect creates a lo-fi sound.",
    [
      "dry"
    ],
    [
      [
        "BIT",
        "Sets bit depth.",
        "4 – 16"
      ],
      [
        "SAMPLE",
        "Sets sampling rate.",
        "0 – 50"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MONO SYNTH",
    "SFX",
    null,
    "This effect produces the sound of a monophonic (single-note playing) guitar synthesizer that detects the pitch of the input signal.",
    [
      "dry"
    ],
    [
      [
        "WAVE",
        "Sets waveform.",
        "SINE, TRI, SAWUP, SAWDN"
      ],
      [
        "SPEED",
        "Adjusts smoothness of pitch change.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "SYNTH",
        "Adjusts synthesizer sound level.",
        "0 – 100"
      ],
      [
        "DRY",
        "Adjusts level of original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "Z-ORGAN",
    "SFX",
    "organ sound",
    "This effect simulates an organ sound.",
    [
      "dry"
    ],
    [
      [
        "HPF",
        "Adjusts high-pass filter cutoff frequency.",
        "0 – 10"
      ],
      [
        "LPF",
        "Adjusts low-pass filter cutoff frequency.",
        "0 – 10"
      ],
      [
        "UPPER",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "LOWER",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "DRY",
        "Adjusts level of original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ROTO CLOSET",
    "SFX",
    "rotary speaker",
    "Simulates a rotary speaker.",
    [
      "dry"
    ],
    [
      [
        "MODE",
        "Sets the rotary mode.",
        "SLOW, FAST"
      ],
      [
        "DRIVE",
        "Adjusts the amount of amplification from the preamp.",
        "0 – 100"
      ],
      [
        "BAL",
        "Adjusts the balance between the horn (high frequencies) and the drum (low frequencies).",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "LINE SELECTOR",
    "SFX",
    null,
    "Sound input into the LineSel effect is sent directly to the OUTPUT jacks when OFF and to the next effect in order when ON.",
    [],
    [
      [
        "EFX LVL",
        "Adjusts level sent to next effect.",
        "0 – 150"
      ],
      [
        "OUT LVL",
        "Adjusts level sent directly to the outputs.",
        "0 – 150"
      ]
    ]
  ],
  [
    "COMPRESSOR",
    "DYNAMICS",
    null,
    "This compressor in the style of the MXR Dyna Comp.",
    [],
    [
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "0 – 10"
      ],
      [
        "ATTCK",
        "Sets compressor attack speed to Fast or Slow.",
        "SLOW, FAST"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "RACK COMPRESSOR",
    "DYNAMICS",
    null,
    "This compressor allows more detailed adjustment than Comp.",
    [],
    [
      [
        "THRSH",
        "Sets the level that activates the compressor.",
        "0 – 50"
      ],
      [
        "RATIO",
        "Adjusts the compression ratio.",
        "1 – 10"
      ],
      [
        "ATTCK",
        "Sets compressor attack speed",
        "1 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "GRAY COMPRESSOR",
    "DYNAMICS",
    "ROSS Compressor",
    "This models a ROSS Compressor. Added parameters allow you to adjust the tone.",
    [],
    [
      [
        "SUSTN",
        "Adjusts the sustain.",
        "0 – 100"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "OPTICAL COMPRESSOR",
    "DYNAMICS",
    null,
    "This is an optical compressor.",
    [],
    [
      [
        "DRIVE",
        "Adjusts the depth of the compression.",
        "0 – 10"
      ],
      [
        "LO",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "HI",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "160 COMPRESSOR",
    "DYNAMICS",
    null,
    "This compressor is in the style of the dbx 160A.",
    [],
    [
      [
        "THRSHLD",
        "Adjusts the threshold that determines when the effect is activated.",
        "-60 – 0"
      ],
      [
        "RATIO",
        "Adjusts the compression ratio.",
        "1.0 – 10.0"
      ],
      [
        "KNEE",
        "Sets the type of knee.",
        "SOFT, HARD"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DUAL COMPRESSOR",
    "DYNAMICS",
    null,
    "This is a compressor which allows separate settings for the low frequency and high frequency range.",
    [],
    [
      [
        "FREQ",
        "Adjusts the crossover point between the high frequency and low frequency range.",
        "300Hz – 1.5kHz"
      ],
      [
        "LOCOMP",
        "Adjusts the compression depth in the low frequency range.",
        "0 – 50"
      ],
      [
        "HICOMP",
        "Adjusts the compression depth in the high frequency range.",
        "0 – 50"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MULTIBAND COMPRESSOR",
    "DYNAMICS",
    "MultiComp (MODE:MB)",
    "This is a simulation of the MultiComp (MODE:MB).",
    [],
    [
      [
        "COMP",
        "Adjusts the depth of the compression.",
        "0 – 100"
      ],
      [
        "LOTHR",
        "Adjusts the threshold that triggers the low-frequency effect.",
        "0 – 100"
      ],
      [
        "HITHR",
        "Adjusts the threshold that triggers the high-frequency effect.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "LIMITER",
    "DYNAMICS",
    null,
    "This is a limiter that suppresses signal peaks above a certain reference level.",
    [],
    [
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 50"
      ],
      [
        "RATIO",
        "Adjusts the compression ratio.",
        "1 – 10"
      ],
      [
        "REL",
        "This is a limiter that suppresses signal peaks above a certain reference level.",
        "1 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ORANGE LIMITER",
    "DYNAMICS",
    "ORANGE SQUEEZER",
    "This models an ORANGE SQUEEZER.",
    [],
    [
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ZOOM NOISE REDUCTION",
    "DYNAMICS",
    null,
    "ZOOM's unique noise reduction cuts noise during pauses in playing without affecting the tone.",
    [],
    [
      [
        "DETCT",
        "Sets control signal detection level.",
        "GTRIN, EFXIN"
      ],
      [
        "DEPTH",
        "Sets the depth of noise reduction.",
        "0 – 100"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ],
      [
        "DECAY",
        "Adjust the envelope release.",
        "0 – 100"
      ]
    ]
  ],
  [
    "NOISE GATE",
    "DYNAMICS",
    null,
    "This is a noise gate that cuts the sound during playing pauses.",
    [],
    [
      [
        "DETCT",
        "Sets control signal detection level.",
        "GTRIN, EFXIN"
      ],
      [
        "DEPTH",
        "Sets the depth of noise reduction.",
        "0 – 100"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ],
      [
        "DECAY",
        "Adjust the envelope release.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DIRTY GATE",
    "DYNAMICS",
    null,
    "This vintage style gate features a characteristic way of closing.",
    [],
    [
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "1 – 25"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SLOW ATTACK",
    "DYNAMICS",
    null,
    "This effect slows the attack of each note, resulting in a violin-like performance.",
    [],
    [
      [
        "TIME",
        "Adjusts the attack time.",
        "1 – 50"
      ],
      [
        "CURVE",
        "Set the curve of volume change during attack.",
        "0 – 10"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "AUTO WAH",
    "FILTER",
    null,
    "This effect varies wah in accordance with picking intensity.",
    [],
    [
      [
        "MODE",
        "Sets direction of movement of the filter.",
        "DOWN, UP"
      ],
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "1 – 10"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "RESONANCE FILTER",
    "FILTER",
    null,
    "This effect varies the resonance filter frequency according to picking intensity.",
    [],
    [
      [
        "MODE",
        "Sets direction of movement of the filter.",
        "DOWN, UP"
      ],
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "1 – 10"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "AUTO FILTER",
    "FILTER",
    null,
    "This is a resonance filter with a sharp envelope.",
    [
      "dry"
    ],
    [
      [
        "MODE",
        "Sets direction of movement of the filter.",
        "UP, DOWN"
      ],
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "1 – 10"
      ],
      [
        "PEAK",
        "Adjusts the Q value of the filter.",
        "0 – 10"
      ],
      [
        "DRY",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "Z TRON FILTER",
    "FILTER",
    null,
    "This is like a Q-Tron Envelope Filter in LP mode.",
    [
      "dry"
    ],
    [
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "-10 – 10"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "DRY",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "LOW PASS FILTER",
    "FILTER",
    null,
    "This effect varies the low pass filter frequency according to picking intensity.",
    [
      "dry"
    ],
    [
      [
        "FREQ",
        "Sets minimum frequency of low pass filter.",
        "0 – 100"
      ],
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "FST100 – SLW100"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "2P-10 – 4P-10"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS AUTO WAH",
    "FILTER",
    "ZOOM original",
    "You can adjust the mix of this bass guitar auto-wah with the original signal.",
    [
      "dry"
    ],
    [
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "-10 – 10"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "DRY",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "CRY FILTER",
    "FILTER",
    null,
    "This effect varies the sound like a talking modulator.",
    [
      "dry"
    ],
    [
      [
        "RANGE",
        "Adjusts the frequency range processed by the effect.",
        "1 – 10"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "-10 – 10"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS CRY FILTER",
    "FILTER",
    null,
    "This talking modulator is suitable for the bass frequency range.",
    [
      "dry"
    ],
    [
      [
        "RANGE",
        "Adjusts the frequency range processed by the effect.",
        "1 – 10"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "SENSE",
        "Adjusts the sensitivity of the effect.",
        "-10 – 10"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ]
    ]
  ],
  [
    "LFO FILTER",
    "FILTER",
    null,
    "This filter effect changes tone characteristics cyclically.",
    [],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "WAVE",
        "Sets the modulation waveform.",
        "SINE, TRI, SAWUP, SAWDOWN"
      ]
    ]
  ],
  [
    "SEQUENCE FILTER",
    "FILTER",
    null,
    "The sequence filter has the flavor of a Z.Vex Seek-Wah.",
    [],
    [
      [
        "STEP",
        "Adjusts number of sequence steps.",
        "2 – 8"
      ],
      [
        "PTTRN",
        "Sets effect pattern.",
        "1 – 8"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ]
    ]
  ],
  [
    "RANDOM FILTER",
    "FILTER",
    null,
    "This filter effect changes character randomly.",
    [
      "dry"
    ],
    [
      [
        "TYPE",
        "Sets filter type.",
        "HPF, BPF, LPF"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "1 – 50"
      ],
      [
        "BAL",
        "Adjusts the balance between original and effect sounds.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "STEP FILTER",
    "FILTER",
    null,
    "This special effect gives the sound a stepped quality.",
    [],
    [
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "0 – 100"
      ],
      [
        "RATE",
        "Sets the speed of the modulation.",
        "0 – 50"
      ],
      [
        "RESO",
        "Sets effect resonance.",
        "0 – 10"
      ],
      [
        "SHAPE",
        "Adjusts the effect envelope.",
        "0 – 10"
      ]
    ]
  ],
  [
    "COMB FILTER",
    "FILTER",
    null,
    "This effect uses the comb filter that results from fixing the modulation of the flanger like an equalizer.",
    [
      "dry"
    ],
    [
      [
        "FREQ",
        "This sets the emphasized frequency.",
        "1 – 50"
      ],
      [
        "RESO",
        "Adjusts the intensity of the resonance sound of the effect.",
        "-10 – 10"
      ],
      [
        "HI-DMP",
        "Adjusts the treble attenuation of the effect sound.",
        "0 – 10"
      ],
      [
        "MIX",
        "Adjusts the amount of effected sound that is mixed with the original sound.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SLOW FILTER",
    "FILTER",
    null,
    "The filter frequency of this effect changes, triggered by picking.",
    [],
    [
      [
        "TIME",
        "Sets the time taken to change the sound.",
        "1 – 50"
      ],
      [
        "CURVE",
        "Adjusts the curve of the sound change.",
        "0 – 10"
      ],
      [
        "RESO",
        "Adjusts the intensity of the modulation.",
        "0 – 10"
      ],
      [
        "TYPE",
        "Adjusts amount of filter applied.",
        "2POLE, 4POLE"
      ],
      [
        "MODE",
        "Sets direction of movement of the filter.",
        "UP, DOWN"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "GUITAR GRAPHIC EQ",
    "FILTER",
    null,
    "This mono graphic equalizer has 6 bands that suit guitar frequencies.",
    [],
    [
      [
        "160HZ",
        "Boosts or cuts the low (160 Hz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "400HZ",
        "Boosts or cuts the low (400 Hz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "800HZ",
        "Boosts or cuts the low (800 Hz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "3.2KHZ",
        "Boosts or cuts the low (3.2 kHz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "6.4KHZ",
        "Boosts or cuts the low (6.4 kHz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "12KHZ",
        "Boosts or cuts the low (12 kHz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "STEREO GUITAR GRAPHIC EQ",
    "FILTER",
    null,
    "This stereo graphic equalizer has 6 bands that suit guitar frequencies.",
    [
      "st"
    ],
    [
      [
        "160HZ",
        "Boosts or cuts the low (160 Hz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "400HZ",
        "Boosts or cuts the low (400 Hz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "800HZ",
        "Boosts or cuts the low (800 Hz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "3.2KHZ",
        "Boosts or cuts the low (3.2 kHz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "6.4KHZ",
        "Boosts or cuts the low (6.4 kHz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "12KHZ",
        "Boosts or cuts the low (12 kHz) frequency band.",
        "-12.0 – 12.0"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "PARAMETRIC EQ",
    "FILTER",
    null,
    "This is a 1-band parametric equalizer.",
    [],
    [
      [
        "FREQ",
        "Sets the frequency of the equalizer.",
        "20Hz – 20kHz"
      ],
      [
        "Q",
        "Adjusts equalizer Q.",
        "0.5 – 16.0"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "-12.0 – 12.0"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS GRAPHIC EQ",
    "FILTER",
    null,
    "This 7-band graphic equalizer is suitable for the bass frequency range.",
    [],
    [
      [
        "50HZ",
        "Adjust to boost or cut 50Hz.",
        "-12.0 – 12.0"
      ],
      [
        "120HZ",
        "Adjust to boost or cut 120Hz.",
        "-12.0 – 12.0"
      ],
      [
        "400HZ",
        "Adjust to boost or cut 400Hz.",
        "-12.0 – 12.0"
      ],
      [
        "500HZ",
        "Adjust to boost or cut 500Hz.",
        "-12.0 – 12.0"
      ],
      [
        "800HZ",
        "Adjust to boost or cut 800Hz.",
        "-12.0 – 12.0"
      ],
      [
        "4.5KHZ",
        "Adjust to boost or cut 4.5kHz.",
        "-12.0 – 12.0"
      ],
      [
        "10KHZ",
        "Adjust to boost or cut 10kHz.",
        "-12.0 – 12.0"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "STEREO BASS GRAPHIC EQ",
    "FILTER",
    null,
    "This stereo graphic equalizer has 7 bands that suit bass guitar frequencies.",
    [
      "st"
    ],
    [
      [
        "50HZ",
        "Adjust to boost or cut 50Hz.",
        "-12.0 – 12.0"
      ],
      [
        "120HZ",
        "Adjust to boost or cut 120Hz.",
        "-12.0 – 12.0"
      ],
      [
        "400HZ",
        "Adjust to boost or cut 400Hz.",
        "-12.0 – 12.0"
      ],
      [
        "500HZ",
        "Adjust to boost or cut 500Hz.",
        "-12.0 – 12.0"
      ],
      [
        "800HZ",
        "Adjust to boost or cut 800Hz.",
        "-12.0 – 12.0"
      ],
      [
        "4.5KHZ",
        "Adjust to boost or cut 4.5kHz.",
        "-12.0 – 12.0"
      ],
      [
        "10KHZ",
        "Adjust to boost or cut 10kHz.",
        "-12.0 – 12.0"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BASS PARAMETRIC EQ",
    "FILTER",
    null,
    "This 1-band parametric equalizer is suitable for the bass frequency range.",
    [],
    [
      [
        "FREQ",
        "Sets the frequency of the equalizer.",
        "20Hz – 20kHz"
      ],
      [
        "Q",
        "Adjusts equalizer Q.",
        "0.5 – 16.0"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "-20.0 – 20.0"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "EXCITER",
    "FILTER",
    null,
    "This exciter enables flexible control.",
    [
      "fs"
    ],
    [
      [
        "BASS",
        "Adjusts the amount of low-frequency phase correction.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts the amount of high-frequency phase correction.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "ON/OFF",
        "Sets the foot switch function.",
        "LATCH, UNLATCH"
      ]
    ]
  ],
  [
    "BOTTOM UP",
    "FILTER",
    null,
    "This brings out low and high sounds.",
    [],
    [
      [
        "BASS",
        "Adjusts the amount of low-frequency boost.",
        "0 – 10"
      ],
      [
        "TREBLE",
        "Adjusts the amount of high-frequency boost.",
        "0 – 10"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SPLITTER",
    "FILTER",
    null,
    "This effect divides the signal into two bands (high/low) and lets you freely adjust the mix ratio of the two bands.",
    [],
    [
      [
        "FREQ",
        "Adjusts the crossover point between the high frequency and low frequency band.",
        "80Hz – 2.5kHz"
      ],
      [
        "LO",
        "Adjusts the mix ratio of the low frequency band.",
        "0 – 100"
      ],
      [
        "HI",
        "Adjusts the mix ratio of the high frequency band.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ]
];
