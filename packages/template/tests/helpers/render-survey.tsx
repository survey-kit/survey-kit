/**
 * Render helper for form-based surveys.
 *
 * Wraps a SurveyRenderer + LayoutRenderer (or standalone SurveyRenderer)
 * inside a MemoryRouter so tests don't need a real browser.
 *
 * Usage example:
 *   const { screen, user } = renderSurvey({
 *     surveyConfig: survey1,
 *     initialRoute: templateRoutes.survey1,
 *   })
 */

import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SurveyRenderer, type SurveyConfig } from '@survey-kit/core'
import { templateRoutes } from '../template-routes'
import {
  Button,
  Card,
  SimpleDropdown as Dropdown,
  Heading,
  Input,
  ProgressBar,
  Wrapper,
  Checkbox,
  BlockedPage,
  Panel,
  EmojiSlider,
} from '@survey-kit/registry'

/** Default form components — mirrors what App.tsx registers. */
export const defaultFormComponents = {
  Button,
  Card,
  Dropdown,
  Heading,
  Input,
  ProgressBar,
  Wrapper,
  Checkbox,
  BlockedPage,
  Panel,
  EmojiSlider,
}

export interface RenderSurveyOptions {
  /** The survey JSON config (imported directly). */
  surveyConfig: SurveyConfig
  /** Starting route for the MemoryRouter; defaults to {@link templateRoutes.survey1}. */
  initialRoute?: string
  /** Override the default component map. */
  components?: Record<string, React.ComponentType<any>>
  /** Optional submitSurvey handler. */
  onSubmit?: (answers: Record<string, unknown>) => Promise<void> | void
}

export interface RenderSurveyResult {
  /** The RTL render result (container, etc.). */
  renderResult: RenderResult
  /** Pre-configured userEvent instance with advanceTimers. */
  user: UserEvent
}

/**
 * Render a form-based survey inside a test harness.
 */
export function renderSurvey({
  surveyConfig,
  initialRoute = templateRoutes.survey1,
  components,
  onSubmit,
}: RenderSurveyOptions): RenderSurveyResult {
  const mergedComponents = {
    ...defaultFormComponents,
    ...components,
  }

  const user = userEvent.setup()

  const renderResult = render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <SurveyRenderer
        config={surveyConfig}
        components={mergedComponents}
        onSubmit={onSubmit ?? (() => {})}
        layout="default"
      />
    </MemoryRouter>
  )

  return { renderResult, user }
}
