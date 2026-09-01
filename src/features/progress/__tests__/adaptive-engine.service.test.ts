import { describe, it, expect, vi } from 'vitest';
import { AdaptiveEngineService } from '../services/adaptive-engine.service';

describe('AdaptiveEngineService', () => {
  describe('evaluateMidSessionAdaptation', () => {
    it('returns REMEDIATE if 3 consecutive errors occur on same concept', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              { exercises: { concept_id: 'c1' }, attempts: [{ evaluations: [{ grade: 'E' }] }] },
              { exercises: { concept_id: 'c1' }, attempts: [{ evaluations: [{ grade: 'D' }] }] },
              { exercises: { concept_id: 'c1' }, attempts: [{ evaluations: [{ grade: 'C' }] }] },
            ],
            error: null
          })
        })
      };

      const result = await AdaptiveEngineService.evaluateMidSessionAdaptation('s1', mockSupabase as any);
      expect(result).toEqual({
        type: 'REMEDIATE',
        targetConceptId: 'c1',
        targetDifficulty: 1,
        reason: '3 consecutive errors detected in current session.'
      });
    });

    it('returns null if there are fewer than 3 errors', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              { exercises: { concept_id: 'c1' }, attempts: [{ evaluations: [{ grade: 'E' }] }] },
              { exercises: { concept_id: 'c1' }, attempts: [{ evaluations: [{ grade: 'A' }] }] },
              { exercises: { concept_id: 'c1' }, attempts: [{ evaluations: [{ grade: 'C' }] }] },
            ],
            error: null
          })
        })
      };

      const result = await AdaptiveEngineService.evaluateMidSessionAdaptation('s1', mockSupabase as any);
      expect(result).toBeNull();
    });
  });

  describe('calculateConceptDifficulty', () => {
    it('increases difficulty after 3 consecutive A/B grades', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              { evaluations: [{ grade: 'A' }], session_exercises: { exercises: { difficulty_level: 2 } } },
              { evaluations: [{ grade: 'B' }], session_exercises: { exercises: { difficulty_level: 2 } } },
              { evaluations: [{ grade: 'A' }], session_exercises: { exercises: { difficulty_level: 2 } } },
            ],
            error: null
          })
        })
      };

      const result = await AdaptiveEngineService.calculateConceptDifficulty('u1', 'c1', mockSupabase as any);
      expect(result).toBe(3); // 2 + 1
    });

    it('decreases difficulty after 2 consecutive D/E grades', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              { evaluations: [{ grade: 'D' }], session_exercises: { exercises: { difficulty_level: 3 } } },
              { evaluations: [{ grade: 'E' }], session_exercises: { exercises: { difficulty_level: 3 } } },
            ],
            error: null
          })
        })
      };

      const result = await AdaptiveEngineService.calculateConceptDifficulty('u1', 'c1', mockSupabase as any);
      expect(result).toBe(2); // 3 - 1
    });

    it('keeps difficulty same if mixed grades', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              { evaluations: [{ grade: 'D' }], session_exercises: { exercises: { difficulty_level: 3 } } },
              { evaluations: [{ grade: 'A' }], session_exercises: { exercises: { difficulty_level: 3 } } },
            ],
            error: null
          })
        })
      };

      const result = await AdaptiveEngineService.calculateConceptDifficulty('u1', 'c1', mockSupabase as any);
      expect(result).toBe(3); // stays 3
    });
  });
});
