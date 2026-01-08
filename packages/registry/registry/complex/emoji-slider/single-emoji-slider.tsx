import * as React from 'react'
import { EmojiSlider } from './emoji-slider'
import type { EmojiSliderProps } from './lib/types'

/**
 * Props for the SingleEmojiSlider component.
 */
export interface SingleEmojiSliderProps
  extends Omit<EmojiSliderProps, 'emojis' | 'emoji'> {
  emoji: string
}

/**
 * SingleEmojiSlider - Convenience wrapper for single emoji slider
 * Shows one emoji that moves along the track based on value
 */
export const SingleEmojiSlider = React.forwardRef<
  HTMLDivElement,
  SingleEmojiSliderProps
>((props, ref) => {
  return <EmojiSlider ref={ref} {...props} />
})

SingleEmojiSlider.displayName = 'SingleEmojiSlider'
