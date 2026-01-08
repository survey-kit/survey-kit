import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Check, MoreHorizontal } from 'lucide-react'
import { cn } from '../../../lib/utils'

export interface SidebarMenuItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  active?: boolean
  disabled?: boolean
  completionStatus?: 'complete' | 'partial' | 'empty'
  onClick?: () => void
}

export interface SidebarMenuProps {
  trigger: React.ReactNode
  parentLabel: string
  parentCompletionStatus?: 'complete' | 'partial' | 'empty'
  items: SidebarMenuItem[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

/**
 * SidebarMenu - Popover menu for collapsed sidebar group items
 * Shows children items in a hierarchical menu panel
 */
export const SidebarMenu = React.forwardRef<HTMLDivElement, SidebarMenuProps>(
  (
    {
      trigger,
      parentLabel,
      parentCompletionStatus,
      items,
      open,
      onOpenChange,
      className,
    },
    ref
  ) => {
    return (
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            ref={ref}
            side="right"
            align="start"
            sideOffset={8}
            className={cn(
              'z-50 w-56 rounded-md border bg-white p-1 shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              className
            )}
          >
            {/* Parent label */}
            <div className="px-3 py-2 text-sm font-medium text-gray-900 flex items-center justify-between">
              <span>{parentLabel}</span>
              {parentCompletionStatus === 'complete' && (
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
              {parentCompletionStatus === 'partial' && (
                <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
            {/* Separator */}
            <div className="h-px bg-gray-200 my-1" />
            {/* Children items */}
            <div className="space-y-1">
              {items.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!item.disabled && item.onClick) {
                        item.onClick()
                        onOpenChange?.(false)
                      }
                    }}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-2 rounded px-3 py-2 text-sm',
                      'transition-colors text-left',
                      item.disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer',
                      item.active
                        ? 'bg-ocean-blue/10 text-ocean-blue'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {IconComponent && (
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="flex-1">{item.label}</span>
                    {item.completionStatus === 'complete' && (
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    )}
                    {item.completionStatus === 'partial' && (
                      <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    )
  }
)

SidebarMenu.displayName = 'SidebarMenu'
