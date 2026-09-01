import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProgressService } from '../services/progress.service';

describe('ProgressService', () => {
  describe('calculateAttemptXp', () => {
    it('returns 10 XP for Grade A and B', () => {
      expect(ProgressService.calculateAttemptXp('A')).toBe(10);
      expect(ProgressService.calculateAttemptXp('B')).toBe(10);
    });

    it('returns 5 XP for Grade C and D', () => {
      expect(ProgressService.calculateAttemptXp('C')).toBe(5);
      expect(ProgressService.calculateAttemptXp('D')).toBe(5);
    });

    it('returns 1 XP for Grade E and F', () => {
      expect(ProgressService.calculateAttemptXp('E')).toBe(1);
      expect(ProgressService.calculateAttemptXp('F')).toBe(1);
    });
  });

  describe('calculateStreak', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns 1 if lastSessionDate is null', () => {
      expect(ProgressService.calculateStreak(null, 0)).toBe(1);
    });

    it('returns same streak if practiced on the same day in IST', () => {
      // 2026-09-01T10:00:00Z is 2026-09-01T15:30:00 IST
      // 2026-09-01T12:00:00Z is 2026-09-01T17:30:00 IST (Same Day)
      const lastSession = '2026-09-01T10:00:00.000Z';
      const currentSession = '2026-09-01T12:00:00.000Z';
      
      expect(ProgressService.calculateStreak(lastSession, 5, currentSession)).toBe(5);
    });

    it('increments streak if practiced on the next day in IST', () => {
      // 2026-09-01T20:00:00Z is 2026-09-02T01:30:00 IST (Next Day in IST)
      const lastSession = '2026-09-01T10:00:00.000Z'; // 15:30 IST
      const currentSession = '2026-09-01T20:00:00.000Z'; // 01:30 next day IST
      
      expect(ProgressService.calculateStreak(lastSession, 5, currentSession)).toBe(6);
    });

    it('resets streak to 1 if practiced after skipping a day', () => {
      // 2026-09-01 to 2026-09-03
      const lastSession = '2026-09-01T10:00:00.000Z'; 
      const currentSession = '2026-09-03T10:00:00.000Z';
      
      expect(ProgressService.calculateStreak(lastSession, 5, currentSession)).toBe(1);
    });
  });
});
