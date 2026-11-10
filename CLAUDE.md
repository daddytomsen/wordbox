# Voc a Bit – Projektwissen für Claude Code

Die App hieß bis Version 1.3 „Word Box“. Interne Schlüssel (`wordbox.prog.v1`, `wordbox.units.v1`, `app: "wordbox"`, Cache-Präfix `wordbox-v`, Repo `wordbox`) behalten den alten Namen, damit Lernstand, Sicherungen und die Pages-Adresse weiter funktionieren.

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
| `sw.js` | Service Worker: offline, Updates. Seite und `lists/` network-first mit 3,5 s Wartezeit, dann Cache; Icons, Manifest und Schriften cache-first. Löscht nur eigene Caches (`wordbox-v…`), weil sich alle Pages-Apps des Kontos einen Ursprung teilen |
| `manifest.webmanifest`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Home-Bildschirm; `icon.svg` ist die Quelle der PNGs (Union Jack mit Vokabelkarte „a“, Entwurf von Thomas); PNGs randlos rendern, iOS rundet selbst |
| `lists/index.json`, `lists/*.json` | Lektionen (Vokabellisten) |
| `tools/check.sh` | Prüfung: JS-Syntax, JSON, Listen, Versionsgleichheit, danach die Tests |
| `tools/test/` | Tests ohne Browser (Node): `harness.js` lädt das Skript aus `index.html` in eine Attrappe; `fragen.test.js` (Umzug alter Lernstände, alle Ansichten, Fragen ohne zweite richtige Antwort, Schreibantworten), `spiel.test.js` (Serie mit Serien-Schutz, Quests, Lernziel, Münzen, Lernpfad) |
| `tools/add-list.py` | Claudes Antwort (Buchfotos → JSON) als Lektion in `lists/` aufnehmen, feste Wort-Ids, `rev` hochzählen |
| `robots.txt`, `.nojekyll` | keine Suchmaschinen, GitHub Pages ohne Jekyll |

## Release-Regel

Bei jeder Änderung an `index.html` oder den Icons **beide Versionsnummern gleichzeitig** hochzählen, sonst bekommt das iPhone die alte Fassung aus dem Cache:

- `sw.js`: `const CACHE = 'wordbox-v2.0';`
- `index.html`: `const APP_VERSION = '2.0';` (steht in den Einstellungen und dient dem Update-Hinweis)

`tools/check.sh` bricht ab, wenn beide nicht übereinstimmen. Neue Listen in `lists/` brauchen keinen neuen Release.

Seit 2.0 merkt die App selbst, wenn es eine neuere Fassung gibt: `checkUpdate()` liest `sw.js` vom Server, vergleicht mit `APP_VERSION` und zeigt auf der Startseite „Version … ist da. Tippe hier zum Aktualisieren.“ (`ACT.update`). Der alte Weg (App schließen, zweimal öffnen) geht weiterhin.

## Aufbau von `index.html`

`<head>` mit Meta-Tags für iOS und der Schrift Nunito von Google Fonts (ohne Netz: `ui-rounded`, die runde Systemschrift des iPhones). Danach `<style>` mit Design-Tokens auf `:root` und Dunkelmodus über `prefers-color-scheme` und `[data-theme]` (Einstellung „Aussehen“: automatisch, hell, dunkel). Im `<body>` ein unsichtbares SVG-Sprite mit Tabler Icons (MIT), dann `#app`, `#toast` und ein `<script>` in einer IIFE. Gestaltungsregeln stehen unten unter „Design“.

Abschnitte im Skript (Kommentare `/* ---------- … ---------- */`):

