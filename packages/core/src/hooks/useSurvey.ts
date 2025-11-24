import { useState, useEffect, useCallback, useMemo } from 'react'
import { validateQuestion as validateQuestionUtil } from '../lib/validation'
import {
  shouldShowQuestion,
  shouldShowPage,
  evaluateConditions,
} from '../lib/conditional'
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
  getVisiblePages: () => SurveyConfig['pages']
  getVisibleQuestions: (page: SurveyConfig['pages'][0]) => SurveyQuestion[]
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

  // Get all answers as a flat record for conditional logic
  const allAnswers = useMemo(() => {
    const answers: Record<string, unknown> = {}
    Object.values(state.answers).forEach((answer) => {
      answers[answer.questionId] = answer.value
    })
    return answers
  }, [state.answers])

  // Get visible pages (filtered by conditional logic)
  const visiblePages = useMemo(() => {
    return config.pages.filter((page) => shouldShowPage(page, allAnswers))
  }, [config.pages, allAnswers])

  // Get current page (may be filtered)
  const currentPage = useMemo(() => {
    // Find the visible page that corresponds to currentPageIndex
    const visiblePageIndex = visiblePages.findIndex(
      (_, index) => index === state.currentPageIndex
    )
    if (visiblePageIndex >= 0) {
      return visiblePages[visiblePageIndex]
    }
    // Fallback to original page if not found in visible pages
    return config.pages[state.currentPageIndex]
  }, [config.pages, visiblePages, state.currentPageIndex])

  // Get visible questions for current page
  const visibleQuestions = useMemo(() => {
    if (!currentPage) return []
    return currentPage.questions.filter((question) =>
      shouldShowQuestion(question, allAnswers)
    )
  }, [currentPage, allAnswers])

  const currentQuestion = useMemo(
    () => visibleQuestions[0] || null,
    [visibleQuestions]
  )

  // Calculate progress based on visible pages
  const isFirstPage = useMemo(() => {
    const visiblePageIndex = visiblePages.findIndex(
      (p) => p.id === currentPage?.id
    )
    return visiblePageIndex === 0
  }, [visiblePages, currentPage])

  const isLastPage = useMemo(() => {
    const visiblePageIndex = visiblePages.findIndex(
      (p) => p.id === currentPage?.id
    )
    return visiblePageIndex === visiblePages.length - 1
  }, [visiblePages, currentPage])

  const progress = useMemo(() => {
    const visiblePageIndex = visiblePages.findIndex(
      (p) => p.id === currentPage?.id
    )
    if (visiblePageIndex < 0) return 0
    return ((visiblePageIndex + 1) / visiblePages.length) * 100
  }, [visiblePages, currentPage])

  /**
   * Validate a question's answer
   */
  const validateQuestion = useCallback(
    (question: SurveyQuestion): string[] => {
      const answer = state.answers[question.id]?.value
      return validateQuestionUtil(question, answer, allAnswers)
    },
    [state.answers, allAnswers]
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
   * Handles dynamic navigation based on skip logic and conditional pages
   */
  const nextPage = useCallback(() => {
    if (isLastPage) return

    // Validate current page - check all visible requiredToNavigate questions
    const currentPageErrors: Record<string, string[]> = {}
    let canNavigate = true

    visibleQuestions.forEach((question) => {
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

    // Check for skip logic - if any visible question has skip logic that matches
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

    // Check if current page has dynamic nextPageId
    if (!targetPageId && currentPage.nextPageId) {
      targetPageId = currentPage.nextPageId
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

      let nextPageIndex = prev.currentPageIndex + 1

      // If we have a target page ID, find it in visible pages
      if (targetPageId) {
        const targetIndex = visiblePages.findIndex((p) => p.id === targetPageId)
        if (targetIndex >= 0) {
          // Find the actual index in the full pages array
          const targetPage = config.pages.find((p) => p.id === targetPageId)
          if (targetPage) {
            nextPageIndex = config.pages.findIndex((p) => p.id === targetPageId)
          }
        }
      } else {
        // Default: move to next visible page
        const currentVisibleIndex = visiblePages.findIndex(
          (p) => p.id === currentPage.id
        )
        if (
          currentVisibleIndex >= 0 &&
          currentVisibleIndex < visiblePages.length - 1
        ) {
          const nextVisiblePage = visiblePages[currentVisibleIndex + 1]
          const nextPage = config.pages.find((p) => p.id === nextVisiblePage.id)
          if (nextPage) {
            nextPageIndex = config.pages.findIndex(
              (p) => p.id === nextVisiblePage.id
            )
          }
        }
      }

      return {
        ...prev,
        currentPageIndex: nextPageIndex,
        errors: newErrors,
      }
    })
  }, [
    isLastPage,
    currentPage,
    visibleQuestions,
    validateQuestion,
    config.pages,
    allAnswers,
    visiblePages,
  ])

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
   * Check if a page is complete (all visible requiredToNavigate questions answered and valid)
   */
  const isPageComplete = useCallback(
    (pageIndex: number): boolean => {
      const page = config.pages[pageIndex]
      if (!page) return false

      // Get visible questions for this page
      const visibleQuestionsForPage = page.questions.filter((question) =>
        shouldShowQuestion(question, allAnswers)
      )

      // Check all visible questions that require navigation
      for (const question of visibleQuestionsForPage) {
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
    [config.pages, state.answers, validateQuestion, allAnswers]
  )

  /**
   * Get page completion status (only considers visible questions)
   */
  const getPageCompletionStatus = useCallback(
    (pageIndex: number): PageCompletionStatus => {
      const page = config.pages[pageIndex]
      if (!page) return 'empty'

      // Get visible questions for this page
      const visibleQuestionsForPage = page.questions.filter((question) =>
        shouldShowQuestion(question, allAnswers)
      )

      // If no visible questions, consider empty
      if (visibleQuestionsForPage.length === 0) return 'empty'

      let hasAnyAnswer = false
      let hasAllAnswers = true

      for (const question of visibleQuestionsForPage) {
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
    [config.pages, state.answers, allAnswers]
  )

  /**
   * Get latest accessible page index
   * Returns the highest visible page index where all previous visible pages are complete
   * A page is accessible if all visible pages BEFORE it are complete
   */
  const getLatestAccessiblePageIndex = useCallback((): number => {
    if (visiblePages.length === 0) return 0

    let latestAccessible = 0

    for (let i = 1; i < visiblePages.length; i++) {
      // Check if all visible pages BEFORE this one (i) are complete
      let allPreviousComplete = true
      for (let j = 0; j < i; j++) {
        const page = visiblePages[j]
        const pageIndex = config.pages.findIndex((p) => p.id === page.id)
        if (pageIndex >= 0 && !isPageComplete(pageIndex)) {
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

    // Convert visible page index back to actual page index
    const latestVisiblePage = visiblePages[latestAccessible]
    if (latestVisiblePage) {
      const actualIndex = config.pages.findIndex(
        (p) => p.id === latestVisiblePage.id
      )
      return actualIndex >= 0 ? actualIndex : 0
    }

    return 0
  }, [visiblePages, config.pages, isPageComplete])

  /**
   * Get visible pages
   */
  const getVisiblePages = useCallback(() => {
    return visiblePages
  }, [visiblePages])

  /**
   * Get visible questions for a page
   */
  const getVisibleQuestions = useCallback(
    (page: SurveyConfig['pages'][0]) => {
      return page.questions.filter((question) =>
        shouldShowQuestion(question, allAnswers)
      )
    },
    [allAnswers]
  )

  /**
   * Submit survey (only validates visible questions)
   */
  const submitSurvey = useCallback(async () => {
    // Validate all visible questions
    const allErrors: Record<string, string[]> = {}
    const answers: Record<string, unknown> = {}

    visiblePages.forEach((page) => {
      const visibleQuestionsForPage = page.questions.filter((question) =>
        shouldShowQuestion(question, allAnswers)
      )
      visibleQuestionsForPage.forEach((question) => {
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
  }, [visiblePages, allAnswers, validateQuestion, getAnswerValue, onSubmit])

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
    getVisiblePages,
    getVisibleQuestions,
  }
}
