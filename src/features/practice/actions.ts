/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { submitAnswerSchema, SubmitAnswerRequest } from './schemas/api.schema'
import { ActionResult } from '@/types/api.types'
import { revalidatePath } from 'next/cache'
import { withErrorHandling, ValidationError, AuthError, DuplicateSubmissionError, NotFoundError, ProviderError, AppError } from '@/lib/error'
import { z } from 'zod'

const sessionIdSchema = z.string().uuid()

async function verifySessionOwnership(sessionId: string, userId: string, serviceClient: any) {
  if (!sessionIdSchema.safeParse(sessionId).success) {
    throw new ValidationError('Invalid session ID format')
  }

  const { data, error } = await serviceClient
    .from('sessions')
    .select('student_id, students(auth_user_id)')
    .eq('id', sessionId)
    .single();

  if (error || !data) {
    throw new NotFoundError('Session not found')
  }

  const student = data.students as unknown as { auth_user_id: string } | null;
  if (student?.auth_user_id !== userId) {
    throw new AuthError('Unauthorized resource access')
  }
}

export const submitAnswer = withErrorHandling(async (input: SubmitAnswerRequest): Promise<ActionResult<unknown>> => {
  const parsed = submitAnswerSchema.safeParse(input)
  
  if (!parsed.success) {
    throw new ValidationError('Invalid payload')
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new AuthError('Unauthorized access')
  }

  const serviceClient = createServiceClient()

  // Verify ownership and get necessary data for evaluation
  const { data: sessionExercise, error: seError } = await serviceClient
    .from('session_exercises')
    .select(`
      session_id, 
      sessions(student_id, students(auth_user_id)),
      exercises(marathi_prompt, reference_translations, concepts(name))
    `)
    .eq('id', parsed.data.sessionExerciseId)
    .single()

  const sessionData = (sessionExercise as unknown as Record<string, unknown>)?.sessions as unknown as { students?: { auth_user_id: string } } | null;

  if (seError || !sessionExercise || sessionData?.students?.auth_user_id !== user.id) {
    throw new AuthError('Unauthorized resource access')
  }

  // Removed idempotency check to allow users to retry the same exercise

  const exerciseData = (sessionExercise as unknown as Record<string, unknown>)?.exercises as unknown as { marathi_prompt: string, reference_translations: string[], concepts: { name: string } };

  // Generate AI Evaluation
  const { EvaluationService } = await import('@/lib/ai/evaluation.service')
  const evalService = new EvaluationService();
  
  let evaluationResult;
  try {
    evaluationResult = await evalService.evaluateAttempt({
      marathiPrompt: exerciseData.marathi_prompt,
      targetConceptName: exerciseData.concepts.name,
      studentAnswer: parsed.data.submittedAnswer,
      referenceTranslations: exerciseData.reference_translations,
    });
  } catch (e) {
    console.error('AI Evaluation Failed:', e);
    if (e instanceof ProviderError) {
      throw e;
    }
    throw new ProviderError('Failed to evaluate answer. Please try again.')
  }

  // 1. Save Attempt
  const { data: attempt, error: attemptError } = await (serviceClient.from('attempts') as any)
    .insert({
      session_exercise_id: parsed.data.sessionExerciseId,
      modality: parsed.data.modality,
      raw_transcription: parsed.data.rawTranscription || null,
      submitted_answer: parsed.data.submittedAnswer,
      was_edited: parsed.data.wasEdited ?? false,
    })
    .select()
    .single()

  if (attemptError) {
    throw new AppError('Failed to save attempt', 'INTERNAL_SERVER_ERROR')
  }

  // 2. Save Evaluation
  const { data: evaluation, error: evaluationError } = await (serviceClient.from('evaluations') as any)
    .insert({
      attempt_id: attempt.id,
      grade: evaluationResult.data.grade,
      corrected_text: evaluationResult.data.corrected_text || null,
      explanation_marathi: evaluationResult.data.explanation_marathi || null,
      alternative_valid_translations: evaluationResult.data.alternative_valid_translations || null,
      ai_metadata: evaluationResult.metadata,
    })
    .select()
    .single()

  if (evaluationError) {
    throw new AppError('Failed to save evaluation', 'INTERNAL_SERVER_ERROR')
  }

  // 3. Save Evaluation Errors (if any)
  if (evaluationResult.data.errors && evaluationResult.data.errors.length > 0) {
    const errorsToInsert = evaluationResult.data.errors.map((err) => ({
      evaluation_id: evaluation.id,
      category: err,
    }));
    
    await (serviceClient.from('evaluation_errors') as any).insert(errorsToInsert);
  }

  // 4. Check for Adaptive Mid-Session Triggers
  const { AdaptiveEngineService } = await import('@/features/progress/services/adaptive-engine.service');
  const sessionId = (sessionExercise as any).session_id;
  const adaptiveDecision = await AdaptiveEngineService.evaluateMidSessionAdaptation(sessionId, serviceClient);

  if (adaptiveDecision?.type === 'REMEDIATE') {
    // Inject a Remediation Exercise
    const targetDifficulty = adaptiveDecision.targetDifficulty; // usually 1
    
    // Fetch a remediation exercise for this concept
    const { data: exercises } = await serviceClient
      .from('exercises')
      .select('id, difficulty_level')
      .eq('concept_id', adaptiveDecision.targetConceptId)
      .limit(10);
      
    if (exercises && exercises.length > 0) {
      // Find closest to target difficulty
      const sorted = (exercises as any[]).sort((a: any, b: any) => 
          Math.abs((a.difficulty_level || 1) - targetDifficulty) - Math.abs((b.difficulty_level || 1) - targetDifficulty)
      );
      
      const remediationExerciseId = sorted[0].id;
      const currentOrderIndex = (sessionExercise as any).order_index || 0;
      
      // Shift future exercises
      const { data: futureExercises } = await serviceClient
        .from('session_exercises')
        .select('id, order_index')
        .eq('session_id', sessionId)
        .gt('order_index', currentOrderIndex);
        
      if (futureExercises) {
        for (const fe of (futureExercises as any[])) {
           await (serviceClient.from('session_exercises') as any)
             .update({ order_index: fe.order_index + 1 })
             .eq('id', fe.id);
        }
      }
      
      // Insert new remediation exercise
      await (serviceClient.from('session_exercises') as any).insert({
        session_id: sessionId,
        exercise_id: remediationExerciseId,
        order_index: currentOrderIndex + 1,
        status: 'PENDING'
      });
    }
  }

  revalidatePath('/practice')
  return { 
    success: true, 
    data: {
      evaluation: {
        id: evaluation.id,
        attemptId: attempt.id,
        grade: evaluation.grade,
        correctedText: evaluation.corrected_text,
        explanationMarathi: evaluation.explanation_marathi,
        alternativeValidTranslations: evaluation.alternative_valid_translations
      },
      errors: evaluationResult.data.errors || []
    } 
  }
})

