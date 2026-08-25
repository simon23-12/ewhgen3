### Neues Fach hinzufügen - VOLLSTÄNDIGE Checkliste

## Architektur-Übersicht (Multi-Page)

```
/index.html                    → Landing Page mit Fach-Kacheln
/faecher/englisch.html         → Englisch-Page
/faecher/philosophie.html      → Philosophie-Page
/faecher/NEUESFACH.html        → Neue Fach-Page hier erstellen
/shared/
  styles.css                   → Alle CSS Styles (shared)
  pdf-upload.js                → Generischer PDF-Upload Handler
/api/
  generate.js                  → Generic API Handler
  parse-pdf.js                 → PDF Text Distribution
  subjects/
    englisch.js                → Englisch Prompts
    philosophie.js             → Philosophie Prompts
    NEUESFACH.js               → Neue Prompts hier erstellen
```

---

## Schritt-für-Schritt Anleitung

### 1. Backend: Subject Prompt Module erstellen
**Datei:** `api/subjects/fachname.js`

```javascript
export function generatePrompt(data) {
    const { primaryText, task1, task2, task3 } = data;

    return `Du bist ein Experte für NRW Abitur-Klausuren im Fach FACHNAME...

    [Dein fach-spezifischer Prompt hier]

    Antworte NUR mit validem JSON in diesem Format:
    {
        "teilaufgaben": [
            {
                "name": "Aufgabe 1",
                "kriterien": [
                    { "nr": 1, "text": "...", "punkte": X }
                ]
            }
        ]
    }`;
}
```

**⚠️ KRITISCH: Punkteverteilungs-Regel für NRW-Erwartungshorizonte**

Die meisten NRW-Fächer (Deutsch, Englisch) nutzen **"Zusatzkriterien"** die NICHT zur regulären Punktsumme zählen:

**Beispiel Deutsch:**
- Aufgabe 1: 42 Punkte gesamt
  - Anforderung 1-6: **42 Punkte** (regulär)
  - Anforderung 7: `"(erfüllt ein weiteres aufgabenbezogenes Kriterium)"` → **`(4)` in Klammern** (EXTRA)

**Beispiel Englisch:**
- Aufgabe 1: 16 Punkte gesamt
  - Anforderung 1-N: **16 Punkte** (regulär)
  - Letzte Anforderung: `"Weiteres Kriterium"` → **`(2)` in Klammern** (EXTRA)

**Im Prompt EXPLIZIT fordern:**
```javascript
return `...
KRITISCHE PUNKTEVERTEILUNGS-REGEL:
Die Punkte ALLER regulären Anforderungen (OHNE "Weiteres Kriterium"/"erfüllt ein weiteres...")
müssen EXAKT die Gesamtpunkte der Aufgabe ergeben!

Beispiel: Aufgabe 1 hat 42 Punkte
→ Anforderung 1-N zusammen = 42P (regulär)
→ LETZTE Anforderung: "[Name des Zusatzkriteriums]" = (3-4) in Klammern EXTRA

JEDE Aufgabe MUSS als LETZTE Zeile haben:
{"nr": X, "text": "[Zusatzkriterium-Text]", "punkte": "(3)"}
→ Diese Punkte stehen IN KLAMMERN und zählen NICHT zur Aufgabensumme!
...`;
```

**Ausnahmen (kein Zusatzkriterium):**
- **Mathematik:** Stattdessen `"Sachlich richtige Lösungsalternative"` mit `(Punkte)` in Klammern
- **Philosophie:** Keine Extra-Zeile, fixe Darstellungsleistung (5+4+3+4+4=20P)

**Wichtig für Frontend-Rendering:**
- String-Punkte wie `"(3)"` → als Klammern anzeigen
- Bei Summenberechnung: Diese Zeilen NICHT mitzählen
- Siehe `faecher/deutsch.html` und `faecher/englisch.html` für Referenz-Implementierung

### 2. Backend: `api/generate.js` updaten
Import und Registry hinzufügen:

```javascript
// Am Anfang der Datei
import * as fachnameModule from './subjects/fachname.js';

// Im subjectModules Objekt
const subjectModules = {
    'englisch': englischModule,
    'philosophie': philosophieModule,
    'fachname': fachnameModule  // NEU
};
```

### 3. Backend: `api/parse-pdf.js` erweitern (KRITISCH!)

