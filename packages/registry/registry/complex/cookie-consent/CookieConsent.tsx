import * as React from 'react'
import { useState } from 'react'
import { Button } from '../../primitives/button/button'

/**
 * Cookie category configuration
 */
export interface CookieCategory {
  id: string
  label: string
  description: string
  required?: boolean
}

/**
 * Cookie consent configuration (JSON-based)
 */
export interface CookieConsentConfig {
  id?: string
  title?: string
  description?: string
  additionalDescription?: string
  acceptButtonText?: string
  rejectButtonText?: string
  preferencesLinkText?: string
  saveButtonText?: string
  backButtonText?: string
  categories: CookieCategory[]
}

/**
 * Props for the CookieConsent component
 */
export interface CookieConsentProps {
  config: CookieConsentConfig
  onAcceptAll: () => void
  onRejectAll: () => void
  onSavePreferences: (consent: Record<string, boolean>) => void
  onViewCookies?: () => void
  className?: string
}

/**
 * A GDPR-compliant cookie consent banner component.
 *
 * Displays a top banner requiring the user to make a consent decision.
 * Follows ONS design patterns with accept/reject buttons.
 */
export function CookieConsent({
  config,
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
  onViewCookies,
  className = '',
}: CookieConsentProps): React.JSX.Element {
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {}
      config.categories.forEach((cat) => {
        initial[cat.id] = cat.required === true
      })
      return initial
    }
  )

  const {
    title = 'Cookies on this site',
    description = 'Cookies are small files stored on your device when you visit a website. We use some essential cookies to make this website work.',
    additionalDescription = 'We would like to set additional cookies to remember your settings and understand how you use the site. This helps us to improve our services.',
    acceptButtonText = 'Accept additional cookies',
    rejectButtonText = 'Reject additional cookies',
    preferencesLinkText = 'View cookies',
    saveButtonText = 'Save cookie preferences',
    backButtonText = 'Back',
    categories,
  } = config

  const handleToggle = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (category?.required) return // Can't toggle required categories

    setPreferences((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const handleSavePreferences = () => {
    onSavePreferences(preferences)
  }

  const handleViewCookies = () => {
    if (onViewCookies) {
      onViewCookies()
    } else {
      setShowPreferences(true)
    }
  }

  return (
    <div
      className={`w-full bg-[var(--ons-color-grey-5,#f5f5f5)] border-b border-gray-300 ${className}`}
      role="region"
      aria-label="Cookie consent"
    >
      <div className="max-w-[960px] mx-auto px-4 py-4">
        {/* Banner Mode */}
        {!showPreferences && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--ons-color-black)]">
              {title}
            </h2>
            <p className="text-sm text-[var(--ons-color-black)]">
              {description}
            </p>
            <p className="text-sm text-[var(--ons-color-black)]">
              {additionalDescription}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={onAcceptAll} size="sm">
                {acceptButtonText}
              </Button>
              <Button onClick={onRejectAll} variant="secondary" size="sm">
                {rejectButtonText}
              </Button>
              <button
                onClick={handleViewCookies}
                className="text-[var(--ons-color-ocean-blue)] underline hover:no-underline text-sm"
              >
                {preferencesLinkText}
              </button>
            </div>
          </div>
        )}

        {/* Preferences Mode */}
        {showPreferences && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--ons-color-black)]">
              Cookie settings
            </h2>
            <p className="text-sm text-[var(--ons-color-black)]">
              We use four types of cookie. You can choose which cookies you are
              happy for us to use.
            </p>

            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border border-gray-200 rounded p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[var(--ons-color-black)] text-sm">
                          {category.label}
                        </h3>
                        {category.required && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--ons-color-leaf-green-tint,#e8f5e9)] text-[var(--ons-color-leaf-green,#0f8243)] rounded font-medium">
                            Always on
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--ons-color-grey-75,#707070)]">
                        {category.description}
                      </p>
                    </div>
                    {!category.required && (
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={preferences[category.id] || false}
                          onChange={() => handleToggle(category.id)}
                          className="sr-only peer"
                        />
                        <div
                          className={`
                            w-11 h-6 rounded-full transition-colors
                            ${preferences[category.id] ? 'bg-[var(--ons-color-leaf-green,#0f8243)]' : 'bg-gray-300'}
                            peer-focus:ring-2 peer-focus:ring-[var(--ons-color-ocean-blue,#003c57)]
                          `}
                        >
                          <div
                            className={`
                              w-5 h-5 bg-white rounded-full shadow transform transition-transform
                              ${preferences[category.id] ? 'translate-x-5' : 'translate-x-0.5'}
                              mt-0.5
                            `}
                          />
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={handleSavePreferences} size="sm">
                {saveButtonText}
              </Button>
              <Button
                onClick={() => setShowPreferences(false)}
                variant="secondary"
                size="sm"
              >
                {backButtonText}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CookieConsent
