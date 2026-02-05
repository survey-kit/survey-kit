/**
 * Lambda handler with Express.js
 * Entry point for AWS Lambda
 */
import express from 'express'
import serverless from 'serverless-http'

const app = express()

// Middleware
app.use(express.json())
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' })
})

// Export handler for Lambda
export const handler = serverless(app)
