"""Extract effects and parameters from an official ZOOM Effects List PDF (MS-Plus layout) as JSON.

Usage: python3 tools/extract-effects-list.py documentazione/ms-50gplus/E_MS-50Gplus_EffectsList.pdf > out.json
       add --images DIR to also render each effect screen as DIR/fx-NNN.png

Text is copied word by word from the PDF (no rewording); only line breaks are joined.
Layout (points): category title 17 pt; effect name 9.8 pt at x < 130, effect description 9.8 pt at x >= 130;
parameter rows 7 pt: name x < 175, description 175 – 470, range x >= 470. ★ marks Handy Guitar Lab additional effects.
"""
import json
import re
import sys

import pdfplumber

SYNC = '♪'


def lines_of(words, tol=2.5):
    rows = []
    for w in sorted(words, key=lambda w: (w['top'], w['x0'])):
        if rows and abs(rows[-1][0]['top'] - w['top']) <= tol:
            rows[-1].append(w)
        else:
            rows.append([w])
    return [sorted(r, key=lambda w: w['x0']) for r in rows]


def join(words):
    return ' '.join(w['text'] for r in lines_of(words) for w in r).strip()


def fix_range(text):
    """Writes every range separator as ' – ' (the PDF mixes '0 - 100', '2–8' and '0 –10'); minus signs stay.
    A trailing comma is where the PDF shows the metronome icon: written as ♩ like the MS-60B+ data.
    "1 – 599, 600 – 4000" is one continuous range shown in two steps: written as "1 – 4000"."""
    t = re.sub(r'(,?\s*♪)+$', '', text.strip())  # tempo sync icons after a time range
    t = re.sub(r'\s+–\s*|\s*–\s+|(?<=\d)–(?=\d)|\s+-\s+', ' – ', t)
    t = re.sub(r'\s*,\s*', ', ', re.sub(r'\s+', ' ', t)).strip()
    t = re.sub(r'^(LATCH|NORMAL) (UNLATCH|VIBRATO)$', r'\1, \2', t)
    t = re.sub(r'^(\d+) – 599, 600 – (\d+)', r'\1 – \2', t)
    return t[:-1] + ', ♩' if t.endswith(',') else t


def parse(path, image_dir=None):
    effects, category = [], None
    pdf = pdfplumber.open(path)
    for pno, page in enumerate(pdf.pages):
        words = [w for w in page.extract_words(extra_attrs=['size', 'fontname'], keep_blank_chars=False)
                 if 0 <= w['x0'] < page.width and w['top'] < 780]
        titles = [w for w in words if w['size'] > 15]
        if titles:
            category = join(titles)
        if pno < 2 or not titles:
            continue
        heads = [w for w in words if 9 < w['size'] < 11 and w['text'] != '★']
        small = [w for w in words if w['size'] < 8 or w['text'] in ('★', SYNC)]
        stars = [w for w in words if w['text'] == '★']
        # Effect blocks: consecutive 9.8 pt name lines (x < 130) with gaps under 10 pt.
        blocks = []
        for row in lines_of(heads):
            names = [w for w in row if w['x0'] < 130]
            desc = [w for w in row if w['x0'] >= 130]
            top = row[0]['top']
            if blocks and top - blocks[-1]['bottom'] < 10:
                b = blocks[-1]
            else:
                b = {'name': [], 'desc': [], 'top': top}
                blocks.append(b)
            b['name'] += names
            b['desc'] += desc
            b['bottom'] = max(w['bottom'] for w in row)
        imgs = sorted(page.images, key=lambda i: i['top'])
        for i, b in enumerate(blocks):
            end = blocks[i + 1]['top'] if i + 1 < len(blocks) else 780
            body = [w for w in small if b['top'] - 4 <= w['top'] < end - 4]
            star = any(b['top'] - 4 <= w['top'] < end - 4 for w in stars)
            body = [w for w in body if w['text'] != '★']
            anchors = [w for w in body if w['x0'] < 175 and w['fontname'].endswith('Medium') and w['top'] > b['bottom'] - 2]
            anchor_rows = [r for r in lines_of(anchors)]
            params = [{'top': sum(w['top'] for w in r) / len(r), 'name': r, 'desc': [], 'range': []} for r in anchor_rows]
            sync = False
            sync = any(w['text'] == SYNC for w in body)
            for w in body:
                if w in anchors or w['text'] == SYNC or w['x0'] >= 470 or not params:
                    continue
                p = min(params, key=lambda p: abs(p['top'] - w['top']))
                if abs(p['top'] - w['top']) <= 12:  # skips tables printed under the parameters
                    p['desc'].append(w)
            # Range lines: a line right under one ending in "," continues the same parameter.
            prev = None
            for row in lines_of([w for w in body if w['x0'] >= 470]):
                if not params:
                    break
                top = sum(w['top'] for w in row) / len(row)
                cont = prev and prev[1][-1]['text'].endswith(',') and top - prev[2] < 10.5
                p = prev[0] if cont else min(params, key=lambda p: abs(p['top'] - top))
                p['range'] += row
                prev = (p, row, top)
            img = next((im for im in imgs if b['top'] - 30 <= im['top'] < end - 10), None)
            if not b['desc']:
                continue  # page furniture such as the BPM legend
            effects.append({
                'name': join(b['name']), 'category': category, 'description': join(b['desc']),
                'handyGuitarLab': star, 'sync': sync,
                'params': [[join(p['name']), join(p['desc']), fix_range(join(p['range']))] for p in params],
                'page': pno + 1, 'image': [img['x0'], img['top'], img['x1'], img['bottom']] if img else None,
            })
    if image_dir:
        render_images(path, effects, image_dir)
    return effects


def render_images(path, effects, out):
    import pypdfium2 as pdfium
    doc = pdfium.PdfDocument(path)
    for n, fx in enumerate(effects):
        if not fx['image']:
            continue
        page = doc[fx['page'] - 1]
        x0, top, x1, bottom = fx['image']
        scale = 204 / (x1 - x0)
        h = page.get_height()
        bitmap = page.render(scale=scale, crop=(x0, h - bottom, page.get_width() - x1, top), grayscale=True)
        bitmap.to_pil().convert('L').point(lambda v: 255 if v > 128 else 0).convert('1').save(f'{out}/fx-{n:03d}.png')


if __name__ == '__main__':
    args = sys.argv[1:]
    image_dir = None
    if '--images' in args:
        image_dir = args[args.index('--images') + 1]
        args = [a for a in args if a not in ('--images', image_dir)]
    json.dump(parse(args[0], image_dir), sys.stdout, ensure_ascii=False, indent=1)
