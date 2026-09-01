import { describe, it, expect } from 'vitest';
import { CurriculumService } from '../services/curriculum.service';

describe('CurriculumService', () => {
  describe('getDailyPlanTemplate', () => {
    it('returns exactly 10 exercises matching REQ-C-05 distribution', () => {
      const plan = CurriculumService.getDailyPlanTemplate();
      
      expect(plan.length).toBe(10);
      
      const warmupCount = plan.filter(p => p.phase === 'WARMUP').length;
      const coreCount = plan.filter(p => p.phase === 'CORE').length;
      const voiceCount = plan.filter(p => p.phase === 'VOICE').length;
      const reviewCount = plan.filter(p => p.phase === 'REVIEW').length;
      
      expect(warmupCount).toBe(2);
      expect(coreCount).toBe(5);
      expect(voiceCount).toBe(2);
      expect(reviewCount).toBe(1);
    });
  });
});
