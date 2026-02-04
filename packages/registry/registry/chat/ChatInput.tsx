import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '../primitives/button/button'
import { Input } from '../primitives/input/input'
import { Checkbox } from '../primitives/checkbox/checkbox'

/**
 * Represents a question option for radio/checkbox inputs.
 */
export interface ChatInputOption {
  value: string
  label: string
}

/**
 * Props for the ChatInput component.
 */
export interface ChatInputProps {
  type: 'text' | 'radio' | 'checkbox'
  value: unknown
  onChange: (value: unknown) => void
  onSubmit: () => void
  onSkip?: () => void
  options?: ChatInputOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

/**
 * A context-aware input component for the chat survey interface.
 *
 * Renders different input types based on the question:
 * - Text: A text field with a send button
 * - Radio: Vertical list of tappable options (single select)
 * - Checkbox: Multi-select options with a confirm button
 */
export function ChatInput({
  type,
  value,
  onChange,
  onSubmit,
  onSkip,
  options = [],
  placeholder = 'Type your answer...',
  required = false,
  disabled = false,
  className = '',
}: ChatInputProps): React.JSX.Element {
  const [textValue, setTextValue] = useState(
    typeof value === 'string' ? value : ''
  )

  // Sync textValue when value prop changes (e.g., when entering edit mode)
  useEffect(() => {
    if (typeof value === 'string') {
      setTextValue(value)
    } else if (value === null || value === undefined) {
      setTextValue('')
    }
  }, [value])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value)
    onChange(e.target.value)
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (textValue.trim() || !required) {
      onSubmit()
    }
  }

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (textValue.trim() || !required) {
        onSubmit()
      }
    }
  }

  const handleRadioSelect = (optionValue: string) => {
    onChange(optionValue)
    // Auto-submit on radio selection
    setTimeout(() => onSubmit(), 150)
  }

  const handleCheckboxToggle = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : []
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue]
    onChange(newValues)
  }

  const isCheckboxValid = () => {
    if (!required) return true
    const currentValues = Array.isArray(value) ? value : []
    return currentValues.length > 0
  }

  // Text input - uses Input and Button primitives
  if (type === 'text') {
    return (
      <form
        onSubmit={handleTextSubmit}
        className={`flex items-center gap-2 p-3 bg-white border-t border-[var(--ons-color-grey-15)] ${className}`}
      >
        <Input
          type="text"
          value={textValue}
          onChange={handleTextChange}
          onKeyDown={handleTextKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
          aria-label="Your answer"
        />
        <Button
          type="submit"
          disabled={disabled || (required && !textValue.trim())}
          aria-label="Send answer"
        >
          Send
        </Button>
        {onSkip && !required && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={disabled}
          >
            Skip
          </Button>
        )}
      </form>
    )
  }

  // Radio input - uses Checkbox primitive with singular variant
  if (type === 'radio') {
    return (
      <div
        className={`p-3 bg-white border-t border-[var(--ons-color-grey-15)] ${className}`}
        role="radiogroup"
        aria-label="Select an option"
      >
        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const isSelected = value === option.value
            return (
              <Checkbox
                key={option.value}
                variant="singular"
                label={option.label}
                checked={isSelected}
                onChange={() => handleRadioSelect(option.value)}
                disabled={disabled}
              />
            )
          })}
        </div>
        {onSkip && !required && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={disabled}
            className="mt-2 w-full"
          >
            Skip this question
          </Button>
        )}
      </div>
    )
  }

  // Checkbox input - uses Checkbox primitive with multiple variant
  if (type === 'checkbox') {
    const currentValues = Array.isArray(value) ? value : []

    return (
      <div
        className={`p-3 bg-white border-t border-[var(--ons-color-grey-15)] ${className}`}
        role="group"
        aria-label="Select options"
      >
        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const isSelected = currentValues.includes(option.value)
            return (
              <Checkbox
                key={option.value}
                variant="multiple"
                label={option.label}
                checked={isSelected}
                onChange={() => handleCheckboxToggle(option.value)}
                disabled={disabled}
              />
            )
          })}
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={disabled || !isCheckboxValid()}
            className="flex-1"
          >
            Confirm ({currentValues.length} selected)
          </Button>
          {onSkip && !required && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={disabled}
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    )
  }

  return <div>Unsupported input type: {type}</div>
}

export default ChatInput
