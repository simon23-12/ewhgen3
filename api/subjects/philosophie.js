// Philosophie Subject Module
// Generates prompts for Philosophy Abitur NRW

export function generatePrompt(data) {
  const { primaryText, teilaufgabeA, teilaufgabeB, teilaufgabeC } = data;

  // Automatische Erkennung des Aufgabentyps basierend auf Aufgabe 1
  const isTexterschliessung = teilaufgabeA.toLowerCase().includes('text') ||
                               teilaufgabeA.toLowerCase().includes('gedankengang') ||
                               teilaufgabeA.toLowerCase().includes('autor');

  const punkteA = isTexterschliessung ? 26 : 10;
  const punkteB = isTexterschliessung ? 30 : 42;
  const punkteC = isTexterschliessung ? 24 : 28;

  const typName = isTexterschliessung
    ? 'Erschließung eines philosophischen Textes mit Vergleich und Beurteilung'
    : 'Erörterung eines philosophischen Problems';

  return `Du bist ein Erwartungshorizont-Generator für Philosophie Abitur in NRW.

AUFGABE: Erstelle einen Erwartungshorizont für folgenden Aufgabentyp: ${typName}

PRIMÄRTEXT/ZITAT:
${primaryText}

AUFGABE 1 (${punkteA} Punkte):
${teilaufgabeA}

AUFGABE 2 (${punkteB} Punkte):
${teilaufgabeB}

AUFGABE 3 (${punkteC} Punkte):
${teilaufgabeC}

ANWEISUNG: Antworte AUSSCHLIESSLICH mit validem JSON. Keine Erklärungen, keine Markdown-Formatierung.

WICHTIG - KEINE HALBEN PUNKTE:
- Verwende NIEMALS halbe Punkte (z.B. 1.5, 2.5)
- Nur ganze Zahlen (1, 2, 3, 4, etc.)

PUNKTEVERTEILUNG:
${isTexterschliessung ?
`- Aufgabe 1 (Texterschließung): ${punkteA} Punkte - GROBE Unterteilung in 4-6 Kriterien
  * Ausgangsfrage (3 Punkte)
  * Zentrale These (4 Punkte)
  * Gedankengang in Hauptargumenten (ca. 12-13 Punkte, aufgeteilt in 4-6 größere Argumentblöcke)
  * Gedanklichen Aufbau kennzeichnen (6 Punkte)
- Aufgabe 2 (Vergleich): ${punkteB} Punkte
  * Vergleichsposition darstellen (10-12 Punkte)
  * Position kennzeichnen (2 Punkte)
  * Gemeinsamkeiten (4 Punkte)
  * Unterschiede (12-16 Punkte)
- Aufgabe 3 (Beurteilung): ${punkteC} Punkte
  * Überzeugungskraft Position 1 (8 Punkte)
  * Überzeugungskraft Position 2 (8 Punkte)
  * Stellungnahme zur Leitfrage (8 Punkte)` :
`- Aufgabe 1 (Zitatsanalyse): ${punkteA} Punkte - GROBE Unterteilung in 3-4 Kriterien
  * Problem identifizieren (3-4 Punkte)
  * Aussage des Zitats differenziert darstellen (6-7 Punkte)
- Aufgabe 2 (Problemerörterung): ${punkteB} Punkte
  * Problem aus Sicht von Position 1: ca. 10-12 Punkte
  * Problem aus Sicht von Position 2: ca. 10-12 Punkte
  * Vergleich/Kontrastierung: ca. 18-22 Punkte
- Aufgabe 3 (Stellungnahme): ${punkteC} Punkte
  * Abwägende Argumentation für beide Seiten (14 Punkte)
  * Eigene begründete Position (14 Punkte)`}
- Darstellungsleistung: 20 Punkte (wird automatisch hinzugefügt)
- GESAMTSUMME: 100 Punkte

FORMAT:
{
  "teilaufgaben": [
    {
      "name": "Aufgabe 1: [Erkenne aus Aufgabenstellung]",
      "typ": "[z.B. Texterschließung, Zitatsanalyse]",
      "kriterien": [
        {"nr": 1, "text": "[Spezifisches Kriterium]", "punkte": 4},
        {"nr": 2, "text": "[Weiteres Kriterium]", "punkte": 4},
        ...
      ]
    },
    {
      "name": "Aufgabe 2: [Erkenne aus Aufgabenstellung]",
      "typ": "[z.B. Vergleich, Problemerörterung]",
      "kriterien": [...]
    },
    {
      "name": "Aufgabe 3: [Erkenne aus Aufgabenstellung]",
      "typ": "[z.B. Beurteilung, Stellungnahme]",
      "kriterien": [...]
    },
    {
      "name": "Darstellungsleistung",
      "typ": "Sprachliche Darstellung",
      "kriterien": [
        {"nr": 1, "text": "strukturiert seinen Text schlüssig, stringent sowie gedanklich klar und bezieht sich dabei genau und konsequent auf die Aufgabenstellung.", "punkte": 5},
        {"nr": 2, "text": "bezieht beschreibende, deutende und wertende Aussagen schlüssig aufeinander.", "punkte": 4},
        {"nr": 3, "text": "belegt seine Aussagen durch angemessene und korrekte Nachweise (Bezugnahmen auf die philosophische Aussage, unterrichtlich bearbeitete Autoren, ggf. durch Zitate u. a.).", "punkte": 3},
        {"nr": 4, "text": "formuliert unter Beachtung der Fachsprache präzise und begrifflich differenziert.", "punkte": 4},
        {"nr": 5, "text": "schreibt sprachlich richtig (Grammatik, Orthographie, Zeichensetzung) sowie syntaktisch und stilistisch sicher.", "punkte": 4}
      ]
    }
  ]
}

KRITISCHE ANFORDERUNGEN:
- NIEMALS halbe Punkte verwenden - nur ganze Zahlen
- Analysiere die Aufgabenstellungen genau und erkenne den Aufgabentyp automatisch
- Erstelle spezifische Kriterien basierend auf den konkreten Aufgabenstellungen
- Aufgabe 1 MUSS EXAKT ${punkteA} Punkte ergeben
- Aufgabe 2 MUSS EXAKT ${punkteB} Punkte ergeben
- Aufgabe 3 MUSS EXAKT ${punkteC} Punkte ergeben
- Darstellungsleistung hat IMMER exakt die 5 vorgegebenen Kriterien mit EXAKT 20 Punkten (5+4+3+4+4)
- Gesamtsumme: 100 Punkte (80 inhaltlich + 20 Darstellung)
${isTexterschliessung ?
`- Bei Texterschließung:
  * Fokus auf Textanalyse und philosophischen Vergleich
  * Konkrete Bezüge zum Primärtext und Vergleichsphilosophen
  * Gedankengang in 4-6 GROBE Argumentblöcke aufteilen (nicht zu detailliert!)
  * Vergleich muss Gemeinsamkeiten UND Unterschiede enthalten` :
`- Bei Problemerörterung:
  * Fokus auf eigenständige Problemerörterung aus verschiedenen Perspektiven
  * Argumentative Auseinandersetzung mit dem philosophischen Problem
  * Mindestens 2 philosophische Positionen einbeziehen
  * Abwägende Stellungnahme mit eigener Position`}
- Schliesse ALLE JSON-Klammern korrekt
- Keine Sonderzeichen die JSON brechen
- Verwende \\n für Zeilenumbrüche
- Erstelle GENAU 4 Teilaufgaben (3 inhaltliche + 1 Darstellungsleistung)
- Die Darstellungsleistung muss EXAKT wie im Format-Beispiel sein
- Jedes inhaltliche Kriterium muss konkret und spezifisch auf die Aufgabenstellung bezogen sein`;
}
