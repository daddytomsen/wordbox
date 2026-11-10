# Übergabe an Claude Code – Voc a Bit

Stand: 10.11.2026 · Version 2.0 · Projektordner `~/Downloads/wordbox` · live unter https://daddytomsen.github.io/wordbox/

Lies zuerst `CLAUDE.md` (Aufbau, Regeln, Datenmodell). Diese Datei sagt, was fertig ist und was als Nächstes zu tun ist.

## Ziel

Thomas' Sohn (Klasse 6) übt seine Englisch-Vokabeln mit einer eigenen App auf seinem iPhone. Die App läuft eigenständig ohne Claude, startet auch offline und bekommt neue Lektionen über den Ordner `lists/` im GitHub-Repository.

## Fertig

- **Version 2.0 (10.11.2026, Wunsch Thomas: flüssiger, mehr wie Duolingo, mehr Anreize; Lernstand und Karteikasten bleiben):** komplette neue Oberfläche und eine Fehlerdurchsicht des gesamten Codes.
  - Neu zum Spielen: Coach „Bit“ als Manga-Figur mit großem Kopf und blauen Haaren (Wunsch Thomas 10.11., der Sohn ist Manga- und Fortnite-Fan; eigene Zeichnung, keine bekannte Figur) mit sechs Stimmungen, Lernpfad mit Stationen je Lektion (Krone, wenn alle Wörter sitzen), „Weiter lernen“ als ein Knopf, drei Tagesquests mit Tagestruhe, Münzen und Shop (Serien-Schutz für 40 Münzen, sechs blaue Manga-Skins für Bit in den Stufen Selten, Episch, Legendär: Ninja, Neko, Pro-Gamer, Magier, Samurai, Drachenkrieger), Ergebnis als Abfolge (Zusammenfassung, Serie, Level, Quests, Abzeichen, Fehlerliste), 62 Abzeichen in Bronze, Silber, Gold, Töne mit steigender Tonhöhe bei Combos, leichtes Tippen unter dem Finger (iPhone ab iOS 18), Bildschirmübergänge, Einstellung „Aussehen“ (automatisch, hell, dunkel), Hinweis auf der Startseite, wenn eine neuere Version bereitliegt.
  - Unverändert: Karteikasten mit 5 Fächern und Lerntempo, XP-Regeln, Level, Lernziele, Seiten-Schalter, Listen-Import, Sicherung, alle Lektionen. Der alte Lernstand wird beim ersten Start ergänzt, nichts wird umbenannt oder gelöscht; alte Abzeichen bleiben, neue kommen rückwirkend dazu.
  - Behobene Fehler (Auswahl): zweite richtige Antwort unter den falschen Antworten (Wörter mit gleicher Übersetzung), Tippfehler-Toleranz ließ ein anderes echtes Wort durchgehen, korrigierte Lektion kam wegen Cache nicht an, Service Worker konnte Caches anderer Apps derselben Pages-Adresse löschen und hing bei schlechtem Netz, Boni für Mini-Runden aus zwei Wörtern, Tagesziel doppelt gezählt, Formulareingaben gingen beim Neuzeichnen verloren, Belohnungen gingen beim Abbrechen still verloren, Wochenanzeige widersprach der Serie, Tageswechsel bei offener App, falsche Antwort kam am Rundenende sofort wieder, Import mit gemischten Trennzeichen, Zurücksetzen vergaß gelöschte Lektionen und Lerntempo.
  - Lesbarkeit geprüft: Text mindestens 4,5:1, Rahmen von Eingaben 3:1, in hell und dunkel (automatischer Durchlauf über alle Ansichten). Animationen nur ohne „Bewegung reduzieren“.
  - Tests ohne Browser in `tools/test/`, laufen mit `tools/check.sh`.
  - **2.0 ist nicht auf dem echten iPhone getestet** (nur im Browser am Mac in iPhone-Größe). Checkliste siehe Aufgabe 6.
