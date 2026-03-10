import { useState, useEffect, useCallback } from 'react'

/** Possible consent states. */
export type ConsentStatus = 'pending' | 'accepted' | 'rejected'

/** Persisted consent state. */
export interface ConsentState {
  status: ConsentStatus
  timestamp: number | null
}

const defaultState: ConsentState = {
  status: 'pending',
  timestamp: null,
}

/**
 * Hook for managing generic consent state.
 *
 * Persists the user's accept/reject decision to localStorage
 * based on a unique instance string. This allows for multiple
 * gates (e.g. privacy consent vs. research consent) to be managed cleanly.
 *
 * Exposes helpers to query or update the consent status.
 */
export function useConsent(instanceId: string) {
  const [consent, setConsent] = useState<ConsentState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)
  const [forceShow, setForceShow] = useState(false)

  const storageKey = `survey_kit_consent_${instanceId}`

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentState
        setConsent(parsed)
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoaded(true)
  }, [storageKey])

  /** Persist consent to localStorage. */
  const saveConsent = useCallback(
    (state: ConsentState) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state))
      } catch {
        // Ignore storage errors
      }
      setConsent(state)
      setForceShow(false)
    },
    [storageKey]
  )

  /** Accept the consent terms. */
  const accept = useCallback(() => {
    saveConsent({ status: 'accepted', timestamp: Date.now() })
  }, [saveConsent])

  /** Reject the consent terms. */
  const reject = useCallback(() => {
    saveConsent({ status: 'rejected', timestamp: Date.now() })
  }, [saveConsent])

  /** Reset consent (removes localStorage entry). */
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Ignore errors
    }
    setConsent(defaultState)
    setForceShow(false)
  }, [storageKey])

  /** Force the modal visible to allow user re-review */
  const showModal = useCallback(() => {
    setForceShow(true)
  }, [])

  /** Hide the modal if explicitly triggered by the user */
  const hideModal = useCallback(() => {
    setForceShow(false)
  }, [])

  return {
    consent,
    isLoaded,
    status: consent.status,
    shouldShowGate: forceShow || consent.status === 'pending',
    accept,
    reject,
    reset,
    showModal,
    hideModal,
  }
}

export default useConsent
