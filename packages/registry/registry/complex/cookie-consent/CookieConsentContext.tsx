import { createContext, useContext } from 'react'

/**
 * Cookie consent context for sharing consent actions across the app
 */
interface CookieConsentContextValue {
  showBanner: () => void
  hideBanner: () => void
  hasConsent: (categoryId: string) => boolean
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
)

/**
 * Provider component for cookie consent context
 */
export const CookieConsentProvider = CookieConsentContext.Provider

/**
 * Hook to access cookie consent actions from anywhere in the app
 */
export function useCookieConsentContext() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error(
      'useCookieConsentContext must be used within CookieConsentProvider'
    )
  }
  return context
}

export { CookieConsentContext }
