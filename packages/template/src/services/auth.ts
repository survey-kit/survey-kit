/**
 * Simple Cognito Auth Service using fetch and the AWS API directly.
 * Handles the authentication flow, token management, and analytics data retrieval.
 */
const COGNITO_REGION = import.meta.env.VITE_AWS_REGION
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID

/**
 * Retrieves the current administrator authentication token from local storage.
 * @returns The authentication token if present, otherwise null.
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('adminToken')
}

/**
 * Persists the administrator authentication token to local storage.
 * @param token - The JWT token to store.
 */
export const setAuthToken = (token: string) => {
  localStorage.setItem('adminToken', token)
}

/**
 * Removes the administrator authentication token from local storage, effectively logging the user out.
 */
export const removeAuthToken = () => {
  localStorage.removeItem('adminToken')
}

export interface AuthResult {
  success: boolean
  error?: string
  challenge?: string
  session?: string
}

/**
 * Initialises an authentication request with AWS Cognito to log in an administrator.
 *
 * @param username - The administrator's email or username.
 * @param password - The administrator's password.
 * @returns A promise resolving to the authentication result.
 */
export const loginAdmin = async (
  username: string,
  password: string
): Promise<AuthResult> => {
  if (!COGNITO_CLIENT_ID) {
    return { success: false, error: 'Cognito Client ID is not configured' }
  }

  try {
    const response = await fetch(
      `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        },
        body: JSON.stringify({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
          },
        }),
      }
    )

    const data = await response.json()

    if (data.AuthenticationResult && data.AuthenticationResult.IdToken) {
      setAuthToken(data.AuthenticationResult.IdToken)
      return { success: true }
    } else if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return {
        success: false,
        challenge: 'NEW_PASSWORD_REQUIRED',
        session: data.Session,
      }
    } else {
      console.error('Authentication error:', data)
      return { success: false, error: data.message || 'Authentication failed' }
    }
  } catch (error) {
    console.error('Login request failed', error)
    return { success: false, error: 'Network error or configuration issue' }
  }
}

/**
 * Submits a new password to satisfy the Cognito NEW_PASSWORD_REQUIRED challenge.
 *
 * @param username - The administrator's email or username.
 * @param newPassword - The new password chosen by the administrator.
 * @param session - The session token provided by the initial login attempt.
 * @returns A promise resolving to the authentication result.
 */
export const respondToNewPasswordChallenge = async (
  username: string,
  newPassword: string,
  session: string
): Promise<AuthResult> => {
  if (!COGNITO_CLIENT_ID) {
    return { success: false, error: 'Cognito Client ID is not configured' }
  }

  try {
    const response = await fetch(
      `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target':
            'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
        },
        body: JSON.stringify({
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ClientId: COGNITO_CLIENT_ID,
          ChallengeResponses: {
            USERNAME: username,
            NEW_PASSWORD: newPassword,
          },
          Session: session,
        }),
      }
    )

    const data = await response.json()

    if (data.AuthenticationResult && data.AuthenticationResult.IdToken) {
      setAuthToken(data.AuthenticationResult.IdToken)
      return { success: true }
    } else {
      console.error('Challenge response error:', data)
      return { success: false, error: data.message || 'Password update failed' }
    }
  } catch (error) {
    console.error('Challenge request failed', error)
    return { success: false, error: 'Network error or configuration issue' }
  }
}
