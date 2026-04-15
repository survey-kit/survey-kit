import * as React from 'react'
import { useRef, useEffect, useState } from 'react'
import { Info, X } from 'lucide-react'

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
  showInfoButton?: boolean
  infoDrawerContent?: React.ReactNode
  /**
   * When set, the messages pane scrolls to the bottom only when this value changes
   * (avoids re-scrolling on every parent re-render, e.g. each keystroke in chat input).
   * When omitted, scroll follows `children` changes (legacy behaviour).
   */
  autoScrollKey?: string
}

/**
 * Full-screen chat layout for the survey interface.
 * Mobile-first: header with progress bar, scrollable messages, sticky footer.
 */
export function ChatContainer({
  header,
  footer,
  children,
  progress,
  title,
  className = '',
  showInfoButton = true,
  infoDrawerContent,
  autoScrollKey,
}: ChatContainerProps): React.JSX.Element {
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Prefer stable key so typing in the footer does not re-trigger scroll (iOS keyboard jank).
  useEffect(() => {
    if (autoScrollKey === undefined) return
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [autoScrollKey])

  useEffect(() => {
    if (autoScrollKey !== undefined) return
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [children, autoScrollKey])

  const defaultDrawerContent = (
    <div className="space-y-4 text-[var(--ons-color-black)]">
      <p className="text-base leading-relaxed">
        This is a survey presented as a chat conversation.
      </p>
      <p className="text-base leading-relaxed">
        Tap any of your answers to change them.
      </p>
      <p className="text-base leading-relaxed">
        You&apos;re talking to a survey, not a human or AI.
      </p>
    </div>
  )

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
        <header className="flex-shrink-0 sticky top-0 w-full z-10 border-b border-[var(--ons-color-grey-15)] bg-white">
          {header || (
            <div className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                {title && (
                  <h1 className="text-lg font-semibold text-[var(--ons-color-black)]">
                    {title}
                  </h1>
                )}
                {showInfoButton && (
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex-shrink-0 p-1.5 rounded-full text-[var(--ons-color-grey-75)] hover:text-[var(--ons-color-black)] hover:bg-[var(--ons-color-grey-15)] transition-colors"
                    aria-label="Information"
                  >
                    <Info className="w-5 h-5" aria-hidden />
                  </button>
                )}
              </div>
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
                      aria-label="Progress"
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
          flex-1 min-h-0 overflow-y-auto
          px-4 py-4
          bg-[var(--ons-color-grey-5)]/50
        "
      >
        <div className="max-w-2xl mx-auto space-y-4">{children}</div>
      </div>

      {/* Footer (input area) */}
      {footer && (
        <footer className="flex-shrink-0 sticky bottom-0 w-full z-10">
          <div className="px-2 pb-1 sm:p-0 bg-white border-t border-[var(--ons-color-grey-15)]">
            {footer}
          </div>
        </footer>
      )}

      {/* Info drawer */}
      {showInfoButton && (
        <>
          <div
            role="presentation"
            onClick={() => setIsDrawerOpen(false)}
            className={`
              fixed inset-0 z-40 bg-black/40 transition-opacity duration-300
              ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
          />
          <div
            className={`
              fixed inset-x-0 bottom-0 z-50
              bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)]
              max-w-2xl mx-auto
              transition-transform duration-300 ease-out
              ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}
            `}
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--ons-color-black)]">
                  Information
                </h2>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full text-[var(--ons-color-grey-75)] hover:text-[var(--ons-color-black)] hover:bg-[var(--ons-color-grey-15)] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>
              {infoDrawerContent ?? defaultDrawerContent}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatContainer
