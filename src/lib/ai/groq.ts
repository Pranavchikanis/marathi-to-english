import Groq from 'groq-sdk';
import { env } from '@/config/env';

export class GroqTimeoutError extends Error {
  constructor() {
    super('GROQ_TIMEOUT');
    this.name = 'GroqTimeoutError';
  }
}

export class GroqRateLimitError extends Error {
  constructor() {
    super('GROQ_RATE_LIMIT');
    this.name = 'GroqRateLimitError';
  }
}

export class GroqProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroqProviderError';
  }
}

function getGroqClient(): Groq {
  if (!env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }
  return new Groq({ apiKey: env.GROQ_API_KEY });
}

export async function generateEvaluationContent(systemInstruction: string, contents: string, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(new GroqTimeoutError()), 8000);

    try {
      const groq = getGroqClient();
      
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemInstruction + '\n\nIMPORTANT: You must return ONLY valid JSON matching the exact schema requested. Do not include any markdown formatting like ```json or any conversational text.' },
          { role: 'user', content: contents }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }, { signal: abortController.signal as any });
      
      clearTimeout(timeoutId);

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new GroqProviderError('No text returned from Groq');
      }

      return {
        text: text,
        tokensUsed: response.usage?.total_tokens || 0
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      attempt++;
      
      if (attempt >= maxRetries) {
        if (error instanceof GroqTimeoutError || error.name === 'AbortError') {
          throw new GroqTimeoutError();
        }
        if (error.status === 429) {
          throw new GroqRateLimitError();
        }
        if (error.status === 503 || error.status === 500) {
           throw new GroqProviderError("Service is currently experiencing high demand. Please try again.");
        }
        throw new GroqProviderError(error.message || 'Unknown SDK Error');
      }
      
      await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt)));
    }
  }
  throw new GroqProviderError('Failed to generate evaluation after retries');
}

export async function generateInfiniteExercises(conceptName: string, count: number = 10, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const groq = getGroqClient();
      const systemInstruction = `You are an expert Marathi and English linguist creating practice exercises for a language learning app.
The user is learning English from Marathi.
Generate exactly ${count} diverse and realistic sentences that teach the concept: "${conceptName}".
Format the output as a JSON array of objects. Each object must exactly match this interface:
{
  "marathi_prompt": "The Marathi sentence to translate",
  "reference_translations": ["The primary English translation", "An alternative valid English translation"],
  "difficulty_level": 1 // integer from 1 to 3
}

Ensure the sentences vary in structure, vocabulary, and context (e.g. casual, formal, questions, statements). Keep it highly contextual.
IMPORTANT: You must return ONLY valid JSON. The top level must be a JSON object with a key "exercises" containing the array of objects.`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: 'Generate the exercises as JSON.' }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error('Groq returned empty response for infinite exercises');
      }

      const parsed = JSON.parse(text);
      return parsed.exercises || parsed;
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt)));
    }
  }
  throw new Error("Failed to generate exercises after retries");
}

export async function generateNextCurriculumTopic(learnedTopics: string[], maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const groq = getGroqClient();
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

      const response = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: 'Generate the next curriculum topic as JSON.' }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error('Groq returned empty response for curriculum topic');
      }

      return JSON.parse(text) as { name: string, description: string };
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt)));
    }
  }
  throw new Error("Failed to generate concept after retries");
}
