import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom'
import { submitSurveyResponse, initSession } from './services/api'
import {
  Button,
  Card,
  SimpleDropdown as Dropdown,
  Heading,
  Input,
  ProgressBar,
  Wrapper,
  Header,
  Sidebar,
  LayoutWrapper,
  MainContent,
  Footer,
  Checkbox,
  BlockedPage,
  StageTabs,
  Panel,
  SidebarMenu,
  EmojiSlider,
  SectionPage,
  CookieConsent,
  useCookieConsent,
  CookieConsentProvider,
  useCookieConsentContext,
  ConsentGate,
  useConsent,
  ConsentProvider,
  useConsentContext,
  type SectionConfig,
  type CookieConsentConfig,
  type ConsentConfig,
  // Chat components
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
} from '@survey-kit/registry'
import {
  SurveyRenderer,
  LayoutRenderer,
  ChatSurveyRenderer,
  setDocumentFavicon,
  type SurveyConfig,
  type LayoutConfig,
  type SectionsConfig,
} from '@survey-kit/core'
import surveyConfig1 from './surveys/survey-1.json'
import surveyTypesDemo from './surveys/survey-types-demo.json'
import chatSurveyConfig from './surveys/chat-survey.json'
import layoutConfig from './layouts/layout.config.json'
import sectionsConfig from './sections/sections.config.json'
import cookieConfig from './cookies/cookies.config.json'
import privacyConfig from './consents/consents.config.json'
import { AdminLogin } from './sections/AdminLogin'
import { AdminDashboard } from './sections/AdminDashboard'
import { ParticipantLogin } from './sections/ParticipantLogin'
import { ParticipantProfile } from './sections/ParticipantProfile'
import { getAuthToken, removeAuthToken } from './services/auth'
import { getRespondentToken } from './services/respondentAuth'

const components = {
  Button,
  Card,
  Dropdown,
  Heading,
  Input,
  ProgressBar,
  Wrapper,
  Header,
  Sidebar,
  LayoutWrapper,
  MainContent,
  Footer,
  Checkbox,
  BlockedPage,
  StageTabs,
  Panel,
  SidebarMenu,
  EmojiSlider,
}

const chatComponents = {
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
  EmojiSlider,
}

interface ChatSurveyPageProps {
  completionRoute: string
}

/**
 * Chat survey page component that renders a chat-style survey.
 */