**a) Prompt für PDF-Parsing hinzufügen (ca. Zeile 20-50):**
```javascript
if (subject === 'fachname') {
    prompt = `Analysiere diesen Klausurtext für FACHNAME...

    Antworte NUR mit JSON:
    {
        "primaryText": "...",
        "task1": "...",
        "task2": "...",
        "task3": "..."
    }`;
}
```

**b) Response-Mapping hinzufügen (ca. Zeile 140-160):**
```javascript
if (subject === 'fachname') {
    responseData = {
        primaryText: result.primaryText || '',
        task1: result.task1 || '',
        task2: result.task2 || '',
        task3: result.task3 || ''
    };
}
```

### 4. Frontend: Neue Fach-Page erstellen
**Datei:** `faecher/fachname.html`

Kopiere `faecher/philosophie.html` als Template und passe an:
- Title: `<title>Erwartungshorizont Generator - Fachname</title>`
- Tab active state: `class="subject-tab active"` auf dem neuen Fach
- Alle Element-IDs anpassen (z.B. `fachnameTask1`, `outputFachname`)
- Generate-Funktion: `generateErwartungshorizontFachname()`
- Clear-Funktion: `clearAllFachname()`
- Print-Funktion: `printAsPdfFachname()`

**PDF Upload initialisieren (im DOMContentLoaded):**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    initPDFUpload('pdfUpload', 'pdfDropZone', 'pdfStatus', 'fachname', {
        'primaryText': 'fachnamePrimaryText',
        'task1': 'fachnameTask1',
        'task2': 'fachnameTask2',
        'task3': 'fachnameTask3'
    });
});
```

Das `fieldMapping` Objekt mappt API-Response-Felder zu HTML-Element-IDs.

### 5. Landing Page updaten
**Datei:** `index.html`

Neue Kachel in `.landing-grid` hinzufügen:
```html
<a href="faecher/fachname.html" class="subject-card">
    <div class="subject-icon">📚</div>
    <h3>Fachname</h3>
    <p>Kurze Beschreibung der Klausurformate</p>
