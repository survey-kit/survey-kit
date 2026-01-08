import type * as React from 'react'

/**
 * Configuration for a single emoji item in a scale slider.
 */
export interface EmojiSliderItem {
  value: number
  emoji: string
  label?: string
}

/**
 * Props for the EmojiSlider component.
 */
export interface EmojiSliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  emoji?: string
  emojis?: EmojiSliderItem[]
  disabled?: boolean
  ariaLabel?: string
  id?: string
}
