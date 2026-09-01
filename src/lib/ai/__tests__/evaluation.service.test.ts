import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EvaluationService } from '../evaluation.service';

const { mockGenerateEvaluationContent } = vi.hoisted(() => {
  return { mockGenerateEvaluationContent: vi.fn() };
});

vi.mock('../gemini', () => ({
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
describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(() => {
    service = new EvaluationService();
    mockGenerateEvaluationContent.mockReset();
  });

  it('should successfully evaluate an attempt and parse the AI JSON output', async () => {
    mockGenerateEvaluationContent.mockResolvedValueOnce({
      text: JSON.stringify({
        grade: 'B',
        corrected_text: 'I eat an apple.',
        explanation_marathi: 'तुम्ही "an" विसरलात.',
        alternative_valid_translations: ['I am eating an apple.'],
        errors: ['ARTICLE']
      }),
      tokensUsed: 150
    });

    const result = await service.evaluateAttempt({
      marathiPrompt: 'मी सफरचंद खातो.',
      targetConceptName: 'Simple Present Tense',
      studentAnswer: 'I eat apple.',
      referenceTranslations: ['I eat an apple.']
    });

    expect(result.data.grade).toBe('B');
    expect(result.data.errors).toContain('ARTICLE');
    expect(result.metadata.tokensUsed).toBe(150);
  });

  it('should throw an error if student answer is > 500 characters', async () => {
    await expect(service.evaluateAttempt({
      marathiPrompt: 'Test',
      targetConceptName: 'Test Concept',
      studentAnswer: 'a'.repeat(501),
      referenceTranslations: ['Test']
    })).rejects.toThrow('Student answer exceeds maximum length of 500 characters.');
    
    expect(mockGenerateEvaluationContent).not.toHaveBeenCalled();
  });

  it('should strip errors and corrections if grade is A', async () => {
    mockGenerateEvaluationContent.mockResolvedValueOnce({
      text: JSON.stringify({
        grade: 'A',
        corrected_text: 'I eat an apple. (Hallucinated correction)',
        explanation_marathi: 'अगदी बरोबर!',
        alternative_valid_translations: [],
        errors: ['GRAMMAR'] // Hallucinated error
      })
    });

    const result = await service.evaluateAttempt({
      marathiPrompt: 'मी सफरचंद खातो.',
      targetConceptName: 'Simple Present Tense',
      studentAnswer: 'I eat an apple.',
      referenceTranslations: ['I eat an apple.']
    });

    expect(result.data.grade).toBe('A');
    expect(result.data.errors).toEqual([]);
    expect(result.data.corrected_text).toBeUndefined();
  });

  it('should fallback to reference translation if grade is C and corrected_text is missing', async () => {
    mockGenerateEvaluationContent.mockResolvedValueOnce({
      text: JSON.stringify({
        grade: 'C',
        explanation_marathi: 'चूक आहे.',
        alternative_valid_translations: [],
        errors: ['GRAMMAR']
      })
    });

    const result = await service.evaluateAttempt({
      marathiPrompt: 'मी सफरचंद खातो.',
      targetConceptName: 'Simple Present Tense',
      studentAnswer: 'I eat apple.',
      referenceTranslations: ['I eat an apple.']
    });

    expect(result.data.grade).toBe('C');
    expect(result.data.corrected_text).toBe('I eat an apple.');
  });

  it('should retry once if AI returns malformed JSON and throw GEMINI_SCHEMA_VALIDATION_ERROR', async () => {
    mockGenerateEvaluationContent
      .mockResolvedValueOnce({ text: 'Not JSON' })
      .mockResolvedValueOnce({ text: 'Still Not JSON' });

    await expect(service.evaluateAttempt({
      marathiPrompt: 'Test',
      targetConceptName: 'Test',
      studentAnswer: 'asdf',
      referenceTranslations: ['Test']
    })).rejects.toThrow('AI response format invalid. Please retry.');

    expect(mockGenerateEvaluationContent).toHaveBeenCalledTimes(2);
  });

  it('should throw GEMINI_PROVIDER_ERROR if it fails after retries', async () => {
    mockGenerateEvaluationContent.mockRejectedValue(new Error('Some network failure'));

    await expect(service.evaluateAttempt({
      marathiPrompt: 'Test',
      targetConceptName: 'Test',
      studentAnswer: 'asdf',
      referenceTranslations: ['Test']
    })).rejects.toThrow('Connection issue. Please retry.');

    expect(mockGenerateEvaluationContent).toHaveBeenCalledTimes(2);
  });

  it('should not retry and immediately throw GEMINI_TIMEOUT_ERROR', async () => {
    const { GeminiTimeoutError } = await import('../gemini');
    mockGenerateEvaluationContent.mockRejectedValueOnce(new GeminiTimeoutError());

    await expect(service.evaluateAttempt({
      marathiPrompt: 'Test',
      targetConceptName: 'Test',
      studentAnswer: 'asdf',
      referenceTranslations: ['Test']
    })).rejects.toThrow('AI timeout. Please try again.');

    expect(mockGenerateEvaluationContent).toHaveBeenCalledTimes(1);
  });
});
