/**
 * API service for submitting survey responses
 */

const API_URL = import.meta.env.VITE_API_URL || ''

interface SubmitOptions {
  surveyId: string
  answers: Record<string, unknown>
  sessionStartTime: number
  hasAnalyticsConsent: boolean
}

interface SubmitResult {
  success: boolean
  responseId?: string
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
    const response = await fetch(
      `${API_URL}/api/surveys/${surveyId}/responses`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, metadata }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return { success: true, responseId: data.data?.responseId }
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
