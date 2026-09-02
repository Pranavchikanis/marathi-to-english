import { z } from 'zod';
import { Schema, Type } from '@google/genai';

// Zod schema for server-side validation of the JSON response
export const AiEvaluationSchema = z.object({
  grade: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
  corrected_text: z.string().nullish(),
  explanation_marathi: z.string(),
  alternative_valid_translations: z.array(z.string()).nullish(),
  errors: z.array(
    z.enum([
      'GRAMMAR', 'TENSE', 'ARTICLE', 'PREPOSITION', 'WORD_ORDER', 
      'AGREEMENT', 'VOCABULARY', 'SPELLING', 'MISSING_WORD', 
      'EXTRA_WORD', 'MEANING', 'NATURALNESS'
    ])
  ).nullish(),
});

export type AiEvaluation = z.infer<typeof AiEvaluationSchema>;

// Gemini structured output schema definition (for @google/genai)
export const GeminiEvaluationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    grade: {
      type: Type.STRING,
      description: "Letter grade from A to F based on accuracy.",
      enum: ['A', 'B', 'C', 'D', 'E', 'F']
    },
    corrected_text: {
      type: Type.STRING,
      description: "The correct English translation, if the user's answer had mistakes."
    },
    explanation_marathi: {
      type: Type.STRING,
      description: "Explanation of the grade and mistakes, written in Marathi."
    },
    alternative_valid_translations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Other acceptable ways to translate the prompt."
    },
    errors: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        enum: [
          'GRAMMAR', 'TENSE', 'ARTICLE', 'PREPOSITION', 'WORD_ORDER', 
          'AGREEMENT', 'VOCABULARY', 'SPELLING', 'MISSING_WORD', 
          'EXTRA_WORD', 'MEANING', 'NATURALNESS'
        ]
      },
      description: "Categories of errors made, if any."
    }
  },
  required: ['grade', 'explanation_marathi', 'alternative_valid_translations']
};
