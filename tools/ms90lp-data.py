"""Writes the MS-90LP+ loop effects, rhythm patterns and specifications from the official ZOOM Operation Manual.

Usage: python3 tools/ms90lp-data.py
Reads documentazione/ms-90lpplus/E_MS-90LPplus_manual.html (a copy of https://zoomcorp.com/manuals/ms-90lpplus-en/, the
MS-90LP+ has no Effects List) and writes site/ms-90lp/loop-data.js: the table of the 8 LOOP FX, the table of the 68 rhythm
patterns and the first rows of the specifications, word for word. The MS-90LP+ is a looper: it has no effect chain.
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'documentazione/ms-90lpplus/E_MS-90LPplus_manual.html')
OUT = os.path.join(ROOT, 'site/ms-90lp/loop-data.js')

page = open(SRC, encoding='utf-8').read()


def cells(row):
    return [html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', c))).replace('\xa0', ' ').strip()
            for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.S)]


def table_with(first_cells):
    for t in re.findall(r'<table.*?</table>', page, re.S):
        rows = [cells(r) for r in re.findall(r'<tr.*?</tr>', t, re.S)]
        if rows and rows[0][:len(first_cells)] == first_cells:
            return rows
    raise SystemExit(f'table not found: {first_cells}')


loop_fx = [r for r in table_with(['Effect name', 'Effect'])[1:]]
assert len(loop_fx) == 8, loop_fx

rows = table_with(['No.', 'Pattern Name', 'Time Sig.'])[1:]
rhythms = []
for r in rows:
    assert len(r) in (3, 6, 9), r
    for i in range(0, len(r), 3):
        number, name, signature = r[i:i + 3]
        if not number:  # the last row of the third column is empty
            continue
        rhythms.append([int(number), name, signature])
rhythms.sort()
assert [r[0] for r in rhythms] == list(range(1, 69)), 'expected the rhythm patterns 1 - 68'

specs = [[c for c in r if c] for r in table_with(['Number of memories', '100'])[:8]]

text = html.unescape(re.sub(r'<[^>]+>', ' ', page)).replace('\xa0', ' ')
hint = re.search(r'(REVERSE, HALF SPEED, DOUBLE SPEED and HOLD can also be set to be unlatched.*?pressed\.)', text, re.S)
assert hint, 'the unlatch hint of the LOOP FX section was not found'
hint = re.sub(r'\s+', ' ', hint.group(1)).strip()

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// Zoom MS-90LP+ loop effects, rhythm patterns and specifications — original text from the official ZOOM Operation Manual\n')
    f.write('// (https://zoomcorp.com/manuals/ms-90lpplus-en/). Written by tools/ms90lp-data.py; nothing is reworded.\n\n')
    f.write('const LOOP_FX = ' + json.dumps(loop_fx, ensure_ascii=False, indent=2) + ';\n\n')
    f.write('const LOOP_FX_HINT = ' + json.dumps(hint, ensure_ascii=False) + ';\n\n')
    f.write('// [number, pattern name, time signature]\nconst RHYTHMS = ' + json.dumps(rhythms, ensure_ascii=False) + ';\n\n')
    f.write('const SPECS = ' + json.dumps(specs, ensure_ascii=False, indent=2) + ';\n')

print(f'{len(loop_fx)} loop effects, {len(rhythms)} rhythm patterns, {len(specs)} specification rows')
