#!/usr/bin/env node
// Vergleicht dieselbe Klausur über mehrere Gemini-Modelle.
// Nutzt die echten Prompts aus api/subjects/, damit der Vergleich dem Produktionsverhalten entspricht.
//
//   node scripts/compare-models.mjs --subject philosophie --input klausur.json
//   node scripts/compare-models.mjs --subject mathematik --pdf klausur.pdf
//   node scripts/compare-models.mjs --subject englisch --input k.json --models gemini-3.7-flash,gemini-2.5-flash
//
// Optionen: --thinking low|medium|high|none  --out <verzeichnis>

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Preise pro 1 Mio. Tokens (Paid Tier). ACHTUNG: 3.6/3.7-Flash sind Einführungspreise
// und verdoppeln sich am 01.01.2027 auf 1.50 / 7.50.
const PRICES = {
  'gemini-3.7-flash':      { in: 0.75, out: 3.75 },
  'gemini-3.6-flash':      { in: 0.75, out: 3.75 },
  'gemini-3.5-flash':      { in: 1.50, out: 9.00 },
  'gemini-3.5-flash-lite': { in: 0.30, out: 2.50 },
  'gemini-3.1-flash-lite': { in: 0.25, out: 1.50 },
  'gemini-3.1-pro-preview':{ in: 2.00, out: 12.00 },
  'gemini-2.5-flash':      { in: 0.30, out: 2.50 },
  'gemini-2.5-flash-lite': { in: 0.10, out: 0.40 }
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    if (!argv[i].startsWith('--')) throw new Error(`Unbekanntes Argument: ${argv[i]}`);
    args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

function loadApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, 'utf8').match(/^GEMINI_API_KEY=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('GEMINI_API_KEY nicht gefunden (weder als Umgebungsvariable noch in .env)');
}

function isValidJSON(text) {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  try {
    return { ok: true, data: JSON.parse(cleaned) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function runModel(model, body, apiKey, thinking) {
  const payload = JSON.parse(JSON.stringify(body));
  if (thinking !== 'none') payload.generationConfig.thinking_level = thinking;

  const started = Date.now();
  let response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
  );

  // Modelle ohne thinking_level-Support: einmal ohne das Feld nachfassen
  if (response.status === 400 && thinking !== 'none') {
    const errorText = await response.text();
    if (errorText.includes('thinking')) {
      console.log(`  ${model}: kein thinking_level-Support, wiederhole ohne das Feld`);
      delete payload.generationConfig.thinking_level;
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
    } else {
      throw new Error(`HTTP 400: ${errorText.slice(0, 300)}`);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const seconds = (Date.now() - started) / 1000;

  if (!data.candidates?.length) throw new Error('Keine Antwort erhalten');

  const text = (data.candidates[0].content?.parts || []).map(p => p.text || '').join('');
  const usage = data.usageMetadata || {};
  const promptTokens = usage.promptTokenCount || 0;
  const thoughtTokens = usage.thoughtsTokenCount || 0;
  const outputTokens = (usage.candidatesTokenCount || 0) + thoughtTokens;

  const price = PRICES[model];
  const cost = price
    ? (promptTokens / 1e6) * price.in + (outputTokens / 1e6) * price.out
    : null;

  return {
    model,
    modelVersion: data.modelVersion,
    seconds,
    promptTokens,
    thoughtTokens,
    outputTokens,
    cost,
    finishReason: data.candidates[0].finishReason,
    text,
    json: isValidJSON(text)
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const subject = args.subject;
  if (!subject) throw new Error('--subject fehlt (englisch|philosophie|mathematik|deutsch)');
  if (!args.input && !args.pdf) throw new Error('--input <json> oder --pdf <datei> wird benötigt');

  const models = (args.models || 'gemini-3.7-flash,gemini-3.1-flash-lite').split(',').map(m => m.trim());
  const outDir = args.out || join(ROOT, 'model-vergleich');
  const apiKey = loadApiKey();

  const subjectModule = await import(join(ROOT, 'api', 'subjects', `${subject}.js`));

  let body;
  let thinking;
  if (args.pdf) {
    const prompt = subjectModule.generatePDFVisionPrompt();
    const pdfBase64 = readFileSync(args.pdf).toString('base64');
    thinking = args.thinking || 'medium';
    body = {
      contents: [{ parts: [
        { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
        { text: prompt }
      ] }],
      generationConfig: { temperature: 1.0, maxOutputTokens: 65536, topP: 0.95, topK: 64 }
    };
  } else {
    const data = JSON.parse(readFileSync(args.input, 'utf8'));
    const prompt = subjectModule.generatePrompt(data);
    thinking = args.thinking || 'low';
    body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1.0, maxOutputTokens: 16384, topP: 0.95, topK: 64 }
    };
  }

  console.log(`Fach: ${subject} | Quelle: ${args.pdf || args.input} | thinking_level: ${thinking}`);
  console.log(`Modelle: ${models.join(', ')}\n`);

  mkdirSync(outDir, { recursive: true });
  const results = [];

  for (const model of models) {
    process.stdout.write(`Läuft: ${model} ... `);
    try {
      const result = await runModel(model, body, apiKey, thinking);
      results.push(result);
      writeFileSync(join(outDir, `${model}.txt`), result.text);
      if (result.json.ok) {
        writeFileSync(join(outDir, `${model}.json`), JSON.stringify(result.json.data, null, 2));
      }
      console.log(`fertig in ${result.seconds.toFixed(1)}s`);
    } catch (error) {
      console.log(`FEHLER: ${error.message}`);
      results.push({ model, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(94));
  console.log(
    'Modell'.padEnd(24) + 'Zeit'.padStart(8) + 'Prompt'.padStart(9) +
    'Denken'.padStart(9) + 'Output'.padStart(9) + 'Kosten'.padStart(11) +
    'JSON'.padStart(7) + '  Ende'
  );
  console.log('='.repeat(94));

  for (const r of results) {
    if (r.error) {
      console.log(r.model.padEnd(24) + '  FEHLER: ' + r.error.slice(0, 55));
      continue;
    }
    console.log(
      r.model.padEnd(24) +
      `${r.seconds.toFixed(1)}s`.padStart(8) +
      String(r.promptTokens).padStart(9) +
      String(r.thoughtTokens).padStart(9) +
      String(r.outputTokens).padStart(9) +
      (r.cost === null ? 'n/a' : `$${r.cost.toFixed(5)}`).padStart(11) +
      (r.json.ok ? 'ok' : 'FEHLER').padStart(7) +
      '  ' + (r.finishReason || '')
    );
  }

  const priced = results.filter(r => !r.error && r.cost !== null);
  if (priced.length > 1) {
    const cheapest = priced.reduce((a, b) => (a.cost < b.cost ? a : b));
    console.log(`\nGünstigstes Modell: ${cheapest.model} ($${cheapest.cost.toFixed(5)} pro Durchlauf)`);
    for (const r of priced) {
      if (r.model === cheapest.model) continue;
      console.log(`  ${r.model} kostet das ${(r.cost / cheapest.cost).toFixed(1)}-fache`);
    }
  }

  console.log(`\nVolle Ausgaben zum Vergleichen: ${outDir}`);
  console.log('Die Zahlen sagen nichts über die inhaltliche Qualität - die Dateien nebeneinander lesen.');
}

main().catch(error => {
  console.error(`\nFehler: ${error.message}`);
  process.exit(1);
});
