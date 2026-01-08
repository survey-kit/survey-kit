import * as React from 'react'
import { cn } from '../../../lib/utils'
import type { EmojiSliderProps } from './lib/types'
import { useEmojiSlider } from './lib/hooks'

/**
 * EmojiSlider - WCAG 2.2 AA compliant emoji slider component.
 * Supports both single emoji drag and multi-emoji scale slider variants.
 * The emoji serves as the draggable handle, providing visual feedback
 * and accessibility through keyboard navigation and screen reader support.
 */
export const EmojiSlider = React.forwardRef<HTMLDivElement, EmojiSliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      emoji,
      emojis,
      disabled = false,
      ariaLabel,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const isScaleSlider = Boolean(emojis && emojis.length > 0)
    const sliderId =
      id || `emoji-slider-${Math.random().toString(36).substr(2, 9)}`
    const liveRegionId = `${sliderId}-live`

    const {
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
    } = useEmojiSlider({
      value,
      min,
      max,
      step,
      disabled,
      isScaleSlider,
      emojis,
      onChange,
    })

    return (
      <div
        ref={ref}
        className={cn(
          'w-full p-6 pb-4 border border-gray-200 rounded bg-secondary',
          className
        )}
        {...props}
      >
        {/* Live region for screen reader announcements */}
        <div
          id={liveRegionId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announceValue}
        </div>

        {/* Slider container */}
        <div className="relative">
          {/* Slider track */}
          <div
            ref={sliderRef}
            className={cn(
              'relative w-full h-1 rounded-full bg-gray-200',
              'touch-none select-none',
              disabled && 'opacity-50 cursor-not-allowed',
              isFocused && 'ring-2 ring-ocean-blue ring-offset-2'
            )}
            onPointerDown={handlePointerDown}
          >
            {/* Blue fill from left to slider position */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-ocean-blue transition-all"
              style={{
                width: `${percentage}%`,
                transition: isDragging ? 'none' : 'width 0.2s',
              }}
              aria-hidden="true"
            />

            {/* Slider handle - emoji IS the handle */}
            <div
              ref={handleRef}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={clampedValue}
              aria-valuetext={ariaValueText}
              aria-label={ariaLabel || 'Emoji slider'}
              aria-disabled={disabled}
              id={sliderId}
              className={cn(
                'absolute top-50% -translate-y-50%',
                'cursor-grab active:cursor-grabbing select-none',
                'transition-transform',
                !isDragging && 'duration-200',
                isFocused && 'ring-4 ring-ocean-blue/30 ring-offset-2',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              style={{
                left: `${percentage}%`,
                transform: `translate(-50%, -50%)${isDragging ? ' scale(1.1)' : isFocused ? ' scale(1.05)' : ''}`,
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              {/* Emoji as handle */}
              {(emoji || currentEmojiItem) && (
                <span
                  className="text-3xl block leading-none"
                  aria-hidden="true"
                  style={{
                    transition: isDragging ? 'none' : 'transform 0.2s',
                  }}
                >
                  {isScaleSlider && currentEmojiItem
                    ? currentEmojiItem.emoji
                    : emoji}
                </span>
              )}
            </div>
          </div>

          {/* Labels underneath */}
          <div className="flex justify-between mt-2">
            {/* Left label */}
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {isScaleSlider && emojis && emojis.length > 0
                ? emojis[0].label || `${min}`
                : 'Low'}
            </div>

            {/* Right label */}
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {isScaleSlider && emojis && emojis.length > 0
                ? emojis[emojis.length - 1].label || `${max}`
                : 'High'}
            </div>
          </div>
        </div>

        {/* Dynamic label for scale slider */}
        {isScaleSlider && currentEmojiItem && (
          <div
            className="text-center mt-2 text-sm text-gray-700"
            aria-live="polite"
            aria-atomic="true"
          >
            {currentEmojiItem.label ||
              `${currentEmojiItem.value} out of ${max}`}
          </div>
        )}
      </div>
    )
  }
)

EmojiSlider.displayName = 'EmojiSlider'

export type { EmojiSliderItem, EmojiSliderProps } from './lib/types'
