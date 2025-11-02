import React, { useMemo } from 'react'
import type { SurveyConfig, SurveyQuestion } from '../types/survey'
import { useSurvey } from '../hooks/useSurvey'

interface SurveyRendererProps {
  config: SurveyConfig
  components: {
    Wrapper?: React.ComponentType<any>
    Header?: React.ComponentType<any>
    Sidebar?: React.ComponentType<any>
    Card?: React.ComponentType<any>
    Button?: React.ComponentType<any>
    Input?: React.ComponentType<any>
    Heading?: React.ComponentType<any>
    ProgressBar?: React.ComponentType<any>
    Dropdown?: React.ComponentType<any>
    Checkbox?: React.ComponentType<any>
    [key: string]: React.ComponentType<any> | undefined
  }
  onSubmit?: (answers: Record<string, unknown>) => Promise<void> | void
  layout?: 'default' | 'custom'
  children?:
    | React.ReactNode
    | ((props: {
        survey: ReturnType<typeof useSurvey>
        renderQuestion: (question: SurveyQuestion) => React.JSX.Element
        pageContent: React.JSX.Element
      }) => React.JSX.Element)
}

/**
 * Main survey renderer component
 * Renders a survey from JSON configuration and registry components
 */
export function SurveyRenderer({
  config,
  components,
  onSubmit,
  layout = 'default',
  children,
}: SurveyRendererProps): React.JSX.Element {
  const survey = useSurvey({ config, onSubmit })

  // Render a single question based on its type
  const renderQuestion = (question: SurveyQuestion): React.JSX.Element => {
    const { Input, Dropdown } = components
    const value = survey.getAnswerValue(question.id)

    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            {Input && (
              <Input
                type={question.type}
                placeholder={question.placeholder}
                value={value as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  survey.setAnswer(question.id, e.target.value)
                }
              />
            )}
            {survey.state.errors[question.id] && (
              <div className="text-sm text-red-500">
                {survey.state.errors[question.id].join(', ')}
              </div>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            <textarea
              placeholder={question.placeholder}
              value={value as string}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                survey.setAnswer(question.id, e.target.value)
              }
              className="w-full p-2 border rounded"
              rows={4}
            />
            {survey.state.errors[question.id] && (
              <div className="text-sm text-red-500">
                {survey.state.errors[question.id].join(', ')}
              </div>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            {Dropdown && (
              <Dropdown
                value={value as string}
                onChange={(val: string) => survey.setAnswer(question.id, val)}
                options={question.options || []}
              />
            )}
            {survey.state.errors[question.id] && (
              <div className="text-sm text-red-500">
                {survey.state.errors[question.id].join(', ')}
              </div>
            )}
          </div>
        )

      case 'checkbox':
      case 'radio':
        const { Checkbox } = components
        const isMultiple = question.type === 'checkbox'

        if (!Checkbox) {
          // Fallback to native inputs if Checkbox component not provided
          return (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium">
                {question.label}
                {question.required && <span className="text-red-500">*</span>}
              </label>
              {question.description && (
                <p className="text-sm text-gray-500">{question.description}</p>
              )}
              <div className="space-y-2">
                {question.options?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type={question.type}
                      value={option.value}
                      checked={
                        isMultiple
                          ? (value as string[])?.includes(option.value)
                          : value === option.value
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (isMultiple) {
                          const arr = (value as string[]) || []
                          if (e.target.checked) {
                            survey.setAnswer(question.id, [...arr, option.value])
                          } else {
                            survey.setAnswer(
                              question.id,
                              arr.filter((v) => v !== option.value)
                            )
                          }
                        } else {
                          survey.setAnswer(question.id, option.value)
                        }
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {survey.state.errors[question.id] && (
                <div className="text-sm text-red-500">
                  {survey.state.errors[question.id].join(', ')}
                </div>
              )}
            </div>
          )
        }

        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.label}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            <div className="space-y-2">
              {question.options?.map((option) => {
                const isChecked = isMultiple
                  ? (value as string[])?.includes(option.value)
                  : value === option.value

                return (
                  <Checkbox
                    key={option.value}
                    variant={isMultiple ? 'multiple' : 'singular'}
                    label={option.label}
                    checked={isChecked}
                    name={question.id}
                    value={option.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (isMultiple) {
                        const arr = (value as string[]) || []
                        if (e.target.checked) {
                          survey.setAnswer(question.id, [...arr, option.value])
                        } else {
                          survey.setAnswer(
                            question.id,
                            arr.filter((v) => v !== option.value)
                          )
                        }
                      } else {
                        survey.setAnswer(question.id, option.value)
                      }
                    }}
                  />
                )
              })}
            </div>
            {survey.state.errors[question.id] && (
              <div className="text-sm text-red-500">
                {survey.state.errors[question.id].join(', ')}
              </div>
            )}
          </div>
        )

      default:
        return (
          <div key={question.id}>Unknown question type: {question.type}</div>
        )
    }
  }

  // Render page questions
  const pageContent = useMemo(() => {
    return (
      <div className="space-y-6">
        {survey.currentPage.title && (
          <div>
            <h2 className="text-2xl font-bold">{survey.currentPage.title}</h2>
            {survey.currentPage.description && (
              <p className="text-gray-600 mt-2">
                {survey.currentPage.description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {survey.currentPage.questions.map(renderQuestion)}
        </div>
      </div>
    )
  }, [survey.currentPage])

  // Default layout
  if (layout === 'default' && !children) {
    const { Wrapper, ProgressBar, Button, Card } = components

    const WrapperComponent =
      Wrapper || (({ children }: { children?: React.ReactNode }) => children)
    const CardComponent =
      Card || (({ children }: { children?: React.ReactNode }) => children)

    return (
      <WrapperComponent>
        {config.progressBar && ProgressBar && (
          <ProgressBar value={survey.progress} showLabel label="Progress" />
        )}
        <CardComponent>
          {pageContent}
          <div className="flex justify-between gap-4 mt-8">
            {!survey.isFirstPage && Button && (
              <Button variant="secondary" onClick={survey.prevPage}>
                Previous
              </Button>
            )}
            {Button && (
              <Button
                variant="default"
                onClick={
                  survey.isLastPage ? survey.submitSurvey : survey.nextPage
                }
                className="ml-auto"
              >
                {survey.isLastPage ? 'Submit' : 'Next'}
              </Button>
            )}
          </div>
        </CardComponent>
      </WrapperComponent>
    )
  }

  // Custom layout with children
  return (
    <div>
      {children && typeof children === 'function'
        ? children({
            survey,
            renderQuestion,
            pageContent,
          })
        : children}
    </div>
  )
}
