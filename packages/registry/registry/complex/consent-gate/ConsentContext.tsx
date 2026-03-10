import { createContext, useContext } from 'react'
import type { ConsentStatus } from './useConsent'

/**
 * Context value shared across the app for a specific consent gate.
 */
interface ConsentContextValue {
  status: ConsentStatus
  shouldShowGate: boolean
  accept: () => void
  reject: () => void
  reset: () => void
  showModal: () => void
  hideModal: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

/** Provider component for consent context. */
export const ConsentProvider = ConsentContext.Provider

/**
 * Hook to access consent state and actions from anywhere in the app.
 */
export function useConsentContext() {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error('useConsentContext must be used within ConsentProvider')
  }
  return context
}

export { ConsentContext }
