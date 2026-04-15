/**
 * API service for submitting survey responses
 */

const API_URL = import.meta.env.VITE_API_URL || ''

export interface ParticipantProfileApi {
  completedCount: number
  points: number
  currentStreak: number
  lastCompletionUtcDay: string | null
  badges: Array<{
    id: string
    label: string
    description: string
    unlocked: boolean
  }>
}

interface SubmitOptions {
  surveyId: string
  answers: Record<string, unknown>
  sessionStartTime: number
  hasAnalyticsConsent: boolean
  /** Respondent Cognito Id token — enables gamification without PII on the response row */
  bearerToken?: string | null
}

interface SubmitResult {
  success: boolean
  responseId?: string
  anonymousResponseId?: string
  profile?: ParticipantProfileApi
  error?: string
}

/**
 * Submit survey response to backend API
 * Falls back to console.log if API_URL is not configured
 */
export async function submitSurveyResponse({
  surveyId,
  answers,
  sessionStartTime,
  hasAnalyticsConsent,
  bearerToken,
}: SubmitOptions): Promise<SubmitResult> {
  const metadata = hasAnalyticsConsent
    ? {
        userAgent: navigator.userAgent,
        completionTime: Date.now() - sessionStartTime,
        sessionId:
          sessionStorage.getItem('surveySessionId') || crypto.randomUUID(),
        gdprConsent: true,
      }
    : { gdprConsent: false }

  // If no API URL configured, log to console (development mode)
  if (!API_URL) {
    console.log('Survey submission (no API configured):', {
      surveyId,
      answers,
      metadata,
    })
    return { success: true, responseId: 'local-' + Date.now() }
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`
    }

    const response = await fetch(
      `${API_URL}/api/surveys/${surveyId}/responses`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers, metadata }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      responseId: data.data?.responseId,
      anonymousResponseId: data.data?.anonymousResponseId,
      profile: data.data?.profile,
    }
  } catch (error) {
    console.error('Failed to submit survey:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Initialize session ID for tracking
 */
export function initSession(): number {
  if (!sessionStorage.getItem('surveySessionId')) {
    sessionStorage.setItem('surveySessionId', crypto.randomUUID())
  }
  return Date.now()
}

export async function fetchParticipantProfile(
  bearerToken: string
): Promise<
  | { success: true; data: ParticipantProfileApi }
  | { success: false; error: string }
> {
  if (!API_URL) {
    return {
      success: false,
      error: 'API URL is not configured',
    }
  }

  try {
    const response = await fetch(`${API_URL}/api/participant/profile`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}`,
      }
    }

    const json = await response.json()
    if (!json.success || !json.data) {
      return {
        success: false,
        error: json.error || 'Invalid response',
      }
    }

    return { success: true, data: json.data }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
