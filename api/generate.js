// Generic Generate API - Supports multiple subjects
import { callGeminiAPI, callGeminiWithCodeExecution, callGeminiWithPDF, cleanJSONResponse, setCORSHeaders } from './shared/gemini.js';
import * as englischModule from './subjects/englisch.js';
import * as philosophieModule from './subjects/philosophie.js';
import * as mathematikModule from './subjects/mathematik.js';
import * as deutschModule from './subjects/deutsch.js';

// Subject module registry
const subjectModules = {
  englisch: englischModule,
  philosophie: philosophieModule,
  mathematik: mathematikModule,
  deutsch: deutschModule
};

export default async function handler(req, res) {
  // CORS Headers
  setCORSHeaders(res);

  // Handle OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    const { subject, ...data } = req.body;

    // Validate subject
    if (!subject) {
      return res.status(400).json({
        success: false,
        error: 'Subject parameter is required'
      });
    }

    // Validate supported subjects
    const supportedSubjects = ['englisch', 'philosophie', 'mathematik', 'deutsch'];
    if (!supportedSubjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported subject: ${subject}. Supported: ${supportedSubjects.join(', ')}`
      });
    }

    // API Key from Environment
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        details: 'GEMINI_API_KEY environment variable is not set'
      });
    }

    // Get subject module from registry
    const subjectModule = subjectModules[subject];
    if (!subjectModule) {
      return res.status(500).json({
        success: false,
        error: `Subject module not found: ${subject}`
      });
    }

    // Call Gemini API - different modes for different subjects
    let responseText;
    let finishReason;
    try {
      if ((subject === 'mathematik' || subject === 'deutsch') && data.pdfBase64) {
        // Mathematik/Deutsch with PDF Vision: Send PDF directly to Gemini
        const prompt = subjectModule.generatePDFVisionPrompt();
        const result = await callGeminiWithPDF(prompt, data.pdfBase64, GEMINI_API_KEY, { maxOutputTokens: 65536 });
        responseText = result.text;
        finishReason = result.finishReason;
      } else if (subjectModule.requiresCodeExecution) {
        // Code Execution mode (currently unused)
        const prompt = subjectModule.generatePrompt(data);
        const result = await callGeminiWithCodeExecution(prompt, GEMINI_API_KEY);
        responseText = result.text;
        if (result.codeResults && result.codeResults.length > 0) {
          console.log('Code Execution Results:', JSON.stringify(result.codeResults, null, 2));
        }
      } else {
        // Standard API call
        const prompt = subjectModule.generatePrompt(data);
        const options = subject === 'mathematik' ? { maxOutputTokens: 65536 } : {};
        const result = await callGeminiAPI(prompt, GEMINI_API_KEY, options);
        responseText = result.text;
        finishReason = result.finishReason;
      }
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
      return res.status(500).json({
        success: false,
        error: 'Gemini API request failed',
        details: apiError.message
      });
    }

    // Check for truncated response
    if (finishReason === 'MAX_TOKENS') {
      console.error('Response truncated due to MAX_TOKENS');
      return res.status(500).json({
        success: false,
        error: 'Die Klausur ist zu lang. Die KI-Antwort wurde abgeschnitten.',
        hint: 'Bitte versuche es mit einer kuerzeren Klausur oder teile sie auf.'
      });
    }

    // Clean and parse JSON
    const cleanedJSON = cleanJSONResponse(responseText);

    let contentData;
    try {
      contentData = JSON.parse(cleanedJSON);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Problematic JSON (first 1000 chars):', cleanedJSON.substring(0, 1000));

      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response',
        details: parseError.message,
        rawResponse: cleanedJSON.substring(0, 1000),
        hint: 'The AI returned invalid JSON'
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      data: contentData,
      subject: subject,
      provider: 'gemini-2.0-flash-exp'
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
