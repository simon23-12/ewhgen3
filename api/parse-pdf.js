// api/parse-pdf.js
import { cleanJSONResponse, setCORSHeaders } from './shared/gemini.js';

export default async function handler(req, res) {
  // CORS Headers
  setCORSHeaders(res);

  // Handle OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    const { pdfText, subject } = req.body;

    if (!pdfText || pdfText.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'pdfText ist erforderlich und darf nicht leer sein'
      });
    }

    // API Key aus Environment Variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Server-Konfigurationsfehler'
      });
    }

    // Subject-spezifischer Prompt
    let prompt;

    if (subject === 'mathematik') {
      prompt = `Du bist ein intelligenter Parser für Mathematik-Klausuren (NRW). Analysiere den folgenden Text aus einer Klausur-PDF und extrahiere die Struktur.

KLAUSURTEXT:
${pdfText}

AUFGABE: Identifiziere und extrahiere:

1. **klausurInfo**: Metadaten zur Klausur
   - stufe: "EF", "Q1" oder "Q2"
   - kursart: "GK" oder "LK"
   - pruefungsteil: "A" (ohne Hilfsmittel), "B" (mit Hilfsmitteln) oder "A und B"
   - gesamtpunkte: Gesamtpunktzahl (meist 60)

2. **aufgaben**: Array aller Aufgaben mit Teilaufgaben
   - nummer: Aufgabennummer (1, 2, 3, 4)
   - thema: Erkanntes Thema (Analysis, Stochastik, Vektorrechnung, etc.)
   - teilaufgaben: Array mit:
     - bezeichnung: "a", "b", "c" oder "(1)", "(2)" etc.
     - text: Vollständiger Aufgabentext
     - punkte: Punktzahl (aus Klammern extrahieren)

WICHTIGE HINWEISE:
- Mathe-Klausuren haben oft Prüfungsteil A (ohne Hilfsmittel) und B (mit Hilfsmitteln)
- Punktzahlen stehen meist in Klammern: (4 Punkte) oder (2 + 3 Punkte)
- Teilaufgaben können a), b), c) oder (1), (2), (3) sein
- Funktionsgleichungen exakt übernehmen: f(x) = -x³ + 2x²
- Bei Stochastik: Baumdiagramme beschreiben
- Bei Geometrie: Koordinaten und Vektoren exakt notieren

Antworte AUSSCHLIESSLICH mit validem JSON:
{
  "klausurInfo": {
    "stufe": "EF",
    "kursart": "GK",
    "pruefungsteil": "A und B",
    "gesamtpunkte": 60
  },
  "aufgaben": [
    {
      "nummer": 1,
      "thema": "Analysis",
      "kontext": "Gegeben ist die Funktion f mit f(x) = -x³ + 2x²",
      "teilaufgaben": [
        {"bezeichnung": "a", "text": "Bestimmen Sie rechnerisch eine Gleichung der Tangente t an den Graphen von f im Punkt P(1|1).", "punkte": 4},
        {"bezeichnung": "b(1)", "text": "Geben Sie die Koordinaten eines Punktes A an, in dem der Graph von f die Steigung Null hat.", "punkte": 1},
        {"bezeichnung": "b(2)", "text": "Geben Sie die Koordinaten eines Punktes B an, so dass die Ableitung von f an der Stelle x_B negativ ist.", "punkte": 1}
      ]
    }
  ]
}`;
    } else if (subject === 'philosophie') {
      prompt = `Du bist ein intelligenter Parser für Philosophie-Klausuren. Analysiere den folgenden Text aus einer Klausur-PDF und extrahiere die verschiedenen Teile:

KLAUSURTEXT:
${pdfText}

AUFGABE: Identifiziere und extrahiere folgende Teile:
1. **primaryText**: Der philosophische Primärtext oder das Zitat (meist von einem Philosophen wie Hospers, Kant, Mill, etc.)
2. **task1**: Die Aufgabenstellung für Aufgabe 1 (meist Texterschließung oder Zitatsanalyse)
3. **task2**: Die Aufgabenstellung für Aufgabe 2 (meist Vergleich oder Problemerörterung)
4. **task3**: Die Aufgabenstellung für Aufgabe 3 (meist Beurteilung oder Stellungnahme)

WICHTIGE HINWEISE:
- Der Primärtext ist meist ein längerer philosophischer Text oder ein kürzeres Zitat
- Aufgabenstellungen beginnen oft mit "Arbeite heraus...", "Erläutere...", "Vergleiche...", "Beurteile...", "Nehme Stellung..."
- Es gibt normalerweise genau 3 Aufgaben
- Wenn ein Teil nicht gefunden wird, setze ihn auf leeren String ""

Antworte AUSSCHLIESSLICH mit validem JSON in diesem Format (keine Erklärungen):
{
  "primaryText": "der philosophische Text oder das Zitat hier...",
  "task1": "Aufgabenstellung 1 hier...",
  "task2": "Aufgabenstellung 2 hier...",
  "task3": "Aufgabenstellung 3 hier..."
}`;
    } else {
      // Default: Englisch
      prompt = `Du bist ein intelligenter Parser für Englisch-Klausuren. Analysiere den folgenden Text aus einer Klausur-PDF und extrahiere die verschiedenen Teile:

KLAUSURTEXT:
${pdfText}

AUFGABE: Identifiziere und extrahiere folgende Teile:
1. **inputText**: Der englische Haupttext für Comprehension/Analysis (Teil A) - meist ein längerer englischer Text, Artikel, Rede, etc.
2. **task2Text**: Die Aufgabenstellung für Aufgabe 2 (Analysis) falls vorhanden (z.B. "Analyse the atmosphere...", "Analyze the extract...", etc.)
3. **task3aText**: Die Aufgabenstellung für Aufgabe 3a (z.B. "Write a comment...", "Discuss...", "Evaluate...")
4. **task3bText**: Die Aufgabenstellung für Aufgabe 3b falls vorhanden (z.B. "Write a letter...", "Re-create...")
5. **mediationText**: Der deutsche Text für die Mediation (Teil B) falls vorhanden

WICHTIGE HINWEISE:
- Aufgabe 2 ist oft eine Analysis-Aufgabe zum englischen Haupttext
- Wenn du "Aufgabe 3" oder "Task 3" siehst, prüfe ob es 3a/3b gibt oder nur eine Aufgabe
- Mediation ist IMMER auf Deutsch
- Der englische Haupttext ist meist der längste zusammenhängende englische Text
- Aufgabenstellungen beginnen oft mit "Write", "Discuss", "Evaluate", "Comment", "Analyze", etc.
- Wenn ein Teil nicht gefunden wird, setze ihn auf leeren String ""

Antworte AUSSCHLIESSLICH mit validem JSON in diesem Format (keine Erklärungen):
{
  "inputText": "der englische Haupttext hier...",
  "task2Text": "Aufgabenstellung 2 (Analysis) hier falls vorhanden, sonst leer",
  "task3aText": "Aufgabenstellung 3a hier...",
  "task3bText": "Aufgabenstellung 3b hier falls vorhanden, sonst leer",
  "mediationText": "deutscher Mediation-Text falls vorhanden, sonst leer"
}`;
    }

    // Google Gemini API aufrufen
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 16384,
            topP: 0.95,
            topK: 40
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      return res.status(500).json({
        success: false,
        error: 'Fehler beim Aufruf der Google API'
      });
    }

    const geminiData = await geminiResponse.json();

    // Validierung
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Keine Antwort von der KI erhalten'
      });
    }

    // Check for truncated response
    const finishReason = geminiData.candidates[0].finishReason;
    if (finishReason === 'MAX_TOKENS') {
      console.error('Response truncated due to MAX_TOKENS');
      return res.status(500).json({
        success: false,
        error: 'Die Klausur ist zu lang. Die KI-Antwort wurde abgeschnitten.',
        hint: 'Bitte versuche es mit einer kuerzeren Klausur oder teile sie auf.'
      });
    }

    // Text extrahieren
    let responseText = geminiData.candidates[0].content.parts[0].text;

    // JSON bereinigen mit shared utility (robuster als Regex-basierter Ansatz)
    responseText = cleanJSONResponse(responseText);

    // JSON parsen
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Problematic JSON (first 500 chars):', responseText.substring(0, 500));
      console.error('Position around error:', responseText.substring(5900, 6100));
      return res.status(500).json({
        success: false,
        error: 'Fehler beim Parsen der KI-Antwort',
        hint: 'Die KI hat ungueltiges JSON zurueckgegeben. Bitte erneut versuchen.'
      });
    }

    // Subject-spezifische Antwort
    let responseData;

    if (subject === 'mathematik') {
      responseData = {
        klausurInfo: parsedData.klausurInfo || {
          stufe: 'EF',
          kursart: 'GK',
          pruefungsteil: 'A und B',
          gesamtpunkte: 60
        },
        aufgaben: parsedData.aufgaben || []
      };
    } else if (subject === 'philosophie') {
      responseData = {
        primaryText: parsedData.primaryText || '',
        task1: parsedData.task1 || '',
        task2: parsedData.task2 || '',
        task3: parsedData.task3 || ''
      };
    } else {
      // Default: Englisch
      responseData = {
        inputText: parsedData.inputText || '',
        task2Text: parsedData.task2Text || '',
        task3aText: parsedData.task3aText || '',
        task3bText: parsedData.task3bText || '',
        mediationText: parsedData.mediationText || ''
      };
    }

    // Erfolgreiche Antwort
    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Interner Serverfehler',
      message: error.message
    });
  }
}
