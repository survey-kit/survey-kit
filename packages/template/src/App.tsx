import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
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
  type SectionConfig,
  type CookieConsentConfig,
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
  type SurveyConfig,
  type LayoutConfig,
  type SectionsConfig,
} from '@survey-kit/core'
import surveyConfig1 from './surveys/survey-1.json'
import surveyConfig2 from './surveys/survey-2.json'
import chatSurveyConfig from './surveys/chat-survey.json'
import layoutConfig from './layouts/layout.config.json'
import sectionsConfig from './sections/sections.config.json'
import cookieConfig from './cookies/cookies.config.json'

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
}

/**
 * Chat survey page component that renders a chat-style survey.
 */
function ChatSurveyPage() {
  const navigate = useNavigate()

  const handleSubmit = async (answers: Record<string, unknown>) => {
    console.log('Chat survey submitted with answers:', answers)
    navigate('/')
  }

  return (
    <ChatSurveyRenderer
      config={chatSurveyConfig as unknown as SurveyConfig}
      components={chatComponents}
      onSubmit={handleSubmit}
      typingDelay={{ min: 600, max: 1200 }}
    />
  )
}

interface SurveyPageProps {
  config: SurveyConfig
  surveyId: string
  completionRoute: string
}

function SurveyPage({ config, surveyId, completionRoute }: SurveyPageProps) {
  const navigate = useNavigate()
  const cookieContext = useCookieConsentContext()
  const sessionStartRef = React.useRef(initSession())

  const handleSurveySubmit = async (answers: Record<string, unknown>) => {
    const result = await submitSurveyResponse({
      surveyId,
      answers,
      sessionStartTime: sessionStartRef.current,
      hasAnalyticsConsent: cookieContext.hasConsent('analytics'),
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
 * Main App component with cookie consent banner
 */
function App() {
  const consent = useCookieConsent(
    (cookieConfig as CookieConsentConfig).categories
  )

  // Context value for child components
  const cookieContextValue = {
    showBanner: consent.showBanner,
    hideBanner: consent.hideBanner,
    hasConsent: consent.hasConsent,
  }

  return (
    <BrowserRouter>
      <CookieConsentProvider value={cookieContextValue}>
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
          <Route path="/" element={<SectionPageWrapper sectionId="intro" />} />
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

          {/* Survey 2: Feedback (all optional) */}
          <Route
            path="/survey-2/*"
            element={
              <SurveyPage
                config={surveyConfig2 as unknown as SurveyConfig}
                surveyId="survey-2"
                completionRoute="/complete-2"
              />
            }
          />
          <Route
            path="/complete-2"
            element={<SectionPageWrapper sectionId="complete-2" />}
          />

          <Route
            path="/sign-out"
            element={<SectionPageWrapper sectionId="sign-out" />}
          />

          {/* Chat Survey Demo */}
          <Route path="/chat-survey" element={<ChatSurveyPage />} />
        </Routes>
      </CookieConsentProvider>
    </BrowserRouter>
  )
}

export default App
