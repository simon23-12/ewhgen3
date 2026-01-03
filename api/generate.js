// api/generate.js
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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
    const { inputText, task3aText, task3bText, mediationText } = req.body;

    if (!inputText || inputText.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'inputText ist erforderlich und darf nicht leer sein'
      });
    }

    if (!task3aText || task3aText.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'task3aText ist erforderlich und darf nicht leer sein'
      });
    }

    // API Key aus Environment Variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Server-Konfigurationsfehler',
        details: 'GEMINI_API_KEY environment variable is not set. Please configure it in your Vercel project settings.'
      });
    }

    // Prompt erstellen
    const hasMediation = mediationText && mediationText.trim() !== '';
    const hasTask3b = task3bText && task3bText.trim() !== '';
    const isEF = !hasMediation; // EF Klausur = keine Mediation

    // Punkteverteilung basierend auf Klausurtyp
    const points = isEF ? {
      task1: 16,
      task2: 24,
      task3a: 20,
      task3b: 20
    } : {
      task1: 12,
      task2: 16,
      task3a: 14,
      task3b: 14
    };

    const prompt = `Du bist ein Erwartungshorizont-Generator für Englisch Abitur in NRW.

AUFGABE: Erstelle einen Erwartungshorizont für folgende ${isEF ? 'EF' : 'Q1/Q2'} Klausur:

TEIL A (Englisch):
${inputText}

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
- Teilaufgabe 3a: ${points.task3a} Punkte${hasTask3b ? `\n- Teilaufgabe 3b: ${points.task3b} Punkte` : ''}
- KEINE Mediation` : `Q1/Q2-Klausur (mit Mediation):
- Teilaufgabe 1 (Comprehension): ${points.task1} Punkte
- Teilaufgabe 2 (Analysis): ${points.task2} Punkte
- Teilaufgabe 3a: ${points.task3a} Punkte${hasTask3b ? `\n- Teilaufgabe 3b: ${points.task3b} Punkte` : ''}
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
        {"nr": 3, "text": "Rhetorische Mittel mit Beispielen", "punkte": 8},
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
        {"nr": 1, "text": "Aufgabenerfuellung: Alle relevanten Informationen vermittelt", "punkte": 8},
        {"nr": 2, "text": "Adressatengerechtigkeit und Situationsangemessenheit", "punkte": 4},
        {"nr": 3, "text": "Sprachmittlung: Korrekte Uebertragung ins Englische", "punkte": 6},
        {"nr": 4, "text": "Weiteres Kriterium", "punkte": "(2)"}
      ]
    }` : ''}
  ]
}

KRITISCHE ANFORDERUNGEN:
- Erkenne Textsorte automatisch
- Analysiere Aufgabe 3a und 3b genau und erstelle passende, spezifische Kriterien
- Die Gesamtpunkte für Aufgabe 3a MÜSSEN ${points.task3a} Punkte ergeben (inkl. optionaler Punkte in Klammern)${hasTask3b ? `\n- Die Gesamtpunkte für Aufgabe 3b MÜSSEN ${points.task3b} Punkte ergeben (inkl. optionaler Punkte in Klammern)` : ''}
- Schliesse ALLE JSON-Klammern korrekt
- Keine Sonderzeichen die JSON brechen
- Erstelle ${hasMediation ? (hasTask3b ? '5' : '4') : (hasTask3b ? '4' : '3')} Teilaufgaben`;

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
            temperature: 0.7,
            maxOutputTokens: 8192,
            topP: 0.95,
            topK: 64
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      console.error('Gemini API Error:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        errorData
      });
      return res.status(500).json({
        success: false,
        error: 'Fehler beim Aufruf der Google API',
        details: errorData.error?.message || `HTTP ${geminiResponse.status}: ${geminiResponse.statusText}`,
        status: geminiResponse.status,
        hint: geminiResponse.status === 403
          ? 'API key might be invalid or quota exceeded. Check your Gemini API key in Vercel environment variables.'
          : geminiResponse.status === 429
          ? 'Rate limit exceeded. Gemini free tier allows 15 requests per minute.'
          : 'Check Vercel logs for more details.'
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

    // Text extrahieren
    let responseText = geminiData.candidates[0].content.parts[0].text;

    // JSON bereinigen - entferne Markdown code blocks
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // JSON finden - nimm nur den ersten vollständigen JSON-Block
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    // Zusätzliche Bereinigung: Entferne trailing commas vor ] oder }
    responseText = responseText.replace(/,(\s*[}\]])/g, '$1');

    // JSON parsen
    let contentData;
    try {
      contentData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Problematic JSON (first 1000 chars):', responseText.substring(0, 1000));
      console.error('Full response length:', responseText.length);

      return res.status(500).json({
        success: false,
        error: 'Fehler beim Parsen der KI-Antwort',
        details: parseError.message,
        rawResponse: responseText.substring(0, 1000),
        hint: 'The AI returned invalid JSON. This might be due to trailing commas or malformed structure.'
      });
    }

    // Erfolgreiche Antwort
    return res.status(200).json({
      success: true,
      data: contentData,
      provider: 'gemini-2.5-flash'
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
