import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import * as LucideIcons from 'lucide-react'
import { cn } from '../../../lib/utils'

const stageTabsVariants = cva(
  'flex items-center border-b bg-ocean-blue overflow-x-auto',
  {
    variants: {
      size: {
        sm: 'px-2 font-size-1rem',
        md: 'px-4 font-size-1.25rem',
        lg: 'px-6 font-size-1.5rem',
      },
      variant: {
        default: 'bg-ocean-blue',
        primary: 'bg-ocean-blue text-white',
        secondary: 'bg-secondary text-secondary-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

const stageTabVariants = cva(
  'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap',
  {
    variants: {
      active: {
        true: 'border-ocean-blue text-white font-semibold border-white',
        false: 'border-transparent text-white',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  }
)

export interface StageTab {
  id: string
  title: string
  description?: string
  icon?: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

export interface StageTabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stageTabsVariants> {
  stages: StageTab[]
  onStageChange?: (stageId: string) => void
}

const StageTabs = React.forwardRef<HTMLDivElement, StageTabsProps>(
  ({ className, size, variant, stages, onStageChange, ...props }, ref) => {
    const handleStageClick = (stage: StageTab) => {
      if (stage.disabled || !stage.onClick) return
      if (onStageChange) {
        onStageChange(stage.id)
      }
      if (stage.onClick) {
        stage.onClick()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(stageTabsVariants({ size, variant, className }))}
        {...props}
        role="tablist"
        aria-label="Survey stages"
      >
        {stages.map((stage) => {
          const IconComponent = stage.icon
            ? (LucideIcons[stage.icon as keyof typeof LucideIcons] as
                | React.ComponentType<{ className?: string }>
                | undefined)
            : null

          return (
            <button
              key={stage.id}
              role="tab"
              aria-selected={stage.active}
              aria-disabled={stage.disabled}
              disabled={stage.disabled}
              onClick={() => handleStageClick(stage)}
              className={cn(
                stageTabVariants({
                  active: stage.active,
                  disabled: stage.disabled,
                })
              )}
              title={stage.description || stage.title}
            >
              {IconComponent && (
                <IconComponent className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm">{stage.title}</span>
            </button>
          )
        })}
      </div>
    )
  }
)
StageTabs.displayName = 'StageTabs'

export { StageTabs, stageTabsVariants, stageTabVariants }
