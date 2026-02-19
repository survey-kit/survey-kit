import { getVisibleGroupsForStage, getVisiblePagesForGroup } from './visibility'
import { checkPageComplete, checkGroupComplete } from './completion'
import type {
  SurveyConfig,
  SurveyStage,
  SurveyGroup,
  SurveyPage,
  QuestionAnswer,
} from '../../types/survey'

// Current-position progress (index-based)

/**
 * Page-level progress within the current group (percentage)
 */
export function calculatePageProgress(
  currentPage: SurveyPage | undefined,
  currentGroup: SurveyGroup | null,
  allAnswers: Record<string, unknown>
): number {
  if (!currentPage || !currentGroup) return 0
  const visiblePagesInGroup = getVisiblePagesForGroup(currentGroup, allAnswers)
  const pageIndex = visiblePagesInGroup.findIndex(
    (p) => p.id === currentPage.id
  )
  if (pageIndex < 0) return 0
  return ((pageIndex + 1) / visiblePagesInGroup.length) * 100
}

/**
 * Group-level progress within the current stage (percentage)
 */
export function calculateGroupProgress(
  currentGroup: SurveyGroup | null,
  currentStage: SurveyStage | null,
  allAnswers: Record<string, unknown>
): number {
  if (!currentGroup || !currentStage) return 0
  const visibleGroupsInStage = getVisibleGroupsForStage(
    currentStage,
    allAnswers
  )
  const groupIndex = visibleGroupsInStage.findIndex(
    (g) => g.id === currentGroup.id
  )
  if (groupIndex < 0) return 0
  return ((groupIndex + 1) / visibleGroupsInStage.length) * 100
}

/**
 * Stage-level progress across all visible stages (percentage)
 */
export function calculateStageProgress(
  currentStage: SurveyStage | null,
  visibleStages: SurveyStage[]
): number {
  if (!currentStage) return 0
  const stageIndex = visibleStages.findIndex((s) => s.id === currentStage.id)
  if (stageIndex < 0) return 0
  return ((stageIndex + 1) / visibleStages.length) * 100
}

/**
 * Overall progress across all visible pages (percentage)
 */
export function calculateOverallProgress(
  currentPage: SurveyPage | undefined,
  visiblePages: SurveyPage[]
): number {
  if (!currentPage) return 0
  const visiblePageIndex = visiblePages.findIndex(
    (p) => p.id === currentPage.id
  )
  if (visiblePageIndex < 0) return 0
  return ((visiblePageIndex + 1) / visiblePages.length) * 100
}

// Completion-based progress (per entity)

/**
 * Percentage of completed groups within a specific stage
 */
export function getStageProgressByCompletion(
  stageId: string,
  config: SurveyConfig,
  answers: Record<string, QuestionAnswer>,
  allAnswers: Record<string, unknown>
): number {
  const stage = config.stages?.find((s) => s.id === stageId)
  if (!stage) return 0

  const visibleGroups = getVisibleGroupsForStage(stage, allAnswers)
  if (visibleGroups.length === 0) return 0

  let completedGroups = 0
  visibleGroups.forEach((group) => {
    if (checkGroupComplete(group.id, config, answers, allAnswers)) {
      completedGroups++
    }
  })

  return (completedGroups / visibleGroups.length) * 100
}

/**
 * Percentage of completed pages within a specific group
 */
export function getGroupProgressByCompletion(
  groupId: string,
  config: SurveyConfig,
  answers: Record<string, QuestionAnswer>,
  allAnswers: Record<string, unknown>
): number {
  if (!config.stages) return 0

  for (const stage of config.stages) {
    const group = stage.groups.find((g) => g.id === groupId)
    if (group) {
      const visiblePages = getVisiblePagesForGroup(group, allAnswers)
      if (visiblePages.length === 0) return 0

      let completedPages = 0
      visiblePages.forEach((page) => {
        if (checkPageComplete(page.id, config, answers, allAnswers)) {
          completedPages++
        }
      })

      return (completedPages / visiblePages.length) * 100
    }
  }

  return 0
}
