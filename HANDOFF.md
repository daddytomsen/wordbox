# Übergabe an Claude Code – Voc a Bit

Stand: 24.11.2026 · Version 2.9 (gepusht 24.11.) · vorher: Version 2.8 (gepusht 23.11. spät, Commit 2c47c9f) · Projektordner `~/Downloads/wordbox` · live unter https://daddytomsen.github.io/wordbox/

Lies zuerst `CLAUDE.md` (Aufbau, Regeln, Datenmodell). Diese Datei sagt, was fertig ist und was als Nächstes zu tun ist.

## Ziel

Thomas' Sohn (Klasse 6) übt seine Englisch-Vokabeln mit einer eigenen App auf seinem iPhone. Die App läuft eigenständig ohne Claude, startet auch offline und bekommt neue Lektionen über den Ordner `lists/` im GitHub-Repository.

## Fertig

- **Version 2.9 (24.11.2026, Wunsch der Kinder): Truhen mit drei Versuchen je Stufe, dazu „Legendär“ und „Mythisch“.**
  - Regel: Jede Truhe hat drei Versuche. Jeder Tipp versucht, sie eine Stufe zu heben. Klappt es, gibt es wieder drei Versuche; nach drei Fehlversuchen öffnet sie sich als das, was sie ist. Bis 2.8 gab es insgesamt zwei Chancen.
  - Sechs Stufen statt vier: Holz, Silber, Gold, Diamant, Legendär, Mythisch. Die beiden neuen gibt es nur durch Upgrades. Legendär: 130 bis 190 Münzen, 2-fach XP für zwei Runden, Serien-Schutz, 25 % Skin. Mythisch: 250 bis 400 Münzen, 3-fach XP für zwei Runden, Serien-Schutz und immer ein Skin, der noch fehlt (ab dem 1.12., auch ein mythischer).
  - Der Dialog zeigt die Versuche als drei Punkte und alle sechs Stufen als kleine Leiste. Töne: ein steigender Ton je Fehlversuch, eine Melodie beim Aufstieg, die mit jeder Stufe länger wird, eine Fanfare beim Öffnen ab Legendär. Konfetti beim Aufstieg ab Diamant.
  - **Damit die Belohnungen nicht davonlaufen** (Vorgabe Thomas zu XP: „nicht zu viel nachgeben“): Weil Truhen jetzt viel öfter steigen, sind die Chancen je Versuch klein (Holz 14 %, Silber 12 %, Gold 6,5 %, Diamant 8 %, Legendär 5 %), und Booster in Silber- und Goldtruhen sind eine Spur seltener (6 % und 18 % statt 8 % und 20 %). Durchgespielt mit dem echten Code, 24 Läufe über 90 Tage, alt gegen neu:

    | | 1 Runde/Tag alt | neu | 2 Runden/Tag alt | neu |
    |---|---|---|---|---|
    | Münzen aus Truhen | 5283 | 5706 | 7290 | 7765 |
    | Runden mit Booster | 38 % | 36 % | 25 % | 26 % |
    | XP je Tag | 71 | 73 | 130 | 133 |
    | Skins aus Truhen | 4,5 | 5,2 | 6,0 | 6,7 |
    | Diamant / Legendär / Mythisch | 12 / – / – | 9 / 3,2 / 0,5 | 18 / – / – | 14 / 4,5 / 0,3 |
    | Tipps je Truhe | 3,0 | 3,8 | 3,0 | 3,8 |

  - Fund beim Testen: Die Aufstiegs-Melodie kletterte im ersten Entwurf mit jeder Stufe höher und lag bei „Mythisch“ bei 15,8 kHz, was ein Handy nur als Pfeifen wiedergibt. Jetzt beginnt jede Stufe tiefer und endet höher, nichts liegt über 5 kHz; ein Test prüft das an den Noten.
  - Von mir gesetzt, von Thomas noch nicht bestätigt: der Inhalt der beiden neuen Truhen, die Chancen je Versuch, die Farben (Legendär bernstein mit rotem Band, Mythisch nachtblau mit dreifarbigem Band).
  - Geprüft im Browser (Handy-Größe, hell und dunkel): Leiste auf dem Start, Dialog mit Punkten und Stufenleiste, vier Aufstiege hintereinander von Silber bis Mythisch, Öffnen mit Beute, zwei Fehlversuche (ein Punkt bleibt), Speichern nach jedem Tipp. **Nicht geprüft: wie die Töne auf dem iPhone und auf Android klingen**; im Browser-Test war kein Lautsprecher im Spiel.
