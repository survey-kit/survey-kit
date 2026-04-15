import { Request, Response, NextFunction } from 'express'
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken'
import jwksClient, { JwksClient } from 'jwks-rsa'

const COGNITO_REGION = process.env.AWS_REGION
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID
const COGNITO_RESPONDENT_USER_POOL_ID =
  process.env.COGNITO_RESPONDENT_USER_POOL_ID

const jwksClients = new Map<string, JwksClient>()

function getJwksClient(poolId: string): JwksClient {
  if (!COGNITO_REGION) {
    throw new Error('AWS_REGION is not configured')
  }
  let client = jwksClients.get(poolId)
  if (!client) {
    client = jwksClient({
      jwksUri: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${poolId}/.well-known/jwks.json`,
    })
    jwksClients.set(poolId, client)
  }
  return client
}

function getKeyForPool(poolId: string) {
  const client = getJwksClient(poolId)
  return (header: JwtHeader, callback: SigningKeyCallback) => {
    client.getSigningKey(header.kid, function (err, key) {
      if (err || !key) {
        callback(new Error('Unable to find a signing key that matches the kid'))
        return
      }
      callback(null, key.getPublicKey())
    })
  }
}

export function verifyCognitoJwt(token: string, poolId: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    if (!COGNITO_REGION || !poolId) {
      reject(new Error('Cognito pool or region not configured'))
      return
    }
    jwt.verify(
      token,
      getKeyForPool(poolId),
      {
        algorithms: ['RS256'],
        issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${poolId}`,
      },
      (err, decoded) => {
        if (err || !decoded || typeof decoded === 'string') {
          reject(err ?? new Error('Invalid token payload'))
          return
        }
        resolve(decoded)
      }
    )
  })
}

export async function verifyAdminToken(token: string): Promise<JwtPayload> {
  if (!COGNITO_USER_POOL_ID) {
    throw new Error('COGNITO_USER_POOL_ID is not configured')
  }
  return verifyCognitoJwt(token, COGNITO_USER_POOL_ID)
}

export async function verifyRespondentToken(token: string): Promise<JwtPayload> {
  if (!COGNITO_RESPONDENT_USER_POOL_ID) {
    throw new Error('COGNITO_RESPONDENT_USER_POOL_ID is not configured')
  }
  return verifyCognitoJwt(token, COGNITO_RESPONDENT_USER_POOL_ID)
}

export interface AdminRequest extends Request {
  user?: JwtPayload
}

export interface RespondentRequest extends Request {
  user?: JwtPayload
}

export const authenticateAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, error: 'Unauthorized: No token provided' })
  }

  const token = authHeader.split(' ')[1]

  if (!COGNITO_USER_POOL_ID) {
    console.error('COGNITO_USER_POOL_ID is not configured')
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error. COGNITO_USER_POOL_ID is not configured.',
    })
  }

  if (!COGNITO_REGION) {
    console.error('AWS_REGION is not configured')
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error. AWS_REGION is not configured.',
    })
  }

  verifyAdminToken(token)
    .then((decoded) => {
      req.user = decoded
      next()
    })
    .catch((err) => {
      console.error('JWT verification failed:', err)
      return res
        .status(401)
        .json({ success: false, error: 'Unauthorized: Invalid token' })
    })
}

export const authenticateRespondent = (
  req: RespondentRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, error: 'Unauthorized: No token provided' })
  }

  const token = authHeader.split(' ')[1]

  if (!COGNITO_RESPONDENT_USER_POOL_ID) {
    console.error('COGNITO_RESPONDENT_USER_POOL_ID is not configured')
    return res.status(500).json({
      success: false,
      error:
        'Internal Server Error. COGNITO_RESPONDENT_USER_POOL_ID is not configured.',
    })
  }

  if (!COGNITO_REGION) {
    console.error('AWS_REGION is not configured')
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error. AWS_REGION is not configured.',
    })
  }

  verifyRespondentToken(token)
    .then((decoded) => {
      req.user = decoded
      next()
    })
    .catch((err) => {
      console.error('Respondent JWT verification failed:', err)
      return res
        .status(401)
        .json({ success: false, error: 'Unauthorized: Invalid token' })
    })
}
