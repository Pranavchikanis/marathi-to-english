import { MasteryService } from './mastery.service';
import { MasteryProfile } from '../types';

export class ProgressService {
  /**
   * Calculates the XP awarded for a specific AI evaluation grade.
   */
  static calculateAttemptXp(grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'): number {
    switch (grade) {
      case 'A':
      case 'B': return 10;
      case 'C':
      case 'D': return 5;
      case 'E':
      case 'F': return 1;
      default: return 0;
    }
  }

  /**
   * Calculates the new streak given the last session date and the current date.
   * Assumes dates are provided in ISO format. Uses Indian Standard Time (IST).
   */
  static calculateStreak(lastSessionDateIso: string | null, currentStreak: number, currentDateIso: string = new Date().toISOString()): number {
    if (!lastSessionDateIso) return 1;

    // Convert both to IST for boundary comparisons
    const dateOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const lastSessionDate = new Date(lastSessionDateIso);
    const currentDate = new Date(currentDateIso);

    // Get strictly the Date portion in IST to calculate differences
    const lastIST = new Intl.DateTimeFormat('en-CA', dateOptions).format(lastSessionDate); // YYYY-MM-DD
    const currentIST = new Intl.DateTimeFormat('en-CA', dateOptions).format(currentDate);

    if (lastIST === currentIST) {
      return currentStreak; // Already practiced today in IST
    }

    const last = new Date(lastIST);
    const curr = new Date(currentIST);
    
    // Difference in calendar days
    const diffTime = curr.getTime() - last.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      return currentStreak + 1;
    } else if (diffDays > 1) {
      return 1; // Streak reset
    }

    // Fallback (e.g. if somehow diffDays < 0, maybe clock skewed, don't break streak)
    return currentStreak;
  }
}
