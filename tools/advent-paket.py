#!/usr/bin/env python3
"""Baut das private Fotopaket für den Adventskalender von Voc a Bit.

Die App ist öffentlich im Netz, Familienfotos gehören deshalb nicht hinein. Dieses Skript macht aus bis zu
24 Fotos und ein paar Sätzen EINE Datei. Die lädt man auf dem Handy des Kindes in die App; dort bleibt sie.

  python3 tools/advent-paket.py ~/Downloads/voc-a-bit-advent-privat

Im Ordner liegen die Fotos und wahlweise texte.txt mit einer Zeile je Eintrag:
        7 Foto: IMG_0260.JPG
        7: Weißt du noch? Unser Sommer am Meer.
        7 Gutschein: Heute suchst du den Film aus.
Welches Foto zu welchem Türchen gehört, sagt entweder die Zeile "Foto:" oder der Dateiname, wenn er mit der
Nummer beginnt (01.jpg, 7.jpeg, "12 Strand.png"). Sobald texte.txt eine "Foto:"-Zeile hat, gelten nur diese
Zeilen; die Dateien selbst werden nie umbenannt. Zeilen mit # am Anfang werden übersprungen.
Türchen ohne Foto oder ohne Text sind in Ordnung. Von einem bewegten GIF wird ein Standbild genommen. Heraus kommt im selben Ordner
"Voc-a-Bit-Adventspaket-<Jahr>.json".

Die Fotos werden verkleinert (lange Seite 1080 Pixel), Aufnahmeort und Kameradaten werden entfernt. In der Datei
stehen sie verwürfelt: Das ist kein Schutz, es verhindert nur, dass man sie am Handy als Bilder öffnen kann.
Braucht Pillow. HEIC-Fotos wandelt das Skript am Mac mit dem Bordmittel sips um.
"""
import base64, io, json, os, re, subprocess, sys, tempfile

from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
LONG_EDGE, MAX_BYTES = 1080, 190_000
PICS = ('.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp', '.gif')


def year():
    """The year of the calendar, read from the app so both always agree."""
    src = open(os.path.join(HERE, '..', 'index.html'), encoding='utf-8').read()
    return int(re.search(r'const ADVENT_YEAR = (\d{4});', src).group(1))


def in_public_repo(folder):
    """True when the folder lies in a git repository and git would not ignore it."""
    try:
        top = subprocess.run(['git', '-C', folder, 'rev-parse', '--show-toplevel'], capture_output=True, text=True)
        if top.returncode != 0:
            return False
        return subprocess.run(['git', '-C', folder, 'check-ignore', '-q', folder]).returncode != 0
    except OSError:
        return False


def open_picture(path):
    try:
        im = Image.open(path)
        if im.format == 'GIF' and getattr(im, 'n_frames', 1) > 1:
            im.seek(im.n_frames // 2)             # a moving picture: one frame from the middle
        im.load(); return im                       # iPhone photos hold extra pictures (depth, brightness): the first is the photo
    except Exception:
        tmp = os.path.join(tempfile.mkdtemp(), 'bild.jpg')      # HEIC: let macOS convert it
        subprocess.run(['sips', '-s', 'format', 'jpeg', path, '--out', tmp], check=True, capture_output=True)
        im = Image.open(tmp); im.load(); return im


def shrink(path):
    """JPEG bytes: upright, at most LONG_EDGE pixels, without any metadata (no place, no date, no camera)."""
    im = ImageOps.exif_transpose(open_picture(path)).convert('RGB')
    im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
    for quality in (80, 74, 68, 62, 56):
        buf = io.BytesIO(); im.save(buf, 'JPEG', quality=quality, optimize=True)
        if buf.tell() <= MAX_BYTES:
            break
    return buf.getvalue(), im.size


def scramble(data, y, day):
    key = f'voc-a-bit-advent-{y}-{day}'.encode()
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))


