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

Administrative access to the dashboard is secured via AWS Cognito. This provides a secure, scalable way to manage admin users without storing credentials directly in the database.

### Integration

The authentication logic is implemented in `packages/template/src/services/auth.ts`, which uses the AWS SDK to interact with the Cognito User Pool.

- **Login**: Authenticates users and stores the JWT in `localStorage`.
- **Validation**: The backend verifies the JWT in the `Authorization` header for protected admin routes.
- **Logout**: Clears the authentication state and local storage.

### Configuration

To configure Cognito, you need the following environment variables:

- `VITE_COGNITO_CLIENT_ID`: The application client ID from your Cognito User Pool.
- `VITE_AWS_REGION`: The region where your User Pool is deployed.

---

## Data Storage (DynamoDB)

Survey responses are stored in a DynamoDB table. The table uses a Single-Table Design pattern for efficiency.

### Schema

- **Partition Key (PK)**: `SURVEY#{surveyId}`
- **Sort Key (SK)**: `RESPONSE#{timestamp}#{uuid}`

This structure allows for efficient querying of all responses for a given survey while maintaining chronological order.

### Filtering Performance

The cross-tabulation filtering implemented in the Admin Dashboard performs the filtering in-memory on the backend after retrieving responses from DynamoDB. For extremely large datasets, we recommend implementing DynamoDB Filter Expressions or leveraging a search index like OpenSearch.

---

## Environment Configuration

Both the frontend (Vite) and backend (Express) require environment variables to connect to these services.

### Frontend (.env)

```env
VITE_COGNITO_CLIENT_ID=eu-west-2_XXXXXXXXX
VITE_AWS_REGION=eu-west-2
VITE_API_URL=https://api.yourdomain.com
```

### Backend (.env)

```env
DYNAMODB_TABLE_NAME=survey-responses
COGNITO_USER_POOL_ID=eu-west-2_XXXXXXXXX
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
