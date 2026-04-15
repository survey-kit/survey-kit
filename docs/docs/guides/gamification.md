# Respondents, badges and streaks

Optional flow for **signed-in survey respondents**: complete surveys, earn **points** and **badges**, and keep a **UTC day streak**. Anonymous submissions (no `Authorization` header) are unchanged.

## Cognito

Two user pools:

| Pool           | Purpose                                                      | Template env                        |
| -------------- | ------------------------------------------------------------ | ----------------------------------- |
| **Admin**      | Dashboard (`/admin/*`)                                       | `VITE_COGNITO_CLIENT_ID`            |
| **Respondent** | Self sign-up; demo routes (`/participant/*`, `/survey-demo`) | `VITE_COGNITO_RESPONDENT_CLIENT_ID` |

Terraform defines both pools; the Lambda reads `COGNITO_USER_POOL_ID` (admin) and `COGNITO_RESPONDENT_USER_POOL_ID` (respondent).

## Data model (DynamoDB)

Single table; partition keys separate concerns:

- **`SURVEY#{surveyId}`** — response items. Each item includes `anonymousResponseId` (UUID). No Cognito `sub`, email or username is stored on these items.
- **`PARTICIPANT#{cognitoSub}`** / **`PROFILE`** — completion count, points, streak fields and badge ids for gamification only.

Admin analytics that query `SURVEY#…` are unaffected.

## Rules (current defaults)

| Mechanism  | Rule                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Points** | Fixed **10** points per authenticated completion                                                                                  |
| **Badges** | Unlocked at **1**, **3** and **5** total authenticated completions (every submit counts; repeating the same survey counts)        |
| **Streak** | **Consecutive UTC calendar days** with at least one authenticated completion; same-day extra completions do not extend the streak |

Server and `@survey-kit/core` expose matching badge definitions for display; keep them aligned if you change thresholds.

## API

**Submit (optional respondent token)**

`POST /api/surveys/{surveyId}/responses`

- Without `Authorization`: same as before; response body includes `anonymousResponseId`.
- With `Authorization: Bearer <Id token>` (respondent pool): verifies the token, writes the anonymous response row and updates `PROFILE` in one transaction. Response may include a `profile` snapshot (points, badges, streak).

**Profile**

`GET /api/participant/profile` — requires respondent `Bearer` token. Returns counts, points, streak and badge list with `unlocked` flags.

## Frontend (template)

- Auth: `packages/template/src/services/respondentAuth.ts` (token key separate from admin).
- Demo survey: `/survey-demo` (requires sign-in); profile: `/participant/profile`.
- Env: `VITE_COGNITO_RESPONDENT_CLIENT_ID` plus existing `VITE_AWS_REGION` and `VITE_API_URL`.

## UI packages

- **Core**: types and pure helpers (`computeBadgeStates`, `streakAriaLabel`, etc.) in `packages/core/src/lib/gamification.ts`.
- **Registry**: `BadgeList`, `BadgeCard`, `ParticipantSummary` under `packages/registry/registry/complex/gamification/`.

See [Backend](../backend.md) for endpoint payloads and environment variables.
