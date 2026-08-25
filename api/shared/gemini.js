// Shared Gemini API logic

// Simple request queue to handle rate limiting
let requestQueue = Promise.resolve();
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
let lastRequestTime = 0;

// Shared CORS headers function
export function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Model fallback chains - when one model fails, try the next (each model has its own quota)
const MODEL_FALLBACKS = {
  'gemini-3.7-flash': ['gemini-3.6-flash', 'gemini-2.5-flash'],
  'gemini-3.6-flash': ['gemini-3.7-flash', 'gemini-2.5-flash'],
  'gemini-2.5-flash': ['gemini-3.7-flash', 'gemini-3.6-flash']
};

// Check if error is a quota/overload error that should trigger fallback
function isQuotaOrOverloadError(status) {
  return status === 429 || status === 503;
}

// Extract model name from URL
function extractModelFromUrl(url) {
  const match = url.match(/models\/([^:]+):/);
  return match ? match[1] : null;
}

// Replace model in URL
function replaceModelInUrl(url, newModel) {
  return url.replace(/models\/[^:]+:/, `models/${newModel}:`);
}

// Fetch with exponential backoff retry for rate limit errors
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Success - return immediately
      if (response.ok) {
        return response;
      }

      // Rate limit (429) or Service unavailable (503) - retry with backoff
      if (response.status === 429 || response.status === 503) {
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`Rate limit hit. Retry ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      // Other error - return response to handle normally
      return response;

    } catch (fetchError) {
      // Network error - retry if attempts left
      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Network error. Retry ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw fetchError;
    }
  }

  throw new Error('Max retries exceeded');
}

// Walk the fallback chain - returns null if no fallback model worked out
async function tryFallbackModels(url, options, maxRetries, reason) {
  const currentModel = extractModelFromUrl(url);
  const fallbackModels = MODEL_FALLBACKS[currentModel] || [];
  let lastResponse = null;
  let lastError = null;

  for (const fallbackModel of fallbackModels) {
    console.log(`Model ${currentModel} ${reason}. Trying fallback: ${fallbackModel}`);
    try {
      const response = await fetchWithRetry(replaceModelInUrl(url, fallbackModel), options, maxRetries);
      if (!isQuotaOrOverloadError(response.status)) {
        return response;
      }
      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) return lastResponse;
  if (lastError) throw lastError;
  return null;
}

// Fetch with model fallback - tries alternate models on 429/503 after retries exhausted
async function fetchWithModelFallback(url, options, maxRetries = 3) {
  try {
    const response = await fetchWithRetry(url, options, maxRetries);

    // If quota/overload error after all retries, walk the fallback chain
    if (isQuotaOrOverloadError(response.status)) {
      const fallbackResponse = await tryFallbackModels(url, options, maxRetries, `exhausted (${response.status})`);
      if (fallbackResponse) return fallbackResponse;
    }

    return response;
  } catch (error) {
    // If max retries exceeded, walk the fallback chain
    if (error.message === 'Max retries exceeded') {
      const fallbackResponse = await tryFallbackModels(url, options, maxRetries, 'max retries exceeded');
      if (fallbackResponse) return fallbackResponse;
    }

    throw error;
  }
}

// Queue requests to avoid hitting rate limits
async function queueRequest(fn) {
  // Add to queue
  const executeRequest = async () => {
    // Wait for minimum interval since last request
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Throttling request: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Execute the request
    lastRequestTime = Date.now();
    return await fn();
  };

  // Chain to queue and execute
  requestQueue = requestQueue.then(executeRequest, executeRequest);
  return requestQueue;
}

// Standard Gemini call (for Englisch, Philosophie, Mathematik)
export async function callGeminiAPI(prompt, apiKey, options = {}) {
  return queueRequest(async () => {
    const maxTokens = options.maxOutputTokens || 16384;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetchWithModelFallback(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: maxTokens,
            topP: 0.95,
            topK: 64
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
        `Gemini API Error: HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return {
      text: data.candidates[0].content.parts[0].text,
      finishReason: data.candidates[0].finishReason
    };
  });
}

export function cleanJSONResponse(responseText) {
  // Remove markdown code blocks
  let cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Extract first complete JSON block
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // Escape newlines inside JSON strings by walking through the string
  // This handles multiline strings correctly
  let result = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escape) {
      result += char;
      escape = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      // Escape actual newlines/tabs inside strings
      if (char === '\n') {
        result += '\\n';
        continue;
      }
      if (char === '\r') {
        result += '\\r';
        continue;
      }
      if (char === '\t') {
        result += '\\t';
        continue;
      }
    }

    result += char;
  }

  cleaned = result;

  // Additional cleanup
  cleaned = cleaned
    // Trailing commas entfernen
    .replace(/,(\s*[}\]])/g, '$1')
    // Control characters entfernen
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Doppelte Kommas entfernen
    .replace(/,\s*,/g, ',')
    // Leere Array-Elemente entfernen
    .replace(/\[\s*,/g, '[')
    .replace(/,\s*\]/g, ']');

  return cleaned;
}

// Gemini call with PDF Vision (for Mathematik)
// Sends PDF as base64 inline data for visual understanding
// Uses Gemini 3.6 Flash for better math reasoning (separate quota from 3.7)
export async function callGeminiWithPDF(prompt, pdfBase64, apiKey, options = {}) {
  return queueRequest(async () => {
    const maxTokens = options.maxOutputTokens || 65536;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetchWithModelFallback(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: pdfBase64
                }
              },
              { text: prompt }
            ]
          }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: maxTokens,
            topP: 0.95,
            topK: 64
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
        `Gemini API Error: HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return {
      text: data.candidates[0].content.parts[0].text,
      finishReason: data.candidates[0].finishReason
    };
  });
}

// Gemini call with Code Execution (for Mathematik)
// Uses SymPy for exact mathematical calculations
export async function callGeminiWithCodeExecution(prompt, apiKey) {
  return queueRequest(async () => {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetchWithModelFallback(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          tools: [{
            code_execution: {}
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 16384,
            topP: 0.95,
            topK: 40
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
        `Gemini API Error: HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    // Code Execution responses have multiple parts (text, code, execution_result)
    // We need to extract all text parts and combine them
    const parts = data.candidates[0].content.parts;
    let fullResponse = '';
    let codeResults = [];

    for (const part of parts) {
      if (part.text) {
        fullResponse += part.text;
      }
      if (part.executableCode) {
        codeResults.push({
          code: part.executableCode.code,
          language: part.executableCode.language
        });
      }
      if (part.codeExecutionResult) {
        codeResults.push({
          outcome: part.codeExecutionResult.outcome,
          output: part.codeExecutionResult.output
        });
      }
    }

    return {
      text: fullResponse,
      codeResults: codeResults
    };
  });
}
