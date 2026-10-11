# Voc a Bit – Vokabeltrainer Englisch

Eine Lern-App für die Vokabeln aus dem Englischbuch (Klasse 6). Sie läuft als Web-App im Safari auf dem iPhone und lässt sich wie eine normale App auf den Home-Bildschirm legen. Nach dem ersten Öffnen funktioniert sie auch ohne Internet.

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

Der Fortschritt (XP, Serie, Abzeichen, Karteikasten) wird nur auf dem Gerät gespeichert. Unter **Erfolge → Sicherung speichern** lässt er sich als Datei sichern, z. B. in iCloud Drive, und auf einem anderen Gerät mit **Sicherung laden** wieder einspielen.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | die komplette App |
| `sw.js` | macht die App offline-fähig und lädt Updates |
| `manifest.webmanifest`, `*.png` | Name und Icon für den Home-Bildschirm |
| `lists/` | Vokabellisten (Lektionen) |
| `robots.txt`, `.nojekyll` | keine Suchmaschinen, GitHub Pages ohne Umbau |
