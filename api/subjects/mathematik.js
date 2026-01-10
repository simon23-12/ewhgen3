// Mathematik Subject Module
// Generates prompts for Mathematics Klausuren NRW (EF, Q1, Q2)
// Uses Gemini Vision for PDF analysis (can see graphs, formulas, diagrams)

// CODE EXECUTION: Set to true for detailed solutions with SymPy/NumPy validation
// Currently disabled to conserve tokens - compact format is sufficient for current use
export const requiresCodeExecution = false;

// CURRENT: PDF Vision prompt - COMPACT FORMAT (token-efficient)
// PDF is sent as inline_data to Gemini Vision API (can read graphs, formulas, diagrams)
// Output: ~40% fewer tokens than legacy format
export function generatePDFVisionPrompt() {
  return `Analysiere diese Mathe-Klausur und erstelle einen Erwartungshorizont.

AUSGABE - NUR JSON (kein Text davor/danach):
{"klausurInfo":{"stufe":"Q2","kursart":"GK","gesamtpunkte":60},"aufgaben":[{"nummer":1,"titel":"Analysis","teilaufgaben":[{"bezeichnung":"a","punkte":3,"loesung":"f'(x)=3x²-1, f'(-1)=2","bewertung":[{"anf":"Ableitung","p":2},{"anf":"Einsetzen","p":1}]}]}]}

KOMPAKT-REGELN:
- "loesung": Kurzform mit Endergebnis (max 100 Zeichen)
- "bewertung": [{"anf":"Text","p":Punkte}] - kurze Anforderungen
- KEINE schritte-Arrays, KEINE modelloesung-Objekte
- Punktsumme = gesamtpunkte
- Bei Graphen: Werte ablesen und in loesung schreiben
- Exakte Berechnungen
- Valides JSON ohne trailing commas`;
}

// ============================================================================
// LEGACY FORMAT: Detailed step-by-step solutions (FUTURE USE)
// ============================================================================
// Currently unused but maintained for future expansion when token quota increases
// Provides:
// - Full "modelloesung" with "schritte" arrays (step-by-step calculation paths)
// - Optional SymPy code execution for mathematical validation (see generateCorePrompt)
// - Detailed "bewertung" with granular point distribution
//
// To activate: Send pdfText instead of pdfBase64 from frontend
// Frontend already supports rendering both formats (faecher/mathematik.html:396-418)
// ============================================================================

export function generatePrompt(data) {
  if (data.pdfText) {
    return generatePromptFromPDF(data.pdfText);
  }

  const { aufgaben, klausurInfo } = data;
  const aufgabenText = aufgaben.map((aufgabe) => {
    let text = `\n### Aufgabe ${aufgabe.nummer}:\n`;
    if (aufgabe.teilaufgaben && aufgabe.teilaufgaben.length > 0) {
      aufgabe.teilaufgaben.forEach(ta => {
        text += `${ta.bezeichnung}) ${ta.text} (${ta.punkte} Punkte)\n`;
      });
    } else {
      text += `${aufgabe.text} (${aufgabe.punkte} Punkte)\n`;
    }
    return text;
  }).join('\n');

  return generateCorePrompt(aufgabenText, klausurInfo);
}

// Fallback for text-extracted PDFs
function generatePromptFromPDF(pdfText) {
  const uniqueId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return `Analysiere diese NRW Mathematik-Klausur und erstelle einen Erwartungshorizont.
[Request ID: ${uniqueId}]

KLAUSUR:
${pdfText}

AUSGABE - NUR valides JSON, KEINE Erklärungen:
{
  "klausurInfo": {"stufe": "Q2", "kursart": "GK", "pruefungsteil": "A und B", "gesamtpunkte": 64},
  "aufgaben": [
    {
      "nummer": 1,
      "titel": "Analysis",
      "teilaufgaben": [
        {
          "bezeichnung": "a",
          "aufgabentext": "Zeigen Sie: f'(-1) = 2.",
          "punkte": 2,
          "modelloesung": {
            "schritte": [
              {"schritt": 1, "beschreibung": "Ableitung", "rechnung": "f'(x) = 3x² - 1"},
              {"schritt": 2, "beschreibung": "Einsetzen", "rechnung": "f'(-1) = 3·1 - 1 = 2"}
            ],
            "endergebnis": "f'(-1) = 2"
          },
          "bewertung": [
            {"anforderung": "Ableitung korrekt", "punkte": 1},
            {"anforderung": "Ergebnis korrekt", "punkte": 1}
          ]
        }
      ]
    }
  ]
}

REGELN:
- Mathematisch korrekte Lösungen
- Punktsumme = Gesamtpunktzahl
- KOMPAKT: Kurze Beschreibungen, keine Redundanz
- JSON valide: keine Kommentare, keine trailing commas
- KEINE Zeilenumbrüche in Strings
- NUR JSON ausgeben`;
}

