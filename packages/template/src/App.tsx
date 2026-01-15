import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
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
  type SectionConfig,
} from '@survey-kit/registry'
import {
  SurveyRenderer,
  LayoutRenderer,
  type SurveyConfig,
  type LayoutConfig,
  type SectionsConfig,
} from '@survey-kit/core'
import surveyConfig1 from './surveys/survey-1.json'
import surveyConfig2 from './surveys/survey-2.json'
import layoutConfig from './layouts/layout.config.json'
import sectionsConfig from './sections/sections.config.json'

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

interface SurveyPageProps {
  config: SurveyConfig
  completionRoute: string
}

function SurveyPage({ config, completionRoute }: SurveyPageProps) {
  const navigate = useNavigate()

  const handleSurveySubmit = async (answers: Record<string, unknown>) => {
    console.log('Survey submitted with answers:', answers)
    navigate(completionRoute)
  }

  const handleLayoutAction = (actionId: string) => {
    console.log('Layout action triggered:', actionId)
    if (actionId === 'handleSave') {
      navigate('/sign-out')
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
    }
  }

  if (config.layout?.header || config.layout?.footer) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {config.layout.header && (
          <Header
            variant="primary"
            size="lg"
            logoSmall={(layoutConfig as LayoutConfig).header?.logo?.small}
            logoLarge={(layoutConfig as LayoutConfig).header?.logo?.large}
            actions={
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => handleLayoutAction('handleSave')}
              >
                Save and sign out
              </Button>
            }
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
            logoSmall={(layoutConfig as LayoutConfig).footer?.logo?.small}
            logoLarge={(layoutConfig as LayoutConfig).footer?.logo?.large}
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

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
