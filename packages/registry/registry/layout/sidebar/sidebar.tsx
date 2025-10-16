import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../../lib/utils'

const sidebarVariants = cva('flex flex-col border-r bg-background', {
  variants: {
    size: {
      sm: 'w-48',
      md: 'w-64',
      lg: 'w-80',
    },
    position: {
      left: 'border-r',
      right: 'border-l order-last',
    },
    variant: {
      default: 'bg-background',
      secondary: 'bg-secondary',
      muted: 'bg-muted',
    },
  },
  defaultVariants: {
    size: 'md',
    position: 'left',
    variant: 'default',
  },
})

const sidebarContentVariants = cva('flex-1 overflow-auto p-4', {
  variants: {
    spacing: {
      none: 'space-y-0',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
})

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    { className, size, position, variant, header, footer, children, ...props },
    ref
  ) => {
    return (
      <aside
        ref={ref}
        className={cn(sidebarVariants({ size, position, variant, className }))}
        {...props}
      >
        {header && <div className="border-b p-4">{header}</div>}
        <div className={cn(sidebarContentVariants())}>{children}</div>
        {footer && <div className="border-t p-4">{footer}</div>}
      </aside>
    )
  }
)
Sidebar.displayName = 'Sidebar'

export { Sidebar, sidebarVariants, sidebarContentVariants }
