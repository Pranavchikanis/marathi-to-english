export const GRADES = {
  A: { value: 'A', score: 100, isPassing: true },
  B: { value: 'B', score: 85, isPassing: true },
  C: { value: 'C', score: 70, isPassing: true },
  D: { value: 'D', score: 55, isPassing: false },
  E: { value: 'E', score: 40, isPassing: false },
  F: { value: 'F', score: 0, isPassing: false },
} as const;

export type GradeValue = keyof typeof GRADES;

export const XP_REWARDS = {
  BASE_EXERCISE: 10,
  PERFECT_BONUS: 5,
  SESSION_COMPLETION: 50,
} as const;

export const SESSION_CONFIG = {
  EXERCISES_PER_SESSION: 10,
  PASSING_SCORE_THRESHOLD: 70, // C or higher
} as const;
