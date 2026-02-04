import * as React from 'react'
import { cn } from '../../../lib/utils'

/**
 * Footer link configuration
 */
export interface FooterLink {
  label: string
  href?: string
  action?: string
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
  logoSmall?: string
  logoLarge?: string
  links?: FooterLink[]
  description?: string
  onAction?: (actionId: string) => void
}

/**
 * Footer component with configurable links and responsive design.
 * Follows ONS design patterns.
 */
const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      className,
      children,
      logoSmall,
      logoLarge,
      links,
      description,
      onAction,
      ...props
    },
    ref
  ) => {
    const handleLinkClick = (
      e: React.MouseEvent<HTMLAnchorElement>,
      link: FooterLink
    ) => {
      if (link.action && onAction) {
        e.preventDefault()
        onAction(link.action)
      }
    }

    const renderLogo = () => {
      if (logoSmall || logoLarge) {
        return (
          <div className="flex items-center">
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
        <div className="w-full mx-auto px-4 sm:px-8 py-6">
          {/* Footer Links */}
          {links && links.length > 0 && (
            <nav
              className="flex flex-wrap gap-x-6 gap-y-2 mb-4"
              aria-label="Footer navigation"
            >
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href || '#'}
                  onClick={(e) => handleLinkClick(e, link)}
                  className="text-[var(--ons-color-ocean-blue,#003c57)] underline hover:no-underline text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-[var(--ons-color-grey-75,#707070)] mb-4">
              {description}
            </p>
          )}

          {/* Logo */}
          {renderLogo()}

          {/* Additional children */}
          {children}
        </div>
      </footer>
    )
  }
)
Footer.displayName = 'Footer'

export { Footer }
