# @survey-kit/core

Core survey framework for rendering surveys from JSON/YAML configuration.

## Overview

The core package provides the essential logic and components for building surveys:

- **Survey renderer** – Renders surveys from configuration
- **Layout renderer** – Handles page layout, sidebar, and navigation
- **State management** – `useSurvey` hook for survey state and navigation
- **Type definitions** – TypeScript types for survey and layout configuration
- **Validation** – Built-in validation with cross-question support
- **Conditional logic** – Show/hide questions and pages based on answers
- **Navigation** – Configurable navigation rules (sequential or free-form)

## Features

- Full TypeScript support
- Conditional logic and skip logic
- Advanced validation (including cross-question validation)
- Hierarchical survey structure (stages → groups → pages → questions)
- Progress tracking at multiple levels
- **Multi-Survey Support** – Configure multiple distinct surveys with shared routing
- **Section Layouts** – Configure headers and footers for individual section pages
- Mobile-first, accessible design

## Installation

```bash
npm install @survey-kit/core
```

## Usage

```tsx
import { SurveyRenderer, useSurvey } from '@survey-kit/core'
import type { SurveyConfig } from '@survey-kit/core'

const config: SurveyConfig = {
  id: 'my-survey',
  title: 'My Survey',
  stages: [
    // ... survey configuration
  ],
}

function MySurvey() {
  return (
    <SurveyRenderer
      config={config}
      components={components}
      onSubmit={handleSubmit}
    />
  )
}
```

## Key Exports

- `SurveyRenderer` – Main component for rendering surveys
- `LayoutRenderer` – Component for rendering survey layout
- `useSurvey` – Hook for survey state management
- Type definitions (`SurveyConfig`, `SurveyPage`, `SurveyQuestion`, `SectionConfig`, `SectionLayout`, etc.)
- Conditional logic utilities
- Validation utilities

## Requirements

- React 19+
- `@survey-kit/registry` (peer dependency)

## Licence

MIT
