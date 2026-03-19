import type {
  SurveyConfig,
  SurveyStage,
  SurveyGroup,
  SurveyPage,
} from '../types/survey'
import type { DashboardFilterConfig } from '../types/dashboard'

/**
 * Normalises a survey config - ensures it has stages structure
 * @param config Survey configuration (must have stages)
 * @returns Survey configuration with stages
 */
export function normaliseSurveyConfig(config: SurveyConfig): SurveyConfig {
  // Ensure config has stages (required for new format)
  if (!config.stages || config.stages.length === 0) {
    throw new Error(
      'Survey config must have stages. Please use the new stages/groups/pages structure.'
    )
  }
  return config
}

/**
 * Flattens stages/groups structure to get all pages in order
 * @param config Survey configuration (must have stages)
 * @returns Array of all pages in order (stage → group → page)
 */
export function getAllPages(config: SurveyConfig): SurveyPage[] {
  if (!config.stages || config.stages.length === 0) {
    return []
  }

  const pages: SurveyPage[] = []
  for (const stage of config.stages) {
    for (const group of stage.groups) {
      pages.push(...group.pages)
    }
  }
  return pages
}

/**
 * Finds a page by ID across all stages and groups
 * @param config Survey configuration (must have stages)
 * @param pageId Page ID to find
 * @returns The page if found, undefined otherwise
 */
export function findPageById(
  config: SurveyConfig,
  pageId: string
): SurveyPage | undefined {
  if (!config.stages) return undefined

  for (const stage of config.stages) {
    for (const group of stage.groups) {
      const page = group.pages.find((p) => p.id === pageId)
      if (page) return page
    }
  }

  return undefined
}

/**
 * Gets the stage, group, and page index for a given page ID
 * @param config Survey configuration (must have stages)
 * @param pageId Page ID to locate
 * @returns Object with stageIndex, groupIndex, pageIndex, or null if not found
 */
export function getPageLocation(
  config: SurveyConfig,
  pageId: string
): {
  stageIndex: number
  groupIndex: number
  pageIndex: number
  stage: SurveyStage
  group: SurveyGroup
  page: SurveyPage
} | null {
  if (!config.stages) return null

  for (let stageIndex = 0; stageIndex < config.stages.length; stageIndex++) {
    const stage = config.stages[stageIndex]
    for (let groupIndex = 0; groupIndex < stage.groups.length; groupIndex++) {
      const group = stage.groups[groupIndex]
      const pageIndex = group.pages.findIndex((p) => p.id === pageId)
      if (pageIndex >= 0) {
        return {
          stageIndex,
          groupIndex,
          pageIndex,
          stage,
          group,
          page: group.pages[pageIndex],
        }
      }
    }
  }

  return null
}

/**
 * Extracts all filterable questions with predefined options from a survey configuration.
 * Automatically identifies 'select', 'radio', and 'dropdown' questions.
 * @param config Survey configuration
 * @returns Array of DashboardFilterConfig objects
 */
export function extractFilterableQuestions(
  config: SurveyConfig
): DashboardFilterConfig[] {
  const filters: DashboardFilterConfig[] = []

  const pages = getAllPages(config)

  for (const page of pages) {
    if (!page.questions) continue

    for (const question of page.questions) {
      if (
        (question.type === 'radio' ||
          question.type === 'select' ||
          question.type === 'checkbox') &&
        question.options &&
        question.options.length > 0
      ) {
        filters.push({
          id: question.id,
          label: question.label || question.id,
          type: question.type === 'checkbox' ? 'multiselect' : 'select',
          options: question.options.map((opt) => ({
            label: opt.label,
            value: opt.value,
          })),
        })
      }
    }
  }

  return filters
}

/**
 * Builds a map of question IDs to their labels from a survey configuration.
 * @param config Survey configuration
 * @returns Record mapping questionId to label (falls back to id if label is missing)
 */
export function getQuestionLabelMap(
  config: SurveyConfig
): Record<string, string> {
  const map: Record<string, string> = {}
  const pages = getAllPages(config)

  for (const page of pages) {
    if (!page.questions) continue
    for (const question of page.questions) {
      map[question.id] = question.label ?? question.id
    }
  }

  return map
}
