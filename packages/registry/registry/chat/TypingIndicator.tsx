import * as React from 'react'

/**
 * Props for the TypingIndicator component.
 */
export interface TypingIndicatorProps {
  isVisible: boolean
  className?: string
}

/**
 * An animated typing indicator that mimics messaging applications.
 *
 * Displays three bouncing dots to indicate that a message is being composed.
 * Styled as a left-aligned bubble to match the question bubble appearance.
 */
export function TypingIndicator({
  isVisible,
  className = '',
}: TypingIndicatorProps): React.JSX.Element | null {
  if (!isVisible) return null

  return (
    <div className={`flex items-start ${className}`}>
      <div
        className="
          bg-[var(--ons-color-grey-5)]
          rounded-2xl rounded-tl-sm
          px-4 py-3
          flex items-center gap-1
          animate-[chat-bubble-in_0.3s_ease-out]
        "
        aria-label="Typing indicator"
        role="status"
      >
        <span
          className="w-2 h-2 bg-[var(--ons-color-grey-75)] rounded-full animate-[typing-dot_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 bg-[var(--ons-color-grey-75)] rounded-full animate-[typing-dot_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: '200ms' }}
        />
        <span
          className="w-2 h-2 bg-[var(--ons-color-grey-75)] rounded-full animate-[typing-dot_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  )
}

export default TypingIndicator