- App komplett in `index.html`: Start (Tagesziel, Wochenserie, Level, Lektionen), Üben (7 Abfragearten, Wörter selbst auswählen, Filter), Vokabeln (Karteikasten, Suche, Vorlesen, Lektion löschen), Erfolge (Kacheln, 15 Abzeichen, Einstellungen, Sicherung).
- Lernlogik: Karteikasten mit 5 Fächern, eingestreute schwache Wörter, Wiederholung falscher Antworten in derselben Runde, XP, Serie, Combo, Konfetti.
- Theme 1 „Back to Camden Town“ (S. 224–226, seit 11.10. mit S. 224, rev 2): 101 Wörter und 12 Redemittel mit Lautschrift, Beispielsätzen, Simple Past und Gegenteilen. In `lists/theme1-camden-town.json` und als `SEED` in `index.html`.
- Neue Vokabeln in der App: Liste einfügen, Datei öffnen (auch iCloud Drive), Anleitung für Claude kopieren (Buchfotos → JSON).
- Lektionen über `lists/index.json` mit `rev` für Korrekturen.
- Home-Bildschirm-App: Manifest, Icons, Service Worker (offline), Safe-Areas.
- Ton-Korrektur für iOS (Freischalten beim ersten Tippen, `audioSession`, Sprachausgabe synchron) und Knopf „Ton testen“.
- `tools/check.sh` geprüft: JS-Syntax ok, JSON ok, Versionen gleich.
- Git-Repo `daddytomsen/wordbox` (öffentlich), GitHub Pages aktiv, alle drei Adressen antworten mit 200 (11.10.).
- Sicherung speichern nutzt auf iOS das Teilen-Menü (`navigator.share` mit Datei), sonst Download wie bisher (Version 1.2).
- `tools/add-list.py` nimmt Claudes Antwort als Lektion auf (siehe Aufgabe 4), mit Testlauf geprüft.
- XP knapper (Version 1.3, Wunsch Thomas 11.10.): 2 XP pro richtige Antwort, 3 beim Schreiben, +1 Extra-Wort, Rundenbonus 5, fehlerfrei +10. Tagesziele 100/150/250/400. Eine fehlerfreie 10er-Runde bringt etwa 40 XP, „Normal“ braucht rund vier davon. Alte Lernstände werden einmalig umgerechnet (`migrateProg`, Marker `econ: 2`), im Browser gegen die Pages-Adresse geprüft.
- Lernziele (Version 1.8, Wunsch Thomas 11.10.): Wortauswahl + Termin, jedes Wort zweimal richtig; Karte auf dem Start mit Ampel (im Plan / Rückstand / letzter Tag / überfällig), Hinweis beim Öffnen, Zahl am App-Icon (braucht einmalig Mitteilungs-Erlaubnis, keine Push-Nachrichten), Abzeichen „Ziel erreicht“. Lokal im Browser durchgespielt, am iPhone bestätigt 11.10. (Datumsfeld und Icon-Zahl funktionieren).
- Theme 2 S. 228 ergänzt (09.11., rev 2, jetzt 80 Wörter, Ids 043–080, alte Ids unverändert): Abschnitt 3 weiter bis „toffee apple“, dann 4, 6, A1, A2. Gegensätze-Kasten: „a lot (of) ↔ a few“ als `opp` ergänzt, „to remember ↔ to forget“ stand schon in Theme 1, „start ↔ end“ gibt es nicht als Wörter. „to burn“, „to blow up“, „to fight“ stehen auch in Irregular verbs. Version 1.15: reine Zahlen als „Abschnitt 4“, und bei einem Lektions-Update kommen neue Wörter in die Auswahl, wenn die Lektion vorher komplett ausgewählt war.
- Motivation (Version 1.14, Befund Thomas 02.11.: Level 10 „Word Wizard“ seit Wochen, Abzeichen alle da, Langeweile): 30 Level-Namen (Level 10 bleibt „Word Wizard“, 11 „Tube Driver“ …), Aufstiegsfeier im Ergebnis, 43 Abzeichen mit Fortschrittsbalken und „Nächstes Abzeichen“ auf dem Start, rückwirkende Abzeichen beim ersten Start. Neue XP: Combo-Bonus +2 je 5er-Combo, Serien-Bonus (Serientage, max. 7) je Runde, +2 je Wort, das Fach 4 erreicht, +30 je gemeisterter Lektion; Ergebnis zeigt die Aufschlüsselung. Bugfix: „to ask (for sth)“ mit Klammern getippt galt als falsch (Klammern wurden in der Eingabe nicht entfernt).
- Theme 2 „Celebrations“ S. 227 (42 Wörter, `lists/theme2-celebrations.json`) und „Irregular verbs“ S. 292 (41 Verben „to be“ bis „to know“, `lists/irregular-verbs.json`), beide rev 1, 02.11. aus Fotos von Thomas. **Past participle bewusst weggelassen** (Wunsch Thomas, soll später kommen: dann `pp` ergänzen und `rev` hochzählen, Ids bleiben). Abschnittsmarken auf S. 227 waren am Fotorand angeschnitten; das Foto von S. 228 zeigt vollständige Marken „4“, „6“, „A1“, „A2“, daher auf S. 227 korrigiert zu ohne Marke (Anfang), „2“ ab vlog, „3“ ab Diwali (rev 2). Dazu Version 1.13: Doppelformen im Simple Past („was / were“) in der Auswahlfrage korrekt, mehrere neue Lektionen werden zusammen ausgewählt, Gruppenköpfe ohne leere Abschnitte.
- Lerntempo und Kalendertage (Version 1.12, Befund Thomas 12.10.: morgens geübte Wörter stiegen nicht auf, Wartezeiten zu lang): Fälligkeit jetzt ab 0 Uhr des Zieltags statt stundengenau; Einstellung „Lerntempo“ mit „Schnell“ (Standard, jeden Tag ein Fach, Fach 5 nach vier Tagen, dort 7 Tage Ruhe) und „Langzeit“ (1, 3, 7, 14). Bestehende Stände werden beim Laden einmal umgerechnet (`tempo` fehlt → von `long` nach `fast`). Lokal geprüft: Stand „gestern Abend geübt“ ist morgens fällig, zweite Runde am selben Tag befördert nicht, Umschalten verschiebt Termine hin und zurück.
- Knopf „N neue Wörter üben“ im Karteikasten (Version 1.11): startet eine Runde nur mit nie abgefragten Wörtern, unabhängig von Auswahl und Lernziel. Anlass: 18 Wörter blieben „neu“, obwohl viel geübt wurde (alte Rundenlogik + aktives Lernziel lenkt die Schnelle Runde nur auf Zielwörter).
- Rundenlogik (Version 1.10, Befund Thomas 11.10.: zu viele Wiederholungen, zu wenig Neues): Zusammenstellung mit festen Anteilen (max. Hälfte fällig, dann neu in Buchreihenfolge), heute schon richtige Wörter kommen nicht nochmal; Fach 5 bekommt nach richtiger Antwort wieder 14 Tage Ruhe (vorher dauerhaft fällig). Lokal geprüft.
- Seiten-Schalter (Version 1.9, Wunsch Thomas 11.10.): jedes Wort trägt `page`, in „Üben“ wählt ein Chip je Seite alle Wörter der Seite an oder ab. Theme 1 rev 3: S. 224 sicher (t1-a01…a39), Grenze 225/226 von Thomas bestätigt 11.10.: S. 226 beginnt mit „to ask (for sth)“ (rev 4). Anleitung für Claude und `add-list.py` kennen `page`.
- Umbenennung in „Voc a Bit“ (Version 1.4, 11.10.): Titel, Manifest, Kopfzeile, Onboarding, Sicherungstexte, Dateiname der Sicherung `voc-a-bit-sicherung-*.json`. Neues Icon: angebissene Vokabelkarte, Quelle `icon.svg`, PNGs randlos (iOS füllt transparente Ecken schwarz). Interne Schlüssel, Cache-Präfix und Repo-Name bleiben `wordbox`. Wer die App schon auf dem Home-Bildschirm hat, muss sie einmal entfernen und neu hinzufügen, damit iOS Name und Icon neu liest.
- Icon endgültig (Version 1.5, Entwurf Thomas): Union Jack mit Vokabelkarte „a“ und gelbem Haken, `icon.svg` → drei PNGs; Kopfzeilen-Logo angepasst. Bildentwürfe (Bulldogge) liegen lokal in `entwurf/`, nicht im Repo.

