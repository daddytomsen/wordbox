# Word Box – Projektwissen für Claude Code

Englisch-Vokabeltrainer für ein Kind in Klasse 6, als Web-App für das iPhone (Safari → „Zum Home-Bildschirm“), gehostet auf GitHub Pages. Kein Server, kein Login, kein Build-Schritt. Offene Aufgaben stehen in `HANDOFF.md`.

## Grundsätze

- **Eine Datei:** Die ganze App steckt in `index.html` (CSS, SVG-Icons, JS). Kein Framework, kein Bundler, keine externen Skripte. So bleibt es.
- **Vanilla JS**, ES2019+, läuft in iOS-Safari ab 15. Keine Top-Level-`await`, keine Module.
- **Oberfläche Deutsch**, Du-Form, kurz und kindgerecht. Englische Inhalte genau wie im Schulbuch.
- **Lernstand nur im Gerät** (`localStorage`). Nichts verschicken, keine Analytics, keine Cookies.
- **Repo ist öffentlich** (GitHub Pages kostenlos): keine Namen, keine Fotos von Buchseiten, keine Sicherungsdateien einchecken.
- **Read before write:** erst lesen, dann Änderung vorschlagen, dann schreiben.
- Vor jedem Commit `tools/check.sh` laufen lassen.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | App komplett |
| `sw.js` | Service Worker: offline, Updates (HTML und `lists/` network-first, Rest cache-first) |
| `manifest.webmanifest`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Home-Bildschirm |
| `lists/index.json`, `lists/*.json` | Lektionen (Vokabellisten) |
| `tools/check.sh` | Prüfung: JS-Syntax, JSON, Listen, Versionsgleichheit |
| `robots.txt`, `.nojekyll` | keine Suchmaschinen, GitHub Pages ohne Jekyll |

## Release-Regel

Bei jeder Änderung an `index.html` oder den Icons **beide Versionsnummern gleichzeitig** hochzählen, sonst bekommt das iPhone die alte Fassung aus dem Cache:

- `sw.js`: `const CACHE = 'wordbox-v1.1';`
- `index.html`: Text `Version 1.1` in den Einstellungen (Erfolge → Einstellungen)

`tools/check.sh` bricht ab, wenn beide nicht übereinstimmen. Neue Listen in `lists/` brauchen keinen neuen Release.

## Aufbau von `index.html`

`<head>` mit Meta-Tags für iOS, Google Fonts (Bricolage Grotesque für Überschriften, Lexend für Text, mit System-Fallback). Danach `<style>` mit Design-Tokens auf `:root` und Dunkelmodus über `prefers-color-scheme` und `[data-theme]`. Im `<body>` ein unsichtbares SVG-Sprite mit Tabler Icons (MIT), dann `#app`, `#toast` und ein `<script>` in einer IIFE.

Abschnitte im Skript (Kommentare `/* ---------- … ---------- */`):

