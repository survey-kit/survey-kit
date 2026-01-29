import * as React from 'react'

/**
 * Props for the ChatBubble component.
 */
export interface ChatBubbleProps {
  variant: 'question' | 'answer'
  children: React.ReactNode
  timestamp?: string
  onClick?: () => void
  className?: string
}

/**
 * A chat message bubble component styled like a messaging application.
 *
 * Questions appear on the left with a light background, whilst answers
 * appear on the right with the primary colour background.
 */
export function ChatBubble({
  variant,
  children,
  timestamp,
  onClick,
  className = '',
}: ChatBubbleProps): React.JSX.Element {
  const isQuestion = variant === 'question'

  const bubbleStyles = isQuestion
    ? 'bg-[var(--ons-color-grey-5)] text-[var(--ons-color-black)] rounded-tl-sm'
    : 'bg-[var(--ons-color-ocean-blue)] text-white rounded-tr-sm'

  const alignmentStyles = isQuestion ? 'self-start mr-auto' : 'self-end ml-auto'

  const interactiveStyles = onClick
    ? 'cursor-pointer hover:opacity-90 transition-opacity'
    : ''

  return (
    <div
      className={`flex flex-col ${isQuestion ? 'items-start' : 'items-end'}`}
    >
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-2xl
          ${bubbleStyles}
          ${alignmentStyles}
          ${interactiveStyles}
          ${className}
          animate-[chat-bubble-in_0.3s_ease-out]
        `}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick()
                }
              }
            : undefined
        }
      >
        <div className="text-base leading-relaxed">{children}</div>
      </div>
      {timestamp && (
        <span className="text-xs text-[var(--ons-color-grey-75)] mt-1 px-1">
          {timestamp}
        </span>
      )}
    </div>
  )
}

export default ChatBubble
