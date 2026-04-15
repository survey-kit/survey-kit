/**
 * Participant gamification (DynamoDB + API)
 */

export interface ParticipantProfileItem {
  pk: string
  sk: 'PROFILE'
  completedCount: number
  points: number
  currentStreak: number
  lastCompletionUtcDay: string | null
  badgeIds: string[]
  updatedAt: string
}

export interface ParticipantBadgeDto {
  id: string
  label: string
  description: string
  unlocked: boolean
}

export interface ParticipantProfileDto {
  completedCount: number
  points: number
  currentStreak: number
  lastCompletionUtcDay: string | null
  badges: ParticipantBadgeDto[]
}
