import type { EmojiSliderItem } from './types'

/**
 * Calculates the slider value from a mouse/touch position.
 */
export function getValueFromPosition(
  clientX: number,
  sliderElement: HTMLDivElement | null,
  min: number,
  max: number,
  step: number,
  currentValue: number
): number {
  if (!sliderElement) return currentValue
  const rect = sliderElement.getBoundingClientRect()
  const position = (clientX - rect.left) / rect.width
  const rawValue = min + position * (max - min)
  const steppedValue = Math.round(rawValue / step) * step
  return Math.max(min, Math.min(max, steppedValue))
}

/**
 * Finds the closest matching emoji item for a given value.
 */
export function findClosestEmojiItem(
  emojis: EmojiSliderItem[],
  value: number
): EmojiSliderItem | null {
  if (!emojis.length) return null

  const exactMatch = emojis.find((item) => item.value === value)
  if (exactMatch) return exactMatch

  return emojis.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.value - value)
    const currDiff = Math.abs(curr.value - value)
    return currDiff < prevDiff ? curr : prev
  }, emojis[0])
}

/**
 * Generates ARIA value text for screen readers.
 */
export function getAriaValueText(
  value: number,
  max: number,
  isScaleSlider: boolean,
  currentEmojiItem: EmojiSliderItem | null
): string {
  if (isScaleSlider && currentEmojiItem) {
    const label = currentEmojiItem.label || `${currentEmojiItem.value}`
    return `${value} out of ${max}, ${currentEmojiItem.emoji} ${label}`
  }
  return `${value} out of ${max}`
}

/**
 * Generates announcement text for screen reader live regions.
 */
export function getAnnouncementText(
  newValue: number,
  max: number,
  isScaleSlider: boolean,
  emojis: EmojiSliderItem[] | undefined
): string {
  if (isScaleSlider && emojis?.length) {
    const newEmojiItem = findClosestEmojiItem(emojis, newValue)
    if (newEmojiItem) {
      const label = newEmojiItem.label || `${newEmojiItem.value}`
      return `${newValue} out of ${max}, ${newEmojiItem.emoji} ${label}`
    }
  }
  return `${newValue} out of ${max}`
}
