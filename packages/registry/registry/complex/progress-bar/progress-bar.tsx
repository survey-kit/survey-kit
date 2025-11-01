import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../../lib/utils'

const progressBarVariants = cva(
  'relative h-4 w-full overflow-hidden bg-secondary',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
      },
      variant: {
        default: 'bg-secondary',
        primary: 'bg-primary/20',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        destructive: 'bg-red-100',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

const progressBarFillVariants = cva(
  'h-full transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-ocean-blue',
        primary: 'bg-ocean-blue',
        success: 'bg-spring-green',
        warning: 'bg-yellow-500',
        destructive: 'bg-red-500',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
)

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  value: number
  max?: number
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      size,
      variant,
      value,
      max = 100,
      showLabel = false,
      label,
      animated = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div className="w-full space-y-2">
        {showLabel && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{label || 'Progress'}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressBarVariants({ size, variant, className }))}
          {...props}
        >
          <div
            className={cn(progressBarFillVariants({ variant, animated }))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = 'ProgressBar'

export { ProgressBar, progressBarVariants, progressBarFillVariants }
