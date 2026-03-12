import { Request, Response, NextFunction } from 'express'
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const COGNITO_REGION = process.env.AWS_REGION
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID

const client = jwksClient({
  jwksUri: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
})

// Get the signing key from the JWKS
function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err || !key) {
      callback(new Error('Unable to find a signing key that matches the kid'))
      return
    }
    const signingKey = key.getPublicKey()
    callback(null, signingKey)
  })
}

export interface AdminRequest extends Request {
  user?: any
}

// Authenticate admin
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
    console.error('COGNITO_REGION is not configured')
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error. COGNITO_REGION is not configured.',
    })
  }

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
    },
    (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err)
        return res
          .status(401)
          .json({ success: false, error: 'Unauthorized: Invalid token' })
      }
      req.user = decoded
      next()
    }
  )
}
