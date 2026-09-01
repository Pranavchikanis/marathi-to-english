export interface MasteryProfile {
  readonly conceptId: string;
  readonly status: 'NOT_INTRODUCED' | 'INTRODUCED' | 'PRACTICING' | 'DEVELOPING' | 'PROFICIENT' | 'NEEDS_REVIEW';
  readonly correctAttempts: number;
  readonly incorrectAttempts: number;
}

export type AdaptiveDecisionType = 'CONTINUE' | 'REMEDIATE' | 'REVIEW' | 'ADVANCE';

export interface AdaptiveDecision {
  type: AdaptiveDecisionType;
  targetConceptId: string;
  targetDifficulty: number;
  reason: string;
}
