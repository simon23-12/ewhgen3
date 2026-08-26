---
name: gemini-healthcheck
description: Prüft, ob die in EWHgen3 verwendeten Gemini-Modelle noch aktuell, verfügbar und preislich sinnvoll sind. Nutze diesen Skill, wenn Simon fragt "sind die Modelle noch aktuell", "check mal die Gemini-Modelle", "was kostet das gerade", "gibt es was Neues von Google" oder wenn die App plötzlich 404/400-Fehler von der Gemini-API bekommt.
---

# Gemini-Healthcheck für EWHgen3

Prüft die Modell-Konfiguration des Projekts gegen den aktuellen Stand der Google-Doku.

## 1. Ist-Zustand aus dem Repo lesen

Alle Modell-IDs auf einmal:

```bash
grep -rn "gemini-[0-9]" api/ scripts/ CLAUDE.md NEWSUBJECT.md
```

Diese Stellen müssen zusammenpassen:

| Stelle | Funktion | Zweck |
|---|---|---|
| `api/shared/gemini.js` → `MODEL_FALLBACKS` | Fallback-Kette | jedes Modell hat eigene Quota |
| `api/shared/gemini.js` → `callGeminiAPI` | Text | Englisch, Philosophie, Mathe-Text |
| `api/shared/gemini.js` → `callGeminiWithPDF` | PDF-Vision | Mathematik, Deutsch |
| `api/shared/gemini.js` → `callGeminiWithCodeExecution` | ungenutzt | `requiresCodeExecution` ist überall `false` |
| `api/parse-pdf.js` | Text-Aufteilung | Englisch/Philosophie-PDFs |
| `scripts/compare-models.mjs` → `PRICES` | Preistabelle | muss mit Googles Preisen synchron sein |

## 2. Soll-Zustand von Google holen

Drei Seiten, immer alle drei:

- https://ai.google.dev/gemini-api/docs/models — welche Modelle existieren, stable vs. preview
- https://ai.google.dev/gemini-api/docs/deprecations — Abschaltdaten und empfohlene Nachfolger
- https://ai.google.dev/gemini-api/docs/pricing — Preise pro 1 Mio. Tokens, **inklusive Fußnoten zu Einführungspreisen**

## 3. Diese fünf Fragen beantworten

1. **Ist ein benutztes Modell abgeschaltet oder angekündigt abgeschaltet?** Das ist der einzige echte Notfall — abgeschaltete Modelle geben 404 und die App ist kaputt.
2. **Läuft ein Produktionspfad auf einem `-preview`-Modell?** Preview-Modelle verschwinden ohne lange Vorwarnung. In Produktion gehört stable.
3. **Gibt es ein neueres Modell derselben Klasse?** Nicht automatisch besser — siehe Preisfalle unten.
4. **Hat sich der Preis geändert, oder läuft ein Einführungspreis aus?** Google verdoppelt angekündigte Einführungspreise zum Stichtag. Das steht als Fußnote in der Preistabelle, nicht in der Modell-Liste.
5. **Deckt die Fallback-Kette noch existierende Modelle ab?** Ein Fallback auf ein abgeschaltetes Modell ist schlimmer als keiner.

**Preisfalle:** Eine höhere Versionsnummer heißt nicht billiger oder besser. Beispiel aus August 2026: `gemini-3.5-flash` kostete $1,50/$9,00 und war damit älter *und* teurer als `gemini-3.7-flash` mit $0,75/$3,75. Immer die Tabelle lesen, nie die Versionsnummer raten.

## 4. Referenzstand (26.08.2026)

Wenn die Werte unten noch stimmen, ist alles in Ordnung. Weichen sie ab, ist die Doku neuer als dieser Skill — dann gilt die Doku, und dieser Abschnitt sollte mit aktualisiert werden.

| Pfad | Modell | Preis in/out je 1 Mio. |
|---|---|---|
| Text + `parse-pdf` | `gemini-3.7-flash` | $0,75 / $3,75 |
| PDF-Vision | `gemini-3.6-flash` | $0,75 / $3,75 |
| Fallback-Kette | 3.7 → 3.6 → 2.5 | — |

Bekannte Termine:
- **01.01.2027**: Einführungspreis für 3.6/3.7-Flash endet, Preise verdoppeln sich auf $1,50 / $7,50. Dann lohnt ein Vergleich mit `gemini-3.1-flash-lite` ($0,25 / $1,50).
- `gemini-2.0-flash` ist seit 01.06.2026 abgeschaltet.

Thinking-Level (Denk-Tokens werden zum Output-Preis abgerechnet):
`generationConfig.thinkingConfig.thinkingLevel` — Text `low`, PDF-Vision `medium`, `parse-pdf` `low`.
Das flache Feld `generation_config.thinking_level` aus manchen Google-Beispielen gilt für die **Interactions API** und wird von `generateContent` mit HTTP 400 abgelehnt.

## 5. Wenn ein Wechsel nötig ist

1. Modell-ID an **allen** Stellen aus der Tabelle in Abschnitt 1 ändern, `MODEL_FALLBACKS` inklusive.
2. `CLAUDE.md`, `NEWSUBJECT.md` und `.claude/agents/ewhgen3-karen.md` nachziehen — dort stehen Modellnamen im Fließtext.
3. `PRICES` in `scripts/compare-models.mjs` aktualisieren.
4. Vor dem Push prüfen, dass die Module laden:
   ```bash
   node -e "import('./api/shared/gemini.js').then(()=>console.log('ok'))"
   ```
5. Pushen (`git push` → Vercel deployt automatisch, siehe CLAUDE.md).
6. **Nach dem Deploy testen, nicht davor.** Der Vercel-Build braucht etwa eine Minute; ein Test direkt nach dem Push trifft noch den alten Build und ist wertlos. So lange wiederholen, bis das Ergebnis stabil bleibt:
   ```bash
   curl -s -X POST https://ewhgen3.vercel.app/api/generate -H "Content-Type: application/json" -d '{"subject":"philosophie","primaryText":"Der Mensch ist zur Freiheit verurteilt.","teilaufgabeA":"Erschliessen Sie den Gedankengang.","teilaufgabeB":"Vergleichen Sie mit dem Determinismus.","teilaufgabeC":"Beurteilen Sie."}'
   ```
   Erwartet: `"success":true`. Bei `"success":false` steht die Ursache in `details`.

## 6. Verbrauch statt Schätzung

Die Funktionen loggen `usageMetadata` in die Vercel-Function-Logs:

```
Usage [text / gemini-3.7-flash]: prompt=1500 output=3000 thoughts=4000 total=8500
```

`thoughts` ist der Kostentreiber. Wenn er hoch ist, zuerst `thinkingLevel` senken, bevor über einen Modellwechsel nachgedacht wird.

Zwei Modelle mit derselben Klausur direkt vergleichen (braucht `GEMINI_API_KEY` in der Umgebung oder in `.env`):

```bash
node scripts/compare-models.mjs --subject philosophie --input klausur.json
```

## Bericht

Kurz halten: pro Pfad eine Zeile mit Modell, Status (aktuell / veraltet / abgeschaltet), Preis. Danach eine klare Empfehlung — Handlungsbedarf ja oder nein. Kosten immer als Faktor *und* als Cent-Betrag pro Durchlauf angeben, "2,5× teurer" allein sagt bei Centbeträgen wenig.
