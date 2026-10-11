# Übergabe an Claude Code – Voc a Bit

Stand: 11.10.2026 · Version 1.5 · Projektordner `~/Downloads/wordbox` · live unter https://daddytomsen.github.io/wordbox/

Lies zuerst `CLAUDE.md` (Aufbau, Regeln, Datenmodell). Diese Datei sagt, was fertig ist und was als Nächstes zu tun ist.

## Ziel

Thomas' Sohn (Klasse 6) übt seine Englisch-Vokabeln mit einer eigenen App auf seinem iPhone. Die App läuft eigenständig ohne Claude, startet auch offline und bekommt neue Lektionen über den Ordner `lists/` im GitHub-Repository.

## Fertig

- App komplett in `index.html`: Start (Tagesziel, Wochenserie, Level, Lektionen), Üben (7 Abfragearten, Wörter selbst auswählen, Filter), Vokabeln (Karteikasten, Suche, Vorlesen, Lektion löschen), Erfolge (Kacheln, 15 Abzeichen, Einstellungen, Sicherung).
- Lernlogik: Karteikasten mit 5 Fächern, eingestreute schwache Wörter, Wiederholung falscher Antworten in derselben Runde, XP, Serie, Combo, Konfetti.
- Theme 1 „Back to Camden Town“ (S. 225–226): 62 Wörter und 12 Redemittel mit Lautschrift, Beispielsätzen, Simple Past und Gegenteilen. In `lists/theme1-camden-town.json` und als `SEED` in `index.html`.
- Neue Vokabeln in der App: Liste einfügen, Datei öffnen (auch iCloud Drive), Anleitung für Claude kopieren (Buchfotos → JSON).
- Lektionen über `lists/index.json` mit `rev` für Korrekturen.
- Home-Bildschirm-App: Manifest, Icons, Service Worker (offline), Safe-Areas.
- Ton-Korrektur für iOS (Freischalten beim ersten Tippen, `audioSession`, Sprachausgabe synchron) und Knopf „Ton testen“.
- `tools/check.sh` geprüft: JS-Syntax ok, JSON ok, Versionen gleich.
- Git-Repo `daddytomsen/wordbox` (öffentlich), GitHub Pages aktiv, alle drei Adressen antworten mit 200 (11.10.).
- Sicherung speichern nutzt auf iOS das Teilen-Menü (`navigator.share` mit Datei), sonst Download wie bisher (Version 1.2).
- `tools/add-list.py` nimmt Claudes Antwort als Lektion auf (siehe Aufgabe 4), mit Testlauf geprüft.
- XP knapper (Version 1.3, Wunsch Thomas 11.10.): 2 XP pro richtige Antwort, 3 beim Schreiben, +1 Extra-Wort, Rundenbonus 5, fehlerfrei +10. Tagesziele 100/150/250/400. Eine fehlerfreie 10er-Runde bringt etwa 40 XP, „Normal“ braucht rund vier davon. Alte Lernstände werden einmalig umgerechnet (`migrateProg`, Marker `econ: 2`), im Browser gegen die Pages-Adresse geprüft.
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

### 5. Fehlende Seite 224 (Theme 1, A1–A9)

Sobald Thomas die Fotos schickt: Wörter mit neuen festen Ids (`t1-a01` …) **vor** `t1-01` in `lists/theme1-camden-town.json` einfügen und `rev` in `lists/index.json` auf 2 setzen. Bestehende Ids nicht anfassen. `SEED` in `index.html` muss nicht nachgezogen werden.

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
| | | |
