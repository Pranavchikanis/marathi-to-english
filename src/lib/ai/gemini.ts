import { GoogleGenAI } from '@google/genai';
import { env } from '@/config/env';
import { GeminiEvaluationSchema } from './schemas/gemini-response.schema';

function getRandomGenAIClient(): GoogleGenAI {
  const keysStr = env.GEMINI_API_KEYS;
  let keys: string[] = [];

  if (keysStr) {
    keys = keysStr.split(',').map(k => k.trim()).filter(Boolean);
  }

  // Fallback to single key if multiple keys string is empty or undefined
  if (keys.length === 0 && env.GEMINI_API_KEY) {
    keys = [env.GEMINI_API_KEY];
  }

  if (keys.length === 0) {
    throw new Error('No valid keys found in GEMINI_API_KEYS or GEMINI_API_KEY');
  }

  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return new GoogleGenAI({ apiKey: randomKey });
}

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
    const ai = getRandomGenAIClient();
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

export async function generateInfiniteExercises(conceptName: string, count: number = 10) {
  const ai = getRandomGenAIClient();
  const systemInstruction = `You are an expert Marathi and English linguist creating practice exercises for a language learning app.
The user is learning English from Marathi.
Generate exactly ${count} diverse and realistic sentences that teach the concept: "${conceptName}".
Format the output as a JSON array of objects. Each object must exactly match this interface:
{
  "marathi_prompt": "The Marathi sentence to translate",
  "reference_translations": ["The primary English translation", "An alternative valid English translation"],
  "difficulty_level": 1 // integer from 1 to 3
}

Ensure the sentences vary in structure, vocabulary, and context (e.g. casual, formal, questions, statements). Keep it highly contextual.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: 'Generate the exercises as JSON.',
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.7,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty response for infinite exercises');
  }

  return JSON.parse(text);
}

export async function generateNextCurriculumTopic(learnedTopics: string[]) {
  const ai = getRandomGenAIClient();
  const systemInstruction = `You are an expert English curriculum designer for Marathi speakers.
The student has already learned the following English grammatical concepts:
${learnedTopics.length > 0 ? learnedTopics.map(t => `- ${t}`).join('\n') : "None (Absolute Beginner)"}

Based on this, what is the SINGLE MOST LOGICAL next grammatical concept they should learn?
Return a JSON object with this exact interface:
{
  "name": "Short name of the concept (e.g. 'Present Continuous Tense' or 'Basic Greetings')",
  "description": "A short, one-sentence description of what this teaches"
}

Do not return anything other than the JSON object.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: 'Generate the next curriculum topic as JSON.',
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.7,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty response for curriculum topic');
  }

  return JSON.parse(text) as { name: string, description: string };
}
