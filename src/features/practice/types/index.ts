export interface Exercise {
  readonly id: string;
  readonly conceptId: string;
  readonly marathiPrompt: string;
  readonly difficultyLevel: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ValidTranslationSet {
  readonly referenceTranslations: string[];
  readonly alternativeValidTranslations: string[] | null;
}

export interface PracticeSession {
  readonly id: string;
  readonly studentId: string;
  readonly status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  readonly xpEarned: number;
  readonly startedAt: string;
}

export interface Attempt {
  readonly id: string;
  readonly sessionExerciseId: string;
  readonly modality: 'TEXT' | 'VOICE';
  readonly rawTranscription: string | null;
  readonly submittedAnswer: string;
  readonly wasEdited: boolean;
}

export type ErrorCategory = 
  | 'GRAMMAR' 
  | 'TENSE' 
  | 'ARTICLE' 
  | 'PREPOSITION' 
  | 'WORD_ORDER' 
  | 'AGREEMENT' 
  | 'VOCABULARY' 
  | 'SPELLING' 
  | 'MISSING_WORD' 
  | 'EXTRA_WORD' 
  | 'MEANING' 
  | 'NATURALNESS';

export interface Evaluation {
  readonly id: string;
  readonly attemptId: string;
  readonly grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  readonly correctedText: string | null;
  readonly explanationMarathi: string | null;
  // aiMetadata is JSONB in db, we omit it from the core domain model or type it explicitly
  readonly aiMetadata: { model: string; tokensUsed: number; latencyMs?: number };
}

export interface EvaluationError {
  readonly id: string;
  readonly evaluationId: string;
  readonly category: ErrorCategory;
}

export interface SessionSummaryData {
  readonly accuracyPercentage: number;
  readonly conceptsPracticed: string[];
  readonly majorErrors: ErrorCategory[];
}

// State Machine Types
export type PracticeSessionState =
  | { status: 'EXERCISE_READY'; exercise: Exercise }
  | { status: 'RECORDING'; exercise: Exercise }
  | { status: 'EVALUATING'; exercise: Exercise; attempt: Attempt }
  | { status: 'FEEDBACK_READY'; exercise: Exercise; evaluation: Evaluation; errors: EvaluationError[] };
