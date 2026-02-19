/**
 * Lambda handler with Express.js
 * Entry point for AWS Lambda
 */
import serverless from 'serverless-http'
import app from './app.js'

// Export handler for Lambda
export const handler = serverless(app)
