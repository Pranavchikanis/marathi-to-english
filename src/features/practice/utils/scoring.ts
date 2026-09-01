import { GRADES, GradeValue } from '@/config/constants';

/**
 * Calculates the XP awarded for a specific exercise based on the grade received.
 */
export function calculateExerciseXP(grade: GradeValue): number {
  if (!GRADES[grade].isPassing) return 0;
  
  let xp = 10; // BASE_EXERCISE
  if (grade === 'A') {
    xp += 5; // PERFECT_BONUS
  }
  
  return xp;
}

/**
 * Determines if a specific grade is considered passing.
 */
export function isPassingGrade(grade: GradeValue): boolean {
  return GRADES[grade].isPassing;
}
