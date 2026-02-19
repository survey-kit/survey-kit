import {
  shouldShowQuestion,
  shouldShowPage,
  shouldShowGroup,
  shouldShowStage,
} from '../../lib/conditional'
import type {
  SurveyStage,
  SurveyGroup,
  SurveyPage,
  SurveyQuestion,
} from '../../types/survey'

/**
 * Filter stages to only those whose conditions are met
 */
export function getVisibleStages(
  stages: SurveyStage[] | undefined,
  allAnswers: Record<string, unknown>
): SurveyStage[] {
  if (!stages) return []
  return stages.filter((stage) => shouldShowStage(stage, allAnswers))
}

/**
 * Filter groups within a stage by conditional logic
 */
export function getVisibleGroupsForStage(
  stage: SurveyStage,
  allAnswers: Record<string, unknown>
): SurveyGroup[] {
  return stage.groups.filter((group) => shouldShowGroup(group, allAnswers))
}

/**
 * Filter pages within a group by conditional logic
 */
export function getVisiblePagesForGroup(
  group: SurveyGroup,
  allAnswers: Record<string, unknown>
): SurveyPage[] {
  return group.pages.filter((page) => shouldShowPage(page, allAnswers))
}

/**
 * Filter questions within a page by conditional logic
 */
export function getVisibleQuestionsForPage(
  page: SurveyPage,
  allAnswers: Record<string, unknown>
): SurveyQuestion[] {
  return page.questions.filter((question) =>
    shouldShowQuestion(question, allAnswers)
  )
}

/**
 * Flatten visible stages → groups → pages into an ordered list of visible pages
 */
export function getAllVisiblePages(
  visibleStages: SurveyStage[],
  allAnswers: Record<string, unknown>
): SurveyPage[] {
  const pages: SurveyPage[] = []
  visibleStages.forEach((stage) => {
    const visibleGroups = getVisibleGroupsForStage(stage, allAnswers)
    visibleGroups.forEach((group) => {
      const visiblePagesInGroup = getVisiblePagesForGroup(group, allAnswers)
      pages.push(...visiblePagesInGroup)
    })
  })
  return pages
}
