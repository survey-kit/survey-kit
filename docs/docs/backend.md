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

Submits a survey response.

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

**Response:**

```json
{
  "success": true,
  "data": {
    "responseId": "uuid",
    "createdAt": "2026-02-05T10:00:00Z"
  }
}
```

### List Responses

`GET /api/surveys/{surveyId}/responses`

Retrieves all responses for a specific survey (administrative use only).

## Environment Variables

Ensure the following environment variables are configured:

| Variable              | Description                                       |
| :-------------------- | :------------------------------------------------ |
| `DYNAMODB_TABLE_NAME` | The name of the DynamoDB table.                   |
| `ALLOWED_ORIGINS`     | Comma-separated list of allowed origins for CORS. |

## Deployment

Infrastructure configuration is managed via Terraform. Refer to `infra/terraform/dev/backend.tf` for details.
