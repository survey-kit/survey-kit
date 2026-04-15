# Infrastructure Guide

The Survey-Kit template is designed to be deployed on AWS using a serverless architecture. This guide outlines the infrastructure components and how they are integrated into the template.

!!! note
While the core Survey-Kit framework is platform-agnostic, this infrastructure guide refers specifically to the implementation provided in the template.

## Overview

The template's infrastructure consists of three primary AWS services:

1. **AWS Lambda**: Hosts the Express.js backend.
2. **Amazon DynamoDB**: Stores survey responses.
3. **Amazon Cognito**: Manages administrative authentication for the dashboard.

Infrastructure is managed using **Terraform**, located in the `infra/terraform` directory.

---

## Authentication (Cognito)

The template uses **two** Cognito user pools:

1. **Admin** — dashboard access (`/admin/*`); users are created by administrators only.
2. **Respondent** — optional self sign-up for [gamification](gamification.md) (badges, streaks); used by `/participant/*` and authenticated survey submits.

### Integration

- **Admin**: `packages/template/src/services/auth.ts` — JWT stored separately from respondent tokens.
- **Respondent**: `packages/template/src/services/respondentAuth.ts`.
- **Backend**: Admin routes verify `COGNITO_USER_POOL_ID`; respondent routes and optional `POST …/responses` bearer tokens verify `COGNITO_RESPONDENT_USER_POOL_ID`.

### Configuration

Frontend (Vite):

- `VITE_COGNITO_CLIENT_ID` — admin app client.
- `VITE_COGNITO_RESPONDENT_CLIENT_ID` — respondent app client.
- `VITE_AWS_REGION` — region of the pools.

---

## Data Storage (DynamoDB)

Survey responses are stored in a DynamoDB table. The table uses a Single-Table Design pattern for efficiency.

### Schema

- **Partition Key (PK)**: `SURVEY#{surveyId}` (and `PARTICIPANT#{sub}` for respondent profiles — see [gamification](gamification.md))
- **Sort Key (SK)**: `RESPONSE#{timestamp}#{uuid}` (and `PROFILE` for participant aggregates)

This structure allows for efficient querying of all responses for a given survey while maintaining chronological order.

### Filtering Performance

The cross-tabulation filtering implemented in the Admin Dashboard performs the filtering in-memory on the backend after retrieving responses from DynamoDB. For extremely large datasets, we recommend implementing DynamoDB Filter Expressions or leveraging a search index like OpenSearch.

---

## Environment Configuration

Both the frontend (Vite) and backend (Express) require environment variables to connect to these services.

### Frontend (.env)

```env
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_RESPONDENT_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_REGION=eu-west-2
VITE_API_URL=https://api.yourdomain.com
```

### Backend (.env)

```env
DYNAMODB_TABLE_NAME=survey-responses
COGNITO_USER_POOL_ID=eu-west-2_XXXXXXXXX
COGNITO_RESPONDENT_USER_POOL_ID=eu-west-2_YYYYYYYYY
AWS_REGION=eu-west-2
```

---

## Deployment with Terraform

The `infra` directory contains the Terraform configuration needed to provision these resources.

1. **Backend**: Defined in `infra/terraform/dev/backend.tf`, it provisions the Lambda function, API Gateway, and required IAM roles.
2. **Database**: Defined in `infra/terraform/modules/dynamodb`, it creates the response table with the correct keys.
3. **Auth**: Defined in `infra/terraform/modules/cognito`, it sets up the User Pool and App Client.

To deploy:

```bash
cd infra/terraform/dev
terraform init
terraform apply
```
