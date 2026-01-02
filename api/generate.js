// api/generate.js - Vercel Serverless Function mit Google Gemini
export default async function handler(req, res) {
  // CORS Headers für alle Anfragen
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { inputText } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: 'inputText erforderlich' });
    }

    // Google Gemini API Key aus Umgebungsvariable (SICHER!)
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDz_BUoWdUuw56UUEnZ7DF8TAau7s60OJs';

    if (!apiKey) {
      return res.status(500).json({ error: 'API-Key nicht konfiguriert' });
    }

    // Prompt für Gemini
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

    // Google Gemini API Call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.95,
            topK: 40
          }
        })
      }
    );

    const data = await response.json();

    // Fehlerbehandlung
    if (!response.ok || !data.candidates || data.candidates.length === 0) {
      console.error('Gemini API Error:', data);
      return res.status(500).json({ 
        error: data.error?.message || 'Fehler bei der KI-Generierung',
        details: data
      });
    }

    // Extrahiere den Text aus Gemini's Antwort
    let responseText = data.candidates[0].content.parts[0].text;
    
    // Bereinige von Markdown
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Finde JSON im Text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    // Parse JSON
    let contentData;
    try {
      contentData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', responseText);
      return res.status(500).json({ 
        error: 'Fehler beim Parsen der KI-Antwort',
        rawResponse: responseText.substring(0, 500)
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: contentData,
      provider: 'gemini-1.5-flash'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
