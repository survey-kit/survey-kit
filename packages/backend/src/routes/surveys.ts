/**
 * Survey routes for API
 */
import { Router } from 'express'
import {
  buildSurveyResponse,
  createResponse,
  getResponsesBySurvey,
} from '../services/dynamodb.js'
import { verifyRespondentToken } from '../middleware/auth.js'
import {
  buildUpdatedProfile,
  getParticipantProfileItem,
  toParticipantProfileDto,
  transactSurveyResponseAndProfile,
} from '../services/participant.js'
import type { SubmitResponseRequest, ApiResponse } from '../types/survey.js'
import type { ParticipantProfileDto } from '../types/participant.js'

const router = Router()

/**
 * POST /api/surveys/:surveyId/responses
 * Submit a new survey response (optional Bearer: respondent Cognito Id token)
 */
router.post<
  { surveyId: string },
  ApiResponse<{
    responseId: string
    anonymousResponseId: string
    createdAt: string
    profile?: ParticipantProfileDto
  }>,
  SubmitResponseRequest
>('/:surveyId/responses', async (req, res) => {
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

    const authHeader = req.headers.authorization
    let participantSub: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      try {
        const payload = await verifyRespondentToken(token)
        if (payload.sub && typeof payload.sub === 'string') {
          participantSub = payload.sub
        }
      } catch {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Invalid respondent token',
        })
        return
      }
    }

    if (!participantSub) {
      const response = await createResponse(surveyId, answers, metadata ?? {})
      res.status(201).json({
        success: true,
        data: {
          responseId: response.responseId,
          anonymousResponseId: response.anonymousResponseId,
          createdAt: response.createdAt,
        },
      })
      return
    }

    const response = buildSurveyResponse(
      surveyId,
      answers,
      metadata ?? {}
    )
    const nowIso = new Date().toISOString()
    const previous = await getParticipantProfileItem(participantSub)
    const profile = buildUpdatedProfile(participantSub, previous, nowIso)

    await transactSurveyResponseAndProfile(response, profile)

    res.status(201).json({
      success: true,
      data: {
        responseId: response.responseId,
        anonymousResponseId: response.anonymousResponseId,
        createdAt: response.createdAt,
        profile: toParticipantProfileDto(profile),
      },
    })
  } catch (error) {
    console.error('Error creating response:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to save response',
    })
  }
})

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
