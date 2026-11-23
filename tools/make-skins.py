#!/usr/bin/env python3
"""Cuts the picture sheets of the image skins into the files the app loads (skins/<id>.webp).

A sheet is one picture of 1536 x 1024 with a transparent background: three columns and two rows of 512 x 512, the
same figure in six moods, in this order: happy, cheer, oops / think, wow, sleep. The sheets of the winter line
"Frostnacht-Legenden" were made with ChatGPT from the briefing in entwurf/ (not in the repo, like the sheets).

What this script does with every sheet:
  - throws away the faint haze around the figure (alpha below 16), which shows as a grey veil on a dark page
  - cuts the same window out of every cell, so all figures keep the size they have next to each other
  - puts the six cells back into one small sheet of 3 x 2 cells of 360 px and saves it as WebP

The app shows one cell of that sheet (see bit() in index.html). 360 px is enough for the largest figure on a phone
(112 points at three pixels per point).

Blinking (optional): a second sheet per figure in <folder>/blinzeln/, the same picture with the eyes closed in the
three cells that have open eyes (happy, think, wow) and not one pixel changed anywhere else. Its file name does not
matter: the script finds the figure it belongs to by the cells that are the same. From it comes skins/<id>-blink.webp,
a strip of three cells that holds nothing but the closed eyes; the app lays it over the figure for a moment.
A figure without a sheet of its own borrows the closed eyes of one that has: all figures are the same Bit, drawn anew
for every skin, so the faces are not the same pixel for pixel, but the eyes sit in the same place (the script looks
for the place, the Nussknacker's are 11 px lower) and the borrowed eyes fit. If a face ever fits badly, the script
says so and that figure needs a sheet of its own.

Needs Pillow with WebP. Run from the project folder:   python3 tools/make-skins.py [folder with the sheets]
"""
import os, sys
from PIL import Image, ImageChops, ImageFilter, ImageStat

SRC = sys.argv[1] if len(sys.argv) > 1 else 'entwurf/xmas'
OUT = 'skins'
CELL, SIZE = 512, 360
WINDOW = (21, 15, 491, 485)      # inside a cell: holds every figure of the line, hats, halo and sparkles included
# file name starts with ... -> id of the skin. The first Bit ChatGPT drew (exec-cd48e9b5) is larger than the rest and not used.
SHEETS = {
    'exec-23ed2d6f': 'bit',
    'exec-0966df77': 'fn-shinobi',
    'exec-7126015d': 'fn-ranger',
    'exec-70e56194': 'fn-idol',
    'exec-fdd0ac9d': 'fn-lebkuchen',
    'exec-a1c162f1': 'fn-tueftler',
    'exec-8d584ee6': 'fn-nussknacker',
    'exec-a215131e': 'fn-eisdrache',
    'exec-09ec6e5e': 'fn-polarlicht',
}

