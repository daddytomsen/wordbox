#!/usr/bin/env python3
"""Draws icon-maskable-512.png, the app icon for Android.

Android cuts its icons into a circle or a rounded square and may crop everything outside the middle 80 %
(the "safe zone"). In icon.svg the vocabulary card sits in the lower right corner, where a circle cuts it off.
This script draws the same picture with the card moved into the safe zone; the flag still fills the whole square.
Needs Pillow and the font Arial Bold (macOS). Run from the project folder:  python3 tools/make-maskable-icon.py
With --check it draws the layout of icon.svg instead, to compare the drawing with icon-512.png.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SS = 4                       # draw four times as large, then shrink: smooth edges
N = 512 * SS
FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
SRC = (372, 368)             # the point the card turns around in icon.svg

def draw(center, k, out):
    s = lambda v: v * SS
    img = Image.new('RGB', (N, N), '#012169')
    d = ImageDraw.Draw(img)
    far = 200 * SS           # lines start outside the picture, so their ends never show
    for colour, w in (('#FFFFFF', 76), ('#C8102E', 35)):
        d.line([(-far, -far), (N + far, N + far)], fill=colour, width=s(w))
        d.line([(N + far, -far), (-far, N + far)], fill=colour, width=s(w))
    for colour, w in (('#FFFFFF', 142), ('#C8102E', 78)):
        d.rectangle([0, s(256 - w / 2), N, s(256 + w / 2)], fill=colour)
        d.rectangle([s(256 - w / 2), 0, s(256 + w / 2), N], fill=colour)

    # the card on its own layer: every point of icon.svg is scaled by k around SRC and moved to center
    P = lambda x, y: (s(center[0] + k * (x - SRC[0])), s(center[1] + k * (y - SRC[1])))
    card = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    c = ImageDraw.Draw(card)
    c.rounded_rectangle([P(278, 246), P(454, 472)], radius=s(27 * k), fill='#BDEFE9')
    c.rounded_rectangle([P(292, 260), P(452, 476)], radius=s(27 * k), fill='#FFFFFF')
    c.text(P(372, 405), 'a', font=ImageFont.truetype(FONT, round(s(139 * k))), fill='#123C57', anchor='ms')
    cx, cy = P(421, 298); r = s(22 * k)
    c.ellipse([cx - r, cy - r, cx + r, cy + r], fill='#FFC83D')
    tick = [P(412, 298), P(419, 305), P(432, 290)]; w = s(6 * k)
    c.line(tick, fill='#6A4A00', width=round(w), joint='curve')
    for x, y in tick: c.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill='#6A4A00')
    card = card.rotate(-4, resample=Image.BICUBIC, center=(s(center[0]), s(center[1])))

    # soft shadow under the card: its outline, moved down, blurred, in dark blue
    a = card.getchannel('A')
    sh = Image.new('L', (N, N), 0); sh.paste(a, (0, round(s(10 * k))))
    sh = sh.filter(ImageFilter.GaussianBlur(s(10 * k))).point(lambda v: round(v * .36))
    img.paste(Image.new('RGB', (N, N), '#07163B'), (0, 0), sh)
    img.paste(card, (0, 0), card)
    img.resize((512, 512), Image.LANCZOS).save(out, optimize=True)
    print('written', out)

if '--check' in sys.argv:
    draw(SRC, 1, sys.argv[sys.argv.index('--check') + 1])
else:
    draw((304, 310), .8, 'icon-maskable-512.png')
