import * as React from 'react'
import type { EmojiSliderItem } from './types'
import {
  getValueFromPosition,
  findClosestEmojiItem,
  getAriaValueText,
  getAnnouncementText,
} from './utils'

interface UseEmojiSliderOptions {
  value: number
  min: number
  max: number
  step: number
  disabled: boolean
  isScaleSlider: boolean
  emojis?: EmojiSliderItem[]
  onChange: (value: number) => void
}

/**
 * Custom hook that manages emoji slider state and interactions.
 */
export function useEmojiSlider({
  value,
  min,
  max,
  step,
  disabled,
  isScaleSlider,
  emojis,
  onChange,
}: UseEmojiSliderOptions) {
  const sliderRef = React.useRef<HTMLDivElement>(null)
  const handleRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const [announceValue, setAnnounceValue] = React.useState<string>('')
  const rafRef = React.useRef<number | null>(null)

  const clampedValue = Math.max(min, Math.min(max, value))
  const percentage = ((clampedValue - min) / (max - min)) * 100

  const currentEmojiItem = React.useMemo(() => {
    if (!isScaleSlider || !emojis?.length) return null
    return findClosestEmojiItem(emojis, clampedValue)
  }, [isScaleSlider, emojis, clampedValue])

  const updateValue = React.useCallback(
    (newValue: number) => {
      if (disabled || newValue === clampedValue) return
      onChange(newValue)

      const announcement = getAnnouncementText(
        newValue,
        max,
        isScaleSlider,
        emojis
      )
      setAnnounceValue(announcement)
      setTimeout(() => setAnnounceValue(''), 1000)
    },
    [disabled, clampedValue, onChange, isScaleSlider, emojis, max]
  )

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return
      e.preventDefault()
      setIsDragging(true)
      const newValue = getValueFromPosition(
        e.clientX,
        sliderRef.current,
        min,
        max,
        step,
        clampedValue
      )
      updateValue(newValue)
    },
    [disabled, updateValue, min, max, step, clampedValue]
  )

  const handlePointerMove = React.useCallback(
    (e: PointerEvent) => {
      if (!isDragging || disabled) return
      e.preventDefault()

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        const newValue = getValueFromPosition(
          e.clientX,
          sliderRef.current,
          min,
          max,
          step,
          clampedValue
        )
        updateValue(newValue)
      })
    },
    [isDragging, disabled, updateValue, min, max, step, clampedValue]
  )

  const handlePointerUp = React.useCallback(() => {
    setIsDragging(false)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      let newValue = clampedValue
      const largeStep = Math.max(step, (max - min) / 10)

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault()
          newValue = Math.min(max, clampedValue + step)
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault()
          newValue = Math.max(min, clampedValue - step)
          break
        case 'Home':
          e.preventDefault()
          newValue = min
          break
        case 'End':
          e.preventDefault()
          newValue = max
          break
        case 'PageUp':
          e.preventDefault()
          newValue = Math.min(max, clampedValue + largeStep)
          break
        case 'PageDown':
          e.preventDefault()
          newValue = Math.max(min, clampedValue - largeStep)
          break
        default:
          return
      }

      updateValue(newValue)
    },
    [disabled, clampedValue, min, max, step, updateValue]
  )

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
      return () => {
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      }
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const ariaValueText = getAriaValueText(
    clampedValue,
    max,
    isScaleSlider,
    currentEmojiItem
  )

  return {
    sliderRef,
    handleRef,
    isDragging,
    isFocused,
    setIsFocused,
    announceValue,
    clampedValue,
    percentage,
    currentEmojiItem,
    handlePointerDown,
    handleKeyDown,
    ariaValueText,
  }
}
