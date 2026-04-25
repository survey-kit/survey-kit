import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, BadgeList, ParticipantSummary } from '@survey-kit/registry'
import { streakAriaLabel } from '@survey-kit/core'
import {
  fetchParticipantProfile,
  type ParticipantProfileApi,
} from '../services/api'
import {
  getRespondentToken,
  removeRespondentToken,
} from '../services/respondentAuth'

export function ParticipantProfile() {
  const navigate = useNavigate()
  const token = getRespondentToken()
  const [profile, setProfile] = useState<ParticipantProfileApi | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await fetchParticipantProfile(token)
      if (cancelled) return
      if (res.success) {
        setProfile(res.data)
      } else {
        setError(res.error)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  if (!token) {
    return (
      <div className="flex-1 p-6 max-w-2xl mx-auto">
        <p className="mb-4">You are not signed in.</p>
        <Button type="button" onClick={() => navigate('/participant/login')}>
          Sign in
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 max-w-2xl mx-auto" aria-live="polite">
        Loading your profile…
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex-1 p-6 max-w-2xl mx-auto">
        <p className="text-destructive mb-4">
          {error || 'Could not load profile.'}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            removeRespondentToken()
            navigate('/participant/login')
          }}
        >
          Back to login
        </Button>
      </div>
    )
  }

  const streakLabel = streakAriaLabel(
    profile.currentStreak,
    profile.lastCompletionUtcDay
  )

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Your progress
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/survey-demo')}
          >
            Demo survey
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              removeRespondentToken()
              navigate('/participant/login')
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <ParticipantSummary
        points={profile.points}
        completedCount={profile.completedCount}
        currentStreak={profile.currentStreak}
        streakDescription={streakLabel}
      />

      <BadgeList badges={profile.badges} title="Badges" />
    </div>
  )
}
