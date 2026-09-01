import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitAnswer } from '../../practice/actions';
import * as serverSupabase from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}));

describe('Authorization in Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated users', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
    vi.mocked(serverSupabase.createClient).mockReturnValue({
      auth: { getUser: mockGetUser },
    } as never);

    const result = await submitAnswer({
      sessionExerciseId: '123e4567-e89b-12d3-a456-426614174000',
      modality: 'TEXT',
      submittedAnswer: 'Test',
      wasEdited: false
    });

    expect(result).toEqual({
      success: false,
      error: expect.objectContaining({ code: 'UNAUTHORIZED', message: 'Unauthorized access' })
    });
  });

  it('rejects cross-student IDOR (horizontal privilege escalation)', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({ 
      data: { user: { id: 'user-1' } }, 
      error: null 
    });
    
    vi.mocked(serverSupabase.createClient).mockReturnValue({
      auth: { getUser: mockGetUser },
    } as never);

    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        session_id: 'session-1',
        sessions: {
          student_id: 'student-2',
          students: { auth_user_id: 'user-2' } // Belongs to user-2!
        }
      },
      error: null
    });

    vi.mocked(serverSupabase.createServiceClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle
          })
        })
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
      error: expect.objectContaining({ code: 'UNAUTHORIZED', message: 'Unauthorized resource access' })
    });
  });
});
