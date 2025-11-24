import { useState, useEffect, useCallback, useMemo } from 'react'
import { validateQuestion as validateQuestionUtil } from '../lib/validation'
import {
  shouldShowQuestion,
  shouldShowPage,
  shouldShowGroup,
  shouldShowStage,
  evaluateConditions,
} from '../lib/conditional'
import {
  normaliseSurveyConfig,
  getAllPages,
  getPageLocation,
  findPageById,
} from '../lib/migration'
import type {
  SurveyConfig,
  SurveyState,
  SurveyQuestion,
  SurveyStage,
  QuestionAnswer,
  SurveyGroup,
  SurveyPage,
  PageCompletionStatus,
} from '../types/survey'

const STORAGE_KEY_PREFIX = 'survey-kit-'

interface UseSurveyOptions {
  config: SurveyConfig
  onSubmit?: (answers: Record<string, unknown>) => Promise<void> | void
}

interface UseSurveyReturn {
  state: SurveyState
  currentPage: SurveyPage | undefined
  currentQuestion: SurveyQuestion | null
  currentStage: SurveyStage | null
  currentGroup: SurveyGroup | null
  isFirstPage: boolean
  isLastPage: boolean
  progress: number
  stageProgress: number
  groupProgress: number
  overallProgress: number
  setAnswer: (questionId: string, value: unknown) => void
  nextPage: () => void
  prevPage: () => void
  goToStage: (stageId: string) => void
  submitSurvey: () => Promise<void>
  validateQuestion: (question: SurveyQuestion) => string[]
  getAnswerValue: (questionId: string) => unknown
  isPageComplete: (pageId: string) => boolean
  isGroupComplete: (groupId: string) => boolean
  isStageComplete: (stageId: string) => boolean
  getPageCompletionStatus: (pageId: string) => PageCompletionStatus
  getLatestAccessiblePageIndex: () => number
  getVisiblePages: () => SurveyPage[]
  getVisibleQuestions: (page: SurveyPage) => SurveyQuestion[]
  getVisibleStages: () => SurveyStage[]
  getVisibleGroups: (stage: SurveyStage) => SurveyGroup[]
  canNavigateToStage: (stageId: string) => boolean
  canNavigateToGroup: (groupId: string) => boolean
  getStageProgress: (stageId: string) => number
  getGroupProgress: (groupId: string) => number
}

/**
 * Hook for managing survey state and navigation
 */
