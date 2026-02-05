# Survey-Kit Backend

Lambda backend for survey response storage using Express.js and DynamoDB.

## Structure

```
packages/backend/
├── src/
│   ├── index.ts              # Lambda handler
│   ├── routes/surveys.ts     # API routes
│   ├── services/dynamodb.ts  # DynamoDB service
│   └── types/survey.ts       # TypeScript types
└── package.json
```

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build

# Build Lambda deployment package
npm run build:lambda
```

## API Endpoints

### POST /api/surveys/{surveyId}/responses

Submit a survey response.

**Request:**

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

### GET /api/surveys/{surveyId}/responses

List responses for a survey (admin use).

## Environment Variables

| Variable              | Description                              |
| --------------------- | ---------------------------------------- |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name                      |
| `ALLOWED_ORIGINS`     | Comma-separated allowed origins for CORS |

## Deployment

Uses container image deployment to ECR:

```bash
# After terraform apply creates the ECR repository
npm run deploy <ecr_repository_url> <aws_profile>
```

See `infra/terraform/dev/backend.tf` for infrastructure configuration.
