// Englisch Subject Module
// Generates prompts for English Abitur NRW

export function generatePrompt(data) {
  const { inputText, task2Text, task3aText, task3bText, mediationText, listeningMode } = data;

  const hasMediation = mediationText && mediationText.trim() !== '';
  const hasTask2 = task2Text && task2Text.trim() !== '';
  const hasTask3b = task3bText && task3bText.trim() !== '';
  const isEF = !hasMediation; // EF Klausur = keine Mediation

  // Punkteverteilung basierend auf Klausurtyp
  let points;
  if (isEF) {
    points = {
      task1: 16,
      task2: 24,
      task3a: 20,
      task3b: 20
    };
  } else {
    points = {
      task1: 12,
      task2: 16,
      task3a: 14,
      task3b: 14
    };
  }

  return `Du bist ein Erwartungshorizont-Generator für Englisch Abitur in NRW.

AUFGABE: Erstelle einen Erwartungshorizont für folgende ${isEF ? 'EF' : 'Q1/Q2'} Klausur:

TEIL A (Englisch):
${inputText}
${hasTask2 ? `
AUFGABE 2 (Analysis):
${task2Text}
` : ''}
AUFGABE 3a:
${task3aText}
${hasTask3b ? `
AUFGABE 3b:
${task3bText}
` : ''}
${hasMediation ? `
TEIL B (Mediation - Deutsch):
${mediationText}
` : ''}

ANWEISUNG: Antworte AUSSCHLIESSLICH mit validem JSON. Keine Erklärungen, keine Markdown-Formatierung.

WICHTIGE PUNKTEVERTEILUNG:
${isEF ? `EF-Klausur (ohne Mediation):
- Teilaufgabe 1 (Comprehension): ${points.task1} Punkte
- Teilaufgabe 2 (Analysis): ${points.task2} Punkte
- Teilaufgabe 3: ${points.task3a} Punkte${hasTask3b ? ` (WAHLAUFGABE: Schüler wählt 3a ODER 3b - erstelle BEIDE mit je ${points.task3a} Punkten)` : ''}
- KEINE Mediation` : `Q1/Q2-Klausur (mit Mediation):
- Teilaufgabe 1 (Comprehension): ${points.task1} Punkte
- Teilaufgabe 2 (Analysis): ${points.task2} Punkte
- Teilaufgabe 3: ${points.task3a} Punkte${hasTask3b ? ` (WAHLAUFGABE: Schüler wählt 3a ODER 3b - erstelle BEIDE mit je ${points.task3a} Punkten)` : ''}
- TEIL B Mediation: 18 Punkte (wird separat generiert)`}

FORMAT:
{
  "teilaufgaben": [
    {
      "name": "Teilaufgabe 1: Comprehension",
      "typ": "Comprehension",
      "kriterien": [
        {"nr": 1, "text": "Einleitungssatz: Textsorte, Autor, Thema", "punkte": 2},
        {"nr": 2, "text": "Hauptaussagen und Argumente", "punkte": 8},
        {"nr": 3, "text": "Weiteres Kriterium", "punkte": "(2)"}
      ]
    },
    {
      "name": "Teilaufgabe 2: Analysis",
      "typ": "Analysis",
      "kriterien": [
        {"nr": 1, "text": "Ueberleitungssatz", "punkte": 2},
        {"nr": 2, "text": "Wortwahl und Effekte", "punkte": 4},
        {"nr": 3, "text": "Rhetorische Mittel mit konkreten Beispielen aus dem Text (MAXIMAL 5 MITTEL):\\n• [Mittel 1 + Textstelle]\\n• [Mittel 2 + Textstelle]\\n• [Mittel 3 + Textstelle]\\n• [Mittel 4 + Textstelle]\\n• [Mittel 5 + Textstelle]", "punkte": 8},
        {"nr": 4, "text": "Fazit zur Wirkung", "punkte": 3},
        {"nr": 5, "text": "Weiteres Kriterium", "punkte": "(3)"}
      ]
    },
    {
      "name": "Teilaufgabe 3a: [erkenne Aufgabentyp aus der Aufgabenstellung]",
      "typ": "[z.B. Evaluation, Discussion, etc.]",
      "kriterien": [
        {"nr": 1, "text": "[spezifisches Kriterium]", "punkte": 2},
        {"nr": 2, "text": "[weitere Kriterien basierend auf Aufgabenstellung]", "punkte": 4},
        {"nr": 3, "text": "Weiteres Kriterium", "punkte": "(3)"}
      ]
    }${hasTask3b ? `,
    {
      "name": "Teilaufgabe 3b: [erkenne Aufgabentyp aus der Aufgabenstellung]",
      "typ": "[z.B. Re-creation, Letter, etc.]",
      "kriterien": [
        {"nr": 1, "text": "[spezifisches Kriterium]", "punkte": 3},
        {"nr": 2, "text": "[weitere Kriterien basierend auf Aufgabenstellung]", "punkte": 6},
        {"nr": 3, "text": "Weiteres Kriterium", "punkte": "(3)"}
      ]
    }` : ''}${hasMediation ? `,
    {
      "name": "Teil B: Mediation",
      "typ": "Mediation",
      "kriterien": [
        {"nr": 1, "text": "Aufgabenerfuellung - Folgende 5 Kernpunkte muessen vermittelt werden:\\n• [Kernpunkt 1 aus dem deutschen Text]\\n• [Kernpunkt 2 aus dem deutschen Text]\\n• [Kernpunkt 3 aus dem deutschen Text]\\n• [Kernpunkt 4 aus dem deutschen Text]\\n• [Kernpunkt 5 aus dem deutschen Text]", "punkte": 8},
        {"nr": 2, "text": "Adressatengerechtigkeit und Situationsangemessenheit", "punkte": 4},
        {"nr": 3, "text": "Sprachmittlung: Korrekte Uebertragung ins Englische", "punkte": 6},
        {"nr": 4, "text": "Weiteres Kriterium", "punkte": "(2)"}
      ]
    }` : ''}
  ]
}

KRITISCHE ANFORDERUNGEN:
- Erkenne Textsorte automatisch (Roman/Erzählung vs. Sachtext/Artikel)
- **ANALYSIS (Teilaufgabe 2) - TEXTTYP-SPEZIFISCH**:
  ${hasTask2 ? `* Beachte die spezifische Aufgabenstellung: "${task2Text}"` : ''}
  * Bei ROMANAUSZÜGEN/ERZÄHLUNGEN: Fokus auf atmosphärische Wirkung, Charakterdarstellung, Beziehungen zwischen Charakteren, Stimmung, narrative Techniken
  * Bei SACHTEXTEN/ARTIKELN: Fokus auf Wirkung auf den Leser, Überzeugungskraft, Argumentation, persuasive Strategien
  * Extrahiere MAXIMAL 5 KONKRETE rhetorische Mittel aus dem englischen Text mit Beispielen
  * JEDES Mittel MUSS in einer NEUEN Zeile stehen (verwende \\n zwischen Mitteln)
  * Format: "• [Stilmittel]: '[Zitat]' (l. X) - [Wirkung im Kontext des Texttyps]"
  * Beispiel Roman: "• Metapher: 'prison of her mind' (l. 15) - verdeutlicht die psychische Eingeschlossenheit der Protagonistin"
  * Beispiel Sachtext: "• Rhetorische Frage: 'Can we afford to wait?' (l. 8) - aktiviert den Leser und verstärkt die Dringlichkeit"
- Analysiere Aufgabe 3a${hasTask3b ? ' und 3b' : ''} genau und erstelle passende, spezifische Kriterien
- Die Gesamtpunkte für Aufgabe 3a MÜSSEN ${points.task3a} Punkte ergeben (inkl. optionaler Punkte in Klammern)${hasTask3b ? `\n- Die Gesamtpunkte für Aufgabe 3b MÜSSEN ${points.task3b} Punkte ergeben (inkl. optionaler Punkte in Klammern)\n- WICHTIG: Beide Aufgaben 3a und 3b haben die GLEICHE Punktzahl, weil der Schüler nur EINE davon wählt!` : ''}${hasMediation ? `\n- **MEDIATION**: Extrahiere GENAU 5 KONKRETE Kernpunkte aus dem deutschen Mediationstext\n- JEDER Kernpunkt MUSS in einer NEUEN Zeile stehen (verwende \\n zwischen Punkten)\n- Format pro Punkt: "• [Konkreter Inhaltspunkt aus dem deutschen Text]"` : ''}
- Schliesse ALLE JSON-Klammern korrekt
- Keine Sonderzeichen die JSON brechen
- Verwende \\n für Zeilenumbrüche in Aufzählungen, NICHT <br>
- Erstelle ${hasMediation ? (hasTask3b ? '5' : '4') : (hasTask3b ? '4' : '3')} Teilaufgaben`;
}