export function useSurvey({
  config,
  onSubmit,
}: UseSurveyOptions): UseSurveyReturn {
  // Normalise config to always have stages structure
  const normalisedConfig = useMemo(
    () => normaliseSurveyConfig(config),
    [config]
  )

  // Get all pages in order (flattened from stages/groups)
  const allPages = useMemo(
    () => getAllPages(normalisedConfig),
    [normalisedConfig]
  )

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

    const urlPageIndex = getPageIndexFromUrl()

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Use URL page if available, otherwise use saved page
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

    // Default to URL page or first page
    const pageIndex = urlPageIndex >= 0 ? urlPageIndex : 0
    return {
      currentPageIndex: Math.min(pageIndex, allPages.length - 1),
      answers: {},
      isSubmitted: false,
      errors: {},
    }
  }, [config.id, allPages])

  const [state, setState] = useState<SurveyState>(getInitialState)

  // Save to localStorage and update URL whenever state changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `${STORAGE_KEY_PREFIX}${config.id}`
    const currentPage = allPages[state.currentPageIndex]

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

  // Get visible stages (filtered by conditional logic)
  const visibleStages = useMemo(() => {
    if (!normalisedConfig.stages) return []
    return normalisedConfig.stages.filter((stage) =>
      shouldShowStage(stage, allAnswers)
    )
  }, [normalisedConfig.stages, allAnswers])

  // Get visible groups for a stage
  const getVisibleGroupsForStage = useCallback(
    (stage: SurveyStage): SurveyGroup[] => {
      return stage.groups.filter((group) => shouldShowGroup(group, allAnswers))
    },
    [allAnswers]
  )

  // Get visible pages for a group
  const getVisiblePagesForGroup = useCallback(
    (group: SurveyGroup): SurveyPage[] => {
      return group.pages.filter((page) => shouldShowPage(page, allAnswers))
    },
    [allAnswers]
  )

  // Get all visible pages (flattened from stages/groups)
  const visiblePages = useMemo(() => {
    const pages: SurveyPage[] = []
    visibleStages.forEach((stage) => {
      const visibleGroups = getVisibleGroupsForStage(stage)
      visibleGroups.forEach((group) => {
        const visiblePagesInGroup = getVisiblePagesForGroup(group)
        pages.push(...visiblePagesInGroup)
      })
    })
    return pages
  }, [visibleStages, getVisibleGroupsForStage, getVisiblePagesForGroup])

  // Get current page
  const currentPage = useMemo(() => {
    return allPages[state.currentPageIndex]
  }, [allPages, state.currentPageIndex])

  // Get current stage, group, and page location
  const pageLocation = useMemo(() => {
    if (!currentPage) return null
    return getPageLocation(normalisedConfig, currentPage.id)
  }, [normalisedConfig, currentPage])

  const currentStage = pageLocation?.stage || null
  const currentGroup = pageLocation?.group || null

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

  // Calculate progress at different levels
  const isFirstPage = useMemo(() => {
    if (!currentPage) return false
    const visiblePageIndex = visiblePages.findIndex(
      (p) => p.id === currentPage.id
    )
    return visiblePageIndex === 0
  }, [visiblePages, currentPage])

  const isLastPage = useMemo(() => {
    if (!currentPage) return false
    const visiblePageIndex = visiblePages.findIndex(
      (p) => p.id === currentPage.id
    )
    return visiblePageIndex === visiblePages.length - 1
  }, [visiblePages, currentPage])

  // Page-level progress (within current group)
  const progress = useMemo(() => {
    if (!currentPage || !currentGroup) return 0
    const visiblePagesInGroup = getVisiblePagesForGroup(currentGroup)
    const pageIndex = visiblePagesInGroup.findIndex(
      (p) => p.id === currentPage.id
    )
    if (pageIndex < 0) return 0
    return ((pageIndex + 1) / visiblePagesInGroup.length) * 100
  }, [currentPage, currentGroup, getVisiblePagesForGroup])

  // Group-level progress (within current stage)
  const groupProgress = useMemo(() => {
    if (!currentGroup || !currentStage) return 0
    const visibleGroupsInStage = getVisibleGroupsForStage(currentStage)
    const groupIndex = visibleGroupsInStage.findIndex(
      (g) => g.id === currentGroup.id
    )
    if (groupIndex < 0) return 0
    return ((groupIndex + 1) / visibleGroupsInStage.length) * 100
  }, [currentGroup, currentStage, getVisibleGroupsForStage])

  // Stage-level progress
  const stageProgress = useMemo(() => {
    if (!currentStage) return 0
    const stageIndex = visibleStages.findIndex((s) => s.id === currentStage.id)
    if (stageIndex < 0) return 0
    return ((stageIndex + 1) / visibleStages.length) * 100
  }, [currentStage, visibleStages])

  // Overall progress (across all visible pages)
  const overallProgress = useMemo(() => {
    if (!currentPage) return 0
    const visiblePageIndex = visiblePages.findIndex(
      (p) => p.id === currentPage.id
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
        const newAnswers: Record<string, QuestionAnswer> = {
          ...prev.answers,
          [questionId]: {
            questionId,
            value: value as string | number | boolean | string[] | null,
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
            // Check if question belongs to current page
            const isCurrentPageQuestion = currentPage.questions.some(
              (pq) => pq.id === q.id
            )
            if (!isCurrentPageQuestion) {
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
      const currentPageQuestionIds = new Set(
        currentPage.questions.map((q) => q.id)
      )
      Object.keys(prev.errors).forEach((questionId) => {
        // Keep errors from other pages (not in current page)
        if (!currentPageQuestionIds.has(questionId)) {
          newErrors[questionId] = prev.errors[questionId]
        }
      })

      let nextPageIndex = prev.currentPageIndex + 1

      // If we have a target page ID, find it in all pages
      if (targetPageId) {
        const targetIndex = allPages.findIndex((p) => p.id === targetPageId)
        if (targetIndex >= 0) {
          nextPageIndex = targetIndex
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
          const nextPageIndexInAll = allPages.findIndex(
            (p) => p.id === nextVisiblePage.id
          )
          if (nextPageIndexInAll >= 0) {
            nextPageIndex = nextPageIndexInAll
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
    allPages,
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
    (pageId: string): boolean => {
      const page = findPageById(normalisedConfig, pageId)
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
    [normalisedConfig, state.answers, validateQuestion, allAnswers]
  )

  /**
   * Check if a group is complete (all pages in group are complete)
   */
  const isGroupComplete = useCallback(
    (groupId: string): boolean => {
      if (!normalisedConfig.stages) return false

      for (const stage of normalisedConfig.stages) {
        const group = stage.groups.find((g) => g.id === groupId)
        if (group) {
          const visiblePagesInGroup = getVisiblePagesForGroup(group)
          return visiblePagesInGroup.every((page) => isPageComplete(page.id))
        }
      }
      return false
    },
    [normalisedConfig.stages, getVisiblePagesForGroup, isPageComplete]
  )

  /**
   * Check if a stage is complete (all groups in stage are complete)
   */
  const isStageComplete = useCallback(
    (stageId: string): boolean => {
      if (!normalisedConfig.stages) return false

      const stage = normalisedConfig.stages.find((s) => s.id === stageId)
      if (!stage) return false

      const visibleGroups = getVisibleGroupsForStage(stage)
      return visibleGroups.every((group) => isGroupComplete(group.id))
    },
    [normalisedConfig.stages, getVisibleGroupsForStage, isGroupComplete]
  )

  /**
   * Get page completion status (only considers visible questions)
   */
  const getPageCompletionStatus = useCallback(
    (pageId: string): PageCompletionStatus => {
      const page = findPageById(normalisedConfig, pageId)
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
    [normalisedConfig, state.answers, allAnswers]
  )

  /**
   * Get latest accessible page index
   * Returns the highest visible page index where all previous visible pages are complete
   * Respects navigation configuration (sequential vs free)
   */
  const getLatestAccessiblePageIndex = useCallback((): number => {
    if (visiblePages.length === 0) return 0

    const navConfig = normalisedConfig.navigation
    const pageOrder = navConfig?.pageOrder || 'sequential'

    // If free navigation, all pages are accessible
    if (pageOrder === 'free') {
      const lastPage = visiblePages[visiblePages.length - 1]
      if (lastPage) {
        const index = allPages.findIndex((p) => p.id === lastPage.id)
        return index >= 0 ? index : 0
      }
      return 0
    }

    // Sequential navigation - check completion
    let latestAccessible = 0

    for (let i = 1; i < visiblePages.length; i++) {
      // Check if all visible pages BEFORE this one (i) are complete
      let allPreviousComplete = true
      for (let j = 0; j < i; j++) {
        const page = visiblePages[j]
        if (!isPageComplete(page.id)) {
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
      const actualIndex = allPages.findIndex(
        (p) => p.id === latestVisiblePage.id
      )
      return actualIndex >= 0 ? actualIndex : 0
    }

    return 0
  }, [visiblePages, allPages, isPageComplete, normalisedConfig.navigation])

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
    (page: SurveyPage) => {
      return page.questions.filter((question) =>
        shouldShowQuestion(question, allAnswers)
      )
    },
    [allAnswers]
  )

  /**
   * Get visible stages
   */
  const getVisibleStages = useCallback(() => {
    return visibleStages
  }, [visibleStages])

  /**
   * Get visible groups for a stage
   */
  const getVisibleGroups = useCallback(
    (stage: SurveyStage) => {
      return getVisibleGroupsForStage(stage)
    },
    [getVisibleGroupsForStage]
  )

  /**
   * Navigate to a specific stage
   */
  const goToStage = useCallback(
    (stageId: string) => {
      const stage = normalisedConfig.stages?.find((s) => s.id === stageId)
      if (!stage) return

      const visibleGroups = getVisibleGroupsForStage(stage)
      if (visibleGroups.length === 0) return

      const firstGroup = visibleGroups[0]
      const visiblePagesInGroup = getVisiblePagesForGroup(firstGroup)
      if (visiblePagesInGroup.length === 0) return

      const firstPage = visiblePagesInGroup[0]
      const pageIndex = allPages.findIndex((p) => p.id === firstPage.id)
      if (pageIndex >= 0) {
        setState((prev) => ({
          ...prev,
          currentPageIndex: pageIndex,
        }))
      }
    },
    [
      normalisedConfig.stages,
      getVisibleGroupsForStage,
      getVisiblePagesForGroup,
      allPages,
    ]
  )

  /**
   * Check if can navigate to a stage (respects navigation config)
   */
  const canNavigateToStage = useCallback(
    (stageId: string): boolean => {
      const navConfig = normalisedConfig.navigation
      const stageOrder = navConfig?.stageOrder || 'sequential'

      if (stageOrder === 'free') return true

      // Sequential: check if all previous stages are complete
      if (!normalisedConfig.stages) return false

      const stageIndex = normalisedConfig.stages.findIndex(
        (s) => s.id === stageId
      )
      if (stageIndex <= 0) return true // First stage is always accessible

      // Check all previous stages are complete
      for (let i = 0; i < stageIndex; i++) {
        const prevStage = normalisedConfig.stages[i]
        if (
          visibleStages.includes(prevStage) &&
          !isStageComplete(prevStage.id)
        ) {
          return false
        }
      }

      return true
    },
    [
      normalisedConfig.stages,
      normalisedConfig.navigation,
      visibleStages,
      isStageComplete,
    ]
  )

  /**
   * Check if can navigate to a group (respects navigation config)
   */
  const canNavigateToGroup = useCallback(
    (groupId: string): boolean => {
      const navConfig = normalisedConfig.navigation
      const groupOrder = navConfig?.groupOrder || 'sequential'

      if (groupOrder === 'free') return true

      // Sequential: check if all previous groups in same stage are complete
      if (!normalisedConfig.stages) return false

      for (const stage of normalisedConfig.stages) {
        const groupIndex = stage.groups.findIndex((g) => g.id === groupId)
        if (groupIndex >= 0) {
          if (groupIndex === 0) return true // First group is always accessible

          const visibleGroups = getVisibleGroupsForStage(stage)
          // Check all previous visible groups are complete
          for (let i = 0; i < groupIndex; i++) {
            const prevGroup = stage.groups[i]
            if (
              visibleGroups.includes(prevGroup) &&
              !isGroupComplete(prevGroup.id)
            ) {
              return false
            }
          }
          return true
        }
      }

      return false
    },
    [
      normalisedConfig.stages,
      normalisedConfig.navigation,
      getVisibleGroupsForStage,
      isGroupComplete,
    ]
  )

  /**
   * Get progress for a specific stage
   */
  const getStageProgress = useCallback(
    (stageId: string): number => {
      const stage = normalisedConfig.stages?.find((s) => s.id === stageId)
      if (!stage) return 0

      const visibleGroups = getVisibleGroupsForStage(stage)
      if (visibleGroups.length === 0) return 0

      let completedGroups = 0
      visibleGroups.forEach((group) => {
        if (isGroupComplete(group.id)) {
          completedGroups++
        }
      })

      return (completedGroups / visibleGroups.length) * 100
    },
    [normalisedConfig.stages, getVisibleGroupsForStage, isGroupComplete]
  )

  /**
   * Get progress for a specific group
   */
  const getGroupProgress = useCallback(
    (groupId: string): number => {
      if (!normalisedConfig.stages) return 0

      for (const stage of normalisedConfig.stages) {
        const group = stage.groups.find((g) => g.id === groupId)
        if (group) {
          const visiblePages = getVisiblePagesForGroup(group)
          if (visiblePages.length === 0) return 0

          let completedPages = 0
          visiblePages.forEach((page) => {
            if (isPageComplete(page.id)) {
              completedPages++
            }
          })

          return (completedPages / visiblePages.length) * 100
        }
      }

      return 0
    },
    [normalisedConfig.stages, getVisiblePagesForGroup, isPageComplete]
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
    currentStage,
    currentGroup,
    isFirstPage,
    isLastPage,
    progress,
    stageProgress,
    groupProgress,
    overallProgress,
    setAnswer,
    nextPage,
    prevPage,
    goToStage,
    submitSurvey,
    validateQuestion,
    getAnswerValue,
    isPageComplete,
    isGroupComplete,
    isStageComplete,
    getPageCompletionStatus,
    getLatestAccessiblePageIndex,
    getVisiblePages,
    getVisibleQuestions,
    getVisibleStages,
    getVisibleGroups,
    canNavigateToStage,
    canNavigateToGroup,
    getStageProgress,
    getGroupProgress,
  }
}
