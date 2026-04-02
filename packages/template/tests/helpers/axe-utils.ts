/**
 * Accessibility testing utilities
 *
 * Wraps axe-core via jest-axe to provide a simple API for checking
 * rendered survey pages against WCAG accessibility rules.
 *
 * Note: jsdom doesn't render CSS, so color-contrast checks are disabled.
 */

import { axe, type JestAxeConfigureOptions } from 'jest-axe'
import { expect } from 'vitest'

/** Default axe rules to disable in jsdom (no CSS rendering) */
const DEFAULT_DISABLED_RULES = ['color-contrast', 'link-in-text-block']

/**
 * Run axe-core accessibility audit on a DOM container.
 * Asserts that zero violations are found.
 *
 * @param container - DOM element to audit (typically from RTL's render().container)
 * @param options - Optional axe configuration overrides
 */
export async function checkAccessibility(
  container: Element,
  options?: JestAxeConfigureOptions
) {
  const axeOptions: JestAxeConfigureOptions = {
    rules: Object.fromEntries(
      DEFAULT_DISABLED_RULES.map((rule) => [rule, { enabled: false }])
    ),
    ...options,
  }

  const results = await axe(container, axeOptions)
  expect(results).toHaveNoViolations()
}

/**
 * Run axe-core and return raw results (for custom assertions or reporting).
 */
export async function getAccessibilityResults(
  container: Element,
  options?: JestAxeConfigureOptions
) {
  const axeOptions: JestAxeConfigureOptions = {
    rules: Object.fromEntries(
      DEFAULT_DISABLED_RULES.map((rule) => [rule, { enabled: false }])
    ),
    ...options,
  }

  return axe(container, axeOptions)
}
