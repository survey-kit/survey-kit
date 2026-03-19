import { X } from 'lucide-react'
import type { SurveyResponseItem } from './ResponseList'

function getAnswerValue(answer: unknown): unknown {
  if (typeof answer === 'object' && answer !== null && 'value' in answer) {
    return (answer as { value: unknown }).value
  }
  return answer
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export interface ResponseDetailPanelProps {
  response: SurveyResponseItem | null
  questionLabels: Record<string, string>
  onClose: () => void
}

export function ResponseDetailPanel({
  response,
  questionLabels,
  onClose,
}: ResponseDetailPanelProps) {
  const isOpen = response != null

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--ons-color-white)] border-l border-[var(--ons-color-grey-15)] shadow-[-4px_0_20px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {response && (
          <>
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--ons-color-grey-15)]">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-semibold text-[var(--ons-color-black)]">
                  Response details
                </h2>
                <p className="text-sm text-[var(--ons-color-grey-75)]">
                  {response.metadata?.completionTime != null
                    ? `Completed at ${formatDate(response.createdAt)}`
                    : `Incomplete ${formatDate(response.createdAt)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-md text-[var(--ons-color-grey-75)] hover:text-[var(--ons-color-black)] hover:bg-[var(--ons-color-grey-15)] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              tabIndex={0}
              role="region"
              aria-label="Response answers"
            >
              {Object.entries(response.answers).map(([questionId, answer]) => {
                const value = getAnswerValue(answer)
                const display = Array.isArray(value)
                  ? value.join(', ')
                  : String(value ?? '—')
                const label = questionLabels[questionId] ?? questionId
                return (
                  <div key={questionId} className="text-sm">
                    <span className="font-medium text-[var(--ons-color-black)] block mb-0.5">
                      {label}
                    </span>
                    <span className="text-[var(--ons-color-grey-75)]">
                      {display}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}
