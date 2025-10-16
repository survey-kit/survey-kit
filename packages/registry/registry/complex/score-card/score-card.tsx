import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

import { cn } from '../../../lib/utils'

const scoreCardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm p-6',
  {
    variants: {
      variant: {
        default: 'border-border',
        success: 'border-green-200 bg-green-50',
        warning: 'border-yellow-200 bg-yellow-50',
        destructive: 'border-red-200 bg-red-50',
        info: 'border-blue-200 bg-blue-50',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const scoreValueVariants = cva('text-3xl font-bold', {
  variants: {
    variant: {
      default: 'text-foreground',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      destructive: 'text-red-600',
      info: 'text-blue-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const trendVariants = cva('flex items-center text-sm font-medium', {
  variants: {
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    trend: 'neutral',
  },
})

export interface ScoreCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scoreCardVariants> {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
  }
  icon?: React.ReactNode
  loading?: boolean
}

const ScoreCard = React.forwardRef<HTMLDivElement, ScoreCardProps>(
  (
    {
      className,
      variant,
      size,
      title,
      value,
      subtitle,
      trend,
      icon,
      loading = false,
      ...props
    },
    ref
  ) => {
    const getTrendIcon = () => {
      if (!trend) return null

      if (trend.value > 0) {
        return <TrendingUp className="h-4 w-4" />
      } else if (trend.value < 0) {
        return <TrendingDown className="h-4 w-4" />
      } else {
        return <Minus className="h-4 w-4" />
      }
    }

    const getTrendVariant = () => {
      if (!trend) return 'neutral'

      if (trend.value > 0) return 'up'
      if (trend.value < 0) return 'down'
      return 'neutral'
    }

    return (
      <div
        ref={ref}
        className={cn(scoreCardVariants({ variant, size, className }))}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded" />
            ) : (
              <p className={cn(scoreValueVariants({ variant }))}>{value}</p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>

        {trend && !loading && (
          <div className="mt-4">
            <div className={cn(trendVariants({ trend: getTrendVariant() }))}>
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
)
ScoreCard.displayName = 'ScoreCard'

export { ScoreCard, scoreCardVariants, scoreValueVariants, trendVariants }
