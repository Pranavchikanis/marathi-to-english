export type EvaluationErrorCategory = 
  | 'GRAMMAR' | 'TENSE' | 'ARTICLE' | 'PREPOSITION' 
  | 'WORD_ORDER' | 'AGREEMENT' | 'VOCABULARY' 
  | 'SPELLING' | 'MISSING_WORD' | 'EXTRA_WORD' 
  | 'MEANING' | 'NATURALNESS'

export interface Evaluation {
  id: string
  attemptId: string
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  correctedText: string | null
  explanationMarathi: string | null
  alternativeValidTranslations: string[] | null
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  order_index: number
  status: 'PENDING' | 'SKIPPED' | 'COMPLETED'
  exercises?: {
    marathi_prompt: string
    reference_translations: string[]
    concepts?: {
      name: string
    }
  }
}

export type SessionSummary = {
  xp_earned: number
  total_exercises: number
  correct_exercises: number
  mastery_upgrades?: number
}

export type PracticeSessionState =
  | { status: 'NOT_STARTED' }
  | { status: 'LOADING' }
  | { 
      status: 'EXERCISE_READY'
      currentExercise: SessionExercise 
      draftText: string
      error?: string // Technical error message to display, e.g. "Network error, please try again"
    }
  | { 
      status: 'EVALUATING'
      currentExercise: SessionExercise
      attemptText: string 
      modality: 'TEXT' | 'VOICE'
    }
  | { 
      status: 'EVALUATION_SUCCESS'
      currentExercise: SessionExercise
      evaluation: Evaluation
      errors: EvaluationErrorCategory[]
      attemptText: string
    }
  | { 
      status: 'COMPLETED'
      summary: SessionSummary
    }
  | { 
      status: 'ERROR'
      error: string 
    }
