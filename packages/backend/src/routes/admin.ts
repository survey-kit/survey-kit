import { Router } from 'express'
import { authenticateAdmin } from '../middleware/auth.js'

import { aggregateAnalytics } from '../services/analytics.js'

const router = Router()

// Live Analytics Endpoint from DynamoDB
router.get('/analytics', authenticateAdmin, async (req, res) => {
  try {
    const surveyId = (req.query.surveyId as string) || 'survey-1'

    // Calls the dynamodb aggregate underlying getResponsesBySurvey function directly
    const liveData = await aggregateAnalytics(surveyId)

    res.json({
      success: true,
      data: liveData,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res
      .status(500)
      .json({ success: false, error: 'Failed to retrieve analytics' })
  }
})

export default router
