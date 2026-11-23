# Voc a Bit – Vokabeltrainer Englisch

Eine Lern-App für die Vokabeln aus dem Englischbuch (Klasse 6). Sie läuft als Web-App auf dem iPhone (Safari) und auf Android (Chrome) und lässt sich wie eine normale App auf den Startbildschirm legen. Nach dem ersten Öffnen funktioniert sie auch ohne Internet.

Gelernt wird wie mit einem Karteikasten mit fünf Fächern. Dazu gibt es einen Lernpfad mit Stationen, Tagesquests, Münzen, Abzeichen und die Manga-Figur Bit mit Skins zum Freischalten.

## Einrichtung auf GitHub (einmalig)

1. Auf github.com ein neues Repository anlegen, z. B. `wordbox`. GitHub Pages ist nur bei öffentlichen Repositories kostenlos.
2. **Add file → Upload files** und den kompletten Inhalt dieses Ordners hineinziehen, inklusive des Ordners `lists`. Dann **Commit changes**.
3. **Settings → Pages**: Bei „Source“ **Deploy from a branch** wählen, Branch `main`, Ordner `/ (root)`, **Save**.
4. Nach ein bis zwei Minuten ist die App unter `https://<benutzername>.github.io/wordbox/` erreichbar.

Die Seite ist öffentlich erreichbar, wird aber nicht von Suchmaschinen aufgenommen (`robots.txt` und `noindex`).

## Auf dem iPhone installieren

1. Die Adresse in **Safari** öffnen.
2. **Teilen → Zum Home-Bildschirm**.
3. Ab jetzt Voc a Bit über das Icon starten.

## Auf Android installieren

1. Die Adresse in **Chrome** öffnen.
2. Auf der Startseite der App **Installieren** tippen. Fehlt die Karte: Chrome-Menü (drei Punkte) → **App installieren** oder **Zum Startbildschirm hinzufügen**.
3. Ab jetzt Voc a Bit über das Icon starten.

## Für Freunde

Jeder öffnet dieselbe Adresse und installiert die App. Jedes Gerät hat seinen eigenen Lernstand, es gibt keine Anmeldung und es werden keine Daten verschickt. Die Lektionen aus dem Ordner `lists/` bekommen alle automatisch.

Selbst angelegte Lektionen lassen sich weitergeben: **Vokabeln → Lektion aufklappen → Teilen** zeigt drei kurze Schritte und schickt die Lektion als Datei, zum Beispiel über WhatsApp. Der Empfänger sichert die Datei und öffnet sie in der App unter **Vokabeln → Neue Vokabeln hinzufügen → Datei öffnen**. In der Datei stehen nur die Wörter, kein Lernstand.

## Adventskalender

Im Dezember zeigt die Startseite einen Adventskalender mit 24 Türchen: jeden Tag ein englisches Weihnachtswort, ein Rätsel oder etwas über Weihnachten in Großbritannien, manchmal ein kleines Geschenk. Die Türchen verfallen nicht, ein verpasstes wartet.

Eltern können eigene Fotos und Sätze hinter die Türchen legen. Die liegen nicht in dieser öffentlichen App, sondern in einer Datei, die nur auf das Handy des Kindes geladen wird: Fotos mit der Türchen-Nummer am Anfang des Namens in einen Ordner außerhalb dieses Projekts legen, dann `python3 tools/advent-paket.py <Ordner>` ausführen und die erzeugte Datei in der App laden (Erfolge → Einstellungen → Adventskalender).

## Bildschirmzeit: nur Voc a Bit erlauben

Die App auf dem Home-Bildschirm ist technisch ein Teil von Safari. Ist Safari in der Bildschirmzeit unter „Erlaubte Apps“ ausgeschaltet, startet auch Voc a Bit nicht. Der richtige Weg ist die Website-Liste: Safari bleibt erlaubt, darf aber nur freigegebene Adressen öffnen. Das gilt für Safari und für die App gleichermaßen.

Am iPhone des Kindes, mit Bildschirmzeit-Code:

1. Einstellungen → Bildschirmzeit → Beschränkungen (Inhalt & Datenschutz) → Erlaubte Apps & Funktionen → **Safari einschalten**.
2. Zurück → Inhaltsbeschränkungen → Webinhalt → **Nur erlaubte Websites**.
3. „Website hinzufügen“: Titel „Voc a Bit“, URL `https://daddytomsen.github.io/wordbox/`. Vorinstallierte Einträge nach Bedarf löschen.
4. Optional für die Schrift der App: `https://fonts.googleapis.com` und `https://fonts.gstatic.com` ebenfalls hinzufügen. Ohne sie läuft alles mit Standardschrift.
5. Einmal in Safari die Adresse öffnen → Teilen → Zum Home-Bildschirm. Danach nur über das Icon starten.

Kein App-Limit für Safari setzen, das kann die App mitsperren. Soll Safari nicht sichtbar sein, das Icon in einen Ordner oder die App-Mediathek schieben. Geprüft am 11.10.2026: App startet, andere Adressen bleiben gesperrt.

## Neue Vokabeln hinzufügen

Neue Lektionen kommen über den Ordner `lists/`. Die App sieht beim Start nach und lädt neue Lektionen automatisch.

1. Fotos der Word-lists-Seiten an Claude schicken (die passende Anleitung gibt es in der App unter **Vokabeln → Neue Vokabeln → Anleitung kopieren**).
2. Claudes Antwort als Datei speichern, z. B. `lists/theme2.json`.
3. In `lists/index.json` einen Eintrag ergänzen:

```json
{
  "lists": [
    { "id": "theme1-camden-town", "title": "Theme 1: Back to Camden Town", "file": "theme1-camden-town.json", "rev": 1 },
    { "id": "theme2", "title": "Theme 2", "file": "theme2.json", "rev": 1 }
  ]
}
```

- `id` darf sich danach nicht mehr ändern.
- Wird eine Liste korrigiert, `rev` um eins erhöhen. Dann lädt die App die neue Fassung, der Lernstand bleibt erhalten, solange die Reihenfolge der Wörter gleich bleibt (oder jedes Wort eine feste `id` hat).

Alternativ kann man im iPhone direkt unter **Neue Vokabeln** eine Liste einfügen oder eine Datei öffnen, auch aus iCloud Drive.

## Lernstand

Der Fortschritt (XP, Serie, Münzen, Abzeichen, Karteikasten) wird nur auf dem Gerät gespeichert. Unter **Erfolge → Einstellungen → Sicherung speichern** lässt er sich als Datei sichern, z. B. in iCloud Drive, und auf einem anderen Gerät mit **Sicherung laden** wieder einspielen.

## Updates

Gibt es eine neue Fassung, zeigt die Startseite oben den Hinweis „Version … ist da. Tippe hier zum Aktualisieren.“ Ohne Hinweis hilft: App ganz schließen und zweimal öffnen. Die Versionsnummer steht unter **Erfolge → Einstellungen** ganz unten. Vor einem großen Update lohnt sich eine Sicherung.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | die komplette App |
| `sw.js` | macht die App offline-fähig und lädt Updates |
| `manifest.webmanifest`, `*.png` | Name und Icon für den Startbildschirm (iPhone und Android) |
| `lists/` | Vokabellisten (Lektionen) |
| `tools/` | Prüfung vor dem Hochladen (`check.sh`), Tests, Hilfsskript für neue Lektionen |
| `robots.txt`, `.nojekyll` | keine Suchmaschinen, GitHub Pages ohne Umbau |
