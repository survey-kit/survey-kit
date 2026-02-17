import { useState, useEffect, useCallback, useMemo } from 'react'
import { validateQuestion as validateQuestionUtil } from '../../lib/validation'
import { shouldShowQuestion } from '../../lib/conditional'
import {
  normaliseSurveyConfig,
  getAllPages,
  getPageLocation,
} from '../../lib/configUtils'
import {
  getInitialState,
  saveToStorage,
  updateUrlWithPage,
  dispatchPageChangeEvent,
  dispatchAnswerChangeEvent,
  flattenAnswers,
  STORAGE_KEY_PREFIX,
} from './state'
import {
  getVisibleStages as computeVisibleStages,
  getVisibleGroupsForStage,
  getAllVisiblePages,
  getVisibleQuestionsForPage,
} from './visibility'
import {
  resolveNextPage,
  resolveGoToStagePageIndex,
  checkCanNavigateToStage,
  checkCanNavigateToGroup,
  computeLatestAccessiblePageIndex,
} from './navigation'
import {
  checkPageComplete,
  checkGroupComplete,
  checkStageComplete,
  computePageCompletionStatus,
} from './completion'
import {
  calculatePageProgress,
  calculateGroupProgress,
  calculateStageProgress,
  calculateOverallProgress,
  getStageProgressByCompletion,
  getGroupProgressByCompletion,
} from './progress'
import type {
  SurveyConfig,
  SurveyState,
  SurveyQuestion,
  SurveyStage,
  QuestionAnswer,
  SurveyGroup,
  SurveyPage,
  PageCompletionStatus,
} from '../../types/survey'

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
 * Hook for managing survey state and navigation.
 */
