import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionService } from '../services/session.service';

const mockSupabase = {
  from: vi.fn(),
};

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sessionService = new SessionService(mockSupabase as any);
  });

  describe('completeSession', () => {
    it('marks a session as completed and calculates XP and Mastery', async () => {
      const mockSessionData = {
        id: 'session-id',
        student_id: 'student-id',
        status: 'IN_PROGRESS',
        students: { total_xp: 100, current_streak: 5, last_practiced_at: '2026-09-01T10:00:00Z', current_stage_id: 1 }
      };

      const mockAttemptsData = [
        {
          id: 'se-1',
          exercises: { concept_id: 'concept-1' },
          attempts: [
            { id: 'att-1', evaluations: [{ grade: 'A' }] } // +10 XP
          ]
        },
        {
          id: 'se-2',
          exercises: { concept_id: 'concept-1' },
          attempts: [
            { id: 'att-2', evaluations: [{ grade: 'C' }] } // +5 XP
          ]
        }
      ]; // Total 15 XP

      const mockMasteryData = [
        { concept_id: 'concept-1', status: 'INTRODUCED', correct_attempts: 1, incorrect_attempts: 1, last_practiced_at: null }
      ];

      const mockStageConcepts = [{ id: 'concept-1' }];
      
      const sessionsSingleMock = vi.fn()
        .mockResolvedValueOnce({ data: mockSessionData, error: null })
        .mockResolvedValueOnce({ data: { id: 'session-id', status: 'COMPLETED', xp_earned: 15 }, error: null });

      const sessionsMock = {
         select: vi.fn().mockReturnThis(),
         eq: vi.fn().mockReturnThis(),
         single: sessionsSingleMock,
         update: vi.fn().mockReturnThis()
      };

      const sessionExercisesMock = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: mockAttemptsData, error: null }) };
      const masteryMock = { 
        select: vi.fn().mockReturnThis(), 
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockMasteryData, error: null }),
        upsert: vi.fn().mockResolvedValue({ error: null })
      };
      const conceptsMock = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: mockStageConcepts, error: null }) };
      const studentsMock = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) };
      const defaultMock = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'sessions') return sessionsMock;
        if (table === 'session_exercises') return sessionExercisesMock;
        if (table === 'mastery') return masteryMock;
        if (table === 'concepts') return conceptsMock;
        if (table === 'students') return studentsMock;
        return defaultMock;
      });

      const result = await sessionService.completeSession('session-id');

      expect(result.status).toBe('COMPLETED');
      expect(result.xp_earned).toBe(15);
      expect(mockSupabase.from).toHaveBeenCalledWith('mastery');
      expect(mockSupabase.from).toHaveBeenCalledWith('students');
    });
  });

  describe('initializeSession', () => {
    it('should insert a new session and return it', async () => {
      const mockSession = { id: 'session-123', status: 'IN_PROGRESS' };
      
      const selectMock = { 
        single: vi.fn().mockResolvedValue({ data: mockSession, error: null }), 
        eq: vi.fn().mockReturnThis(), 
        limit: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis()
      };
      const insertMock = { select: vi.fn().mockReturnValue(selectMock) };
      
      // Mock for both insert and select paths
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'sessions') {
          return { insert: vi.fn().mockReturnValue(insertMock) };
        }
        if (table === 'session_exercises') {
          return { insert: vi.fn().mockResolvedValue({ error: null }) };
        }
        // For mastery, concepts, exercises, curriculum_stages
        return { select: vi.fn().mockReturnValue(selectMock) };
      });

      const result = await sessionService.initializeSession('student-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('sessions');
      expect(result).toEqual(mockSession);
    });

    it('should throw an error if insert fails', async () => {
      const selectMock = { single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }) };
      const insertMock = { select: vi.fn().mockReturnValue(selectMock) };
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'sessions') return { insert: vi.fn().mockReturnValue(insertMock) };
        return { select: vi.fn().mockReturnValue(selectMock) };
      });

      await expect(sessionService.initializeSession('student-123')).rejects.toThrow('Failed to initialize session: DB Error');
    });
  });

  describe('getNextExercise', () => {
    it('should return null if no pending exercises exist (PGRST116)', async () => {
      const limitMock = { single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) };
      const orderMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const eqMock2 = { order: vi.fn().mockReturnValue(orderMock) };
      const eqMock1 = { eq: vi.fn().mockReturnValue(eqMock2) };
      const selectMock = { eq: vi.fn().mockReturnValue(eqMock1) };
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) });

      const result = await sessionService.getNextExercise('session-123');
      expect(result).toBeNull();
    });
  });
});