- **Version 2.8 (23.11.2026 spät, Korrektur): Die Winter-Linie wartet auf den 1. Dezember.** Thomas hatte vorgegeben, dass Skins und Adventskalender erst zum 1.12. freigeschaltet werden. In 2.7 (live seit 23.11. abends) wartete nur der Kalender; der neue Bit, die acht Frostnacht-Skins im Shop und die Zeile „Bit hat einen neuen Look“ kamen sofort mit dem Update. Mein Fehler: Ich hatte die Skins ohne Stichtag gebaut.
  - Jetzt gilt bis zum 30.11.: gezeichneter Bit, 14 Skins im Shop, keine Skins aus Truhen, kein Hinweis. Ab dem 1.12. (Datum des Geräts) öffnet alles von selbst: neuer Bit, Frostnacht-Legenden, Skins in Truhen, einmal der Hinweis, dazu wie gehabt der Kalender.
  - Wer in den Tagen mit 2.7 schon einen Winter-Skin gekauft oder gefunden hat, behält ihn und kann ihn tragen. Wer den neuen Bit schon gesehen hat, sieht bis zum 1.12. wieder den gezeichneten.
  - Nicht gesperrt (bewusst, bitte widersprechen, falls anders gewollt): Bit schwebt und reagiert im Quiz, die 14 gezeichneten Skins glänzen. Blinzeln kommt mit den Bild-Figuren am 1.12.
  - Geprüft: Tests für „24.11.“ (Sperre zu), „30.11. abends“, „1.12.“, Gerät mit 2.7-Stand, neues Gerät; im Browser mit heutigem Datum und mit `?tag=1`.
- **Version 2.7 (23.11.2026, Wunsch Thomas: Adventskalender, „um ihm das Warten auf Heiligabend zu versüßen“).**
  - 24 Türchen, Karte auf der Startseite ab dem 1. Dezember, vorher keine Spur. Hinter jedem Türchen: englisches Weihnachtswort des Tages mit Vorlesen, ein Rätsel oder Wissen über Weihnachten in Großbritannien, an 16 Tagen ein Geschenk (Truhen, Münzen, Serien-Schutz, kleiner Booster).
  - Entscheidungen Thomas: Türchen sind frei (keine Lernbedingung). An den Tagen 6., 13., 20. und 24. liegt ein Skin der Winter-Linie hinter dem Türchen (siehe unten).
  - Nichts verfällt: Verpasste Türchen warten, auch nach Weihnachten. Kein Satz des Kalenders droht oder drängt (Test dazu).
  - **Familienfotos:** Thomas wollte 24 Fotos aus dem Album hinter den Türchen. Die App nutzt zurzeit nur sein Sohn, die Web-Adresse und das Repo sind aber öffentlich. Deshalb liegen die Fotos nicht in der App, sondern in einem privaten Paket, das nur auf das Handy geladen wird (`tools/advent-paket.py`, siehe Aufgabe 10). Im Paket können je Türchen ein Foto, ein Satz und ein Gutschein stehen.
  - Geprüft im Browser mit vorgestelltem Datum und einem Paket aus Probebildern: Karte, Raster, Türchen mit Foto, Neustart (Foto kommt aus der Datenbank, Geschenk nur einmal), hell und dunkel. **Nicht am iPhone geprüft:** ob die Home-Bildschirm-App die Datei annimmt und die Fotos über Tage behält.
  - **Winter-Linie „Frostnacht-Legenden“ eingebaut (23.11., Bilder von Thomas mit ChatGPT gemacht, weil ihm die gezeichneten Figuren nicht so gut gefielen).** Neun Bildraster liegen als `skins/*.webp` im Repo (zusammen 1,8 MB), geschnitten mit `tools/make-skins.py`.
    - Der neue Bit ist die Standardfigur. Der gezeichnete Bit bleibt als „Bit Klassik“ für alle wählbar, die 14 gezeichneten Skins stehen im Shop unter „Klassiker“. Wer einen alten Skin trägt, behält ihn an.
    - Acht neue Skins im Shop (80 bis 500 Münzen): Schneeschatten-Shinobi, Rentier-Ranger, Polar-Popstar, Keks-Krieger, Turbo-Wichtel, Kapitän Knack, Frostflügel, Aurora-Legende.
    - Adventskalender: Türchen 6 schenkt den Rentier-Ranger, 13 den Keks-Krieger, 20 den Kapitän Knack, 24 die Aurora-Legende. Wer den Skin schon hat, bekommt die Diamanttruhe des Tages. Ein Türchen, das vor den Skins geöffnet wurde, reicht den Skin beim nächsten Start nach.
    - Truhen können einen fehlenden Skin enthalten: Silber 1 % (nur Selten), Gold 3 % (bis Episch), Diamant 10 % (bis Legendär), Mythisch nie. Jeder Skin lässt sich auch kaufen. **Korrektur vom selben Tag:** Zuerst standen die Chancen doppelt so hoch, und ich hatte Thomas „4 Skins in 90 Tagen“ genannt. Das war ein einzelner Lauf. Über 24 Läufe gemessen waren es 9 (eine Runde am Tag) bis 11 (zwei Runden), also die Hälfte aller Skins in drei Monaten. Mit den halbierten Chancen sind es etwa 5 bis 6 (Spanne 2 bis 11).
    - Von mir gesetzt, von Thomas noch nicht bestätigt: neuer Bit als Standard, die Preise, welcher Skin hinter welchem Türchen liegt, die Chancen in den Truhen.
    - Das Abzeichen „Skin-Sammler“ verlangt jetzt 22 statt 14 Skins; wer es hat, behält es.
  - **Bit bewegt sich (23.11., Wunsch Thomas nach einer Animations-Demo von ChatGPT).** Bit schwebt sanft auf dem Start, im Shop (die gewählte Figur), nach einer Runde und im Profil. Im Quiz steht er still, solange die Frage offen ist, und antwortet einmal: Hüpfer bei richtig, Kopfschütteln bei falsch. Alle 22 Skins haben einen Glanzstreifen, der alle paar Sekunden über die Figur läuft (Wunsch Thomas; zuerst hatte ihn nur die Aurora-Legende). Bit selbst und Bit Klassik glänzen nicht. Der Streifen läuft nur dort, wo Bit schwebt; im Shop nur bei der gewählten Figur. Einen ruhigen Lichtschein haben nur die beiden mythischen Skins. Abschaltbar unter Einstellungen → „Bit bewegt sich“; „Bewegung reduzieren“ im Handy wird beachtet. Anders als in der Demo: kein pulsierender Leuchtrand (Akku), Glanz nur auf der Figur statt als Oval darüber. Blinzeln ist bestellt: Die Nachrichten für ChatGPT stehen in `entwurf/chatgpt-blinzeln.md` (je Figur das Raster noch einmal, mit geschlossenen Augen in den drei Feldern fröhlich, denkt nach, staunt), die Antworten kommen nach `entwurf/xmas/blinzeln/`. **Stand 23.11. abends:** Für die Aurora-Legende ist das Blinzeln eingebaut und im Film geprüft (alle 4,4 s, vier Bilder lang, nur wo Bit schwebt). Das Bild von ChatGPT war außerhalb der Augen auf den Pixel gleich, die Nachricht taugt also. Danach Frage Thomas: Passen dieselben Augen nicht auf alle Figuren? Gemessen und ausprobiert: ja. Alle neun Bild-Figuren blinzeln jetzt mit den geschlossenen Augen der Aurora-Legende (`tools/make-skins.py` leiht sie aus und findet die Stelle selbst). Weitere Bilder von ChatGPT sind dafür nicht nötig. Die 14 gezeichneten Klassiker und Bit Klassik blinzeln nicht. Sprechen bräuchte weitere Felder. Gemessen in Chrome ohne Fenster: Schweben −3 bis +2 px, Hüpfer 12 px, Kopfschütteln ±9 Grad, bei offener Frage keine Bewegung. Film dazu in `entwurf/` (nicht im Repo). Nicht am iPhone geprüft.
    - Geprüft im Browser: Startseite mit neuem Bit, Shop mit drei Abschnitten, Kauf und Tragen, Stimmungswechsel im Quiz. Nicht am iPhone geprüft, auch nicht, wie schnell die Bilder dort beim ersten Mal laden.
