# Getting Started

## Operating System Requirements

- **macOS** 12 or later
- **Linux** — Ubuntu 20+ or equivalent
- **Windows** — Windows 10+

## Required Programs

| Program                        | Minimum version | Notes                                                                                                     |
| ------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------- |
| [Git](https://git-scm.com/)    | 2.x             | Clone the repository                                                                                      |
| [Node.js](https://nodejs.org/) | 18 LTS          | Tested up to Node 22; bundled with npm                                                                    |
| [npm](https://www.npmjs.com/)  | 9               | Bundled with Node.js                                                                                      |
| `make`                         | any             | Pre-installed on macOS/Linux. macOS: `xcode-select --install`. Ubuntu: `sudo apt install build-essential` |

## Installing from Source

**1. Clone the repository**

```bash
git clone https://github.com/survey-kit/survey-kit.git
cd survey-kit
```

or preferrably clone from the GitLab repository (which I won't put the link here as it is private).

**2. Install workspace dependencies** (covers `core`, `registry`, and `template`)

```bash
npm install
```

**3. Install backend dependencies** (only needed for full-stack development)

```bash
cd packages/backend && npm install && cd ../..
```

## Running the Application

### Frontend only (survey template)

```bash
cd packages/template
npm run dev
```

Opens at `http://localhost:5173`.

### Template + backend together (recommended)

From the repo root:

```bash
make dev
```

The template opens at `http://localhost:5173`; the backend API runs at `http://localhost:3001`.

If you already have an application running on port 5173 please kill it before running the command or kill the process using: `lsof -ti :5173 -sTCP:LISTEN | xargs kill -9 2>/dev/null`. The same for port 3001 by replacing `:5173` with `:3001`.

### Important Notes

Please note that the backend will not work locally as the database is setup on AWS. Please follow [infra/terraform/README.md](infra/terraform/README.md) to setup the infrastructure, then the backend will work locally. You are still able to run the frontend and go through the survey, but no responses will be saved.

The project is about creating a survey framework that is accessible, extensible, and mobile-first. As an extra feature, it is also about creating a template application that can be used to create surveys and admin dashboards.

To view the deployed application, please visit [template.survey-kit.com](https://template.survey-kit.com) which has the frontend hosted on Vercel and the backend hosted on AWS. Alternatively, you can visit [aws-template.survey-kit.com](https://aws-template.survey-kit.com) which has the frontend hosted on AWS and the backend hosted on AWS.

### Admin Dashboard

The admin dashboard is available [aws-template.survey-kit.com/admin/login](https://aws-template.survey-kit.com/admin/login) with the following credentials:

**Username:**
marker@survey-kit.com

**Password:**
Marker123!

**As an admin, you cannot make any changes to the surveys or admin dashboard. You can only view the analytics and responses. The responses are fake and include no real or sensitive data.**

### Documentation

Further documentation can be found in the [documentation](docs/docs/index.md) or [here](https://docs.survey-kit.com).

### Optional Commands

**Optional — documentation site**

```
cd docs
python3 -m venv venv
source venv/bin/activate
pip install -r mkdocs_requirements.txt
```

**Optional — pre-commit hooks**

```
brew install pre-commit   # macOS (Homebrew)
pre-commit install        # run once inside the repo
```

### Other common commands

| Goal                        | Command (run from repo root)  |                          |
| --------------------------- | ----------------------------- | ------------------------ |
| Backend dev server only     | `make dev-backend`            |
| Build all packages          | `npm run build --workspaces`  |
| Run tests                   | `npm test`                    | <- Good to test the code |
| Run tests in watch mode     | `npm run test:watch`          |
| Run tests with coverage     | `npm run test:coverage`       |
| Lint all packages           | `npm run lint --workspaces`   |
| Format all packages         | `npm run format --workspaces` |
| Serve documentation locally | `make docs-serve`             |
| See all Makefile targets    | `make help`                   |

## File Listing

```
survey-kit/
├── README.md
├── GET_STARTED.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── sk-kanban.md
├── LICENSE
├── Makefile
├── package.json
├── package-lock.json
├── eslint.config.js
│
├── packages/
│   ├── core/                        # Survey engine — published as @survey-kit/core
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── SurveyRenderer.tsx
│   │   │   │   ├── ChatSurveyRenderer.tsx
│   │   │   │   ├── LayoutRenderer.tsx
│   │   │   │   └── DashboardRenderer.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSurvey/
│   │   │   │       ├── index.ts
│   │   │   │       ├── state.ts
│   │   │   │       ├── navigation.ts
│   │   │   │       ├── progress.ts
│   │   │   │       ├── visibility.ts
│   │   │   │       └── completion.ts
│   │   │   ├── lib/
│   │   │   │   ├── validation.ts
│   │   │   │   ├── conditional.ts
│   │   │   │   ├── configUtils.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── documentFavicon.ts
│   │   │   ├── types/
│   │   │   │   ├── survey.ts
│   │   │   │   ├── section.ts
│   │   │   │   ├── layout.ts
│   │   │   │   └── dashboard.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── registry/                    # UI component library — published as @survey-kit/registry
│   │   ├── registry/
│   │   │   ├── chat/
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── ChatBubble.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ChatReviewScreen.tsx
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   └── index.ts
│   │   │   ├── complex/
│   │   │   │   ├── emoji-slider/
│   │   │   │   ├── progress-bar/
│   │   │   │   ├── consent-gate/
│   │   │   │   ├── cookie-consent/
│   │   │   │   ├── score-card/
│   │   │   │   ├── filter-sidebar/
│   │   │   │   ├── panel/
│   │   │   │   └── blocked-page/
│   │   │   ├── layout/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── sidebar-menu/
│   │   │   │   └── dropdown/
│   │   │   └── sections/
│   │   │       └── section-page/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── template/                    # Example Vite + React application
│   │   ├── src/
│   │   │   ├── surveys/
│   │   │   │   ├── survey-1.json
│   │   │   │   ├── chat-survey.json
│   │   │   │   └── survey-types-demo.json
│   │   │   ├── layouts/
│   │   │   │   ├── layout.config.json
│   │   │   │   └── SurveyLayout.tsx
│   │   │   ├── sections/
│   │   │   │   ├── sections.config.json
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminLogin.tsx
│   │   │   │   ├── ParticipantLogin.tsx
│   │   │   │   └── ParticipantProfile.tsx
│   │   │   ├── dashboards/
│   │   │   │   └── dashboard.config.json
│   │   │   ├── consents/
│   │   │   │   └── consents.config.json
│   │   │   ├── cookies/
│   │   │   │   └── cookies.config.json
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   ├── apiConfig.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── respondentAuth.ts
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── tests/                   # Vitest + React Testing Library + axe
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── tailwind.config.js
│   │
│   └── backend/                     # Express-style API — deployed as AWS Lambda
│       ├── src/
│       │   ├── routes/
│       │   │   ├── surveys.ts
│       │   │   ├── admin.ts
│       │   │   └── participant.ts
│       │   ├── services/
│       │   │   ├── dynamodb.ts
│       │   │   ├── analytics.ts
│       │   │   └── participant.ts
│       │   ├── middleware/
│       │   │   └── auth.ts
│       │   ├── types/
│       │   │   ├── survey.ts
│       │   │   └── participant.ts
│       │   ├── app.ts
│       │   ├── server.ts
│       │   └── index.ts
│       ├── Dockerfile
│       ├── esbuild.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                            # MkDocs Material documentation site
│   ├── docs/
│   │   ├── getting-started/
│   │   ├── core/
│   │   ├── registry/
│   │   ├── api/
│   │   ├── backend.md
│   │   ├── guides/
│   │   └── index.md
│   └── mkdocs.yml
│
└── infra/
    └── terraform/                   # AWS infrastructure as code (S3, CloudFront, Lambda, DynamoDB, Cognito)
```
