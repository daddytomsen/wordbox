#!/usr/bin/env bash
# Prüft Voc a Bit vor jedem Commit: JS-Syntax, JSON-Dateien, Listen-Index, gleiche Versionsnummer in sw.js und index.html.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d "${TMPDIR:-/tmp}/wordbox.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT

python3 - "$tmp" <<'PY'
import json, os, re, sys
tmp = sys.argv[1]
html = open('index.html', encoding='utf-8').read()
scripts = re.findall(r'<script>([\s\S]*?)</script>', html)
assert len(scripts) == 1, 'index.html: genau ein <script>-Block erwartet'
open(os.path.join(tmp, 'app.js'), 'w', encoding='utf-8').write(scripts[0])

json.load(open('manifest.webmanifest', encoding='utf-8'))
index = json.load(open('lists/index.json', encoding='utf-8'))['lists']
seen = set()
for entry in index:
    lid = entry['id']
    assert lid not in seen, f'lists/index.json: doppelte id {lid}'
    seen.add(lid)
    data = json.load(open('lists/' + entry['file'], encoding='utf-8'))
    words = data['words'] if isinstance(data, dict) else data
    ids = [w['id'] for w in words if w.get('id')]
    assert len(ids) == len(set(ids)), f"{entry['file']}: doppelte Wort-ids"
    for w in words:
        assert w.get('en') and w.get('de'), f"{entry['file']}: en/de fehlt bei {w}"
        if w.get('gap'):
            assert w['gap'] in w.get('ex', ''), f"{entry['file']}: gap '{w['gap']}' steht nicht in ex"
    print(f"  {entry['file']}: {len(words)} Wörter, rev {entry.get('rev', 1)}")

cache = re.search(r"CACHE = 'wordbox-v([\d.]+)'", open('sw.js', encoding='utf-8').read()).group(1)
shown = re.search(r'Version ([\d.]+)', html).group(1)
assert cache == shown, f'Version passt nicht: sw.js {cache}, index.html {shown}'
print(f'  Version {shown}')
PY

node --check "$tmp/app.js"
node --check sw.js
echo "OK"