- **Version 2.6 (18.11.2026, „Hebel 1“ aus der Lern-Überlegung: vom Ankreuzen zum Selbst-Schreiben).** Anlass: Bis 2.5 enthielt „Weiter lernen“ keine einzige Schreibfrage; ein Wort galt als „sitzt“, ohne je geschrieben worden zu sein, die Klassenarbeit verlangt aber Schreiben. Befund aus der Forschung dazu: Geübt werden sollte in der Form, in der geprüft wird.
  - **Leiter:** Im Mix folgt die Frageart dem Fach: neu und Fach 1 erkennen, Fach 2 mit Hilfe (Lücke oder Hörfrage), Fach 3 aus dem Kopf schreiben, Fach 4–5 gemischt mit gelegentlichem Schreiben. Höchstens vier von zehn Fragen werden geschrieben.
  - **Tor:** Von Fach 3 nach Fach 4 („sitzt“) kommt ein Wort nur durch Schreiben. Richtig angekreuzt zählt, das Wort wartet aber in Fach 3; die Rückmeldung sagt es („Das Wort sitzt, sobald du es selbst geschrieben hast“), die Vokabelliste zeigt „als Nächstes: schreiben“. Wörter, die vorher in Fach 4 oder 5 lagen, bleiben dort.
  - **Hörfrage (neu):** Wort wird vorgelesen, Bedeutung steht dabei, Kind schreibt. Auch ohne Ton lösbar. Nur mit eingeschaltetem „Vorlesen“.
  - **Lernziele:** Neue Ziele verlangen je Wort zweimal richtig, einmal davon geschrieben. Bestehende Ziele behalten ihre Regel.
  - **Rundenmischung (Fund beim Durchspielen, kein Wunsch):** Bis 2.5 war immer die halbe Runde neu, und die fälligen Plätze gingen an das niedrigste Fach. Mit dem echten Code durchgespielt: Ein Kind, das bei null anfängt, hatte nach 4 Wochen kein Wort in Fach 4 (bei 2 Runden am Tag 201 wartende Wörter in Fach 3). Jetzt gilt „erst festigen, dann Neues“: Warten viele Wörter in Fach 1–3, bekommt die Runde weniger oder keine neuen. Ergebnis nach 4 Wochen bei null angefangen: 59 Wörter sitzen bei 1 Runde am Tag, rund 120 bei 2 Runden, alle geschrieben; höchstens 7 warten vor dem Tor. Für einen vollen Kasten (143 sitzen, 133 neu): rund 200 bzw. 240 sitzen, vor dem Tor warten höchstens zwei Wörter.
  - **Verworfen nach Durchrechnen:** „falsch geschrieben → Fach 2 statt Fach 1“ (kein messbarer Gewinn, zweite Regel), halbe Runde geschrieben statt vier von zehn (kaum mehr Wörter in Fach 4, ein geschriebenes Wort mehr je Runde), feste zwei neue Wörter je Runde (Schlange vor dem Tor blieb bei 25 bis 80 Wörtern).
  - **XP fürs Schreiben (Entscheidung Thomas 18.11.):** aus dem Kopf geschrieben 6 statt 4 XP, Hörfrage 4, angekreuzt weiter 3. Grund: Runden dauern durch das Schreiben länger, die XP je Runde wären sonst gleich geblieben.
  - **Offen, von Thomas zu entscheiden:** (1) Ein Tippfehler wird weiter verziehen („Fast perfekt“) und öffnet das Tor; strenger wäre möglich. (2) Neue Wörter kommen langsamer, solange ein Stapel wartet; für Klassenarbeiten ist das Lernziel der Weg.
  - Tests: Leiter je Fach, Schreibanteil, Tor (auch mit Redewendung und alten Fach-4/5-Wörtern), Hörfrage, Lernziel alt und neu, Texte, dazu drei Wochen tägliches Spielen (alle sitzenden Wörter geschrieben, kein Stapel vor dem Tor).