**Nicht auf echtem iPhone getestet.** Alles oben ist nur im Code geprüft.

## Aufgaben

### 1. Git und GitHub Pages einrichten – erledigt 11.10.

Erst nach Freigabe durch Thomas pushen. Das Repo muss öffentlich sein (Pages kostenlos), GitHub-Konto `daddytomsen`.

```bash
cd ~/Downloads/wordbox
tools/check.sh
git init -b main && git add -A && git commit -m "Word Box 1.1"
gh repo create wordbox --public --source . --push
gh api -X POST repos/daddytomsen/wordbox/pages -f "source[branch]=main" -f "source[path]=/"
```

Fertig, wenn:
- `https://daddytomsen.github.io/wordbox/` die App zeigt (nach 1–2 Minuten),
- `https://daddytomsen.github.io/wordbox/lists/index.json` erreichbar ist,
- `https://daddytomsen.github.io/wordbox/sw.js` mit Status 200 kommt.

### 2. Test auf dem iPhone (Thomas, Checkliste ausgeben)

1. Adresse in Safari öffnen → Teilen → „Zum Home-Bildschirm“ → über das Icon starten.
2. Erfolge → „Ton testen“: Melodie und englische Stimme, einmal mit Stummschalter an, einmal aus.
3. Eine Runde spielen: Ton bei richtig/falsch, Vorlesen nach jeder Antwort.
4. Flugmodus an, App neu starten: muss laufen.
5. Neue Test-Lektion in `lists/` pushen, App neu öffnen: Meldung „Neue Lektion“.
6. Erfolge → „Sicherung speichern“: Was passiert? (siehe Aufgabe 3)

