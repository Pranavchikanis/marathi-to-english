import { MasteryProfile } from '../types';

export class MasteryService {
  // Pure logic for state transitions based on 14_ADAPTIVE_LEARNING.md
  static evaluateStateTransitions(
    profile: MasteryProfile, 
    recentConsecutiveCorrect: number,
    recentConsecutiveErrors: number,
    daysSinceLastPracticed: number
  ): MasteryProfile['status'] {
    
    // Safety check: 3 consecutive errors always force review/remediation
    if (recentConsecutiveErrors >= 3) {
      return 'NEEDS_REVIEW';
    }

    switch (profile.status) {
      case 'NOT_INTRODUCED':
        if (profile.correctAttempts + profile.incorrectAttempts > 0) {
          return 'INTRODUCED';
        }
        return 'NOT_INTRODUCED';
        
      case 'INTRODUCED':
        if (recentConsecutiveCorrect >= 3) {
          return 'DEVELOPING';
        }
        return 'INTRODUCED';
        
      case 'DEVELOPING':
        if (recentConsecutiveCorrect >= 3 && profile.correctAttempts >= 6) {
          return 'PROFICIENT';
        }
        return 'DEVELOPING';
        
      case 'PROFICIENT':
        if (daysSinceLastPracticed > 7) {
          return 'NEEDS_REVIEW';
        }
        return 'PROFICIENT';
        
      case 'NEEDS_REVIEW':
        // Must demonstrate stability again
        if (recentConsecutiveCorrect >= 3 && (profile.correctAttempts - profile.incorrectAttempts) >= 6) {
           return 'PROFICIENT';
        }
        return 'NEEDS_REVIEW';
        
      default:
        return profile.status;
    }
  }

  static processAttemptEvidence(
    grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
    currentProfile: MasteryProfile
  ): MasteryProfile {
    // F is neutral, no effect on mastery
    if (grade === 'F') {
      return { ...currentProfile };
    }

    const isCorrect = grade === 'A' || grade === 'B';
    
    return {
      ...currentProfile,
      correctAttempts: currentProfile.correctAttempts + (isCorrect ? 1 : 0),
      incorrectAttempts: currentProfile.incorrectAttempts + (!isCorrect ? 1 : 0),
    };
  }
}
