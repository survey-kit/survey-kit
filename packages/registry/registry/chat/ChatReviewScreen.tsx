import * as React from 'react'
import { Button } from '../primitives/button/button'

/**
 * Represents a question in the review screen.
 */
export interface ReviewQuestion {
  id: string
  label: string
  type: 'text' | 'radio' | 'checkbox'
  options?: Array<{ value: string; label: string }>
}

/**
 * Props for the ChatReviewScreen component.
 */
export interface ChatReviewScreenProps {
  questions: ReviewQuestion[]
  answers: Record<string, unknown>
  onEdit: (questionId: string) => void
  onSubmit: () => void
  isSubmitting?: boolean
  className?: string
}

/**
 * Formats an answer value for display.
 */
function formatAnswer(answer: unknown, question: ReviewQuestion): string {
  if (answer === null || answer === undefined || answer === '') {
    return 'Not answered'
  }

  // Handle checkbox (array of values)
  if (Array.isArray(answer)) {
    if (answer.length === 0) return 'Not answered'
    if (question.options) {
      return answer
        .map((val) => {
          const option = question.options?.find((o) => o.value === val)
          return option?.label ?? val
        })
        .join(', ')
    }
    return answer.join(', ')
  }

  // Handle radio (single value)
  if (typeof answer === 'string' && question.options) {
    const option = question.options.find((o) => o.value === answer)
    return option?.label ?? answer
  }

  return String(answer)
}

/**
 * A review/summary screen displayed before final survey submission.
 *
 * Shows all questions with their answers and provides edit buttons
 * for each answer. The user must explicitly confirm submission.
 */
export function ChatReviewScreen({
  questions,
  answers,
  onEdit,
  onSubmit,
  isSubmitting = false,
  className = '',
}: ChatReviewScreenProps): React.JSX.Element {
  return (
    <div className={`p-4 ${className}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--ons-color-leaf-green-tint)] mb-4">
            <svg
              className="w-8 h-8 text-[var(--ons-color-leaf-green)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--ons-color-black)]">
            Review Your Answers
          </h2>
          <p className="text-[var(--ons-color-grey-75)] mt-2">
            Please check your answers before submitting.
          </p>
        </div>

        {/* Answers list */}
        <div className="space-y-4 mb-8">
          {questions.map((question, index) => {
            const answer = answers[question.id]
            const formattedAnswer = formatAnswer(answer, question)
            const isAnswered =
              answer !== null &&
              answer !== undefined &&
              answer !== '' &&
              !(Array.isArray(answer) && answer.length === 0)

            return (
              <div
                key={question.id}
                className="
                  bg-white rounded-xl p-4
                  border border-[var(--ons-color-grey-15)]
                  shadow-sm
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--ons-color-grey-75)]">
                        Question {index + 1}
                      </span>
                    </div>
                    <p className="font-medium text-[var(--ons-color-black)]">
                      {question.label}
                    </p>
                    <p
                      className={`
                        mt-2 text-base
                        ${
                          isAnswered
                            ? 'text-[var(--ons-color-ocean-blue)]'
                            : 'text-[var(--ons-color-grey-75)] italic'
                        }
                      `}
                    >
                      {formattedAnswer}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(question.id)}
                    className="
                      px-3 py-1.5 rounded-lg
                      text-sm font-medium
                      text-[var(--ons-color-ocean-blue)]
                      hover:bg-[var(--ons-color-ocean-blue-tint)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--ons-color-ocean-blue)]/50
                      transition-colors
                    "
                    aria-label={`Edit answer for question ${index + 1}`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit button */}
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Survey'}
        </Button>
      </div>
    </div>
  )
}

export default ChatReviewScreen