def build(path, name):
    im = Image.open(path).convert('RGBA')
    if im.size != (CELL * 3, CELL * 2): sys.exit('%s: %dx%d, expected %dx%d' % (path, im.width, im.height, CELL * 3, CELL * 2))
    r, g, b, a = im.split()
    im = Image.merge('RGBA', (r, g, b, a.point(lambda v: 0 if v < 16 else v)))
    # nothing may sit on the lines between the cells, or a neighbour would show at the edge of a figure
    alpha = im.getchannel('A')
    for x in (CELL - 1, CELL, 2 * CELL - 1, 2 * CELL):
        if alpha.crop((x, 0, x + 1, im.height)).getextrema()[1] > 40: sys.exit('%s: something crosses the line at x = %d' % (path, x))
    if alpha.crop((0, CELL - 1, im.width, CELL + 1)).getextrema()[1] > 40: sys.exit('%s: something crosses the line between the rows' % path)
    sheet = Image.new('RGBA', (SIZE * 3, SIZE * 2), (0, 0, 0, 0))
    for row in range(2):
        for col in range(3):
            cell = im.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))
            box = cell.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
            if box and (box[0] < WINDOW[0] or box[1] < WINDOW[1] or box[2] > WINDOW[2] or box[3] > WINDOW[3]):
                sys.exit('%s: the figure in cell %d/%d reaches %s, outside the window %s' % (path, col, row, box, WINDOW))
            sheet.paste(cell.crop(WINDOW).resize((SIZE, SIZE), Image.LANCZOS), (col * SIZE, row * SIZE))
    out = os.path.join(OUT, name + '.webp')
    sheet.save(out, 'WEBP', quality=86, method=6)
    print('%-22s -> %-28s %4d kB' % (os.path.basename(path)[:22], out, os.path.getsize(out) // 1024))

def load(path):
    im = Image.open(path).convert('RGBA'); r, g, b, a = im.split()
    return Image.merge('RGBA', (r, g, b, a.point(lambda v: 0 if v < 16 else v)))

BLINK_CELLS = [(0, 0), (0, 1), (1, 1)]      # column, row of happy, think, wow: the moods with open eyes

def build_blink(path, originals):
    """originals: {id: path of the figure's sheet}. Returns the id the blink sheet belongs to, or None."""
    new = load(path)
    if new.size != (CELL * 3, CELL * 2): sys.exit('%s: %dx%d, expected %dx%d' % (path, new.width, new.height, CELL * 3, CELL * 2))
    same = lambda a, b: ImageChops.difference(a, b).getbbox() is None
    cell = lambda im, c, r: im.crop((c * CELL, r * CELL, (c + 1) * CELL, (r + 1) * CELL))
    for name, opath in originals.items():
        old = load(opath)
        if not same(cell(new, 1, 0), cell(old, 1, 0)): continue      # the cell "cheer" must be untouched: that is how the figure is recognised
        strip = Image.new('RGBA', (SIZE * 3, SIZE), (0, 0, 0, 0)); changed = []
        for i, (c, r) in enumerate(BLINK_CELLS):
            a, b = cell(old, c, r), cell(new, c, r)
            # where the two cells differ in any colour channel or in transparency: fully in the mask, not by degrees
            mask = Image.new('L', (CELL, CELL), 0)
            for ch in ImageChops.difference(a, b).split(): mask = ImageChops.lighter(mask, ch.point(lambda v: 255 if v > 12 else 0))
            box = mask.getbbox()
            if not box: sys.exit('%s: cell %d/%d is the same as in the original, no closed eyes there' % (path, c, r))
            if box[2] - box[0] > 260 or box[3] - box[1] > 160: sys.exit('%s: cell %d/%d differs in an area of %s, more than the eyes. The figure was drawn anew; ask for the eyes only.' % (path, c, r, box))
            changed.append(box)
            grown = mask.filter(ImageFilter.MaxFilter(15))          # a little more than what changed, so no edge of an eye is cut
            # Shrink the whole cell first and cut afterwards. Cutting first would mix the colours at the edge of the cut
            # with the black of the transparent surroundings, and the closed eyes would get dark rims.
            small = b.crop(WINDOW).resize((SIZE, SIZE), Image.LANCZOS); keep = grown.crop(WINDOW).resize((SIZE, SIZE), Image.LANCZOS)
            r, g, bl, al = small.split()
            strip.paste(Image.merge('RGBA', (r, g, bl, ImageChops.darker(al, keep))), (i * SIZE, 0))
        for c, r in ((2, 0), (2, 1)):
            if not same(cell(new, c, r), cell(old, c, r)): sys.exit('%s: a cell that should stay as it is was changed (%d/%d)' % (path, c, r))
        out = os.path.join(OUT, name + '-blink.webp'); strip.save(out, 'WEBP', quality=92, method=6)
        print('%-22s -> %-28s %4d kB   eyes at %s' % (os.path.basename(path)[:22], out, os.path.getsize(out) // 1024, changed[0]))
        return name
    return None

def eye_mask(a, b):
    m = Image.new('L', (CELL, CELL), 0)
    for ch in ImageChops.difference(a, b).split(): m = ImageChops.lighter(m, ch.point(lambda v: 255 if v > 12 else 0))
    return m

def borrow_blink(name, opath, donor_orig, donor_blink):
    """The closed eyes of the donor, put on the figure `name`. Returns the offsets found, one per mood."""
    cell = lambda im, c, r: im.crop((c * CELL, r * CELL, (c + 1) * CELL, (r + 1) * CELL))
    mine, dold, dnew = load(opath), load(donor_orig), load(donor_blink)
    strip = Image.new('RGBA', (SIZE * 3, SIZE), (0, 0, 0, 0)); moves = []
    for i, (c, r) in enumerate(BLINK_CELLS):
        a, b, t = cell(dold, c, r), cell(dnew, c, r), cell(mine, c, r)
        mask = eye_mask(a, b); x0, y0, x1, y1 = mask.getbbox(); x0 -= 15; y0 -= 10; x1 += 15; y1 += 15
        ref = a.crop((x0, y0, x1, y1)).convert('RGB')
        # where do the open eyes of this figure sit? Try every shift near by and keep the one that fits best.
        fit = lambda dx, dy: sum(ImageStat.Stat(ImageChops.difference(ref, t.crop((x0 + dx, y0 + dy, x1 + dx, y1 + dy)).convert('RGB'))).mean) / 3
        best = min(((fit(dx, dy), dx, dy) for dy in range(-30, 31, 2) for dx in range(-30, 31, 2)))
        best = min(((fit(dx, dy), dx, dy) for dy in range(best[2] - 2, best[2] + 3) for dx in range(best[1] - 2, best[1] + 3)))
        miss, dx, dy = best
        if miss > 22: sys.exit('%s: the eyes of the donor do not fit (difference %.1f at best). This figure needs a blink sheet of its own.' % (name, miss))
        moves.append((dx, dy))
        soft = mask.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(2))      # a soft edge: the skin around the eyes is alike, not identical
        moved = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0)); moved.paste(b, (dx, dy)); keep = Image.new('L', (CELL, CELL), 0); keep.paste(soft, (dx, dy))
        small = moved.crop(WINDOW).resize((SIZE, SIZE), Image.LANCZOS); keep = keep.crop(WINDOW).resize((SIZE, SIZE), Image.LANCZOS)
        rr, gg, bb, al = small.split()
        strip.paste(Image.merge('RGBA', (rr, gg, bb, ImageChops.darker(al, keep))), (i * SIZE, 0))
    out = os.path.join(OUT, name + '-blink.webp'); strip.save(out, 'WEBP', quality=92, method=6)
    print('%-22s -> %-28s %4d kB   eyes moved by %s' % ('(borrowed)', out, os.path.getsize(out) // 1024, moves[0]))

os.makedirs(OUT, exist_ok=True)
found = 0
for f in sorted(os.listdir(SRC)):
    for start, name in SHEETS.items():
        if f.startswith(start): build(os.path.join(SRC, f), name); found += 1
if found != len(SHEETS): sys.exit('%d of %d sheets found in %s' % (found, len(SHEETS), SRC))
originals = {}
for f in sorted(os.listdir(SRC)):
    for start, name in SHEETS.items():
        if f.startswith(start): originals[name] = os.path.join(SRC, f)
bdir = os.path.join(SRC, 'blinzeln'); blink = []
for f in sorted(os.listdir(bdir)) if os.path.isdir(bdir) else []:
    if not f.lower().endswith('.png'): continue
    name = build_blink(os.path.join(bdir, f), originals)
    if not name: sys.exit('%s: belongs to none of the figures (the cell "jubelt" matches no original)' % f)
    blink.append(name); donor = donor if 'donor' in dir() else (originals[name], os.path.join(bdir, f))
if blink:
    for name, opath in sorted(originals.items()):
        if name not in blink: borrow_blink(name, opath, donor[0], donor[1]); blink.append(name)
print('blinking:', ', '.join(sorted(blink)) or 'no figure yet', '-> list these in BLINK in index.html')
