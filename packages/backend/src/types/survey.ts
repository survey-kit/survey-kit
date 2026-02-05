/**
 * TypeScript types for survey response storage
 */

/** Metadata captured with GDPR consent */
export interface ResponseMetadata {
  userAgent?: string
  completionTime?: number
  sessionId?: string
  gdprConsent: boolean
}

/** Survey response stored in DynamoDB */
export interface SurveyResponse {
  pk: string // SURVEY#{surveyId}
  sk: string // RESPONSE#{timestamp}#{uuid}
  surveyId: string
  responseId: string
  answers: Record<string, unknown>
  metadata: ResponseMetadata
  createdAt: string
}

/** Request body for submitting a survey response */
export interface SubmitResponseRequest {
  answers: Record<string, unknown>
  metadata?: Partial<ResponseMetadata>
}

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
