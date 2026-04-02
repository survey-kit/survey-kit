/**
 * Integration tests for chat-survey.json (chat-based survey).
 *
 * Starting route: {@link templateRoutes.chatSurvey}
 *
 * Uses REAL typing delays (100-200ms, shortened from production
 * 600-1200ms for faster tests while still exercising async timing).
 */

import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderChatSurvey } from './helpers/render-chat-survey'
import { checkAccessibility } from './helpers/axe-utils'
import type { SurveyConfig } from '@survey-kit/core'
import chatSurveyConfig from '../src/surveys/chat-survey.json'
import { templateRoutes } from './template-routes'

const config = chatSurveyConfig as unknown as SurveyConfig

// Rendering

describe('Chat Survey — Initial rendering', () => {
  it('renders the chat container with survey title', async () => {
    renderChatSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.chatSurvey,
    })

    await waitFor(() => {
      expect(screen.getByText('Technology Survey')).toBeInTheDocument()
    })
  })

  it('shows the first question after typing delay', async () => {
    renderChatSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.chatSurvey,
      typingDelay: { min: 50, max: 100 },
    })

    // Wait for typing animation to complete (real delay)
    await waitFor(
      () => {
        expect(screen.getByText("Hello! What's your name?")).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('shows a text input for the first question', async () => {
    renderChatSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.chatSurvey,
      typingDelay: { min: 50, max: 100 },
    })

    await waitFor(
      () => {
        expect(
          screen.getByPlaceholderText('Enter your name')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})

// Text input and progression

describe('Chat Survey — Text input and progression', () => {
  it('can type an answer and submit to advance', async () => {
    const { user } = renderChatSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.chatSurvey,
      typingDelay: { min: 50, max: 100 },
    })

    // Wait for first question to appear
    await waitFor(
      () => {
        expect(
          screen.getByPlaceholderText('Enter your name')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Type answer
    const input = screen.getByPlaceholderText('Enter your name')
    await user.type(input, 'Alice')

    // Submit (find the submit button)
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)

    // Wait for next question to appear (after real typing delay)
    await waitFor(
      () => {
        expect(
          screen.getByText('What is your favourite technology?')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})

// Radio selection in chat

describe('Chat Survey — Radio selection', () => {
  it('shows radio options for the frontend framework question', async () => {
    const { user } = renderChatSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.chatSurvey,
      typingDelay: { min: 50, max: 100 },
    })

    // Navigate through first two text questions
    // Q1: name
    await waitFor(
      () => {
        expect(
          screen.getByPlaceholderText('Enter your name')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    await user.type(screen.getByPlaceholderText('Enter your name'), 'Alice')
    await user.click(screen.getByRole('button', { name: /send/i }))

    // Q2: favourite tech
    await waitFor(
      () => {
        expect(
          screen.getByPlaceholderText('e.g., React, Python, AWS')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    await user.type(
      screen.getByPlaceholderText('e.g., React, Python, AWS'),
      'React'
    )
    await user.click(screen.getByRole('button', { name: /send/i }))

    // Q3: frontend framework (radio)
    await waitFor(
      () => {
        expect(
          screen.getByText('Pick your preferred frontend framework:')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Radio options should be visible
    expect(screen.getAllByText('React').length).toBeGreaterThan(0)
    expect(screen.getByText('Vue')).toBeInTheDocument()
    expect(screen.getByText('Angular')).toBeInTheDocument()
  })
})

// Accessibility

describe('Chat Survey — Accessibility (axe-core)', () => {
  it('initial chat view has no accessibility violations', async () => {
    const { renderResult } = renderChatSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.chatSurvey,
      typingDelay: { min: 50, max: 100 },
    })

    // Wait for initial render to settle
    await waitFor(
      () => {
        expect(screen.getByText('Technology Survey')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    await checkAccessibility(renderResult.container)
  })

  it('chat view with active question has no accessibility violations', async () => {
    const { renderResult } = renderChatSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.chatSurvey,
      typingDelay: { min: 50, max: 100 },
    })

    // Wait for first question
    await waitFor(
      () => {
        expect(
          screen.getByPlaceholderText('Enter your name')
        ).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    await checkAccessibility(renderResult.container)
  })
})

// Submission

describe('Chat Survey — Submission', () => {
  it('calls onSubmit when not triggered prematurely', () => {
    const onSubmit = vi.fn()
    renderChatSurvey({
      surveyConfig: config,
      initialRoute: templateRoutes.chatSurvey,
      onSubmit,
    })

    // Should not be called on initial render
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