- **Version 2.5 (18.11.2026, Wunsch Thomas: Freunde aus derselben Klasse wollen die App auch, einige mit Android; „nicht zu groß denken“).** Verteilt wird über den Link, jedes Gerät hat seinen eigenen Lernstand, die Lektionen aus `lists/` bekommen alle. Kein Server, keine Konten.
  - **Lektion teilen:** Knopf „Teilen“ an jeder Lektion (Vokabeln → Lektion aufklappen). Die Lektion geht als Textdatei ins Teilen-Menü (WhatsApp, AirDrop, Nachrichten). Der Freund öffnet sie unter „Neue Vokabeln hinzufügen“ → „Datei öffnen“, prüft und speichert. In der Datei stehen nur Wörter, kein Lernstand und kein Name.
  - **Kurze Anleitung für die Kinder (Wunsch Thomas):** „Teilen“ zeigt zuerst drei Schritte (schicken, sichern, öffnen) mit dem Knopf „Datei senden“. Die Import-Seite hat die Karte „Lektion von einem Freund?“ mit den drei Schritten der Empfängerseite. Und die Datei selbst beginnt mit zwei Zeilen dazu samt Adresse der App, die sieht, wer sie im Chat antippt. Den Weg der Datei auf Android (WhatsApp → Dateiauswahl) habe ich nicht am Gerät gesehen, der Satz dazu ist allgemein gehalten. Wörter, die es schon gibt, sind beim Öffnen abgewählt.
  - **Android:** Die App lief dort schon weitgehend (Vibration, Töne, Dateien). Neu: Die Zurück-Taste geht in der App einen Schritt zurück (Runde fragt erst nach) und schließt die App nur von der Startseite, nach einem Hinweis. Eigenes App-Symbol für den runden Zuschnitt. Hinweise zu Stummschalter und iOS stehen nur noch am iPhone.
  - **Installieren-Hinweis:** Wer die App im Browser-Tab öffnet, sieht auf der Startseite eine Karte: bei Chrome mit Knopf „Installieren“, am iPhone mit dem Weg über „Teilen → Zum Home-Bildschirm“. In der installierten App erscheint sie nie.
  - Am iPhone ändert sich sonst nichts: keine History-Einträge, kein neues Verhalten beim Wischen.
  - Nicht gebaut und warum: Einscannen in der App (bräuchte Server und bezahlten Schlüssel), Texterkennung auf dem Gerät (dreispaltige Wortlisten mit Lautschrift), Link statt Datei (am iPhone landet ein Link in Safari, und Safari und die App auf dem Home-Bildschirm haben getrennte Speicher).
  - **Nicht auf einem echten Android-Gerät getestet**, nur im Browser mit Android-Kennung und in den Tests. Checkliste unter Aufgabe 8.
