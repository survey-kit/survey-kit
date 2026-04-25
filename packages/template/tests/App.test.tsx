/**
 * Integration tests for the main app router (default export wraps `App` in `BrowserRouter`).
 *
 * Initial URL for each test is set via `setAppTestInitialRoute` in `tests/helpers/app-memory-route.ts`
 * using paths from `tests/template-routes.ts` (keep in sync with `src/App.tsx`).
 */

import React from 'react'
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import Root from '../src/App'
import { fetchAdminAnalytics } from '../src/services/analytics'
import {
  fetchParticipantProfile,
  submitSurveyResponse,
} from '../src/services/api'
import type { ParticipantProfileApi } from '../src/services/api'
import { templateRoutes } from './template-routes'
import {
  getAppTestInitialRoute,
  resetAppTestInitialRoute,
  setAppTestInitialRoute,
} from './helpers/app-memory-route'

const mockParticipantProfile: ParticipantProfileApi = {
  completedCount: 0,
  points: 0,
  currentStreak: 0,
  lastCompletionUtcDay: null,
  badges: [],
}

vi.mock('../src/services/api', () => ({
  initSession: vi.fn().mockReturnValue(Date.now()),
  submitSurveyResponse: vi.fn().mockResolvedValue({ success: true }),
  fetchParticipantProfile: vi.fn(),
}))

vi.mock('../src/services/analytics', () => ({
  fetchAdminAnalytics: vi.fn(),
}))

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        actual.MemoryRouter,
        {
          initialEntries: [getAppTestInitialRoute()],
        },
        children
      ),
  }
})

describe('App Router Integration', () => {
  beforeEach(() => {
    window.localStorage.removeItem('adminToken')
    window.localStorage.removeItem('respondentIdToken')
    window.localStorage.setItem(
      'survey_kit_consent_privacy',
      JSON.stringify({ status: 'accepted', timestamp: Date.now() })
    )
    setAppTestInitialRoute(templateRoutes.home)
    vi.mocked(fetchAdminAnalytics).mockReset()
    vi.mocked(fetchParticipantProfile).mockReset()
    vi.mocked(fetchParticipantProfile).mockResolvedValue({
      success: true,
      data: mockParticipantProfile,
    })
    vi.mocked(submitSurveyResponse).mockResolvedValue({ success: true })
  })

  afterEach(() => {
    resetAppTestInitialRoute()
  })

  it('renders the index layout (get started page) by default', async () => {
    setAppTestInitialRoute(templateRoutes.home)
    render(<Root />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Default Survey/i })
      ).toBeInTheDocument()
    })
  })

  it('navigates to survey-1 when Get started is clicked', async () => {
    setAppTestInitialRoute(templateRoutes.home)
    render(<Root />)

    const startBtn = await screen.findByRole('button', {
      name: /Default Survey/i,
    })
    await userEvent.click(startBtn)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Primary contact' })
      ).toBeInTheDocument()
    })
  })

  it('renders chat-survey when requested', async () => {
    setAppTestInitialRoute(templateRoutes.chatSurvey)
    render(<Root />)

    await waitFor(() => {
      expect(screen.getByText('Technology Survey')).toBeInTheDocument()
    })
  })

  it('renders completion screen when requested', async () => {
    setAppTestInitialRoute(templateRoutes.complete1)
    render(<Root />)

    await waitFor(() => {
      expect(screen.getByText('Main form complete')).toBeInTheDocument()
    })
  })

  it('shows the admin login page', async () => {
    setAppTestInitialRoute(templateRoutes.adminLogin)
    render(<Root />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^Admin Login$/i })
      ).toBeInTheDocument()
    })
  })

  it('shows the admin dashboard when an auth token is present', async () => {
    window.localStorage.setItem('adminToken', 'test-token')
    vi.mocked(fetchAdminAnalytics).mockResolvedValue({
      success: true,
      data: {},
    })

    setAppTestInitialRoute(templateRoutes.adminDashboard)
    render(<Root />)

    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument()
    })
    expect(
      screen.getByRole('heading', { name: /Survey Admin Dashboard/i })
    ).toBeInTheDocument()
  })

  it('redirects to admin login when dashboard is opened without a token', async () => {
    setAppTestInitialRoute(templateRoutes.adminDashboard)
    render(<Root />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^Admin Login$/i })
      ).toBeInTheDocument()
    })
  })

  it('logs out from the admin dashboard and returns to admin login', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('adminToken', 'test-token')
    vi.mocked(fetchAdminAnalytics).mockResolvedValue({
      success: true,
      data: {},
    })

    setAppTestInitialRoute(templateRoutes.adminDashboard)
    render(<Root />)

    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^Log Out$/i }))

    await waitFor(() => {
      expect(window.localStorage.getItem('adminToken')).toBeNull()
      expect(
        screen.getByRole('heading', { name: /^Admin Login$/i })
      ).toBeInTheDocument()
    })
  })

  it('shows the participant login page', async () => {
    setAppTestInitialRoute(templateRoutes.participantLogin)
    render(<Root />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Participant account/i })
      ).toBeInTheDocument()
    })
  })

  it('redirects participant profile to login when no respondent token', async () => {
    setAppTestInitialRoute(templateRoutes.participantProfile)
    render(<Root />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Participant account/i })
      ).toBeInTheDocument()
    })
  })

  it('redirects survey demo to login when no respondent token', async () => {
    setAppTestInitialRoute(templateRoutes.surveyDemo)
    render(<Root />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Participant account/i })
      ).toBeInTheDocument()
    })
  })

  it('shows participant profile when a respondent token is present', async () => {
    window.localStorage.setItem('respondentIdToken', 'test-respondent-jwt')
    setAppTestInitialRoute(templateRoutes.participantProfile)
    render(<Root />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Your progress/i })
      ).toBeInTheDocument()
    })
  })

  it('clears token and shows login when profile returns 401 and user taps Back to login', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchParticipantProfile).mockResolvedValue({
      success: false,
      error: 'HTTP 401',
    })
    window.localStorage.setItem('respondentIdToken', 'expired-jwt')
    setAppTestInitialRoute(templateRoutes.participantProfile)
    render(<Root />)

    await waitFor(() => {
      expect(screen.getByText(/HTTP 401/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Back to login/i }))

    await waitFor(() => {
      expect(window.localStorage.getItem('respondentIdToken')).toBeNull()
      expect(
        screen.getByRole('heading', { name: /Participant account/i })
      ).toBeInTheDocument()
    })
  })

  it('renders the types demo survey when a respondent token is present', async () => {
    window.localStorage.setItem('respondentIdToken', 'test-respondent-jwt')
    setAppTestInitialRoute(templateRoutes.surveyDemo)
    render(<Root />)

    await waitFor(() => {
      expect(screen.getByText(/Short text/i)).toBeInTheDocument()
    })
  })

  describe('privacy consent gate', () => {
    beforeEach(() => {
      window.localStorage.removeItem('survey_kit_consent_privacy')
    })

    it('shows a blocked state after the user rejects privacy terms', async () => {
      const user = userEvent.setup()
      setAppTestInitialRoute(templateRoutes.home)
      render(<Root />)

      const rejectBtn = await screen.findByRole('button', {
        name: /I do not agree/i,
      })
      await user.click(rejectBtn)

      await waitFor(() => {
        expect(screen.getByText(/You cannot continue/i)).toBeInTheDocument()
      })
    })
  })
})
