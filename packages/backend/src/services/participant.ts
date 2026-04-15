import {
  GetCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import type { SurveyResponse } from '../types/survey.js'
import type {
  ParticipantProfileDto,
  ParticipantProfileItem,
} from '../types/participant.js'
import { docClient, TABLE_NAME } from './dynamodb.js'

export const POINTS_PER_COMPLETION = 10

const BADGE_DEFINITIONS = [
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
] as const

export function utcTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function addUtcDays(isoDay: string, delta: number): string {
  const [y, m, d] = isoDay.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + delta)
  return dt.toISOString().slice(0, 10)
}

function computeBadgeIds(completedCount: number): string[] {
  return BADGE_DEFINITIONS.filter((b) => completedCount >= b.min).map(
    (b) => b.id
  )
}

function nextStreak(
  lastDay: string | null,
  currentStreak: number,
  today: string
): { currentStreak: number; lastCompletionUtcDay: string } {
  if (!lastDay) {
    return { currentStreak: 1, lastCompletionUtcDay: today }
  }
  if (lastDay === today) {
    return { currentStreak, lastCompletionUtcDay: today }
  }
  const yesterday = addUtcDays(today, -1)
  if (lastDay === yesterday) {
    return { currentStreak: currentStreak + 1, lastCompletionUtcDay: today }
  }
  return { currentStreak: 1, lastCompletionUtcDay: today }
}

export function getEmptyParticipantProfileDto(): ParticipantProfileDto {
  return {
    completedCount: 0,
    points: 0,
    currentStreak: 0,
    lastCompletionUtcDay: null,
    badges: BADGE_DEFINITIONS.map((b) => ({
      id: b.id,
      label: b.label,
      description: b.description,
      unlocked: false,
    })),
  }
}

export function toParticipantProfileDto(
  item: ParticipantProfileItem
): ParticipantProfileDto {
  const count = item.completedCount
  return {
    completedCount: count,
    points: item.points,
    currentStreak: item.currentStreak,
    lastCompletionUtcDay: item.lastCompletionUtcDay,
    badges: BADGE_DEFINITIONS.map((b) => ({
      id: b.id,
      label: b.label,
      description: b.description,
      unlocked: count >= b.min,
    })),
  }
}

export async function getParticipantProfileItem(
  sub: string
): Promise<ParticipantProfileItem | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `PARTICIPANT#${sub}`,
        sk: 'PROFILE',
      },
    })
  )
  const item = result.Item as ParticipantProfileItem | undefined
  if (!item) return null
  return item
}

function emptyProfile(sub: string, now: string): ParticipantProfileItem {
  return {
    pk: `PARTICIPANT#${sub}`,
    sk: 'PROFILE',
    completedCount: 0,
    points: 0,
    currentStreak: 0,
    lastCompletionUtcDay: null,
    badgeIds: [],
    updatedAt: now,
  }
}

export function buildUpdatedProfile(
  sub: string,
  previous: ParticipantProfileItem | null,
  nowIso: string
): ParticipantProfileItem {
  const today = utcTodayString()
  const base = previous ?? emptyProfile(sub, nowIso)
  const { currentStreak, lastCompletionUtcDay } = nextStreak(
    base.lastCompletionUtcDay,
    base.currentStreak,
    today
  )
  const completedCount = base.completedCount + 1
  const points = base.points + POINTS_PER_COMPLETION
  const badgeIds = computeBadgeIds(completedCount)

  return {
    pk: `PARTICIPANT#${sub}`,
    sk: 'PROFILE',
    completedCount,
    points,
    currentStreak,
    lastCompletionUtcDay,
    badgeIds,
    updatedAt: nowIso,
  }
}

export async function transactSurveyResponseAndProfile(
  response: SurveyResponse,
  profile: ParticipantProfileItem
): Promise<void> {
  await docClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: response,
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: profile,
          },
        },
      ],
    })
  )
}
