// Deutsch Subject Module
// Generates prompts for German (Deutsch) Klausuren NRW (EF, Q1, Q2)
// Uses Gemini Vision for PDF analysis (can see text layout, formatting)

// PDF Vision prompt - OPTIMIERT für textspezifische NRW-Erwartungshorizonte
export function generatePDFVisionPrompt() {
  return `Du erstellst einen Erwartungshorizont für diese KONKRETE Deutsch-Klausur nach NRW-Standard.

KRITISCHE REGEL: Alle Anforderungen müssen TEXTSPEZIFISCH sein!
FALSCH: "benennt das Thema des Textes" (zu generisch)
RICHTIG: "benennt das Thema des Textes, etwa: Ursachen der Kritik des Gebrauchs von nicht-standardsprachlichen Varietäten am Beispiel von Menschen, die Kiezdeutsch sprechen"

ANALYSIERE DIE KLAUSUR:
1. Lies den Primärtext (Sachtext/Gedicht/Dramenszene) GENAU
2. Lies die Aufgabenstellung GENAU - IDENTIFIZIERE DIE EXAKTE PUNKTEVERTEILUNG!
3. Identifiziere den Klausurtyp
4. Erstelle Anforderungen, die sich AUF DIESEN SPEZIFISCHEN TEXT beziehen
5. WICHTIG: Die Gesamtpunkte für Aufgabe 1 und Aufgabe 2 MÜSSEN EXAKT der Klausur entsprechen!

WICHTIG - STRUKTUR:
- Erstelle NUR Aufgabe 1 und Aufgabe 2 im JSON
- KEINE Aufgabe 3 (Darstellungsleistung) - wird automatisch generiert
- KEINE "Sachlich richtige Alternativloesung" als Bewertungspunkt
- Letzte Anforderung ist immer "(erfüllt ein weiteres aufgabenbezogenes Kriterium)" - PUNKTE IN KLAMMERN!
- KRITISCH: Die Punkte ALLER Anforderungen (OHNE "erfüllt ein weiteres") müssen EXAKT die Gesamtpunkte der Aufgabe ergeben!
  Beispiel: Aufgabe 1 hat 42 Punkte → Anf.1-6 zusammen = 42P, Anf.7 "(erfüllt...)" = (4) extra
- Bei Aufgabe 2: Die kursive Zeile "Angestrebt ist..." erscheint NUR EINMAL als eigenständige Anforderung MIT 0 Punkten VOR "(erfüllt ein weiteres...)"

BEISPIEL aus echter NRW-Klausur (Heike Wiese Text):
Anforderung 3 (10 Punkte): "stellt Wieses Position dar, etwa:
 - Kritik an einer weithin angenommenen normativen Hierarchie von Sprachformen unterschiedlicher Güte,
 - positive Haltung zur Entwicklung und zum Gebrauch von Kiezdeutsch als einer bereichernden Varietät des Deutschen,
 - Verständnis von Kiezdeutsch als im multiethnischen Wohnumfeld beheimatetes produktives eigenes Sprachsystem,
 - Einstufung von Kiezdeutsch als Dialekt unter dem Aspekt systematischer Weiterentwicklung der deutschen Sprache,
 - Zurückweisung gängiger Abwertungen dieser Varietäten als Mythos"

SIEHST DU? Jeder Bullet-Point bezieht sich auf KONKRETE INHALTE aus Wieses Text!

STRUKTUR-VORGABEN:

SACHTEXTANALYSE (wie Heike Wiese):
WICHTIG: Die Punkteverteilung ist nur ein BEISPIEL - nutze die TATSÄCHLICHEN Punkte aus der Klausur!

Aufgabe 1 (Punkte aus PDF übernehmen!):
1. Einleitung mit Autor/Titel/Textsorte/Datum (ca. 3P)
2. Thema benennen - MIT konkretem Inhalt aus dem Text (ca. 4P)
3. Position darstellen - MIT 5-7 spezifischen Thesen des Autors (ca. 10P)
4. Argumente untersuchen (kritisch) - MIT konkreten Argumenten aus dem Text (ca. 9P)
5. Argumente untersuchen (stützend) - MIT konkreten Beispielen (ca. 4P)
6. Leserlenkung - MIT spezifischen rhetorischen Mitteln, Fachbegriffen, Beispielen aus dem Text (ca. 9P)
7. (erfüllt ein weiteres aufgabenbezogenes Kriterium) (ca. 4P)

Aufgabe 2 (Punkte aus PDF übernehmen! z.B. 30P):
1. Überleitung (ca. 3P)
2. Funktionen Sprachvarietäten - BEZOGEN auf den Text (ca. 6P)
3. Funktionen Standardsprache - BEZOGEN auf Unterrichtsthemen (ca. 6P)
4. Stellung PRO - MIT 3-5 konkreten Argumenten (ca. 6P)
5. Stellung CONTRA - MIT 3-5 konkreten Gegenargumenten (ca. 6P)
6. Fazit (ca. 3P)
→ SUMME Anf.1-6 = 30P (entspricht Gesamtpunkte der Aufgabe!)
7. [KURSIV, 0 Punkte]: "Angestrebt ist hier keine vollständige Darstellung der beispielhaft genannten Aspekte, sondern eine differenzierte Schwerpunktsetzung durch den Prüfling, die allerdings mehrere Gesichtspunkte aufgreift."
8. (erfüllt ein weiteres aufgabenbezogenes Kriterium) (4P in Klammern)

GEDICHTANALYSE (wie Trakl "Der Gewitterabend"):
WICHTIG: Punkte aus der tatsächlichen Klausur übernehmen!

Aufgabe 1 (Punkte aus PDF!):
1. Einleitung mit Autor/Titel/Textsorte/Datum (ca. 3P)
2. Thema - z.B. "poetische Darstellung eines gewaltigen Naturgeschehens" (ca. 3P)
3. Sprechsituation - konkret: wer spricht, Perspektive (ca. 3P)
4. Inhalt - Strophe für Strophe mit konkreten Bildern aus dem Gedicht (ca. 6P)
5. Form - Reimschema, Metrum, Kadenz, Enjambements (ca. 3P)
6. Bildlichkeit/Wortwahl - MIT Zitaten und Interpretationen (ca. 9P)
7. Weitere Mittel - Syntax, rhetorische Figuren MIT Beispielen (ca. 6P)
8. Deutung - thematische Einordnung (ca. 6P)
9. (erfüllt ein weiteres aufgabenbezogenes Kriterium) (Rest)

Aufgabe 2 (Punkte aus PDF! z.B. 36P) - GEDICHTVERGLEICH:
1. Überleitung (ca. 2P)
2. Analyse zweites Gedicht - Form, Inhalt, Struktur (siehe Aufgabe 1 Struktur) (ca. 10P)
3. VERGLEICH Gemeinsamkeiten - Krieg als Ursache, Leid, Tod, existentielle Erschütterung (ca. 10P)
4. VERGLEICH Unterschiede - Klemm zeigt moderne Orientierungslosigkeit, Gryphius religiöse Verarbeitung; Klemm modern/fragmentiert, Gryphius Barocke Jenseitsorientierung trotz Qual (ca. 10P)
5. VERGLEICH Gestaltung - Form: Beide Sonett (Gryphius Alexandriner/durchgehend Quartett, Klemm modern/fragmentiert); Sprache: Gryphius barocke Rhetorik, Klemm expressionistische/montage-technik; Bildlichkeit: Gryphius Vanitas-Symbolik, Klemm technisierte/urbane Schreckensbilder (ca. 4P)
→ SUMME Anf.1-5 = 36P (entspricht Gesamtpunkte!)
6. [KURSIV, 0 Punkte]: "Angestrebt ist hier keine vollständige Darstellung der beispielhaft genannten Aspekte, sondern eine differenzierte Schwerpunktsetzung durch den Prüfling, die allerdings mehrere Gesichtspunkte aufgreift."
7. (erfüllt ein weiteres aufgabenbezogenes Kriterium) (4P in Klammern)

DRAMENANALYSE (wie Faust):
WICHTIG: Punkte aus der tatsächlichen Klausur übernehmen!

Aufgabe 1 (Punkte aus PDF!):
1. Einleitung mit Autor/Werk/Szene (ca. 3P)
2. Kommunikationssituation - wer spricht mit wem, Kontext (ca. 2-3P)
3. Einordnung in Handlung - was ist vorher passiert (ca. 3P)
4. Inhalt - Szenenablauf mit konkreten Aussagen der Figuren (ca. 6-7P)
5. Figurenanalyse - innerer Zustand MIT Textbelegen (ca. 9P)
6. Dialogische Situation - Konflikte, Beziehungen (ca. 5P)
7. Sprachliche Gestaltung - Stilmittel MIT Zitaten (ca. 8P)
8. Schlussfolgerung (ca. 3P)
9. (erfüllt ein weiteres aufgabenbezogenes Kriterium) (Rest)

FORMULIERUNGSREGELN:
1. Jede Anforderung beginnt mit Verb in 3. Person: "verfasst", "benennt", "stellt dar", "untersucht", "erläutert", "erschließt", "prüft", "nimmt Stellung"
2. Nach dem Hauptsatz kommt "etwa:" und dann 3-8 Bullet-Points
3. Bullet-Points sind MIT KONKRETEN Textbezügen, Zitaten, Beispielen
4. NIEMALS bei einzelnen Anforderungen "Angestrebt ist hier..." verwenden - das kommt NUR als separate Anforderung!
5. KRITISCH für Aufgabe 2:
   - Vorletzte Anforderung: "Angestrebt ist hier keine vollständige Darstellung der beispielhaft genannten Aspekte, sondern eine differenzierte Schwerpunktsetzung durch den Prüfling, die allerdings mehrere Gesichtspunkte aufgreift." MIT 0 Punkten
   - Letzte Anforderung: "(erfüllt ein weiteres aufgabenbezogenes Kriterium)" MIT (4) Punkten in Klammern

KRITISCH - WAS DU TUN MUSST:
- Lies den Text und nenne KONKRETE Thesen/Argumente/Motive
- Zitiere oder paraphrasiere spezifische Textpassagen
- Nenne spezifische Stilmittel mit Zeilenangaben
- Bei Gedichten: konkrete Metaphern, Symbole aus DIESEM Gedicht
- Bei Sachtexten: konkrete Argumente, Beispiele aus DIESEM Text
- Bei Drama: konkrete Aussagen der Figuren, spezifische Konflikte
- WICHTIG: Bei Vergleichsaufgaben IMMER sowohl Gemeinsamkeiten ALS AUCH Unterschiede benennen!

NIEMALS:
- Generisch: "untersucht die Argumente des Textes"
- Ohne Textbezug: "analysiert die sprachliche Gestaltung"

JSON-STRUKTUR (EXAKT):
{
  "klausurInfo": {
    "stufe": "Q2",
    "kursart": "GK",
    "klausurtyp": "Sachtextanalyse",
    "gesamtpunkte": 100
  },
  "aufgaben": [
    {
      "nummer": 1,
      "titel": "Textanalyse",
      "teilaufgaben": [
        {
          "bezeichnung": "1",
          "punkte": 39,
          "erwartung": "Erwartete Leistung: Analyse des Sachtextes hinsichtlich Position, Argumentation und Leserlenkung",
          "bewertung": [
            {
              "anf": "verfasst eine aufgabenbezogene Einleitung unter Nennung von Autor, Titel, Textsorte, Erscheinungsdatum",
              "p": 3
            },
            {
              "anf": "benennt das Thema des Textes, etwa: [KONKRETE Themenbeschreibung aus dem vorliegenden Text]",
              "p": 4
            },
            {
              "anf": "stellt die Position des Verfassers dar, etwa: [5-7 konkrete Thesen mit Bullet-Points]",
              "p": 10
            },
            {
              "anf": "untersucht die Argumente im Hinblick auf kritische Auseinandersetzung mit anderen Standpunkten, etwa: [konkrete Argumente aus dem Text mit Bullet-Points]",
              "p": 9
            },
            {
              "anf": "untersucht Argumente zur Stärkung der eigenen Position, etwa: [konkrete Beispiele aus dem Text]",
              "p": 4
            },
            {
              "anf": "untersucht die Art der Leserlenkung, etwa: [spezifische rhetorische Mittel, Fachbegriffe, Beispiele MIT Textbelegen]",
              "p": 9
            },
            {
              "anf": "(erfüllt ein weiteres aufgabenbezogenes Kriterium)",
              "p": 4
            }
          ]
        }
      ]
    },
    {
      "nummer": 2,
      "titel": "Transfer und Stellungnahme",
      "teilaufgaben": [
        {
          "bezeichnung": "2",
          "punkte": 33,
          "erwartung": "Erwartete Leistung: [Beschreibung basierend auf Aufgabe 2]",
          "bewertung": [
            {
              "anf": "verfasst eine aufgabenbezogene Überleitung",
              "p": 3
            }
          ]
        }
      ]
    }
  ]
}

JSON-SYNTAX-REGELN:
- ALLE "p"-Werte sind Zahlen ohne Klammern: "p": 4
- KEINE trailing commas
- Strings in doppelten Anführungszeichen
- KEINE "Sachlich richtige Alternativloesung" Einträge - diese werden automatisch generiert
- Darstellungsleistung wird NICHT im JSON erstellt - nur die inhaltlichen Aufgaben 1 und 2
- Aufgabe 3 (Darstellungsleistung) wird automatisch vom Frontend hinzugefügt

AUSGABE: Nur valides JSON mit Aufgaben 1 und 2, keine Erklärungen.`;
}

