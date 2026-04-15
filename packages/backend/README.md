# Survey-Kit Backend

Express API for survey responses, admin analytics, and optional **respondent** gamification (badges / streaks). Deployed as an AWS Lambda container (see `Dockerfile`).

## Structure

```
packages/backend/
├── src/
│   ├── index.ts                 # Lambda handler (serverless-http)
│   ├── app.ts                   # Express app
│   ├── routes/
│   │   ├── surveys.ts           # POST/GET …/api/surveys/:id/responses
│   │   ├── admin.ts           # GET …/api/admin/analytics
│   │   └── participant.ts     # GET …/api/participant/profile (+ /health)
│   ├── services/
│   │   ├── dynamodb.ts
│   │   ├── analytics.ts
│   │   └── participant.ts     # PROFILE updates / badges
│   ├── middleware/auth.ts     # Admin + respondent Cognito JWT
│   └── types/
├── Dockerfile                   # Multi-stage: esbuild in image (no stale host dist/)
├── esbuild.config.js
└── package.json
```

## Development

```bash
npm install
npm run typecheck
npm run build # dist/index.js for local checks
npm run dev            # local server (dist/server.js)
```

## Docker (Lambda)

Build from **`packages/backend`** — the image runs `esbuild` from `src`; you do **not** need `npm run build` on the host first:

```bash
docker build -t <account>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag> .
```

Push the tag to ECR and set `lambda_image_tag` in Terraform to match.

## API (summary)

| Method | Path | Notes |
| ------ | ---- | ----- |
| POST | `/api/surveys/:surveyId/responses` | Optional `Authorization: Bearer` (respondent Id token) for gamification |
| GET | `/api/surveys/:surveyId/responses` | List responses |
| GET | `/api/admin/analytics` | Admin JWT required |
| GET | `/api/participant/profile` | Respondent JWT required |
| GET | `/api/participant/health` | Unauthenticated sanity check |
| GET | `/api/health` | Liveness |

Full detail: [`docs/docs/backend.md`](../../docs/docs/backend.md) and [`docs/docs/guides/gamification.md`](../../docs/docs/guides/gamification.md).

## Environment variables

| Variable | Description |
| -------- | ----------- |
| `DYNAMODB_TABLE_NAME` | Table name |
| `AWS_REGION` | Region (Cognito JWKS + DynamoDB) |
| `COGNITO_USER_POOL_ID` | **Admin** pool (dashboard JWTs) |
| `COGNITO_RESPONDENT_USER_POOL_ID` | **Respondent** pool (optional bearer on submit + profile) |
| `ALLOWED_ORIGINS` | CORS (comma-separated; template CloudFront + localhost for dev) |

## Deployment

Terraform: `infra/terraform/dev/backend.tf`. Frontend env: `VITE_API_URL` = API **origin** only (no `/api` suffix); see infrastructure guide in the docs site.
