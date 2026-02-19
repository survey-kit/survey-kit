import type {
  SurveyState,
  SurveyPage,
  QuestionAnswer,
} from '../../types/survey'

export const STORAGE_KEY_PREFIX = 'survey-kit-'

/**
 * Resolve the page index from the current URL (hash or query param)
 */
function getPageIndexFromUrl(allPages: SurveyPage[]): number {
  if (typeof window === 'undefined') return -1

  const hash = window.location.hash.replace('#', '')
  if (hash) {
    const pageIndex = allPages.findIndex((p) => p.id === hash)
    if (pageIndex >= 0) return pageIndex
  }

  const params = new URLSearchParams(window.location.search)
  const pageId = params.get('page')
  if (pageId) {
    const pageIndex = allPages.findIndex((p) => p.id === pageId)
    if (pageIndex >= 0) return pageIndex
  }

  return -1
}

/**
 * Build the initial survey state from localStorage and URL
 */
export function getInitialState(
  configId: string,
  allPages: SurveyPage[]
): SurveyState {
  if (typeof window === 'undefined') {
    return {
      currentPageIndex: 0,
      answers: {},
      isSubmitted: false,
      errors: {},
    }
  }

  const storageKey = `${STORAGE_KEY_PREFIX}${configId}`
  const savedData = localStorage.getItem(storageKey)
  const urlPageIndex = getPageIndexFromUrl(allPages)

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData)
      const pageIndex =
        urlPageIndex >= 0 ? urlPageIndex : parsed.currentPageIndex || 0
      return {
        currentPageIndex: Math.min(pageIndex, allPages.length - 1),
        answers: parsed.answers || {},
        isSubmitted: parsed.isSubmitted || false,
        errors: {},
      }
    } catch {
      // If parsing fails, start fresh
    }
  }

  const pageIndex = urlPageIndex >= 0 ? urlPageIndex : 0
  return {
    currentPageIndex: Math.min(pageIndex, allPages.length - 1),
    answers: {},
    isSubmitted: false,
    errors: {},
  }
}

/**
 * Persist survey state to localStorage
 */
export function saveToStorage(configId: string, state: SurveyState): void {
  if (typeof window === 'undefined') return

  const storageKey = `${STORAGE_KEY_PREFIX}${configId}`
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      currentPageIndex: state.currentPageIndex,
      answers: state.answers,
      isSubmitted: state.isSubmitted,
    })
  )
}

/**
 * Update the browser URL to reflect the current page (hash + query param)
 */
export function updateUrlWithPage(pageId: string | undefined): void {
  if (typeof window === 'undefined') return

  const newUrl = new URL(window.location.href)
  newUrl.hash = pageId || ''
  newUrl.searchParams.set('page', pageId || '')
  window.history.replaceState({}, '', newUrl.toString())
}

/**
 * Dispatch a custom event when the survey page changes
 */
export function dispatchPageChangeEvent(pageId: string): void {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent('survey-page-change', {
      detail: { pageId },
    })
  )
}

/**
 * Dispatch a custom event when an answer changes
 */
export function dispatchAnswerChangeEvent(
  questionId: string,
  surveyId: string
): void {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent('survey-answer-change', {
      detail: { questionId, surveyId },
    })
  )
}

/**
 * Flatten the answers record into a simple questionId → value map
 * for use by conditional logic
 */
export function flattenAnswers(
  answers: Record<string, QuestionAnswer>
): Record<string, unknown> {
  const flat: Record<string, unknown> = {}
  Object.values(answers).forEach((answer) => {
    flat[answer.questionId] = answer.value
  })
  return flat
}
