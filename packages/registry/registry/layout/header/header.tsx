import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../../lib/utils'

const headerVariants = cva('flex items-center justify-between w-full', {
  variants: {
    size: {
      sm: 'h-12 px-4',
      md: 'h-16 px-6',
      lg: 'h-20 px-8',
    },
    variant: {
      default: 'bg-background border-b',
      transparent: 'bg-transparent',
      primary: 'bg-ocean-blue text-white',
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
  actions?: React.ReactNode
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, size, variant, logo, actions, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(headerVariants({ size, variant, className }))}
        {...props}
      >
        <div className="flex items-center space-x-4">
          {logo}
          {children}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </header>
    )
  }
)
Header.displayName = 'Header'

export { Header, headerVariants }