export const startSession = withErrorHandling(async (): Promise<ActionResult<unknown>> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError()
  
  const serviceClient = createServiceClient()
  
  const { ensureStudentProfile } = await import('@/lib/auth/student');
  const student = await ensureStudentProfile(user.id);
    
  if (!student) {
    throw new AppError('Student profile not found', 'INTERNAL_SERVER_ERROR');
  }

  const { SessionService } = await import('./services/session.service');
  const sessionService = new SessionService(serviceClient);

  // Check for an existing active session
  const { data: existingSession } = await serviceClient
    .from('sessions')
    .select('id')
    .eq('student_id', (student as any).id)
    .eq('status', 'IN_PROGRESS')
    .maybeSingle();

  if (existingSession) {
    const nextExercise = await sessionService.getNextExercise((existingSession as any).id);
    if (nextExercise) {
      return { success: true, data: { status: 'EXERCISE_READY', currentExercise: nextExercise } }
    }
    // If no next exercise, the session might be stuck or complete. Fallback to initialize.
  }
  
  // Initialize new session if none exists or it was empty
  const session = await sessionService.initializeSession((student as any).id);
  const nextExercise = await sessionService.getNextExercise((session as any).id);
  return { success: true, data: { status: 'EXERCISE_READY', currentExercise: nextExercise } }
})

