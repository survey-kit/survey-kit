import { getAuthToken, removeAuthToken } from './auth'
import { DashboardFilter } from '@survey-kit/core'

/**
 * Fetches the analytics data required for the administrator dashboard.
 * Requires a valid authentication token to authorise the request.
 *
 * @param filters Optional array of global filters to apply to the analytics query.
 * @returns A promise resolving to the analytics data or an error state.
 */
export const fetchAdminAnalytics = async (filters?: DashboardFilter[]) => {
  const token = getAuthToken()
  if (!token) return { success: false, error: 'Not authenticated' }

  try {
    let url = '/api/admin/analytics'
    if (filters && filters.length > 0) {
      const params = new URLSearchParams()
      filters.forEach((f) => {
        if (Array.isArray(f.value)) {
          f.value.forEach((v: string) => params.append(f.questionId, v))
        } else if (f.value) {
          params.append(f.questionId, f.value)
        }
      })
      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

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
