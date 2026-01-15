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

## Overview

Survey-Kit boosts survey participation with:

- **Mobile-first** conversational UI
- **One question per page** for clarity and smooth flow
- **Accessible** (WCAG 2.2 AA) components
- **Developer-friendly** React + JSON/YAML config

## Monorepo

- `registry` – Pre-built, accessible React components (Button, Input, Card, Layout etc.), customisable with Tailwind CSS and Radix UI
- `core` – Survey renderer, state hooks, schema types, and validation
- `template` – Example application

## Main Features

- Full TypeScript support
- Mobile optimised, responsive design
- Built-in validation
- Progress tracking
- Easily customisable
- React 19, Vite, Tailwind CSS

## Configuration

Surveys defined in JSON or YAML. Components and styles extensible via React props or overrides.

## Principles

- Simple: No complex CLI tools
- Component-based & extensible
- Type-safe and robust
- Built on accessible primitives (Radix UI)
- Mobile-first, responsive

## Developing

- **Requires:** Node.js 18+, npm 9+
- **Install:** `npm install`
- **Start example:** `npm run dev` in `packages/template`
- **Build all:** `npm run build --workspaces`
- **Lint/Format:** `npm run lint --workspaces`, `npm run format --workspaces`

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

## Licence

MIT

## Resources

- [GitHub](https://github.com/survey-kit/survey-kit)
- [Example App](./packages/template)
- [Component Docs](./packages/registry)
- [Core API](./packages/core)
