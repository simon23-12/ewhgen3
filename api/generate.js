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
    const { inputText } = req.body;

    if (!inputText || inputText.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'inputText ist erforderlich und darf nicht leer sein' 
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
    const prompt = `Du bist ein erfahrener Englischlehrer in NRW. Analysiere den folgenden Text und erstelle einen detaillierten Erwartungshorizont.

TEXT:
"${inputText}"

WICHTIG: 
1. Erkenne die Textsorte (speech/article/essay/etc.) und den Autor/die Quelle aus dem Text
2. Extrahiere KONKRETE Beispiele für rhetorische Mittel direkt aus dem Text (mit Zeilenangaben wenn möglich)
3. Antworte NUR mit JSON im folgenden Format (keine anderen Texte!):

{
  "teilaufgaben": [
    {
      "name": "Teilaufgabe 1",
      "typ": "Comprehension",
      "kriterien": [
        {"nr": 1, "text": "schreibt einen Einleitungssatz und benennt Textsorte (z.B. speech/article), Autor und Thema.", "punkte": 2},
        {"nr": 2, "text": "erkennt die Hauptaussagen und zentralen Argumente des Textes: [liste hier spezifische Punkte auf basierend auf dem Text]", "punkte": 10},
        {"nr": 3, "text": "erfüllt ein weiteres aufgabenbezogenes Kriterium.", "punkte": "(2)"}
      ]
    },
    {
      "name": "Teilaufgabe 2",
      "typ": "Analysis",
      "kriterien": [
        {"nr": 1, "text": "verfasst einen passenden Überleitungssatz.", "punkte": 2},
        {"nr": 2, "text": "analysiert die Wortwahl und deren Effekte, z.B.: [nenne konkrete Beispiele aus dem Text]", "punkte": 4},
        {"nr": 3, "text": "analysiert rhetorische Mittel mit konkreten Textbeispielen, z.B.: [extrahiere Beispiele: Parallelismus in 'we want...we want' (ll. X-Y), Anaphern, metaphors, etc.]", "punkte": 8},
        {"nr": 4, "text": "verfasst ein Fazit zur Wirkung der sprachlichen Mittel.", "punkte": 3},
        {"nr": 5, "text": "erfüllt ein weiteres aufgabenbezogenes Kriterium.", "punkte": "(3)"}
      ]
    }
  ]
}

Sei SEHR spezifisch:
- Erkenne automatisch die Textsorte (speech, article, essay, letter, etc.)
- Nenne den Autor/die Quelle wenn im Text erwähnt
- Extrahiere konkrete Zitate für rhetorische Mittel
- Punktzahlen: Einleitung 2, Hauptkriterien 8-12, Zusatz (2-3)
- Erstelle 2-4 Teilaufgaben je nach Komplexität

ANTWORTE NUR MIT DEM JSON!`;

    // First, list available models to debug
    const listModelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );

    if (listModelsResponse.ok) {
      const modelsData = await listModelsResponse.json();
      console.log('Available models:', JSON.stringify(modelsData, null, 2));
    }

    // Google Gemini API aufrufen
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
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
            maxOutputTokens: 2048,
            topP: 0.95,
            topK: 40
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
    
    // JSON bereinigen
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // JSON finden
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    // JSON parsen
    let contentData;
    try {
      contentData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.status(500).json({ 
        success: false,
        error: 'Fehler beim Parsen der KI-Antwort',
        rawResponse: responseText.substring(0, 500)
      });
    }

    // Erfolgreiche Antwort
    return res.status(200).json({
      success: true,
      data: contentData,
      provider: 'gemini-1.5-pro-latest'
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
