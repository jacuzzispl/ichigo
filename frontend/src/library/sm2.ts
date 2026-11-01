/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm & Telemetry Utilities
 * Matches backend review_log schema:
 * quality (0-5), ease_factor_before/after, interval_before/after (in days), median response_ms
 */

export interface SM2Input {
  quality: number; // 0 to 5
  ease_factor_before: number; // typically >= 1.3, initial 2.5
  interval_before: number; // in days
  repetitions?: number; // count of previous successful repetitions
}

export interface SM2Output {
  quality: number;
  ease_factor_after: number;
  interval_after: number; // in days
  repetitions_after: number;
  next_review_at: string;
}

export interface QualityMetadata {
  grade: number;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  textColor: string;
  borderColor: string;
}

export const QUALITY_LEVELS: Record<number, QualityMetadata> = {
  5: {
    grade: 5,
    label: 'Perfect Recall',
    shortLabel: 'Perfect (5)',
    description: 'Instant, flawless recall with zero hesitation.',
    badgeClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
  },
  4: {
    grade: 4,
    label: 'Good Recall',
    shortLabel: 'Good (4)',
    description: 'Correct answer after brief hesitation.',
    badgeClass: 'bg-teal-950/40 text-teal-300 border-teal-500/40',
    textColor: 'text-teal-400',
    borderColor: 'border-teal-500/50',
  },
  3: {
    grade: 3,
    label: 'Pass with Effort',
    shortLabel: 'Pass (3)',
    description: 'Correct answer recalled with serious difficulty.',
    badgeClass: 'bg-blue-950/40 text-blue-300 border-blue-500/40',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/50',
  },
  2: {
    grade: 2,
    label: 'Hard / Almost',
    shortLabel: 'Hard (2)',
    description: 'Incorrect; correct answer was easily remembered upon reveal.',
    badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
  },
  1: {
    grade: 1,
    label: 'Wrong',
    shortLabel: 'Wrong (1)',
    description: 'Incorrect; correct answer was remembered with effort.',
    badgeClass: 'bg-orange-950/40 text-orange-300 border-orange-500/40',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/50',
  },
  0: {
    grade: 0,
    label: 'Blackout',
    shortLabel: 'Blackout (0)',
    description: 'Complete memory blackout; no recall of meaning or reading.',
    badgeClass: 'bg-rose-950/40 text-rose-300 border-rose-500/40',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/50',
  },
};

/**
 * Calculates median response time in milliseconds from an array of numbers.
 */
export function calculateMedian(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return Math.round(sorted[mid]);
  }
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Automatically derives the recommended SM-2 quality grade (0 to 5)
 * based on meaning & reading mistake counts and the median response time.
 */
export function deriveQualityGrade(
  meaningIncorrect: number,
  readingIncorrect: number,
  medianResponseMs: number
): number {
  const totalIncorrect = Math.max(0, meaningIncorrect) + Math.max(0, readingIncorrect);

  // If completely correct on first try for both prompts:
  if (totalIncorrect === 0) {
    if (medianResponseMs <= 2500) {
      return 5; // Flawless & fast
    }
    if (medianResponseMs <= 5500) {
      return 4; // Correct with normal hesitation
    }
    return 3; // Correct but prolonged recall time (> 5.5s)
  }

  // If only 1 mistake across meaning or reading:
  if (totalIncorrect === 1) {
    return 2;
  }

  // If 2 mistakes:
  if (totalIncorrect === 2) {
    return 1;
  }

  // 3 or more mistakes:
  return 0;
}

/**
 * Computes standard SM-2 ease factor & interval progression:
 * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * EF' >= 1.3
 * 
 * If q >= 3 (successful):
 *   interval' = 1 (rep 0), 6 (rep 1), or round(interval * EF')
 * If q < 3 (failure):
 *   interval' = 1, rep' = 0
 */
export function calculateSM2({
  quality,
  ease_factor_before,
  interval_before,
  repetitions = 0,
}: SM2Input): SM2Output {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  const efBefore = Math.max(1.3, ease_factor_before || 2.5);
  const intBefore = Math.max(0.1, interval_before || 1.0);

  // Calculate new Ease Factor
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const efAfter = Math.max(1.3, Math.round((efBefore + delta) * 100) / 100);

  let intervalAfter: number;
  let repetitionsAfter: number;

  if (q >= 3) {
    repetitionsAfter = repetitions + 1;
    if (repetitions === 0) {
      intervalAfter = 1.0;
    } else if (repetitions === 1) {
      intervalAfter = Math.max(3.0, Math.round(intBefore * 2.4 * 10) / 10);
    } else {
      intervalAfter = Math.round(intBefore * efAfter * 10) / 10;
    }
  } else {
    // Reset streak on failure
    repetitionsAfter = 0;
    // Set to 1.0 day (or keep minimum at 0.5 for immediate SRS re-check)
    intervalAfter = 1.0;
  }

  const nextReviewDate = new Date(Date.now() + intervalAfter * 24 * 60 * 60 * 1000);

  return {
    quality: q,
    ease_factor_after: efAfter,
    interval_after: intervalAfter,
    repetitions_after: repetitionsAfter,
    next_review_at: nextReviewDate.toISOString(),
  };
}

/**
 * Human-friendly formatter for intervals (e.g. 1.0d -> '1 day', 0.5d -> '12 hours', 14d -> '2 weeks')
 */
export function formatIntervalDays(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  if (days < 14) {
    return days === 1 ? '1 day' : `${days} days`;
  }
  const weeks = Math.round((days / 7) * 10) / 10;
  return `${weeks} weeks`;
}
