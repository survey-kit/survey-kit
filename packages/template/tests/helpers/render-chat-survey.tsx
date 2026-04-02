/**
 * Render helper for chat-based surveys.
 *
 * Wraps ChatSurveyRenderer inside a MemoryRouter for testing.
 * Uses REAL typing delays (no mocks) per user preference.
 */

import React from 'react'
import { render, type RenderResult } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import {
  ChatSurveyRenderer,
  type SurveyConfig,
  type TypingDelayConfig,
} from '@survey-kit/core'
import { templateRoutes } from '../template-routes'
import {
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
  EmojiSlider,
} from '@survey-kit/registry'

/** Default chat components — mirrors what App.tsx registers. */
export const defaultChatComponents = {
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
  EmojiSlider,
}

export interface RenderChatSurveyOptions {
  /** The survey JSON config. */
  surveyConfig: SurveyConfig
  /** Starting route for the MemoryRouter; defaults to {@link templateRoutes.chatSurvey}. */
  initialRoute?: string
  /** Override the default chat component map. */
  components?: Record<string, React.ComponentType<any>>
  /** Optional submit handler. */
  onSubmit?: (answers: Record<string, unknown>) => Promise<void> | void
  /**
   * Typing delay config. Defaults to short delays for faster tests
   * while still exercising real async timing.
   */
  typingDelay?: TypingDelayConfig
}

export interface RenderChatSurveyResult {
  renderResult: RenderResult
  user: UserEvent
}

/**
 * Render a chat-based survey inside a test harness.
 */
export function renderChatSurvey({
  surveyConfig,
  initialRoute = templateRoutes.chatSurvey,
  components,
  onSubmit,
  typingDelay = { min: 100, max: 200 },
}: RenderChatSurveyOptions): RenderChatSurveyResult {
  const mergedComponents = {
    ...defaultChatComponents,
    ...components,
  }

  const user = userEvent.setup()

  const renderResult = render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ChatSurveyRenderer
        config={surveyConfig as unknown as SurveyConfig}
        components={mergedComponents as any}
        onSubmit={onSubmit ?? (() => {})}
        typingDelay={typingDelay}
      />
    </MemoryRouter>
  )

  return { renderResult, user }
}
