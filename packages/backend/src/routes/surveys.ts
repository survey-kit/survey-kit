/**
 * Survey routes for API
 */
import { Router } from 'express'
import { createResponse, getResponsesBySurvey } from '../services/dynamodb.js'
import type { SubmitResponseRequest, ApiResponse } from '../types/survey.js'

const router = Router()

/**
 * POST /api/surveys/:surveyId/responses
 * Submit a new survey response
 */
router.post<{ surveyId: string }, ApiResponse, SubmitResponseRequest>(
  '/:surveyId/responses',
  async (req, res) => {
    try {
      const { surveyId } = req.params
      const { answers, metadata } = req.body

      if (!answers || typeof answers !== 'object') {
        res.status(400).json({
          success: false,
          error: 'Invalid request: answers object is required',
        })
        return
      }

      const response = await createResponse(surveyId, answers, metadata)

      res.status(201).json({
        success: true,
        data: {
          responseId: response.responseId,
          createdAt: response.createdAt,
        },
      })
    } catch (error) {
      console.error('Error creating response:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to save response',
      })
    }
  }
)

/**
 * GET /api/surveys/:surveyId/responses
 * List responses for a survey (admin use)
 */
router.get<{ surveyId: string }, ApiResponse>(
  '/:surveyId/responses',
  async (req, res) => {
    try {
      const { surveyId } = req.params
      const responses = await getResponsesBySurvey(surveyId)

      res.json({
        success: true,
        data: responses,
      })
    } catch (error) {
      console.error('Error fetching responses:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch responses',
      })
    }
  }
)

export default router