- **Version 2.4 (18.11.2026, Wunsch Thomas: XP etwas schneller, „aber nicht zu viel nachgeben“).** Rückmeldung vom Sohn: XP sammeln sei zäh. Mit dem echten App-Code über 12 Wochen durchgespielt (Stand wie seiner, 80 % richtig); Thomas hat die Variante „ruhig“ gewählt:
  - +1 XP je richtige Antwort: 3 statt 2, beim Schreiben 4 statt 3. Alle Boni unverändert.
  - Level-Kurve ab Level 10 flacher: Der Schritt wächst um 25 statt 50 XP je Level (Level 15 → 16 kostet 675 statt 800, Level 20 → 21 800 statt 1.050). Bis Level 11 ändert sich nichts, darüber liegt jede Schwelle tiefer, niemand verliert ein Level. Wem die neue Kurve ein Level schenkt, der bekommt es beim ersten Start mit 20 Münzen und Silbertruhe; der Hinweis nennt das Level.
  - Booster gezügelt: Holztruhe nie, Silber 8 % und Gold 20 % je 1,5-fach, Diamant immer 2-fach, alle für eine Runde. In 2.3 (Silber 15 % und Gold 35 % je 2-fach, Diamant 3-fach für zwei Runden) waren rund 40 % der Runden verstärkt und brachten über 100 XP, eine gewöhnliche 37: gut 65 % mehr XP als vor den Truhen, aber per Glück. Ursache war das Upgrade beim Öffnen, das etwa jede dritte Goldtruhe zur Diamanttruhe macht.
  - Gemessen mit dem neuen Code, 2 Runden am Tag, 80 % richtig: 47 XP je gewöhnliche Runde, 110 XP am Tag, Booster in etwa jeder fünften Runde, 6,6 Tage je Level, Tagesziel 100 an gut der Hälfte der Tage, 150 an jedem zehnten. Bei 1 Runde am Tag: 61 XP, 11 Tage je Level, Booster in knapp jeder dritten Runde (Truhen gibt es je Tag, nicht je Runde). Zum Vergleich bis 2.1: 75 XP am Tag, 10,6 Tage je Level; 2.3: 124 XP am Tag, 7,1 Tage je Level.
  - Nicht angefasst: die Stufen des Tagesziels (100/150/250/400). „Normal“ (150) bleibt mit zwei Runden selten erreichbar; Empfehlung an Thomas: in den Einstellungen auf „Locker“ stellen. Die Quest „Sammle N XP“ (40/60/80) ist durch die höheren XP etwas leichter geworden.
  - Tests: Level-Kurve (bis Level 11 gleich, darüber tiefer, ganzzahlig, kein Level verloren), geschenktes Level einmal bezahlt, XP je Antwort, Booster-Tabelle, 1,5-fach mit Komma; der 90-Tage-Lauf verlangt jetzt weniger als 30 % verstärkte Runden.
- **Version 2.3 (18.11.2026, Vorgabe Thomas: familien- und kindfreundlich, kein Zeitdruck).** Der Sohn hat Bildschirmzeit von 7 bis 20 Uhr und ist bis 14 Uhr in der Schule; die Zeit-Truhen aus 2.2 passten nicht dazu, und Countdowns und Verfall haben Druck gemacht. Jetzt gilt als Grundsatz (auch in `CLAUDE.md`): Die App verlangt nie, zu einer bestimmten Uhrzeit da zu sein, und nichts läuft ab.
  - Quests ohne Frist: Eine Quest bleibt mit ihrem Zählerstand, bis sie geschafft ist, auch über mehrere Tage. Geschaffte werden am nächsten Tag ersetzt. Der Hinweis „noch N Std.“ ist weg, die Karte heißt „Quests“.
  - Truhen: nie gesperrt, nie verfallen. Frühaufsteher- und Nachteulen-Truhe gibt es nicht mehr; dafür bringt die erste fertige Runde eines Tages eine Silbertruhe, egal zu welcher Uhrzeit. Truhen aus 2.2 mit Öffnungszeit werden zu gewöhnlichen Truhen.
  - XP-Booster zählt Runden statt Minuten („2x XP für deine nächste Runde“) und wartet, bis gespielt wird. Weil er so nie ungenutzt verstreicht, ist er seltener (Holz 5 %, Silber 15 %, Gold 35 %, Diamant immer).
  - Texte ohne Verlust-Drohung („Schön, dass du heute geübt hast!“ statt „Komm morgen wieder, damit die Flamme weiterbrennt“). Abzeichen „Frühaufsteher“ gilt für jede Runde am Vormittag.
  - Bewusst **nicht** angefasst: die Serie (Tage in Folge, mit Serien-Schutz) und das Tagesziel. Beides gibt es seit 1.x; ob die Serie weicher werden soll (z. B. Wochenende zählt nicht mit), entscheidet Thomas. Das Abzeichen „Blitzrunde“ (10 fehlerfrei in 90 Sekunden) belohnt Tempo und ist ebenfalls noch drin.
- **Version 2.2 (18.11.2026, Vorgabe Thomas „Truhensystem nach dem Vorbild von Duolingo“):** Truhen in vier Stufen (Holz, Silber, Gold, Diamant), Öffnen mit drei Tipps und 20 % Upgrade-Chance bei Tipp 1 und 2, Beute aus einer Tabelle (Münzen, XP-Booster, Serien-Schutz), Truhen-Leiste auf dem Start mit Countdown, Booster-Anzeige unter der Kopfzeile.
  - Auslöser: jede Tagesquest (leicht → Holz, mittel → Silber, schwer → Gold; ersetzt die 5 Münzen je Quest und die 15 der alten Tagestruhe), jede 5. fertige Runde (Holz), jedes neue Level (Silber), Serie an Tag 3, 7, 14, 30, 50, 100, dazu Frühaufsteher- und Nachteulen-Truhe mit Zeitfenster.
  - Bewusst anders als die Vorgabe: (1) alles bleibt in `index.html`, Regeln und Oberfläche sind getrennte Abschnitte; (2) „Bits“ sind die vorhandenen Münzen; (3) die Münzbeträge sind ein Viertel der Vorgabe, weil Skins 30 bis 400 kosten (Probelauf über 90 Tage: rund 65 Münzen am Tag, alle Skins nach etwa einem Monat); (4) kein Server, also Geräteuhr mit Sperre gegen Zurückstellen; (5) Energie/Herzen gibt es nicht. Die Zahlen stehen in der Tabelle `CHEST` und sind in einer Zeile änderbar.
  - Neue Quest „Eine Runde mit 85 % richtig“. Quests sind jetzt nach Schwierigkeit gestaffelt.
  - Tests: Beute-Tabelle, drei Tipps mit Neustart dazwischen, Zeitfenster samt Verfall, Booster (auch mit zurückgestellter Uhr), alle Auslöser, beschädigte Tasche, dazu ein Probelauf über 90 Tage, bei dem jede Buchung nachgerechnet wird.
