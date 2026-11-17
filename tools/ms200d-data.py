"""Writes the MS-200D+ effects data and effect images from the official ZOOM Effects List.

Usage: python3 tools/ms200d-data.py
Reads documentazione/ms-200dplus/E_MS-200Dplus_EffectsList.pdf with tools/extract-effects-list.py (--layout 200d) and writes
site/ms-200d/effects-data.js, site/ms-200d/firmware-data.js and site/ms-200d/assets/effects/fx-NNN.png (204 x 256, like the
other pedals: the screens of the list are 203 - 204 px wide and 203 - 275 px tall, so each is fitted in that box).
Text is copied as extracted (word for word, see docs/piano-multistomp.md); nothing is reworded.
"""
import importlib.util
import json
import os
import sys
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, 'documentazione/ms-200dplus/E_MS-200Dplus_EffectsList.pdf')
OUT = os.path.join(ROOT, 'site/ms-200d')

spec = importlib.util.spec_from_file_location('extract', os.path.join(ROOT, 'tools/extract-effects-list.py'))
extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)

CATEGORIES = {
    'BOOSTER': ('Booster', '#f0883e'),
    'OVERDRIVE': ('Overdrive', '#d29922'),
    'DISTORTION': ('Distortion', '#f85149'),
    'FUZZ': ('Fuzz', '#db61a2'),
    'PREAMP': ('Preamp', '#a371f7'),
    'TOOL': ('Tool', '#8b949e'),
}

with tempfile.TemporaryDirectory() as tmp:
    effects = extract.parse_200d(PDF, tmp)
    os.makedirs(os.path.join(OUT, 'assets/effects'), exist_ok=True)
    for n in range(len(effects)):
        src = Image.open(os.path.join(tmp, f'fx-{n:03d}.png')).convert('L')
        scale = min(204 / src.width, 256 / src.height)
        img = src.resize((round(src.width * scale), round(src.height * scale)), Image.LANCZOS)
        box = Image.new('L', (204, 256), 255)
        box.paste(img, ((204 - img.width) // 2, (256 - img.height) // 2))
        box.point(lambda v: 255 if v > 128 else 0).convert('1').save(os.path.join(OUT, f'assets/effects/fx-{n:03d}.png'), optimize=True)

missing = [c for c in {e['category'] for e in effects} if c not in CATEGORIES]
if missing:
    sys.exit(f'unknown categories: {missing}')

rows = []
for e in effects:
    tags = []
    if any(p[0] == 'ON/OFF' for p in e['params']):
        tags.append('fs')
    if e['sync']:
        tags.append('sync')
    rows.append([e['name'], e['category'], None, e['description'], tags, e['params']])

with open(os.path.join(OUT, 'effects-data.js'), 'w') as f:
    f.write('// Zoom MS-200D+ effects catalog — original text from the official ZOOM Effects List (E_MS-200Dplus_EffectsList.pdf).\n')
    f.write('// Written by tools/ms200d-data.py with tools/extract-effects-list.py --layout 200d; descriptions and parameter text are\n')
    f.write('// not reworded. CHARACTER (the tone tag of each effect in the list) is kept in EFFECT_CHARACTER, aligned with EFFECTS_DATA.\n\n')
    f.write('const CATEGORIES = ' + json.dumps({k: {'label': v[0], 'color': v[1]} for k, v in CATEGORIES.items()}, indent=2) + ';\n\n')
    f.write('const EFFECTS_DATA = ' + json.dumps(rows, ensure_ascii=False, indent=2) + ';\n\n')
    f.write('const EFFECT_CHARACTER = ' + json.dumps([e['character'] or None for e in effects], ensure_ascii=False) + ';\n')

with open(os.path.join(OUT, 'firmware-data.js'), 'w') as f:
    f.write('// MS-200D+ firmware data per effect, aligned with EFFECTS_DATA. The effect IDs and DSP loads of the MS-200D+ are not\n')
    f.write('// known yet (zoom-zt2 lists 73 of the 217 effects): every entry is empty until they are read from the firmware or a\n')
    f.write('// Handy Guitar Lab export (docs/piano-multistomp.md). Format: [DSP %, display name, effect ID, ZD2 file, version]\n\n')
    f.write('const DSP_SCALE = 0.925;\n\n')
    f.write('const FIRMWARE_DATA = ' + json.dumps([[None, '', None, None, None] for _ in effects]) + ';\n')

print(f'{len(effects)} effects written to {os.path.relpath(OUT, ROOT)}')
