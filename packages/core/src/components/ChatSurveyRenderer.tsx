import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { SurveyConfig, SurveyQuestion, SurveyPage } from '../types/survey'
import { useSurvey } from '../hooks/useSurvey'
import { shouldShowQuestion } from '../lib/conditional'
import { getAllPages } from '../lib/migration'

/**
 * Configuration for the typing indicator delay.
 */
export interface TypingDelayConfig {
  min: number
  max: number
}

/**
 * Props for the ChatSurveyRenderer component.
 */
export interface ChatSurveyRendererProps {
  config: SurveyConfig
  components: {
    ChatBubble: React.ComponentType<{
      variant: 'question' | 'answer'
      children: React.ReactNode
      onClick?: () => void
      className?: string
    }>
    ChatMessage: React.ComponentType<{
      question: {
        id: string
        label: string
        type: 'text' | 'radio' | 'checkbox'
        options?: Array<{ value: string; label: string }>
        required?: boolean
        description?: string
      }
      answer?: unknown
      isEditing?: boolean
      onEdit?: () => void
      className?: string
    }>
    ChatInput: React.ComponentType<{
      type: 'text' | 'radio' | 'checkbox'
      value: unknown
      onChange: (value: unknown) => void
      onSubmit: () => void
      onSkip?: () => void
      options?: Array<{ value: string; label: string }>
      placeholder?: string
      required?: boolean
      disabled?: boolean
    }>
    TypingIndicator: React.ComponentType<{
      isVisible: boolean
    }>
    ChatContainer: React.ComponentType<{
      header?: React.ReactNode
      footer?: React.ReactNode
      children: React.ReactNode
      progress?: number
      title?: string
    }>
    ChatReviewScreen: React.ComponentType<{
      questions: Array<{
        id: string
        label: string
        type: 'text' | 'radio' | 'checkbox'
        options?: Array<{ value: string; label: string }>
      }>
      answers: Record<string, unknown>
      onEdit: (questionId: string) => void
      onSubmit: () => void
      isSubmitting?: boolean
    }>
  }
  onSubmit?: (answers: Record<string, unknown>) => Promise<void> | void
  typingDelay?: TypingDelayConfig
}

/**
 * Chat-style survey renderer that displays surveys as a messaging conversation.
 *
 * Reuses the `useSurvey` hook for state management whilst providing
 * a completely different UI paradigm. Questions appear one at a time
 * as chat bubbles, with answers displayed as user messages.
 *
 * Features:
 * - Typing indicator before each new question
 * - Configurable delay timing
 * - Review screen before submission
 * - Edit capability for previous answers
 */