export const resumeSession = withErrorHandling(async (): Promise<ActionResult<unknown>> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError()

  const serviceClient = createServiceClient()
  
  const { ensureStudentProfile } = await import('@/lib/auth/student');
  const student = await ensureStudentProfile(user.id);
    
  if (!student) {
    throw new AppError('Student profile not found', 'INTERNAL_SERVER_ERROR');
  }

  const { SessionService } = await import('./services/session.service');
  const sessionService = new SessionService(serviceClient);

  // Still use client to leverage RLS naturally for selecting active session
  const { data } = await (supabase.from('sessions') as any)
    .select('id')
    .eq('student_id', (student as any).id)
    .eq('status', 'IN_PROGRESS')
    .single();
    
  const session = data as { id: string } | null;

  if (!session) {
    throw new NotFoundError('No active session found')
  }

  const nextExercise = await sessionService.getNextExercise(session.id);
  return { success: true, data: { status: 'EXERCISE_READY', currentExercise: nextExercise } }
})

export const retryExercise = withErrorHandling(async (sessionId: string): Promise<ActionResult<unknown>> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError()

  const serviceClient = createServiceClient()
  await verifySessionOwnership(sessionId, user.id, serviceClient)

  const { SessionService } = await import('./services/session.service');
  const sessionService = new SessionService(serviceClient);
  
  const nextExercise = await sessionService.getNextExercise(sessionId);
  return { success: true, data: { status: 'EXERCISE_READY', currentExercise: nextExercise } }
})

export const nextExercise = withErrorHandling(async (sessionId: string): Promise<ActionResult<unknown>> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError()

  const serviceClient = createServiceClient();
  await verifySessionOwnership(sessionId, user.id, serviceClient)
  
  // Mark current pending as completed
  const { data: currentPending } = await (serviceClient.from('session_exercises') as any)
    .select('id, order_index')
    .eq('session_id', sessionId)
    .eq('status', 'PENDING')
    .order('order_index', { ascending: true })
    .limit(1)
    .single();

  if (currentPending) {
    await (serviceClient.from('session_exercises') as any)
      .update({ status: 'COMPLETED' })
      .eq('id', currentPending.id);
  }

  const { SessionService } = await import('./services/session.service');
  const sessionService = new SessionService(serviceClient);

  const nxtExercise = await sessionService.getNextExercise(sessionId);
  if (!nxtExercise) {
      return { success: true, data: { status: 'SESSION_COMPLETING', currentExercise: null } }
  }
  return { success: true, data: { status: 'EXERCISE_READY', currentExercise: nxtExercise } }
})

export const completeSession = withErrorHandling(async (sessionId: string): Promise<ActionResult<unknown>> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError()

  const serviceClient = createServiceClient();
  await verifySessionOwnership(sessionId, user.id, serviceClient)

  const { SessionService } = await import('./services/session.service');
  const sessionService = new SessionService(serviceClient);
  
  const summary = await sessionService.completeSession(sessionId);
  return { success: true, data: { status: 'COMPLETED', summary } }
})

export const getRecentMistakes = withErrorHandling(async (): Promise<ActionResult<unknown>> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError()

  const serviceClient = createServiceClient()
  const { data: student } = await serviceClient
    .from('students')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!student) return { success: true, data: { mistakes: [] } };

  // Safe to use standard client (RLS enforced)
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id, submitted_answer, evaluations(grade, explanation_marathi), session_exercises!inner(sessions!inner(student_id))')
    .eq('session_exercises.sessions.student_id', (student as any).id)
    .limit(20);

  return { success: true, data: { mistakes: attempts || [] } }
})
