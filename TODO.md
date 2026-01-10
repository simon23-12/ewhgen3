## Architecture Status

### ✅ Multi-Page Architecture (ERLEDIGT)

Die Architektur wurde auf Multi-Page umgestellt:

```
/index.html                    → Landing Page mit Fach-Kacheln (~50 Zeilen)
/faecher/englisch.html         → Englisch-Page (~500 Zeilen)
/faecher/philosophie.html      → Philosophie-Page (~400 Zeilen)
/shared/
  styles.css                   → Alle CSS Styles
  pdf-upload.js                → Generischer PDF-Upload Handler
```

### Vorteile der neuen Struktur:
- ✅ Kleinste Bundles (nur aktives Fach geladen)
- ✅ Bookmarkable URLs pro Fach
- ✅ Bessere Code-Organisation
- ✅ Einfaches Hinzufügen neuer Fächer
- ✅ Browser-Cache pro Fach

---

## Offene TODOs

### Mathematik: Umfangreichere EH (bei mehr Token-Budget)
**Zukunftsszenario:** Wenn Gemini Quota steigt, auf detailed Format umstellen

**Aktuell:** Compact Format (`generatePDFVisionPrompt`)
- Output: `{"loesung":"Kurzform","bewertung":[{"anf":"Text","p":Punkte}]}`
- Token-Ersparnis: ~40% weniger Output-Tokens

**Ziel:** Legacy Format aktivieren (`generatePromptFromPDF` + `generateCorePrompt`)
- Output: `{"modelloesung":{"schritte":[...],"endergebnis":"..."},"bewertung":[...]}`
- Schritt-für-Schritt Rechenwege mit Zwischenergebnissen
- Optional: Code Execution mit SymPy/NumPy (`requiresCodeExecution = true`)

**Implementation:**
- [x] Legacy Code bereits vorhanden in `api/subjects/mathematik.js:41-190`
- [x] Frontend unterstützt beide Formate (`faecher/mathematik.html:396-418`)
- [ ] Umstellung: Frontend sendet `pdfText` statt `pdfBase64`
- [ ] Optional: `requiresCodeExecution = true` für mathematische Validierung

### Niedrige Priorität
- [ ] `shared/header.js` - Header/Logo als JS-Component extrahieren (optional)
- [ ] `shared/notenschluessel.js` - Notenschlüssel-Tabellen auslagern (optional)
- [ ] Clean URLs via `vercel.json` Rewrites (z.B. `/englisch` statt `/faecher/englisch.html`)

### Zukünftige Fächer
- [ ] Physik (Vision API für Diagramme)
- [ ] Chemie (Vision API für Strukturformeln)
- [ ] Biologie (Vision API für Schaubilder)
- [ ] Geschichte
- [ ] Deutsch
- [ ] Pädagogik
- [ ] Sozialwissenschaften

Siehe NEWSUBJECT.md für Anleitung zum Hinzufügen neuer Fächer.
