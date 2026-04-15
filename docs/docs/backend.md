# Backend

Survey-Kit includes a serverless backend for collecting survey responses, built with Express.js and DynamoDB, designed for deployment on AWS Lambda.

## Structure

- `src/index.ts`: Lambda handler entry point.
- `src/routes/surveys.ts`: API route definitions.
- `src/services/dynamodb.ts`: DynamoDB interaction service.
- `src/types/survey.ts`: TypeScript type definitions.

## Development

To set up the backend locally:

```bash
cd packages/backend

# Install dependencies
npm install

# Build for production
npm run build

# Create Lambda deployment package
npm run build:lambda
```

## API Endpoints

### Submit Response

`POST /api/surveys/{surveyId}/responses`

Submits a survey response. Optionally send `Authorization: Bearer <respondent Id token>` to record completion for [badges and streaks](guides/gamification.md) without storing identity on the response row.

**Request Body:**

```json
{
  "answers": {
    "question-1": { "value": "answer", "touched": true }
  },
  "metadata": {
    "userAgent": "...",
    "completionTime": 30000,
    "sessionId": "uuid",
    "gdprConsent": true
  }
}
```

**Response (anonymous):**

```json
{
  "success": true,
  "data": {
    "responseId": "uuid",
    "anonymousResponseId": "uuid",
    "createdAt": "2026-02-05T10:00:00Z"
  }
}
```

When a valid respondent token is supplied, the same shape applies and `data` may also include a `profile` object (points, badges, streak).

### List Responses

`GET /api/surveys/{surveyId}/responses`

Retrieves all raw responses for a specific survey (administrative use only).

### Analytics Aggregation

`GET /api/admin/analytics`

Returns aggregated analytics data for the Admin Dashboard. The `surveyId` query parameter is **optional**: when present, scope results to that survey; when omitted, the template treats the request as “all surveys”—ensure your deployment matches that behaviour.

**Example (scoped):**

`GET /api/admin/analytics?surveyId=survey-1`

**Filtering:**

You can combine optional `surveyId` with survey question IDs and values as further query parameters. Results must match all supplied criteria (AND logic).

**Example:**
To view analytics for respondents who answered "In House" for the question with ID `developed`:

`GET /api/admin/analytics?surveyId=survey-1&developed=in_house`

The backend handles both simple values and object-based answer structures (e.g., `{ value: "..." }`) when applying these filters.

### Participant profile

`GET /api/participant/profile`

Returns gamification state for the authenticated respondent. Requires `Authorization: Bearer <respondent Id token>`. See [Respondents & gamification](guides/gamification.md).

## Environment Variables

Ensure the following environment variables are configured:

| Variable                          | Description                                                                             |
| :-------------------------------- | :-------------------------------------------------------------------------------------- |
| `DYNAMODB_TABLE_NAME`             | The name of the DynamoDB table. (e.g. `sk-template-dev-responses`)                      |
| `AWS_REGION`                      | AWS region where DynamoDB and Cognito are deployed. (e.g. `eu-west-2`)                  |
| `COGNITO_USER_POOL_ID`            | Cognito User Pool ID for **admin** JWT verification.                                    |
| `COGNITO_RESPONDENT_USER_POOL_ID` | Cognito User Pool ID for **respondent** JWT verification (gamification).                |
| `AWS_PROFILE`                     | AWS named profile for CLI access (after `aws sso login --profile <profile>`).           |
| `PORT`                            | Local server port for backend (e.g. `3001`).                                            |
| `ALLOWED_ORIGINS`                 | Comma-separated list of allowed origins for CORS (`*` allows all, use for development). |

## Deployment

Infrastructure configuration is managed via Terraform. Refer to `infra/terraform/dev/backend.tf` for details.
