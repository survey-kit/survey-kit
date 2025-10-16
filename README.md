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

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with
the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention
`category(scope or module): message` in your commit message while using one of
the following categories:

- `feat / feature`: all changes that introduce completely new code or new
  features
- `fix`: changes that fix a bug (ideally you will additionally reference an
  issue if present)
- `refactor`: any code-related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for
  usage of a library or CLI usage)
- `build`: all changes regarding the build of the software, changes to
  dependencies or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing
  ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e.
  GitHub Actions, CI system)
- `chore`: all changes to the repository that do not fit into any of the above
  categories

  e.g. `feat(components): add new prop to the avatar component`

If you are interested in the detailed specification you can visit
https://www.conventionalcommits.org/ or check out the
[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## Publishing

- Run `npm run build --workspaces`
- Publish each package from its folder with `npm publish --access public`

## Licence

MIT

## Resources

- [GitHub](https://github.com/survey-kit/survey-kit)
- [Example App](./packages/template)
- [Component Docs](./packages/registry)
- [Core API](./packages/core)
