// Zoom MS-200D+ effects catalog — original text from the official ZOOM Effects List (E_MS-200Dplus_EffectsList.pdf).
// Written by tools/ms200d-data.py with tools/extract-effects-list.py --layout 200d; descriptions and parameter text are
// not reworded. CHARACTER (the tone tag of each effect in the list) is kept in EFFECT_CHARACTER, aligned with EFFECTS_DATA.

const CATEGORIES = {
  "BOOSTER": {
    "label": "Booster",
    "color": "#f0883e"
  },
  "OVERDRIVE": {
    "label": "Overdrive",
    "color": "#d29922"
  },
  "DISTORTION": {
    "label": "Distortion",
    "color": "#f85149"
  },
  "FUZZ": {
    "label": "Fuzz",
    "color": "#db61a2"
  },
  "PREAMP": {
    "label": "Preamp",
    "color": "#a371f7"
  },
  "TOOL": {
    "label": "Tool",
    "color": "#8b949e"
  }
};

const EFFECTS_DATA = [
  [
    "FAT BOOSTER",
    "BOOSTER",
    null,
    "This thick-sounding booster emphasizes the low mids.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GLITCH BOOSTER",
    "BOOSTER",
    null,
    "This booster has a gritty texture.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GRIND BOOSTER",
    "BOOSTER",
    null,
    "Sounds with strong presence can be produced by this booster.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "THUNDER BOOSTER",
    "BOOSTER",
    null,
    "This booster has an electrifying sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MID BOOSTER",
    "BOOSTER",
    null,
    "This booster can produce rich mid frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BAKED BOOSTER",
    "BOOSTER",
    null,
    "The scorching sound of this booster seems about to catch fire.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "EP DRIVE",
    "BOOSTER",
    null,
    "This models the Maestro Echoplex preamp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "-10 – 10"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
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
    "SPORTY BOOSTER",
    "BOOSTER",
    null,
    "This booster cuts low frequencies and creates a penetrating sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BOTTOM BOOSTER",
    "BOOSTER",
    null,
    "This booster emphasizes the low end.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BLOOMING BOOSTER",
    "BOOSTER",
    null,
    "This booster produces a gorgeous sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "RC DRIVE",
    "BOOSTER",
    null,
    "This booster covers sounds ranging from clean boosts to light drives.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MASSIVE BOOSTER",
    "BOOSTER",
    null,
    "This booster adds low frequencies with punch.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CALIFORNIA BOOSTER",
    "BOOSTER",
    null,
    "This booster has a bright dry sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "G5n BOOSTER",
    "BOOSTER",
    null,
    "We improved the ZOOM G5n OUTPUT BOOSTER as an effect.",
    [],
    [
      [
        "RANGE",
        "Adjusts the frequency range processed by the effect.",
        "1 – 10"
      ],
      [
        "BOOST",
        "Adjusts the gain.",
        "0 – 100"
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
    "Z CLEAN BOOSTER",
    "BOOSTER",
    null,
    "This even clean sound is a ZOOM original.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "V SHAPE BOOSTER",
    "BOOSTER",
    null,
    "This booster creates a sound with a mid scoop.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "Z BOOSTER",
    "BOOSTER",
    null,
    "This booster provides a light sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BRIGHT BOOSTER",
    "BOOSTER",
    null,
    "This booster generates a sound that is like setting the BRIGHT switch on an amp to ON.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BOXY BOOSTER",
    "BOOSTER",
    null,
    "This booster adds a heavy body tone.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SPOT BOOSTER",
    "BOOSTER",
    null,
    "This booster enables flexible control.",
    [
      "fs"
    ],
    [
      [
        "BOOST",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "-10 – 10"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "-10 – 10"
      ],
      [
        "ON/OFF",
        "Sets the foot switch function.",
        "LATCH, UNLATCH"
      ]
    ]
  ],
  [
    "LIGHT BOOSTER",
    "BOOSTER",
    null,
    "This booster can produce a gorgeous and bright sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "LUSH BOOSTER",
    "BOOSTER",
    null,
    "This booster makes a powerful sound that emphasizes the middle frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SILKY BOOSTER",
    "BOOSTER",
    null,
    "Smooth sounds can be achieved with this booster.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "DESERT DRIVE",
    "OVERDRIVE",
    null,
    "This is an overdrive with a gritty sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TWEED DRIVE",
    "OVERDRIVE",
    null,
    "This bright overdrive is inspired by the sound of a tweed amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "ACID DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive features a fat and coarse distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "NEEDLE DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive produces a unique prickly feeling.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GREEN FIELD DRIVE",
    "OVERDRIVE",
    null,
    "A natural sound is produced by this overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CRUNCH BAR DRIVE",
    "OVERDRIVE",
    null,
    "A sweet crunchy sound characterizes this overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SCOOP DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive cuts mid frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TIGER DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has a forceful sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SILVER BULLET DRIVE",
    "OVERDRIVE",
    null,
    "This bright overdrive has a strong attack.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TS DRIVE",
    "OVERDRIVE",
    null,
    "This effect models the Ibanez TS808.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BOOST",
        "Turns boost ON/OFF.",
        "OFF, ON"
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
    "RETRO DRIVE",
    "OVERDRIVE",
    null,
    "This is a warm retro overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MILKY DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has a mild sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "ROCK BOX DRIVE",
    "OVERDRIVE",
    null,
    "This rock overdrive has powerful low frequencies and penetrating high frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GHOST DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has a light distortion and cuts mid frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GARAGE DRIVE",
    "OVERDRIVE",
    null,
    "A rough sound is produced by this overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BREAKER DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive sound has punch.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "STEAM DRIVE",
    "OVERDRIVE",
    null,
    "This is an overdrive with a hot sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SHADOW DRIVE",
    "OVERDRIVE",
    null,
    "The low end overlays like a shadow with this overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "EMOTIONAL DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive moves emotionally.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "DIAMOND OVERDRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has a hard and clear sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "DULL EDGE DRIVE",
    "OVERDRIVE",
    null,
    "The edge has been taken off the tone of this overdrive but it is still moderately rough.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "RIPPER DRIVE",
    "OVERDRIVE",
    null,
    "A ripping sound is produced by this overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GOLD DRIVE",
    "OVERDRIVE",
    null,
    "This effect models a famous gold overdrive boutique pedal.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SMALL BOX DRIVE",
    "OVERDRIVE",
    null,
    "Focused on the mid range, this overdrive has a clean sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TS+BOOST DRIVE",
    "OVERDRIVE",
    null,
    "This effect combines TS Drive and Booster.",
    [],
    [
      [
        "GAIN",
        "Adjusts gain of TS Drive.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts tone of TS Drive.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts volume of TS Drive.",
        "0 – 100"
      ],
      [
        "COMP",
        "Sets the clipping type of TS Drive.",
        "0 – 2"
      ],
      [
        "BOOST",
        "Adjusts gain of Booster.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts low frequencies volume of booster.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts high frequencies volume of booster.",
        "0 – 100"
      ],
      [
        "ORDER",
        "Sets the connection order of TS Drive and Booster.",
        "BOOST-OD, OD-BOOST"
      ]
    ]
  ],
  [
    "SHARP DRIVE",
    "OVERDRIVE",
    null,
    "This is an overdrive with a sharp sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "DRY WOOD DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has a dry sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "FIREBALL OVERDRIVE",
    "OVERDRIVE",
    null,
    "This is a bright and forceful overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MELLOW DRIVE",
    "OVERDRIVE",
    null,
    "This is an overdrive with a mellow sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BG GRID DRIVE",
    "OVERDRIVE",
    null,
    "This models a Mesa Boogie GRID SLAMMER. An added parameter allows you to adjust the balance of original sound and overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
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
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SKY OVERDRIVE",
    "OVERDRIVE",
    null,
    "This overdrive makes an open bright sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "FLASH DRIVE",
    "OVERDRIVE",
    null,
    "The sound of this overdrive is heavy and stands out.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BURNING DRIVE",
    "OVERDRIVE",
    null,
    "A burning sound is produced by this overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CLASSIC OVERDRIVE",
    "OVERDRIVE",
    null,
    "This is an overdrive with a classic sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "Z NEOS DRIVE",
    "OVERDRIVE",
    null,
    "The sound of a modified Class a British combo amp is the inspiration for this overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "WARM DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive is warm and heavy.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CHAINSAW DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive attacks like a chainsaw.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SWEET DRIVE",
    "OVERDRIVE",
    null,
    "This effect models a sweet sounding overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "FOCUS",
        "Adjusts volume of middle frequencies.",
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
    "EXPAND DRIVE",
    "OVERDRIVE",
    null,
    "The high-frequency range of this overdrive is wide.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SOLID DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive is solid and tight.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "ICY DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has a cool texture.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "STICKY DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive features a sticky mid range.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "ZEN O.DRIVE",
    "OVERDRIVE",
    null,
    "This models the sound of a Hermida Audio Zendrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "VOICE",
        "Adjusts gain of high frequencies.",
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
    "THICK DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has a thick sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MONOCHROME DRIVE",
    "OVERDRIVE",
    null,
    "This is an overdrive with an inorganic sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "RAY DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has an abundance of overtones.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SMOOTH DRIVE",
    "OVERDRIVE",
    null,
    "This is an overdrive with a smooth sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "IRON OVERDRIVE",
    "OVERDRIVE",
    null,
    "This overdrive is heavy like iron.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "STACK DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive has impact like a stack amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "HAMMER DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive feels heavy like a hammer.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "DYNAMIC DRIVE",
    "OVERDRIVE",
    null,
    "This effect easily achieves the warm drive tone of a tube amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the sound style.",
        "COMBO, STACK"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BRONZE DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive is hard and heavy.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SPLASH DRIVE",
    "OVERDRIVE",
    null,
    "The sound of this overdrive seems to burst out.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "Z SCREAM DRIVE",
    "OVERDRIVE",
    null,
    "This original high-gain sound balances the frequencies from low to high.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "Z WILD DRIVE",
    "OVERDRIVE",
    null,
    "The overdrive is boosted even more in this high-gain sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "HEAVY DRIVE",
    "OVERDRIVE",
    null,
    "This is a serious sounding overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "ENERGY DRIVE",
    "OVERDRIVE",
    null,
    "This overdrive is energetic.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BLUE OVERDRIVE",
    "OVERDRIVE",
    null,
    "This is a bluesy overdrive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MONSTER DRIVE",
    "OVERDRIVE",
    null,
    "This is an overdrive with a ferocious sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "LIGHTNING DRIVE",
    "OVERDRIVE",
    null,
    "The sound of this overdrive is pointed like lightning.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "LEAD DISTORTION",
    "DISTORTION",
    null,
    "This effect features a bright tone and even distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "DRYMIX",
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
    "CLASSIC DISTORTION",
    "DISTORTION",
    null,
    "This is a classic sounding distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "RED CRUNCH DRIVE",
    "DISTORTION",
    null,
    "Use this effect for the famous “brown sound”.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "PRESENC",
        "Adjusts volume of super-high frequencies.",
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
    "Z MP1 DRIVE",
    "DISTORTION",
    null,
    "This original sound was created based on the combination of an ADA MP-1 and a Marshall JCM800.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SQUEAK DISTORTION",
    "DISTORTION",
    null,
    "This models a ProCo RAT. A parameter has been added that allows you to adjust the mix level of the original sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "FLTR",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "DRYMX",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ]
    ]
  ],
  [
    "PLUS DISTORTION",
    "DISTORTION",
    null,
    "This models the sound of a MXR DISTORTION+.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "DRYMX",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ],
      [
        "COMP",
        "Sets the clipping type of DIST Plus.",
        "ORIGINAL, MODIFY1, MODIFY2"
      ]
    ]
  ],
  [
    "DEEP DISTORTION",
    "DISTORTION",
    null,
    "This distortion is rich and deep.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "METEOR DISTORTION",
    "DISTORTION",
    null,
    "This is an impactful distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "RED CRUNCH DRIVE + BOOST",
    "DISTORTION",
    null,
    "This effect combines RedCrunch and Booster.",
    [],
    [
      [
        "GAIN",
        "Adjusts gain of RedCrunch.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts tone of RedCrunch.",
        "0 – 100"
      ],
      [
        "PRESENC",
        "Adjusts persence of RedCrunch.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts volume of RedCrunch.",
        "0 – 100"
      ],
      [
        "COMP",
        "Sets the clipping type of RedCrunch.",
        "0 – 2"
      ],
      [
        "LO/HI",
        "Sets the gain range.",
        "LO, HI"
      ],
      [
        "BOOST",
        "Adjusts the gain of Booster.",
        "0 – 100"
      ],
      [
        "ORDER",
        "Sets the connection order of RedCrunch and Booster.",
        "BOOST-CR, CR-BOOST"
      ]
    ]
  ],
  [
    "DISTORTION ONE",
    "DISTORTION",
    null,
    "This models the sound of a BOSS DS-1 DISTORTION.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
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
      ],
      [
        "COMP",
        "Sets the clipping type of DIST 1.",
        "ORIGINAL, MODIFY"
      ]
    ]
  ],
  [
    "EDGE DISTORTION",
    "DISTORTION",
    null,
    "This is a sharp cutting distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "HOT DISTORTION",
    "DISTORTION",
    null,
    "This distortion has the warmth of low mids.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "FEATHER DISTORTION",
    "DISTORTION",
    null,
    "This is a distortion with a bright and light sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BITING WOLF DISTORTION",
    "DISTORTION",
    null,
    "This is a distortion with a strong bite.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BRITISH DISTORTION",
    "DISTORTION",
    null,
    "This distortion can provide the British sound of the 2000s.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "Z BOTTOM DISTORTION",
    "DISTORTION",
    null,
    "This high gain sound emphasizes the low and mid frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SILKY DISTORTION",
    "DISTORTION",
    null,
    "A delicate and smooth feel can be produced by this distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SHINING DISTORTION",
    "DISTORTION",
    null,
    "This distortion has a light and smooth feel.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "STEEL DISTORTION",
    "DISTORTION",
    null,
    "This distortion features high frequencies with a hard feel.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "RAZOR DRIVE",
    "DISTORTION",
    null,
    "This effect is a new-concept distortion effect that uses Comb filtering to simulate the gain parameter of the overdriven signal.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "EDGE",
        "Adjusts the distortion tone.",
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
      ]
    ]
  ],
  [
    "WAVE SHAPER DRIVE",
    "DISTORTION",
    null,
    "This effect is another new kind of distortion effect that applies a new original algorithm to shape the waveform and create a unique sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "SHAPE",
        "Adjusts the distortion tone.",
        "0 – 100"
      ],
      [
        "COMP",
        "Adjusts the depth of the compression.",
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
    "CRISP DISTORTION",
    "DISTORTION",
    null,
    "This distortion is clear with a sharp edge.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GRUNGE DISTORTION",
    "DISTORTION",
    null,
    "This is a rough feeling distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MACHINE DISTORTION",
    "DISTORTION",
    null,
    "This distortion with a suppressed mid range has an inorganic feel.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "VIOLET DISTORTION",
    "DISTORTION",
    null,
    "This models the sound of a Suhr Riot Reloaded.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "VOICE",
        "Sets the sound style.",
        "0 – 2"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "NEBULA DISTORTION",
    "DISTORTION",
    null,
    "This distortion features a smooth warm sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "Z DREAM DISTORTION",
    "DISTORTION",
    null,
    "This high gain sound was designed for lead parts based on the Mesa Boogie Road King Series II Lead channel.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SPARK DISTORTION",
    "DISTORTION",
    null,
    "The bright sound of this distortion seems to sparkle.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "EXTREME DISTORTION",
    "DISTORTION",
    null,
    "This distortion is extremely high gain and features an aggressive sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "METAL WORLD DRIVE",
    "DISTORTION",
    null,
    "Simulation of the BOSS Metal Zone, which is characterized by long sustain and a powerful lower midrange.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "EAGLE DISTORTION",
    "DISTORTION",
    null,
    "Open high frequencies are a feature of this distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CRIMSON DISTORTION",
    "DISTORTION",
    null,
    "Tones with passion and depth can be produced by this distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "HG THROTTLE DRIVE",
    "DISTORTION",
    null,
    "This models the sound of the Mesa Boogie THROTTLE BOX(GAIN SWITCH:HI / BOOST:ON).",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "MDCUT",
        "Adjusts volume of middle frequencies.",
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
    "METAL FREAK DISTORTION",
    "DISTORTION",
    null,
    "This distortion features a strong mid scoop.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CREAMY DISTORTION",
    "DISTORTION",
    null,
    "This distortion has a smooth and persistent sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "FIREBALL DISTORTION",
    "DISTORTION",
    null,
    "This effect produces distortion with impact.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SHRED DISTORTION",
    "DISTORTION",
    null,
    "A sharp but fine distortion can be produced by this effect.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SLASH DEMON DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion features severe mid-scoop and high gain.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MEGASTORM DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion is violent like a typhoon.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "EARTHQUAKE DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion can generate a powerful effect.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "CHAOS DISTORTION",
    "DISTORTION",
    null,
    "This is an extreme distortion with a chaotic sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "HYPER LEAD DISTORTION",
    "DISTORTION",
    null,
    "Thick lead tones can be generated by this extreme distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "WATERFALL DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion features crushed low frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "HELL BOTTOM DISTORTION",
    "DISTORTION",
    null,
    "Low frequencies are emphasized excessively in this extreme distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MONSTER DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion is frighteningly powerful.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "GIANT DISTORTION",
    "DISTORTION",
    null,
    "This is an extreme distortion with a powerful impact.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SUPERNOVA DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion produces a ton of overtones.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "HEAVEN DISTORTION",
    "DISTORTION",
    null,
    "This is an extremely smooth distortion with warmth in the mid range.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "FIREWALL DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion produces dense overtones.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ROAR DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion has a wild and rough sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "PHANTOM DISTORTION",
    "DISTORTION",
    null,
    "This extreme distortion can produce massive gain and a smooth feel.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SHAKER FUZZ",
    "FUZZ",
    null,
    "This low-gain fuzz adds a rough texture.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "STONE FUZZ",
    "FUZZ",
    null,
    "This charming fuzz has just the right coarseness.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "LO-FI FUZZ",
    "FUZZ",
    null,
    "This is a low-fidelity fuzz sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GRAVITY FUZZ",
    "FUZZ",
    null,
    "The deep low-end is appealing in this fuzz.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SODA POP FUZZ",
    "FUZZ",
    null,
    "This fuzz sounds like the sizzle of carbonated water.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "WARM FUZZ",
    "FUZZ",
    null,
    "This is a warm-sounding fuzz.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GRAINY FUZZ",
    "FUZZ",
    null,
    "This bright fuzz has large grains.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CLASSIC FUZZ",
    "FUZZ",
    null,
    "This is a classic fuzz with rich mid frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BROKEN RADIO FUZZ",
    "FUZZ",
    null,
    "This fuzz sounds like a broken radio.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "MILD FUZZ",
    "FUZZ",
    null,
    "This fuzz has a soft and mild sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TRAIL FUZZ",
    "FUZZ",
    null,
    "Playing low strings produces low sounds like an octave added below with this fuzz.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "GRIT FUZZ",
    "FUZZ",
    null,
    "This fuzz has a tenacious sound with rich mid frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "UP OCTAVE BOOSTER",
    "FUZZ",
    null,
    "This effect adds an upper octave to the original sound. We recommend using the front guitar pickup.",
    [],
    [
      [
        "UP",
        "Adjusts the amount of effected sound that is mixed OCT with the original sound.",
        "0 – 100"
      ],
      [
        "DRYMX",
        "Adjusts the volume of the unaffected sound.",
        "0 – 100"
      ],
      [
        "BOTTOM",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "PRESENC",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DUALITY FUZZ",
    "FUZZ",
    null,
    "This fuzz has both heavy growling low sounds and delicate high sounds.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "DUSTY FUZZ",
    "FUZZ",
    null,
    "This is a solid low-fidelity fuzz sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BUZZY FUZZ",
    "FUZZ",
    null,
    "This fuzz has a unique sound like the wings of flying insects.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TWISTER FUZZ",
    "FUZZ",
    null,
    "This fuzz has a heavy complex tone.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "DEEP FUZZ",
    "FUZZ",
    null,
    "Deep low frequencies are a feature of this fuzz.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "VINTAGE FUZZ",
    "FUZZ",
    null,
    "This sound is inspired by vintage fuzz effects.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BLEED FUZZ",
    "FUZZ",
    null,
    "The heavy sound of this fuzz is ideal for single note phrases.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "SHARP EDGE FUZZ",
    "FUZZ",
    null,
    "This is a sharp cutting fuzz.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CRUMPLED FUZZ",
    "FUZZ",
    null,
    "This fuzz has a thoroughly crushed sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "DARK GREEN FUZZ",
    "FUZZ",
    null,
    "This fuzz has a rich low mid-range and a long sustain.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "CRACKLE FUZZ",
    "FUZZ",
    null,
    "This fuzz has a sound like cracking.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "BURST FUZZ",
    "FUZZ",
    null,
    "This fuzz has an attack that sounds like it is exploding.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "POPCORN FUZZ",
    "FUZZ",
    null,
    "This fuzz is light like popcorn.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TB MK1.5 FUZZ",
    "FUZZ",
    null,
    "This is a classic fuzz effect.",
    [],
    [
      [
        "ATTCK",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "TONE",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "COLOR",
        "Sets the sound color.",
        "1 – 2"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "OCTAVE FUZZ",
    "FUZZ",
    null,
    "This fuzz effect adds an octave above.",
    [],
    [
      [
        "BOOST",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "COLOR",
        "Sets the sound color.",
        "1 – 2"
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
    "GRIND FUZZ",
    "FUZZ",
    null,
    "The sound of this fuzz is harsh and aggressive.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TV FUZZ",
    "FUZZ",
    null,
    "This fuzz sounds like the noise of an untuned TV signal.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "ELEPHANT FUZZ",
    "FUZZ",
    null,
    "This is a fat high-gain fuzz.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "HYPER SCOOP FUZZ",
    "FUZZ",
    null,
    "This fuzz deeply cuts mid frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "NEW YORK MUFF FUZZ",
    "FUZZ",
    null,
    "This models an Electro-Harmonix Big Muff Pi. An added parameter allows you to adjust the balance of original sound and distortion.",
    [],
    [
      [
        "SUSTN",
        "Adjusts the gain.",
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
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DEVIL MUFF FUZZ",
    "FUZZ",
    null,
    "The thunderous sound of this fuzz has demonic low frequencies.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
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
    "TURBO FAT FUZZ",
    "FUZZ",
    null,
    "This fuzz has a heavy crushing sound with a boosted low-end.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SANDSTORM FUZZ",
    "FUZZ",
    null,
    "This fuzz is violent like a sweeping sandstorm.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "NOISEMAKER FUZZ",
    "FUZZ",
    null,
    "This fuzz produces a discontinuous noisy sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "SPLATTER FUZZ",
    "FUZZ",
    null,
    "This extreme fuzz has a rough feeling like splattering.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "CRASH FUZZ",
    "FUZZ",
    null,
    "This fuzz can produce a balanced tone with extreme distortion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BLAZE FUZZ",
    "FUZZ",
    null,
    "This extremely rough fuzz has a sharp feeling.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "WALL FUZZ",
    "FUZZ",
    null,
    "A wall of sound can be produced by this fuzz.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "HELLFIRE FUZZ",
    "FUZZ",
    null,
    "This fuzz realizes an intense crushed sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BLAST FUZZ",
    "FUZZ",
    null,
    "This fuzz produces a powerful sound like an explosion.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "DESTROYER FUZZ",
    "FUZZ",
    null,
    "This fuzz makes a destructive thunderous sound.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "MODE",
        "Sets the noise gate mode.",
        "GATE. REDUCTION"
      ],
      [
        "THRSH",
        "Adjusts the effect sensitivity.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MS45OS DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Marshall JTM 45 Offset. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "IN1",
        "Adjusts the gain of the input1.",
        "OFF – 100"
      ],
      [
        "IN2",
        "Adjusts the gain of the input2.",
        "OFF – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MS1959 DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Marshall 1959 SUPER LEAD 100. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "IN1",
        "Adjusts the gain of the input1.",
        "OFF – 100"
      ],
      [
        "IN2",
        "Adjusts the gain of the input2.",
        "OFF – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MS800 DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Marshall JCM800 2203. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "INPUT",
        "Adjusts the input gain.",
        "LO, HI"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "FD B-MAN DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Fender ‘59 Bassman. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "INPUT",
        "Selects the input channel.",
        "NORMAL, BRIGHT"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "10 – 120"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "10 – 120"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "10 – 120"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "10 – 120"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "10 – 120"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "10 – 120"
      ]
    ]
  ],
  [
    "FD TWIN-R DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Fender ‘65 Twin Reverb. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "BRIGHT",
        "Sets the high frequency response. The effect noticeable at lower gain settings.",
        "is OFF, ON"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "10 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "10 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "10 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "10 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "10 – 100"
      ]
    ]
  ],
  [
    "FD DELUXE-R DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Fender ‘65 Deluxe Reverb. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "INPUT",
        "Selects the input channel.",
        "NORMAL, VIBRATO"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "10 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "10 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "10 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "10 – 100"
      ]
    ]
  ],
  [
    "FD MASTER DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Fender ToneMaster B channel. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "10 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "10 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "10 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "10 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "10 – 100"
      ],
      [
        "FAT",
        "Sets the sound style.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "UK 30A DRIVE",
    "PREAMP",
    null,
    "This models the sound of an early class A British combo amp. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "TONE",
        "CUT Adjusts the tone.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BG MARK1 DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Mesa Boogie Mark I combo amp. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN1",
        "Adjusts the gain of the first stage.",
        "0 – 100"
      ],
      [
        "GAIN2",
        "Adjusts the gain of the second stage.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "BG MARK3 DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Mesa Boogie Mark III combo amp. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN1",
        "Adjusts the gain of the first stage.",
        "0 – 100"
      ],
      [
        "GAIN2",
        "Adjusts the gain of the second stage.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "RECTI DUAL DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Mesa Boogie Dual Rectifier Orange Channel. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "MODE",
        "Sets the tone of the character.",
        "VNTG, MDRN"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "XTACY BLUE DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Bogner Ecstasy Blue channel. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "STRUCT",
        "Selects the type and gain of the tone.",
        "LO, HI"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "HW 100 DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Hiwatt Custom 100. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "INPUT",
        "Selects the input channel.",
        "NORMAL, BRILL"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ORG120 DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Orange Graphic120. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "INPUT",
        "Selects the input channel.",
        "LO, HI"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ],
      [
        "COLOR",
        "Sets the tone of the effect type.",
        "1 – 6"
      ]
    ]
  ],
  [
    "DZ DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Diezel Herbert Channel2. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ],
      [
        "DEEP",
        "Emphasizes low frequencies.",
        "0 – 100"
      ],
      [
        "MDCUT",
        "Cuts middle frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MATCH30 DRIVE",
    "PREAMP",
    null,
    "This models the sound of the Matchless DC-30. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN1",
        "Adjusts the gain of channel1.",
        "OFF – 100"
      ],
      [
        "BASS1",
        "Adjusts volume of low frequencies in the channel1.",
        "0 – 100"
      ],
      [
        "TREBLE1",
        "Adjusts volume of high frequencies in the channel1.",
        "0 – 100"
      ],
      [
        "GAIN2",
        "Adjusts the gain of channel2.",
        "OFF – 100"
      ],
      [
        "TONE2",
        "Adjusts the tone of channel2.",
        "0 – 5"
      ],
      [
        "CUT",
        "Adjusts the tone.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – OFF"
      ]
    ]
  ],
  [
    "KRAMPUS DRIVE",
    "PREAMP",
    null,
    "This high-gain sound, which uses a ZOOM original preamp, provides both heavy low frequencies and brightness. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "REDLOOM DRIVE",
    "PREAMP",
    null,
    "Merges the simple tone of the early days of guitar amps with the rich overtones of a 60’s small tube amp. Ideal for playing rhythm. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "VELVET DRIVE",
    "PREAMP",
    null,
    "Provides a smooth character amp that balances the dynamic response between the wound and plain strings, enabling you to play both lead and backing without switching tones. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MUDDY DRIVE",
    "PREAMP",
    null,
    "Delivers a vintage style amp sound processed with a clear measured tone with natural crunch. Perfect for blues and rock. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "7 HEAVEN DRIVE",
    "PREAMP",
    null,
    "Emphases on the sound for 7 and 8 string guitars by blending the dynamic response with a very tight low end. Expect a very powerful metal sound. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "POLLEX DRIVE",
    "PREAMP",
    null,
    "With extreme drop-tuning, this amp delivers a heavy-metal Djent style of sound. Recommended for slap-playing as well. This sound is designed for connecting to an amp.",
    [],
    [
      [
        "GAIN",
        "Adjusts the gain.",
        "0 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ],
      [
        "BASS",
        "Adjusts volume of low frequencies.",
        "0 – 100"
      ],
      [
        "MID",
        "Adjusts volume of middle frequencies.",
        "0 – 100"
      ],
      [
        "TREBLE",
        "Adjusts volume of high frequencies.",
        "0 – 100"
      ],
      [
        "PRESENCE",
        "Adjusts volume of super-high frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "NOISE GATE",
    "TOOL",
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
        "Adjusts the envelope release.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ZOOM NOISE REDUCTION",
    "TOOL",
    null,
    "ZOOM’s unique noise reduction cuts noise during pauses in playing without affecting the tone.",
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
    "GUITAR GRAPHIC EQ",
    "TOOL",
    null,
    "This mono graphic equalizer has 6 bands that suit guitar frequencies.",
    [],
    [
      [
        "160Hz",
        "Boosts or cuts the low (160 Hz) frequency band.",
        "-12 – 12"
      ],
      [
        "400Hz",
        "Boosts or cuts the low (400 Hz) frequency band.",
        "-12 – 12"
      ],
      [
        "800Hz",
        "Boosts or cuts the low (800 Hz) frequency band.",
        "-12 – 12"
      ],
      [
        "3.2kHz",
        "Boosts or cuts the low (3.2 kHz) frequency band.",
        "-12 – 12"
      ],
      [
        "6.4kHz",
        "Boosts or cuts the low (6.4 kHz) frequency band.",
        "-12 – 12"
      ],
      [
        "12kHz",
        "Boosts or cuts the low (12 kHz) frequency band.",
        "-12 – 12"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "0 – 100"
      ]
    ]
  ],
  [
    "GUITAR GRAPHIC EQ7",
    "TOOL",
    null,
    "This mono graphic equalizer has 7 bands that suit guitar frequencies.",
    [],
    [
      [
        "100Hz",
        "Adjust to boost or cut 100 Hz.",
        "-12 – 12"
      ],
      [
        "200Hz",
        "Adjust to boost or cut 200 Hz.",
        "-12 – 12"
      ],
      [
        "400Hz",
        "Adjust to boost or cut 400 Hz.",
        "-12 – 12"
      ],
      [
        "800Hz",
        "Adjust to boost or cut 800 Hz.",
        "-12 – 12"
      ],
      [
        "1.6kHz",
        "Adjust to boost or cut 1.6 kHz.",
        "-12 – 12"
      ],
      [
        "3.2kHz",
        "Adjust to boost or cut 3.2 kHz.",
        "-12 – 12"
      ],
      [
        "6.4kHz",
        "Adjust to boost or cut 6.4 kHz.",
        "-12 – 12"
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
    "TOOL",
    null,
    "This is a 1-band parametric equalizer.",
    [],
    [
      [
        "FREQ",
        "Sets the frequency of the equalizer.",
        "20 Hz – 20k Hz"
      ],
      [
        "Q",
        "Adjusts equalizer Q.",
        "0.5 – 16"
      ],
      [
        "GAIN",
        "Adjusts the gain.",
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
    "LOW EQ",
    "TOOL",
    null,
    "Designed for low frequencies, this equalizer allows you to select the type.",
    [],
    [
      [
        "TYPE",
        "Sets filter type.",
        "SHELF, HPF"
      ],
      [
        "FREQ",
        "Sets the frequency of the filter.",
        "20 Hz – 640 Hz"
      ],
      [
        "GAIN",
        "Adjusts the gain. This setting is disabled when the Type parameter is set to HPF.",
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
    "HIGH EQ",
    "TOOL",
    null,
    "Designed for high frequencies, this equalizer allows you to select the type.",
    [],
    [
      [
        "TYPE",
        "Sets filter type.",
        "SHELF, LPF"
      ],
      [
        "FREQ",
        "Sets the frequency of the filter.",
        "500 Hz – 20k Hz"
      ],
      [
        "GAIN",
        "Adjusts the gain. This setting is disabled when the Type parameter is set to HPF.",
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
    "COMPRESSOR",
    "TOOL",
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
    "TOOL",
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
        "Sets compressor attack speed.",
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
    "TOOL",
    null,
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
    "TOOL",
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
    "BLACK OPTICAL COMPRESSOR",
    "TOOL",
    null,
    "This is a simulation of the Demeter COMP-1 Compulator. Added parameters allow you to adjust the tone.",
    [],
    [
      [
        "COMP",
        "Adjusts the depth of the compression.",
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
    "MULTIBAND COMPRESSOR",
    "TOOL",
    null,
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
    "160 COMPRESSOR",
    "TOOL",
    null,
    "This compressor is in the style of the dbx 160A.",
    [],
    [
      [
        "THRSH",
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
    "1176 LIMITER",
    "TOOL",
    null,
    "This is a simulation of the UREI 1176LN.",
    [],
    [
      [
        "INPUT",
        "Adjusts the input level.",
        "0 – 80"
      ],
      [
        "RATIO",
        "Adjusts the compression ratio.",
        "4:1, 8:1, 12:1, 20:1"
      ],
      [
        "REL",
        "This is a limiter that suppresses signal peaks above a certain reference level.",
        "10 – 70"
      ],
      [
        "OUTPUT",
        "Adjusts the output level.",
        "0 – 80"
      ]
    ]
  ],
  [
    "ORANGE LIMITER",
    "TOOL",
    null,
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
    "EXCITER",
    "TOOL",
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
  ]
];

const EFFECT_CHARACTER = ["MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "MID SCOOP", "FLAT", "BRIGHT", "FAT", "MID SCOOP", "FLAT", "FAT", "BRIGHT", "MID BOOST", "FAT", "MID SCOOP", "BRIGHT", "BRIGHT", "FAT", "FLAT", "BRIGHT", "FAT", "MID SCOOP", "FAT", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "MID BOOST", "FAT", "MID BOOST", "BRIGHT", "MID SCOOP", "FAT", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "FAT", "MID BOOST", "BRIGHT", "MID SCOOP", "BRIGHT", "FAT", "MID BOOST", "MID BOOST", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "FAT", "MID SCOOP", "MID BOOST", "MID SCOOP", "FAT", "MID SCOOP", "MID SCOOP", "MID BOOST", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "FAT", "BRIGHT", "MID BOOST", "BRIGHT", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "BRIGHT", "FAT", "MID BOOST", "BRIGHT", "MID SCOOP", "MID BOOST", "BRIGHT", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "FAT", "FAT", "BRIGHT", "MID SCOOP", "MID BOOST", "BRIGHT", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "MID BOOST", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "FAT", "BRIGHT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID BOOST", "BRIGHT", "FAT", "MID SCOOP", "MID SCOOP", "MID SCOOP", "BRIGHT", "BRIGHT", "BRIGHT", "FAT", "MID BOOST", "MID BOOST", "MID BOOST", "BRIGHT", "FAT", "FAT", "FAT", "MID BOOST", "BRIGHT", "BRIGHT", "MID SCOOP", "BRIGHT", "MID SCOOP", "MID BOOST", "FAT", "MID BOOST", "MID SCOOP", "MID BOOST", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
