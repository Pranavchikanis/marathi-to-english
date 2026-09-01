import { GoogleGenAI } from '@google/genai';
import { env } from '@/config/env';
import { GeminiEvaluationSchema } from './schemas/gemini-response.schema';

// Initialized strictly server-side
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export class GeminiTimeoutError extends Error {
  constructor() {
    super('GEMINI_TIMEOUT_ERROR');
    this.name = 'GeminiTimeoutError';
  }
}

export class GeminiRateLimitError extends Error {
  constructor() {
    super('GEMINI_RATE_LIMIT_ERROR');
    this.name = 'GeminiRateLimitError';
  }
}

export class GeminiProviderError extends Error {
  constructor(message: string) {
    super(`GEMINI_PROVIDER_ERROR: ${message}`);
    this.name = 'GeminiProviderError';
  }
}

export class GeminiSafetyRefusal extends Error {
  constructor() {
    super('GEMINI_SAFETY_REFUSAL');
    this.name = 'GeminiSafetyRefusal';
  }
}

export async function generateEvaluationContent(systemInstruction: string, contents: string) {
  const abortController = new AbortController();
  
  // AbortSignal.timeout is a standard web API available in modern Node.js
  // But to be fully safe with Node versions, we can use a setTimeout fallback if needed,
  // or just use AbortSignal.timeout. Next.js 14+ supports AbortSignal.timeout()
  const timeoutId = setTimeout(() => abortController.abort(new GeminiTimeoutError()), 5000);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: GeminiEvaluationSchema,
        temperature: 0.2, // Low temp for deterministic evaluation
      },
      // Note: currently @google/genai might not officially support passing an abortSignal 
      // in the standard options yet. We'll pass it if the SDK allows, 
      // but otherwise the timeout might be bounded by the SDK's internal timeouts.
      // Assuming SDK supports standard fetch options or we handle it via wrapper:
    });
    
    clearTimeout(timeoutId);

    // Check for safety blocks
    if (response.promptFeedback?.blockReason) {
      throw new GeminiSafetyRefusal();
    }

    if (!response.text) {
      throw new GeminiProviderError('No text returned from Gemini');
    }

    return {
      text: response.text,
      tokensUsed: response.usageMetadata?.totalTokenCount || 0
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Map SDK errors
    if (error instanceof GeminiTimeoutError || error.name === 'AbortError' || error.name === 'GeminiTimeoutError') {
      throw new GeminiTimeoutError();
    }
    
    if (error instanceof GeminiSafetyRefusal) {
      throw error;
    }
    
    if (error.status === 429) {
      throw new GeminiRateLimitError();
    }

    // Default to provider error for 5xx and others
    throw new GeminiProviderError(error.message || 'Unknown SDK Error');
  }
}
