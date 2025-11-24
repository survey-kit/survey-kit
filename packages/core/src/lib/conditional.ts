import type {
  SurveyQuestion,
  SurveyPage,
  SurveyStage,
  SurveyGroup,
  Condition,
} from '../types/survey'

/**
 * Get all answers as a flat record for easy lookup
 */
type AnswersRecord = Record<string, unknown>

/**
 * Evaluate a single condition against answers
 * @param condition The condition to evaluate
 * @param answers All survey answers
 * @returns true if condition is met, false otherwise
 */
export function evaluateCondition(
  condition: Condition,
  answers: AnswersRecord
): boolean {
  const answerValue = answers[condition.questionId]

  // Handle array values (for checkbox questions)
  if (Array.isArray(answerValue)) {
    if (condition.operator === 'equals') {
      return answerValue.includes(condition.value)
    } else if (condition.operator === 'notEquals') {
      return !answerValue.includes(condition.value)
    }
  }

  // Handle primitive values
  switch (condition.operator) {
    case 'equals':
      return answerValue === condition.value
    case 'notEquals':
      return answerValue !== condition.value
    default:
      return false
  }
}

/**
 * Evaluate multiple conditions with AND/OR logic
 * @param conditions Array of conditions to evaluate
 * @param answers All survey answers
 * @param logic Logic operator ('AND' or 'OR'), defaults to 'AND'
 * @returns true if conditions are met according to logic, false otherwise
 */
export function evaluateConditions(
  conditions: Condition[],
  answers: AnswersRecord,
  logic: 'AND' | 'OR' = 'AND'
): boolean {
  if (conditions.length === 0) return true

  if (logic === 'AND') {
    // All conditions must be true
    return conditions.every((condition) =>
      evaluateCondition(condition, answers)
    )
  } else {
    // At least one condition must be true
    return conditions.some((condition) => evaluateCondition(condition, answers))
  }
}

/**
 * Determine if a question should be shown based on conditional logic
 * @param question The question to check
 * @param answers All survey answers
 * @returns true if question should be visible, false otherwise
 */
export function shouldShowQuestion(
  question: SurveyQuestion,
  answers: AnswersRecord
): boolean {
  // If no conditional logic, always show
  if (!question.conditional) return true

  return evaluateConditions(
    question.conditional.conditions,
    answers,
    question.conditional.logic || 'AND'
  )
}

/**
 * Determine if a page should be shown based on conditional logic
 * @param page The page to check
 * @param answers All survey answers
 * @returns true if page should be visible, false otherwise
 */
export function shouldShowPage(
  page: SurveyPage,
  answers: AnswersRecord
): boolean {
  // If no conditional logic, always show
  if (!page.conditional) return true

  return evaluateConditions(
    page.conditional.conditions,
    answers,
    page.conditional.logic || 'AND'
  )
}

/**
 * Determine if a group should be shown based on conditional logic
 * @param group The group to check
 * @param answers All survey answers
 * @returns true if group should be visible, false otherwise
 */
export function shouldShowGroup(
  group: SurveyGroup,
  answers: AnswersRecord
): boolean {
  // If no conditional logic, always show
  if (!group.conditional) return true

  return evaluateConditions(
    group.conditional.conditions,
    answers,
    group.conditional.logic || 'AND'
  )
}

/**
 * Determine if a stage should be shown based on conditional logic
 * @param stage The stage to check
 * @param answers All survey answers
 * @returns true if stage should be visible, false otherwise
 */
export function shouldShowStage(
  stage: SurveyStage,
  answers: AnswersRecord
): boolean {
  // If no conditional logic, always show
  if (!stage.conditional) return true

  return evaluateConditions(
    stage.conditional.conditions,
    answers,
    stage.conditional.logic || 'AND'
  )
}
