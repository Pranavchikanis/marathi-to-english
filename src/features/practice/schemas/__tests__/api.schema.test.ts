import { describe, it, expect } from 'vitest';
import { submitAnswerSchema } from '../api.schema';
import { localSessionStateSchema } from '../recovery.schema';

describe('API Schemas', () => {
  describe('submitAnswerSchema', () => {
    it('should validate a correct text payload', () => {
      const payload = {
        sessionExerciseId: '123e4567-e89b-12d3-a456-426614174000',
        modality: 'TEXT',
        submittedAnswer: 'I eat an apple.',
      };

      const result = submitAnswerSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.wasEdited).toBe(false); // Default value
      }
    });

    it('should fail on invalid uuid', () => {
      const payload = {
        sessionExerciseId: 'invalid-uuid',
        modality: 'TEXT',
        submittedAnswer: 'I eat an apple.',
      };

      const result = submitAnswerSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should trim inputs', () => {
      const payload = {
        sessionExerciseId: '123e4567-e89b-12d3-a456-426614174000',
        modality: 'TEXT',
        submittedAnswer: '   I eat an apple.   ',
      };

      const result = submitAnswerSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.submittedAnswer).toBe('I eat an apple.');
      }
    });
  });
});

describe('Recovery Schemas', () => {
  describe('localSessionStateSchema', () => {
    it('should validate correct state', () => {
      const state = {
        version: 1,
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        currentExerciseIndex: 0,
        pendingInput: '',
        lastUpdated: new Date().toISOString()
      };

      const result = localSessionStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid version', () => {
      const state = {
        version: 2, // Must be 1
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
        currentExerciseIndex: 0,
        pendingInput: '',
        lastUpdated: new Date().toISOString()
      };

      const result = localSessionStateSchema.safeParse(state);
      expect(result.success).toBe(false);
    });
  });
});
