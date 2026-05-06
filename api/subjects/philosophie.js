// Philosophie Subject Module
// Generates prompts for Philosophy Abitur NRW

export function generatePrompt(data) {
  const { primaryText, teilaufgabeA, teilaufgabeB, teilaufgabeC } = data;

  const isTexterschliessung = teilaufgabeA.toLowerCase().includes('text') ||
                               teilaufgabeA.toLowerCase().includes('gedankengang') ||
                               teilaufgabeA.toLowerCase().includes('autor');

  const punkteA = isTexterschliessung ? 26 : 10;
  const punkteB = isTexterschliessung ? 30 : 42;
  const punkteC = isTexterschliessung ? 24 : 28;

  const typName = isTexterschliessung
    ? 'Erschließung eines philosophischen Textes mit Vergleich und Beurteilung'
    : 'Erörterung eines philosophischen Problems auf der Grundlage einer oder mehrerer philosophischer Aussagen';

  return `Du bist ein Erwartungshorizont-Generator für Philosophie Abitur NRW.

AUFGABENTYP: ${typName}

PRIMÄRTEXT/ZITAT:
${primaryText}

AUFGABE 1 (${punkteA} Punkte):
${teilaufgabeA}

AUFGABE 2 (${punkteB} Punkte):
${teilaufgabeB}

AUFGABE 3 (${punkteC} Punkte):
${teilaufgabeC}

ANWEISUNG: Antworte AUSSCHLIESSLICH mit validem JSON. Keine Erklärungen, keine Markdown-Formatierung.

WICHTIG - KEINE HALBEN PUNKTE: Nur ganze Zahlen (1, 2, 3, ...).

DETAILGRAD - ORIENTIERE DICH AM NRW-ABITUR-ORIGINAL:
Jedes Kriterium besteht aus drei Teilen:
1. "text": Die übergeordnete Anforderungsformulierung in der NRW-Sprache (z.B. "stellt als zentrale These dar, dass...", "erarbeitet den Gedankengang des Textes:", "arbeitet als Unterschiede heraus:")
2. "bulletpoints": Liste konkreter inhaltlicher Stichpunkte, WAS der Prüfling leisten muss (3-8 Punkte). Orientiere dich eng am Primärtext/Zitat.
3. "orientierungHalb": Text der beschreibt, was eine ~50%-Leistung kennzeichnet. Beginnt mit "Der Prüfling erarbeitet/stellt..." (leer "" bei Kriterien ≤3 Punkte)
4. "orientierungVoll": Text der beschreibt, was eine Vollleistung (100%) kennzeichnet. Beginnt mit "Der Prüfling erarbeitet/stellt..." (leer "" bei Kriterien ≤3 Punkte)

PUNKTEVERTEILUNG:
${isTexterschliessung ?
`- Aufgabe 1 (Texterschließung): ${punkteA} Punkte, aufgeteilt in 4-5 Kriterien:
  * Ausgangsfrage darstellen (2-3 Punkte) - keine Orientierungstexte nötig
  * Zentrale These darstellen (3-4 Punkte)
  * Gedankengang erarbeiten (~13-14 Punkte) - mit 6-10 Bulletpoints zum Inhalt + beide Orientierungstexte
  * Gedanklichen Aufbau kennzeichnen / Konnektoren (6 Punkte) - kurze Orientierungen
- Aufgabe 2 (Vergleich): ${punkteB} Punkte, aufgeteilt in 4-5 Kriterien:
  * Vergleichsposition in Grundzügen darstellen (10-12 Punkte) - mit philosophischen Bulletpoints + beide Orientierungen
  * Position kennzeichnen/einordnen (2 Punkte) - keine Orientierungstexte
  * Gemeinsamkeiten herausarbeiten (4 Punkte)
  * Unterschiede herausarbeiten (12-16 Punkte) - mit Bulletpoints zu konkreten Gegensätzen + beide Orientierungen
- Aufgabe 3 (Beurteilung): ${punkteC} Punkte, aufgeteilt in 3 Kriterien:
  * Überzeugungskraft Position 1 beurteilen (8 Punkte) - mit konkreten Argumenten als Bulletpoints
  * Überzeugungskraft Position 2 beurteilen (8 Punkte)
  * Stellung nehmen zur Leitfrage (8 Punkte) - mit möglichen Argumentationslinien als Bulletpoints` :
`- Aufgabe 1 (Zitatsanalyse): ${punkteA} Punkte, aufgeteilt in 2 Kriterien:
  * Aussage des Zitats differenziert darstellen (8-10 Punkte) - mit Bulletpoints zu: zentralem Problem, Definition, Beispielen aus dem Zitat, zynischer Interpretation
- Aufgabe 2 (Problemerörterung): ${punkteB} Punkte, EXAKT 4 Kriterien - KEIN "Vergleich"-Kriterium:
  * Position 1 (z.B. Kant) Grundzüge darstellen (10 Punkte) - philosophische Kernbegriffe als Bulletpoints
  * Problem aus Sicht von Position 1 erläutern (12 Punkte) - konkrete Bezüge zum Zitat als Bulletpoints
  * Position 2 (z.B. Utilitarismus) Grundzüge darstellen (10 Punkte)
  * Problem aus Sicht von Position 2 erläutern (10 Punkte) - konkrete Bezüge zum Zitat
  SUMME MUSS EXAKT ${punkteB} PUNKTE ERGEBEN (10+12+10+10=42)
- Aufgabe 3 (Stellungnahme): ${punkteC} Punkte, EXAKT 3 Kriterien:
  * Abwägend Stellung nehmen FÜR die Berücksichtigung von [Thema] (10 Punkte) - 3 konkrete Pro-Argumente als Bulletpoints
  * Abwägend Stellung nehmen GEGEN die Berücksichtigung von [Thema] (10 Punkte) - 3 konkrete Contra-Argumente
  * Eigene begründete Stellungnahme entwickeln (8 Punkte)
  SUMME MUSS EXAKT ${punkteC} PUNKTE ERGEBEN (10+10+8=28)`}

FORMAT (GENAU 3 Teilaufgaben - KEINE Darstellungsleistung generieren):
{
  "teilaufgaben": [
    {
      "name": "Aufgabe 1: [Kurzname aus Aufgabenstellung, max. 8 Wörter]",
      "typ": "[z.B. Texterschließung / Zitatsanalyse]",
      "kriterien": [
        {
          "nr": 1,
          "text": "stellt als Ausgangsfrage des Textes dar, ob...",
          "punkte": 2,
          "bulletpoints": [],
          "orientierungHalb": "",
          "orientierungVoll": ""
        },
        {
          "nr": 2,
          "text": "stellt als zentrale These dar, dass...",
          "punkte": 4,
          "bulletpoints": [
            "Der Mensch kann nicht für seine Handlungen verantwortlich gemacht werden, da...",
            "Sein Charakter ist durch Erbanlagen und frühkindliche Umwelt determiniert",
            "Diese Faktoren hat er nicht selbst gewählt"
          ],
          "orientierungHalb": "Der Prüfling stellt die zentrale These nur ansatzweise dar oder paraphrasiert den Text ohne eigenständige Formulierungen.",
          "orientierungVoll": "Der Prüfling stellt die zentrale These präzise und differenziert dar, unter Verwendung eigenständiger Formulierungen und philosophischer Fachbegriffe."
        },
        {
          "nr": 3,
          "text": "erarbeitet den Gedankengang des Textes:",
          "punkte": 14,
          "bulletpoints": [
            "Ausgangspunkt ist die Frage nach der moralischen Verantwortung des Menschen",
            "...",
            "..."
          ],
          "orientierungHalb": "Der Prüfling erarbeitet nur einige der o. g. Argumente und/oder beschreibt den Gedankengang in weitgehend reproduktiver Form (gelegentliche Paraphrasen, aneinandergereihte Textzitate).",
          "orientierungVoll": "Der Prüfling erarbeitet die o. g. Argumente umfassend und strukturiert (eigenständige Formulierungen, funktionale Zitate), erläutert seine Ausführungen sachgerecht und orientiert sich eher an der gedanklichen Struktur des Textes als an seiner linearen Abfolge."
        }
      ]
    },
    {
      "name": "Aufgabe 2: [Kurzname]",
      "typ": "[z.B. Vergleich / Problemerörterung]",
      "kriterien": [...]
    },
    {
      "name": "Aufgabe 3: [Kurzname]",
      "typ": "[z.B. Beurteilung / Stellungnahme]",
      "kriterien": [...]
    }
  ]
}

KRITISCHE ANFORDERUNGEN:
- Nur ganze Zahlen, keine halben Punkte
- Aufgabe 1 MUSS EXAKT ${punkteA} Punkte ergeben
- Aufgabe 2 MUSS EXAKT ${punkteB} Punkte ergeben
- Aufgabe 3 MUSS EXAKT ${punkteC} Punkte ergeben
- GENAU 3 Teilaufgaben im JSON - keine Darstellungsleistung
- Bulletpoints enthalten konkrete, aus dem Primärtext/Zitat destillierte Inhalte
- Orientierungstexte beschreiben qualitativ den Unterschied zwischen ~50% und 100% Leistung
- Philosophische Fachsprache verwenden (Determinismus, kategorischer Imperativ, Deontologie, Konsequenzprinzip, etc.)
- Alle JSON-Klammern korrekt schließen
- Keine Sonderzeichen die JSON brechen`;
}
