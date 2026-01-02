# Erwartungshorizont Generator - Deployment Anleitung

## 📁 Erforderliche Dateistruktur für Vercel

```
ewhgen3/
├── index.html                    # Frontend (Root)
├── vercel.json                   # Vercel Config (wichtig!)
├── api/
│   └── generate.js              # Serverless Function
└── vorgaben/
    ├── englisch_abi_2027_vorgaben.pdf
    ├── englisch_abi_2028_vorgaben.pdf
    ├── konstruktionshinweise_englisch_gk_lk.pdf
    ├── konstruktionshinweise_klausuren.pdf
    └── operatorenuebersicht.pdf
```

## 🚀 Deployment Schritte

### 1. Dateien ins Repository kopieren

```bash
# In deinem lokalen Projekt-Ordner:
cp generate.js api/generate.js
cp vercel.json vercel.json
cp index.html index.html
```

### 2. Google Gemini API Key erstellen

1. Gehe zu [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Melde dich mit deinem Google-Konto an
3. Klicke auf "Create API Key"
4. Wähle ein Google Cloud Projekt oder erstelle ein neues
5. Kopiere den generierten API Key

### 3. Vercel Environment Variable setzen (WICHTIG!)

Im Vercel Dashboard → Dein Projekt → Settings → Environment Variables:
- Name: `GEMINI_API_KEY`
- Value: `[Dein kopierter API Key]`
- Environment: Production, Preview, Development (alle auswählen)
- Klicke "Save"

**⚠️ WICHTIG:** Ohne diesen Schritt funktioniert die App nicht!

### 4. Git Push

```bash
git add .
git commit -m "Add vercel.json and fix API structure"
git push
```

### 5. Testen

Nach dem Deployment:
- Frontend: `https://ewhgen3.vercel.app/`
- API Test: `https://ewhgen3.vercel.app/api/generate` (sollte 405 Method Not Allowed zeigen - das ist OK!)

## 🐛 Troubleshooting

### Error 404 - API Not Found
- ✅ Prüfe: Datei liegt in `api/generate.js`
- ✅ Prüfe: `vercel.json` existiert im Root
- ✅ Re-deploy nach Änderungen

### Error 500 - Internal Server Error
- ✅ Prüfe Vercel Logs: Dashboard → Functions → Logs
- ✅ Prüfe ob `export default` am Anfang der Datei steht
- ✅ Prüfe Node.js Version (sollte 18.x sein)

### Error 429 - Rate Limit
- Google Gemini Free Tier: 15 Anfragen/Minute
- Warte 1 Minute und versuche es erneut

## 📝 Wichtige Dateien

### api/generate.js
- Serverless Function für Google Gemini API
- Wird automatisch von Vercel als API-Endpoint erkannt

### vercel.json
- Konfiguriert Routing
- Definiert Build-Settings
- Verbindet Frontend mit Backend

## 🔒 Sicherheit

- API-Key ist **nicht** im Frontend sichtbar
- Alle API-Calls laufen über Vercel Backend
- CORS ist korrekt konfiguriert

## 💰 Kosten

- Vercel: **Kostenlos** (Hobby Plan)
- Google Gemini: **Kostenlos** (15 req/min, 1500 req/day)
- **Gesamt: 0€**
