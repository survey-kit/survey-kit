import React from 'react'
import { Wrapper, Header, Sidebar, Heading, Button } from '@survey-kit/registry'

interface SurveyLayoutProps {
  title: string
  description?: string
  sidebarItems?: Array<{ label: string; active?: boolean }>
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  showPrevious?: boolean
  showNext?: boolean
}

/**
 * Main survey layout combining header, sidebar, and content area
 */
export function SurveyLayout({
  title,
  description,
  sidebarItems = [],
  children,
  onBack,
  onNext,
  showPrevious = false,
  showNext = true,
}: SurveyLayoutProps): React.JSX.Element {
  return (
    <Wrapper maxWidth="full" padding="lg">
      <Header
        logo={<Heading level="h2">{title}</Heading>}
        actions={
          <div className="flex gap-2">
            {showPrevious && onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            {showNext && onNext && <Button onClick={onNext}>Next</Button>}
          </div>
        }
      />

      <div className="flex gap-8 mt-8">
        {sidebarItems.length > 0 && (
          <Sidebar>
            {sidebarItems.map((item) => (
              <div key={item.label} className={item.active ? 'font-bold' : ''}>
                {item.label}
              </div>
            ))}
          </Sidebar>
        )}

        <div className="flex-1">
          {description && <p className="text-gray-600 mb-6">{description}</p>}
          {children}
        </div>
      </div>
    </Wrapper>
  )
}
