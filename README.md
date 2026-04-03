# Survey-Kit

Mobile-first, accessible survey framework for engaging experiences.

## Important links

- [Survey-Kit Website](https://survey-kit.com)
- Examples:
  - [Template (Vercel)](https://template.survey-kit.com) using [Vercel](https://vercel.com)
  - [Template (AWS)](https://template.survey-kit.com) using [/infra/terraform](./infra/terraform)
- NPM Packages:
  - [@survey-kit/core](https://www.npmjs.com/package/@survey-kit/core)
  - [@survey-kit/registry](https://www.npmjs.com/package/@survey-kit/registry)

See the full documentation at [docs.survey-kit.com](https://docs.survey-kit.com/).

## Overview

Survey-Kit boosts survey participation with:

- **Mobile-first** conversational UI
- **One question per page** for clarity and smooth flow
- **Accessible** (WCAG 2.2 AA) components
- **Developer-friendly** React + JSON config

## Monorepo

- **`packages/registry`** – Pre-built, accessible React components (Button, Input, Card, Layout etc.), customisable with Tailwind CSS and Radix UI
- **`packages/core`** – Survey renderer, state hooks, schema types, and validation
- **`packages/template`** – Example Vite + React app (surveys, admin dashboard, Cognito)
- **`packages/backend`** – Express-style API for responses and admin analytics (DynamoDB; deployed as Lambda). Not an npm workspace root package: install with `npm install` inside this folder when working on the full stack

Source for published docs lives under [`docs/docs/`](./docs/docs/) (Markdown). Terraform and related notes are under [`infra/`](./infra/).

## Main Features

- Full TypeScript support
- Mobile optimised, responsive design
- **Admin Dashboard** – Integrated analytics with dynamic cross-tabulation filtering
- **Secure Authentication** – Built-in support for AWS Cognito administrative login
- **Infrastructure as Code** – Terraform modules for serverless AWS deployment (S3, CloudFront, Lambda, DynamoDB, Cognito)
- Built-in validation and conditional logic
- Progress tracking and answer persistence
- React 19, Vite, Tailwind CSS 4

## Configuration

Surveys defined in JSON. Components and styles extensible via React props or overrides.

## Principles

- Simple: No complex CLI tools
- Component-based & extensible
- Type-safe and robust
- Built on accessible primitives (Radix UI)
- Mobile-first, responsive

## Developing

- **Requires:** Node.js 18+, npm 9+ (see template tests on newer Node if you hit `localStorage` quirks in Vitest)
- **Install workspaces:** `npm install` at repo root (covers `registry`, `core`, `template`)
- **Frontend only:** `cd packages/template && npm run dev`
- **Template + backend:** from repo root, install backend deps once (`cd packages/backend && npm install`), then `make dev` (runs template and [`packages/backend`](./packages/backend) together)
- **Build all workspace packages:** `npm run build --workspaces`
- **Lint / format:** `npm run lint --workspaces`, `npm run format --workspaces`
- **Make targets:** `make help` – includes `dev`, `dev-backend`, `docs-build`, `docs-serve`, and doc formatting checks

## Code Quality

This section outlines quality when writing code.

### Formatting

These commands will format the code in all packages.

- `npm run format --workspaces`
- `npm run format:check --workspaces`

### Linting

These commands will run linting over all packages.

- `npm run lint --workspaces`
- `npm run lint:fix --workspaces`

### Pre-commit Hooks

These commands will install the pre-commit hooks.

- `brew install pre-commit`
- `pre-commit install`
- Optional: `pre-commit run --all-files`

Now when you commit, the code will be linted and formatted.

## Testing

Automated tests live in **`packages/template`** (Vitest, React Testing Library, Testing Library User Event, axe).

From the **repo root:**

- `npm test` – run the suite once
- `npm run test:watch` – watch mode
- `npm run test:coverage` – coverage (v8); see that package’s `vitest.config` for include/exclude rules

Core and registry packages do not define a root-level test script today; behavioural checks for the framework surface through the template suite.

## Documentation

- **Published site:** [docs.survey-kit.com](https://docs.survey-kit.com/) – guides, API references (`@survey-kit/core`, `@survey-kit/registry`), backend HTTP overview
- **Source:** Markdown in [`docs/docs/`](./docs/docs/), configured by [`docs/mkdocs.yml`](./docs/mkdocs.yml) (MkDocs Material)
- **Local preview:** install [MkDocs](https://www.mkdocs.org/) and **mkdocs-material** (e.g. `pip install mkdocs mkdocs-material`), then from repo root `make docs-serve`, or `cd docs && mkdocs serve`
- **Build:** `make docs-build` (strict)
- **Markdown format:** `make docs-format` / `make docs-format-check` (Prettier on `docs/**/*.md`)

## Backend API

The [`packages/backend`](./packages/backend) service implements submission storage, listing, and **`GET /api/admin/analytics`** (optional `surveyId`, question filters) used by the template admin dashboard. See [**`packages/backend/README.md`**](./packages/backend/README.md) for endpoints and env vars, and [**`docs/docs/backend.md`**](./docs/docs/backend.md) for a concise HTTP reference aligned with the template’s `VITE_API_URL`.

## Infrastructure

Terraform and deployment notes for the **static template** and related AWS resources are under [**`infra/terraform/`**](./infra/terraform). Start with [**`infra/terraform/README.md`**](./infra/terraform/README.md) (S3, CloudFront, variables, state layout). Backend tables, Lambda, and Cognito modules are described alongside the `.tf` files in that tree and in the docs **Infrastructure** guide.

## Licence

MIT

## Resources

- [GitHub](https://github.com/survey-kit/survey-kit)
- [Documentation (site)](https://docs.survey-kit.com/)
- **Internal links**
  - [Core](./packages/core)
  - [Registry](./packages/registry)
  - [Template](./packages/template)
  - [Backend](./packages/backend)
  - [Docs source](./docs/docs/)
  - [Infrastructure (Terraform)](./infra/terraform)
  - [Changelog](./CHANGELOG.md)