- **Version 2.1 (17.11.2026):** Theme 2 um S. 229 und 230 erweitert (rev 3, jetzt 152 Wörter, Ids 081–152, alte Ids unverändert) und acht neue Skins (Wunsch des Sohnes: ausgefallen, epische Namen): Sturmrufer, Mondwolf, Flammengeist, Schattenklinge, Sternenfahrer, Frostkaiser, Mecha-Titan, Galaxienwächter. Neue Stufe „Mythisch“, Schild „Neu“ im Shop, einmaliger Hinweis beim Start.
  - Vokabeln: Abschnitte S. 229: Anfang gehört noch zu A2, dann A3, A6; die Marken vor „to contact sb“ und „upset“ waren auf dem Foto nicht lesbar und sind als A7 und A8 **angenommen** (S. 230 beginnt mit A9). S. 230: A9, B2, B4, B5, B6, B7. „° to solve“ ist fakultativ (`opt`). „worse ↔ better“ und „worst ↔ best“ als `opp`. Dubletten wie im Buch: „annoying“ steht auch in Theme 1, „to get“ auch in Irregular verbs.
  - Dabei behoben: „towards“ für „toward(s)“ galt nur als Tippfehler, „to be keen on“ für „to be keen on sb/sth“ als falsch; „anyone“ konnte als falsche Antwort bei „someone“ stehen (gleiche Bedeutung).
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
- XP knapper (Version 1.3, Wunsch Thomas 11.10.; seit 2.4 wieder 3 und 4 XP je Antwort, siehe oben): 2 XP pro richtige Antwort, 3 beim Schreiben, +1 Extra-Wort, Rundenbonus 5, fehlerfrei +10. Tagesziele 100/150/250/400. Eine fehlerfreie 10er-Runde bringt etwa 40 XP, „Normal“ braucht rund vier davon. Alte Lernstände werden einmalig umgerechnet (`migrateProg`, Marker `econ: 2`), im Browser gegen die Pages-Adresse geprüft.
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

### 10. Adventskalender: Fotopaket bauen und laden (Thomas, bis 30.11.) – offen

1. Einen Ordner **außerhalb** von `wordbox` anlegen, zum Beispiel `~/Downloads/voc-a-bit-advent-privat`.
2. Bis zu 24 Fotos hineinlegen. Welches Foto zu welchem Türchen gehört, steht in `texte.txt` (`7 Foto: IMG_0260.JPG`) oder im Dateinamen (`07.jpg`).
3. In `texte.txt` stehen auch die Sätze und Gutscheine, eine Zeile je Eintrag: `7: Weißt du noch? Unser Sommer am Meer.` und `7 Gutschein: Heute suchst du den Film aus.`

**Stand 23.11.:** Thomas hat 24 Fotos in den Ordner gelegt (April 2025 bis Oktober 2026, unnummeriert). Die Reihenfolge und 24 kurze Sätze hat Claude auf seinen Wunsch geschrieben und in `texte.txt` eingetragen; vier Gutscheine stehen dort als Vorschlag, auskommentiert. Das Paket ist gebaut (24 Fotos, 3,2 MB) und von der App im Test angenommen. Thomas hat die Sätze freigegeben und das Paket am 23.11. am iPhone geladen (Version 2.7). Erledigt bis auf den Blick am 1.12., ob die Fotos noch da sind.
4. Paket bauen (das Skript sieht sich die Fotos nicht an, es verkleinert und verpackt sie nur):

```bash
cd ~/Downloads/wordbox && python3 tools/advent-paket.py ~/Downloads/voc-a-bit-advent-privat
```

5. Die Datei `Voc-a-Bit-Adventspaket-2026.json` per AirDrop aufs iPhone schicken und in „Dateien“ sichern.
6. In der App laden. Vor dem 1. Dezember: Vokabeln → „Neue Vokabeln hinzufügen“ → „Datei öffnen“. Ab dem 1. Dezember auch: Erfolge → Einstellungen → Adventskalender → „Fotopaket laden“.
7. Prüfen: Unter Einstellungen steht dann „Auf diesem Gerät liegt ein Fotopaket: 24 Fotos …“. Die Datei danach vom iPhone löschen, damit sie nicht herumliegt.

Die App muss vorher auf 2.7 sein. Nach einer Neuinstallation der App das Paket einfach noch einmal laden.

### 9. Lernerfolg: die übrigen Hebel aus der Überlegung vom 18.11. – offen, Thomas entscheidet die Reihenfolge

Thomas wollte wissen, wie die App nach dem Stand der Lernforschung mehr Lernerfolg bringt. Fünf Hebel, nach Wirkung sortiert; Hebel 1 ist Version 2.6.

