import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../../lib/utils'

const sidebarVariants = cva(
  'flex flex-col border-r bg-background transition-all duration-300 ease-in-out',
  {
    variants: {
      size: {
        sm: 'w-48',
        md: 'w-64',
        lg: 'w-80',
      },
      collapsed: {
        true: '!w-16',
        false: '',
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
      mobile: {
        true: 'fixed top-0 left-0 h-full z-40 transform -translate-x-full lg:translate-x-0 lg:relative lg:h-auto lg:z-auto',
        false: '',
      },
      mobileOpen: {
        true: 'translate-x-0',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'left',
      variant: 'default',
      mobile: false,
      mobileOpen: false,
      collapsed: false,
    },
  }
)

const sidebarContentVariants = cva(
  'flex-1 overflow-auto p-4 space-y-4 bg-white',
  {
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
  }
)

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  collapsed?: boolean
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      size,
      position,
      variant,
      mobile,
      mobileOpen,
      collapsed,
      header,
      footer,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <>
        {/* Mobile backdrop */}
        {mobile && mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={props.onClick as () => void}
          />
        )}
        <aside
          ref={ref}
          className={cn(
            sidebarVariants({
              size,
              position,
              variant,
              mobile,
              mobileOpen,
              collapsed,
              className,
            })
          )}
          {...props}
        >
          {header && (
            <div className={cn('border-b', collapsed ? 'p-2' : 'p-4')}>
              {header}
            </div>
          )}
          <div className={cn(sidebarContentVariants())}>{children}</div>
          {footer && (
            <div className={cn('border-t', collapsed ? 'p-2' : 'p-4')}>
              {footer}
            </div>
          )}
        </aside>
      </>
    )
  }
)
Sidebar.displayName = 'Sidebar'

export { Sidebar, sidebarVariants, sidebarContentVariants }
