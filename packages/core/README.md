# @survey-kit/core

Core survey engine for rendering surveys from JSON/YAML configuration.

## Overview

The core package provides the essential logic and components for building surveys:

- **Survey renderers** – `SurveyRenderer` (form-based) and `ChatSurveyRenderer` (conversational)
- **Layout renderer** – `LayoutRenderer` handles page layout, sidebar, and navigation
- **State management** – `useSurvey` hook for survey state, navigation, validation, and progress
- **Type definitions** – TypeScript types for survey and layout configuration
- **Validation** – Built-in validation with cross-question support
- **Conditional logic** – Show/hide questions and pages based on answers
- **Navigation** – Configurable navigation rules (sequential or free-form)

## Features

- Full TypeScript support
- Conditional logic and skip logic (`shouldShowQuestion`, `shouldShowPage`, etc.)
- Advanced validation (including cross-question validation)
- Hierarchical survey structure (stages → groups → pages → questions)
- Progress tracking at multiple levels (page, group, stage, overall)
- Answer persistence via localStorage
- **Multi-Survey Support** – Configure multiple distinct surveys with shared routing
- **Section Layouts** – Configure headers and footers for individual section pages
- Mobile-first, accessible design

## Installation

```bash
npm install @survey-kit/core
```

## Usage

### Form-Based Survey

```tsx
import { SurveyRenderer, LayoutRenderer } from '@survey-kit/core'
import type { SurveyConfig } from '@survey-kit/core'

const config: SurveyConfig = {
  id: 'my-survey',
  title: 'My Survey',
  stages: [
    {
      id: 'stage-1',
      groups: [
        {
          id: 'group-1',
          pages: [
            {
              id: 'page-1',
              questions: [
                {
                  id: 'q1',
                  type: 'text',
                  label: 'What is your name?',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

function MySurvey() {
  return (
    <LayoutRenderer
      layoutConfig={layout}
      surveyConfig={config}
      components={components}
    >
      <SurveyRenderer
        config={config}
        components={components}
        onSubmit={handleSubmit}
      />
    </LayoutRenderer>
  )
}
```

### Chat-Based Survey

```tsx
import { ChatSurveyRenderer } from '@survey-kit/core'

function MyChatSurvey() {
  return (
    <ChatSurveyRenderer
      config={config}
      components={chatComponents}
      onSubmit={handleSubmit}
      typingDelay={{ min: 600, max: 1200 }}
    />
  )
}
```

## Survey Configuration Hierarchy

```
Survey
├── Stages (optional navigation sections)
│   ├── Groups (logical groupings)
│   │   ├── Pages (one page = one screen)
│   │   │   └── Questions (individual form fields)
```

### Question Types

- `text` – Single-line text input
- `textarea` – Multi-line text input
- `radio` – Single select from options
- `checkbox` – Multi-select from options
- `select` – Dropdown selection
- `emoji-slider` – Visual rating scale with emojis

### Key Question Properties

```json
{
  "id": "unique-id",
  "type": "text|radio|checkbox|select|emoji-slider",
  "label": "Question text",
  "description": "Optional helper text",
  "placeholder": "Input placeholder",
  "options": [{ "value": "x", "label": "X" }],
  "required": true,
  "requiredToNavigate": true,
  "showWhen": { "questionId": "other-q", "equals": "value" }
}
```

## Core APIs

### `useSurvey` Hook

Manages survey state including:

- **Answers** – `{ [questionId]: { value, touched, valid } }`
- **Navigation** – Current page, stage, group tracking
- **Validation** – Per-question and page-level validation
- **Progress** – Completion percentage calculation (`progress`, `stageProgress`, `groupProgress`, `overallProgress`)
- **Persistence** – localStorage for answer recovery

```tsx
const {
  state,
  currentPage,
  progress,
  setAnswer,
  nextPage,
  prevPage,
  submitSurvey,
} = useSurvey({ config, onSubmit })
```

### Components

- **`SurveyRenderer`** – Traditional form-based survey renderer
- **`ChatSurveyRenderer`** – Chat/messaging-style survey renderer
- **`LayoutRenderer`** – Wrapper component for survey layout (header, footer, sidebar)

### Conditional Logic Utilities

- `shouldShowQuestion` – Determine if a question should be displayed
- `shouldShowPage` – Determine if a page should be displayed
- `shouldShowGroup` – Determine if a group should be displayed
- `shouldShowStage` – Determine if a stage should be displayed
- `evaluateCondition` – Evaluate a single condition
- `evaluateConditions` – Evaluate multiple conditions with logic operators

### Validation Utilities

- Built-in validation rules (required, min/max length, pattern matching)
- Cross-question validation support
- Custom validation functions

### Config Utilities

- `normaliseSurveyConfig` – Normalise survey configuration
- `getAllPages` – Get all pages from a survey config
- `findPageById` – Find a page by ID
- `getPageLocation` – Get the location of a page (stage, group, page)

## Key Exports

### Components

- `SurveyRenderer` – Form-based survey renderer
- `ChatSurveyRenderer` – Chat-based survey renderer
- `LayoutRenderer` – Layout wrapper component

### Hooks

- `useSurvey` – Survey state management hook

### Types

- `SurveyConfig`, `SurveyPage`, `SurveyQuestion`, `SurveyStage`, `SurveyGroup`
- `SurveyState`, `QuestionAnswer`, `QuestionType`
- `LayoutConfig`, `SectionConfig`, `SectionLayout`
- `ValidationRule`, `Condition`, `ConditionalLogic`

### Utilities

- Conditional logic: `shouldShowQuestion`, `shouldShowPage`, `shouldShowGroup`, `shouldShowStage`, `evaluateCondition`, `evaluateConditions`
- Config utilities: `normaliseSurveyConfig`, `getAllPages`, `findPageById`, `getPageLocation`

## Requirements

- React 19+
- `@survey-kit/registry` (peer dependency)

## Licence

MIT
