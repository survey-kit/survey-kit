import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../../lib/utils'

const wrapperVariants = cva('min-h-screen w-full', {
  variants: {
    layout: {
      default: 'flex flex-col',
      centered: 'flex flex-col items-center justify-center',
      sidebar: 'flex',
      grid: 'grid',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    maxWidth: {
      none: 'max-w-none',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    layout: 'default',
    padding: 'md',
    maxWidth: '2xl',
  },
})

export interface WrapperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof wrapperVariants> {
  children: React.ReactNode
}

const Wrapper = React.forwardRef<HTMLDivElement, WrapperProps>(
  ({ className, layout, padding, maxWidth, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          wrapperVariants({ layout, padding, maxWidth, className })
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Wrapper.displayName = 'Wrapper'

export { Wrapper, wrapperVariants }