1. **helpers** – `esc()` für jedes HTML aus Daten, `icon(name, 'fill')` → `<svg><use href="#i-name(-f)">`.
2. **words / mastery** – Karteikasten mit 5 Fächern. `INTERVAL = [0,0,1,3,7,14]` Tage. `grade(id, ok)`: richtig und fällig → ein Fach hoch (neu → Fach 2), falsch → Fach 1 und sofort fällig. Gelernt = Fach ≥ 4. `isWeak` = schon mal falsch und Fach ≤ 2.
3. **levels & badges** – Level-Schwellen `lvlStart(n) = 50(n−1) + 25n(n−1)`, 15 Abzeichen in `BADGES`.
4. **persistence** – `persist()` schreibt `S.prog`, `saveUnits()` schreibt `S.units`. `downloadFile()` für Sicherungen.
5. **sound & speech** – iOS: Ton wird im ersten `touchend/click` freigeschaltet (`unlockAudio`), `navigator.audioSession.type = 'playback'`, damit der Stummschalter neuere iPhones nicht stummschaltet. `say()` muss **synchron** aus dem Tipp-Handler laufen, sonst blockiert iOS die Sprachausgabe. Kein `setTimeout` davor.
6. **confetti & toast**
7. **question building** – `MODES` (mix, de-en, en-de, past, opp, gap, type), Gewichte `MIX_W`. Falsche Antworten: `pickOpts()` nimmt bevorzugt dieselbe Lektion und Wortart plus das ähnlichste Wort (Bigramm-Ähnlichkeit). Simple Past: `pastWrong()` erzeugt typische Fehler (choosed, planed, Grundform, -ing).
8. **typed answers** – `checkTyped()`: normalisiert (`to`, `sb/sth`, Klammern, `your→one's`), Varianten aus `/` und `(= …)`, 1 Tippfehler erlaubt ab 4 Buchstaben.
9. **quiz flow** – Runde aus Auswahl, plus 1–3 eingestreute Wörter (`extra`), die schwach oder fällig sind, auch aus nicht gewählten Lektionen. Falsch beantwortete Frage kommt einmal 3 Fragen später wieder. XP: 10 pro richtige Antwort, 15 beim Schreiben, +5 für Extra-Wörter, +10 Rundenbonus, +20 fehlerfrei (ab 5 Fragen). Serie zählt nur bei fertig gespielter Runde.
10. **views** – `viewHome`, `viewPractice`, `viewVocab`, `viewAwards`, `viewQuiz`, `viewResult`, `viewOnboard`. Alles per Template-String und `render()` → `app.innerHTML`.
11. **adding vocabulary** – `viewImport`, `parseText()` (JSON, JSON in ```-Block, oder Zeilen `en ; de ; past ; Beispielsatz`, auch Tab, ` = `, ` – `), `importPrompt()` (Anleitung für Claude zum Auslesen von Buchfotos).
12. **lessons from the server** – `syncLists()` lädt `lists/index.json` beim Start und nach 10 min im Hintergrund. Neue `id` → Lektion anhängen und auswählen. Höhere `rev` → Lektion ersetzen. Vom Kind gelöschte Server-Lektionen stehen in `prog.removedLists` und kommen nicht wieder.
13. **events / boot** – Ereignis-Delegation über `data-act` (click, Tabelle `ACT`), `data-ch` (change, `CH`), `data-in` (input, `IN`). Tastatur 1–4 und Enter im Quiz.

Theme 1 ist zusätzlich als `SEED` eingebettet, damit die App beim allerersten Start auch offline Vokabeln hat.

## Datenmodell

**Wort** (in `lists/*.json` und `S.units[].words`):

```json
{ "id": "t1-15", "en": "to choose", "de": "(aus)wählen", "pos": "verb",
  "ipa": "/tʃuːz/", "past": "chose", "pp": "chosen",
  "ex": "He is choosing a book to read.", "gap": "choosing",
  "opp": "", "sec": "A", "note": "simple past: chose /tʃəʊz/", "opt": false }
```

Pflicht: `en`, `de`. `pos` ∈ verb, noun, adj, adv, phrase, other. `gap` muss wörtlich in `ex` vorkommen. `opt: true` = fakultatives Wort (°).

**Wichtig:** Der Lernstand hängt an der Wort-`id`. Ids nie ändern. Fehlt die `id`, vergibt die App `<listen-id>-001`, `-002` … nach Position. Wer in eine solche Liste etwas einfügt, verschiebt alle Ids danach. Darum neue Listen immer mit festen Ids anlegen.

**Liste** (`lists/<datei>.json`): `{ "title", "pages", "words": [...] }`
**Index** (`lists/index.json`): `{ "lists": [ { "id", "title", "file", "rev" } ] }`

**Lernstand** `localStorage['wordbox.prog.v1']`: `name, goal, sound, speak, xp, days{YYYY-MM-DD: xp}, streak, best, last, rounds, perfect, typedRight, pastRight, extraRight, bestCombo, photos, goalDays, badges{id: datum}, w{wortId: {l: fach, r, x, s, d: fällig-ms}}, sel[ids], mode, len, onboarded, removedLists[], updatedAt`.
**Lektionen** `localStorage['wordbox.units.v1']`: Array von Lektionen.
**Sicherung**: `{ app: "wordbox", v: 1, exported, prog, units }`.

## Lokal testen

```bash
cd ~/Downloads/wordbox
tools/check.sh
python3 -m http.server 8080      # dann http://localhost:8080
```

Der Service Worker läuft nur unter https (also erst auf GitHub Pages). Auf dem iPhone testen über die Pages-Adresse. Ton und Sprache verhalten sich auf dem echten iPhone anders als am Mac.

## Icons ergänzen

Im Sprite `<defs>` ein `<symbol id="i-NAME" viewBox="0 0 24 24">` mit den Pfaden des Tabler-Outline-Icons einfügen, innen `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:var(--sw,2)">`. Für gefüllte Variante zusätzlich `i-NAME-f` und den Namen in `FILLED` aufnehmen.
