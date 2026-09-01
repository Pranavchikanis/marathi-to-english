import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitAnswer, nextExercise } from '../actions'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => {
  const mockUser = { id: 'auth-user-123' };
  
  const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'session_exercises') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            session_id: 'session-123',
            sessions: { students: { auth_user_id: 'HACKER-ID' } },
            exercises: { marathi_prompt: 'test', reference_translations: [], concepts: { name: 'test' } }
          },
          error: null
        })
      }
    }
    
    if (table === 'sessions') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            student_id: 'student-123',
            students: { auth_user_id: 'HACKER-ID' }
          },
          error: null
        })
      }
    }
    
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    }
  });

  return {
    createClient: vi.fn().mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) }
    }),
    createServiceClient: vi.fn().mockReturnValue({
      from: mockFrom
    })
  }
})

describe('Security Hardening: Server Actions', () => {
  it('submitAnswer should reject if session belongs to another user (IDOR)', async () => {
    // Action will use HACKER-ID from mock for the resource ownership, but auth user is auth-user-123
    const result = await submitAnswer({
      sessionExerciseId: '123e4567-e89b-12d3-a456-426614174000',
      modality: 'TEXT',
      submittedAnswer: 'Test answer',
      wasEdited: false
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNAUTHORIZED');
      expect(result.error.message).toBe('Unauthorized resource access');
    }
  });

  it('nextExercise should validate UUID format of sessionId to prevent injection', async () => {
    const result = await nextExercise('not-a-uuid');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_INPUT');
      expect(result.error.message).toBe('Invalid session ID format');
    }
  });

  it('nextExercise should reject if session belongs to another user (IDOR)', async () => {
    // Action will use HACKER-ID from mock
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const result = await nextExercise(validUuid);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNAUTHORIZED');
      expect(result.error.message).toBe('Unauthorized resource access');
    }
  });
})
