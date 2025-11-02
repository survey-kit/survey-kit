import { useMemo } from 'react'
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
} from '@survey-kit/registry'
import {
  SurveyRenderer,
  LayoutRenderer,
  type SurveyConfig,
  type LayoutConfig,
} from '@survey-kit/core'
import surveyConfig from './surveys/example.json'
import layoutConfig from './layouts/layout.config.json'

function App() {
  // Map registry components for the SurveyRenderer
  const components = useMemo(
    () => ({
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
    }),
    []
  )

  const handleSurveySubmit = async (answers: Record<string, unknown>) => {
    console.log('Survey submitted with answers:', answers)
    // Here you would typically send the data to your backend
    alert(
      'Thank you! Your survey has been submitted.\n\nAnswers:\n' +
        JSON.stringify(answers, null, 2)
    )
  }

  const handleLayoutAction = (actionId: string) => {
    console.log('Layout action triggered:', actionId)
    // Handle layout actions like "Save and sign out"
    if (actionId === 'handleSave') {
      // Implement save logic here
      alert('Save functionality would be implemented here')
    }
  }

  return (
    <LayoutRenderer
      layoutConfig={layoutConfig as LayoutConfig}
      surveyConfig={surveyConfig as SurveyConfig}
      components={components}
      onAction={handleLayoutAction}
    >
      <SurveyRenderer
        config={surveyConfig as SurveyConfig}
        components={components}
        onSubmit={handleSurveySubmit}
        layout="default"
      />
    </LayoutRenderer>
  )
}

export default App
