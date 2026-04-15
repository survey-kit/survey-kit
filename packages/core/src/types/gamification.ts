export interface ParticipantBadgeDefinition {
  id: string
  label: string
  description: string
  min: number
}

export interface ParticipantBadgeState {
  id: string
  label: string
  description: string
  unlocked: boolean
}

export interface ParticipantProfileSummary {
  completedCount: number
  points: number
  currentStreak: number
  lastCompletionUtcDay: string | null
  badges: ParticipantBadgeState[]
}
