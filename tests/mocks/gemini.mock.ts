import { vi } from 'vitest';

export const mockGenerateEvaluationContent = vi.fn();

vi.mock('@/lib/ai/gemini', () => ({
  generateEvaluationContent: mockGenerateEvaluationContent,
  GeminiTimeoutError: class extends Error {
    constructor() { super('GEMINI_TIMEOUT_ERROR'); this.name = 'GeminiTimeoutError'; }
  },
  GeminiRateLimitError: class extends Error {
    constructor() { super('GEMINI_RATE_LIMIT_ERROR'); this.name = 'GeminiRateLimitError'; }
  },
  GeminiProviderError: class extends Error {
    constructor(msg = 'Provider Error') { super(msg); this.name = 'GeminiProviderError'; }
  },
  GeminiSafetyRefusal: class extends Error {
    constructor() { super('GEMINI_SAFETY_REFUSAL'); this.name = 'GeminiSafetyRefusal'; }
  }
}));