// Fallback for text-extracted PDFs
export function generatePrompt(data) {
  if (data.pdfText) {
    return generatePromptFromPDF(data.pdfText);
  }

  const { primaryText, task1, task2, task3 } = data;
  return generatePromptFromText(primaryText, task1, task2, task3);
}

function generatePromptFromPDF(pdfText) {
  return `Analysiere diese NRW Deutsch-Klausur und erstelle einen textspezifischen Erwartungshorizont.

KLAUSUR:
${pdfText}

WICHTIG: Alle Anforderungen müssen sich auf den konkreten Text beziehen!
Nenne spezifische Argumente, Thesen, Stilmittel aus diesem Text.

Erstelle den Erwartungshorizont mit der Struktur:
- Teilaufgabe 1: 39-40 Punkte (Analyse)
- Teilaufgabe 2: 32-33 Punkte (Transfer/Stellungnahme)
- Je 6-9 nummerierte Anforderungen pro Teilaufgabe
- Letzte Anforderung: "(erfüllt ein weiteres aufgabenbezogenes Kriterium)"
- Konkrete, textbezogene Sub-Bullets mit "etwa:" eingeleitet

AUSGABE - NUR valides JSON ohne Kommentare:
{
  "klausurInfo": {"stufe": "Q2", "kursart": "GK", "klausurtyp": "", "gesamtpunkte": 100},
  "aufgaben": [...]
}`;
}

function generatePromptFromText(primaryText, task1, task2, task3) {
  return `Du erstellst einen Erwartungshorizont für diese NRW Deutsch-Klausur nach offiziellem Standard.

KLAUSURTEXT:
${primaryText}

AUFGABEN:
1. ${task1}
2. ${task2}
${task3 ? '3. ' + task3 : ''}

KRITISCH: Erstelle textspezifische Anforderungen!
Nenne konkrete Thesen, Argumente, Stilmittel aus diesem Text.

Erstelle einen Erwartungshorizont mit:
- 6-9 Anforderungen pro Teilaufgabe
- Konkrete, textbezogene Erwartungen mit "etwa:" und Bullet-Points
- Sub-Bullets mit spezifischen Textinhalten
- Trennung von Pro/Contra bei Stellungnahmen
- "(erfüllt ein weiteres aufgabenbezogenes Kriterium)" als letzte Anforderung

AUSGABE - NUR valides JSON:
{
  "klausurInfo": {"stufe": "Q2", "kursart": "GK", "klausurtyp": "", "gesamtpunkte": 100},
  "aufgaben": [...]
}`;
}