export function useSurvey({
  config,
  onSubmit,
}: UseSurveyOptions): UseSurveyReturn {
  // Derived config

  const normalisedConfig = useMemo(
    () => normaliseSurveyConfig(config),
    [config]
  )

  const allPages = useMemo(
    () => getAllPages(normalisedConfig),
    [normalisedConfig]
  )

  // State

  const [state, setState] = useState<SurveyState>(() =>
    getInitialState(config.id, allPages)
  )

  // Persist to localStorage and sync URL on every state change
  useEffect(() => {
    if (typeof window === 'undefined') return

    const currentPage = allPages[state.currentPageIndex]
    saveToStorage(config.id, state)
    updateUrlWithPage(currentPage?.id)

    if (currentPage?.id) {
      dispatchPageChangeEvent(currentPage.id)
    }
  }, [state, config, allPages])

  // Flat answers for conditional logic

  const allAnswers = useMemo(
    () => flattenAnswers(state.answers),
    [state.answers]
  )

  // Visibility

  const visibleStages = useMemo(
    () => computeVisibleStages(normalisedConfig.stages, allAnswers),
    [normalisedConfig.stages, allAnswers]
  )

  const visiblePages = useMemo(
    () => getAllVisiblePages(visibleStages, allAnswers),
    [visibleStages, allAnswers]
  )

  // Current location

  const currentPage = useMemo(
    () => allPages[state.currentPageIndex],
    [allPages, state.currentPageIndex]
  )

  const pageLocation = useMemo(() => {
    if (!currentPage) return null
    return getPageLocation(normalisedConfig, currentPage.id)
  }, [normalisedConfig, currentPage])

  const currentStage = pageLocation?.stage || null
  const currentGroup = pageLocation?.group || null

  const visibleQuestions = useMemo(
    () =>
      currentPage ? getVisibleQuestionsForPage(currentPage, allAnswers) : [],
    [currentPage, allAnswers]
  )

  const currentQuestion = useMemo(
    () => visibleQuestions[0] || null,
    [visibleQuestions]
  )

  // First / last checks

  const isFirstPage = useMemo(() => {
    if (!currentPage) return false
    return visiblePages.findIndex((p) => p.id === currentPage.id) === 0
  }, [visiblePages, currentPage])

  const isLastPage = useMemo(() => {
    if (!currentPage) return false
    return (
      visiblePages.findIndex((p) => p.id === currentPage.id) ===
      visiblePages.length - 1
    )
  }, [visiblePages, currentPage])

  // Progress

  const progress = useMemo(
    () => calculatePageProgress(currentPage, currentGroup, allAnswers),
    [currentPage, currentGroup, allAnswers]
  )

  const groupProgress = useMemo(
    () => calculateGroupProgress(currentGroup, currentStage, allAnswers),
    [currentGroup, currentStage, allAnswers]
  )

  const stageProgress = useMemo(
    () => calculateStageProgress(currentStage, visibleStages),
    [currentStage, visibleStages]
  )

  const overallProgress = useMemo(
    () => calculateOverallProgress(currentPage, visiblePages),
    [currentPage, visiblePages]
  )

  // Callbacks

  const validateQuestion = useCallback(
    (question: SurveyQuestion): string[] => {
      const answer = state.answers[question.id]?.value
      return validateQuestionUtil(question, answer, allAnswers)
    },
    [state.answers, allAnswers]
  )

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

        const newErrors = { ...prev.errors }
        delete newErrors[questionId]

        // Persist immediately so other listeners can react
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
          dispatchAnswerChangeEvent(questionId, config.id)
        }

        return { ...prev, answers: newAnswers, errors: newErrors }
      })
    },
    [config.id]
  )

  const nextPage = useCallback(() => {
    if (isLastPage || !currentPage) return

    const result = resolveNextPage(
      currentPage,
      state.currentPageIndex,
      visibleQuestions,
      allAnswers,
      allPages,
      visiblePages,
      validateQuestion
    )

    if (!result.canNavigate) {
      // Validation failed — merge errors into state
      setState((prev) => {
        const newErrors: Record<string, string[]> = {}
        const currentPageQuestionIds = new Set(
          currentPage.questions.map((q) => q.id)
        )
        // Keep errors from other pages
        Object.keys(prev.errors).forEach((questionId) => {
          if (!currentPageQuestionIds.has(questionId)) {
            newErrors[questionId] = prev.errors[questionId]
          }
        })
        // Add current-page errors
        Object.assign(newErrors, result.errors)
        return { ...prev, errors: newErrors }
      })
      return
    }

    // Navigation succeeded — clear current-page errors and advance
    setState((prev) => {
      const newErrors: Record<string, string[]> = {}
      const currentPageQuestionIds = new Set(
        currentPage.questions.map((q) => q.id)
      )
      Object.keys(prev.errors).forEach((questionId) => {
        if (!currentPageQuestionIds.has(questionId)) {
          newErrors[questionId] = prev.errors[questionId]
        }
      })

      return {
        ...prev,
        currentPageIndex: result.nextPageIndex,
        errors: newErrors,
      }
    })
  }, [
    isLastPage,
    currentPage,
    state.currentPageIndex,
    visibleQuestions,
    validateQuestion,
    allPages,
    allAnswers,
    visiblePages,
  ])

  const prevPage = useCallback(() => {
    if (!isFirstPage) {
      setState((prev) => ({
        ...prev,
        currentPageIndex: prev.currentPageIndex - 1,
      }))
    }
  }, [isFirstPage])

  const getAnswerValue = useCallback(
    (questionId: string): unknown => {
      return state.answers[questionId]?.value ?? null
    },
    [state.answers]
  )

  const goToStage = useCallback(
    (stageId: string) => {
      const pageIndex = resolveGoToStagePageIndex(
        stageId,
        normalisedConfig,
        allAnswers,
        allPages
      )
      if (pageIndex !== null) {
        setState((prev) => ({ ...prev, currentPageIndex: pageIndex }))
      }
    },
    [normalisedConfig, allAnswers, allPages]
  )

  // Completion

  const isPageComplete = useCallback(
    (pageId: string): boolean =>
      checkPageComplete(pageId, normalisedConfig, state.answers, allAnswers),
    [normalisedConfig, state.answers, allAnswers]
  )

  const isGroupComplete = useCallback(
    (groupId: string): boolean =>
      checkGroupComplete(groupId, normalisedConfig, state.answers, allAnswers),
    [normalisedConfig, state.answers, allAnswers]
  )

  const isStageComplete = useCallback(
    (stageId: string): boolean =>
      checkStageComplete(stageId, normalisedConfig, state.answers, allAnswers),
    [normalisedConfig, state.answers, allAnswers]
  )

  const getPageCompletionStatus = useCallback(
    (pageId: string): PageCompletionStatus =>
      computePageCompletionStatus(
        pageId,
        normalisedConfig,
        state.answers,
        allAnswers
      ),
    [normalisedConfig, state.answers, allAnswers]
  )

  // Navigation access

  const getLatestAccessiblePageIndex = useCallback(
    () =>
      computeLatestAccessiblePageIndex(
        visiblePages,
        allPages,
        normalisedConfig,
        isPageComplete
      ),
    [visiblePages, allPages, normalisedConfig, isPageComplete]
  )

  const getVisiblePages = useCallback(() => visiblePages, [visiblePages])

  const getVisibleQuestions = useCallback(
    (page: SurveyPage) => getVisibleQuestionsForPage(page, allAnswers),
    [allAnswers]
  )

  const getVisibleStagesCallback = useCallback(
    () => visibleStages,
    [visibleStages]
  )

  const getVisibleGroups = useCallback(
    (stage: SurveyStage) => getVisibleGroupsForStage(stage, allAnswers),
    [allAnswers]
  )

  const canNavigateToStage = useCallback(
    (stageId: string): boolean =>
      checkCanNavigateToStage(
        stageId,
        normalisedConfig,
        visibleStages,
        isStageComplete
      ),
    [normalisedConfig, visibleStages, isStageComplete]
  )

  const canNavigateToGroup = useCallback(
    (groupId: string): boolean =>
      checkCanNavigateToGroup(
        groupId,
        normalisedConfig,
        allAnswers,
        isGroupComplete
      ),
    [normalisedConfig, allAnswers, isGroupComplete]
  )

  // Per-entity progress

  const getStageProgress = useCallback(
    (stageId: string): number =>
      getStageProgressByCompletion(
        stageId,
        normalisedConfig,
        state.answers,
        allAnswers
      ),
    [normalisedConfig, state.answers, allAnswers]
  )

  const getGroupProgressCallback = useCallback(
    (groupId: string): number =>
      getGroupProgressByCompletion(
        groupId,
        normalisedConfig,
        state.answers,
        allAnswers
      ),
    [normalisedConfig, state.answers, allAnswers]
  )

  // Submit

  const submitSurvey = useCallback(async () => {
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
      setState((prev) => ({ ...prev, errors: allErrors }))
      return
    }

    setState((prev) => ({ ...prev, isSubmitted: true, errors: {} }))

    if (onSubmit) {
      await onSubmit(answers)
    }
  }, [visiblePages, allAnswers, validateQuestion, getAnswerValue, onSubmit])

  // Public API

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
    getVisibleStages: getVisibleStagesCallback,
    getVisibleGroups,
    canNavigateToStage,
    canNavigateToGroup,
    getStageProgress,
    getGroupProgress: getGroupProgressCallback,
  }
}
