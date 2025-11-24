// Export types
export type {
  SurveyConfig,
  SurveyPage,
  SurveyQuestion,
  SurveySubmission,
  SurveyState,
  QuestionAnswer,
  QuestionType,
  ValidationRule,
  QuestionOption,
  PageCompletionStatus,
  Condition,
  ConditionalLogic,
  ComparisonOperator,
  LogicOperator,
} from './types/survey'

export type {
  LayoutConfig,
  HeaderConfig,
  FooterConfig,
  MainContentConfig,
} from './types/layout'

// Export components
export { SurveyRenderer } from './components/SurveyRenderer'
export { LayoutRenderer } from './components/LayoutRenderer'

// Export hooks
export { useSurvey } from './hooks/useSurvey'

// Export conditional logic utilities
export {
  evaluateCondition,
  evaluateConditions,
  shouldShowQuestion,
  shouldShowPage,
} from './lib/conditional'