Ergebnisse in diese Datei unter „Testprotokoll“ eintragen. Falls kein Ton: Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Englisch → eine britische Stimme laden. Ist eine en-GB-Stimme da, nimmt die App sie automatisch.

### 3. Sicherung speichern auf dem iPhone verlässlich machen – im Code erledigt 11.10., Test am iPhone offen

`downloadFile()` nutzt `<a download>` mit Blob. In einer Home-Bildschirm-App auf iOS klappt das oft nicht oder öffnet nur eine Vorschau.

Umsetzen: Wenn `navigator.canShare?.({ files: [file] })` true ist, `navigator.share({ files: [new File([json], name, { type: 'application/json' })] })` verwenden (Teilen-Menü → „In Dateien sichern“). Sonst der bisherige Download. `AbortError` (Nutzer bricht ab) ohne Fehlermeldung schlucken.

Fertig, wenn auf dem iPhone in der Home-Bildschirm-App „Sicherung speichern“ das Teilen-Menü öffnet und die Datei in iCloud Drive landet, und „Sicherung laden“ sie wieder einspielt.

### 4. Hilfsskript für neue Lektionen – erledigt 11.10.

Gleiches Wort (`norm_en()`, Entscheidung Thomas 11.10.): Groß-/Kleinschreibung, Apostroph-Form und Leerzeichen egal, „to “ vor Verben zählt nicht, Klammerzusätze zählen.

