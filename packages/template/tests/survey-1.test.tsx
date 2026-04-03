/**
 * Integration tests for survey-1.json (form-based survey).
 *
 * Starting route: {@link templateRoutes.survey1} (see `tests/template-routes.ts`).
 *
 * These tests render the full SurveyRenderer with real registry
 * components and the actual survey JSON config.
 *
 * Note: Each test creates a fresh render, ensuring isolation.
 * The useSurvey hook uses localStorage for persistence and URL hash
 * for page tracking — both are reset between tests.
 */

import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderSurvey } from './helpers/render-survey'
import { checkAccessibility } from './helpers/axe-utils'
import type { SurveyConfig } from '@survey-kit/core'
import surveyConfig from '../src/surveys/survey-1.json'
import { templateRoutes } from './template-routes'

const config = surveyConfig as unknown as SurveyConfig

// Rendering

describe('Survey 1 — Page rendering', () => {
  it('renders the first page with its title', () => {
    renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    expect(screen.getByText('Primary contact')).toBeInTheDocument()
  })

  it('renders all questions on the first page', () => {
    renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    expect(screen.getByText('Display name')).toBeInTheDocument()
    expect(screen.getByText('Primary email')).toBeInTheDocument()
    expect(screen.getByText('Approximate team size')).toBeInTheDocument()
    expect(screen.getByText('Preferred follow-up date')).toBeInTheDocument()
  })

  it('renders placeholder text on inputs', () => {
    renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    expect(
      screen.getByPlaceholderText('How should we refer to you?')
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('renders required field indicators (*)', () => {
    renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    const stars = screen.getAllByText('*')
    expect(stars.length).toBeGreaterThanOrEqual(2)
  })

  it('renders description text for questions', () => {
    renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    expect(
      screen.getByText('Used for pattern validation (email input type)')
    ).toBeInTheDocument()
  })

  it('renders Next button', () => {
    renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('does not render Previous button on first page', () => {
    renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
  })
})

// User interaction — text input

describe('Survey 1 — Text input interaction', () => {
  it('allows typing into text fields', async () => {
    const { user } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    const nameInput = screen.getByPlaceholderText('How should we refer to you?')
    await user.type(nameInput, 'Alice')
    expect(nameInput).toHaveValue('Alice')
  })

  it('allows typing into email fields', async () => {
    const { user } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    const emailInput = screen.getByPlaceholderText('you@example.com')
    await user.type(emailInput, 'alice@test.com')
    expect(emailInput).toHaveValue('alice@test.com')
  })
})

// Validation

describe('Survey 1 — Validation', () => {
  it('stays on the same page when required fields are empty and Next is clicked', async () => {
    const { user } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    await user.click(screen.getByText('Next'))

    // Should still be on page 1
    expect(screen.getByText('Primary contact')).toBeInTheDocument()
  })

  it('navigates to next page when required fields are filled', async () => {
    const { user } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    await user.type(
      screen.getByPlaceholderText('How should we refer to you?'),
      'Alice'
    )
    await user.type(
      screen.getByPlaceholderText('you@example.com'),
      'alice@test.com'
    )

    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(
        screen.getByText('Long text and cross-field rules')
      ).toBeInTheDocument()
    })
  })
})

// Navigation

describe('Survey 1 — Navigation', () => {
  it('shows Previous button on page 2 and can go back', async () => {
    const { user } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    // Fill page 1
    await user.type(
      screen.getByPlaceholderText('How should we refer to you?'),
      'Alice'
    )
    await user.type(
      screen.getByPlaceholderText('you@example.com'),
      'alice@test.com'
    )

    // Navigate forward
    await user.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(
        screen.getByText('Long text and cross-field rules')
      ).toBeInTheDocument()
    })

    // Previous button should be visible on page 2
    expect(screen.getByText('Previous')).toBeInTheDocument()

    // Navigate back
    await user.click(screen.getByText('Previous'))
    await waitFor(() => {
      expect(screen.getByText('Primary contact')).toBeInTheDocument()
    })

    // Verify previously entered data is retained
    expect(
      screen.getByPlaceholderText('How should we refer to you?')
    ).toHaveValue('Alice')
  })
})

// Radio/Checkbox fields

describe('Survey 1 — Choice controls', () => {
  /**
   * Helper: fill page 1 and page 2 required fields, then navigate to
   * the Selection patterns page (page 3).
   */
  async function navigateToSelectionPage(
    user: ReturnType<typeof import('@testing-library/user-event').default.setup>
  ) {
    // Page 1
    await user.type(
      screen.getByPlaceholderText('How should we refer to you?'),
      'Alice'
    )
    await user.type(
      screen.getByPlaceholderText('you@example.com'),
      'alice@test.com'
    )
    await user.click(screen.getByText('Next'))

    // Page 2
    await waitFor(() => {
      expect(
        screen.getByText('Long text and cross-field rules')
      ).toBeInTheDocument()
    })

    // Fill page 2 required fields
    await user.type(
      screen.getByPlaceholderText('Re-enter the same email'),
      'alice@test.com'
    )

    // Find and fill date inputs
    const startInput = screen
      .getByText('Availability window start')
      .closest('.space-y-2')
      ?.querySelector('input[type="date"]')
    if (startInput) await user.type(startInput as HTMLElement, '2025-01-01')

    const endInput = screen
      .getByText('Availability window end')
      .closest('.space-y-2')
      ?.querySelector('input[type="date"]')
    if (endInput) await user.type(endInput as HTMLElement, '2025-06-01')

    const lowInput = screen
      .getByText('Budget range — lower bound (thousands)')
      .closest('.space-y-2')
      ?.querySelector('input')
    if (lowInput) await user.type(lowInput as HTMLElement, '100')

    const highInput = screen
      .getByText('Budget range — upper bound (thousands)')
      .closest('.space-y-2')
      ?.querySelector('input')
    if (highInput) await user.type(highInput as HTMLElement, '200')

    await user.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(screen.getByText('Selection patterns')).toBeInTheDocument()
    })
  }

  it('renders radio options on the selection page', async () => {
    const { user } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    await navigateToSelectionPage(user)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('In person')).toBeInTheDocument()
  })

  it('renders checkbox options on the selection page', async () => {
    const { user } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    await navigateToSelectionPage(user)

    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByText('Training')).toBeInTheDocument()
    expect(screen.getByText('Community events')).toBeInTheDocument()
  })

  it('renders select dropdown on the selection page', async () => {
    const { user } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    await navigateToSelectionPage(user)

    expect(screen.getByText('Region')).toBeInTheDocument()
  })
})

// Accessibility

describe('Survey 1 — Accessibility (axe-core)', () => {
  it('first page has no axe violations (labels associated via htmlFor)', async () => {
    const { renderResult } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    await checkAccessibility(renderResult.container)
  })

  it('page 2 (textarea + cross-field) has no axe violations', async () => {
    const { user, renderResult } = renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
    })

    await user.type(
      screen.getByPlaceholderText('How should we refer to you?'),
      'Alice'
    )
    await user.type(
      screen.getByPlaceholderText('you@example.com'),
      'alice@test.com'
    )
    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(
        screen.getByText('Long text and cross-field rules')
      ).toBeInTheDocument()
    })

    await checkAccessibility(renderResult.container)
  })
})

// Survey submission

describe('Survey 1 — Submission', () => {
  it('onSubmit is not called prematurely on first render', () => {
    const onSubmit = vi.fn()
    renderSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.survey1,
      onSubmit,
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
