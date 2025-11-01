import * as React from 'react'
import { cn } from '../../../lib/utils'

export interface MainContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * Main content wrapper component
 * Styling handled by registry, not config
 */
const MainContent = React.forwardRef<HTMLDivElement, MainContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white px-8 py-8 max-w-4xl mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
MainContent.displayName = 'MainContent'

export { MainContent }