function ChatSurveyPage({ completionRoute }: ChatSurveyPageProps) {
  const navigate = useNavigate()
  const cookieContext = useCookieConsentContext()
  const sessionStartRef = React.useRef(initSession())
  const chatConfig = chatSurveyConfig as unknown as SurveyConfig

  const handleSubmit = async (answers: Record<string, unknown>) => {
    const result = await submitSurveyResponse({
      surveyId: chatConfig.id,
      answers,
      sessionStartTime: sessionStartRef.current,
      hasAnalyticsConsent: cookieContext.hasConsent('analytics'),
    })

    if (!result.success) {
      console.warn('Chat survey submission failed:', result.error)
    }

    localStorage.clear()
    navigate(completionRoute)
  }

  return (
    <ChatSurveyRenderer
      config={chatConfig}
      components={chatComponents}
      onSubmit={handleSubmit}
      typingDelay={{ min: 600, max: 1200 }}
      favicon={(layoutConfig as LayoutConfig).favicon}
    />
  )
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = getAuthToken()
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

function ParticipantRoute({ children }: { children: React.ReactNode }) {
  const token = getRespondentToken()
  if (!token) {
    return <Navigate to="/participant/login" replace />
  }
  return <>{children}</>
}

// Wrapper for Admin views to share the same Header/Footer as Survey pages
function AdminLayoutWrapper({
  children,
  headerActions,
}: {
  children: React.ReactNode
  headerActions?: React.ReactNode
}) {
  const cookieContext = useCookieConsentContext()
  const consentContext = useConsentContext()

  const handleLayoutAction = (actionId: string) => {
    if (actionId === 'showCookies') {
      cookieContext.showBanner()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (actionId === 'showPrivacy') {
      consentContext.showModal()
    }
  }

  const headerConfig = (layoutConfig as LayoutConfig).header
  const footerConfig = (layoutConfig as LayoutConfig).footer

  React.useEffect(() => {
    setDocumentFavicon((layoutConfig as LayoutConfig).favicon)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {headerConfig?.enabled && (
        <Header
          variant="primary"
          size="lg"
          logoSmall={headerConfig.logo?.small}
          logoLarge={headerConfig.logo?.large}
          actions={headerActions || []}
        />
      )}
      <main className="flex-1 flex flex-col">{children}</main>
      {footerConfig?.enabled && (
        <Footer
          logoSmall={footerConfig.logo?.small}
          logoLarge={footerConfig.logo?.large}
          links={footerConfig.links}
          description={footerConfig.description}
          onAction={handleLayoutAction}
        />
      )}
    </div>
  )
}

interface SurveyPageProps {
  config: SurveyConfig
  surveyId: string
  completionRoute: string
  /** Send respondent Id token on submit for server-side badges (no PII on response row) */
  attachRespondentBearer?: boolean
}

function SurveyPage({
  config,
  surveyId,
  completionRoute,
  attachRespondentBearer = false,
}: SurveyPageProps) {
  const navigate = useNavigate()
  const cookieContext = useCookieConsentContext()
  const consentContext = useConsentContext()
  const sessionStartRef = React.useRef(initSession())

  const handleSurveySubmit = async (answers: Record<string, unknown>) => {
    const bearerToken = attachRespondentBearer
      ? getRespondentToken()
      : undefined
    const result = await submitSurveyResponse({
      surveyId,
      answers,
      sessionStartTime: sessionStartRef.current,
      hasAnalyticsConsent: cookieContext.hasConsent('analytics'),
      bearerToken: bearerToken ?? undefined,
    })

    if (!result.success) {
      console.warn('Survey submission failed:', result.error)
    }

    navigate(completionRoute)
  }

  const handleLayoutAction = (actionId: string) => {
    console.log('Layout action triggered:', actionId)
    if (actionId === 'handleSave') {
      navigate('/sign-out')
    } else if (actionId === 'showCookies') {
      cookieContext.showBanner()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (actionId === 'showPrivacy') {
      consentContext.showModal()
    }
  }

  return (
    <LayoutRenderer
      layoutConfig={layoutConfig as LayoutConfig}
      surveyConfig={config}
      components={components}
      onAction={handleLayoutAction}
    >
      <SurveyRenderer
        config={config}
        components={components}
        onSubmit={handleSurveySubmit}
        layout="default"
      />
    </LayoutRenderer>
  )
}

function SectionPageWrapper({ sectionId }: { sectionId: string }) {
  const navigate = useNavigate()
  const cookieContext = useCookieConsentContext()
  const consentContext = useConsentContext()
  const config = (sectionsConfig as SectionsConfig).sections.find(
    (s) => s.id === sectionId
  ) as SectionConfig | undefined

  if (!config) {
    return <div>Section not found: {sectionId}</div>
  }

  const handleNavigate = (to: string) => {
    navigate(to)
  }

  const handleAction = (actionId: string, data?: Record<string, unknown>) => {
    console.log('Section action:', actionId, data)
  }

  const handleLayoutAction = (actionId: string) => {
    console.log('Layout action triggered:', actionId)
    if (actionId === 'handleSave') {
      navigate('/sign-out')
    } else if (actionId === 'showCookies') {
      cookieContext.showBanner()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (actionId === 'showPrivacy') {
      consentContext.showModal()
    }
  }

  const footerConfig = (layoutConfig as LayoutConfig).footer

  if (config.layout?.header || config.layout?.footer) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {config.layout.header && (
          <Header
            variant="primary"
            size="lg"
            logoSmall={(layoutConfig as LayoutConfig).header?.logo?.small}
            logoLarge={(layoutConfig as LayoutConfig).header?.logo?.large}
            actions={[]}
          />
        )}
        <main className="flex-1">
          <SectionPage
            config={config}
            onNavigate={handleNavigate}
            onAction={handleAction}
          />
        </main>
        {config.layout.footer && (
          <Footer
            logoSmall={footerConfig?.logo?.small}
            logoLarge={footerConfig?.logo?.large}
            links={footerConfig?.links}
            description={footerConfig?.description}
            onAction={handleLayoutAction}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SectionPage
        config={config}
        onNavigate={handleNavigate}
        onAction={handleAction}
      />
    </div>
  )
}

/**
 * Main App component with cookie consent banner and generic consent gate.
 */
function App() {
  const navigate = useNavigate()
  const consent = useCookieConsent(
    (cookieConfig as CookieConsentConfig).categories
  )
  const privacyAuth = useConsent('privacy')

  // Context value for child components
  const cookieContextValue = {
    showBanner: consent.showBanner,
    hideBanner: consent.hideBanner,
    hasConsent: consent.hasConsent,
  }

  const consentContextValue = {
    status: privacyAuth.status,
    shouldShowGate: privacyAuth.shouldShowGate,
    accept: privacyAuth.accept,
    reject: privacyAuth.reject,
    reset: privacyAuth.reset,
    showModal: privacyAuth.showModal,
    hideModal: privacyAuth.hideModal,
  }

  return (
    <CookieConsentProvider value={cookieContextValue}>
      <ConsentProvider value={consentContextValue}>
        {/* Privacy consent gate — must interact before continuing or if explicitly shown */}
        {privacyAuth.isLoaded && privacyAuth.shouldShowGate && (
          <ConsentGate
            config={privacyConfig as ConsentConfig}
            status={privacyAuth.status}
            onAccept={privacyAuth.accept}
            onReject={() => {
              privacyAuth.reject()
            }}
            onCancel={
              privacyAuth.status !== 'pending'
                ? privacyAuth.hideModal
                : undefined
            }
          />
        )}

        {/* Privacy rejected — static blocked page (if not currently re-reviewing) */}
        {privacyAuth.isLoaded &&
          privacyAuth.status === 'rejected' &&
          !privacyAuth.shouldShowGate && (
            <ConsentGate
              config={privacyConfig as ConsentConfig}
              status={privacyAuth.status}
              onAccept={privacyAuth.accept}
              onReject={privacyAuth.reject}
              onCancel={undefined}
              onReReview={privacyAuth.reset}
            />
          )}

        {/* Normal app — only rendered once privacy consent is accepted (and not currently re-reviewing) */}
        {privacyAuth.isLoaded &&
          privacyAuth.status === 'accepted' &&
          !privacyAuth.shouldShowGate && (
            <>
              {/* Cookie consent banner - shown at top when needed */}
              {consent.isLoaded && consent.shouldShowBanner && (
                <CookieConsent
                  config={cookieConfig as CookieConsentConfig}
                  onAcceptAll={consent.acceptAll}
                  onRejectAll={consent.rejectAll}
                  onSavePreferences={consent.saveGranular}
                />
              )}

              <Routes>
                <Route
                  path="/"
                  element={<SectionPageWrapper sectionId="intro" />}
                />
                <Route
                  path="/login"
                  element={<SectionPageWrapper sectionId="login" />}
                />

                {/* Survey 1: Technology Inventory (3 stages) */}
                <Route
                  path="/survey-1/*"
                  element={
                    <SurveyPage
                      config={surveyConfig1 as unknown as SurveyConfig}
                      surveyId="survey-1"
                      completionRoute="/complete-1"
                    />
                  }
                />
                <Route
                  path="/complete-1"
                  element={<SectionPageWrapper sectionId="complete-1" />}
                />

                <Route
                  path="/complete-2"
                  element={<SectionPageWrapper sectionId="complete-2" />}
                />

                <Route
                  path="/sign-out"
                  element={<SectionPageWrapper sectionId="sign-out" />}
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/login"
                  element={
                    <AdminLayoutWrapper>
                      <AdminLogin />
                    </AdminLayoutWrapper>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminLayoutWrapper
                        headerActions={
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              removeAuthToken()
                              navigate('/admin/login')
                            }}
                          >
                            Log Out
                          </Button>
                        }
                      >
                        <AdminDashboard />
                      </AdminLayoutWrapper>
                    </AdminRoute>
                  }
                />

                {/* Chat Survey Demo */}
                <Route
                  path="/chat-survey"
                  element={<ChatSurveyPage completionRoute="/complete-2" />}
                />

                <Route
                  path="/participant/login"
                  element={
                    <AdminLayoutWrapper>
                      <ParticipantLogin />
                    </AdminLayoutWrapper>
                  }
                />
                <Route
                  path="/participant/profile"
                  element={
                    <AdminLayoutWrapper>
                      <ParticipantRoute>
                        <ParticipantProfile />
                      </ParticipantRoute>
                    </AdminLayoutWrapper>
                  }
                />
                <Route
                  path="/survey-demo/*"
                  element={
                    <ParticipantRoute>
                      <SurveyPage
                        config={surveyTypesDemo as unknown as SurveyConfig}
                        surveyId={(surveyTypesDemo as { id: string }).id}
                        completionRoute="/participant/profile"
                        attachRespondentBearer
                      />
                    </ParticipantRoute>
                  }
                />
              </Routes>
            </>
          )}
      </ConsentProvider>
    </CookieConsentProvider>
  )
}

function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

export default Root
