import * as React from 'react'
import { useState } from 'react'
import { Button } from '../../primitives/button/button'
import { Card } from '../../primitives/card/card'
import { Heading } from '../../primitives/heading/heading'

/** A single bullet point in the list of data types or conditions to show up front. */
export interface ConsentDataType {
  id: string
  label: string
}

/** A structured block of the full notice. */
export interface ConsentNoticeBlock {
  title?: string
  subtitle?: string
  description?: string
  bulletPoints?: string[]
}

/** JSON-driven configuration for the generic consent gate. */
export interface ConsentConfig {
  id: string
  title: string
  description: string
  dataTypes?: ConsentDataType[]
  acceptButtonText?: string
  rejectButtonText?: string
  noticeBlocks?: ConsentNoticeBlock[]
  noticeLinkText?: string
  noticeBackText?: string
  rejectedTitle?: string
  rejectedDescription?: string
  rejectedLinkText?: string
  rejectedLinkHref?: string
}

/** Props for the ConsentGate component. */
export interface ConsentGateProps {
  config: ConsentConfig
  onAccept: () => void
  onReject: () => void
  onCancel?: () => void
  onReReview?: () => void
  status: 'pending' | 'accepted' | 'rejected'
  className?: string
}

/**
 * Full-screen consent gate.
 *
 * Displays an informational list of terms (dataTypes) the
 * survey may require and asks the user to accept or reject
 * before continuing. On rejection a static "cannot continue"
 * message is shown.
 *
 * Supports reading a structured `noticeBlocks` array to display
 * the full text instead of bare HTML.
 *
 * Passing "onCancel" puts the view in a non-blocking mode, so
 * users re-reviewing their consent can just exit easily without interacting.
 */
export function ConsentGate({
  config,
  onAccept,
  onReject,
  onCancel,
  onReReview,
  status,
  className = '',
}: ConsentGateProps): React.JSX.Element {
  const [rejected, setRejected] = useState(false)
  const [showNotice, setShowNotice] = useState(false)

  const {
    title,
    description,
    dataTypes = [],
    acceptButtonText = 'I understand and agree',
    rejectButtonText = 'I do not agree',
    noticeBlocks = [],
    noticeLinkText = 'View full notice',
    noticeBackText = 'Back',
    rejectedTitle = 'You cannot continue',
    rejectedDescription = 'You have declined consent required for this application. You cannot proceed without your agreement.',
    rejectedLinkText = 'Leave this site',
    rejectedLinkHref = 'https://www.google.com',
  } = config

  const handleReject = () => {
    setRejected(true)
    onReject()
  }

  const isReReview = onCancel !== undefined && status !== 'pending'

  /* Rejected state */
  if (rejected || status === 'rejected') {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--ons-color-grey-5,#f5f5f5)] ${className}`}
        role="alertdialog"
        aria-label="Consent declined"
      >
        <Card className="max-w-lg w-full mx-4 p-8 text-center">
          <Heading level="h2" className="mb-4">
            {rejectedTitle}
          </Heading>
          <p className="text-base text-[var(--ons-color-grey-75,#222)] mb-6">
            {rejectedDescription}
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href={rejectedLinkHref}
              className="text-[var(--ons-color-ocean-blue,#003c57)] underline hover:no-underline text-base font-bold"
            >
              {rejectedLinkText}
            </a>

            <button
              onClick={() => {
                setRejected(false)
                if (onReReview) {
                  onReReview()
                }
              }}
              className="text-[var(--ons-color-ocean-blue,#003c57)] underline hover:no-underline text-sm"
            >
              Re-review consent
            </button>
          </div>
        </Card>
      </div>
    )
  }

  /* Full notice view */
  if (showNotice && noticeBlocks.length > 0) {
    return (
      <div
        className={`fixed inset-0 z-[60] overflow-y-auto bg-[var(--ons-color-grey-5,#f5f5f5)] ${className}`}
        role="dialog"
        aria-label="Full notice"
      >
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="text-[var(--ons-color-black)] mb-8 space-y-6">
              {noticeBlocks.map((block, idx) => (
                <div key={idx} className="space-y-3">
                  {block.title && <Heading level="h2">{block.title}</Heading>}
                  {block.subtitle && (
                    <Heading level="h3">{block.subtitle}</Heading>
                  )}
                  {block.description && (
                    <p className="text-base">{block.description}</p>
                  )}
                  {block.bulletPoints && block.bulletPoints.length > 0 && (
                    <ul className="list-disc pl-6 space-y-1">
                      {block.bulletPoints.map((bp, i) => (
                        <li key={i} className="text-base">
                          {bp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowNotice(false)}
              variant="secondary"
              size="sm"
            >
              {noticeBackText}
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  /* Gate state */
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--ons-color-grey-5,#f5f5f5)] ${className}`}
      role="dialog"
      aria-label="Consent confirmation"
    >
      <Card className="max-w-lg w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <Heading level="h2" className="mb-3">
          {title}
        </Heading>

        <p className="text-base text-[var(--ons-color-black)] mb-4">
          {description}
        </p>

        {dataTypes.length > 0 && (
          <ul className="list-disc pl-6 mb-6 space-y-1">
            {dataTypes.map((dt) => (
              <li
                key={dt.id}
                className="text-base text-[var(--ons-color-grey-75,#222)]"
              >
                {dt.label}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button onClick={onAccept} size="sm">
            {acceptButtonText}
          </Button>
          <Button onClick={handleReject} variant="secondary" size="sm">
            {rejectButtonText}
          </Button>
          {noticeBlocks.length > 0 && (
            <button
              onClick={() => setShowNotice(true)}
              className="text-[var(--ons-color-ocean-blue,#003c57)] underline hover:no-underline text-base font-bold"
            >
              {noticeLinkText}
            </button>
          )}
        </div>

        {isReReview && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="text-[var(--ons-color-ocean-blue,#003c57)] underline hover:no-underline text-sm"
            >
              Go back and leave application as is
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ConsentGate
