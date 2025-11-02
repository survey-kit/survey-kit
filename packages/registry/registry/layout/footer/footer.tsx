import * as React from 'react'
import { cn } from '../../../lib/utils'

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  logoSmall?: string // Path to small logo image
  logoLarge?: string // Path to large logo image
}

/**
 * Footer component
 * Styling handled by registry, not config
 */
const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, children, logoSmall, logoLarge, ...props }, ref) => {
    const renderLogo = () => {
      if (logoSmall || logoLarge) {
        return (
          <div className="flex items-center gap-2">
            {logoSmall && (
              <img
                src={logoSmall}
                alt=""
                className="h-6 w-6 sm:hidden"
                aria-hidden="true"
              />
            )}
            {logoLarge && (
              <img
                src={logoLarge}
                alt=""
                className="h-6 w-auto hidden sm:block"
                aria-hidden="true"
              />
            )}
          </div>
        )
      }
      return null
    }

    return (
      <footer
        ref={ref}
        className={cn(
          'border-t border-gray-200 bg-gray-100 mt-auto',
          className
        )}
        {...props}
      >
        <div className="max-w-4xl px-8 py-4 flex items-center gap-2">
          {renderLogo()}
          {children}
        </div>
      </footer>
    )
  }
)
Footer.displayName = 'Footer'

export { Footer }
