// OpenRouter API Client
// Budget-efficient alternative for Mathematik using DeepSeek-R1

// Simple request queue to handle rate limiting
let requestQueue = Promise.resolve();
const MIN_REQUEST_INTERVAL = 500; // 500ms between requests
let lastRequestTime = 0;

// Fetch with exponential backoff retry
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Success
      if (response.ok) {
        return response;
      }

      // Rate limit (429) or Service unavailable (503) - retry with backoff
      if (response.status === 429 || response.status === 503) {
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`OpenRouter rate limit. Retry ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
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

// Queue requests to avoid hitting rate limits
async function queueRequest(fn) {
  const executeRequest = async () => {
    // Wait for minimum interval since last request
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
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

// Call OpenRouter API with DeepSeek-R1 (optimized for math)
export async function callOpenRouterAPI(prompt, apiKey, options = {}) {
  return queueRequest(async () => {
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const model = options.model || 'deepseek/deepseek-r1';
    const maxTokens = options.maxTokens || 8192;
    const temperature = options.temperature || 0.2; // Lower for math accuracy

    const response = await fetchWithRetry(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ewhgen3.vercel.app', // Replace with your actual domain
          'X-Title': 'EWHgen3 Math Generator'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          top_p: 0.95
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
        `OpenRouter API Error: HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    // Extract usage info for cost tracking
    const usage = data.usage || {};
    const cost = {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      // Approximate cost in USD (DeepSeek-R1: ~$0.50 per 1M input, ~$2 per 1M output)
      estimatedCost: ((usage.prompt_tokens || 0) * 0.5 / 1000000) +
                     ((usage.completion_tokens || 0) * 2.0 / 1000000)
    };

    return {
      text: data.choices[0].message.content,
      finishReason: data.choices[0].finish_reason,
      usage: cost
    };
  });
}

// Clean JSON response (similar to Gemini handler)
export function cleanJSONResponse(responseText) {
  // Remove markdown code blocks
  let cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Extract first complete JSON block (object or array) - NON-GREEDY
  // Use a more sophisticated approach to find matching braces/brackets
  let extracted = null;

  // Try to find JSON object
  const objStart = cleaned.indexOf('{');
  if (objStart !== -1) {
    let braceCount = 0;
    let inString = false;
    let escape = false;

    for (let i = objStart; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (char === '\\' && inString) {
        escape = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;

        if (braceCount === 0) {
          extracted = cleaned.substring(objStart, i + 1);
          break;
        }
      }
    }
  }

  // If no object found, try array
  if (!extracted) {
    const arrStart = cleaned.indexOf('[');
    if (arrStart !== -1) {
      let bracketCount = 0;
      let inString = false;
      let escape = false;

      for (let i = arrStart; i < cleaned.length; i++) {
        const char = cleaned[i];

        if (escape) {
          escape = false;
          continue;
        }

        if (char === '\\' && inString) {
          escape = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;

          if (bracketCount === 0) {
            extracted = cleaned.substring(arrStart, i + 1);
            break;
          }
        }
      }
    }
  }

  if (extracted) {
    cleaned = extracted;
  }

  // Fix escape sequences and newlines inside JSON strings
  let result = '';
  let inString = false;
  let escape = false;

  // Valid JSON escape sequences: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
  const validEscapes = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = cleaned[i + 1];

    if (escape) {
      // Check if this is a valid escape sequence
      if (validEscapes.has(char)) {
        result += char;
      } else {
        // Invalid escape - double the backslash to make it literal
        result += '\\' + char;
      }
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
      // Escape actual newlines/tabs/etc
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
    .replace(/,(\s*[}\]])/g, '$1') // trailing commas
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control characters
    .replace(/,\s*,/g, ',') // double commas
    .replace(/\[\s*,/g, '[') // empty array elements
    .replace(/,\s*\]/g, ']');

  return cleaned;
}
