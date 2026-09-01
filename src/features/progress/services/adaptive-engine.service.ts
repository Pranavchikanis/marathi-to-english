import { MasteryProfile } from '../types';

export class AdaptiveEngineService {
  /**
   * Unlocks the next Curriculum Stage only if 80% of concepts in the current stage are PROFICIENT.
   * Returns true if progression is allowed.
   */
  static checkProgression(stageProfiles: MasteryProfile[]): boolean {
    if (stageProfiles.length === 0) return false;
    
    const proficientCount = stageProfiles.filter(p => p.status === 'PROFICIENT').length;
    const proficiencyRate = proficientCount / stageProfiles.length;
    
    return proficiencyRate >= 0.8;
  }

  /**
   * Filters the concept profiles to find ones suitable for core practice.
   * Prioritizes 'INTRODUCED' and 'DEVELOPING' concepts.
   */
  static selectCoreConcepts(profiles: MasteryProfile[]): MasteryProfile[] {
    return profiles.filter(p => p.status === 'INTRODUCED' || p.status === 'DEVELOPING');
  }

  /**
   * Filters the concept profiles to find ones suitable for review.
   * Prioritizes 'NEEDS_REVIEW' concepts, followed by older 'PROFICIENT' ones.
   */
  static selectReviewConcepts(profiles: MasteryProfile[]): MasteryProfile[] {
    return profiles.filter(p => p.status === 'NEEDS_REVIEW');
  }

  /**
   * Evaluates the current session's attempts to see if a REMEDIATE action should be triggered.
   * Trigger condition: 3 consecutive errors (Grades C, D, or E) on the same concept.
   */
  static async evaluateMidSessionAdaptation(
    sessionId: string, 
    supabase: any
  ): Promise<import('../types').AdaptiveDecision | null> {
    
    // Fetch recent completed exercises in the session, sorted by order_index descending (most recent first)
    const { data: exercises, error } = await supabase
      .from('session_exercises')
      .select(`
        id,
        exercises ( concept_id ),
        attempts (
          evaluations ( grade )
        )
      `)
      .eq('session_id', sessionId)
      .eq('status', 'COMPLETED')
      .order('order_index', { ascending: false })
      .limit(10); // Look at last 10 attempts to find patterns

    if (error || !exercises) return null;

    // Group grades by concept_id (keeping chronological order from most recent to oldest)
    const gradesByConcept: Record<string, string[]> = {};

    for (const se of exercises) {
      const conceptId = se.exercises?.concept_id;
      const attempt = se.attempts?.[0]; // Usually one attempt per session_exercise
      const grade = attempt?.evaluations?.[0]?.grade;

      if (conceptId && grade) {
        if (!gradesByConcept[conceptId]) {
          gradesByConcept[conceptId] = [];
        }
        gradesByConcept[conceptId].push(grade);
      }
    }

    // Evaluate for remediation triggers
    for (const [conceptId, grades] of Object.entries(gradesByConcept)) {
      if (grades.length >= 3) {
        // Take the 3 most recent grades for this concept
        const recent3 = grades.slice(0, 3);
        const allErrors = recent3.every(g => ['C', 'D', 'E'].includes(g));
        
        if (allErrors) {
          return {
            type: 'REMEDIATE',
            targetConceptId: conceptId,
            targetDifficulty: 1, // Remediation drops difficulty to 1
            reason: '3 consecutive errors detected in current session.'
          };
        }
      }
    }

    return null;
  }

  /**
   * Calculates the target difficulty for a given concept based on historical performance.
   * Increase: 3 consecutive Grade A/B answers at current difficulty.
   * Decrease: 2 consecutive Grade D/E answers at current difficulty.
   * Baseline: Difficulty 1 (default starting). Max: 6.
   * Note: This simplistic query assumes exercises have a difficulty_level column. 
   * For MVP without a difficulty column explicitly tracked in evaluations, we'll estimate 
   * or rely on a baseline if not fully implemented in schema.
   */
  static async calculateConceptDifficulty(
    studentId: string,
    conceptId: string,
    supabase: any
  ): Promise<number> {
    // 1. Fetch recent attempts for this concept by this student across all sessions
    const { data: recentAttempts } = await supabase
      .from('attempts')
      .select(`
        evaluations ( grade ),
        session_exercises!inner (
          exercises!inner ( concept_id, difficulty_level ),
          sessions!inner ( student_id )
        )
      `)
      .eq('session_exercises.sessions.student_id', studentId)
      .eq('session_exercises.exercises.concept_id', conceptId)
      .order('created_at', { ascending: false })
      .limit(5);

    let currentDifficulty = 1; // Default to 1

    if (recentAttempts && recentAttempts.length > 0) {
      const latestExercise = recentAttempts[0]?.session_exercises?.exercises;
      if (latestExercise?.difficulty_level) {
        currentDifficulty = latestExercise.difficulty_level;
      }

      const grades = recentAttempts
        .map((a: any) => a.evaluations?.[0]?.grade)
        .filter(Boolean);

      // 3 consecutive A/B -> increase
      if (grades.length >= 3) {
        const recent3 = grades.slice(0, 3);
        if (recent3.every((g: string) => g === 'A' || g === 'B')) {
          return Math.min(6, currentDifficulty + 1);
        }
      }

      // 2 consecutive D/E -> decrease
      if (grades.length >= 2) {
        const recent2 = grades.slice(0, 2);
        if (recent2.every((g: string) => g === 'D' || g === 'E')) {
          return Math.max(1, currentDifficulty - 1);
        }
      }
    }

    return currentDifficulty;
  }
}