function generateCorePrompt(aufgabenText, klausurInfo) {
  return `Du bist ein Experte für NRW Mathematik-Klausuren und erstellst Erwartungshorizonte mit exakten Lösungen.

KLAUSUR-INFORMATIONEN:
- Stufe: ${klausurInfo.stufe || 'EF'}
- Kursart: ${klausurInfo.kursart || 'GK'}
- Prüfungsteil: ${klausurInfo.pruefungsteil || 'A und B'}
- Gesamtpunktzahl: ${klausurInfo.gesamtpunkte || 60} Punkte

AUFGABEN:
${aufgabenText}

ANWEISUNGEN:

1. LÖSE JEDE AUFGABE EXAKT mit Python/SymPy:
   - Schreibe für jede Teilaufgabe Python-Code
   - Nutze SymPy für symbolisches Rechnen (Ableitungen, Integrale, Gleichungen)
   - Nutze NumPy/SciPy für numerische Berechnungen
   - Führe den Code aus und verifiziere die Ergebnisse
   - Bei Stochastik: Berechne Wahrscheinlichkeiten exakt als Brüche

2. ERSTELLE FÜR JEDE TEILAUFGABE:
   - Modelllösung mit vollständigem Rechenweg
   - Korrekte mathematische Notation
   - Zwischenergebnisse wo relevant
   - Endergebnis klar markiert

3. ERSTELLE DEN BEWERTUNGSBOGEN:
   - Anforderungen pro Teilaufgabe
   - Punktzahl pro Anforderung
   - "Sachlich richtige Lösungsalternative" Zeile

WICHTIG - PYTHON CODE AUSFÜHREN:
Führe für JEDE mathematische Berechnung Python-Code aus. Beispiel:
\`\`\`python
from sympy import *
x = Symbol('x')
f = -x**3 + 2*x**2
f_prime = diff(f, x)
print(f"f'(x) = {f_prime}")
# Steigung bei x=1
m = f_prime.subs(x, 1)
print(f"f'(1) = {m}")
\`\`\`

AUSGABEFORMAT - Antworte mit validem JSON:
{
  "klausurInfo": {
    "stufe": "EF",
    "kursart": "GK",
    "gesamtpunkte": 60
  },
  "aufgaben": [
    {
      "nummer": 1,
      "titel": "Analysis - Tangente und Ableitung",
      "teilaufgaben": [
        {
          "bezeichnung": "a",
          "aufgabentext": "Bestimmen Sie rechnerisch eine Gleichung der Tangente...",
          "punkte": 4,
          "modelloesung": {
            "schritte": [
              {"schritt": 1, "beschreibung": "Ableitung bilden", "rechnung": "f'(x) = -3x² + 4x", "ergebnis": "f'(x) = -3x² + 4x"},
              {"schritt": 2, "beschreibung": "Steigung bei x=1", "rechnung": "f'(1) = -3(1)² + 4(1) = -3 + 4 = 1", "ergebnis": "m = 1"},
              {"schritt": 3, "beschreibung": "Tangentengleichung aufstellen", "rechnung": "y = mx + b, 1 = 1·1 + b, b = 0", "ergebnis": "t: y = x"}
            ],
            "endergebnis": "Die Tangente hat die Gleichung t: y = x"
          },
          "bewertung": [
            {"anforderung": "bildet die Ableitung f'(x) = -3x² + 4x", "punkte": 1},
            {"anforderung": "berechnet die Steigung m = f'(1) = 1", "punkte": 1},
            {"anforderung": "setzt Punkt P(1|1) ein und bestimmt b = 0", "punkte": 1},
            {"anforderung": "gibt Tangentengleichung t: y = x an", "punkte": 1}
          ]
        }
      ]
    }
  ],
  "notenschluessel": {
    "sehrGut": "52-60",
    "gut": "43-51",
    "befriedigend": "34-42",
    "ausreichend": "25-33",
    "mangelhaft": "13-24",
    "ungenuegend": "0-12"
  }
}

KRITISCHE ANFORDERUNGEN:
- IMMER Python/SymPy für Berechnungen ausführen
- Ergebnisse müssen mathematisch exakt sein
- Punktsumme muss mit Gesamtpunktzahl übereinstimmen
- Keine halben Punkte
- Bei Rundung: auf 2 Nachkommastellen
- JSON muss valide sein`;
}

// Parse function to extract tasks from PDF analysis
export function parseAufgabenFromPDFAnalysis(analysisResult) {
  // This function helps structure the PDF analysis into our format
  return {
    aufgaben: analysisResult.aufgaben || [],
    klausurInfo: analysisResult.klausurInfo || {
      stufe: 'EF',
      kursart: 'GK',
      gesamtpunkte: 60
    }
  };
}
