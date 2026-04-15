/**
 * Shared Express application
 * Used by both Lambda handler and local dev server
 */
import express from 'express'
import surveyRoutes from './routes/surveys.js'
import adminRoutes from './routes/admin.js'
import participantRoutes from './routes/participant.js'

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
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

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

// Participant (respondent) routes
app.use('/api/participant', participantRoutes)

// Admin routes
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' })
})

export default app
