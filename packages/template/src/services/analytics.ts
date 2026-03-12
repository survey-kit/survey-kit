import { getAuthToken, removeAuthToken } from './auth'

/**
 * Fetches the analytics data required for the administrator dashboard.
 * Requires a valid authentication token to authorise the request.
 *
 * @returns A promise resolving to the analytics data or an error state.
 */
export const fetchAdminAnalytics = async () => {
  const token = getAuthToken()
  if (!token) return { success: false, error: 'Not authenticated' }

  try {
    const response = await fetch('/api/admin/analytics', {
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
