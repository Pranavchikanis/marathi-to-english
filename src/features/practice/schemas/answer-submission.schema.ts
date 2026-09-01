import { z } from 'zod';

export const SubmitAnswerSchema = z.object({
  sessionExerciseId: z.string().uuid(),
  submittedAnswer: z.string().min(1, 'Answer cannot be empty'),
  modality: z.enum(['TEXT', 'VOICE']),
  rawTranscription: z.string().optional(),
  wasEdited: z.boolean().default(false),
});

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
