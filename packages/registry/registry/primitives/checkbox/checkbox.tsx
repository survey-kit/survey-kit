import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check } from 'lucide-react'

import { cn } from '../../../lib/utils'

const checkboxVariants = cva(
  'flex items-center gap-3 p-4 rounded cursor-pointer transition-all border-2 bg-white',
  {
    variants: {
      variant: {
        default: '',
        singular: '',
        multiple: '',
      },
      checked: {
        true: 'border-[var(--ons-color-black)]',
        false: 'border-[var(--ons-color-grey-25)]',
      },
      focused: {
        true: 'border-[var(--ons-color-sun-yellow)] outline outline-2 outline-[var(--ons-color-sun-yellow)] outline-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      checked: false,
      focused: false,
    },
  }
)

const checkboxIconVariants = cva(
  'w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-all',
  {
    variants: {
      checked: {
        true: 'border-[var(--ons-color-black)] bg-[var(--ons-color-black)]',
        false: 'border-[var(--ons-color-grey-75)] bg-transparent',
      },
      variant: {
        singular: 'rounded-full',
        multiple: 'rounded',
        default: 'rounded',
      },
    },
    defaultVariants: {
      checked: false,
      variant: 'default',
    },
  }
)

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>,
    VariantProps<typeof checkboxVariants> {
  label: string
  variant?: 'singular' | 'multiple'
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant = 'multiple',
      checked,
      label,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false)

    return (
      <label
        className={cn(
          checkboxVariants({
            variant,
            checked,
            focused,
            className,
          })
        )}
      >
        <input
          type={variant === 'singular' ? 'radio' : 'checkbox'}
          ref={ref}
          checked={checked}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          className="sr-only"
          {...props}
        />
        <div className={cn(checkboxIconVariants({ checked, variant }))}>
          {checked && (
            <Check
              className={cn(
                'text-white stroke-[3]',
                variant === 'singular' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
              )}
              aria-hidden="true"
            />
          )}
        </div>
        <span className="text-[var(--ons-color-black)] text-base">{label}</span>
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants, checkboxIconVariants }