def read_texts(folder):
    texts, gifts, photos = {}, {}, {}
    path = os.path.join(folder, 'texte.txt')
    if not os.path.exists(path):
        return texts, gifts, photos
    for line in open(path, encoding='utf-8-sig'):
        m = re.match(r'\s*(\d{1,2})\s*(gutschein|foto)?\s*[:.)-]\s*(.+?)\s*$', line, re.I)
        if not m or not 1 <= int(m.group(1)) <= 24:
            continue
        kind = (m.group(2) or '').lower()
        (gifts if kind == 'gutschein' else photos if kind == 'foto' else texts)[int(m.group(1))] = m.group(3)
    return texts, gifts, photos


def main():
    if len(sys.argv) != 2 or not os.path.isdir(sys.argv[1]):
        sys.exit(__doc__)
    folder = os.path.abspath(sys.argv[1])
    if in_public_repo(folder):
        sys.exit('Abbruch: Dieser Ordner liegt in einem Git-Repo und würde mit veröffentlicht.\n'
                 'Nimm einen Ordner außerhalb, zum Beispiel ~/Downloads/voc-a-bit-advent-privat.')
    y = year()
    texts, gifts, pics = read_texts(folder)
    if pics:                                       # the text file says which photo belongs to which door
        for day, name in pics.items():
            if not os.path.isfile(os.path.join(folder, name)):
                sys.exit(f'Abbruch: Türchen {day} nennt das Foto "{name}", das gibt es im Ordner nicht.')
        twice = [n for n in set(pics.values()) if list(pics.values()).count(n) > 1]
        if twice:
            sys.exit('Abbruch: Dieses Foto steht bei zwei Türchen: ' + ', '.join(sorted(twice)))
        used = set(pics.values())
        spare = [n for n in sorted(os.listdir(folder)) if n.lower().endswith(PICS) and n not in used]
        if spare:
            print('Hinweis: Diese Fotos liegen im Ordner, gehören aber zu keinem Türchen: ' + ', '.join(spare) + '\n')
    else:
        for name in sorted(os.listdir(folder)):
            m = re.match(r'0*(\d{1,2})(\D|$)', name)
            if m and name.lower().endswith(PICS) and 1 <= int(m.group(1)) <= 24:
                if int(m.group(1)) in pics:
                    sys.exit(f'Abbruch: Zwei Fotos für Türchen {int(m.group(1))}: {pics[int(m.group(1))]} und {name}')
                pics[int(m.group(1))] = name
    days, total = {}, 0
    print(f'Adventspaket {y} aus {folder}\n')
    for day in range(1, 25):
        entry = {}
        note = []
        if day in pics:
            data, size = shrink(os.path.join(folder, pics[day]))
            entry['img'] = base64.b64encode(scramble(data, y, day)).decode()
            total += len(data)
            note.append(f'Foto {size[0]}×{size[1]}, {len(data) // 1024} kB')
        if day in texts:
            entry['text'] = texts[day]; note.append('Text')
        if day in gifts:
            entry['gift'] = gifts[day]; note.append('Gutschein')
        if entry:
            days[str(day)] = entry
        print(f'  Türchen {day:2d}: ' + (', '.join(note) if note else 'nichts (nur der allgemeine Inhalt)'))
    if not days:
        sys.exit('\nNichts gefunden. Fotos müssen mit der Türchen-Nummer beginnen, zum Beispiel 01.jpg.')
    out = os.path.join(folder, f'Voc-a-Bit-Adventspaket-{y}.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump({'type': 'voc-a-bit-advent', 'year': y, 'days': days}, f, ensure_ascii=False)
    print(f'\n{len(pics)} Fotos, zusammen {total // 1024} kB. Geschrieben: {out} ({os.path.getsize(out) // 1024} kB)')
    print('Diese Datei aufs Handy schicken (AirDrop) und in Voc a Bit laden:\n'
          '  vor dem 1. Dezember: Vokabeln → Neue Vokabeln hinzufügen → Datei öffnen\n'
          '  ab dem 1. Dezember auch: Erfolge → Einstellungen → Adventskalender → Fotopaket laden')


if __name__ == '__main__':
    main()
