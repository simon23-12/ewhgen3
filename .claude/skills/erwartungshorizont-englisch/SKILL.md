---
name: erwartungshorizont-englisch
description: Erstellt einen Erwartungshorizont für eine Englisch-Klausur der Oberstufe NRW (EF, Q1, Q2) direkt aus dem Klausurtext - mit Comprehension, Analysis, Aufgabe 3a/3b und Mediation samt NRW-Punkteverteilung. Nutze diesen Skill, wenn Simon eine Englisch-Klausur, einen englischen Text mit Aufgabenstellungen oder ein Klausur-PDF schickt und einen Erwartungshorizont, ein Bewertungsraster oder eine Musterlösung dazu will - auch ohne dass er das Wort "Erwartungshorizont" benutzt.
---

# Erwartungshorizont Englisch (Oberstufe NRW)

Erzeugt dasselbe Ergebnis wie die EWHgen3-Weboberfläche, aber direkt im Gespräch. Die Logik spiegelt `api/subjects/englisch.js`.

## Schritt 1: Klausurtyp bestimmen

Das entscheidet die gesamte Punkteverteilung:

- **Mediationstext (deutscher Text) vorhanden → Q1/Q2-Klausur**
- **Keine Mediation → EF-Klausur**

Wenn unklar ist, ob ein deutscher Textteil zur Mediation gehört oder nur Kontext ist, einmal nachfragen. Die Punkte hängen davon ab.

## Schritt 2: Punkte zuteilen

**EF (ohne Mediation), 60 Punkte:**

| Teilaufgabe | Punkte |
|---|---|
| 1 Comprehension | 16 |
| 2 Analysis | 24 |
| 3a | 20 |
| 3b (falls vorhanden) | 20 |

**Q1/Q2 (mit Mediation), 60 Punkte:**

| Teilaufgabe | Punkte |
|---|---|
| 1 Comprehension | 12 |
| 2 Analysis | 16 |
| 3a | 14 |
| 3b (falls vorhanden) | 14 |
| Teil B Mediation | 18 |

**3a und 3b haben immer dieselbe Punktzahl** — der Prüfling wählt genau eine davon. Beide werden trotzdem vollständig ausgearbeitet.

Punkte in Klammern, z. B. `(3)`, sind optionale Kriterien: Sie zählen in die Summe hinein, aber der Prüfling muss sie nicht alle bedienen. Jede Teilaufgabe schließt mit einem solchen offenen Kriterium ab, damit unerwartete gute Lösungen bewertbar bleiben. Nur ganze Zahlen, keine halben Punkte.

## Schritt 3: Textsorte erkennen

Die Analysis fällt je nach Textsorte völlig anders aus:

- **Romanauszug / Erzählung** → atmosphärische Wirkung, Charakterdarstellung, Beziehungen zwischen Figuren, Stimmung, Erzähltechnik (Perspektive, Zeitgestaltung)
- **Sachtext / Zeitungsartikel / Rede** → Wirkung auf den Leser, Überzeugungskraft, Argumentationsstruktur, persuasive Strategien

## Schritt 4: Kriterien schreiben

**Teilaufgabe 1 (Comprehension)** — Einleitungssatz mit Textsorte, Autor, Thema; danach die Hauptaussagen und Argumente des Textes.

**Teilaufgabe 2 (Analysis)** — Überleitungssatz, Wortwahl und ihre Effekte, dann **maximal fünf** konkrete rhetorische Mittel, jedes in eigener Zeile im Format:

```
• Metapher: "prison of her mind" (l. 15) – verdeutlicht die psychische Eingeschlossenheit der Protagonistin
• Rhetorische Frage: "Can we afford to wait?" (l. 8) – aktiviert den Leser und verstärkt die Dringlichkeit
```

Jedes Mittel braucht ein **wörtliches Zitat mit Zeilenangabe** und die Wirkung *im Kontext dieser Textsorte*. Abschließend ein Fazit zur Gesamtwirkung.

Wenn im Klausurtext keine Zeilennummern stehen, das Zitat ohne Zeilenangabe setzen und darauf hinweisen — keine Zeilennummern erfinden.

**Teilaufgabe 3a/3b** — Aufgabentyp aus der Aufgabenstellung ableiten (Evaluation, Discussion, Comment, Re-creation, Letter, Speech …) und passende, spezifische Kriterien bilden. Keine Standardfloskeln: Die Kriterien müssen erkennbar zu *dieser* Aufgabenstellung gehören.

**Teil B Mediation** (nur Q1/Q2) — genau **fünf** konkrete Kernpunkte aus dem deutschen Text, jeder in eigener Zeile, plus Adressatengerechtigkeit/Situationsangemessenheit und die sprachliche Übertragung ins Englische.

## Schritt 5: Ausgeben

Standard ist **Markdown zum Lesen und Ausdrucken**: pro Teilaufgabe eine Überschrift mit Punktzahl, darunter die nummerierten Kriterien mit ihren Punkten, am Ende die Gesamtsumme.

Auf Wunsch stattdessen das JSON-Schema der App (`teilaufgaben` → `kriterien` mit `nr`, `text`, `punkte`), das sich in EWHgen3 weiterverarbeiten lässt.

## Vor der Abgabe prüfen

- Ergeben die Punkte pro Teilaufgabe **exakt** den Sollwert, Klammerpunkte eingerechnet?
- Haben 3a und 3b dieselbe Punktzahl?
- Stammt jedes Zitat wirklich aus dem vorgelegten Text?
- Sind es höchstens fünf rhetorische Mittel und bei der Mediation genau fünf Kernpunkte?
- Sind es 3 Teilaufgaben (EF ohne 3b), 4 (EF mit 3b oder Q1/Q2 ohne 3b) bzw. 5 (Q1/Q2 mit 3b)?

Eine Darstellungsleistung wird **nicht** generiert — die kommt aus dem NRW-Raster und ist nicht Teil dieses Erwartungshorizonts.