`tools/add-list.py <claude-antwort.json|.txt> --id theme2 [--title "…"]`:
- liest Claudes Antwort (reines JSON oder JSON im ```-Block),
- vergibt feste Wort-Ids `<id>-001` … (vorhandene `id` behalten),
- prüft Pflichtfelder, `pos`-Werte, dass `gap` in `ex` vorkommt (sonst leeren), Dubletten gegen alle bestehenden Listen (Warnung),
- schreibt `lists/<id>.json` und hängt den Eintrag mit `rev: 1` an `lists/index.json` an,
- bei schon vorhandener `id`: Liste ersetzen und `rev` hochzählen, bestehende Wort-Ids anhand von `en` wiederverwenden, damit der Lernstand bleibt.
- Nur Python-Standardbibliothek. Danach `tools/check.sh`.

### 5. Fehlende Seite 224 (Theme 1, A5–A9) – erledigt 11.10.

39 Wörter von S. 224 (zwei Zeilen vor A5 als `sec: "A"`, dann A5–A9) mit festen Ids `t1-a01` … `t1-a39` **vor** `t1-01` eingefügt, `rev` auf 2, `pages` auf „S. 224–226“. Bestehende Ids unverändert. `SEED` in `index.html` bewusst nicht nachgezogen (kommt per `rev` vom Server). Drei fakultative Wörter (°) als `opt: true`.

### 7. Funde aus der Fehlersuche vom 10.11. – erledigt 10.11.

Eine unabhängige Durchsicht fand nichts, was den Lernstand gefährdet, aber 15 Stellen. Alle sind behoben und in `tools/test/spiel.test.js` abgesichert (Block „findings of the review“):

- Quest „richtige in Folge“ war mit 10er-Runden nicht zu schaffen (jetzt 5, 8, 10).
- Level-Aufstieg wird über `prog.lvl` genau einmal bezahlt, auch wenn die App mitten in der Runde geschlossen wurde.
- Tagesziel und Quests werden mit der Antwort gebucht, die sie erreicht (`settle()`), nicht erst am Rundenende. Mitternacht oder Schließen kostet nichts mehr.
- Eine verlorene Serie wird als verloren festgeschrieben (`dropLostStreak()`); ein danach gekaufter Serien-Schutz holt sie nicht zurück.
- Beschädigte Daten: `migrateProg()` ersetzt Felder falscher Art durch Vorgaben, `cleanUnits()` räumt Lektionen auf, „Sicherung laden“ probiert die Sicherung erst im Speicher aus, und falls der Start doch scheitert, zeigt `rescue()` einen Rettungsbildschirm (Lernstand als Datei sichern, neu versuchen, zurücksetzen mit zwei Tipps).
- `transit()` wartet nicht mehr auf ein gezeichnetes Bild (nach 300 ms wechselt der Bildschirm in jedem Fall, und nie doppelt).
- Schreibantwort bleibt erhalten, wenn der Abbrechen-Dialog aufgeht. Namensfeld in den Einstellungen verschluckt den nächsten Tipp nicht mehr.
- Quest „Lerne N neue Wörter“ zählt die erste richtige Antwort eines Wortes, auch im zweiten Versuch.
- „Sicherung laden“ zahlt für neue Abzeichen die Münzen. Alle Fragen beantwortet und dann X = fertige Runde. Stations-Knopf nennt die echte Fragenzahl. Flamme am Update-Tag. Abzeichen-Blatt ohne Division durch null. `sw.js` mit try/catch beim Umziehen der Schriften.

### 6. Test von Version 2.0 auf dem iPhone (Thomas) – offen

**Vorher:** In der alten App Erfolge → „Sicherung speichern“. Dann App schließen und zweimal öffnen, bis unter Erfolge → Einstellungen „Version 2.0“ steht.

1. Start: Begrüßung „Voc a Bit ist neu“, Level, XP und Serie wie vorher? Karteikasten (Vokabeln) mit denselben Zahlen wie vorher?
2. „Weiter lernen“: eine Runde spielen. Töne, Vorlesen, Kippen des Antwortfelds, „Weiter“ gut erreichbar über dem unteren Rand?
3. Spürt man ein leichtes Tippen bei richtig und falsch (nur iOS 18 oder neuer, sonst nichts)?
4. Ergebnis: Schritte nacheinander, Konfetti, Münzen in der Kopfzeile gestiegen?
5. Lernpfad: Station antippen, Sprechblase, „Üben“ startet die Wörter dieser Station.
6. Erfolge → Shop: einen Skin freischalten, Bit sieht überall so aus. Zurück auf „Bit“ wechseln. Serien-Schutz kaufen.
7. Einstellungen → Aussehen: hell und dunkel umschalten.
8. Flugmodus an, App neu starten: muss laufen, Schrift darf dann etwas anders aussehen.
9. Gehen die Bildschirmwechsel flüssig, ruckelt etwas, flackert etwas?

Ergebnisse ins Testprotokoll. Rückweg, falls etwas Schlimmes ist: lokaler Git-Tag `v1.15` (Commit 051252b).

## Nicht ohne Rückfrage

- Kein Framework, kein Build-Schritt, keine Aufteilung in mehrere Dateien.
- Kein Server, keine Accounts, kein Tracking, keine Push-Nachrichten.
- Lernstand-Format (`wordbox.prog.v1`) nicht inkompatibel ändern. Wenn nötig: Migration beim Laden schreiben.
- Design und Texte nicht umbauen, ohne Thomas zu fragen.

## Hinweise

- iOS löscht Website-Daten in Safari nach 7 Tagen ohne Besuch. Für Apps auf dem Home-Bildschirm gilt das nicht. Darum immer über das Icon starten, nicht im Safari-Tab.
- Home-Bildschirm-App und Safari-Tab haben getrennte Speicher. Lernstand wechselt nur per Sicherung.
- iCloud-Sync ist für eine Web-App nicht möglich; geht nur mit nativer App.
- Die Claude-Version (mit Foto-Erkennung, Fortschritt im Claude-Konto) läuft getrennt als Artifact: https://claude.ai/artifact/EQfJtuSWGbDFh3uhjRMZff. Kein gemeinsamer Lernstand.

## Testprotokoll

| Datum | Gerät / iOS | Ergebnis |
|---|---|---|
| 10.11.2026 | Mac, Browser in iPhone-Größe, Version 2.0 | Alle Ansichten in hell und dunkel durchgespielt, Tests bestanden. iPhone-Test offen (Aufgabe 6). |
| 11.10.2026 | iPhone (Thomas), Version 1.5 | Töne ok mit und ohne Stummschalter. Sprachausgabe bei Stummschalter an stumm. Umweg in 1.6 (lautloses `<audio>`) hat nicht geholfen → in 1.7 entfernt, stattdessen Hinweis in Einstellungen und Ton-Test. |
| 11.10.2026 | iPhone, Version 1.8 | Lernziel: Datumsfeld und rote Zahl am Icon funktionieren. |
| 02.11.2026 | iPhone, Version 1.13 | Befund: Schreibantwort „to ask (for sth)“ als falsch gewertet → in 1.14 behoben. Level seit Wochen „Word Wizard“ (Namensliste endete bei 8) → 1.14. |
| 14.10.2026 | iPhone, Version 1.12 | Lerntempo „Schnell“ und Kalendertage: Wörter wandern jetzt täglich ins nächste Fach. Sicherung vor dem Update wurde empfohlen. |
| 11.10.2026 | iPhone, Version 1.11 | Knopf „neue Wörter üben“ da, die 18 nie abgefragten Wörter sind durch. Rundenlogik 1.10 und Fach-5-Ruhezeit im Einsatz. |
| 11.10.2026 | iPhone, Version 1.9 | Seiten-Schalter in „Üben“ funktionieren. Hinweis: Nach einem Update muss die Home-Bildschirm-App einmal komplett geschlossen und zweimal neu gestartet werden, sonst zeigt sie noch die alte Fassung. |
| 11.10.2026 | iPhone (Sohn), Bildschirmzeit | Safari war über „Erlaubte Apps“ gesperrt → Home-Bildschirm-App startet nicht. Lösung bestätigt: Safari erlaubt, Webinhalt „Nur erlaubte Websites“ mit `https://daddytomsen.github.io/wordbox/`. App läuft, andere Seiten bleiben gesperrt. Anleitung in README. |
