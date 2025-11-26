{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // api/generate.js - Vercel Serverless Function\
export default async function handler(req, res) \{\
  // CORS Headers f\'fcr alle Anfragen\
  res.setHeader('Access-Control-Allow-Credentials', true);\
  res.setHeader('Access-Control-Allow-Origin', '*');\
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');\
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');\
\
  // Handle OPTIONS request (CORS preflight)\
  if (req.method === 'OPTIONS') \{\
    res.status(200).end();\
    return;\
  \}\
\
  // Nur POST erlauben\
  if (req.method !== 'POST') \{\
    return res.status(405).json(\{ error: 'Method not allowed' \});\
  \}\
\
  try \{\
    const \{ inputText \} = req.body;\
\
    if (!inputText) \{\
      return res.status(400).json(\{ error: 'inputText erforderlich' \});\
    \}\
\
    // WICHTIG: Setze hier deinen OpenRouter API-Key als Umgebungsvariable\
    const apiKey = process.env.OPENROUTER_API_KEY;\
\
    if (!apiKey) \{\
      return res.status(500).json(\{ error: 'API-Key nicht konfiguriert' \});\
    \}\
\
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', \{\
      method: 'POST',\
      headers: \{\
        'Content-Type': 'application/json',\
        'Authorization': `Bearer $\{apiKey\}`,\
        'HTTP-Referer': 'https://erwartungshorizont.vercel.app',\
        'X-Title': 'Erwartungshorizont Generator'\
      \},\
      body: JSON.stringify(\{\
        model: 'anthropic/claude-3.5-sonnet',\
        messages: [\{\
          role: 'user',\
          content: `Du bist ein erfahrener Englischlehrer in NRW. Erstelle NUR den INHALTLICHEN Teil eines Erwartungshorizonts f\'fcr die folgende Aufgabe:\
\
"$\{inputText\}"\
\
WICHTIG: \
1. Antworte NUR mit JSON im folgenden Format (keine anderen Texte, keine Markdown-Formatierung!):\
\{\
  "teilaufgaben": [\
    \{\
      "name": "Teilaufgabe 1",\
      "typ": "Comprehension",\
      "kriterien": [\
        \{"nr": 1, "text": "schreibt einen Einleitungssatz.", "punkte": 2\},\
        \{"nr": 2, "text": "erkennt, dass...", "punkte": 10\},\
        \{"nr": 3, "text": "erf\'fcllt ein weiteres aufgabenbezogenes Kriterium.", "punkte": "(2)"\}\
      ]\
    \}\
  ]\
\}\
\
2. Sei SEHR spezifisch bei den Kriterien - nenne konkrete Inhalte, die analysiert werden sollen\
3. Die Punktzahlen sollten sinnvoll sein (Einleitung: 2, Hauptkriterien: 8-12, Zusatz: (2-3))\
4. Erstelle 2-4 Teilaufgaben je nach Komplexit\'e4t der Aufgabe\
5. Jede Teilaufgabe braucht einen passenden Typ (Comprehension, Analysis, Evaluation, Re-creation, etc.)\
\
ANTWORTE NUR MIT DEM JSON - KEINE ZUS\'c4TZLICHEN TEXTE!`\
        \}]\
      \})\
    \});\
\
    const data = await response.json();\
\
    if (data.error) \{\
      return res.status(500).json(\{ error: data.error.message \});\
    \}\
\
    // Extrahiere den Text aus der Antwort\
    let responseText = data.choices[0].message.content;\
    \
    // Bereinige von Markdown\
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();\
    \
    const jsonMatch = responseText.match(/\\\{[\\s\\S]*\\\}/);\
    if (jsonMatch) \{\
      responseText = jsonMatch[0];\
    \}\
\
    const contentData = JSON.parse(responseText);\
\
    return res.status(200).json(\{ success: true, data: contentData \});\
\
  \} catch (error) \{\
    console.error('Error:', error);\
    return res.status(500).json(\{ error: error.message \});\
  \}\
\}}