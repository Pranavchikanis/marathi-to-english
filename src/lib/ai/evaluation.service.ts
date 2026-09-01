import { AiEvaluationSchema, AiEvaluation } from './schemas/gemini-response.schema';
import { buildEvaluationPrompt } from './prompts/evaluation.prompt';
import { 
  generateEvaluationContent, 
  GeminiTimeoutError, 
  GeminiRateLimitError, 
  GeminiSafetyRefusal 
} from './gemini';
import { ProviderError, ValidationError } from '@/lib/error';

export interface EvaluationContext {
  marathiPrompt: string;
  targetConceptName: string;
  studentAnswer: string;
  referenceTranslations: string[];
}

export class EvaluationService {
  /**
   * Sends the attempt to Gemini for semantic evaluation.
   */
  async evaluateAttempt(context: EvaluationContext): Promise<{ data: AiEvaluation; metadata: any }> {
    if (context.studentAnswer.length > 500) {
      throw new ValidationError('Student answer exceeds maximum length of 500 characters.');
    }

    if (process.env.MOCK_GEMINI === 'true') {
      const isWrong = context.studentAnswer.toLowerCase().includes('wrong') || 
                      context.studentAnswer.toLowerCase().includes('error');
                      
      if (isWrong) {
        return {
          data: {
            grade: 'E',
            explanation_marathi: 'हे चुकीचे आहे. योग्य उत्तर: ' + (context.referenceTranslations[0] || '...'),
            corrected_text: context.referenceTranslations[0] || 'N/A',
            alternative_valid_translations: [],
            errors: ['GRAMMAR'],
          },
          metadata: { model: 'mock', tokensUsed: 0 }
        };
      }

      return {
        data: {
          grade: 'A',
          explanation_marathi: 'अगदी बरोबर!',
          alternative_valid_translations: [],
          errors: [],
        },
        metadata: { model: 'mock', tokensUsed: 0 }
      };
    }

    const promptContext = buildEvaluationPrompt(context);
    let attempts = 0;
    const maxRetries = 1;

    while (attempts <= maxRetries) {
      try {
        const response = await generateEvaluationContent(
          promptContext.systemInstruction, 
          promptContext.contents
        );

        let parsedJson;
        try {
          parsedJson = JSON.parse(response.text);
        } catch (parseError) {
          throw new ProviderError('GEMINI_SCHEMA_VALIDATION_ERROR');
        }
        
        // Validate using our Zod schema
        const validationResult = AiEvaluationSchema.safeParse(parsedJson);
        
        if (!validationResult.success) {
          console.warn('AI Schema Validation Failed:', validationResult.error);
          throw new ProviderError('GEMINI_SCHEMA_VALIDATION_ERROR');
        }

        // Apply Business Validation Rules
        const evaluation = validationResult.data;

        // Rule: If grade is A, strip errors and corrections
        if (evaluation.grade === 'A') {
          evaluation.errors = [];
          evaluation.corrected_text = undefined;
        }

        // Rule: If grade is C, D, or E, enforce presence of corrected_text
        if (['C', 'D', 'E'].includes(evaluation.grade) && !evaluation.corrected_text) {
          console.warn('AI failed to provide corrected_text for grade', evaluation.grade);
          evaluation.corrected_text = context.referenceTranslations[0] || 'N/A'; // Fallback
        }

        return {
          data: evaluation,
          metadata: {
            model: 'gemini-flash-latest',
            tokensUsed: response.tokensUsed,
          }
        };
      } catch (error: any) {
        // Fast fail for non-retryable errors
        if (error instanceof GeminiTimeoutError || error.message?.includes('TIMEOUT')) {
          throw new ProviderError('AI timeout. Please try again.', true);
        }
        if (error instanceof GeminiRateLimitError || error.message?.includes('RATE_LIMIT')) {
          throw new ProviderError('Rate limit exceeded. Please wait a moment.', true);
        }
        if (error instanceof GeminiSafetyRefusal || error.message?.includes('SAFETY_REFUSAL')) {
          throw new ProviderError('AI safety block. Cannot process this answer.', false);
        }

        // Retryable errors: Provider Errors (5xx) or Schema Validation Errors
        attempts++;
        if (attempts > maxRetries) {
          console.error('Error in EvaluationService after retries:', error);
          if (error instanceof ProviderError && error.message === 'GEMINI_SCHEMA_VALIDATION_ERROR') {
            throw new ProviderError('AI response format invalid. Please retry.', true);
          }
          throw new ProviderError('Connection issue. Please retry.', true);
        }
        console.warn(`Evaluation failed, retrying (${attempts}/${maxRetries})...`, error);
      }
    }

    throw new ProviderError('Connection issue. Please retry.', true);
  }
}

