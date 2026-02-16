import * as React from 'react'
import { cn } from '../../../lib/utils'

export interface MainContentProps extends React.HTMLAttributes<HTMLDivElement> {
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
      className={cn('bg-white flex-1 flex flex-col', className)}
      role="main"
      aria-label="Main content"
      {...props}
    >
      {children}
    </div>
  )
)
MainContent.displayName = 'MainContent'

export { MainContent }
