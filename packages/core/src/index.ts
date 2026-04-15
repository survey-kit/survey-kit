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
  DashboardSurveyFilterConfig,
  DashboardSurveyFilterOption,
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

export type {
  ParticipantBadgeDefinition,
  ParticipantBadgeState,
  ParticipantProfileSummary,
} from './types/gamification'

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
  getQuestionLabelMap,
} from './lib/configUtils'

export { setDocumentFavicon } from './lib/documentFavicon'

export {
  DEFAULT_BADGE_DEFINITIONS,
  computeBadgeStates,
  computeNextStreak,
  streakAriaLabel,
  toProfileSummary,
  utcTodayString,
} from './lib/gamification'
