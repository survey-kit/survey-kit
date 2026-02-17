import { shouldShowQuestion } from '../../lib/conditional'
import { validateQuestion as validateQuestionUtil } from '../../lib/validation'
import { findPageById } from '../../lib/configUtils'
import { getVisibleGroupsForStage, getVisiblePagesForGroup } from './visibility'
import type {
  SurveyConfig,
  QuestionAnswer,
  PageCompletionStatus,
} from '../../types/survey'

/**
 * Check if a page is complete — all visible requiredToNavigate questions
 * must be answered and pass validation
 */
export function checkPageComplete(
  pageId: string,
  config: SurveyConfig,
  answers: Record<string, QuestionAnswer>,
  allAnswers: Record<string, unknown>
): boolean {
  const page = findPageById(config, pageId)
  if (!page) return false

  const visibleQuestions = page.questions.filter((question) =>
    shouldShowQuestion(question, allAnswers)
  )

  for (const question of visibleQuestions) {
    if (question.requiredToNavigate) {
      const answer = answers[question.id]?.value
      const errors = validateQuestionUtil(question, answer, allAnswers)

      if (
        !answer ||
        answer === '' ||
        (Array.isArray(answer) && answer.length === 0) ||
        errors.length > 0
      ) {
        return false
      }
    }
  }

  return true
}

/**
 * Check if all visible pages in a group are complete
 */
export function checkGroupComplete(
  groupId: string,
  config: SurveyConfig,
  answers: Record<string, QuestionAnswer>,
  allAnswers: Record<string, unknown>
): boolean {
  if (!config.stages) return false

  for (const stage of config.stages) {
    const group = stage.groups.find((g) => g.id === groupId)
    if (group) {
      const visiblePages = getVisiblePagesForGroup(group, allAnswers)
      return visiblePages.every((page) =>
        checkPageComplete(page.id, config, answers, allAnswers)
      )
    }
  }
  return false
}

/**
 * Check if all visible groups in a stage are complete
 */
export function checkStageComplete(
  stageId: string,
  config: SurveyConfig,
  answers: Record<string, QuestionAnswer>,
  allAnswers: Record<string, unknown>
): boolean {
  if (!config.stages) return false

  const stage = config.stages.find((s) => s.id === stageId)
  if (!stage) return false

  const visibleGroups = getVisibleGroupsForStage(stage, allAnswers)
  return visibleGroups.every((group) =>
    checkGroupComplete(group.id, config, answers, allAnswers)
  )
}

/**
 * Get the completion status of a page: 'empty', 'partial', or 'complete'
 * Only considers visible questions
 */
export function computePageCompletionStatus(
  pageId: string,
  config: SurveyConfig,
  answers: Record<string, QuestionAnswer>,
  allAnswers: Record<string, unknown>
): PageCompletionStatus {
  const page = findPageById(config, pageId)
  if (!page) return 'empty'

  const visibleQuestions = page.questions.filter((question) =>
    shouldShowQuestion(question, allAnswers)
  )

  if (visibleQuestions.length === 0) return 'empty'

  let hasAnyAnswer = false
  let hasAllAnswers = true

  for (const question of visibleQuestions) {
    const answer = answers[question.id]?.value
    const hasAnswer =
      answer !== null &&
      answer !== '' &&
      answer !== undefined &&
      !(Array.isArray(answer) && answer.length === 0)

    if (hasAnswer) {
      hasAnyAnswer = true
    } else {
      hasAllAnswers = false
    }
  }

  if (hasAllAnswers) return 'complete'
  if (hasAnyAnswer) return 'partial'
  return 'empty'
}
