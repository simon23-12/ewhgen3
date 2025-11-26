// api/generate.js - Vercel Serverless Function
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

    // WICHTIG: Setze hier deinen OpenRouter API-Key als Umgebungsvariable
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API-Key nicht konfiguriert' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://erwartungshorizont.vercel.app',
        'X-Title': 'Erwartungshorizont Generator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{
          role: 'user',
          content: `Du bist ein erfahrener Englischlehrer in NRW. Analysiere den folgenden Text und erstelle einen detaillierten Erwartungshorizont.

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

ANTWORTE NUR MIT DEM JSON!`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Extrahiere den Text aus der Antwort
    let responseText = data.choices[0].message.content;
    
    // Bereinige von Markdown
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    const contentData = JSON.parse(responseText);

    return res.status(200).json({ success: true, data: contentData });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
