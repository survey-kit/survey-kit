import * as React from 'react'
import { cn } from '../../../lib/utils'

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

/**
 * Footer component
 * Styling handled by registry, not config
 */
const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, children, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn('border-t border-gray-200 bg-gray-100 mt-auto', className)}
      {...props}
    >
      <div className="max-w-4xl mx-auto px-8 py-4">{children}</div>
    </footer>
  )
)
Footer.displayName = 'Footer'

export { Footer }
