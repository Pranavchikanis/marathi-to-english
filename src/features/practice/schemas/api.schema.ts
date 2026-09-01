import { z } from 'zod';
import { Evaluation, EvaluationError } from '../types';

export const submitAnswerSchema = z.object({
  sessionExerciseId: z.string().uuid(),
  modality: z.enum(['TEXT', 'VOICE']),
  rawTranscription: z.string().trim().max(1000).nullable().optional(),
  submittedAnswer: z.string().trim().max(500),
  wasEdited: z.boolean().optional().default(false)
});

export type SubmitAnswerRequest = z.infer<typeof submitAnswerSchema>;

// Note: EvaluationResponse is a contract interface, not a Zod schema, because it is 
// the return type of a trusted server action, not raw user input.
export interface EvaluationResponse {
  evaluation: Evaluation;
  errors: EvaluationError[];
}
