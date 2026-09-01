import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitAnswer, startSession } from '../actions';
import * as serverSupabase from '@/lib/supabase/server';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}));
vi.mock('../services/session.service');

describe('API Actions / Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitAnswer (Idempotency and Integration)', () => {
    it('returns DUPLICATE_SUBMISSION if attempt already exists', async () => {
      const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      vi.mocked(serverSupabase.createClient).mockResolvedValue({
        auth: { getUser: mockGetUser },
      } as never);

      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          session_id: 'session-1',
          sessions: { students: { auth_user_id: 'user-1' } }
        },
        error: null
      });

      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'existing-attempt' } // Attempt exists!
      });

      vi.mocked(serverSupabase.createServiceClient).mockReturnValue({
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'session_exercises') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: mockSingle
                })
              })
            };
          }
          if (table === 'attempts') {
             return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: mockMaybeSingle
                })
              })
            };
          }
          return {};
        })
      } as never);

      const result = await submitAnswer({
        sessionExerciseId: '123e4567-e89b-12d3-a456-426614174000',
        modality: 'TEXT',
        submittedAnswer: 'Test',
        wasEdited: false
      });

      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({ code: 'DUPLICATE_SUBMISSION', message: 'Answer already submitted for this exercise' })
      });
    });
  });

  describe('startSession', () => {
    it('returns UNAUTHORIZED if no user', async () => {
      const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
      vi.mocked(serverSupabase.createClient).mockResolvedValue({
        auth: { getUser: mockGetUser },
      } as never);

      const result = await startSession();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });
});
