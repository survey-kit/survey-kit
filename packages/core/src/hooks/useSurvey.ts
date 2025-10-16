import { useState, useCallback, useMemo } from 'react'
import type {
  SurveyConfig,
  SurveyState,
  ValidationRule,
  SurveyQuestion,
} from '../types/survey'

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
}

/**
 * Hook for managing survey state and navigation
 */
export function useSurvey({
  config,
  onSubmit,
}: UseSurveyOptions): UseSurveyReturn {
  const [state, setState] = useState<SurveyState>({
    currentPageIndex: 0,
    answers: {},
    isSubmitted: false,
    errors: {},
  })

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
      const errors: string[] = []
      const answer = state.answers[question.id]?.value

      if (question.required && (!answer || answer === '')) {
        errors.push(question.label + ' is required')
      }

      if (question.validation) {
        question.validation.forEach((rule: ValidationRule) => {
          switch (rule.type) {
            case 'required':
              if (!answer || answer === '') {
                errors.push(rule.message || 'This field is required')
              }
              break
            case 'min':
              if (
                typeof answer === 'string' &&
                answer.length < (rule.value as number)
              ) {
                errors.push(
                  rule.message || `Minimum ${rule.value} characters required`
                )
              }
              break
            case 'max':
              if (
                typeof answer === 'string' &&
                answer.length > (rule.value as number)
              ) {
                errors.push(
                  rule.message || `Maximum ${rule.value} characters allowed`
                )
              }
              break
            case 'pattern':
              if (
                answer &&
                !new RegExp(rule.value as string).test(String(answer))
              ) {
                errors.push(rule.message || 'Invalid format')
              }
              break
            default:
              break
          }
        })
      }

      return errors
    },
    [state.answers]
  )

  /**
   * Set answer for a question
   */
  const setAnswer = useCallback((questionId: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: {
          questionId,
          value,
          isValid: true,
        },
      },
    }))
  }, [])

  /**
   * Move to next page
   */
  const nextPage = useCallback(() => {
    if (!isLastPage) {
      setState((prev) => ({
        ...prev,
        currentPageIndex: prev.currentPageIndex + 1,
      }))
    }
  }, [isLastPage])

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
  }
}
