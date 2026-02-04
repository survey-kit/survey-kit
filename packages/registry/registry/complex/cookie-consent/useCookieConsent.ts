import { useState, useEffect, useCallback } from 'react'

/**
 * Cookie consent category configuration
 */
export interface CookieCategory {
  id: string
  label: string
  description: string
  required?: boolean
}

/**
 * Cookie consent state
 */
export interface CookieConsentState {
  given: boolean
  timestamp: number | null
  categories: Record<string, boolean>
}

const STORAGE_KEY = 'survey_kit_cookie_consent'

const defaultState: CookieConsentState = {
  given: false,
  timestamp: null,
  categories: {},
}

/**
 * Hook for managing cookie consent state.
 *
 * Persists consent to localStorage and provides methods to
 * accept, reject, or set granular consent.
 */
export function useCookieConsent(categories: CookieCategory[]) {
  const [consent, setConsent] = useState<CookieConsentState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(false)

  // Load consent from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CookieConsentState
        setConsent(parsed)
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoaded(true)
  }, [])

  // Save consent to localStorage
  const saveConsent = useCallback((state: CookieConsentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore storage errors
    }
    setConsent(state)
    setBannerVisible(false) // Hide banner after saving
  }, [])

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const categoryConsent: Record<string, boolean> = {}
    categories.forEach((cat) => {
      categoryConsent[cat.id] = true
    })
    saveConsent({
      given: true,
      timestamp: Date.now(),
      categories: categoryConsent,
    })
  }, [categories, saveConsent])

  // Reject all non-required cookies
  const rejectAll = useCallback(() => {
    const categoryConsent: Record<string, boolean> = {}
    categories.forEach((cat) => {
      categoryConsent[cat.id] = cat.required === true
    })
    saveConsent({
      given: true,
      timestamp: Date.now(),
      categories: categoryConsent,
    })
  }, [categories, saveConsent])

  // Save granular consent
  const saveGranular = useCallback(
    (categoryConsent: Record<string, boolean>) => {
      // Ensure required categories are always true
      const finalConsent = { ...categoryConsent }
      categories.forEach((cat) => {
        if (cat.required) {
          finalConsent[cat.id] = true
        }
      })
      saveConsent({
        given: true,
        timestamp: Date.now(),
        categories: finalConsent,
      })
    },
    [categories, saveConsent]
  )

  // Reset consent completely (removes localStorage)
  const resetConsent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore errors
    }
    setConsent(defaultState)
    setBannerVisible(false)
  }, [])

  // Show banner (without resetting consent)
  const showBanner = useCallback(() => {
    setBannerVisible(true)
  }, [])

  // Hide banner (without saving)
  const hideBanner = useCallback(() => {
    setBannerVisible(false)
  }, [])

  // Check if a specific category is consented
  const hasConsent = useCallback(
    (categoryId: string): boolean => {
      return consent.categories[categoryId] === true
    },
    [consent.categories]
  )

  // Determine if banner should be shown
  const shouldShowBanner = !consent.given || bannerVisible

  return {
    consent,
    isLoaded,
    hasConsentBeenGiven: consent.given,
    shouldShowBanner,
    acceptAll,
    rejectAll,
    saveGranular,
    resetConsent,
    showBanner,
    hideBanner,
    hasConsent,
  }
}

export default useCookieConsent
