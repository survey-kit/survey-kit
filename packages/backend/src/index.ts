/**
 * Lambda handler with Express.js
 * Entry point for AWS Lambda
 */
import express from 'express'
import serverless from 'serverless-http'
import surveyRoutes from './routes/surveys.js'

const app = express()

// Middleware
app.use(express.json())

// CORS headers for CloudFront domain
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  const origin = req.headers.origin || ''

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*')
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }

  next()
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Survey routes
app.use('/api/surveys', surveyRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' })
})

// Export handler for Lambda
export const handler = serverless(app)
