# Core API Reference

The `@survey-kit/core` package provides the fundamental building blocks for creating and managing surveys.

## Installation

```bash
npm install @survey-kit/core
```

## Hooks

### useSurvey

The main hook for initialising and managing survey state.

```typescript
import { useSurvey } from '@survey-kit/core'

const survey = useSurvey(config)
```

**Parameters:**

- `config` (SurveyConfig): Survey configuration object

**Returns:**

- Survey instance with state and methods

**Example:**

```typescript
const survey = useSurvey({
  id: 'my-survey',
  title: 'Customer Feedback',
  questions: [...]
});
```

## Components

### SurveyRenderer

Main component for rendering the survey interface.

```typescript
import { SurveyRenderer } from '@survey-kit/core';

<SurveyRenderer
  survey={survey}
  onComplete={handleComplete}
  onProgress={handleProgress}
/>
```

**Props:**

| Prop         | Type                         | Required | Description                       |
| ------------ | ---------------------------- | -------- | --------------------------------- |
| `survey`     | Survey                       | Yes      | Survey instance from `useSurvey`  |
| `onComplete` | `(data: SurveyData) => void` | Yes      | Callback when survey is completed |
| `onProgress` | `(progress: number) => void` | No       | Callback for progress updates     |

## Types

### SurveyConfig

The main configuration interface for defining surveys.

```typescript
interface SurveyConfig {
  id: string
  title: string
  description?: string
  questions: Question[]
  settings?: SurveySettings
}
```

### Question

Interface for individual questions.

```typescript
interface Question {
  id: string
  type: QuestionType
  question: string
  required?: boolean
  validation?: ValidationRule
  options?: Option[]
  placeholder?: string
}
```

### QuestionType

Supported question types:

```typescript
type QuestionType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'date'
```

### SurveySettings

Configuration for survey behavior:

```typescript
interface SurveySettings {
  showProgress?: boolean
  allowBack?: boolean
  submitButtonText?: string
  theme?: string
  mobileOptimized?: boolean
}
```

## Validation

_Detailed validation API documentation coming soon._

## State Management

_Detailed state management documentation coming soon._

## Advanced Usage

### Custom Question Types

_Documentation for creating custom question types coming soon._

### Persistence

_Documentation for saving and restoring survey progress coming soon._

## Examples

For complete working examples, see the [template package](https://github.com/survey-kit/survey-kit/tree/main/packages/template).

## Migration Guide

_Migration guide for version updates coming soon._

## API Changelog

_API changes and deprecations will be documented here._
