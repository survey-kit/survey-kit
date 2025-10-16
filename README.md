# Survey-Kit

Mobile-first, accessible survey framework for engaging experiences.

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

## Developing

- **Requires:** Node.js 18+, npm 9+
- **Install:** `npm install`
- **Start example:** `npm run dev` in `packages/template`
- **Build all:** `npm run build --workspaces`
- **Lint/Format:** `npm run lint --workspaces`, `npm run format --workspaces`

## Publishing

- Run `npm run build --workspaces`
- Publish each package from its folder with `npm publish --access public`

## Principles

- Simple: No complex CLI tools
- Component-based & extensible
- Type-safe and robust
- Built on accessible primitives (Radix UI)
- Mobile-first, responsive

## Licence

MIT

## Resources

- [GitHub](https://github.com/survey-kit/survey-kit)
- [Example App](./packages/template)
- [Component Docs](./packages/registry)
- [Core API](./packages/core)
