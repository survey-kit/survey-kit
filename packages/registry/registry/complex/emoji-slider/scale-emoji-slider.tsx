import * as React from 'react'
import { EmojiSlider } from './emoji-slider'
import type { EmojiSliderItem, EmojiSliderProps } from './lib/types'

/**
 * Props for the ScaleEmojiSlider component.
 */
export interface ScaleEmojiSliderProps
  extends Omit<EmojiSliderProps, 'emoji' | 'emojis'> {
  emojis: EmojiSliderItem[]
  scale?: number
}

/**
 * ScaleEmojiSlider - Convenience wrapper for multi-emoji scale slider
 * Shows multiple emojis on a scale (e.g., 1-5) with slider handle
 */
export const ScaleEmojiSlider = React.forwardRef<
  HTMLDivElement,
  ScaleEmojiSliderProps
>(({ scale, emojis, min = 1, max, ...props }, ref) => {
  // If scale is provided, use it to set max (defaults to scale value)
  const maxValue = max || scale || Math.max(...emojis.map((e) => e.value))

  return (
    <EmojiSlider
      ref={ref}
      emojis={emojis}
      min={min}
      max={maxValue}
      {...props}
    />
  )
})

ScaleEmojiSlider.displayName = 'ScaleEmojiSlider'
