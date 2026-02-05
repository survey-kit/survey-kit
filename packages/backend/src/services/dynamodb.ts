/**
 * DynamoDB service for survey response storage
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import type { SurveyResponse, ResponseMetadata } from '../types/survey.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'survey-responses'

/**
 * Create a new survey response in DynamoDB
 */
export async function createResponse(
  surveyId: string,
  answers: Record<string, unknown>,
  metadata: Partial<ResponseMetadata> = {}
): Promise<SurveyResponse> {
  const timestamp = new Date().toISOString()
  const responseId = uuidv4()

  const response: SurveyResponse = {
    pk: `SURVEY#${surveyId}`,
    sk: `RESPONSE#${timestamp}#${responseId}`,
    surveyId,
    responseId,
    answers,
    metadata: {
      gdprConsent: metadata.gdprConsent ?? false,
      ...(metadata.gdprConsent && {
        userAgent: metadata.userAgent,
        completionTime: metadata.completionTime,
        sessionId: metadata.sessionId,
      }),
    },
    createdAt: timestamp,
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: response,
    })
  )

  return response
}

/**
 * Get all responses for a survey
 */
export async function getResponsesBySurvey(
  surveyId: string,
  limit = 100
): Promise<SurveyResponse[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `SURVEY#${surveyId}`,
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
    })
  )

  return (result.Items as SurveyResponse[]) || []
}

/**
 * Get a single response by ID
 */
export async function getResponse(
  surveyId: string,
  sk: string
): Promise<SurveyResponse | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `SURVEY#${surveyId}`,
        sk,
      },
    })
  )

  return (result.Item as SurveyResponse) || null
}
