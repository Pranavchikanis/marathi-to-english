import { z } from 'zod';

export const localSessionStateSchema = z.object({
  version: z.literal(1),
  sessionId: z.string().uuid(),
  currentExerciseIndex: z.number().int().min(0),
  pendingInput: z.string(),
  lastUpdated: z.string().datetime()
});

export type LocalSessionState = z.infer<typeof localSessionStateSchema>;
