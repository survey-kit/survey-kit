import type {
  ParticipantBadgeDefinition,
  ParticipantBadgeState,
  ParticipantProfileSummary,
} from '../types/gamification'

/** Default badge tiers (keep in sync with backend participant service) */
export const DEFAULT_BADGE_DEFINITIONS: ParticipantBadgeDefinition[] = [
  {
    id: 'first_survey',
    label: 'First survey',
    description: 'Completed your first survey',
    min: 1,
  },
  {
    id: 'three_surveys',
    label: 'Triple contributor',
    description: 'Completed 3 surveys',
    min: 3,
  },
  {
    id: 'five_surveys',
    label: 'Five-star participant',
    description: 'Completed 5 surveys',
    min: 5,
  },
]

export function computeBadgeStates(
  completedCount: number,
  definitions: ParticipantBadgeDefinition[] = DEFAULT_BADGE_DEFINITIONS
): ParticipantBadgeState[] {
  return definitions.map((b) => ({
    id: b.id,
    label: b.label,
    description: b.description,
    unlocked: completedCount >= b.min,
  }))
}

export function utcTodayString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function addUtcDays(isoDay: string, delta: number): string {
  const [y, m, d] = isoDay.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + delta)
  return dt.toISOString().slice(0, 10)
}

/**
 * Next streak after one completion on `today` (UTC YYYY-MM-DD).
 * Mirrors backend streak rules for display-only previews.
 */
export function computeNextStreak(
  lastCompletionUtcDay: string | null,
  currentStreak: number,
  today: string
): { currentStreak: number; lastCompletionUtcDay: string } {
  if (!lastCompletionUtcDay) {
    return { currentStreak: 1, lastCompletionUtcDay: today }
  }
  if (lastCompletionUtcDay === today) {
    return { currentStreak, lastCompletionUtcDay: today }
  }
  const yesterday = addUtcDays(today, -1)
  if (lastCompletionUtcDay === yesterday) {
    return { currentStreak: currentStreak + 1, lastCompletionUtcDay: today }
  }
  return { currentStreak: 1, lastCompletionUtcDay: today }
}

/** Short accessible description of current streak for screen readers */
export function streakAriaLabel(
  currentStreak: number,
  lastCompletionUtcDay: string | null
): string {
  if (currentStreak <= 0) {
    return 'No streak yet. Complete a survey on a new day to start.'
  }
  const dayPart = lastCompletionUtcDay
    ? ` Last activity on ${lastCompletionUtcDay} UTC.`
    : ''
  return `Current streak: ${currentStreak} consecutive day${currentStreak === 1 ? '' : 's'} with a completed survey.${dayPart}`
}

export function toProfileSummary(
  completedCount: number,
  points: number,
  currentStreak: number,
  lastCompletionUtcDay: string | null,
  definitions: ParticipantBadgeDefinition[] = DEFAULT_BADGE_DEFINITIONS
): ParticipantProfileSummary {
  return {
    completedCount,
    points,
    currentStreak,
    lastCompletionUtcDay,
    badges: computeBadgeStates(completedCount, definitions),
  }
}