2. **Längere Abstände, die sich anpassen.** Der längste Abstand ist 7 Tage (`TEMPOS`, langes Tempo 14). Idee: nach Fach 5 weiter mit 14, 30, 60, 120 Tagen; oft falsche Wörter früher; als Steuergröße messen, wie viel nach einer Woche oder länger noch gewusst wird (Ziel 85 bis 90 %).
3. **Generalprobe vor der Klassenarbeit.** Zum Lernziel eine Probe: 20 Wörter schreiben, ohne Hilfe, ohne Uhr; am Ende ein Ergebnis wie vom Lehrer und die Liste der wackeligen Wörter.
4. **Neue Wörter einpflanzen, Problemwörter anders anfassen.** Kennenlern-Karte für neue Wörter (hören, im Satz sehen, laut sagen), eigene Eselsbrücke für Wörter, die dreimal falsch waren, Verwechsler nebeneinander. Nur 145 von 306 Wörtern haben einen Beispielsatz.
5. **Belohnen, was Lernen ist.** Größte Belohnung für „nach einer Woche noch gewusst“ und für Geschriebenes, wenig für Wörter, die nicht dran sind; Hauptanzeige „sicher, wackelig, neu“ statt XP; Serie als Wochenrhythmus; gemeinsames Lernziel zum Teilen, keine Rangliste.

Dazu optisch: Ruhe im Quiz (während der Frage keine Flamme, kein Booster-Schild, keine XP), Rückmeldung ums Wort herum (bei Schreibfehlern die falschen Buchstaben markieren). Nicht machen: mehr Truhen und Booster, „Lerntypen“, Spracherkennung, Belohnung nach Uhrzeit.

### 8. Test auf einem Android-Gerät (ein Freund oder Thomas) – offen

