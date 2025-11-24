/**
 * Supported question types in the survey
 */
export type QuestionType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'number'
  | 'email'
  | 'date'

/**
 * Comparison operator for conditional logic
 */
export type ComparisonOperator = 'equals' | 'notEquals'

/**
 * Logic operator for combining multiple conditions
 */
export type LogicOperator = 'AND' | 'OR'

/**
 * Single condition for conditional logic
 */
export interface Condition {
  operator: ComparisonOperator
  questionId: string
  value: string | number | boolean
}

/**
 * Conditional logic configuration
 */
export interface ConditionalLogic {
  conditions: Condition[]
  logic?: LogicOperator // Defaults to 'AND' if not specified
}

/**
 * Validation rule for a question
 */
export interface ValidationRule {
  type:
    | 'required'
    | 'min'
    | 'max'
    | 'pattern'
    | 'custom'
    | 'crossQuestion'
    | 'dateRange'
    | 'numberRange'
  value?: string | number
  message?: string
  // For cross-question validation
  questionId?: string
  operator?:
    | ComparisonOperator
    | 'greaterThan'
    | 'lessThan'
    | 'greaterThanOrEqual'
    | 'lessThanOrEqual'
}

/**
 * Option for select, checkbox, or radio questions
 */
export interface QuestionOption {
  label: string
  value: string
  description?: string
}

/**
 * Page completion status
 */
export type PageCompletionStatus = 'complete' | 'partial' | 'empty'

/**
 * A single question in the survey
 */
export interface SurveyQuestion {
  id: string
  type: QuestionType
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  requiredToNavigate?: boolean
  validation?: ValidationRule[]
  options?: QuestionOption[]
  defaultValue?: string | number | boolean
  conditional?: ConditionalLogic
  skipLogic?: {
    // Conditional navigation - jump to specific page based on answer
    conditions: Condition[]
    logic?: LogicOperator
    nextPageId: string
  }
}

/**
 * Page configuration - groups questions together
 */
export interface SurveyPage {
  id: string
  title?: string
  description?: string
  icon?: string
  questions: SurveyQuestion[]
  conditional?: ConditionalLogic // Page visibility based on answers
  nextPageId?: string // Dynamic navigation - override default sequential navigation
}

/**
 * Navigation configuration - controls how users can navigate through the survey
 */
export interface NavigationConfig {
  stageOrder?: 'sequential' | 'free' // Must complete stage 1 before stage 2, or free navigation
  groupOrder?: 'sequential' | 'free' // Within stages
  pageOrder?: 'sequential' | 'free' // Within groups (defaults to sequential)
}

/**
 * Progress display configuration
 */
export interface ProgressConfig {
  showOverall?: boolean // Show overall progress bar
  showPerStage?: boolean // Show progress for current stage
  showPerGroup?: boolean // Show progress for current group
  showPerPage?: boolean // Show progress for current page
  location?: ('header' | 'page' | 'sidebar')[] // Where to display progress
}

/**
 * Group configuration - organizes pages within a stage
 */
export interface SurveyGroup {
  id: string
  title: string
  description?: string
  icon?: string
  pages: SurveyPage[]
  conditional?: ConditionalLogic // Group visibility based on answers
}

/**
 * Stage configuration - top-level sections of the survey
 */
export interface SurveyStage {
  id: string
  title: string
  description?: string
  icon?: string
  groups: SurveyGroup[]
  conditional?: ConditionalLogic // Stage visibility based on answers
}

/**
 * Complete survey configuration
 */
export interface SurveyConfig {
  id: string
  title: string
  description?: string
  stages: SurveyStage[] // Required: hierarchical stages → groups → pages
  progressBar?: boolean // Legacy: simple progress bar (deprecated, use progress config)
  showQuestionNumbers?: boolean
  navigation?: NavigationConfig // Configurable navigation rules
  progress?: ProgressConfig // Configurable progress display
}

/**
 * Survey submission data
 */
export interface SurveySubmission {
  surveyId: string
  answers: Record<string, string | number | boolean | string[]>
  timestamp?: string
  metadata?: Record<string, unknown>
}

/**
 * State for a single question's answer
 */
export interface QuestionAnswer {
  questionId: string
  value: string | number | boolean | string[] | null
  isValid?: boolean
  errors?: string[]
}

/**
 * Complete survey state
 */
export interface SurveyState {
  currentPageIndex: number
  answers: Record<string, QuestionAnswer>
  isSubmitted: boolean
  errors: Record<string, string[]>
}
