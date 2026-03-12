// Export types
export type {
  SurveyConfig,
  SurveyPage,
  SurveyQuestion,
  SurveyStage,
  SurveyGroup,
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
  NavigationConfig,
  ProgressConfig,
} from './types/survey'

export type {
  DashboardConfig,
  DashboardGroup,
  ChartConfig,
  DashboardFilter,
  DashboardFilterConfig,
} from './types/dashboard'

export type {
  LayoutConfig,
  HeaderConfig,
  FooterConfig,
  MainContentConfig,
} from './types/layout'

export type {
  SectionConfig,
  SectionsConfig,
  SectionButton,
  SectionInput,
  SectionImage,
  SectionLayout,
} from './types/section'

// Export components
export { SurveyRenderer } from './components/SurveyRenderer'
export { LayoutRenderer } from './components/LayoutRenderer'
export {
  ChatSurveyRenderer,
  type ChatSurveyRendererProps,
  type TypingDelayConfig,
} from './components/ChatSurveyRenderer'
export { DashboardRenderer } from './components/DashboardRenderer'

// Export hooks
export { useSurvey } from './hooks/useSurvey'

// Export conditional logic utilities
export {
  evaluateCondition,
  evaluateConditions,
  shouldShowQuestion,
  shouldShowPage,
  shouldShowGroup,
  shouldShowStage,
} from './lib/conditional'

// Export helper utilities
export {
  normaliseSurveyConfig,
  getAllPages,
  findPageById,
  getPageLocation,
  extractFilterableQuestions,
} from './lib/configUtils'
