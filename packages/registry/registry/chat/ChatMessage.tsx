import * as React from 'react'
import { ChatBubble } from './ChatBubble'

/**
 * Represents a survey question for the chat interface.
 */
export interface ChatQuestion {
  id: string
  label: string
  type: 'text' | 'radio' | 'checkbox'
  options?: Array<{ value: string; label: string }>
  required?: boolean
  description?: string
}

/**
 * Props for the ChatMessage component.
 */
export interface ChatMessageProps {
  question: ChatQuestion
  answer?: unknown
  isEditing?: boolean
  onEdit?: () => void
  className?: string
}

/**
 * Formats an answer value for display in the chat bubble.
 */
function formatAnswer(answer: unknown, question: ChatQuestion): string {
  if (answer === null || answer === undefined || answer === '') {
    return ''
  }

  // Handle checkbox (array of values)
  if (Array.isArray(answer)) {
    if (answer.length === 0) return ''
    // Map values to labels if options exist
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
 * A chat message component that displays a question and its answer.
 *
 * The question appears as a left-aligned bubble, and if an answer exists,
 * it appears as a right-aligned bubble below. Users can click on answered
 * messages to edit their response.
 */
export function ChatMessage({
  question,
  answer,
  isEditing = false,
  onEdit,
  className = '',
}: ChatMessageProps): React.JSX.Element {
  const formattedAnswer = formatAnswer(answer, question)
  const hasAnswer = formattedAnswer !== ''

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Question bubble */}
      <ChatBubble variant="question">
        <span className="font-medium">{question.label}</span>
        {question.description && (
          <p className="text-sm opacity-80 mt-1">{question.description}</p>
        )}
      </ChatBubble>

      {/* Answer bubble (if answered) */}
      {hasAnswer && (
        <ChatBubble
          variant="answer"
          onClick={onEdit}
          className={`
            ${onEdit ? 'group relative' : ''}
            ${isEditing ? 'ring-2 ring-[var(--ons-color-sun-yellow)] ring-offset-2' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            {isEditing && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                Editing...
              </span>
            )}
            <span>{formattedAnswer}</span>
          </div>
          {onEdit && !isEditing && (
            <span className="ml-2 text-xs opacity-70 group-hover:opacity-100">
              (tap to edit)
            </span>
          )}
        </ChatBubble>
      )}
    </div>
  )
}

export default ChatMessage