1. **helpers** – `esc()` für jedes HTML aus Daten, `icon(name, 'fill')` → `<svg><use href="#i-name(-f)">`.
2. **words / mastery** – Karteikasten mit 5 Fächern. Wartetage je Fach aus `TEMPOS[prog.tempo]` (seit 1.12): `fast = [0,0,1,1,1,7]` (Standard, wie der Karteikasten der Familie: jeden Tag ein Fach, neu → Fach 5 in vier Tagen) oder `long = [0,0,1,3,7,14]`. Umschalten unter Erfolge → Einstellungen → Lerntempo; `reschedule(p, von, nach)` verschiebt dabei alle Termine. **Gerechnet wird in Kalendertagen** (`dayStart`, `dayShift` mit `setDate`, damit die Zeitumstellung nichts verschiebt): Fällig ist ein Wort ab 0 Uhr des Zieltags. Bis 1.11 lief die Wartezeit stundengenau, abends Geübtes war am nächsten Morgen nicht fällig. `grade(id, ok)`: richtig und fällig → ein Fach hoch (neu → Fach 2), in Fach 5 bleibt es und bekommt wieder 14 Tage Ruhe (seit 1.10); richtig, aber nicht fällig → nur Zähler `r`. Falsch → Fach 1 und sofort fällig. Gelernt = Fach ≥ 4. `isWeak` = schon mal falsch und Fach ≤ 2 (nur noch Filter-Chip „Fehlerwörter“). „Fällig“ (`dueWords`, Start-Karte, Eingestreute) = Wartezeit abgelaufen, Fach 1 zählt immer.
3. **levels & badges** – Level-Schwellen `lvlStart(n) = 50(n−1) + 25n(n−1)`, 30 Level-Namen in `LEVEL_NAMES` (Level 10 bleibt „Word Wizard“, danach „Legende N“), `levelInfo()` liefert auch `next` und `left`; Aufstieg wird in `finish()` erkannt (`xpStart` der Runde) und im Ergebnis gefeiert. 62 Abzeichen in `BADGES` (seit 2.0, vorher 43), in drei Stufen Bronze, Silber, Gold (`TIER`, Feld `g`), viele mit `pr: (p, c) => [ist, soll]` für Fortschrittsbalken; `badgeCtx()` liefert `learned, fach5, mastered, masteredNow, units, level, modes, nodes, gold`; jedes neue Abzeichen bringt 5 Münzen; `nextBadge()` = nächstgelegenes gesperrtes für den Start-Hinweis; `checkBadges()` läuft nach jeder Runde und einmal beim Start (rückwirkende Abzeichen). Erfolge-Seite sortiert: erreichte zuerst, dann gesperrte nach Fortschritt. **Serie** (seit 2.0): `streakInfo()` zeigt die Serie, `streakTick()` zählt sie bei einer fertigen Runde weiter. Ein verpasster Tag wird verziehen, wenn ein Serien-Schutz da ist (`prog.freezes`, höchstens 2, im Shop für 40 Münzen); verbraucht wird er erst bei der nächsten Runde, der Tag steht dann in `prog.frozen`. Eine schon verlorene Serie schreibt `dropLostStreak()` beim Start und vor dem Kauf als verloren fest.
4. **persistence** – `persist()` schreibt `S.prog`, `saveUnits()` schreibt `S.units`. `downloadFile()` für Sicherungen. Gegen beschädigte Daten: `migrateProg()` ersetzt Felder falscher Art durch die Vorgabe aus `freshProg()`, `cleanUnits()` räumt Lektionen auf, „Sicherung laden“ probiert die Datei erst im Speicher aus, und scheitert der Start trotzdem, zeigt `rescue()` (im Abschnitt boot) einen Rettungsbildschirm statt einer leeren Seite. Achtung: `migrateProg()` läuft, bevor die meisten Konstanten existieren (`QUESTS`, `lvlStart` …), dort also nichts davon benutzen.
5. **sound & speech** – iOS: Ton wird im ersten `touchend/click` freigeschaltet (`unlockAudio`), `navigator.audioSession.type = 'playback'`, damit der Stummschalter neuere iPhones nicht stummschaltet. `say()` muss **synchron** aus dem Tipp-Handler laufen, sonst blockiert iOS die Sprachausgabe. Kein `setTimeout` davor. Die Sprachausgabe ignoriert die Audio-Sitzung: Bei Stummschalter an bleibt sie auf iOS stumm, die Töne nicht. Entscheidung Thomas 11.10.: kein Umweg, nur Hinweis in den Einstellungen und beim Ton-Test (ein Versuch mit lautlosem `<audio>` in 1.6 hat nicht geholfen).
6. **confetti & toast**
7. **question building** – `MODES` (mix, de-en, en-de, past, opp, gap, type), Gewichte `MIX_W`. Falsche Antworten: `pickOpts()` nimmt bevorzugt dieselbe Lektion und Wortart plus das ähnlichste Wort (Bigramm-Ähnlichkeit). Simple Past: `pastWrong()` erzeugt typische Fehler (choosed, planed, Grundform, -ing, und `pp` als Ablenker, falls vorhanden). Doppelformen stehen in `past` mit Leerzeichen um den Schrägstrich („was / were“, „burnt / burned“), damit Vorlesen und Schreiben sie trennen; `pastAlts(w)` zerlegt sie, die Auswahlfrage nimmt die erste Form und bietet keine der richtigen Formen als falsch an (seit 1.13).
8. **typed answers** – `checkTyped()`: normalisiert (`to`, `sb/sth`, Klammern und Klammerzeichen auch in der Eingabe (seit 1.14), `your→one's`), Varianten aus `/` und `(= …)`, 1 Tippfehler erlaubt ab 4 Buchstaben.
9. **quiz flow** – Runde aus Auswahl über `composeRound(pool, n)` mit festen Anteilen (seit 1.10, vorher eine Gewichtung `prio()`, bei der Fehlerwörter alles verdrängten): höchstens die Hälfte fällige Wörter (niedriges Fach und länger überfällig zuerst), dann neue Wörter in Buchreihenfolge, dann weitere fällige, zuletzt bekannte nach ältester Abfrage. Heute richtig beantwortete, noch nicht fällige Wörter kommen am selben Tag nicht wieder. Plus 1–3 eingestreute Wörter (`extra`), die fällig sind, aus nicht gewählten Lektionen. Falsch beantwortete Frage kommt einmal 3 Fragen später wieder. XP (seit 1.3 knapp, `econ: 2`): 2 pro richtige Antwort, 3 beim Schreiben, +1 für Extra-Wörter, +5 Rundenbonus, +10 fehlerfrei (ab 5 Fragen). Seit 1.14 zusätzlich: +2 bei jeder 5er-Combo (5, 10, 15 …), Serien-Bonus = Serientage (max. 7) je fertige Runde ab 2 Tagen, +2 je Wort, das in der Runde Fach 4 erreicht (`Q.settled`), +30 einmalig je Lektion, deren Wörter alle in Fach ≥ 4 sind (`prog.mastered`). Das Ergebnis listet die Boni (`R.extras`). Zähler `earlyRounds`, `weekendRounds`, `modesUsed` für Abzeichen. Eine fehlerfreie 10er-Runde bringt etwa 40 XP, das Tagesziel „Normal“ (150) braucht also rund vier fehlerfreie Runden. `migrateProg()` rechnet Lernstände ohne `econ` einmalig um (XP ÷ 5, Ziel auf neue Stufe). Serie zählt nur bei fertig gespielter Runde. Seit 2.0: Runden-Boni und Zähler gibt es erst ab 5 Antworten. Tagesziel und Quests werden schon in `settle()` gebucht, sobald eine Antwort sie erreicht (die Runde merkt sie sich in `Q.coins`, `Q.goalHit`, `Q.qDone` für das Ergebnis); `finish(quit)` bucht den Rest genau einmal (Bonus-XP, Serie, Level über `prog.lvl`, Münzen, Abzeichen) und baut `S.result` mit `steps`: Zusammenfassung → Serie → Level → Quests → Abzeichen → Fehlerliste; nur Schritte, die etwas zu zeigen haben. Wer abbricht, landet auf der Startseite, außer es gab etwas zu feiern.
10. **artwork** – Coach „Bit“: eine Manga-Figur mit großem Kopf und blauen Haaren, selbst gezeichnet als SVG (`bit(mood, skin)`; Stimmungen happy, cheer, oops, think, wow, sleep). Dazu sechs Skins in `OUTFITS` mit Farben in `SKINS` und Seltenheit `tier` (Ninja, Neko, Pro-Gamer, Magier, Samurai, Drachenkrieger). Im Lernstand heißen die Felder weiter `outfit` und `outfits`. **Keine bekannten Manga- oder Spielfiguren nachzeichnen** (Urheberrecht, das Repo ist öffentlich), nur eigene Entwürfe. Außerdem farbige Bilder (`art(name)`: Flamme, Münze, Truhe, Krone …).
11. **today's counters, coins, daily quests** – `dayStats()` = was heute passiert ist (`prog.today`, beginnt um Mitternacht neu). Münzen (`addCoins`): fehlerfreie Runde 2, Tagesziel 10 (`payGoal`, einmal je Tag über `prog.goalDay`), Quest 5, Tagestruhe 15, Abzeichen 5, Level-Aufstieg 20, Lektion gemeistert 25. Ausgeben im Shop: Serien-Schutz 40, Skins 30 bis 250. `QUESTS` und `questsToday()`: drei Quests je Tag, über das Datum ausgewürfelt (`seedRand`), also den ganzen Tag gleich; `checkQuests()` zahlt jede einmal.
12. **learning path** – `pathNodes(u)` teilt eine Lektion in Stationen von etwa 7 bis 14 Wörtern (neue Buchseite oder neuer Abschnitt). Stationen sind nur eine Sicht auf die Wörter, gespeichert wird nichts. `nodeInfo()` → Zustand `new`, `go`, `gold` (alle in Fach ≥ 4), `legend` (alle in Fach 5). `smartPlan()` bestimmt, was „Weiter lernen“ startet: offene Lernziel-Wörter zuerst, sonst Mischung aus Fälligem und Neuem.
13. **feel** – `haptic(kind)` (Android vibriert; iOS ab 18 tickt über einen versteckten Schalter `<input type=checkbox switch>`; sonst nichts), `fx(name)` / `fxc(name, klasse)` für Animationen, die genau einmal laufen sollen, `transit(fn, art)` für Bildschirmwechsel mit View Transitions (Safari ab 18, sonst ohne Übergang; `fn` läuft genau einmal und spätestens nach 300 ms), `applyTheme()`, `checkUpdate()`.
14. **views** – Rahmen (`topbar`, `navbar`), Start (`viewHome` mit Bit, „Weiter lernen“, Lernziel, Tagesziel und Woche, Tagesquests, Lernpfad), `viewPractice`, `viewVocab`, `viewAwards`, `viewShop`, `viewSettings`, `viewQuiz`, `viewResult`, `viewOnboard`, `viewWhatsNew`, `viewSheet`. Alles per Template-String und `render()` → `app.innerHTML`. `render()` startet danach Zähler (`[data-count]`) und Balken (`[data-grow]`).
15. **adding vocabulary** – `viewImport`, `parseText()` (JSON, JSON in ```-Block, oder Zeilen `en ; de ; past ; Beispielsatz`, auch Tab, ` = `, ` – `), `importPrompt()` (Anleitung für Claude zum Auslesen von Buchfotos).
16. **lessons from the server** – `syncLists()` lädt `lists/index.json` beim Start und nach 10 min im Hintergrund, die Listen selbst mit `?rev=N` (seit 2.0, damit kein alter Stand aus dem Cache als neuer gilt). Neue `id` → Lektion anhängen und auswählen; kommen mehrere auf einmal, werden alle ausgewählt (seit 1.13). Bei höherer `rev` werden neue Wörter mit ausgewählt, wenn die Lektion vorher komplett ausgewählt war (seit 1.15). Höhere `rev` → Lektion ersetzen. Vom Kind gelöschte Server-Lektionen stehen in `prog.removedLists` und kommen nicht wieder.
17. **learning targets (Lernziele)** (steht im Skript weiter oben, hinter words / mastery) – `prog.targets[]`: `{ id, title, due: 'YYYY-MM-DD', ids[], base{wortId: r bei Anlage}, need: 2, created, done }`. Ein Wort gilt als geübt, wenn `w[id].r - base[id] >= need`. `targetInfo(t)` liefert `done/open/total/left/todayDue/state` (`ok`, `behind`, `last`, `late`, `done`, `empty`); die Tagesmenge `todayDue` wird je Tag festgehalten (`t.day`, `t.day0`) und kann 0 erreichen; „im Plan“ heißt: erledigte Wörter ≥ anteilig vergangene Tage seit Anlage. Anlegen in `viewPractice` aus der aktuellen Auswahl (`S.tform`), Karten in `viewHome` über dem Tagesziel (`targetCard`), erledigte Ziele bleiben dort 2 Tage. `checkTargets()` in `finish()` setzt `done`, Abzeichen `target`. `targetReminder()` beim Start zeigt einen Toast bei Rückstand, letztem Tag oder Überfälligkeit. `updateBadge()` setzt die Zahl am App-Icon (`navigator.setAppBadge`, iOS zeigt sie erst nach Mitteilungs-Erlaubnis, die `askBadgePermission()` beim ersten Ziel anfragt; es werden nie Mitteilungen gesendet). Schnelle Runde und „Jetzt üben“ nehmen offene Zielwörter ohne Extras.
18. **events / boot** – Ereignis-Delegation über `data-act` (click, Tabelle `ACT`), `data-ch` (change, `CH`), `data-in` (input, `IN`). Tastatur 1–4 und Enter im Quiz. `settleUp()` läuft beim Start und wenn die App wieder sichtbar wird (Tageswechsel, Tagesziel, Abzeichen, Update-Hinweis).

Theme 1 ist zusätzlich als `SEED` eingebettet, damit die App beim allerersten Start auch offline Vokabeln hat.

## Datenmodell

**Wort** (in `lists/*.json` und `S.units[].words`):

```json
{ "id": "t1-15", "en": "to choose", "de": "(aus)wählen", "pos": "verb",
  "ipa": "/tʃuːz/", "past": "chose", "pp": "chosen",
  "ex": "He is choosing a book to read.", "gap": "choosing",
  "opp": "", "sec": "A", "page": "225", "note": "simple past: chose /tʃəʊz/", "opt": false }
```

Pflicht: `en`, `de`. `pos` ∈ verb, noun, adj, adv, phrase, other. `gap` muss wörtlich in `ex` vorkommen. `opt: true` = fakultatives Wort (°). `page` = Buchseite als Ziffern (seit 1.9): In „Üben“ gibt es je Seite einen Schalter, der alle Wörter der Seite an- oder abwählt (`ptoggle`), sobald eine Lektion mehr als eine Seite hat; die Gruppenköpfe zeigen „S. 225 · Abschnitt B2“.

**Wichtig:** Der Lernstand hängt an der Wort-`id`. Ids nie ändern. Fehlt die `id`, vergibt die App `<listen-id>-001`, `-002` … nach Position. Wer in eine solche Liste etwas einfügt, verschiebt alle Ids danach. Darum neue Listen immer mit festen Ids anlegen.

**Liste** (`lists/<datei>.json`): `{ "title", "pages", "words": [...] }`
**Index** (`lists/index.json`): `{ "lists": [ { "id", "title", "file", "rev" } ] }`

**Lernstand** `localStorage['wordbox.prog.v1']`: seit 2.0 zusätzlich `haptics, theme, goalDay, speedRounds, lvl (höchstes schon bezahltes Level), coins, coinsEarned, freezes, freezeUsed, frozen{tag: 1}, roundDays{tag: 1}, since2, outfit, outfits{id: true}, today{…Tageszähler}, quests{day, list, done, chest}, questsDone, chests, targetsDone, v2` (alles in `freshProg()` mit Vorgabe, `migrateProg()` ergänzt fehlende Felder; nichts Altes wird umbenannt oder gelöscht). Davor: `econ, tempo, name, goal, sound, speak, xp, earlyRounds, weekendRounds, modesUsed{mode: true}, mastered{unitId: datum}, days{YYYY-MM-DD: xp}, streak, best, last, rounds, perfect, typedRight, pastRight, extraRight, bestCombo, photos, goalDays, badges{id: datum}, w{wortId: {l: fach, r, x, s, d: fällig-ms}}, sel[ids], mode, len, onboarded, removedLists[], targets[] (siehe 17), updatedAt`.
**Lektionen** `localStorage['wordbox.units.v1']`: Array von Lektionen.
**Sicherung**: `{ app: "wordbox", v: 1, exported, prog, units }`.

## Lokal testen

```bash
cd ~/Downloads/wordbox
tools/check.sh
python3 -m http.server 8080      # dann http://localhost:8080
```

Der Service Worker läuft nur unter https (also erst auf GitHub Pages). Auf dem iPhone testen über die Pages-Adresse. Ton, Sprache, Haptik und die Bildschirmübergänge verhalten sich auf dem echten iPhone anders als am Mac.

Wer Lernlogik, Serie, Quests oder Münzen anfasst, ergänzt einen Fall in `tools/test/`. Die Tests laufen mit `tools/check.sh` mit.

## Design (seit 2.0)

- **Tokens** auf `:root`, dunkel überschrieben. Farbe nie direkt in Regeln schreiben, außer Weiß auf den Lektionsfarben.
- **Lesbarkeit:** Text braucht 4,5:1 gegen seinen Grund, Rahmen von Eingaben und Antwortkarten 3:1. Dafür gibt es eigene Tokens: `--flame-text`, `--gold-text` (farbige Zahlen), `--good-btn` / `--bad-btn` mit `--on-good` / `--on-bad` (Knöpfe, Zähler), `--edge` (Rahmen von Eingaben), `--ink-3` (leiser Text). Die leuchtenden `--gold`, `--flame`, `--good`, `--bad` sind nur für Flächen und Bilder, nicht für Schrift. Text nicht per `opacity` abschwächen.
- **Lektionsfarben** `.hue-royal/.hue-rose/.hue-green/.hue-violet/.hue-orange/.hue-teal` tragen alle weiße Schrift mit 4,5:1.
- **Knöpfe** mit Kante unten (`box-shadow: 0 5px 0`), beim Drücken sinken sie ein. Tippflächen mindestens 44 px.
- **Bewegung:** alle `@keyframes`-Animationen stehen in `@media (prefers-reduced-motion: no-preference)`. Animiert werden `transform` und `opacity`, dazu die Breite von Fortschrittsbalken. Was einmal laufen soll, bekommt seine Klasse über `fx()`, sonst startet es bei jedem `render()` neu.
- **Kopfzeile:** Der Schriftzug „Voc a Bit“ steht nur neben dem Logo, solange er passt (Umbruch in eine abgeschnittene zweite Zeile), sonst bleibt das Logo allein.

## Icons ergänzen

Farbige Bilder (Flamme, Münze, Truhe …) stehen als SVG-Text in `ART` im Abschnitt artwork und werden mit `art('name')` eingesetzt. Für Linien-Icons: Im Sprite `<defs>` ein `<symbol id="i-NAME" viewBox="0 0 24 24">` mit den Pfaden des Tabler-Outline-Icons einfügen, innen `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:var(--sw,2)">`. Für gefüllte Variante zusätzlich `i-NAME-f` und den Namen in `FILLED` aufnehmen.
