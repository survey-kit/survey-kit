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
 * Validation rule for a question
 */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: string | number
  message?: string
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
 * A single question in the survey
 */
export interface SurveyQuestion {
  id: string
  type: QuestionType
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  validation?: ValidationRule[]
  options?: QuestionOption[]
  defaultValue?: string | number | boolean
  conditional?: {
    questionId: string
    value: string | number | boolean
  }
}

/**
 * Page configuration - groups questions together
 */
export interface SurveyPage {
  id: string
  title?: string
  description?: string
  questions: SurveyQuestion[]
}

/**
 * Complete survey configuration
 */
export interface SurveyConfig {
  id: string
  title: string
  description?: string
  pages: SurveyPage[]
  progressBar?: boolean
  showQuestionNumbers?: boolean
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
