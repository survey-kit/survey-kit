import { useState, useEffect, useCallback, useMemo } from 'react'
import { validateQuestion as validateQuestionUtil } from '../lib/validation'
import type {
  SurveyConfig,
  SurveyState,
  SurveyQuestion,
  PageCompletionStatus,
} from '../types/survey'

const STORAGE_KEY_PREFIX = 'survey-kit-'

interface UseSurveyOptions {
  config: SurveyConfig
  onSubmit?: (answers: Record<string, unknown>) => Promise<void> | void
}

interface UseSurveyReturn {
  state: SurveyState
  currentPage: SurveyConfig['pages'][0]
  currentQuestion: SurveyQuestion | null
  isFirstPage: boolean
  isLastPage: boolean
  progress: number
  setAnswer: (questionId: string, value: unknown) => void
  nextPage: () => void
  prevPage: () => void
  submitSurvey: () => Promise<void>
  validateQuestion: (question: SurveyQuestion) => string[]
  getAnswerValue: (questionId: string) => unknown
  isPageComplete: (pageIndex: number) => boolean
  getPageCompletionStatus: (pageIndex: number) => PageCompletionStatus
  getLatestAccessiblePageIndex: () => number
}

/**
 * Hook for managing survey state and navigation
 */
export function useSurvey({
  config,
  onSubmit,
}: UseSurveyOptions): UseSurveyReturn {
  // Initialise state from localStorage and URL
  const getInitialState = useCallback((): SurveyState => {
    if (typeof window === 'undefined') {
      return {
        currentPageIndex: 0,
        answers: {},
        isSubmitted: false,
        errors: {},
      }
    }

    const storageKey = `${STORAGE_KEY_PREFIX}${config.id}`
    const savedData = localStorage.getItem(storageKey)

    // Try to get page from URL first
    const getPageIndexFromUrl = (): number => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        const pageIndex = config.pages.findIndex((p) => p.id === hash)
        if (pageIndex >= 0) return pageIndex
      }
      const params = new URLSearchParams(window.location.search)
      const pageId = params.get('page')
      if (pageId) {
        const pageIndex = config.pages.findIndex((p) => p.id === pageId)
        if (pageIndex >= 0) return pageIndex
      }
      return -1
    }

    const urlPageIndex = getPageIndexFromUrl()

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Use URL page if available, otherwise use saved page
        const pageIndex =
          urlPageIndex >= 0 ? urlPageIndex : parsed.currentPageIndex || 0
        return {
          currentPageIndex: Math.min(pageIndex, config.pages.length - 1),
          answers: parsed.answers || {},
          isSubmitted: parsed.isSubmitted || false,
          errors: {},
        }
      } catch {
        // If parsing fails, start fresh
      }
    }

    // Default to URL page or first page
    const pageIndex = urlPageIndex >= 0 ? urlPageIndex : 0
    return {
      currentPageIndex: Math.min(pageIndex, config.pages.length - 1),
      answers: {},
      isSubmitted: false,
      errors: {},
    }
  }, [config])

  const [state, setState] = useState<SurveyState>(getInitialState)

  // Save to localStorage and update URL whenever state changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `${STORAGE_KEY_PREFIX}${config.id}`
    const currentPage = config.pages[state.currentPageIndex]

    // Save to localStorage
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        currentPageIndex: state.currentPageIndex,
        answers: state.answers,
        isSubmitted: state.isSubmitted,
      })
    )

    // Update URL without page reload
    const newUrl = new URL(window.location.href)
    newUrl.hash = currentPage?.id || ''
    // Also set as query param for better compatibility
    newUrl.searchParams.set('page', currentPage?.id || '')
    window.history.replaceState({}, '', newUrl.toString())

    // Dispatch custom event for LayoutRenderer to listen to
    // This is more efficient than polling
    if (currentPage?.id) {
      window.dispatchEvent(
        new CustomEvent('survey-page-change', {
          detail: { pageId: currentPage.id },
        })
      )
    }
  }, [state, config])

  const currentPage = useMemo(
    () => config.pages[state.currentPageIndex],
    [config.pages, state.currentPageIndex]
  )

  const currentQuestion = useMemo(
    () => currentPage?.questions[0] || null,
    [currentPage]
  )

  const isFirstPage = state.currentPageIndex === 0
  const isLastPage = state.currentPageIndex === config.pages.length - 1
  const progress = ((state.currentPageIndex + 1) / config.pages.length) * 100

  /**
   * Validate a question's answer
   */
  const validateQuestion = useCallback(
    (question: SurveyQuestion): string[] => {
      const answer = state.answers[question.id]?.value
      return validateQuestionUtil(question, answer)
    },
    [state.answers]
  )

  /**
   * Set answer for a question
   */
  const setAnswer = useCallback(
    (questionId: string, value: unknown) => {
      setState((prev) => {
        const newAnswers = {
          ...prev.answers,
          [questionId]: {
            questionId,
            value,
            isValid: true,
          },
        }
        // Clear errors for this question when user provides an answer
        const newErrors = { ...prev.errors }
        delete newErrors[questionId]

        // Save to localStorage immediately
        if (typeof window !== 'undefined') {
          const storageKey = `${STORAGE_KEY_PREFIX}${config.id}`
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              currentPageIndex: prev.currentPageIndex,
              answers: newAnswers,
              isSubmitted: prev.isSubmitted,
            })
          )
          // Dispatch custom event for LayoutRenderer to listen to
          window.dispatchEvent(
            new CustomEvent('survey-answer-change', {
              detail: { questionId, surveyId: config.id },
            })
          )
        }
        return {
          ...prev,
          answers: newAnswers,
          errors: newErrors,
        }
      })
    },
    [config.id]
  )

  /**
   * Move to next page (validates current page first)
   */
  const nextPage = useCallback(() => {
    if (isLastPage) return

    // Validate current page - check all requiredToNavigate questions
    const currentPageErrors: Record<string, string[]> = {}
    let canNavigate = true

    currentPage.questions.forEach((question) => {
      if (question.requiredToNavigate) {
        const errors = validateQuestion(question)
        if (errors.length > 0) {
          currentPageErrors[question.id] = errors
          canNavigate = false
        }
      }
    })

    if (!canNavigate) {
      // Update state with errors to show them - replace all errors for current page
      setState((prev) => {
        // Clear previous errors for current page questions, then add new ones
        const newErrors: Record<string, string[]> = {}
        currentPage.questions.forEach((q) => {
          // Keep errors from other pages
          if (prev.errors[q.id] && !currentPageErrors[q.id]) {
            // Only keep if it's not a current page error
            const pageIndex = config.pages.findIndex((p) =>
              p.questions.some((pq) => pq.id === q.id)
            )
            if (pageIndex !== prev.currentPageIndex) {
              newErrors[q.id] = prev.errors[q.id]
            }
          }
        })
        // Add new current page errors
        Object.assign(newErrors, currentPageErrors)
        return {
          ...prev,
          errors: newErrors,
        }
      })
      return
    }

    // Clear errors and navigate
    setState((prev) => {
      // Clear errors for current page only
      const newErrors: Record<string, string[]> = {}
      Object.keys(prev.errors).forEach((questionId) => {
        const pageIndex = config.pages.findIndex((p) =>
          p.questions.some((q) => q.id === questionId)
        )
        // Keep errors from other pages
        if (pageIndex !== prev.currentPageIndex) {
          newErrors[questionId] = prev.errors[questionId]
        }
      })
      return {
        ...prev,
        currentPageIndex: prev.currentPageIndex + 1,
        errors: newErrors,
      }
    })
  }, [isLastPage, currentPage, validateQuestion, config.pages])

  /**
   * Move to previous page
   */
  const prevPage = useCallback(() => {
    if (!isFirstPage) {
      setState((prev) => ({
        ...prev,
        currentPageIndex: prev.currentPageIndex - 1,
      }))
    }
  }, [isFirstPage])

  /**
   * Get answer value for a question
   */
  const getAnswerValue = useCallback(
    (questionId: string): unknown => {
      return state.answers[questionId]?.value ?? null
    },
    [state.answers]
  )

  /**
   * Check if a page is complete (all requiredToNavigate questions answered and valid)
   */
  const isPageComplete = useCallback(
    (pageIndex: number): boolean => {
      const page = config.pages[pageIndex]
      if (!page) return false

      // Check all questions that require navigation
      for (const question of page.questions) {
        if (question.requiredToNavigate) {
          const answer = state.answers[question.id]?.value
          const errors = validateQuestion(question)

          // Must have an answer and be valid
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
    },
    [config.pages, state.answers, validateQuestion]
  )

  /**
   * Get page completion status
   */
  const getPageCompletionStatus = useCallback(
    (pageIndex: number): PageCompletionStatus => {
      const page = config.pages[pageIndex]
      if (!page) return 'empty'

      let hasAnyAnswer = false
      let hasAllAnswers = true

      for (const question of page.questions) {
        const answer = state.answers[question.id]?.value
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
    },
    [config.pages, state.answers]
  )

  /**
   * Get latest accessible page index
   * Returns the highest page index where all previous pages are complete
   * A page is accessible if all pages BEFORE it are complete
   */
  const getLatestAccessiblePageIndex = useCallback((): number => {
    // First page (index 0) is always accessible
    if (config.pages.length === 0) return 0

    let latestAccessible = 0

    for (let i = 1; i < config.pages.length; i++) {
      // Check if all pages BEFORE this one (i) are complete
      let allPreviousComplete = true
      for (let j = 0; j < i; j++) {
        if (!isPageComplete(j)) {
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

    return latestAccessible
  }, [config.pages.length, isPageComplete])

  /**
   * Submit survey
   */
  const submitSurvey = useCallback(async () => {
    // Validate all questions
    const allErrors: Record<string, string[]> = {}
    const answers: Record<string, unknown> = {}

    config.pages.forEach((page) => {
      page.questions.forEach((question) => {
        const errors = validateQuestion(question)
        if (errors.length > 0) {
          allErrors[question.id] = errors
        }
        answers[question.id] = getAnswerValue(question.id)
      })
    })

    if (Object.keys(allErrors).length > 0) {
      setState((prev) => ({
        ...prev,
        errors: allErrors,
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      isSubmitted: true,
      errors: {},
    }))

    if (onSubmit) {
      await onSubmit(answers)
    }
  }, [config.pages, validateQuestion, getAnswerValue, onSubmit])

  return {
    state,
    currentPage,
    currentQuestion,
    isFirstPage,
    isLastPage,
    progress,
    setAnswer,
    nextPage,
    prevPage,
    submitSurvey,
    validateQuestion,
    getAnswerValue,
    isPageComplete,
    getPageCompletionStatus,
    getLatestAccessiblePageIndex,
  }
}
