# Core

The `@survey-kit/core` package provides the survey engine: renderers, hooks, shared logic and TypeScript types.

## What core provides

- `SurveyRenderer` for traditional form-based survey pages
- `ChatSurveyRenderer` for conversational chat-style surveys
- `LayoutRenderer` for composing survey content with layout wrappers
- `useSurvey` for state, validation, progress and navigation
- Shared utility functions for conditional visibility and configuration access

## Renderer options

- Use `SurveyRenderer` for structured, page-based survey flows
- Use `ChatSurveyRenderer` for mobile-first, conversational journeys
- Pair either renderer with the same survey configuration format

## useSurvey hook summary

`useSurvey` manages:

- Answer state and persistence
- Validation and completion checks
- Navigation between visible pages, groups and stages
- Progress calculations at page, group, stage and survey levels

## Further reading

- [Core API](../api/core.md)
- [Rendering Modes](../guides/rendering-modes.md)
