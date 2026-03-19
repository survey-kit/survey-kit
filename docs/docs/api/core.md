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

Main hook for managing survey state and navigation. Internally organised as
a directory module with co-located helper files for testability and clarity.

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

  // Progress (percentage values 0–100)
  progress: number // within current group
  stageProgress: number // across visible stages
  groupProgress: number // within current stage
  overallProgress: number // across all visible pages

  // Navigation methods
  nextPage: () => void
  prevPage: () => void
  goToStage: (stageId: string) => void
  submitSurvey: () => Promise<void>

  // Answer management
  setAnswer: (questionId: string, value: unknown) => void
  getAnswerValue: (questionId: string) => unknown
  validateQuestion: (question: SurveyQuestion) => string[]

  // Completion checks
  isPageComplete: (pageId: string) => boolean
  isGroupComplete: (groupId: string) => boolean
  isStageComplete: (stageId: string) => boolean
  getPageCompletionStatus: (pageId: string) => PageCompletionStatus

  // Visibility helpers
  getLatestAccessiblePageIndex: () => number
  getVisiblePages: () => SurveyPage[]
  getVisibleQuestions: (page: SurveyPage) => SurveyQuestion[]
  getVisibleStages: () => SurveyStage[]
  getVisibleGroups: (stage: SurveyStage) => SurveyGroup[]

  // Access control
  canNavigateToStage: (stageId: string) => boolean
  canNavigateToGroup: (groupId: string) => boolean

  // Per-entity progress (completion-based)
  getStageProgress: (stageId: string) => number
  getGroupProgress: (groupId: string) => number
}
```

#### Hook Architecture

The `useSurvey` hook follows a **directory module** pattern. The main entry
point (`index.ts`) contains only React orchestration — `useState`, `useEffect`,
`useMemo`, and `useCallback` calls. All pure logic is delegated to co-located
helper files:

```
hooks/useSurvey/
├── index.ts          # Orchestration — wires React primitives to helpers
├── state.ts          # Initial state, localStorage persistence, URL sync
├── visibility.ts     # Conditional filtering of stages/groups/pages/questions
├── navigation.ts     # Next-page resolution, skip logic, access checks
├── completion.ts     # Page/group/stage completeness checks
└── progress.ts       # Position-based and completion-based progress
```

| Module          | Responsibility                                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state.ts`      | `getInitialState`, `saveToStorage`, `updateUrlWithPage`, event dispatching, `flattenAnswers`                                                                            |
| `visibility.ts` | `getVisibleStages`, `getVisibleGroupsForStage`, `getVisiblePagesForGroup`, `getVisibleQuestionsForPage`, `getAllVisiblePages`                                           |
| `navigation.ts` | `resolveNextPage`, `resolveGoToStagePageIndex`, `checkCanNavigateToStage`, `checkCanNavigateToGroup`, `computeLatestAccessiblePageIndex`                                |
| `completion.ts` | `checkPageComplete`, `checkGroupComplete`, `checkStageComplete`, `computePageCompletionStatus`                                                                          |
| `progress.ts`   | `calculatePageProgress`, `calculateGroupProgress`, `calculateStageProgress`, `calculateOverallProgress`, `getStageProgressByCompletion`, `getGroupProgressByCompletion` |

Every helper is a **pure function** (no React dependency) that can be
unit-tested in isolation. The hook simply pipes state and derived values
through these helpers.

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

### DashboardRenderer

Renderer for administrative dashboards, supporting various chart types.

```tsx
import { DashboardRenderer } from '@survey-kit/core'
import {
  TrendLineChart,
  DropoffBarChart,
  Card,
  Heading,
} from '@survey-kit/registry'

const components = {
  TrendLineChart,
  DropoffBarChart,
  Card,
  Heading,
}

;<DashboardRenderer
  config={dashboardConfig}
  data={analyticsData}
  components={components}
/>
```

**Props:**

| Prop         | Type                  | Required | Description                    |
| ------------ | --------------------- | -------- | ------------------------------ |
| `config`     | `DashboardConfig`     | Yes      | Dashboard layout configuration |
| `data`       | `Record<string, any>` | Yes      | Analytics data to display      |
| `components` | `object`              | Yes      | Chart components from registry |

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

### DashboardConfig

Configuration for the administrative dashboard.

```typescript
interface DashboardConfig {
  id: string
  title: string
  groups: DashboardGroup[]
}
```

### DashboardFilter

Represents an active filter applied to the dashboard.

```typescript
interface DashboardFilter {
  questionId: string
  value: string | string[]
}
```

### DashboardFilterConfig

Configuration for a filterable dimension on the dashboard.

```typescript
interface DashboardFilterConfig {
  id: string
  label: string
  type: 'select' | 'multiselect'
  options: { label: string; value: string }[]
}
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

// Extract filterable questions from a survey config
const filters = extractFilterableQuestions(surveyConfig)
```
