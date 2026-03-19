import { useState, useMemo } from 'react'
import { Input } from '@survey-kit/registry'
import { ResponseDetailPanel } from './ResponseDetailPanel'

export interface SurveyResponseItem {
  responseId: string
  createdAt: string
  answers: Record<string, unknown>
  metadata?: { completionTime?: number }
}

export interface ResponseCardProps {
  response: SurveyResponseItem
  questionLabels: Record<string, string>
  onSelect: () => void
  isSelected: boolean
}

function getAnswerValue(answer: unknown): unknown {
  if (typeof answer === 'object' && answer !== null && 'value' in answer) {
    return (answer as { value: unknown }).value
  }
  return answer
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const dateStr = d.toLocaleDateString(undefined, { dateStyle: 'medium' })
    const timeStr = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return `${dateStr}, ${timeStr}`
  } catch {
    return iso
  }
}

export function ResponseCard({
  response,
  questionLabels,
  onSelect,
  isSelected,
}: ResponseCardProps) {
  const isComplete = response.metadata?.completionTime != null

  const firstAnswerLabel = useMemo(() => {
    const firstKey = Object.keys(response.answers)[0]
    if (!firstKey) return null
    const label = questionLabels[firstKey] ?? firstKey
    const val = getAnswerValue(response.answers[firstKey])
    const str = Array.isArray(val) ? val.join(', ') : String(val ?? '')
    if (!str) return null
    return `${label}: ${str.length > 40 ? str.slice(0, 40) + '…' : str}`
  }, [response.answers, questionLabels])

  return (
    <div
      className={` border rounded-md bg-[var(--ons-color-white)] cursor-pointer hover:bg-[var(--ons-color-grey-5)] transition-colors ${
        isSelected
          ? 'ring-2 ring-[var(--ons-color-ocean-blue)] border-[var(--ons-color-ocean-blue)]'
          : 'border'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="p-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--ons-color-black)]">
            {isComplete ? 'Completed at' : 'Incomplete'}{' '}
            {formatDate(response.createdAt)}
          </span>
          <span className="text-xs text-[var(--ons-color-grey-75)]">
            {response.responseId ?? '—'}
          </span>
        </div>
        {firstAnswerLabel && (
          <p className="text-sm text-[var(--ons-color-grey-75)] truncate">
            {firstAnswerLabel}
          </p>
        )}
      </div>
    </div>
  )
}

export interface ResponseListProps {
  responses: SurveyResponseItem[]
  questionLabels: Record<string, string>
}

/**
 * List of survey responses with search and a side panel for details.
 */
export function ResponseList({ responses, questionLabels }: ResponseListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null
  )

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return responses
    const q = searchQuery.toLowerCase().trim()
    return responses.filter((r) => {
      const answerText = Object.values(r.answers)
        .map((a) => {
          const v = getAnswerValue(a)
          return Array.isArray(v) ? v.join(' ') : String(v ?? '')
        })
        .join(' ')
      const searchableText =
        `${r.responseId} ${r.createdAt} ${answerText}`.toLowerCase()
      return searchableText.includes(q)
    })
  }, [responses, searchQuery])

  const selectedResponse = useMemo(
    () =>
      selectedResponseId
        ? (filtered.find((r) => r.responseId === selectedResponseId) ?? null)
        : null,
    [filtered, selectedResponseId]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="response-search"
          className="text-sm font-medium text-[var(--ons-color-black)]"
        >
          Search responses
        </label>
        <Input
          id="response-search"
          type="search"
          placeholder="Search by ID, date or answer content…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto p-4 border rounded-md">
        {filtered.length === 0 ? (
          <p className="text-[var(--ons-color-grey-75)] text-sm py-4">
            {searchQuery
              ? 'No responses match your search.'
              : 'No responses yet.'}
          </p>
        ) : (
          filtered.map((r) => (
            <ResponseCard
              key={r.responseId}
              response={r}
              questionLabels={questionLabels}
              onSelect={() => setSelectedResponseId(r.responseId)}
              isSelected={selectedResponseId === r.responseId}
            />
          ))
        )}
      </div>
      <ResponseDetailPanel
        response={selectedResponse}
        questionLabels={questionLabels}
        onClose={() => setSelectedResponseId(null)}
      />
    </div>
  )
}
