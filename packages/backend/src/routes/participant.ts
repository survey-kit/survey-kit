import { Router } from 'express'
import { authenticateRespondent, type RespondentRequest } from '../middleware/auth.js'
import {
  getEmptyParticipantProfileDto,
  getParticipantProfileItem,
  toParticipantProfileDto,
} from '../services/participant.js'
const router = Router()

router.get(
  '/profile',
  authenticateRespondent,
  async (req: RespondentRequest, res) => {
    try {
      const sub = req.user?.sub
      if (!sub || typeof sub !== 'string') {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Missing subject in token',
        })
        return
      }

      const item = await getParticipantProfileItem(sub)
      if (!item) {
        res.json({
          success: true,
          data: getEmptyParticipantProfileDto(),
        })
        return
      }

      res.json({
        success: true,
        data: toParticipantProfileDto(item),
      })
    } catch (error) {
      console.error('Error fetching participant profile:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
      })
    }
  }
)

export default router
