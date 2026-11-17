// Zoom MS-90LP+ loop effects, rhythm patterns and specifications — original text from the official ZOOM Operation Manual
// (https://zoomcorp.com/manuals/ms-90lpplus-en/). Written by tools/ms90lp-data.py; nothing is reworded.

const LOOP_FX = [
  [
    "REVERSE",
    "The loop will be played backward."
  ],
  [
    "HALF SPEED",
    "The loop will be played at half speed."
  ],
  [
    "DOUBLE SPEED",
    "The loop will be played at double speed."
  ],
  [
    "HOLD",
    "A short interval will be played repeatedly."
  ],
  [
    "TAPE STOP",
    "Playback will slow down until it stops."
  ],
  [
    "ONE-SHOT PLAY",
    "The loop will play once and then stop."
  ],
  [
    "RESTART",
    "The loop will begin playing from the beginning."
  ],
  [
    "TAP TEMPO",
    "The tempo can be set by pressing the (footswitch) repeatedly at the desired speed."
  ]
];

const LOOP_FX_HINT = "REVERSE, HALF SPEED, DOUBLE SPEED and HOLD can also be set to be unlatched (“UNLATCH” will appear after the effect name). Unlatched effects are only turned on while the (LOOP FX) switch is being pressed.";

// [number, pattern name, time signature]
const RHYTHMS = [[1, "8 BEATS 1", "4/4"], [2, "8 BEATS 2", "4/4"], [3, "8 BEATS 3", "4/4"], [4, "8 BEATS 4", "4/4"], [5, "16 BEATS 1", "4/4"], [6, "16 BEATS 2", "4/4"], [7, "FUNK 1", "4/4"], [8, "FUNK 2", "4/4"], [9, "FUSION", "4/4"], [10, "JAZZ FUNK 1", "4/4"], [11, "JAZZ FUNK 2", "4/4"], [12, "POP 80S 1", "4/4"], [13, "POP 80S 2", "4/4"], [14, "MOTOWN", "4/4"], [15, "DISCO", "4/4"], [16, "JAZZ 1", "4/4"], [17, "JAZZ 2", "4/4"], [18, "JAZZ 3", "4/4"], [19, "JAZZ 4", "4/4"], [20, "COUNTRY 1", "2/4"], [21, "COUNTRY 2", "2/4"], [22, "BLUES 1", "4/4"], [23, "BLUES 2", "4/4"], [24, "SHUFFLE 1", "4/4"], [25, "SHUFFLE 2", "4/4"], [26, "SHUFFLE 3", "4/4"], [27, "SHUFFLE 4", "4/4"], [28, "BOSSA 1", "4/4"], [29, "BOSSA 2", "4/4"], [30, "CAJON 1", "4/4"], [31, "CAJON 2", "4/4"], [32, "CAJON 3", "4/4"], [33, "CAJON 4", "4/4"], [34, "SAMBA 1", "4/4"], [35, "SAMBA 2", "4/4"], [36, "SAMBA 3", "4/4"], [37, "SALSA 1", "4/4"], [38, "SALSA 2", "4/4"], [39, "CUBA GROOVE 1", "4/4"], [40, "CUBA GROOVE 2", "4/4"], [41, "DJEMBE 1", "4/4"], [42, "DJEMBE 2", "4/4"], [43, "REGGAE 1", "4/4"], [44, "REGGAE 2", "4/4"], [45, "NU SOUL 1", "4/4"], [46, "NU SOUL 2", "4/4"], [47, "LO-FI HH 1", "4/4"], [48, "LO-FI HH 2", "4/4"], [49, "NU JAZZ 1", "4/4"], [50, "NU JAZZ 2", "4/4"], [51, "HOUSE 1", "4/4"], [52, "HOUSE 2", "4/4"], [53, "TECHNO 1", "4/4"], [54, "TECHNO 2", "4/4"], [55, "DANCE HALL", "4/4"], [56, "TRIPLET", "4/4"], [57, "JAZZ WALTZ 1", "3/4"], [58, "JAZZ WALTZ 2", "3/4"], [59, "CT WALTZ 1", "3/4"], [60, "CT WALTZ 2", "3/4"], [61, "5/4 GROOVE 1", "5/4"], [62, "5/4 GROOVE 2", "5/4"], [63, "METRONOME", ""], [64, "METRONOME 3", "3/4"], [65, "METRONOME 4", "4/4"], [66, "METRONOME 5", "5/4"], [67, "GUIDE 1", "4/4"], [68, "GUIDE 2", "4/4"]];

const SPECS = [
  [
    "Number of memories",
    "100"
  ],
  [
    "Sampling frequency",
    "44.1 kHz"
  ],
  [
    "Signal processing",
    "32-bit float"
  ],
  [
    "Number of recording and playback tracks",
    "1"
  ],
  [
    "Data format",
    "WAV (44.1 kHz, stereo, 32-bit floating-point)"
  ],
  [
    "Maximum recording times",
    "90 minutes (1 loop) / 13 hours or more (total for all memories)"
  ],
  [
    "Frequency response",
    "20 Hz – 20 kHz (+0.5 dB/−0.5 dB) (when 10kΩ load)"
  ],
  [
    "Display",
    "160×128 dot-matrix LCD with color backlight"
  ]
];
