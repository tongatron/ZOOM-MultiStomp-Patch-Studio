"""Writes the MS-80IR+ effects data and effect images from the official ZOOM Effects List.

Usage: python3 tools/ms80ir-data.py
Reads documentazione/ms-80irplus/E_MS-80IRplus_FX-list.pdf with tools/extract-effects-list.py (default layout) and writes
site/ms-80ir/effects-data.js, site/ms-80ir/firmware-data.js and site/ms-80ir/assets/effects/fx-NNN.png (204 x 256).
The USER IR page of the list has three paragraphs of explanation before the IR effect: the extractor reads them as effects
without an image, so they are dropped here (they are not effects). Text is copied as extracted, nothing is reworded.
"""
import importlib.util
import json
import os
import sys
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, 'documentazione/ms-80irplus/E_MS-80IRplus_FX-list.pdf')
OUT = os.path.join(ROOT, 'site/ms-80ir')

spec = importlib.util.spec_from_file_location('extract', os.path.join(ROOT, 'tools/extract-effects-list.py'))
extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)

CATEGORIES = {
    'AMP': ('Amp', '#f85149'),
    'STUDIO AMBIENCE': ('Studio ambience', '#7ee2b8'),
    'USER IR': ('User IR', '#a371f7'),
    'TOOL': ('Tool', '#8b949e'),
    'DELAY': ('Delay', '#58a6ff'),
}

with tempfile.TemporaryDirectory() as tmp:
    found = extract.parse(PDF, tmp)
    kept = [(n, e) for n, e in enumerate(found) if e['image']]  # the explanation paragraphs have no screen image
    effects = [e for _, e in kept]
    os.makedirs(os.path.join(OUT, 'assets/effects'), exist_ok=True)
    for new, (old, _) in enumerate(kept):
        src = Image.open(os.path.join(tmp, f'fx-{old:03d}.png')).convert('L')
        scale = min(204 / src.width, 256 / src.height)
        img = src.resize((round(src.width * scale), round(src.height * scale)), Image.LANCZOS)
        box = Image.new('L', (204, 256), 255)
        box.paste(img, ((204 - img.width) // 2, (256 - img.height) // 2))
        box.point(lambda v: 255 if v > 128 else 0).convert('1').save(os.path.join(OUT, f'assets/effects/fx-{new:03d}.png'), optimize=True)

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
    f.write('// Zoom MS-80IR+ effects catalog — original text from the official ZOOM Effects List (E_MS-80IRplus_FX-list.pdf).\n')
    f.write('// Written by tools/ms80ir-data.py with tools/extract-effects-list.py; descriptions and parameter text are not reworded.\n\n')
    f.write('const CATEGORIES = ' + json.dumps({k: {'label': v[0], 'color': v[1]} for k, v in CATEGORIES.items()}, indent=2) + ';\n\n')
    f.write('const EFFECTS_DATA = ' + json.dumps(rows, ensure_ascii=False, indent=2) + ';\n')

with open(os.path.join(OUT, 'firmware-data.js'), 'w') as f:
    f.write('// MS-80IR+ firmware data per effect, aligned with EFFECTS_DATA. The effect IDs and DSP loads of the MS-80IR+ are not\n')
    f.write('// known yet (docs/piano-multistomp.md): every entry is empty until they are read from the firmware or a Handy Guitar\n')
    f.write('// Lab export. Format: [DSP %, display name, effect ID, ZD2 file, version]\n\n')
    f.write('const DSP_SCALE = 0.925;\n\n')
    f.write('const FIRMWARE_DATA = ' + json.dumps([[None, '', None, None, None] for _ in effects]) + ';\n')

print(f'{len(effects)} effects written to {os.path.relpath(OUT, ROOT)}')
