/* Pedal models: drawings of the ZOOM MultiStomp pedals, measured from the product
   photos in site/landing/. One geometry for every pedal (body 300 x 536 units,
   jacks outside it), painted in three styles:
     'real'  gradients, textures, chrome and a dot-matrix LCD
     'flat'  flat colours with a few shading bands
     'line'  outlines only, in currentColor (like the drawings of a manual)
   PEDALMODEL.mount3d() wraps the realistic top face in CSS 3D sides, with knobs
   and footswitch standing out of the surface.
   The display is drawn, not photographed, so it can show any effect or patch name.
   The site shows the realistic style with cables: `node tools/pedal-models.mjs`
   writes site/landing/pedal-<id>.svg from this file (home page carousel, Pedal
   manager connection box). All styles side by side: site/designs/pedal-models/. */
(function (root) {
  'use strict';

  /* ---------- helpers ---------- */
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
  const light = (c, t) => mix(c, '#ffffff', t);
  const dark = (c, t) => mix(c, '#000000', t);
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const n2 = (v) => Math.round(v * 100) / 100;
  const FONT = "'Arial Black','Arial Bold','Helvetica Neue',Arial,sans-serif";

  /* ---------- the pedals (colours and labels read from the photos) ---------- */
  const MEMORY_PADS = 'memory', LOOPER_PADS = 'looper';
  const PEDALS = {
    'ms-60b': {
      name: 'MS-60B+', body: '#cf232b', ink: '#3a0a0d', strip: '#2b0a0c', stripText: '#f27a7f',
      knob: 'black', lcd: '#f4aaa5', lcdInk: '#4c1a1c',
      left: [{ y: 106, lines: ['< L', 'MONO'] }, { y: 184, lines: ['< R'] }],
      right: [{ y: 106, lines: ['<', 'INPUT'] }],
      knobs: ['ADD', 'DELETE', 'LIBRARY', 'MENU'], pads: MEMORY_PADS, hold: 'HOLD > TUNER',
      display: { type: 'card', lines: ['CLEAR', 'DRIVER', 'PREAMP'] },
    },
    'ms-50g': {
      name: 'MS-50G+', body: '#e7e7e5', ink: '#262626', strip: '#1c1c1c', stripText: '#e7e7e5',
      knob: 'black', lcd: '#f29ea1', lcdInk: '#4d171b',
      left: [{ y: 106, lines: ['< L', 'MONO'] }, { y: 184, lines: ['< R'] }],
      right: [{ y: 106, lines: ['<', 'INPUT'] }],
      knobs: ['ADD', 'DELETE', 'LIBRARY', 'MENU'], pads: MEMORY_PADS, hold: 'HOLD > TUNER',
      display: { type: 'card', lines: ['KRAMPUS', 'DRIVE'] },
    },
    'ms-70cdr': {
      name: 'MS-70CDR+', body: '#2b8de0', ink: '#07172a', strip: '#0a2036', stripText: '#86c8ff',
      knob: 'black', lcd: '#95e9a9', lcdInk: '#123a1f',
      left: [{ y: 106, lines: ['< L', 'MONO'] }, { y: 184, lines: ['< R'] }],
      right: [{ y: 106, lines: ['< L', 'MONO'] }, { y: 184, lines: ['< R'] }],
      knobs: ['ADD', 'DELETE', 'LIBRARY', 'MENU'], pads: MEMORY_PADS, hold: 'HOLD > TUNER',
      display: { type: 'card', lines: ['HD HALL', 'REVERB'] },
    },
    'ms-200d': {
      name: 'MS-200D+', body: '#e8d61f', ink: '#262200', strip: '#1d1b05', stripText: '#f0e05a',
      knob: 'black', lcd: '#e4ecb6', lcdInk: '#383f1d',
      left: [{ y: 100, lines: ['<', 'OUTPUT'] }],
      right: [{ y: 100, lines: ['<', 'INPUT'] }],
      knobs: ['ADD', 'DELETE', 'LIBRARY', 'MENU'], pads: MEMORY_PADS, hold: 'HOLD > TUNER',
      display: { type: 'card', lines: ['SKY', 'OVERDRIVE'] },
    },
    'ms-80ir': {
      name: 'MS-80IR+', body: '#242426', ink: '#e8e8e9', strip: '#cacaca', stripText: '#1c1c1e',
      knob: 'gold', lcd: '#a978e8', lcdInk: '#2c0d4f',
      left: [{ y: 100, lines: ['<H', 'L/MONO'] }, { y: 180, lines: ['< R'] }],
      right: [{ y: 100, lines: ['< L', 'MONO'] }, { y: 180, lines: ['< R'] }],
      knobs: ['ADD', 'DELETE', 'LIBRARY', 'MENU'], pads: MEMORY_PADS, hold: 'HOLD > TUNER',
      display: { type: 'amp', lines: ['KRAMPUS'] },
    },
    'ms-90lp': {
      name: 'MS-90LP+', body: '#69c334', ink: '#10240a', strip: '#11190c', stripText: '#8be353',
      knob: 'black', lcd: '#ff7083', lcdInk: '#57091a',
      left: [{ y: 106, lines: ['< L', 'MONO'] }, { y: 184, lines: ['< R'] }],
      right: [{ y: 106, lines: ['< L', 'MONO'] }, { y: 184, lines: ['< R'] }],
      knobs: ['MEMORY', 'LOOP FX', 'RHYTHM', 'MENU'], pads: LOOPER_PADS, hold: '- REC/PLAY',
      display: { type: 'looper', lines: [] },
    },
  };

  /* ---------- geometry (units; body from x 60 to 360, y 20 to 556) ---------- */
  const BODY = 'M60,50 L60,541 Q60,556 75,556 L345,556 Q360,556 360,541 L360,50 L342,24 Q339,20 333,20 L87,20 Q81,20 78,24 Z';
  const BODY_3D = 'M64,20 H356 Q360,20 360,24 V552 Q360,556 356,556 H64 Q60,556 60,552 V24 Q60,20 64,20 Z';
  const FRAME = { x: 129, y: 58, w: 162, h: 136 };
  const LCD = { x: 135, y: 64, w: 150, h: 124 };
  const KNOB_X = [114.75, 178.25, 241.75, 305.25], KNOB_Y = 272, KNOB_R = 23;
  const PADS = [
    { x: 84, y: 326, w: 110, h: 94 }, { x: 226, y: 326, w: 110, h: 94 },
    { x: 84, y: 446, w: 110, h: 96 }, { x: 226, y: 446, w: 110, h: 96 },
  ];
  const SW = { x: 210, y: 433, bezel: 52, ring: 44, hole: 23, cap: 19 };
  const LED = { x: 210, y: 338 };

  /* ---------- LCD pixel fonts ---------- */
  const F57 = {
    A: '.###./#...#/#...#/#####/#...#/#...#/#...#', B: '####./#...#/#...#/####./#...#/#...#/####.',
    C: '.###./#...#/#..../#..../#..../#...#/.###.', D: '####./#...#/#...#/#...#/#...#/#...#/####.',
    E: '#####/#..../#..../####./#..../#..../#####', F: '#####/#..../#..../####./#..../#..../#....',
    G: '.###./#...#/#..../#.###/#...#/#...#/.####', H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
    I: '.###./..#../..#../..#../..#../..#../.###.', J: '..###/...#./...#./...#./...#./#..#./.##..',
    K: '#...#/#..#./#.#../##.../#.#../#..#./#...#', L: '#..../#..../#..../#..../#..../#..../#####',
    M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', N: '#...#/#...#/##..#/#.#.#/#..##/#...#/#...#',
    O: '.###./#...#/#...#/#...#/#...#/#...#/.###.', P: '####./#...#/#...#/####./#..../#..../#....',
    Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', R: '####./#...#/#...#/####./#.#../#..#./#...#',
    S: '.####/#..../#..../.###./....#/....#/####.', T: '#####/..#../..#../..#../..#../..#../..#..',
    U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.', V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
    W: '#...#/#...#/#...#/#.#.#/#.#.#/#.#.#/.#.#.', X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
    Y: '#...#/#...#/.#.#./..#../..#../..#../..#..', Z: '#####/....#/...#./..#../.#.../#..../#####',
    0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', 1: '..#../.##../..#../..#../..#../..#../.###.',
    2: '.###./#...#/....#/...#./..#../.#.../#####', 3: '#####/...#./..#../...#./....#/#...#/.###.',
    4: '...#./..##./.#.#./#..#./#####/...#./...#.', 5: '#####/#..../####./....#/....#/#...#/.###.',
    6: '..##./.#.../#..../####./#...#/#...#/.###.', 7: '#####/....#/...#./..#../.#.../.#.../.#...',
    8: '.###./#...#/#...#/.###./#...#/#...#/.###.', 9: '.###./#...#/#...#/.####/....#/...#./.##..',
    '+': '...../..#../..#../#####/..#../..#../.....', '-': '...../...../...../#####/...../...../.....',
    '.': '...../...../...../...../...../.##../.##..', '/': '...../....#/...#./..#../.#.../#..../.....',
    "'": '..#../..#../.#.../...../...../...../.....', '!': '..#../..#../..#../..#../..#../...../..#..',
    '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#', ':': '...../.##../.##../...../.##../.##../.....',
    '(': '...#./..#../.#.../.#.../.#.../..#../...#.', ')': '.#.../..#../...#./...#./...#./..#../.#...',
  };
  const F35 = {
    A: '.#./#.#/###/#.#/#.#', B: '##./#.#/##./#.#/##.', C: '.##/#../#../#../.##', D: '##./#.#/#.#/#.#/##.',
    E: '###/#../##./#../###', F: '###/#../##./#../#..', G: '.##/#../#.#/#.#/.##', H: '#.#/#.#/###/#.#/#.#',
    I: '###/.#./.#./.#./###', J: '..#/..#/..#/#.#/.#.', K: '#.#/#.#/##./#.#/#.#', L: '#../#../#../#../###',
    M: '#.#/###/###/#.#/#.#', N: '##./#.#/#.#/#.#/#.#', O: '.#./#.#/#.#/#.#/.#.', P: '##./#.#/##./#../#..',
    Q: '.#./#.#/#.#/##./.##', R: '##./#.#/##./#.#/#.#', S: '.##/#../.#./..#/##.', T: '###/.#./.#./.#./.#.',
    U: '#.#/#.#/#.#/#.#/###', V: '#.#/#.#/#.#/#.#/.#.', W: '#.#/#.#/###/###/#.#', X: '#.#/#.#/.#./#.#/#.#',
    Y: '#.#/#.#/.#./.#./.#.', Z: '###/..#/.#./#../###',
    0: '###/#.#/#.#/#.#/###', 1: '.#./##./.#./.#./###', 2: '##./..#/.#./#../###', 3: '##./..#/.#./..#/##.',
    4: '#.#/#.#/###/..#/..#', 5: '###/#../##./..#/##.', 6: '.##/#../###/#.#/###', 7: '###/..#/.#./.#./.#.',
    8: '###/#.#/###/#.#/###', 9: '###/#.#/###/..#/##.', '-': '.../.../###/.../...', '.': '.../.../.../.../.#.',
    '+': '.../.#./###/.#./...',
  };

  /* Cells of a line of LCD text: { cells: Set('col,row'), w, h } (w and h in cells). */
  function textCells(str, font, bold) {
    const gw = font === F57 ? 5 : 3, gh = font === F57 ? 7 : 5;
    const adv = gw + (bold ? 1 : 0) + 1;
    const cells = new Set();
    [...String(str).toUpperCase()].forEach((ch, i) => {
      const g = font[ch];
      if (!g) return;
      g.split('/').forEach((row, r) => {
        for (let c = 0; c < row.length; c++) {
          if (row[c] !== '#') continue;
          cells.add(i * adv + c + ',' + r);
          if (bold) cells.add(i * adv + c + 1 + ',' + r);
        }
      });
    });
    return { cells, w: Math.max(0, String(str).length * adv - 1), h: gh };
  }

  /* SVG path of LCD cells: separate dots (realistic) or merged runs (crisp). */
  function cellsPath(cells, x, y, cs, dots) {
    let d = '';
    if (dots) {
      const s = n2(cs * 0.84), o = cs * 0.08;
      cells.forEach((k) => {
        const [c, r] = k.split(',').map(Number);
        d += `M${n2(x + c * cs + o)},${n2(y + r * cs + o)}h${s}v${s}h${-s}z`;
      });
      return d;
    }
    const rows = {};
    cells.forEach((k) => { const [c, r] = k.split(',').map(Number); (rows[r] = rows[r] || []).push(c); });
    Object.keys(rows).forEach((rk) => {
      const r = Number(rk), cols = rows[rk].sort((a, b) => a - b);
      const run = (a, b) => { const w = n2((b - a + 1) * cs); d += `M${n2(x + a * cs)},${n2(y + r * cs)}h${w}v${n2(cs)}h${-w}z`; };
      let start = cols[0], prev = cols[0];
      for (let i = 1; i < cols.length; i++) {
        if (cols[i] === prev + 1) prev = cols[i];
        else { run(start, prev); start = prev = cols[i]; }
      }
      run(start, prev);
    });
    return d;
  }

  /* ---------- display contents ---------- */
  function lcdCard(lines, ink, dots, sw) {
    let s = `<rect x="147" y="72" width="126" height="109" rx="5" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
    s += `<circle cx="210" cy="80" r="2.3" fill="${ink}"/>`;
    [177, 199, 221, 243].forEach((x) => {
      s += `<circle cx="${x}" cy="94" r="7.4" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
      s += `<path d="M${x},94 l-3.4,-4.6" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
    });
    s += `<path d="M147,113 H188 L201,124 L273,109" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    const L = (lines && lines.length ? lines : [' ']).slice(0, 3).map((t) => String(t).toUpperCase().slice(0, 12));
    const n = L.length, maxLen = Math.max(1, ...L.map((t) => t.length));
    const cs = Math.min(1.9, 116 / (maxLen * 7 - 1), 49 / (n * 7 + (n - 1) * 2.4));
    let y = 128 + (49 - (n * 7 + (n - 1) * 2.4) * cs) / 2;
    L.forEach((t) => {
      const tc = textCells(t, F57, true);
      s += `<path d="${cellsPath(tc.cells, 210 - (tc.w * cs) / 2, y, cs, dots)}" fill="${ink}"/>`;
      y += 9.4 * cs;
    });
    return s;
  }

  function lcdAmp(lines, ink, dots, sw, uid) {
    let s = `<rect x="147" y="71" width="126" height="53" rx="4" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
    const name = String((lines && lines[0]) || ' ').toUpperCase().slice(0, 10);
    const tc = textCells(name, F57, true), cs = Math.min(1.75, 112 / Math.max(1, tc.w));
    s += `<path d="${cellsPath(tc.cells, 210 - (tc.w * cs) / 2, 77 + (14 - 7 * cs) / 2, cs, dots)}" fill="${ink}"/>`;
    [183, 201, 219, 237].forEach((x) => { s += `<circle cx="${x}" cy="111" r="4.6" fill="none" stroke="${ink}" stroke-width="${sw * 0.85}"/>`; });
    s += `<rect x="147" y="129" width="126" height="53" rx="3" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
    [179, 241].forEach((x) => {
      s += `<circle cx="${x}" cy="155.5" r="21.5" fill="url(#${uid}-grille)" stroke="${ink}" stroke-width="${sw}"/>`;
      s += `<circle cx="${x}" cy="155.5" r="6.5" fill="${ink}"/>`;
    });
    return s;
  }

  function lcdLooper(ink, dots, sw) {
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let d = '';
    for (let i = 0, x = 140; x < 279; i++, x += 2.4) {
      const env = 0.35 + 0.65 * Math.abs(Math.sin(i / 7.5) * Math.cos(i / 19 + 0.6));
      const h = Math.max(1.4, 30 * env * (0.5 + 0.5 * rnd()));
      d += `M${n2(x)},${n2(104 - h)}h${dots ? 1.9 : 2.4}v${n2(2 * h)}h${dots ? -1.9 : -2.4}z`;
    }
    let s = `<path d="${d}" fill="${ink}"/>`;
    s += `<path d="M139,145 H281" stroke="${ink}" stroke-width="${sw * 0.75}"/>`;
    const heads = ['TIME', 'START', 'STOP', 'LOOPVOL'], vals = ['FREE', 'QUICK', 'QUICK', '100'];
    heads.forEach((t, i) => {
      const tc = textCells(t, F35, false), cs = 1.15;
      s += `<path d="${cellsPath(tc.cells, 157.5 + 35 * i - (tc.w * cs) / 2, 150, cs, dots)}" fill="${ink}"/>`;
    });
    vals.forEach((t, i) => {
      const tc = textCells(t, F35, false), cs = 1.4;
      s += `<path d="${cellsPath(tc.cells, 157.5 + 35 * i - (tc.w * cs) / 2, 162, cs, dots)}" fill="${ink}"/>`;
    });
    return s;
  }

  /* ---------- labels: words, arrows and the headphone sign ---------- */
  /* Tokens separated by spaces: '<' left arrow, '<H' arrow and headphones,
     '>' small right triangle, '-' a dash, anything else is text. */
  function labelLine(str, cx, y, fs, paint) {
    const tokens = String(str).split(' ');
    const gap = fs * 0.32;
    const widthOf = (t) => {
      if (t === '<') return fs * 0.78;
      if (t === '<H') return fs * 1.95;
      if (t === '>') return fs * 0.5;
      if (t === '-') return fs * 0.85;
      return t.length * fs * 0.69;
    };
    const total = tokens.reduce((a, t) => a + widthOf(t), 0) + gap * (tokens.length - 1);
    let x = cx - total / 2, s = '';
    const mid = y - fs * 0.36;
    const arrowL = (ax) => `<path d="M${n2(ax)},${n2(mid)} l${n2(fs * 0.78)},${n2(-fs * 0.42)} v${n2(fs * 0.84)} z" ${paint.fill}/>`;
    tokens.forEach((t) => {
      const w = widthOf(t);
      if (t === '<') s += arrowL(x);
      else if (t === '<H') {
        s += arrowL(x);
        const hx = x + fs * 1.0, r = fs * 0.42;
        s += `<path d="M${n2(hx)},${n2(mid + r * 0.9)} v${n2(-r * 0.7)} a${n2(r)},${n2(r)} 0 0 1 ${n2(2 * r)},0 v${n2(r * 0.7)}" ${paint.stroke(n2(fs * 0.13))}/>`;
        s += `<rect x="${n2(hx - fs * 0.06)}" y="${n2(mid + r * 0.1)}" width="${n2(fs * 0.22)}" height="${n2(fs * 0.42)}" rx="0.6" ${paint.fill}/>`;
        s += `<rect x="${n2(hx + 2 * r - fs * 0.16)}" y="${n2(mid + r * 0.1)}" width="${n2(fs * 0.22)}" height="${n2(fs * 0.42)}" rx="0.6" ${paint.fill}/>`;
      } else if (t === '>') s += `<path d="M${n2(x)},${n2(mid - fs * 0.27)} l${n2(fs * 0.46)},${n2(fs * 0.27)} l${n2(-fs * 0.46)},${n2(fs * 0.27)} z" ${paint.fill}/>`;
      else if (t === '-') s += `<rect x="${n2(x)}" y="${n2(mid - fs * 0.08)}" width="${n2(w)}" height="${n2(fs * 0.16)}" ${paint.fill}/>`;
      else s += `<text x="${n2(x)}" y="${n2(y)}" font-family="${FONT}" font-weight="900" font-size="${fs}" textLength="${n2(w)}" lengthAdjust="spacingAndGlyphs" ${paint.fill}>${esc(t)}</text>`;
      x += w + gap;
    });
    return s;
  }

  /* Pad legends: text and icons of the four rubber pads. */
  function padLegends(kind, paint) {
    const F = paint.fill, S = paint.stroke;
    const T = (t, cx, y, fs, w) => `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${fs}" textLength="${w}" lengthAdjust="spacingAndGlyphs" ${F}>${t}</text>`;
    const a = 139, b = 281;
    if (kind === MEMORY_PADS) {
      return [
        T('MEMORY', a, 347, 14, 80) + `<rect x="${a - 17}" y="356" width="34" height="3.6" ${F}/><path d="M${a - 18},364 H${a + 18} L${a},398 Z" ${F}/>`,
        T('MEMORY', b, 347, 14, 80) + `<path d="M${b},359 L${b + 18},393 H${b - 18} Z" ${F}/><rect x="${b - 17}" y="397" width="34" height="3.6" ${F}/>`,
        `<path d="M${a - 20},481 L${a + 12},463 V499 Z" ${F}/><rect x="${a + 16}" y="463" width="3.6" height="36" ${F}/>` + T('SCROLL', a, 530, 14, 78),
        `<path d="M${b + 20},481 L${b - 12},463 V499 Z" ${F}/><rect x="${b - 19.6}" y="463" width="3.6" height="36" ${F}/>` + T('SCROLL', b, 530, 14, 78),
      ];
    }
    const cy = 384;
    return [
      T('LOOP FX', a, 347, 14, 80) +
        `<path d="M${a + 9.6},${cy - 11.5} A15,15 0 1 1 ${a - 9.6},${cy - 11.5}" ${S(3.6)}/>` +
        `<path d="M${a - 16},${cy - 17} L${a - 4},${cy - 15} L${a - 11},${cy - 5} Z" ${F}/>` +
        `<path d="M${a - 4},${cy - 7} V${cy + 7} L${a + 7},${cy} Z" ${F}/>`,
      T('RHYTHM', b, 347, 14, 80) +
        `<ellipse cx="${b}" cy="${cy - 4}" rx="15" ry="5" ${S(3)}/>` +
        `<path d="M${b - 15},${cy - 4} V${cy + 12} A15,5 0 0 0 ${b + 15},${cy + 12} V${cy - 4}" ${S(3)}/>` +
        `<path d="M${b - 15},${cy} L${b - 7.5},${cy + 13} L${b},${cy + 1} L${b + 7.5},${cy + 13} L${b + 15},${cy}" ${S(2.4)}/>` +
        `<path d="M${b - 13},${cy - 21} L${b - 3},${cy - 9} M${b + 13},${cy - 21} L${b + 3},${cy - 9}" ${S(3)}/>`,
      `<path d="M${a + 15},492 V478 Q${a + 15},469 ${a + 6},469 H${a - 6}" ${S(4.4)}/><path d="M${a - 18},469 L${a - 6},459 V479 Z" ${F}/>` + T('UNDO', a, 530, 14, 58),
      `<rect x="${b - 8}" y="458" width="16" height="16" ${F}/>` + T('STOP', b, 502, 14, 54) + labelLine('HOLD > CLEAR', b, 524, 8, paint),
    ];
  }

  /* Paint helpers: solid fill or outline in currentColor. */
  const solid = (col) => ({ fill: `fill="${col}"`, stroke: (w) => `fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"` });
  const outline = (w0) => ({ fill: `fill="none" stroke="currentColor" stroke-width="${w0}"`, stroke: (w) => `fill="none" stroke="currentColor" stroke-width="${n2(Math.max(0.7, w * 0.35))}"` });

  /* ---------- the SVG ---------- */
  let counter = 0;

  function render(id, options) {
    const o = Object.assign({ style: 'real', cables: false, jacks: true, display: null, for3d: false, title: null }, options);
    const p = PEDALS[id];
    if (!p) throw new Error('Unknown pedal: ' + id);
    const real = o.style === 'real', flat = o.style === 'flat', line = o.style === 'line';
    const uid = 'pm' + (++counter);
    const disp = Object.assign({}, p.display, o.display || {});
    const body = p.body;
    const bodyPath = o.for3d ? BODY_3D : BODY;
    const defs = [], out = [];
    const LW = 1.4; // line width of the line drawing

    defs.push(`<clipPath id="${uid}-clip"><path d="${bodyPath}"/></clipPath>`);

    if (real) {
      defs.push(
        `<linearGradient id="${uid}-bv" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="556">` +
          `<stop offset="0" stop-color="${light(body, 0.2)}"/><stop offset=".05" stop-color="${light(body, 0.07)}"/>` +
          `<stop offset=".5" stop-color="${body}"/><stop offset=".9" stop-color="${dark(body, 0.07)}"/><stop offset="1" stop-color="${dark(body, 0.2)}"/></linearGradient>`,
        `<linearGradient id="${uid}-bh" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="360" y2="0">` +
          `<stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset=".035" stop-color="#000" stop-opacity=".06"/>` +
          `<stop offset=".07" stop-color="#fff" stop-opacity=".06"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>` +
          `<stop offset=".93" stop-color="#000" stop-opacity=".04"/><stop offset=".965" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>`,
        `<linearGradient id="${uid}-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d6167"/><stop offset=".3" stop-color="#eef0f2"/><stop offset=".55" stop-color="#9da2a8"/><stop offset=".8" stop-color="#d7dadd"/><stop offset="1" stop-color="#3f4246"/></linearGradient>`,
        `<linearGradient id="${uid}-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e4f12"/><stop offset=".35" stop-color="#f4d77e"/><stop offset=".6" stop-color="#b8892c"/><stop offset="1" stop-color="#5a400c"/></linearGradient>`,
        `<linearGradient id="${uid}-cable" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1a1a"/><stop offset=".35" stop-color="#4a4a4a"/><stop offset=".6" stop-color="#151515"/><stop offset="1" stop-color="#050505"/></linearGradient>`,
        `<linearGradient id="${uid}-frame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#303033"/><stop offset=".12" stop-color="#19191b"/><stop offset="1" stop-color="#0a0a0b"/></linearGradient>`,
        `<radialGradient id="${uid}-lcd" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="${light(p.lcd, 0.1)}"/><stop offset=".6" stop-color="${p.lcd}"/><stop offset="1" stop-color="${dark(p.lcd, 0.22)}"/></radialGradient>`,
        `<linearGradient id="${uid}-lcdshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".07" stop-color="#000" stop-opacity=".08"/><stop offset=".2" stop-color="#000" stop-opacity="0"/><stop offset=".95" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient>`,
        `<linearGradient id="${uid}-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
        `<radialGradient id="${uid}-skirt" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#4b4b4e"/><stop offset=".55" stop-color="#1b1b1c"/><stop offset="1" stop-color="#050505"/></radialGradient>`,
        `<radialGradient id="${uid}-cap" cx=".35" cy=".28" r=".8"><stop offset="0" stop-color="#5a5a5e"/><stop offset=".45" stop-color="#232325"/><stop offset="1" stop-color="#0b0b0c"/></radialGradient>`,
        `<radialGradient id="${uid}-capgold" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="#fff3c8"/><stop offset=".3" stop-color="#e8c66a"/><stop offset=".75" stop-color="#a8802a"/><stop offset="1" stop-color="#5e430e"/></radialGradient>`,
        `<radialGradient id="${uid}-kshadow" cx=".5" cy=".5" r=".5"><stop offset=".6" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`,
        `<linearGradient id="${uid}-padedge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58585c"/><stop offset=".5" stop-color="#36363a"/><stop offset="1" stop-color="#1c1c1e"/></linearGradient>`,
        `<linearGradient id="${uid}-padtop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#424246"/><stop offset="1" stop-color="#2f2f32"/></linearGradient>`,
        `<filter id="${uid}-grain" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.6 1.15"/></filter>`,
        `<radialGradient id="${uid}-bezel" cx=".5" cy=".5" r=".5"><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#fff" stop-opacity=".22"/><stop offset=".94" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>`,
        `<radialGradient id="${uid}-ring" cx=".5" cy=".5" r=".5" fx=".42" fy=".3"><stop offset=".5" stop-color="#0c1240"/><stop offset=".56" stop-color="#1c2a8a"/><stop offset=".78" stop-color="#3a50cf"/><stop offset=".93" stop-color="#2a3ba8"/><stop offset="1" stop-color="#141d66"/></radialGradient>`,
        `<radialGradient id="${uid}-chrome" cx=".42" cy=".36" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#eef0f3"/><stop offset=".72" stop-color="#b3b8bf"/><stop offset="1" stop-color="#5d6269"/></radialGradient>`,
        `<radialGradient id="${uid}-led" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffe3d6"/><stop offset=".35" stop-color="#ff5a36"/><stop offset="1" stop-color="#a51200"/></radialGradient>`,
        `<radialGradient id="${uid}-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff4a26" stop-opacity=".6"/><stop offset="1" stop-color="#ff4a26" stop-opacity="0"/></radialGradient>`,
      );
    }
    const inkLCD = line ? 'currentColor' : p.lcdInk;
    defs.push(`<pattern id="${uid}-grille" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.95" fill="${inkLCD}"/></pattern>`);

    const bodyFill = real ? `url(#${uid}-bv)` : body;
    const inkPaint = line ? outline(0.7) : solid(p.ink);

    /* ---- jacks (behind the body) ---- */
    if (o.jacks) {
      const jack = (side, y) => {
        const L = side === 'l';
        const sx = L ? 49 : 359;
        let s = '';
        if (o.cables) {
          // cable, chrome end cap, knurled chrome barrel, gold collar against the socket
          const X = (x, w) => (L ? x : 420 - x - w); // mirror for the right side
          const parts = [
            { x: -90, w: 76, h: 13, fill: real ? `url(#${uid}-cable)` : '#1b1b1b', rx: 0 },
            { x: -18, w: 10, h: 20, fill: real ? `url(#${uid}-metal)` : '#c3c7cc', rx: 4 },
            { x: -10, w: 53, h: 25, fill: real ? `url(#${uid}-metal)` : '#cfd3d7', rx: 3 },
            { x: 43, w: 8, h: 21, fill: real ? `url(#${uid}-gold)` : '#d6b04f', rx: 1 },
          ];
          parts.forEach((q) => {
            if (line) s += `<rect x="${X(q.x, q.w)}" y="${n2(y - q.h / 2)}" width="${q.w}" height="${q.h}" rx="${q.rx}" fill="none" stroke="currentColor" stroke-width="${LW}"/>`;
            else s += `<rect x="${X(q.x, q.w)}" y="${n2(y - q.h / 2)}" width="${q.w}" height="${q.h}" rx="${q.rx}" fill="${q.fill}"${q.rx ? ` stroke="${real ? '#34373b' : '#8b9096'}" stroke-width=".6"` : ''}/>`;
          });
          if (real) {
            let k = '';
            for (let x = -3; x < 31; x += 2.4) k += `M${n2(L ? x : 420 - x)},${y - 11.5}v23`;
            s += `<path d="${k}" stroke="#000" stroke-opacity=".22" stroke-width=".9"/>`;
          }
        }
        if (line) s += `<rect x="${sx}" y="${y - 12}" width="12" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="${LW}"/>`;
        else s += `<rect x="${sx}" y="${y - 12}" width="12" height="24" rx="2.5" fill="${real ? `url(#${uid}-metal)` : '#b9bec4'}" stroke="${real ? '#2e3034' : '#7d8288'}" stroke-width=".6"/>`;
        return s;
      };
      p.left.forEach((j) => out.push(jack('l', j.y)));
      p.right.forEach((j) => out.push(jack('r', j.y)));
    }

    /* ---- body ---- */
    if (line) {
      out.push(`<path d="${bodyPath}" fill="${body}" fill-opacity=".08" stroke="currentColor" stroke-width="${LW * 1.3}"/>`);
    } else {
      out.push(`<path d="${bodyPath}" fill="${bodyFill}"/>`);
      if (real) {
        out.push(`<path d="${bodyPath}" fill="url(#${uid}-bh)"/>`);
        out.push(`<g clip-path="url(#${uid}-clip)"><rect x="60" y="545" width="300" height="12" fill="#000" opacity=".2"/><rect x="60" y="20" width="300" height="4" fill="#fff" opacity=".18"/></g>`);
        if (!o.for3d) out.push(`<path d="M60,50 L78,24 M360,50 L342,24" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>`);
        out.push(`<path d="${bodyPath}" fill="none" stroke="${dark(body, 0.45)}" stroke-width="1"/>`);
      } else {
        out.push(`<g clip-path="url(#${uid}-clip)"><rect x="60" y="20" width="8" height="536" fill="${dark(body, 0.12)}"/><rect x="352" y="20" width="8" height="536" fill="${dark(body, 0.12)}"/><rect x="60" y="20" width="300" height="14" fill="${light(body, 0.14)}"/><rect x="60" y="547" width="300" height="9" fill="${dark(body, 0.22)}"/></g>`);
        out.push(`<path d="${bodyPath}" fill="none" stroke="${dark(body, 0.35)}" stroke-width="1"/>`);
      }
    }

    /* ---- ZOOM logo: hollow letters (thick ink stroke, thinner body stroke on top) ---- */
    {
      const d = 'M148,34.5 H172 L149,48.5 H173 ' +
        'M185.5,34.5 H199.5 A7,7 0 0 1 199.5,48.5 H185.5 A7,7 0 0 1 185.5,34.5 Z ' +
        'M219.5,34.5 H233.5 A7,7 0 0 1 233.5,48.5 H219.5 A7,7 0 0 1 219.5,34.5 Z ' +
        'M246,48.5 V39.5 Q246,34.5 251,34.5 H267 Q272,34.5 272,39.5 V48.5 M259,34.5 V48.5';
      if (line) out.push(`<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`);
      else {
        out.push(`<path d="${d}" fill="none" stroke="${p.ink}" stroke-width="5.4" stroke-linejoin="round"/>`);
        out.push(`<path d="${d}" fill="none" stroke="${bodyFill}" stroke-width="2.2" stroke-linejoin="round"/>`);
      }
    }

    /* ---- jack labels ---- */
    const labelBlock = (j, cx) => j.lines.map((t, i) => labelLine(t, cx, j.y + 4 + i * 16, 10.5, inkPaint)).join('');
    p.left.forEach((j) => out.push(labelBlock(j, 95)));
    p.right.forEach((j) => out.push(labelBlock(j, 325)));

    /* ---- display ---- */
    {
      const F = FRAME, L = LCD;
      if (line) {
        out.push(`<rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" rx="7" fill="none" stroke="currentColor" stroke-width="${LW}"/>`);
        out.push(`<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="3" fill="none" stroke="currentColor" stroke-width="${LW * 0.8}"/>`);
      } else if (flat) {
        out.push(`<rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" rx="7" fill="#161618"/>`);
        out.push(`<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="3" fill="${p.lcd}"/>`);
      } else {
        out.push(`<rect x="${F.x - 1.5}" y="${F.y - 1.5}" width="${F.w + 3}" height="${F.h + 3}" rx="8.5" fill="${light(body, 0.25)}" opacity=".45"/>`);
        out.push(`<rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" rx="7" fill="url(#${uid}-frame)"/>`);
        out.push(`<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="3" fill="url(#${uid}-lcd)"/>`);
      }
      const sw = 2.2;
      let content;
      if (disp.type === 'amp') content = lcdAmp(disp.lines, inkLCD, real, sw, uid);
      else if (disp.type === 'looper') content = lcdLooper(inkLCD, real, sw);
      else content = lcdCard(disp.lines, inkLCD, real, sw);
      out.push(`<g${real ? ' opacity=".9"' : ''}>${content}</g>`);
      if (real) {
        out.push(`<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="3" fill="url(#${uid}-lcdshade)"/>`);
        out.push(`<path d="M${L.x + 3},${L.y} H${L.x + 92} L${L.x + 30},${L.y + L.h} H${L.x + 3} Q${L.x},${L.y + L.h} ${L.x},${L.y + L.h - 3} V${L.y + 3} Q${L.x},${L.y} ${L.x + 3},${L.y} Z" fill="url(#${uid}-glass)"/>`);
      }
    }

    /* ---- MULTISTOMP and model name ---- */
    {
      const paint = line ? `fill="none" stroke="currentColor" stroke-width="0.8"` : `fill="${p.ink}"`;
      out.push(`<text x="86" y="229" font-family="${FONT}" font-weight="900" font-size="12" textLength="126" lengthAdjust="spacingAndGlyphs" ${paint}><tspan font-size="16.5">M</tspan>ULTI<tspan font-size="16.5">S</tspan>TOMP</text>`);
      out.push(`<rect x="88" y="231.5" width="58" height="2.2" ${paint}/>`);
      const nl = p.name.length * 10.6;
      out.push(`<text x="${n2(336 - nl)}" y="229" font-family="${FONT}" font-weight="900" font-size="16" textLength="${n2(nl)}" lengthAdjust="spacingAndGlyphs" ${paint}>${esc(p.name)}</text>`);
    }

    /* ---- knobs ---- */
    if (!o.noKnobs) {
      KNOB_X.forEach((x) => {
        const y = KNOB_Y, gold = p.knob === 'gold';
        if (line) {
          out.push(`<circle cx="${x}" cy="${y}" r="${KNOB_R}" fill="none" stroke="currentColor" stroke-width="${LW}"/>`);
          out.push(`<circle cx="${x}" cy="${y}" r="${KNOB_R - 2.6}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="1 1.7" opacity=".7"/>`);
          out.push(`<circle cx="${x}" cy="${y - 2.5}" r="15.5" fill="none" stroke="currentColor" stroke-width="${LW}"/>`);
        } else if (flat) {
          out.push(`<circle cx="${x}" cy="${y + 3}" r="${KNOB_R}" fill="${dark(body, 0.4)}"/>`);
          out.push(`<circle cx="${x}" cy="${y}" r="${KNOB_R}" fill="#1c1c1e"/>`);
          out.push(`<circle cx="${x}" cy="${y}" r="${KNOB_R - 2.6}" fill="none" stroke="#2e2e31" stroke-width="2.6" stroke-dasharray="1.2 1.6"/>`);
          out.push(`<circle cx="${x}" cy="${y - 2.5}" r="${gold ? 17 : 15.5}" fill="${gold ? '#d8b452' : '#2d2d30'}"/>`);
          out.push(`<circle cx="${x - 5}" cy="${y - 9}" r="3.4" fill="${gold ? '#f2dc96' : '#47474b'}"/>`);
        } else {
          out.push(`<ellipse cx="${x + 1.5}" cy="${y + 5}" rx="${KNOB_R + 5}" ry="${KNOB_R + 4}" fill="url(#${uid}-kshadow)"/>`);
          out.push(`<circle cx="${x}" cy="${y}" r="${KNOB_R}" fill="url(#${uid}-skirt)"/>`);
          out.push(`<circle cx="${x}" cy="${y}" r="${KNOB_R - 2.2}" fill="none" stroke="#000" stroke-opacity=".75" stroke-width="3.6" stroke-dasharray="1.2 1.5"/>`);
          out.push(`<circle cx="${x}" cy="${y}" r="${KNOB_R - 0.5}" fill="none" stroke="#6a6a6e" stroke-opacity=".35" stroke-width="1" stroke-dasharray="1.2 1.5"/>`);
          out.push(`<circle cx="${x}" cy="${y - 2.5}" r="${gold ? 17 : 15.5}" fill="url(#${uid}-${gold ? 'capgold' : 'cap'})" stroke="${gold ? '#3b2a06' : '#000'}" stroke-width=".7"/>`);
          out.push(`<ellipse cx="${x - 5}" cy="${y - 10}" rx="5.5" ry="2.8" fill="#fff" opacity="${gold ? 0.45 : 0.16}"/>`);
        }
      });
    }

    /* ---- label strip under the knobs ---- */
    {
      const paintText = line ? `fill="currentColor"` : `fill="${p.stripText}"`;
      if (line) out.push(`<rect x="81" y="301" width="268" height="12.5" rx="2" fill="none" stroke="currentColor" stroke-width="${LW * 0.8}"/>`);
      else out.push(`<rect x="81" y="301" width="268" height="12.5" rx="2" fill="${p.strip}"/>`);
      out.push(`<text x="70.5" y="310.3" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="6.2" textLength="17" lengthAdjust="spacingAndGlyphs" fill="${line ? 'currentColor' : p.ink}">PUSH</text>`);
      p.knobs.forEach((t, i) => {
        const w = Math.min(52, t.length * 6.1);
        out.push(`<text x="${KNOB_X[i]}" y="310.6" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="8.6" textLength="${n2(w)}" lengthAdjust="spacingAndGlyphs" ${paintText}>${esc(t)}</text>`);
      });
    }

    /* ---- LED ---- */
    if (line) out.push(`<circle cx="${LED.x}" cy="${LED.y}" r="4" fill="none" stroke="currentColor" stroke-width="${LW}"/>`);
    else if (flat) out.push(`<circle cx="${LED.x}" cy="${LED.y}" r="5.4" fill="${dark(body, 0.35)}"/><circle cx="${LED.x}" cy="${LED.y}" r="4" fill="#ff3b28"/><circle cx="${LED.x - 1.2}" cy="${LED.y - 1.3}" r="1.3" fill="#ffc2b4"/>`);
    else out.push(`<circle cx="${LED.x}" cy="${LED.y}" r="12" fill="url(#${uid}-glow)"/><circle cx="${LED.x}" cy="${LED.y}" r="4.4" fill="url(#${uid}-led)" stroke="#4d0800" stroke-width=".6"/>`);

    /* ---- rubber pads ---- */
    {
      const legendsLine = line ? padLegends(p.pads, outline(0.8)) : null;
      const legendsFlat = flat ? padLegends(p.pads, solid('#232325')) : null;
      const legendsReal = real ? padLegends(p.pads, solid('#000')) : null;
      PADS.forEach((r, i) => {
        if (line) {
          out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="10" fill="none" stroke="currentColor" stroke-width="${LW}"/>`);
          out.push(`<rect x="${r.x + 4}" y="${r.y + 4}" width="${r.w - 8}" height="${r.h - 8}" rx="7" fill="none" stroke="currentColor" stroke-width="${LW * 0.5}" opacity=".6"/>`);
          out.push(legendsLine[i]);
        } else if (flat) {
          out.push(`<rect x="${r.x}" y="${r.y + 3}" width="${r.w}" height="${r.h}" rx="10" fill="${dark(body, 0.4)}"/>`);
          out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="10" fill="#4a4a4e"/>`);
          out.push(`<rect x="${r.x + 3.5}" y="${r.y + 3.5}" width="${r.w - 7}" height="${r.h - 7}" rx="7.5" fill="#38383b"/>`);
          out.push(legendsFlat[i]);
        } else {
          out.push(`<rect x="${r.x - 1}" y="${r.y + 2.5}" width="${r.w + 2}" height="${r.h + 1}" rx="11" fill="#000" opacity=".42"/>`);
          out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="10" fill="url(#${uid}-padedge)"/>`);
          out.push(`<rect x="${r.x + 3.2}" y="${r.y + 3}" width="${r.w - 6.4}" height="${r.h - 6.6}" rx="7.5" fill="url(#${uid}-padtop)"/>`);
          out.push(`<rect x="${r.x + 3.2}" y="${r.y + 3}" width="${r.w - 6.4}" height="${r.h - 6.6}" rx="7.5" filter="url(#${uid}-grain)" opacity=".12"/>`);
          // raised legends: light rim on top, dark face
          const L = legendsReal[i];
          out.push(`<g transform="translate(-0.5,-0.9)" opacity=".6">${L.replace(/#000/g, '#8c8c92')}</g>`);
          out.push(`<g>${L.replace(/#000/g, '#202023')}</g>`);
        }
      });
    }

    /* ---- footswitch ---- */
    if (!o.noSwitch) {
      const { x, y } = SW;
      if (line) {
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.bezel}" fill="none" stroke="currentColor" stroke-width="${LW * 0.8}" stroke-dasharray="3 2.5" opacity=".7"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.ring}" fill="none" stroke="currentColor" stroke-width="${LW}"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.hole}" fill="none" stroke="currentColor" stroke-width="${LW}"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.cap}" fill="none" stroke="currentColor" stroke-width="${LW}"/>`);
      } else if (flat) {
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.bezel}" fill="${body}" stroke="${dark(body, 0.3)}" stroke-width="1"/>`);
        out.push(`<circle cx="${x}" cy="${y + 2.5}" r="${SW.ring}" fill="${dark(body, 0.42)}"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.ring}" fill="#3047c0"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.hole}" fill="#111845"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.cap}" fill="#dfe2e6"/>`);
        out.push(`<circle cx="${x - 5}" cy="${y - 6}" r="6" fill="#fff"/>`);
      } else {
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.bezel + 1.5}" fill="#000" opacity=".45"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.bezel}" fill="${bodyFill}"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.bezel}" fill="url(#${uid}-bezel)"/>`);
        out.push(`<circle cx="${x + 1}" cy="${y + 3}" r="${SW.ring + 1.5}" fill="#000" opacity=".35"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.ring}" fill="url(#${uid}-ring)"/>`);
        out.push(`<path d="M${x - 36},${y - 18} A40,40 0 0 1 ${x + 30},${y - 27}" fill="none" stroke="#9fb0ff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.hole}" fill="#080b26"/>`);
        out.push(`<circle cx="${x + 0.5}" cy="${y + 1.5}" r="${SW.cap}" fill="#000" opacity=".5"/>`);
        out.push(`<circle cx="${x}" cy="${y}" r="${SW.cap}" fill="url(#${uid}-chrome)" stroke="#4a4f56" stroke-width=".7"/>`);
        out.push(`<ellipse cx="${x - 5}" cy="${y - 8}" rx="7.5" ry="4" fill="#fff" opacity=".8"/>`);
      }
    }
    out.push(labelLine(p.hold, 300, 437, 8.2, inkPaint));

    // with cables the drawing is wider, so a short piece of cable shows past each plug
    const vb = o.for3d ? '60 20 300 536' : o.cables && o.jacks ? '-34 6 488 564' : '0 6 420 564';
    const label = o.title != null ? o.title : `Drawing of the ZOOM MultiStomp ${p.name}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${esc(label)}"><defs>${defs.join('')}</defs>${out.join('')}</svg>`;
  }

  /* ---------- 3D: the realistic top face on a box with a sloped top ---------- */
  function mount3d(host, id, options) {
    const o = Object.assign({ width: 260, display: null, interactive: true }, options);
    const p = PEDALS[id];
    const k = o.width / 300;
    const W = 300 * k, D = 536 * k;
    const Tf = 0.3 * W, rise = 0.36 * W; // height at the front, extra height at the back
    const alpha = Math.atan(rise / D), sa = Math.sin(alpha), ca = Math.cos(alpha);
    const Tb = D * sa + Tf;
    const el = (cls, css) => { const d = document.createElement('div'); d.className = cls; if (css) d.style.cssText = css; return d; };

    host.innerHTML = '';
    host.classList.add('pm3d');
    const obj = el('pm3d-obj', `width:${n2(W)}px;height:${n2(D)}px`);

    obj.appendChild(el('pm3d-shadow', `transform:translateZ(${n2(-Tf - 1)}px)`));

    // sides: trapezoids in the y-z plane
    const clip = `polygon(0px ${n2(D - D * ca)}px, ${n2(D * sa)}px ${n2(D)}px, ${n2(Tb)}px ${n2(D)}px, ${n2(Tb)}px ${n2(D - D * ca)}px)`;
    ['l', 'r'].forEach((side) => {
      const s = el('pm3d-side', `width:${n2(Tb)}px;height:${n2(D)}px;left:${side === 'l' ? 0 : n2(W)}px;clip-path:${clip};` +
        `transform:translateZ(${n2(D * sa)}px) rotateY(90deg);background:linear-gradient(90deg,${dark(p.body, side === 'l' ? 0.3 : 0.18)},${dark(p.body, side === 'l' ? 0.5 : 0.4)})`);
      (side === 'l' ? p.left : p.right).forEach((j) => {
        const yj = (j.y - 20) * k;
        const ys = D - (D - yj) * ca;
        const depth = yj * sa + 0.42 * (Tf + (D - yj) * sa);
        const r = 11 * k;
        s.appendChild(el('pm3d-jack', `width:${n2(2 * r)}px;height:${n2(2 * r)}px;left:${n2(depth - r)}px;top:${n2(ys - r)}px`));
      });
      obj.appendChild(s);
    });

    obj.appendChild(el('pm3d-front', `width:${n2(W)}px;height:${n2(Tf)}px;top:${n2(D)}px;background:linear-gradient(${dark(p.body, 0.1)},${dark(p.body, 0.42)})`));

    // top face, tilted about its front edge
    const top = el('pm3d-top', `transform:rotateX(${n2((-alpha * 180) / Math.PI)}deg)`);
    top.innerHTML = render(id, { style: 'real', jacks: false, for3d: true, noKnobs: true, noSwitch: true, display: o.display });
    const at = (x, y) => `left:${n2((x - 60) * k)}px;top:${n2((y - 20) * k)}px`;
    // knobs: stacked discs make a cylinder
    KNOB_X.forEach((x) => {
      const knob = el('pm3d-knob', at(x, KNOB_Y));
      const r = KNOB_R * k, h = 30 * k, layers = 10;
      for (let i = 0; i <= layers; i++) {
        const last = i === layers;
        const rr = last ? (p.knob === 'gold' ? 17 : 15.5) * k : r;
        const d = el('pm3d-disc' + (last ? (p.knob === 'gold' ? ' is-gold' : ' is-cap') : ''),
          `width:${n2(2 * rr)}px;height:${n2(2 * rr)}px;margin:${n2(-rr)}px 0 0 ${n2(-rr)}px;transform:translateZ(${n2((h * i) / layers)}px)`);
        knob.appendChild(d);
      }
      top.appendChild(knob);
    });
    // footswitch: ring flush, chrome button standing up
    const sw = el('pm3d-switch', at(SW.x, SW.y));
    const ringR = SW.ring * k, capR = SW.cap * k;
    sw.appendChild(el('pm3d-ring', `width:${n2(2 * ringR)}px;height:${n2(2 * ringR)}px;margin:${n2(-ringR)}px 0 0 ${n2(-ringR)}px;transform:translateZ(${n2(2 * k)}px)`));
    for (let i = 0; i <= 6; i++) {
      sw.appendChild(el('pm3d-disc ' + (i === 6 ? 'is-chrome' : 'is-steel'),
        `width:${n2(2 * capR)}px;height:${n2(2 * capR)}px;margin:${n2(-capR)}px 0 0 ${n2(-capR)}px;transform:translateZ(${n2(2 * k + (14 * k * i) / 6)}px)`));
    }
    top.appendChild(sw);
    obj.appendChild(top);
    host.appendChild(obj);

    const set = (rx, rz) => { obj.style.transform = `rotateX(${n2(rx)}deg) rotateZ(${n2(rz)}deg)`; };
    set(48, -22);
    if (o.interactive) {
      host.addEventListener('pointermove', (e) => {
        const b = host.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        set(36 + py * 24, (px - 0.5) * 70);
      });
      host.addEventListener('pointerleave', () => set(48, -22));
    }
    return obj;
  }

  root.PEDALMODEL = { pedals: PEDALS, render, mount3d };
})(typeof window !== 'undefined' ? window : globalThis);
