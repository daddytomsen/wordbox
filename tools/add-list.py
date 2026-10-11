#!/usr/bin/env python3
"""Nimmt Claudes Antwort (Buchfotos → JSON) als neue Lektion in lists/ auf.

    tools/add-list.py <claude-antwort.json|.txt> --id theme2 [--title "…"] [--pages "S. 227–228"] [--dry-run]

- liest reines JSON oder JSON in einem ```-Block,
- vergibt feste Wort-Ids <id>-001, <id>-002 … (vorhandene id bleibt),
- prüft Pflichtfelder (en, de), pos-Werte und dass gap wörtlich in ex vorkommt (sonst wird gap geleert),
- warnt bei Dubletten gegenüber allen anderen Listen,
- schreibt lists/<id>.json und trägt die Lektion mit rev 1 in lists/index.json ein,
- bei schon vorhandener id: Liste ersetzen, rev hochzählen, Wort-Ids anhand von en wiederverwenden,
  damit der Lernstand auf dem iPhone erhalten bleibt.

Nur Python-Standardbibliothek. Danach tools/check.sh laufen lassen.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LISTS = ROOT / 'lists'
INDEX = LISTS / 'index.json'

POS = ('verb', 'noun', 'adj', 'adv', 'phrase', 'other')
# Reihenfolge der Felder in der Ausgabedatei; alles andere wird verworfen.
FIELDS = ('id', 'en', 'de', 'ipa', 'pos', 'past', 'pp', 'ex', 'gap', 'opp', 'sec', 'page', 'note', 'opt')


def warn(msg):
    print('  ! ' + msg, file=sys.stderr)


def die(msg):
    print('Fehler: ' + msg, file=sys.stderr)
    sys.exit(1)


# ---------- Eingabe lesen ----------

def read_answer(path):
    """Claudes Antwort: reines JSON, JSON in einem ```-Block oder JSON irgendwo im Text."""
    text = Path(path).read_text(encoding='utf-8').lstrip('﻿').strip()
    candidates = [text]
    m = re.search(r'```(?:json)?\s*([\s\S]*?)```', text, re.I)
    if m:
        candidates.insert(0, m.group(1).strip())
    a, b = text.find('{'), text.rfind('}')
    if 0 <= a < b:
        candidates.append(text[a:b + 1])
    for c in candidates:
        try:
            data = json.loads(c)
        except ValueError:
            continue
        if isinstance(data, list):
            data = {'words': data}
        if isinstance(data, dict) and isinstance(data.get('words'), list):
            return data
    die(f'{path}: kein JSON mit "words" gefunden')


# ---------- Normalisierung ----------

def norm_en(en):
    """Vergleichsschlüssel für ein englisches Stichwort.

    Wird an zwei Stellen benutzt: (1) Dubletten gegenüber anderen Listen erkennen,
    (2) beim Ersetzen einer Liste die alte Wort-Id über das Stichwort wiederfinden,
    damit der Karteikasten-Stand des Kindes am Wort hängen bleibt.

    Entscheidung (11.10.2026): Groß-/Kleinschreibung, Apostroph-Form (’ vs ') und
    mehrfache Leerzeichen sind egal; der Infinitiv-Marker "to " vor Verben zählt nicht
    ("to choose" = "choose"). Klammerzusätze bleiben Teil des Wortes, weil "a bit" und
    "a bit (of)" im Buch getrennte Einträge sein können.
    """
    key = en.strip().lower()
    key = re.sub(r"[’‘`´]", "'", key)
    key = re.sub(r'\s+', ' ', key)
    key = re.sub(r"^to (?=[a-z])", '', key)
    return key


def clean_word(w, file_label, n):
    """Felder prüfen und in das Datenmodell der App bringen. Gibt None zurück, wenn das Wort unbrauchbar ist."""
    if not isinstance(w, dict):
        warn(f'{file_label}: Eintrag {n} ist kein Objekt, übersprungen')
        return None
    out = {}
    for k in FIELDS:
        v = w.get(k, '')
        if k == 'opt':
            out[k] = bool(v)
        elif v is None:
            out[k] = ''
        else:
            out[k] = re.sub(r'\s+', ' ', str(v)).strip()
    if not out['en'] or not out['de']:
        warn(f'{file_label}: Eintrag {n} ohne en/de übersprungen: {json.dumps(w, ensure_ascii=False)[:80]}')
        return None
    if out['pos'] not in POS:
        if out['pos']:
            warn(f'{file_label}: "{out["en"]}" hat unbekanntes pos "{out["pos"]}", gesetzt auf "other"')
        out['pos'] = 'verb' if re.match(r'^to\s', out['en']) else 'other'
    if out['gap'] and out['gap'] not in out['ex']:
        warn(f'{file_label}: "{out["en"]}": gap "{out["gap"]}" steht nicht in ex, gap geleert')
        out['gap'] = ''
    # Leere Felder weglassen, so wie Theme 1 angelegt ist; opt nur wenn wahr.
    return {k: v for k, v in out.items() if v not in ('', False)}


# ---------- Bestand ----------

def load_index():
    if INDEX.exists():
        idx = json.loads(INDEX.read_text(encoding='utf-8'))
        if not isinstance(idx.get('lists'), list):
            die('lists/index.json: "lists" fehlt')
        return idx
    return {'lists': []}


