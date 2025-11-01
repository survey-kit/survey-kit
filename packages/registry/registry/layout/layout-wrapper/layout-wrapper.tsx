import * as React from 'react'
import { cn } from '../../../lib/utils'

export interface LayoutWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * Layout wrapper component - provides full-height container
 * Styling handled by registry, not config
 */
const LayoutWrapper = React.forwardRef<HTMLDivElement, LayoutWrapperProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-white flex flex-col', className)}
      {...props}
    >
      {children}
    </div>
  )
)
LayoutWrapper.displayName = 'LayoutWrapper'

export { LayoutWrapper }
