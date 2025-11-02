import * as React from 'react'
import { cn } from '../../../lib/utils'

export interface QuestionOption {
  label: string
  value: string
  description?: string
}

export interface SimpleDropdownProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  options?: QuestionOption[]
  placeholder?: string
}

/**
 * Simple Dropdown component using native HTML select
 * Provides a simple API: value, onChange, options
 */
export const SimpleDropdown = React.forwardRef<
  HTMLSelectElement,
  SimpleDropdownProps
>(
  (
    {
      value,
      onChange,
      options = [],
      placeholder = 'Select an option...',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    return (
      <select
        ref={ref}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)
SimpleDropdown.displayName = 'SimpleDropdown'
