import { describe, it, expect } from 'vitest';
import { MasteryService } from '../services/mastery.service';
import { MasteryProfile } from '../types';

describe('MasteryService', () => {
  describe('processAttemptEvidence', () => {
    const baseProfile: MasteryProfile = {
      conceptId: 'test-concept',
      status: 'INTRODUCED',
      correctAttempts: 0,
      incorrectAttempts: 0,
    };

    it('should increment correctAttempts for grade A', () => {
      const result = MasteryService.processAttemptEvidence('A', baseProfile);
      expect(result.correctAttempts).toBe(1);
      expect(result.incorrectAttempts).toBe(0);
    });

    it('should increment correctAttempts for grade B', () => {
      const result = MasteryService.processAttemptEvidence('B', baseProfile);
      expect(result.correctAttempts).toBe(1);
    });

    it('should increment incorrectAttempts for grade C, D, E', () => {
      const grades: Array<'C' | 'D' | 'E'> = ['C', 'D', 'E'];
      grades.forEach(grade => {
        const result = MasteryService.processAttemptEvidence(grade, baseProfile);
        expect(result.incorrectAttempts).toBe(1);
      });
    });

    it('should ignore grade F (technical failure)', () => {
      const result = MasteryService.processAttemptEvidence('F', baseProfile);
      expect(result.correctAttempts).toBe(0);
      expect(result.incorrectAttempts).toBe(0);
    });
  });

  describe('evaluateStateTransitions', () => {
    it('transitions NOT_INTRODUCED to INTRODUCED after an attempt', () => {
      const profile: MasteryProfile = {
        conceptId: 'c1',
        status: 'NOT_INTRODUCED',
        correctAttempts: 1,
        incorrectAttempts: 0
      };
      const state = MasteryService.evaluateStateTransitions(profile, 1, 0, 0);
      expect(state).toBe('INTRODUCED');
    });

    it('transitions INTRODUCED to DEVELOPING on 3 consecutive correct', () => {
      const profile: MasteryProfile = {
        conceptId: 'c1',
        status: 'INTRODUCED',
        correctAttempts: 3,
        incorrectAttempts: 0
      };
      const state = MasteryService.evaluateStateTransitions(profile, 3, 0, 0);
      expect(state).toBe('DEVELOPING');
    });

    it('transitions DEVELOPING to PROFICIENT on 3 consecutive correct and >= 6 total correct', () => {
      const profile: MasteryProfile = {
        conceptId: 'c1',
        status: 'DEVELOPING',
        correctAttempts: 6,
        incorrectAttempts: 0
      };
      const state = MasteryService.evaluateStateTransitions(profile, 3, 0, 0);
      expect(state).toBe('PROFICIENT');
    });

    it('decays PROFICIENT to NEEDS_REVIEW after 7 days', () => {
      const profile: MasteryProfile = {
        conceptId: 'c1',
        status: 'PROFICIENT',
        correctAttempts: 10,
        incorrectAttempts: 0
      };
      const state = MasteryService.evaluateStateTransitions(profile, 0, 0, 8);
      expect(state).toBe('NEEDS_REVIEW');
    });

    it('forces NEEDS_REVIEW on 3 consecutive errors from any state', () => {
      const profile: MasteryProfile = {
        conceptId: 'c1',
        status: 'PROFICIENT',
        correctAttempts: 10,
        incorrectAttempts: 0
      };
      const state = MasteryService.evaluateStateTransitions(profile, 0, 3, 0);
      expect(state).toBe('NEEDS_REVIEW');
    });
  });
});