1. Adresse in Chrome öffnen. Erscheint auf der Startseite „Als App installieren“? Knopf drücken, danach vom Startbildschirm starten. Ist das Symbol rund und die Vokabelkarte ganz zu sehen?
2. Eine Runde spielen: Töne, Vorlesen, Vibration bei richtig und falsch.
3. Zurück-Taste (oder Wischen vom Rand): in der Runde kommt „Jetzt aufhören?“, auf einer Unterseite geht es einen Schritt zurück, auf der Startseite kommt „Noch einmal Zurück schließt die App“.
4. Vokabeln → Lektion aufklappen → „Teilen“ → „Datei senden“: Öffnet sich das Teilen-Menü, kommt die Datei in WhatsApp an? Stimmt der Satz „Datei in der Nachricht antippen, damit sie auf das Handy geladen wird“, und findet die Dateiauswahl der App die Datei danach? (Sonst den genauen Weg melden, dann passe ich den Text an.)
5. Auf dem anderen Gerät: Datei sichern, dann Vokabeln → „Neue Vokabeln hinzufügen“ → „Datei öffnen“. Stimmen Name und Anzahl? (Wer die Lektion schon hat, sieht alles abgewählt; zum Testen eine selbst getippte Lektion nehmen.)
6. Schreiben-Abfrage: Schlägt die Tastatur das gesuchte Wort vor? (Falls ja, melden.)
7. Flugmodus an, App neu starten: muss laufen.

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
| 24.11.2026 | Mac, Browser in Handy-Größe, Version 2.9 | Sechs Truhen (je eine Stufe) in der Leiste. Silbertruhe geöffnet: drei Punkte, Stufenleiste „Stufe 2 von 6“, Text „Noch 3 Versuche. Bei jedem Upgrade gibt es 3 neue.“ Mit erzwungenem Glück vier Aufstiege bis „Mythische Truhe“: jedes Mal „Upgrade!“, wieder drei Punkte; oben keine Punkte, „Besser geht es nicht. Tippe sie an!“. Geöffnet: +341 Münzen, 3x XP für zwei Runden, Serien-Schutz (kein Skin, weil vor dem 1.12.). Holztruhe mit erzwungenem Pech: nach zwei Tipps ein Punkt, „Noch 1 Versuch. Klappt er, gibt es 3 neue.“, dritter Tipp öffnet (+8 Münzen). Jeder Tipp stand sofort im Speicher. Hell und dunkel, keine Fehler in der Konsole. Töne nicht gehört. |
| 23.11.2026 | iPhone, Version 2.7 | Thomas meldet: Fotopaket über „Datei öffnen“ geladen, hat geklappt. Die App auf dem Home-Bildschirm nimmt die Datei also an. Offen bleibt, ob die Fotos bis in den Dezember gespeichert bleiben (am 1.12. Türchen 1 ansehen). |
| 23.11.2026 | Mac, Browser in Handy-Größe, Version 2.7 | Mit echtem Datum (23.11.) keine Spur vom Kalender. Uhr der Seite auf 3.12. gestellt: Karte „3 Türchen warten auf dich“, Raster mit 24 Türchen, Türchen 8 nennt seinen Tag und bleibt zu. Paket aus 22 Probebildern über Einstellungen geladen (23 Einträge in der Datenbank). Türchen 3: Foto, Satz, Wort des Tages, +10 Münzen. Nach Neuladen: Türchen offen, Foto kommt aus der Datenbank, kein zweites Geschenk. Türchen 1: Rätsel zeigt Antwort auf Tippen, Foto bleibt. Türchen 6 im Dunkelmodus mit Gutschein und Diamanttruhe. Keine Fehler in der Konsole. |
| 18.11.2026 | Mac, Browser in Handy-Größe, Version 2.6 | Hinweis „Ab Fach 3 schreibst du die Wörter selbst“. Knopf „Weiter lernen“ nennt „9 Wiederholungen + 1 neues Wort“ bei 12 wartenden Wörtern. Hörfrage: Wort wird beim Erscheinen vorgelesen, Knopf „Anhören“, Bedeutung, Eingabefeld; richtig geschrieben +4 XP, Fach 2 → 3. Schreibfragen am Tor: Fach 3 → 4. Neue Wörter weiter zum Ankreuzen. Keine Fehler in der Konsole. |
| 18.11.2026 | Mac, Browser mit Android-Kennung (375 px), Version 2.5 | Wächter-Eintrag nach dem Start da. Zurück: Reiter → Start, Einstellungen → Erfolge → Start, Runde mit Antwort → „Jetzt aufhören?“ → Runde läuft weiter, Import-Durchsicht → Eingabe. „Teilen“ übergibt `Voc a Bit - Theme 2 Celebrations.txt` (text/plain, 29 kB). Auf einem Stand ohne Theme 2 eingefügt: 152 erkannt, 5 schon vorhanden, 147 gespeichert mit Seiten und Abschnitten, Stationen im Lernpfad. Installieren-Karte hell und dunkel, Knopf ruft Chrome einmal. Einstellungen ohne iPhone-Hinweise. Anleitung: „Teilen“ zeigt drei Schritte, „Datei senden“ übergibt die Datei mit Kopfzeilen, Karte „Lektion von einem Freund?“ auf der Import-Seite. |
| 18.11.2026 | Mac, Browser, Version 2.4 | Stand aus 2.3 mit 3.400 XP geladen: Hinweis „Mehr XP für jede richtige Antwort!“, Level 11 „noch 425 XP“, Leiste „1,5x XP für deine nächste Runde“, richtige Antwort „+5 XP · 1,5x“, Ergebnis mit Zeile „XP-Booster“, Booster danach verbraucht. Keine Fehler in der Konsole. |
| 18.11.2026 | Mac, Browser in iPhone-Größe, Version 2.3 | Stand aus 2.2 geladen: gesperrte Truhe sofort offen, Booster als „nächste Runde“, Quests mit Zählerstand übernommen, keine Uhrzeit mehr auf dem Bildschirm. |
| 18.11.2026 | Mac, Browser in iPhone-Größe, Version 2.2 | Truhen-Leiste, Öffnen mit Upgrade, Beute, Booster im Quiz, Ergebnis-Schritt „Truhen“, Freischalten einer Zeit-Truhe und Ablauf des Boosters live geprüft, hell, dunkel und 320 px. |
| 17.11.2026 | Mac, Browser in iPhone-Größe, Version 2.1 | Neue Wörter, Stationen S. 229/230, Shop mit 14 Skins, Kauf und Hinweis geprüft; Tests bestanden. |
| 10.11.2026 | Mac, Browser in iPhone-Größe, Version 2.0 | Alle Ansichten in hell und dunkel durchgespielt, Tests bestanden. iPhone-Test offen (Aufgabe 6). |
| 11.10.2026 | iPhone (Thomas), Version 1.5 | Töne ok mit und ohne Stummschalter. Sprachausgabe bei Stummschalter an stumm. Umweg in 1.6 (lautloses `<audio>`) hat nicht geholfen → in 1.7 entfernt, stattdessen Hinweis in Einstellungen und Ton-Test. |
| 11.10.2026 | iPhone, Version 1.8 | Lernziel: Datumsfeld und rote Zahl am Icon funktionieren. |
| 02.11.2026 | iPhone, Version 1.13 | Befund: Schreibantwort „to ask (for sth)“ als falsch gewertet → in 1.14 behoben. Level seit Wochen „Word Wizard“ (Namensliste endete bei 8) → 1.14. |
| 14.10.2026 | iPhone, Version 1.12 | Lerntempo „Schnell“ und Kalendertage: Wörter wandern jetzt täglich ins nächste Fach. Sicherung vor dem Update wurde empfohlen. |
| 11.10.2026 | iPhone, Version 1.11 | Knopf „neue Wörter üben“ da, die 18 nie abgefragten Wörter sind durch. Rundenlogik 1.10 und Fach-5-Ruhezeit im Einsatz. |
| 11.10.2026 | iPhone, Version 1.9 | Seiten-Schalter in „Üben“ funktionieren. Hinweis: Nach einem Update muss die Home-Bildschirm-App einmal komplett geschlossen und zweimal neu gestartet werden, sonst zeigt sie noch die alte Fassung. |
| 11.10.2026 | iPhone (Sohn), Bildschirmzeit | Safari war über „Erlaubte Apps“ gesperrt → Home-Bildschirm-App startet nicht. Lösung bestätigt: Safari erlaubt, Webinhalt „Nur erlaubte Websites“ mit `https://daddytomsen.github.io/wordbox/`. App läuft, andere Seiten bleiben gesperrt. Anleitung in README. |
