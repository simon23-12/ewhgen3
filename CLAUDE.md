# EWHgen3 - Erwartungshorizont Generator

Generator für Erwartungshorizonte für NRW Lehrer für Oberstufenklausuren (derzeit Englisch, Philosophie & Mathematik). Serverless Vercel + Gemini API.

## Tech Stack
- Frontend: Multi-Page Architecture mit Shared Components
- Backend: Node.js serverless (`api/*.js`) mit modularer Subject-Architektur
- AI: Google Gemini 2.5 Flash API (WICHTIG: Nutze `gemini-2.5-flash`, da jedes Modell separate Quotas hat)
- PDF: Gemini Vision API für Mathematik (Graphen/Formeln erkennbar), pdf.js client-side für Englisch/Philosophie

## Struktur
```
/index.html                    → Landing Page mit Fach-Kacheln
/faecher/
  englisch.html                → Englisch-Seite (komplett eigenständig)
  philosophie.html             → Philosophie-Seite
  mathematik.html              → Mathematik-Seite (PDF Vision)
/shared/
  styles.css                   → Alle CSS Styles (shared)
  pdf-upload.js                → Generischer PDF-Upload Handler
/api/
  generate.js                  → Generic API Handler
  parse-pdf.js                 → PDF Text Distribution
  shared/gemini.js             → Shared Gemini API logic
  subjects/
    englisch.js                → Englisch Abitur Prompts
    philosophie.js             → Philosophie Abitur Prompts
    mathematik.js              → Mathematik Abitur Prompts (PDF Vision)
/vorgaben/                     → Regulation PDFs
```

## Frugale Coding-Regeln

### NIEMALS tun:
- Neue Dependencies installieren (es sei denn explizit gefordert)
- Neue Dateien erstellen ohne vorher zu lesen
- Code refactoren der funktioniert
- Kommentare/Docs hinzufügen die nicht gefordert sind

### IMMER tun:
- Read before Edit - JEDE Datei erst lesen
- Edit statt Write für existierende Dateien
- Parallel Tool Calls wo möglich
- Minimal viable changes - nur was gefordert ist

### Projekt-Spezifisch:
- Landing Page: `index.html` (~50 Zeilen)
- Fach-Pages: `faecher/*.html` (je ~400-600 Zeilen)
- Shared CSS: `shared/styles.css`
- Shared JS: `shared/pdf-upload.js` (generischer PDF Handler)
- Gemini calls via `api/generate.js` (generic handler)
- Subject-specific prompts in `api/subjects/*.js`
- Keine DB, stateless
- **Deployment: IMMER zu Github pushen** (`git push` → Vercel deployed automatisch)
  - Vercel ist mit GitHub verbunden (simon23-12/ewhgen3)
  - Niemals `vercel --prod` direkt nutzen (kein GitHub Backup!)

## Fach hinzufügen:
- Siehe NEWSUBJECT.md

## TODOs:
- Siehe TODO.md
