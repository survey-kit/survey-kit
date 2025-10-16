import React, { useMemo } from 'react'
import {
  Button,
  Card,
  Dropdown,
  Heading,
  Input,
  ProgressBar,
  Wrapper,
  Header,
  Sidebar,
} from '@survey-kit/registry'
import { SurveyRenderer, type SurveyConfig } from '@survey-kit/core'
import surveyConfig from './surveys/example.json'

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SurveyRenderer
        config={surveyConfig as SurveyConfig}
        components={components}
        onSubmit={handleSurveySubmit}
      />
    </div>
  )
}

export default App
