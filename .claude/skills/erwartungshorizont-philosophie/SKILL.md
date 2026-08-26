---
name: erwartungshorizont-philosophie
description: Erstellt einen Erwartungshorizont für eine Philosophie-Klausur der Oberstufe NRW direkt aus Primärtext bzw. Zitat und den drei Teilaufgaben - mit NRW-Punkteverteilung, Bulletpoints und Orientierungstexten für 50%- und 100%-Leistung. Nutze diesen Skill, wenn Simon einen philosophischen Text, ein Zitat oder eine Philosophie-Klausur schickt und einen Erwartungshorizont, ein Bewertungsraster oder eine Musterlösung dazu will - auch ohne dass er das Wort "Erwartungshorizont" benutzt.
---

# Erwartungshorizont Philosophie (Oberstufe NRW)

Erzeugt dasselbe Ergebnis wie die EWHgen3-Weboberfläche, aber direkt im Gespräch. Die Logik spiegelt `api/subjects/philosophie.js`.

## Schritt 1: Aufgabentyp bestimmen

Entscheidend ist die **erste Teilaufgabe**. Enthält sie „Text", „Gedankengang" oder „Autor", ist es eine Texterschließung — sonst eine Problemerörterung. Im Zweifel: Liegt ein zusammenhängender philosophischer Text vor, ist es Typ A; liegt nur ein Zitat oder eine These vor, ist es Typ B.

**Typ A — Erschließung eines philosophischen Textes mit Vergleich und Beurteilung**

| Aufgabe | Punkte |
|---|---|
| 1 Texterschließung | 26 |
| 2 Vergleich | 30 |
| 3 Beurteilung | 24 |

**Typ B — Erörterung eines philosophischen Problems auf Grundlage philosophischer Aussagen**

| Aufgabe | Punkte |
|---|---|
| 1 Zitatsanalyse | 10 |
| 2 Problemerörterung | 42 |
| 3 Stellungnahme | 28 |

Beide Typen ergeben 80 Punkte. **Nur ganze Zahlen, keine halben Punkte.** Die Summe je Aufgabe muss exakt stimmen.

## Schritt 2: Kriterien schneiden

**Typ A:**

- *Aufgabe 1 (26)*: Ausgangsfrage darstellen (2–3) · zentrale These darstellen (3–4) · Gedankengang erarbeiten (13–14) · gedanklichen Aufbau/Konnektoren kennzeichnen (6)
- *Aufgabe 2 (30)*: Vergleichsposition in Grundzügen darstellen (10–12) · Position einordnen (2) · Gemeinsamkeiten (4) · Unterschiede herausarbeiten (12–16)
- *Aufgabe 3 (24)*: Überzeugungskraft Position 1 (8) · Überzeugungskraft Position 2 (8) · Stellungnahme zur Leitfrage (8)

**Typ B:**

- *Aufgabe 1 (10)*: Aussage des Zitats differenziert darstellen — zentrales Problem, Definition, Beispiele aus dem Zitat
- *Aufgabe 2 (42)*: **exakt vier** Kriterien, **kein** Vergleichskriterium — Position 1 in Grundzügen (10) · Problem aus Sicht von Position 1 (12) · Position 2 in Grundzügen (10) · Problem aus Sicht von Position 2 (10)
- *Aufgabe 3 (28)*: **exakt drei** Kriterien — abwägend dafür (10, drei Pro-Argumente) · abwägend dagegen (10, drei Contra-Argumente) · eigene begründete Stellungnahme (8)

## Schritt 3: Jedes Kriterium dreiteilig ausformulieren

Das ist der Kern und der Unterschied zu einer bloßen Stichwortliste.

**1. Anforderungsformulierung** in NRW-Sprache, im Präsens der dritten Person, ohne Subjekt:
„stellt als zentrale These dar, dass …", „erarbeitet den Gedankengang des Textes:", „arbeitet als Unterschiede heraus:", „nimmt abwägend Stellung zu …"

**2. Bulletpoints** — 3 bis 8 konkrete inhaltliche Stichpunkte, was der Prüfling leisten muss. Diese müssen **aus dem vorgelegten Primärtext oder Zitat destilliert** sein, nicht aus philosophischem Allgemeinwissen. Wer die Bulletpoints liest, muss erkennen, um welchen Text es geht.

**3. Orientierungstexte** für die Bewertung, beide beginnend mit „Der Prüfling …":

- `orientierungHalb` beschreibt eine ~50%-Leistung — typischerweise reproduktiv, paraphrasierend, lückenhaft, aneinandergereihte Zitate
- `orientierungVoll` beschreibt die Vollleistung — eigenständige Formulierungen, funktionale Zitate, strukturiert an der gedanklichen statt der linearen Struktur orientiert, philosophische Fachsprache

**Bei Kriterien mit 3 Punkten oder weniger bleiben beide Orientierungstexte leer.** Der Aufwand lohnt dort nicht.

## Schritt 4: Fachsprache

Philosophische Terminologie ist Pflicht, nicht Schmuck: Determinismus, Kompatibilismus, kategorischer Imperativ, Deontologie, Konsequenzprinzip, Utilitarismus, Autonomie, Kontingenz. Die Begriffe müssen zur tatsächlich verhandelten Position passen — lieber ein Begriff weniger als ein falsch verwendeter.

## Schritt 5: Ausgeben

Standard ist **Markdown zum Lesen und Ausdrucken**: pro Aufgabe eine Überschrift mit Punktzahl, darunter die nummerierten Kriterien mit Anforderungsformulierung, Bulletpoints und den beiden Orientierungstexten.

Auf Wunsch stattdessen das JSON-Schema der App (`teilaufgaben` → `kriterien` mit `nr`, `text`, `punkte`, `bulletpoints`, `orientierungHalb`, `orientierungVoll`).

## Vor der Abgabe prüfen

- Ergibt jede Aufgabe **exakt** ihren Sollwert (26/30/24 bzw. 10/42/28)?
- Nur ganze Zahlen?
- Bei Typ B: Aufgabe 2 mit genau vier, Aufgabe 3 mit genau drei Kriterien?
- **Genau drei** Teilaufgaben insgesamt?
- Beziehen sich die Bulletpoints erkennbar auf den vorgelegten Text und nicht auf die Position im Allgemeinen?
- Orientierungstexte bei Kriterien ≤ 3 Punkte leer?

Eine Darstellungsleistung wird **nicht** generiert — die kommt aus dem NRW-Raster und ist nicht Teil dieses Erwartungshorizonts.
