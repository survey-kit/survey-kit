import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../../lib/utils'

const headerVariants = cva('flex items-center justify-between', {
  variants: {
    size: {
      sm: 'h-12 px-4',
      md: 'h-16 px-6',
      lg: 'h-20 px-8',
    },
    variant: {
      default: 'bg-background border-b',
      transparent: 'bg-transparent',
      primary: 'bg-night-blue text-white',
      secondary: 'bg-secondary text-secondary-foreground',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

export interface HeaderProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headerVariants> {
  logo?: React.ReactNode
  logoSmall?: string // Path to small logo image
  logoLarge?: string // Path to large logo image
  logoHref?: string // When set with a rendered logo, wraps the logo in `<a href={logoHref}>…</a>`
  logoLinkLabel?: string // aria-label for the logo link (use when images are decorative)
  actions?: React.ReactNode
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      size,
      variant,
      logo,
      logoSmall,
      logoLarge,
      logoHref,
      logoLinkLabel,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    const renderLogo = () => {
      if (logo) return logo

      if (logoSmall || logoLarge) {
        return (
          <div className="flex items-center gap-2">
            {logoSmall && (
              <img
                src={logoSmall}
                alt=""
                className="h-8 w-8 sm:hidden"
                aria-hidden="true"
              />
            )}
            {logoLarge && (
              <img
                src={logoLarge}
                alt=""
                className="h-8 w-auto hidden sm:block"
                aria-hidden="true"
              />
            )}
          </div>
        )
      }

      return null
    }

    const logoNode = renderLogo()
    const logoWithOptionalLink =
      logoNode && logoHref ? (
        <a
          href={logoHref}
          className={cn(
            'inline-flex items-center shrink-0 rounded-sm',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            variant === 'primary'
              ? 'focus-visible:outline-white'
              : 'focus-visible:outline-ocean-blue'
          )}
          aria-label={logoLinkLabel ?? 'Home'}
        >
          {logoNode}
        </a>
      ) : (
        logoNode
      )

    return (
      <header
        ref={ref}
        className={cn(headerVariants({ size, variant, className }))}
        role="banner"
        aria-label="Header"
        {...props}
      >
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {logoWithOptionalLink}
            {children}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
        </div>
      </header>
    )
  }
)
Header.displayName = 'Header'

export { Header, headerVariants }