export function ChatSurveyRenderer({
  config,
  components,
  onSubmit,
  typingDelay = { min: 500, max: 1500 },
}: ChatSurveyRendererProps): React.JSX.Element {
  const {
    ChatMessage,
    ChatInput,
    TypingIndicator,
    ChatContainer,
    ChatReviewScreen,
  } = components

  // Use the existing survey hook for state management
  const survey = useSurvey({ config, onSubmit })

  // Flatten all questions from all pages
  const allQuestions = useMemo(() => {
    const pages = getAllPages(config)
    const questions: Array<SurveyQuestion & { pageId: string }> = []

    pages.forEach((page: SurveyPage) => {
      page.questions.forEach((q: SurveyQuestion) => {
        questions.push({ ...q, pageId: page.id })
      })
    })

    return questions
  }, [config])

  // Get all answers as a flat record
  const allAnswers = useMemo(() => {
    const answers: Record<string, unknown> = {}
    Object.entries(survey.state.answers).forEach(([key, value]) => {
      answers[key] = (value as { value: unknown }).value
    })
    return answers
  }, [survey.state.answers])

  // Filter to visible questions
  const visibleQuestions = useMemo(() => {
    return allQuestions.filter((q) => shouldShowQuestion(q, allAnswers))
  }, [allQuestions, allAnswers])

  // Current question index in the chat flow
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    // Start from the first unanswered question
    const firstUnanswered = visibleQuestions.findIndex((q) => {
      const answer = allAnswers[q.id]
      return (
        answer === undefined ||
        answer === null ||
        answer === '' ||
        (Array.isArray(answer) && answer.length === 0)
      )
    })
    return firstUnanswered >= 0 ? firstUnanswered : visibleQuestions.length
  })

  // Typing indicator state
  const [isTyping, setIsTyping] = useState(false)
  const [showingQuestionId, setShowingQuestionId] = useState<string | null>(
    null
  )

  // Review screen state
  const [showReview, setShowReview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Editing state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  )

  // Current input value (for controlled input)
  const [inputValue, setInputValue] = useState<unknown>(null)

  // Ref to track the latest input value (for async callbacks like radio auto-submit)
  const inputValueRef = useRef<unknown>(null)

  // Track locally submitted answers (to show bubbles before survey.state.answers updates)
  const [localAnswers, setLocalAnswers] = useState<Record<string, unknown>>({})

  // Combined answers: merge survey answers with local answers (local takes precedence for immediate display)
  const combinedAnswers = useMemo(() => {
    return { ...allAnswers, ...localAnswers }
  }, [allAnswers, localAnswers])

  // Reference to track if typing animation should run
  const typingTimeoutRef = useRef<number | null>(null)

  // Get random delay between min and max
  const getRandomDelay = useCallback(() => {
    return (
      Math.floor(Math.random() * (typingDelay.max - typingDelay.min)) +
      typingDelay.min
    )
  }, [typingDelay])

  // Show typing indicator then reveal question
  const showQuestionWithTyping = useCallback(
    (questionId: string) => {
      setIsTyping(true)
      const delay = getRandomDelay()

      typingTimeoutRef.current = window.setTimeout(() => {
        setIsTyping(false)
        setShowingQuestionId(questionId)
      }, delay)
    },
    [getRandomDelay]
  )

  // Current question being worked on
  const currentQuestion = useMemo(() => {
    if (editingQuestionId) {
      return visibleQuestions.find((q) => q.id === editingQuestionId) || null
    }
    return visibleQuestions[currentQuestionIndex] || null
  }, [visibleQuestions, currentQuestionIndex, editingQuestionId])

  // Trigger typing animation for new questions
  useEffect(() => {
    if (
      currentQuestion &&
      !editingQuestionId &&
      showingQuestionId !== currentQuestion.id
    ) {
      showQuestionWithTyping(currentQuestion.id)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [
    currentQuestion,
    editingQuestionId,
    showingQuestionId,
    showQuestionWithTyping,
  ])

  // Sync input value when editing
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = allAnswers[currentQuestion.id]
      const valueToSet = existingAnswer ?? null
      setInputValue(valueToSet)
      inputValueRef.current = valueToSet
    }
  }, [currentQuestion, allAnswers])

  // Note: answeredQuestions logic moved to displayedAnsweredQuestions in render

  // Handle answer submission
  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion) return

    // Use ref value to ensure we get the latest value (important for async radio auto-submit)
    const valueToSave = inputValueRef.current

    // Save the answer to both survey state and local state
    survey.setAnswer(currentQuestion.id, valueToSave)

    // Update local answers immediately so the bubble appears right away
    setLocalAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: valueToSave,
    }))

    if (editingQuestionId) {
      // Exit edit mode
      setEditingQuestionId(null)
      setInputValue(null)
      inputValueRef.current = null
    } else {
      // Move to next question
      const nextIndex = currentQuestionIndex + 1
      if (nextIndex >= visibleQuestions.length) {
        // All questions answered, show review
        setShowReview(true)
      } else {
        setCurrentQuestionIndex(nextIndex)
        setInputValue(null)
        inputValueRef.current = null
      }
    }
  }, [
    currentQuestion,
    editingQuestionId,
    currentQuestionIndex,
    visibleQuestions.length,
    survey,
  ])

  // Handle skip (for optional questions)
  const handleSkip = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex >= visibleQuestions.length) {
      setShowReview(true)
    } else {
      setCurrentQuestionIndex(nextIndex)
      setInputValue(null)
      inputValueRef.current = null
    }
  }, [currentQuestionIndex, visibleQuestions.length])

  // Handle edit request from review screen or chat message
  const handleEdit = useCallback((questionId: string) => {
    setShowReview(false)
    setEditingQuestionId(questionId)
  }, [])

  // Handle input value changes - updates both state and ref
  const handleInputChange = useCallback((value: unknown) => {
    setInputValue(value)
    inputValueRef.current = value
  }, [])

  // Handle final submission
  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await survey.submitSurvey()
    } finally {
      setIsSubmitting(false)
    }
  }, [survey])

  // Calculate progress
  const progress = useMemo(() => {
    if (visibleQuestions.length === 0) return 0
    return (currentQuestionIndex / visibleQuestions.length) * 100
  }, [currentQuestionIndex, visibleQuestions.length])

  // Map question type to chat input type
  const getChatInputType = (type: string): 'text' | 'radio' | 'checkbox' => {
    if (type === 'radio') return 'radio'
    if (type === 'checkbox') return 'checkbox'
    return 'text'
  }

  // Check if we should show the review screen
  // Either explicitly set, or we've answered all questions
  const allQuestionsAnswered = useMemo(() => {
    if (visibleQuestions.length === 0) return false
    return visibleQuestions.every((q) => {
      const answer = combinedAnswers[q.id]
      // For non-required questions, empty answers are acceptable
      if (!q.required && !q.requiredToNavigate) return true
      return (
        answer !== undefined &&
        answer !== null &&
        answer !== '' &&
        !(Array.isArray(answer) && answer.length === 0)
      )
    })
  }, [visibleQuestions, combinedAnswers])

  // Show review screen when explicitly set OR when all questions are answered and no current question
  const shouldShowReview =
    showReview ||
    (allQuestionsAnswered && currentQuestionIndex >= visibleQuestions.length)

  if (shouldShowReview) {
    const reviewQuestions = visibleQuestions.map((q) => ({
      id: q.id,
      label: q.label,
      type: getChatInputType(q.type),
      options: q.options,
    }))

    return (
      <ChatContainer title={config.title} progress={100}>
        <ChatReviewScreen
          questions={reviewQuestions}
          answers={combinedAnswers}
          onEdit={handleEdit}
          onSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
        />
      </ChatContainer>
    )
  }

  // Main chat view
  // Determine if we should show the input
  const shouldShowInput =
    currentQuestion &&
    (editingQuestionId || // Always show input when editing
      (!isTyping && showingQuestionId === currentQuestion.id))

  // Get questions to display as answered (include current if answered and not editing)
  const displayedAnsweredQuestions = useMemo(() => {
    // Show all questions up to current index that have answers
    const answered = visibleQuestions
      .slice(0, currentQuestionIndex)
      .filter((q) => {
        const answer = combinedAnswers[q.id]
        return (
          answer !== undefined &&
          answer !== null &&
          answer !== '' &&
          !(Array.isArray(answer) && answer.length === 0)
        )
      })

    // If we're past the current index or on review, include all answered
    if (currentQuestionIndex >= visibleQuestions.length) {
      return visibleQuestions.filter((q) => {
        const answer = combinedAnswers[q.id]
        return (
          answer !== undefined &&
          answer !== null &&
          answer !== '' &&
          !(Array.isArray(answer) && answer.length === 0)
        )
      })
    }

    return answered
  }, [visibleQuestions, currentQuestionIndex, combinedAnswers])

  return (
    <ChatContainer
      title={config.title}
      progress={progress}
      footer={
        shouldShowInput ? (
          <ChatInput
            type={getChatInputType(currentQuestion.type)}
            value={inputValue}
            onChange={handleInputChange}
            onSubmit={handleSubmitAnswer}
            onSkip={
              !currentQuestion.required && !currentQuestion.requiredToNavigate
                ? handleSkip
                : undefined
            }
            options={currentQuestion.options}
            placeholder={currentQuestion.placeholder || 'Type your answer...'}
            required={
              currentQuestion.required || currentQuestion.requiredToNavigate
            }
          />
        ) : undefined
      }
    >
      {/* Answered questions */}
      {displayedAnsweredQuestions.map((question) => {
        const isBeingEdited = editingQuestionId === question.id
        return (
          <ChatMessage
            key={question.id}
            question={{
              id: question.id,
              label: question.label,
              type: getChatInputType(question.type),
              options: question.options,
              required: question.required || question.requiredToNavigate,
              description: question.description,
            }}
            answer={combinedAnswers[question.id]}
            isEditing={isBeingEdited}
            onEdit={!isBeingEdited ? () => handleEdit(question.id) : undefined}
          />
        )
      })}

      {/* Typing indicator */}
      <TypingIndicator isVisible={isTyping && !editingQuestionId} />

      {/* Current question (after typing animation, only if not already in answered list) */}
      {currentQuestion &&
        !isTyping &&
        !editingQuestionId &&
        showingQuestionId === currentQuestion.id &&
        !displayedAnsweredQuestions.find(
          (q) => q.id === currentQuestion.id
        ) && (
          <ChatMessage
            question={{
              id: currentQuestion.id,
              label: currentQuestion.label,
              type: getChatInputType(currentQuestion.type),
              options: currentQuestion.options,
              required:
                currentQuestion.required || currentQuestion.requiredToNavigate,
              description: currentQuestion.description,
            }}
            answer={combinedAnswers[currentQuestion.id]}
          />
        )}
    </ChatContainer>
  )
}

export default ChatSurveyRenderer
