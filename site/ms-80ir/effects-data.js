// Zoom MS-80IR+ effects catalog — original text from the official ZOOM Effects List (E_MS-80IRplus_FX-list.pdf).
// Written by tools/ms80ir-data.py with tools/extract-effects-list.py; descriptions and parameter text are not reworded.

const CATEGORIES = {
  "AMP": {
    "label": "Amp",
    "color": "#f85149"
  },
  "STUDIO AMBIENCE": {
    "label": "Studio ambience",
    "color": "#7ee2b8"
  },
  "USER IR": {
    "label": "User IR",
    "color": "#a371f7"
  },
  "TOOL": {
    "label": "Tool",
    "color": "#8b949e"
  },
  "DELAY": {
    "label": "Delay",
    "color": "#58a6ff"
  }
};

const EFFECTS_DATA = [
  [
    "MS 45os",
    "AMP",
    null,
    "This models the sound of the Marshall JTM 45 Offset.",
    [],
    [
      [
        "IN1",
        "Adjusts the gain of the input1.",
        "OFF, 0 – 100"
      ],
      [
        "IN2",
        "Adjusts the gain of the input2.",
        "OFF, 0 – 100"
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
    "MS 1959",
    "AMP",
    null,
    "This models the sound of the Marshall 1959 SUPER LEAD 100.",
    [],
    [
      [
        "IN1",
        "Adjusts the gain of the input1.",
        "OFF, 0 – 100"
      ],
      [
        "IN2",
        "Adjusts the gain of the input2.",
        "OFF, 0 – 100"
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
    "MS 800",
    "AMP",
    null,
    "This models the sound of the Marshall JCM800 2203.",
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
    "FD B-MAN",
    "AMP",
    null,
    "This models the sound of the Fender '59 Bassman.",
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
    "FD TWIN-R",
    "AMP",
    null,
    "This models the sound of the Fender '65 Twin Reverb.",
    [
      "sync"
    ],
    [
      [
        "BRGHT",
        "Sets the high frequency response. The effect is noticeable at lower gain settings.",
        "OFF, ON"
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
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "10 – 100"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "10 – 100"
      ]
    ]
  ],
  [
    "FD DELUXE-R",
    "AMP",
    null,
    "This models the sound of the Fender '65 Deluxe Reverb.",
    [
      "sync"
    ],
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
      ],
      [
        "DEPTH",
        "Sets the depth of the modulation.",
        "10 – 100"
      ],
      [
        "SPEED",
        "Sets the speed of the modulation.",
        "10 – 100"
      ]
    ]
  ],
  [
    "FD MASTER",
    "AMP",
    null,
    "This models the sound of the Fender ToneMaster B channel.",
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
    "UK 30A",
    "AMP",
    null,
    "This models the sound of an early class A British combo amp.",
    [
      "sync"
    ],
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
        "TONE CUT",
        "Adjusts the tone.",
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
      ]
    ]
  ],
  [
    "BG MARK1",
    "AMP",
    null,
    "This models the sound of the Mesa Boogie Mark I combo amp.",
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
    "BG MARK3",
    "AMP",
    null,
    "This models the sound of the Mesa Boogie Mark III combo amp.",
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
    "RECTI DUAL",
    "AMP",
    null,
    "This models the sound of the Mesa Boogie Dual Rectifier Orange Channel.",
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
    "XTACY BLUE",
    "AMP",
    null,
    "This models the sound of the Bogner Ecstasy Blue channel.",
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
    "HW 100",
    "AMP",
    null,
    "This models the sound of the Hiwatt Custom 100.",
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
    "ORG120",
    "AMP",
    null,
    "This models the sound of the Orange Graphic120.",
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
    "AMP",
    null,
    "This models the sound of the Diezel Herbert Channel2.",
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
        "MIDCUT",
        "Cuts middle frequencies.",
        "0 – 100"
      ]
    ]
  ],
  [
    "MATCH30",
    "AMP",
    null,
    "This models the sound of the Matchless DC-30.",
    [],
    [
      [
        "GAIN1",
        "Adjusts the gain of channel1.",
        "OFF, 0 – 100"
      ],
      [
        "BASS1",
        "Adjusts volume of low frequencies in the channel1.",
        "0 – 100"
      ],
      [
        "TRBL1",
        "Adjusts volume of high frequencies in the channel1.",
        "0 – 100"
      ],
      [
        "GAIN2",
        "Adjusts the gain of channel2.",
        "OFF, 0 – 100"
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
        "0 – 100, OFF"
      ]
    ]
  ],
  [
    "KRAMPUS",
    "AMP",
    null,
    "Combines the solid low range of a modern high gain amplifier with the brightness of an 80's British amplifier.",
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
    "REDLOOM",
    "AMP",
    null,
    "Merges the simple tone of the early days of guitar amps with the rich overtones of a 60's small tube amp. Ideal for playing rhythm.",
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
    "VELVET",
    "AMP",
    null,
    "Provides a smooth character amp that balances the dynamic response between the wound and plain strings, enabling you to play both lead and backing without switching tones.",
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
    "MUDDY",
    "AMP",
    null,
    "Delivers a vintage style amp sound processed with a clear measured tone with natural crunch. Perfect for blues and rock.",
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
    "7 HEAVEN",
    "AMP",
    null,
    "Emphases on the sound for 7 and 8 string guitars by blending the dynamic response with a very tight low end. Expect a very powerful metal sound.",
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
    "POLLEX",
    "AMP",
    null,
    "With extreme drop-tuning, this amp delivers a heavy-metal Djent style of sound. Recommended for slap-playing as well.",
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
    "WHITE CANVAS",
    "AMP",
    null,
    "With an unassuming clear tone and just the right amount of compression, this original amp model can emphasize the appealing characteristics of connected stump boxes.",
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
    "WOODY STUDIO",
    "STUDIO AMBIENCE",
    null,
    "This re-creation of a studio set up for recording can produce calm reverb.",
    [],
    [
      [
        "AMBIENCE",
        "Adjusts the amount of reverberation that is mixed with the original sound.",
        "10 – 100"
      ]
    ]
  ],
  [
    "URBAN STUDIO",
    "STUDIO AMBIENCE",
    null,
    "This re-creation of a studio that features stone walls can produce bright reverb.",
    [],
    [
      [
        "AMBIENCE",
        "Adjusts the amount of reverberation that is mixed with the original sound.",
        "10 – 100"
      ]
    ]
  ],
  [
    "LIVE MUSIC CLUB",
    "STUDIO AMBIENCE",
    null,
    "This re-creation of a live music club with an audience capacity of 1000 can produce deep reverb.",
    [],
    [
      [
        "AMBIENCE",
        "Adjusts the amount of reverberation that is mixed with the original sound.",
        "10 – 100"
      ]
    ]
  ],
  [
    "CONCERT HALL",
    "STUDIO AMBIENCE",
    null,
    "This wooden concert hall re-creation can produce warm reverb.",
    [],
    [
      [
        "AMBIENCE",
        "Adjusts the amount of reverberation that is mixed with the original sound.",
        "10 – 100"
      ]
    ]
  ],
  [
    "LARGE CHAPEL",
    "STUDIO AMBIENCE",
    null,
    "This re-creation of a spacious chapel can produce gorgeous reverb.",
    [],
    [
      [
        "AMBIENCE",
        "Adjusts the amount of reverberation that is mixed with the original sound.",
        "10 – 100"
      ]
    ]
  ],
  [
    "IR",
    "USER IR",
    null,
    "Impulse responses capture the acoustic characteristics of spaces and quantify them as data.",
    [],
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
        "BAL",
        "Adjusts the balance between original and effect sounds. When it is set between -100 to -1, the polarity of effect sound is reversed.",
        "-100 – 100"
      ],
      [
        "VOL",
        "Adjusts the volume.",
        "-60.0 – 6.0"
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
        "Adjust the envelope release.",
        "0 – 100"
      ]
    ]
  ],
  [
    "ZOOM NOISE REDUCTION",
    "TOOL",
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
    "STEREO GUITAR GRAPHIC EQ",
    "TOOL",
    null,
    "This stereo graphic equalizer has 6 bands that suit guitar frequencies.",
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
    "STEREO GUITAR GRAPHIC EQ7",
    "TOOL",
    null,
    "This stereo graphic equalizer has 7 bands that suit guitar frequencies.",
    [],
    [
      [
        "100HZ",
        "Adjust to boost or cut 100 Hz.",
        "-12.0 – 12.0"
      ],
      [
        "200HZ",
        "Adjust to boost or cut 200 Hz.",
        "-12.0 – 12.0"
      ],
      [
        "400HZ",
        "Adjust to boost or cut 400 Hz.",
        "-12.0 – 12.0"
      ],
      [
        "800HZ",
        "Adjust to boost or cut 800 Hz.",
        "-12.0 – 12.0"
      ],
      [
        "1.6KHZ",
        "Adjust to boost or cut 1.6k Hz.",
        "-12.0 – 12.0"
      ],
      [
        "3.2KHZ",
        "Adjust to boost or cut 3.2k Hz.",
        "-12.0 – 12.0"
      ],
      [
        "6.4KHZ",
        "Adjust to boost or cut 6.4k Hz.",
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
    "STEREO PARAMETRIC EQ",
    "TOOL",
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
    "STEREO LOW EQ",
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
        "20Hz – 640Hz"
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
    "STEREO HIGH EQ",
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
        "500Hz – 20kHz"
      ],
      [
        "GAIN",
        "Adjusts the gain. This setting is disabled when the Type parameter is set to LPF.",
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
    "BPM",
    "TOOL",
    null,
    "The BPM, which is used for tempo synchronization, can be set separately for each patch memory. The tempo can be set by pressing the footswitch repeatedly at a steady pace. The indicator will blink at the set tempo interval.",
    [],
    [
      [
        "BPM",
        "Sets the tempo.",
        "40 – 250"
      ]
    ]
  ],
  [
    "DELAY",
    "DELAY",
    null,
    "This long delay has a maximum length of 4000 mS.",
    [
      "sync"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 599 600 – 4000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "SHORT, LONG, ♩"
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
      "sync"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 599 600 – 4000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "SHORT, LONG, ♩"
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
        "When ON, effect sound continues even after effect is turned off. When OFF, effect sound stops right when effect is turned off.",
        "OFF, ON"
      ]
    ]
  ],
  [
    "TAPE ECHO",
    "DELAY",
    null,
    "This effect simulates a tape echo. Changing the \"Time\" parameter changes the pitch of the echoes.",
    [
      "sync"
    ],
    [
      [
        "TIME",
        "Sets the delay time.",
        "1 – 599 600 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "SHORT, LONG, ♩"
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
    "STEREO DELAY",
    "DELAY",
    null,
    "This stereo delay allows the left and right delay times to be set separately.",
    [
      "sync"
    ],
    [
      [
        "TIME L",
        "Adjusts delay time of left channel delay.",
        "1 – 599 600 – 2000"
      ],
      [
        "TIME R",
        "Adjusts delay time of right channel delay.",
        "1 – 599 600 – 2000"
      ],
      [
        "MODE",
        "Sets the delay time range. When metronome is chosen, the delay time is synchronized to the tempo.",
        "SHORT, LONG, ♩"
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
  ]
];