</a>
```

### 6. Navigation in allen Fach-Pages updaten
In ALLEN bestehenden `faecher/*.html` den neuen Tab hinzufügen:
```html
<div class="subject-tabs-container">
    <a href="englisch.html" class="subject-tab">Englisch</a>
    <a href="philosophie.html" class="subject-tab">Philosophie</a>
    <a href="fachname.html" class="subject-tab">Fachname</a>  <!-- NEU -->
</div>
```

---

## Checkliste vor Deploy

- [ ] `api/subjects/fachname.js` erstellt
- [ ] `api/generate.js` Import + Registry
- [ ] `api/parse-pdf.js` Prompt + Response-Mapping
- [ ] `faecher/fachname.html` erstellt
- [ ] `index.html` Kachel hinzugefügt
- [ ] Tabs in ALLEN `faecher/*.html` aktualisiert

## Quick Test

1. Landing Page zeigt neue Kachel?
2. Klick auf Kachel öffnet neue Fach-Page?
3. Tabs funktionieren (Navigation zwischen Fächern)?
4. PDF Upload zeigt "PDF wird verarbeitet..."?
5. Felder werden automatisch befüllt?
6. Generate Button erstellt Erwartungshorizont?
7. PDF Export funktioniert?

## Häufige Fehler

- ❌ `parse-pdf.js` nicht updaten = PDF-Felder bleiben leer
- ❌ Falsches `fieldMapping` = Felder werden nicht befüllt
- ❌ Tabs nicht in allen Pages aktualisiert = Navigation kaputt
- ❌ `subject` Parameter falsch = API findet kein Modul

## API Notes

- Gemini Modell: `gemini-3.7-flash` (in `api/shared/gemini.js`)
- Jedes Gemini-Modell hat separate Quotas
- Bei Quota-Errors: Google AI Studio checken welches Modell noch Quota hat

---

## Naturwissenschaftliche Fächer (Mathematik, Physik, Chemie, Bio)

Bei MINT-Fächern gelten besondere Anforderungen:

### 1. Token-Limit erhöhen
Detaillierte Lösungswege brauchen mehr Tokens. In `api/generate.js`:
```javascript
const options = subject === 'mathematik' ? { maxOutputTokens: 32768 } : {};
```

### 2. JSON-Newlines vermeiden
Rechenwege enthalten oft mehrzeilige Formeln. Im Prompt EXPLIZIT fordern:
```
KEINE echten Zeilenumbrüche in Strings! Nutze " | " oder " -> " statt Newlines
```

### 3. Truncation Check
Lange Antworten können abgeschnitten werden. Immer `finishReason === 'MAX_TOKENS'` prüfen.

### 4. Code Execution (optional)
Gemini 2.0 Flash unterstützt Code Execution mit SymPy für exakte Berechnungen:
```javascript
export const requiresCodeExecution = true;
```
⚠️ ACHTUNG: Code Execution hat STRIKTE Rate Limits (ca. 10 req/min Free Tier).
Für Production besser auf gemini-3.7-flash ohne Code Execution wechseln.

### 5. Strukturiertes JSON-Format für Lösungen
```json
{
  "modelloesung": {
    "schritte": [
      {"schritt": 1, "beschreibung": "...", "rechnung": "...", "ergebnis": "..."}
    ],
    "endergebnis": "..."
  }
}
```

### 6. Notenschlüssel dynamisch berechnen
Bei unterschiedlichen Gesamtpunktzahlen Prozentgrenzen nutzen statt fester Punkte.
Siehe `berechneNotenschluessel()` in `faecher/mathematik.html`.

### 7. ⚠️ KRITISCH: PDF-Text Variable Reset bei neuem Upload
**BUG-PREVENTION:** Wenn das Fach PDF-Text direkt an API sendet (wie Mathematik), MUSS bei neuem Upload die Variable zurückgesetzt werden!

**Problem:** Ohne Reset wird bei zweitem Upload immer noch die alte PDF verwendet.

**Lösung in `handleFile()` Funktion:**
```javascript
async function handleFile(file) {
    const statusEl = document.getElementById('pdfStatus');
    const generateBtn = document.getElementById('generateBtn');
    const outputDiv = document.getElementById('outputMathe');
    const downloadButtons = document.getElementById('downloadButtonsMathe');

    // ⚠️ WICHTIG: Reset bei neuem Upload
    extractedPdfText = null;
    currentMatheData = null;
    outputDiv.className = 'output empty';
    outputDiv.innerHTML = 'Hier erscheint dein Erwartungshorizont...';
    downloadButtons.classList.add('hidden');

    // ... rest of function
}
```

**Betrifft NICHT:** Englisch & Philosophie (nutzen `shared/pdf-upload.js` mit Form-Feldern)

### 8. ⚠️ Gemini Vision API für PDFs mit Graphen/Formeln

**Wann verwenden:** Wenn das Fach visuelle Elemente benötigt (Mathe-Formeln, Graphen, Diagramme)

**Problem mit pdf.js Text-Extraktion:**
- LaTeX-generierte PDFs haben oft spezielle Font-Encodings
- Mathematische Symbole werden nicht/falsch extrahiert
- Graphen/Bilder sind komplett unsichtbar

**Lösung:** Gemini Vision API mit PDF als Base64
```javascript
// In faecher/mathematik.html
const bytes = new Uint8Array(arrayBuffer);
let binary = '';
for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
}
pdfBase64Data = btoa(binary);

// Send to API
fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({
        subject: 'mathematik',
        pdfBase64: pdfBase64Data
    })
});
```

**Backend Setup (`api/shared/gemini.js`):**
```javascript
export async function callGeminiWithPDF(prompt, pdfBase64, apiKey, options = {}) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
            { text: prompt }
          ]
        }]
      })
    }
  );
}
```

**Token-Optimierung:** Vision API + große PDFs = viele Tokens. Verwende kompakte Prompts:
```javascript
// ❌ SCHLECHT: Verbose JSON mit schritte[], modelloesung{}
// ✅ GUT: Kompakt {"loesung":"kurz", "bewertung":[{"anf":"Text","p":2}]}
```

**Vorteile:**
- Erkennt Graphen, Funktionsplots, Koordinatensysteme
- Liest mathematische Formeln visuell
- Funktioniert mit gescannten + digitalen PDFs
- Robuster gegen Encoding-Probleme

---

## Beispiel: Geschichte hinzufügen

```bash
# 1. Backend
cp api/subjects/philosophie.js api/subjects/geschichte.js
# → Prompts anpassen

# 2. api/generate.js
# → import + registry

# 3. api/parse-pdf.js
# → prompt + response mapping

# 4. Frontend
cp faecher/philosophie.html faecher/geschichte.html
# → IDs anpassen, Tabs anpassen

# 5. index.html
# → Kachel hinzufügen

# 6. Alle faecher/*.html
# → Tab hinzufügen
```
