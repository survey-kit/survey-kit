import * as React from 'react'
import { Button } from '../../primitives/button/button'
import { Card } from '../../primitives/card/card'
import { Heading } from '../../primitives/heading/heading'
import { cn } from '../../../lib/utils'

export interface BlockedPageProps {
  redirectUrl: string
  message?: string
  className?: string
}

/**
 * BlockedPage component - shown when user tries to access a page they haven't unlocked yet
 */
export function BlockedPage({
  redirectUrl,
  message = 'Please complete all required questions on previous pages before accessing this page.',
  className,
}: BlockedPageProps): React.JSX.Element {
  const handleRedirect = () => {
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center min-h-[400px]',
        className
      )}
    >
      <Card className="max-w-md w-full p-8 text-center">
        <Heading level="h2" className="mb-4">
          Page Not Available
        </Heading>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button onClick={handleRedirect} variant="default">
          Return to Latest Question
        </Button>
      </Card>
    </div>
  )
}
