import * as React from 'react'
import { useRef, useEffect } from 'react'

/**
 * Props for the ChatContainer component.
 */
export interface ChatContainerProps {
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  progress?: number
  title?: string
  className?: string
}

/**
 * A full-screen chat layout container for the chat survey interface.
 *
 * Provides a mobile-first layout with:
 * - Optional header with progress bar
 * - Scrollable message area that auto-scrolls to the bottom
 * - Sticky footer for the input area
 */
export function ChatContainer({
  header,
  footer,
  children,
  progress,
  title,
  className = '',
}: ChatContainerProps): React.JSX.Element {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when children change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [children])

  return (
    <div
      className={`
        flex flex-col h-screen
        bg-white
        max-w-2xl mx-auto
        ${className}
      `}
    >
      {/* Header */}
      {(header || title || progress !== undefined) && (
        <header className="flex-shrink-0 border-b border-[var(--ons-color-grey-15)]">
          {header || (
            <div className="px-4 py-3">
              {title && (
                <h1 className="text-lg font-semibold text-[var(--ons-color-black)]">
                  {title}
                </h1>
              )}
              {progress !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-[var(--ons-color-grey-75)] mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-[var(--ons-color-grey-15)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--ons-color-ocean-blue)] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </header>
      )}

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="
          flex-1 overflow-y-auto
          px-4 py-4
          bg-[var(--ons-color-grey-5)]/50
        "
      >
        <div className="max-w-2xl mx-auto space-y-4">{children}</div>
        <div ref={messagesEndRef} />
      </div>

      {/* Footer (input area) */}
      {footer && <footer className="flex-shrink-0">{footer}</footer>}
    </div>
  )
}

export default ChatContainer
