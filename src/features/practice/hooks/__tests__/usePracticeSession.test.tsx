/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePracticeSession } from '../usePracticeSession';
import * as actions from '../../actions';
import { SessionExercise } from '../../types/state.types';

vi.mock('../../actions', () => ({
  startSession: vi.fn(),
  resumeSession: vi.fn(),
  submitAnswer: vi.fn(),
  nextExercise: vi.fn(),
  completeSession: vi.fn(),
}));

const mockExercise: SessionExercise = {
  id: 'exercise-1',
  session_id: 'session-1',
  exercise_id: 'ex-def-1',
  order_index: 1,
  status: 'PENDING',
  exercises: {
    marathi_prompt: 'Test Prompt',
    reference_translations: ['Test Translation'],
    concepts: { name: 'Test Concept' }
  }
};

describe('usePracticeSession (State Management)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('Normal Transitions: START -> READY -> EVALUATING -> SUCCESS -> COMPLETED', async () => {
    vi.mocked(actions.startSession).mockResolvedValueOnce({
      success: true,
      data: { status: 'EXERCISE_READY', currentExercise: mockExercise }
    });

    const { result } = renderHook(() => usePracticeSession());
    
    expect(result.current.state.status).toBe('NOT_STARTED');

    // Start Session
    await act(async () => {
      await result.current.startSession();
    });

    expect(result.current.state.status).toBe('EXERCISE_READY');
    expect((result.current.state as any).currentExercise).toEqual(mockExercise);

    // Submit Answer
    vi.mocked(actions.submitAnswer).mockResolvedValueOnce({
      success: true,
      data: { evaluation: { grade: 'A' }, errors: [] }
    });

    await act(async () => {
      await result.current.submitAnswer('Test Answer');
    });

    expect(result.current.state.status).toBe('EVALUATION_SUCCESS');

    // Next Exercise (Completing)
    vi.mocked(actions.nextExercise).mockResolvedValueOnce({
      success: true,
      data: { status: 'SESSION_COMPLETING' }
    });
    vi.mocked(actions.completeSession).mockResolvedValueOnce({
      success: true,
      data: { status: 'COMPLETED', summary: { score: 100 } }
    });

    await act(async () => {
      await result.current.nextExercise();
    });

    expect(result.current.state.status).toBe('COMPLETED');
    expect((result.current.state as any).summary.score).toBe(100);
  });

  it('Invalid Transitions: Should warn and ignore if submitting while not ready', async () => {
    const { result } = renderHook(() => usePracticeSession());
    expect(result.current.state.status).toBe('NOT_STARTED');

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await act(async () => {
      const res = await result.current.submitAnswer('Test');
      expect(res?.success).toBe(false);
      expect(res?.error).toBe('Invalid state');
    });

    expect(result.current.state.status).toBe('NOT_STARTED');
    expect(actions.submitAnswer).not.toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });

  it('Duplicate Submission Protection: Should only allow one submission at a time', async () => {
    vi.mocked(actions.startSession).mockResolvedValueOnce({
      success: true,
      data: { status: 'EXERCISE_READY', currentExercise: mockExercise }
    });

    const { result } = renderHook(() => usePracticeSession());

    await act(async () => {
      await result.current.startSession();
    });

    let resolveApi: any;
    vi.mocked(actions.submitAnswer).mockImplementationOnce(() => new Promise((resolve) => {
      resolveApi = resolve;
    }));

    await act(async () => {
      // Trigger first submission
      const promise1 = result.current.submitAnswer('Test 1');
      // Trigger second submission immediately
      const promise2 = result.current.submitAnswer('Test 2');
      
      const res2 = await promise2;
      expect(res2?.success).toBe(false);
      expect(res2?.error).toBe('Already submitting');
      
      resolveApi({ success: true, data: { evaluation: { grade: 'B' }, errors: [] } });
      await promise1;
    });

    expect(actions.submitAnswer).toHaveBeenCalledTimes(1);
    expect(result.current.state.status).toBe('EVALUATION_SUCCESS');
  });

  it('Stale Response Protection: Discard evaluation if exercise ID changed', async () => {
    vi.mocked(actions.startSession).mockResolvedValueOnce({
      success: true,
      data: { status: 'EXERCISE_READY', currentExercise: mockExercise }
    });

    const { result } = renderHook(() => usePracticeSession());
    await act(async () => {
      await result.current.startSession();
    });

    let resolveApi: any;
    vi.mocked(actions.submitAnswer).mockImplementationOnce(() => new Promise((resolve) => {
      resolveApi = resolve;
    }));

    // Start submitting
    let promise: any;
    act(() => {
      promise = result.current.submitAnswer('Test');
    });

    // Manually force state out of sync by resolving with a different ID internally, 
    // Wait, the hook binds the exerciseId at call time. 
    // To simulate stale response in the reducer, we can dispatch the success action directly,
    // or simulate that the state has moved to a DIFFERENT exercise before the resolve finishes.
    // In our rigorous design, we check `state.currentExercise.id !== action.exerciseId` in the reducer.

    // Let's force the state's current exercise to something else while EVALUATING
    act(() => {
      // This is a hack just to change the state id for testing the stale response guard
      // Typically this happens if a user navigates away or starts a new session concurrently
      const mockExercise2 = { ...mockExercise, id: 'stale-123' };
      // we bypass the hook to simulate this
      // But actually, we can test it by manually starting a new session while evaluating!
    });
    
    // We'll simulate by starting a new session while evaluating
    vi.mocked(actions.startSession).mockResolvedValueOnce({
      success: true,
      data: { status: 'EXERCISE_READY', currentExercise: { ...mockExercise, id: 'new-exercise' } }
    });

    await act(async () => {
      await result.current.startSession(); // Replaces state
    });
    
    expect(result.current.state.status).toBe('EXERCISE_READY');
    expect((result.current.state as any).currentExercise.id).toBe('new-exercise');

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Now resolve the old submission
    await act(async () => {
      resolveApi({ success: true, data: { evaluation: { grade: 'B' }, errors: [] } });
      await promise;
    });

    // State should still be EXERCISE_READY of the new exercise, NOT EVALUATION_SUCCESS!
    expect(result.current.state.status).toBe('EXERCISE_READY');
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid transition: EXERCISE_READY -> EVALUATION_SUCCESS'));

    consoleWarnSpy.mockRestore();
  });

  it('Network Recovery: Rollback to EXERCISE_READY on submit error', async () => {
    vi.mocked(actions.startSession).mockResolvedValueOnce({
      success: true,
      data: { status: 'EXERCISE_READY', currentExercise: mockExercise }
    });

    const { result } = renderHook(() => usePracticeSession());
    await act(async () => {
      await result.current.startSession();
    });

    // Simulate typed text
    act(() => {
      result.current.setDraftText('Draft answer');
    });
    
    expect((result.current.state as any).draftText).toBe('Draft answer');

    vi.mocked(actions.submitAnswer).mockResolvedValueOnce({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed' }
    });

    await act(async () => {
      await result.current.submitAnswer('Draft answer');
    });

    // Should be rolled back
    expect(result.current.state.status).toBe('EXERCISE_READY');
    expect((result.current.state as any).draftText).toBe('Draft answer'); // Preserved!
  });

  it('Refresh Recovery: Loads draft text from local storage', async () => {
    localStorage.setItem(`draft_${mockExercise.id}`, 'Recovered text');

    vi.mocked(actions.resumeSession).mockResolvedValueOnce({
      success: true,
      data: { status: 'EXERCISE_READY', currentExercise: mockExercise }
    });

    const { result } = renderHook(() => usePracticeSession());
    
    await act(async () => {
      await result.current.resumeSession();
    });

    expect(result.current.state.status).toBe('EXERCISE_READY');
    expect((result.current.state as any).draftText).toBe('Recovered text');
  });
});
