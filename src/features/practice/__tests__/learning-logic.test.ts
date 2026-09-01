import { describe, it, expect } from 'vitest';
import { calculateExerciseXP, isPassingGrade } from '../utils/scoring';

describe('Learning Logic & Scoring', () => {
  describe('isPassingGrade', () => {
    it('should return true for passing grades (A, B, C)', () => {
      expect(isPassingGrade('A')).toBe(true);
      expect(isPassingGrade('B')).toBe(true);
      expect(isPassingGrade('C')).toBe(true);
    });

    it('should return false for failing grades (D, E, F)', () => {
      expect(isPassingGrade('D')).toBe(false);
      expect(isPassingGrade('E')).toBe(false);
      expect(isPassingGrade('F')).toBe(false);
    });
  });

  describe('calculateExerciseXP', () => {
    it('should return 15 XP (Base 10 + Bonus 5) for a perfect grade A', () => {
      expect(calculateExerciseXP('A')).toBe(15);
    });

    it('should return 10 XP (Base only) for passing grades B and C', () => {
      expect(calculateExerciseXP('B')).toBe(10);
      expect(calculateExerciseXP('C')).toBe(10);
    });

    it('should return 0 XP for failing grades', () => {
      expect(calculateExerciseXP('D')).toBe(0);
      expect(calculateExerciseXP('E')).toBe(0);
      expect(calculateExerciseXP('F')).toBe(0);
    });
  });
});
