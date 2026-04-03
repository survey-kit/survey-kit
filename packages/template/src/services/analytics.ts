import { getAuthToken, removeAuthToken } from './auth'
import { DashboardFilter } from '@survey-kit/core'

const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * Fetches the analytics data required for the administrator dashboard.
 * Requires a valid authentication token to authorise the request.
 *
 * @param filters Optional array of global filters to apply to the analytics query.
 * @returns A promise resolving to the analytics data or an error state.
 */
export const fetchAdminAnalytics = async (
  filters?: DashboardFilter[],
  surveyId?: string
) => {
  const token = getAuthToken()
  if (!token) return { success: false, error: 'Not authenticated' }

  try {
    const params = new URLSearchParams()
    if (surveyId) {
      params.set('surveyId', surveyId)
    }
    if (filters && filters.length > 0) {
      filters.forEach((f) => {
        if (Array.isArray(f.value)) {
          f.value.forEach((v: string) => params.append(f.questionId, v))
        } else if (f.value) {
          params.append(f.questionId, f.value)
        }
      })
    }
    const queryString = params.toString()
    const url = queryString
      ? `${API_URL}/api/admin/analytics?${queryString}`
      : `${API_URL}/api/admin/analytics`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      removeAuthToken()
      return { success: false, error: 'Session expired' }
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch analytics', error)
    return { success: false, error: 'Network error or configuration issue' }
  }
}
