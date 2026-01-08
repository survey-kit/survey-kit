import * as React from 'react'
import { cn } from '../../../lib/utils'

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'error' | 'info' | 'success'
  title?: string
  children: React.ReactNode
  id?: string // For aria-describedby association
}

/**
 * Panel component - displays error, info, or success messages
 * WCAG 2.2 AA compliant with proper ARIA attributes
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ variant, title, children, id, className, ...props }, ref) => {
    // Determine role and styling based on variant
    const role = variant === 'error' ? 'alert' : 'status'

    // Variant-specific styling
    const variantStyles = {
      error: {
        container:
          'bg-red-50 border-red-200 text-black border border-l-4 border-red-200',
        title: 'text-red-800 font-semibold',
        icon: 'Error:',
      },
      info: {
        container:
          'bg-blue-50 border-blue-200 text-black border border-l-4 border-blue-200',
        title: 'text-blue-800 font-semibold',
        icon: 'Info:',
      },
      success: {
        container:
          'bg-green-50 border-green-200 text-black border border-l-4 border-green-200',
        title: 'text-green-800 font-semibold',
        icon: 'Success:',
      },
    }

    const styles = variantStyles[variant]

    return (
      <div
        ref={ref}
        id={id}
        role={role}
        className={cn(
          'border rounded-md p-4 space-y-2',
          styles.container,
          className
        )}
        {...props}
      >
        {title && (
          <div className="flex items-start gap-2">
            <span className="text-base" aria-hidden="true">
              {styles.icon}
            </span>
            <h3 className={cn('text-sm', styles.title)}>{title}</h3>
          </div>
        )}
        <div className={cn('text-sm', title && 'ml-6')}>{children}</div>
      </div>
    )
  }
)

Panel.displayName = 'Panel'
