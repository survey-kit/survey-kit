import * as React from 'react'
import { Button } from '../../primitives/button/button'
import { Card } from '../../primitives/card/card'
import { Heading } from '../../primitives/heading/heading'
import { Input } from '../../primitives/input/input'
import { cn } from '../../../lib/utils'

/**
 * Button/link action in a section
 */
export interface SectionButton {
  label: string
  href?: string
  to?: string
  onClick?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  external?: boolean
}

/**
 * Input field in a section
 */
export interface SectionInput {
  id: string
  type: 'text' | 'email' | 'password'
  label?: string
  placeholder?: string
  required?: boolean
}

/**
 * Image configuration for a section
 */
export interface SectionImage {
  src: string
  alt?: string
  position?: 'top' | 'left' | 'right' | 'background'
}

/**
 * Layout configuration for a section
 */
export interface SectionLayout {
  header?: boolean
  footer?: boolean
}

/**
 * Section page configuration
 */
export interface SectionConfig {
  id: string
  path: string
  title?: string
  subtitle?: string
  body?: string
  image?: SectionImage
  buttons?: SectionButton[]
  inputs?: SectionInput[]
  layout?: SectionLayout
  className?: string
}

export interface SectionPageProps {
  config: SectionConfig
  onAction?: (actionId: string, data?: Record<string, unknown>) => void
  onNavigate?: (to: string) => void
  className?: string
  children?: React.ReactNode
}

/**
 * SectionPage - A flexible, composable page component
 * Renders title, subtitle, body, image, inputs, and buttons based on config
 */
export function SectionPage({
  config,
  onAction,
  onNavigate,
  className,
  children,
}: SectionPageProps): React.JSX.Element {
  const [inputValues, setInputValues] = React.useState<Record<string, string>>(
    {}
  )

  const handleInputChange = (id: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [id]: value }))
  }

  const handleButtonClick = (button: SectionButton) => {
    // External link - open in new tab or same window
    if (button.href) {
      if (button.external) {
        window.open(button.href, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = button.href
      }
      return
    }

    // Internal navigation via React Router
    if (button.to && onNavigate) {
      onNavigate(button.to)
      return
    }

    // Custom action handler
    if (button.onClick && onAction) {
      onAction(button.onClick, { inputs: inputValues })
    }
  }

  const hasImage = config.image && config.image.position !== 'background'
  const isHorizontalImage =
    config.image?.position === 'left' || config.image?.position === 'right'

  return (
    <div
      className={cn(
        'flex items-center justify-center min-h-[calc(100vh-200px)] p-4 sm:p-6 md:p-8',
        className
      )}
      style={
        config.image?.position === 'background'
          ? {
              backgroundImage: `url(${config.image.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <Card
        className={cn(
          'w-full max-w-lg p-6 sm:p-8 md:p-10',
          isHorizontalImage && 'max-w-3xl',
          config.image?.position === 'background' &&
            'bg-background/95 backdrop-blur-sm',
          config.className
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-6',
            isHorizontalImage && 'md:flex-row md:items-center md:gap-8',
            config.image?.position === 'right' && 'md:flex-row-reverse'
          )}
        >
          {/* Image - Top or Left/Right */}
          {hasImage && (
            <div
              className={cn(
                'flex justify-center',
                isHorizontalImage && 'md:w-1/2 md:flex-shrink-0'
              )}
            >
              <img
                src={config.image!.src}
                alt={config.image!.alt || ''}
                className={cn(
                  'max-w-full h-auto rounded-lg',
                  config.image?.position === 'top' && 'max-h-48 object-contain',
                  isHorizontalImage && 'max-h-64 md:max-h-80'
                )}
              />
            </div>
          )}

          {/* Content */}
          <div
            className={cn(
              'flex flex-col gap-4 text-center',
              isHorizontalImage && 'md:w-1/2 md:text-left'
            )}
          >
            {config.title && (
              <Heading level="h1" className="text-2xl sm:text-3xl font-bold">
                {config.title}
              </Heading>
            )}

            {config.subtitle && (
              <p className="text-muted-foreground text-base sm:text-lg">
                {config.subtitle}
              </p>
            )}

            {config.body && (
              <div
                className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: config.body }}
              />
            )}

            {children}

            {config.inputs && config.inputs.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                {config.inputs.map((input) => (
                  <div key={input.id} className="flex flex-col gap-1.5">
                    {input.label && (
                      <label
                        htmlFor={input.id}
                        className="text-sm font-medium text-left"
                      >
                        {input.label}
                        {input.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                    )}
                    <Input
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      required={input.required}
                      value={inputValues[input.id] || ''}
                      onChange={(e) =>
                        handleInputChange(input.id, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {config.buttons && config.buttons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center sm:justify-center">
                {config.buttons.map((button, index) => (
                  <Button
                    key={index}
                    variant={button.variant || 'default'}
                    onClick={() => handleButtonClick(button)}
                    className="w-full sm:w-auto"
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
