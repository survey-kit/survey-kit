/**
 * Cognito auth for survey respondents (separate pool from admin).
 */
const COGNITO_REGION = import.meta.env.VITE_AWS_REGION
const RESPONDENT_CLIENT_ID = import.meta.env.VITE_COGNITO_RESPONDENT_CLIENT_ID

const STORAGE_KEY = 'respondentIdToken'

export const getRespondentToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEY)
}

export const setRespondentToken = (token: string) => {
  localStorage.setItem(STORAGE_KEY, token)
}

export const removeRespondentToken = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export interface RespondentAuthResult {
  success: boolean
  error?: string
  needsConfirmation?: boolean
}

async function cognitoJson(
  target: string,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': target,
      },
      body: JSON.stringify(body),
    }
  )
  return response.json() as Promise<Record<string, unknown>>
}

export async function registerRespondent(
  email: string,
  password: string
): Promise<RespondentAuthResult> {
  if (!RESPONDENT_CLIENT_ID) {
    return {
      success: false,
      error: 'Respondent Cognito client ID is not configured',
    }
  }

  const data = await cognitoJson('AWSCognitoIdentityProviderService.SignUp', {
    ClientId: RESPONDENT_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email }],
  })

  if ((data as any).__type && (data as any).message) {
    return {
      success: false,
      error: String((data as any).message),
    }
  }

  if ((data as any).UserSub) {
    const confirmed = (data as any).UserConfirmed === true
    return {
      success: true,
      needsConfirmation: !confirmed,
    }
  }

  return {
    success: false,
    error: 'Registration failed',
  }
}

export async function confirmRespondent(
  email: string,
  code: string
): Promise<RespondentAuthResult> {
  if (!RESPONDENT_CLIENT_ID) {
    return {
      success: false,
      error: 'Respondent Cognito client ID is not configured',
    }
  }

  const data = await cognitoJson(
    'AWSCognitoIdentityProviderService.ConfirmSignUp',
    {
      ClientId: RESPONDENT_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    }
  )

  if ((data as any).__type && (data as any).message) {
    return { success: false, error: String((data as any).message) }
  }

  return { success: true }
}

export async function loginRespondent(
  email: string,
  password: string
): Promise<RespondentAuthResult> {
  if (!RESPONDENT_CLIENT_ID) {
    return {
      success: false,
      error: 'Respondent Cognito client ID is not configured',
    }
  }

  const data = await cognitoJson(
    'AWSCognitoIdentityProviderService.InitiateAuth',
    {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: RESPONDENT_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }
  )

  const auth = (data as any).AuthenticationResult
  if (auth?.IdToken) {
    setRespondentToken(auth.IdToken)
    return { success: true }
  }

  const msg = typeof data.message === 'string' ? data.message : 'Sign in failed'
  return { success: false, error: msg }
}
