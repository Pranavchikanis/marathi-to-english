import { useReducer, useCallback, useEffect, useRef } from 'react'
import { PracticeSessionState, SessionExercise } from '../types/state.types'
import { startSession, resumeSession, submitAnswer, nextExercise, completeSession } from '../actions'

type Action =
  | { type: 'START_LOADING' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_EXERCISE_READY'; exercise: SessionExercise; draftText?: string }
  | { type: 'START_EVALUATING'; attemptText: string; modality: 'TEXT' | 'VOICE'; exerciseId: string }
  | { type: 'SET_EVALUATION_SUCCESS'; evaluation: any; errors: any[]; exerciseId: string; attemptText: string }
  | { type: 'SET_COMPLETED'; summary: any }
  | { type: 'UPDATE_DRAFT'; text: string }
  | { type: 'ROLLBACK_TO_READY'; exercise: SessionExercise; draftText: string; error?: string }

function sessionReducer(state: PracticeSessionState, action: Action): PracticeSessionState {
  switch (action.type) {
    case 'START_LOADING':
      if (state.status !== 'NOT_STARTED' && state.status !== 'EVALUATION_SUCCESS') {
        console.warn(`Invalid transition: ${state.status} -> LOADING`);
        return state;
      }
      return { status: 'LOADING' }
    
    case 'SET_ERROR':
      return { status: 'ERROR', error: action.error }
      
    case 'SET_EXERCISE_READY':
      return {
        status: 'EXERCISE_READY',
        currentExercise: action.exercise,
        draftText: action.draftText || ''
      }
      
    case 'START_EVALUATING':
      if (state.status !== 'EXERCISE_READY') {
        console.warn(`Invalid transition: ${state.status} -> EVALUATING`);
        return state;
      }
      return {
        status: 'EVALUATING',
        currentExercise: state.currentExercise,
        attemptText: action.attemptText,
        modality: action.modality
      }
      
    case 'SET_EVALUATION_SUCCESS':
      if (state.status !== 'EVALUATING') {
        console.warn(`Invalid transition: ${state.status} -> EVALUATION_SUCCESS`);
        return state;
      }
      if (state.currentExercise.id !== action.exerciseId) {
        console.warn(`Stale response discarded for exercise: ${action.exerciseId}`);
        return state;
      }
      return {
        status: 'EVALUATION_SUCCESS',
        currentExercise: state.currentExercise,
        evaluation: action.evaluation,
        errors: action.errors,
        attemptText: action.attemptText
      }

    case 'ROLLBACK_TO_READY':
      if (state.status !== 'EVALUATING' && state.status !== 'EVALUATION_SUCCESS') {
         return state;
      }
      return {
        status: 'EXERCISE_READY',
        currentExercise: action.exercise,
        draftText: action.draftText
      }
      
    case 'SET_COMPLETED':
      return {
        status: 'COMPLETED',
        summary: action.summary
      }
      
    case 'UPDATE_DRAFT':
      if (state.status !== 'EXERCISE_READY') return state
      return { ...state, draftText: action.text }
      
    default:
      return state
  }
}

export function usePracticeSession() {
  const [state, dispatch] = useReducer(sessionReducer, { status: 'NOT_STARTED' })
  const isSubmittingRef = useRef(false);
  const isTransitioningRef = useRef(false);

  // Recover from local storage
  useEffect(() => {
    if (state.status === 'EXERCISE_READY') {
      const currentExercise = (state as Extract<PracticeSessionState, { status: 'EXERCISE_READY' }>).currentExercise
      const savedDraft = localStorage.getItem(`draft_${currentExercise.id}`)
      if (savedDraft && savedDraft !== (state as any).draftText) {
        dispatch({ type: 'UPDATE_DRAFT', text: savedDraft })
      }
    }
  }, [state.status, (state as any).currentExercise?.id])

  // Save to local storage
  useEffect(() => {
    if (state.status === 'EXERCISE_READY') {
      const readyState = state as Extract<PracticeSessionState, { status: 'EXERCISE_READY' }>
      localStorage.setItem(`draft_${readyState.currentExercise.id}`, readyState.draftText)
    }
  }, [state])

  const handleStartSession = useCallback(async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    try {
      dispatch({ type: 'START_LOADING' })
      const result = await startSession()
      
      if (!result.success) {
        dispatch({ type: 'SET_ERROR', error: result.error?.message || 'Failed to start session' })
        return
      }

      if ((result.data as any)?.status === 'EXERCISE_READY') {
        const nextEx = (result.data as any).currentExercise as SessionExercise;
        if (nextEx) {
          dispatch({ type: 'SET_EXERCISE_READY', exercise: nextEx })
        } else {
          dispatch({ type: 'SET_ERROR', error: 'Could not generate an exercise. Please try again later.' })
        }
      }
    } finally {
      isTransitioningRef.current = false;
    }
  }, [])

  const handleResumeSession = useCallback(async () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    try {
      dispatch({ type: 'START_LOADING' })
      const result = await resumeSession()
      
      if (!result.success) {
        dispatch({ type: 'SET_ERROR', error: result.error?.message || 'Failed to resume session' })
        return
      }

      if ((result.data as any)?.status === 'EXERCISE_READY') {
        const nextEx = (result.data as any).currentExercise as SessionExercise;
        if (nextEx) {
          dispatch({ type: 'SET_EXERCISE_READY', exercise: nextEx })
        } else {
          dispatch({ type: 'SET_ERROR', error: 'Could not generate an exercise. Please try again later.' })
        }
      } else if ((result.data as any)?.status === 'NOT_FOUND') {
        // We bypass the reducer for setting NOT_STARTED since it's the initial state 
        // For testing we need a way, but since it's initial we just don't have a transition for it.
        // If needed, we can dispatch SET_ERROR or keep it LOADING in a real app, 
        // but for now let's just trigger SET_ERROR for Not Found if we want to be strict.
        dispatch({ type: 'SET_ERROR', error: 'No active session found' }) 
      }
    } finally {
      isTransitioningRef.current = false;
    }
  }, [])

  const handleSubmitAnswer = useCallback(async (text: string, modality: 'TEXT' | 'VOICE' = 'TEXT', rawTranscription?: string, wasEdited?: boolean) => {
    if (state.status !== 'EXERCISE_READY') return { success: false, error: 'Invalid state' }
    if (isSubmittingRef.current) return { success: false, error: 'Already submitting' }

    isSubmittingRef.current = true;
    const currentExercise = (state as Extract<PracticeSessionState, { status: 'EXERCISE_READY' }>).currentExercise

    try {
      dispatch({ type: 'START_EVALUATING', attemptText: text, modality, exerciseId: currentExercise.id })
      
      const result = await submitAnswer({
        sessionExerciseId: currentExercise.id,
        modality,
        submittedAnswer: text,
        rawTranscription,
        wasEdited: wasEdited ?? false
      })

      if (!result.success) {
        // Rollback to EXERCISE_READY
        dispatch({ 
          type: 'ROLLBACK_TO_READY', 
          exercise: currentExercise, 
          draftText: text,
          error: result.error as any 
        })
        return { success: false, error: result.error }
      }

      if (result.data && (result.data as any).evaluation) {
        localStorage.removeItem(`draft_${currentExercise.id}`)
        dispatch({ 
          type: 'SET_EVALUATION_SUCCESS', 
          evaluation: (result.data as any).evaluation, 
          errors: (result.data as any).errors,
          exerciseId: currentExercise.id,
          attemptText: text
        })
      }
      return { success: true }
    } finally {
      isSubmittingRef.current = false;
    }
  }, [state])

  const handleNextExercise = useCallback(async () => {
    if (state.status !== 'EVALUATION_SUCCESS') return
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const currentExercise = (state as Extract<PracticeSessionState, { status: 'EVALUATION_SUCCESS' }>).currentExercise

    try {
      dispatch({ type: 'START_LOADING' })
      const sessionId = currentExercise.session_id
      
      const result = await nextExercise(sessionId)
      
      if (!result.success) {
        dispatch({ type: 'SET_ERROR', error: result.error?.message || 'Failed to fetch next exercise' })
        return
      }

      if ((result.data as any)?.status === 'SESSION_COMPLETING') {
        const completeResult = await completeSession(sessionId)
        if (!completeResult.success) {
          dispatch({ type: 'SET_ERROR', error: completeResult.error?.message || 'Failed to complete session' })
        } else {
          dispatch({ type: 'SET_COMPLETED', summary: (completeResult.data as any)?.summary })
        }
      } else if ((result.data as any)?.status === 'EXERCISE_READY') {
        dispatch({ type: 'SET_EXERCISE_READY', exercise: (result.data as any).currentExercise as SessionExercise })
      }
    } finally {
      isTransitioningRef.current = false;
    }
  }, [state])

  const setDraftText = useCallback((text: string) => {
    dispatch({ type: 'UPDATE_DRAFT', text })
  }, [])

  const retryExercise = useCallback(() => {
    if (state.status !== 'EVALUATION_SUCCESS') return;
    dispatch({ 
      type: 'ROLLBACK_TO_READY', 
      exercise: state.currentExercise, 
      draftText: state.attemptText 
    });
  }, [state]);

  return {
    state,
    startSession: handleStartSession,
    resumeSession: handleResumeSession,
    submitAnswer: handleSubmitAnswer,
    nextExercise: handleNextExercise,
    retryExercise,
    setDraftText
  }
}
