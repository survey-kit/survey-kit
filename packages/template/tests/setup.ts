/**
 * Global test setup for Vitest
 *
 * - Mocks localStorage and sessionStorage for jsdom
 * - Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
 * - Registers jest-axe matchers (toHaveNoViolations)
 * - Cleans up between tests
 */

import '@testing-library/jest-dom/vitest'
import { toHaveNoViolations } from 'jest-axe'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, expect } from 'vitest'

// Register axe accessibility matchers
expect.extend(toHaveNoViolations)

function createStorageMock(): Storage {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
}

beforeAll(() => {
  if (
    typeof globalThis.localStorage === 'undefined' ||
    typeof globalThis.localStorage.getItem !== 'function'
  ) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createStorageMock(),
      writable: true,
    })
  }
  if (
    typeof globalThis.sessionStorage === 'undefined' ||
    typeof globalThis.sessionStorage.getItem !== 'function'
  ) {
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: createStorageMock(),
      writable: true,
    })
  }
})

// Automatically clean up after each test
afterEach(() => {
  cleanup()

  try {
    globalThis.localStorage.clear()
  } catch {
    // Ignore
  }
  try {
    globalThis.sessionStorage.clear()
  } catch {
    // Ignore
  }

  // Reset URL hash and search params
  // useSurvey reads from window.location.hash to determine current page
  if (typeof window !== 'undefined') {
    window.location.hash = ''
    try {
      window.history.replaceState({}, '', window.location.pathname)
    } catch {
      // Ignore
    }
  }
})

// Mock scrollIntoView
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