def load_words(entry):
    data = json.loads((LISTS / entry['file']).read_text(encoding='utf-8'))
    return data['words'] if isinstance(data, dict) else data


def id_suffix(word_id, prefix):
    m = re.fullmatch(re.escape(prefix) + r'-(\d+)', word_id)
    return int(m.group(1)) if m else None


# ---------- Hauptlauf ----------

def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('answer', help='Datei mit Claudes Antwort (.json oder .txt)')
    ap.add_argument('--id', required=True, help='Listen-Id, z. B. theme2 (wird Dateiname und Id-Präfix)')
    ap.add_argument('--title', help='Titel der Lektion (sonst aus der Antwort)')
    ap.add_argument('--pages', help='Seitenangabe, z. B. "S. 227–228" (sonst aus der Antwort)')
    ap.add_argument('--dry-run', action='store_true', help='nur prüfen und anzeigen, nichts schreiben')
    args = ap.parse_args()

    list_id = args.id.strip()
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', list_id):
        die('--id darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten')

    data = read_answer(args.answer)
    index = load_index()
    existing = next((e for e in index['lists'] if e['id'] == list_id), None)
    file_name = existing['file'] if existing else f'{list_id}.json'

    # Alte Fassung dieser Liste: Ids nach Stichwort merken, damit sie wiederverwendet werden.
    # Titel und Seiten bleiben, wenn die Korrekturantwort keine mitbringt.
    old_by_key, used_ids, old_meta = {}, set(), {}
    if existing:
        old_data = json.loads((LISTS / file_name).read_text(encoding='utf-8'))
        if isinstance(old_data, dict):
            old_meta = {'title': old_data.get('title', ''), 'pages': old_data.get('pages', '')}
        for w in load_words(existing):
            if w.get('id'):
                used_ids.add(w['id'])
                old_by_key.setdefault(norm_en(w.get('en', '')), w['id'])

    # Alle anderen Listen: Dubletten-Suche.
    elsewhere = {}
    for e in index['lists']:
        if e['id'] == list_id:
            continue
        for w in load_words(e):
            elsewhere.setdefault(norm_en(w.get('en', '')), []).append(f'{e["id"]} ({w.get("de", "")})')

    title = (args.title or str(data.get('title') or '') or str(old_meta.get('title') or '')).strip() or list_id
    pages = (args.pages or str(data.get('pages') or '') or str(old_meta.get('pages') or '')).strip()

    words = []
    label = Path(args.answer).name
    for n, raw in enumerate(data['words'], 1):
        w = clean_word(raw, label, n)
        if w:
            words.append(w)
    if not words:
        die('keine brauchbaren Wörter in der Antwort')

    # Ids vergeben: eigene behalten, sonst alte Id über en wiederfinden, sonst neue laufende Nummer.
    # Neue Nummern beginnen hinter der höchsten je vergebenen, damit ein entferntes Wort seine Id
    # nicht an ein anderes Wort weitergibt.
    counter = max([id_suffix(i, list_id) or 0 for i in used_ids] + [0])
    seen, reused, fresh = set(), 0, 0
    for w in words:
        key = norm_en(w['en'])
        wid = w.get('id')
        if wid and wid in seen:
            warn(f'doppelte Wort-Id {wid} in der Antwort, wird neu vergeben')
            wid = None
        if not wid and key in old_by_key and old_by_key[key] not in seen:
            wid = old_by_key[key]
            reused += 1
        if not wid:
            counter += 1
            wid = f'{list_id}-{counter:03d}'
            while wid in used_ids or wid in seen:
                counter += 1
                wid = f'{list_id}-{counter:03d}'
            fresh += 1
        seen.add(wid)
        w['id'] = wid
        if key in elsewhere:
            warn(f'"{w["en"]}" gibt es schon in: {", ".join(elsewhere[key])}')

    # Dubletten innerhalb der neuen Liste
    keys = [norm_en(w['en']) for w in words]
    for k in sorted({k for k in keys if keys.count(k) > 1}):
        warn(f'"{k}" kommt in der Antwort mehrfach vor')

    out = {'title': title, 'pages': pages, 'words': [{k: w[k] for k in FIELDS if k in w} for w in words]}
    rev = (int(existing.get('rev', 1)) + 1) if existing else 1
    entry = {'id': list_id, 'title': title, 'file': file_name, 'rev': rev}

    print(f'{"Ersetze" if existing else "Neu"}: {list_id} → lists/{file_name}, rev {rev}')
    print(f'  Titel: {title}' + (f' · {pages}' if pages else ''))
    print(f'  {len(words)} Wörter' + (f', {reused} Ids wiederverwendet, {fresh} neu' if existing else ''))
    if existing and fresh:
        lost = [i for i in used_ids if i not in seen]
        if lost:
            warn(f'{len(lost)} alte Wörter fehlen in der neuen Fassung (Lernstand dazu bleibt gespeichert, wird aber nicht mehr abgefragt)')
    if args.dry_run:
        print('  (dry-run, nichts geschrieben)')
        return

    (LISTS / file_name).write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if existing:
        existing.update(entry)
    else:
        index['lists'].append(entry)
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('  geschrieben. Jetzt tools/check.sh laufen lassen.')


if __name__ == '__main__':
    main()
