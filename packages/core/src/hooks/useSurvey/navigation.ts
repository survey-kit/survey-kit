import { evaluateConditions } from '../../lib/conditional'
import { getVisibleGroupsForStage, getVisiblePagesForGroup } from './visibility'
import type {
  SurveyConfig,
  SurveyPage,
  SurveyQuestion,
  SurveyStage,
} from '../../types/survey'

// Next-page resolution

export interface NextPageResult {
  /** The resolved page index to navigate to */
  nextPageIndex: number
  /** Validation errors keyed by questionId (empty if navigation succeeded) */
  errors: Record<string, string[]>
  /** Whether navigation is allowed (false when validation fails) */
  canNavigate: boolean
}

/**
 * Validate the current page then resolve the next page index,
 * accounting for skip logic and dynamic nextPageId.
 *
 * Returns the computed result — the caller (hook) handles state updates.
 */
export function resolveNextPage(
  currentPage: SurveyPage,
  currentPageIndex: number,
  visibleQuestions: SurveyQuestion[],
  allAnswers: Record<string, unknown>,
  allPages: SurveyPage[],
  visiblePages: SurveyPage[],
  validateQuestionFn: (question: SurveyQuestion) => string[]
): NextPageResult {
  // Validate current page — check all visible requiredToNavigate questions
  const currentPageErrors: Record<string, string[]> = {}
  let canNavigate = true

  visibleQuestions.forEach((question) => {
    if (question.requiredToNavigate) {
      const errors = validateQuestionFn(question)
      if (errors.length > 0) {
        currentPageErrors[question.id] = errors
        canNavigate = false
      }
    }
  })

  if (!canNavigate) {
    return {
      nextPageIndex: currentPageIndex,
      errors: currentPageErrors,
      canNavigate: false,
    }
  }

  // Check for skip logic
  let targetPageId: string | undefined
  for (const question of visibleQuestions) {
    if (question.skipLogic) {
      const shouldSkip = evaluateConditions(
        question.skipLogic.conditions,
        allAnswers,
        question.skipLogic.logic || 'AND'
      )
      if (shouldSkip) {
        targetPageId = question.skipLogic.nextPageId
        break
      }
    }
  }

  // Check if current page has a static nextPageId
  if (!targetPageId && currentPage.nextPageId) {
    targetPageId = currentPage.nextPageId
  }

  let nextPageIndex = currentPageIndex + 1

  if (targetPageId) {
    const targetIndex = allPages.findIndex((p) => p.id === targetPageId)
    if (targetIndex >= 0) {
      nextPageIndex = targetIndex
    }
  } else {
    // Default: advance to next visible page
    const currentVisibleIndex = visiblePages.findIndex(
      (p) => p.id === currentPage.id
    )
    if (
      currentVisibleIndex >= 0 &&
      currentVisibleIndex < visiblePages.length - 1
    ) {
      const nextVisiblePage = visiblePages[currentVisibleIndex + 1]
      const nextPageIndexInAll = allPages.findIndex(
        (p) => p.id === nextVisiblePage.id
      )
      if (nextPageIndexInAll >= 0) {
        nextPageIndex = nextPageIndexInAll
      }
    }
  }

  return { nextPageIndex, errors: {}, canNavigate: true }
}

// Stage navigation

/**
 * Resolve the allPages index of the first visible page for a given stage.
 * Returns null if the stage doesn't exist or has no visible pages.
 */
export function resolveGoToStagePageIndex(
  stageId: string,
  config: SurveyConfig,
  allAnswers: Record<string, unknown>,
  allPages: SurveyPage[]
): number | null {
  const stage = config.stages?.find((s) => s.id === stageId)
  if (!stage) return null

  const visibleGroups = getVisibleGroupsForStage(stage, allAnswers)
  if (visibleGroups.length === 0) return null

  const firstGroup = visibleGroups[0]
  const visiblePagesInGroup = getVisiblePagesForGroup(firstGroup, allAnswers)
  if (visiblePagesInGroup.length === 0) return null

  const firstPage = visiblePagesInGroup[0]
  const pageIndex = allPages.findIndex((p) => p.id === firstPage.id)
  return pageIndex >= 0 ? pageIndex : null
}

// Access checks

/**
 * Check whether the user can navigate to a specific stage,
 * respecting the navigation config (sequential vs free).
 */
export function checkCanNavigateToStage(
  stageId: string,
  config: SurveyConfig,
  visibleStages: SurveyStage[],
  isStageCompleteFn: (stageId: string) => boolean
): boolean {
  const navConfig = config.navigation
  const stageOrder = navConfig?.stageOrder || 'sequential'

  if (stageOrder === 'free') return true
  if (!config.stages) return false

  const stageIndex = config.stages.findIndex((s) => s.id === stageId)
  if (stageIndex <= 0) return true // First stage is always accessible

  for (let i = 0; i < stageIndex; i++) {
    const prevStage = config.stages[i]
    if (visibleStages.includes(prevStage) && !isStageCompleteFn(prevStage.id)) {
      return false
    }
  }

  return true
}

/**
 * Check whether the user can navigate to a specific group,
 * respecting the navigation config (sequential vs free).
 */
export function checkCanNavigateToGroup(
  groupId: string,
  config: SurveyConfig,
  allAnswers: Record<string, unknown>,
  isGroupCompleteFn: (groupId: string) => boolean
): boolean {
  const navConfig = config.navigation
  const groupOrder = navConfig?.groupOrder || 'sequential'

  if (groupOrder === 'free') return true
  if (!config.stages) return false

  for (const stage of config.stages) {
    const groupIndex = stage.groups.findIndex((g) => g.id === groupId)
    if (groupIndex >= 0) {
      if (groupIndex === 0) return true // First group is always accessible

      const visibleGroups = getVisibleGroupsForStage(stage, allAnswers)
      for (let i = 0; i < groupIndex; i++) {
        const prevGroup = stage.groups[i]
        if (
          visibleGroups.includes(prevGroup) &&
          !isGroupCompleteFn(prevGroup.id)
        ) {
          return false
        }
      }
      return true
    }
  }

  return false
}

// Accessible page index

/**
 * Compute the highest visible-page index where all previous visible pages are
 * complete. Respects sequential vs free navigation config.
 */
export function computeLatestAccessiblePageIndex(
  visiblePages: SurveyPage[],
  allPages: SurveyPage[],
  config: SurveyConfig,
  isPageCompleteFn: (pageId: string) => boolean
): number {
  if (visiblePages.length === 0) return 0

  const navConfig = config.navigation
  const pageOrder = navConfig?.pageOrder || 'sequential'

  if (pageOrder === 'free') {
    const lastPage = visiblePages[visiblePages.length - 1]
    if (lastPage) {
      const index = allPages.findIndex((p) => p.id === lastPage.id)
      return index >= 0 ? index : 0
    }
    return 0
  }

  // Sequential navigation — check completion chain
  let latestAccessible = 0

  for (let i = 1; i < visiblePages.length; i++) {
    let allPreviousComplete = true
    for (let j = 0; j < i; j++) {
      const page = visiblePages[j]
      if (!isPageCompleteFn(page.id)) {
        allPreviousComplete = false
        break
      }
    }

    if (allPreviousComplete) {
      latestAccessible = i
    } else {
      break
    }
  }

  const latestVisiblePage = visiblePages[latestAccessible]
  if (latestVisiblePage) {
    const actualIndex = allPages.findIndex((p) => p.id === latestVisiblePage.id)
    return actualIndex >= 0 ? actualIndex : 0
  }

  return 0
}
