# Core API Reference

The `@survey-kit/core` package provides the survey engine: renderers, state
management and types.

## Installation

```bash
npm install @survey-kit/core
```

---

## Hooks

### useSurvey

Main hook for managing survey state and navigation.

```typescript
import { useSurvey } from '@survey-kit/core'

const survey = useSurvey({ config, onSubmit })
```

**Parameters:**

| Param      | Type                | Description                       |
| ---------- | ------------------- | --------------------------------- |
| `config`   | `SurveyConfig`      | Survey configuration object       |
| `onSubmit` | `(answers) => void` | Callback when survey is submitted |

**Returns:**

```typescript
interface UseSurveyReturn {
  // State
  state: SurveyState
  currentPage: SurveyPage | undefined
  currentQuestion: SurveyQuestion | null
  currentStage: SurveyStage | null
  currentGroup: SurveyGroup | null

  // Navigation flags
  isFirstPage: boolean
  isLastPage: boolean
  isReviewPage: boolean

  // Progress
  progress: number
  allQuestionsAnswered: boolean
  canNavigateForward: boolean

  // Navigation methods
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToPage: (pageId: string) => boolean
  goToStage: (stageId: string) => void
  goToGroup: (groupId: string) => void
  submitSurvey: () => Promise<void>

  // Answer management
  setAnswer: (questionId: string, value: unknown) => void
  getAnswer: (questionId: string) => unknown
  validateQuestion: (questionId: string) => boolean
  validateCurrentPage: () => boolean

  // Stage/Group progress
  getStageProgress: (stageId: string) => number
  getGroupProgress: (groupId: string) => number
}
```

---

## Components

### SurveyRenderer

Form-based survey renderer displaying one page at a time.

```tsx
import { SurveyRenderer } from '@survey-kit/core'
;<SurveyRenderer
  config={surveyConfig}
  components={components}
  onSubmit={handleSubmit}
  layout="default"
/>
```

**Props:**

| Prop         | Type                | Required | Description                 |
| ------------ | ------------------- | -------- | --------------------------- |
| `config`     | `SurveyConfig`      | Yes      | Survey configuration        |
| `components` | `object`            | Yes      | UI components from registry |
| `onSubmit`   | `(answers) => void` | Yes      | Submission callback         |
| `layout`     | `string`            | No       | Layout variant              |

### ChatSurveyRenderer

Chat-style survey renderer with messaging UI.

```tsx
import { ChatSurveyRenderer } from '@survey-kit/core'
;<ChatSurveyRenderer
  config={surveyConfig}
  components={chatComponents}
  onSubmit={handleSubmit}
  typingDelay={{ min: 500, max: 1000 }}
/>
```

**Props:**

| Prop          | Type                | Required | Description                 |
| ------------- | ------------------- | -------- | --------------------------- |
| `config`      | `SurveyConfig`      | Yes      | Survey configuration        |
| `components`  | `object`            | Yes      | Chat UI components          |
| `onSubmit`    | `(answers) => void` | Yes      | Submission callback         |
| `typingDelay` | `{ min, max }`      | No       | Typing indicator delay (ms) |

### LayoutRenderer

Wraps `SurveyRenderer` with header, sidebar and footer.

```tsx
import { LayoutRenderer, SurveyRenderer } from '@survey-kit/core'
;<LayoutRenderer
  layoutConfig={layoutConfig}
  surveyConfig={surveyConfig}
  components={components}
  onAction={handleAction}
>
  <SurveyRenderer
    config={surveyConfig}
    components={components}
    onSubmit={handleSubmit}
  />
</LayoutRenderer>
```

---

## Types

### SurveyConfig

Top-level survey configuration.

```typescript
interface SurveyConfig {
  id: string
  title: string
  description?: string
  stages: SurveyStage[]
  navigation?: NavigationConfig
  progress?: ProgressConfig
}
```

### SurveyStage

Top-level section of a survey.

```typescript
interface SurveyStage {
  id: string
  title: string
  description?: string
  icon?: string
  groups: SurveyGroup[]
  conditional?: ConditionalLogic
}
```

### SurveyGroup

Organises pages within a stage.

```typescript
interface SurveyGroup {
  id: string
  title: string
  description?: string
  pages: SurveyPage[]
  conditional?: ConditionalLogic
}
```

### SurveyPage

Container for questions (one page = one screen).

```typescript
interface SurveyPage {
  id: string
  title?: string
  description?: string
  questions: SurveyQuestion[]
  conditional?: ConditionalLogic
  nextPageId?: string
}
```

### SurveyQuestion

Individual form field.

```typescript
interface SurveyQuestion {
  id: string
  type: QuestionType
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  requiredToNavigate?: boolean
  options?: QuestionOption[]
  validation?: ValidationRule[]
  conditional?: ConditionalLogic
  emojiSlider?: EmojiSliderConfig
}
```

### QuestionType

```typescript
type QuestionType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'emoji-slider'
```

---

## Utilities

### Conditional Logic

```typescript
import {
  shouldShowQuestion,
  shouldShowPage,
  shouldShowGroup,
  shouldShowStage,
  evaluateConditions,
} from '@survey-kit/core'

// Check if a question should be visible
const visible = shouldShowQuestion(question, answers)
```

### Configuration Helpers

```typescript
import {
  normaliseSurveyConfig,
  getAllPages,
  findPageById,
  getPageLocation,
} from '@survey-kit/core'

// Get all pages from a config
const pages = getAllPages(config)
```
