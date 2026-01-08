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
    BlockedPage?: React.ComponentType<any>
    Panel?: React.ComponentType<any>
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
  const { ProgressBar: ProgressBarComponent } = components

  // Get progress configuration
  const progressConfig = config.progress || {}
  const showProgress = {
    overall: progressConfig.showOverall ?? config.progressBar ?? false,
    perStage: progressConfig.showPerStage ?? false,
    perGroup: progressConfig.showPerGroup ?? false,
    perPage: progressConfig.showPerPage ?? false,
  }
  const progressLocations = progressConfig.location || ['page']

  // Check if current page should be accessible
  const latestAccessiblePageIndex = survey.getLatestAccessiblePageIndex()
  const allPages = survey.getVisiblePages()
  const currentPageIndex = allPages.findIndex(
    (p) => p.id === survey.currentPage?.id
  )
  const isPageAccessible = currentPageIndex <= latestAccessiblePageIndex

  // Get redirect URL for blocked page (latest accessible page)
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return ''
    const latestPage = allPages[latestAccessiblePageIndex]
    if (!latestPage) return window.location.href
    const url = new URL(window.location.href)
    url.hash = latestPage.id
    url.searchParams.set('page', latestPage.id)
    return url.toString()
  }

  // Handle form submission (Enter key or Next button)
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (survey.isLastPage) {
      survey.submitSurvey()
    } else {
      survey.nextPage()
    }
  }

  // Handle Enter key press in inputs (not textareas)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (survey.isLastPage) {
        survey.submitSurvey()
      } else {
        survey.nextPage()
      }
    }
  }

  // Render a single question based on its type
  const renderQuestion = (question: SurveyQuestion): React.JSX.Element => {
    const { Input, Dropdown, Panel: PanelComponent } = components
    const value = survey.getAnswerValue(question.id)
    const errorId = `${question.id}-error`
    const hasError = Boolean(survey.state.errors[question.id])

    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.label}
              {(question.required || question.requiredToNavigate) && (
                <span className="text-red-500">*</span>
              )}
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
                onKeyDown={handleKeyDown}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
              />
            )}
            {hasError &&
              (PanelComponent ? (
                <PanelComponent variant="error" id={errorId}>
                  {survey.state.errors[question.id].join(', ')}
                </PanelComponent>
              ) : (
                <div id={errorId} role="alert" className="text-sm text-red-500">
                  {survey.state.errors[question.id].join(', ')}
                </div>
              ))}
          </div>
        )

      case 'textarea':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.label}
              {(question.required || question.requiredToNavigate) && (
                <span className="text-red-500">*</span>
              )}
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
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
            />
            {hasError &&
              (PanelComponent ? (
                <PanelComponent variant="error" id={errorId}>
                  {survey.state.errors[question.id].join(', ')}
                </PanelComponent>
              ) : (
                <div id={errorId} role="alert" className="text-sm text-red-500">
                  {survey.state.errors[question.id].join(', ')}
                </div>
              ))}
          </div>
        )

      case 'select':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.label}
              {(question.required || question.requiredToNavigate) && (
                <span className="text-red-500">*</span>
              )}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            {Dropdown && (
              <Dropdown
                value={value as string}
                onChange={(val: string) => survey.setAnswer(question.id, val)}
                options={question.options || []}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
              />
            )}
            {hasError &&
              (PanelComponent ? (
                <PanelComponent variant="error" id={errorId}>
                  {survey.state.errors[question.id].join(', ')}
                </PanelComponent>
              ) : (
                <div id={errorId} role="alert" className="text-sm text-red-500">
                  {survey.state.errors[question.id].join(', ')}
                </div>
              ))}
          </div>
        )

      case 'checkbox':
      case 'radio': {
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
              <div
                className="space-y-2"
                role="group"
                aria-describedby={hasError ? errorId : undefined}
              >
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
                            survey.setAnswer(question.id, [
                              ...arr,
                              option.value,
                            ])
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
                      aria-invalid={hasError}
                      aria-describedby={hasError ? errorId : undefined}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {hasError && PanelComponent && (
                <PanelComponent variant="error" id={errorId}>
                  {survey.state.errors[question.id].join(', ')}
                </PanelComponent>
              )}
            </div>
          )
        }

        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {question.label}
              {(question.required || question.requiredToNavigate) && (
                <span className="text-red-500">*</span>
              )}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            <div
              className="space-y-2"
              role="group"
              aria-describedby={hasError ? errorId : undefined}
            >
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
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : undefined}
                  />
                )
              })}
            </div>
            {hasError &&
              (PanelComponent ? (
                <PanelComponent variant="error" id={errorId}>
                  {survey.state.errors[question.id].join(', ')}
                </PanelComponent>
              ) : (
                <div id={errorId} role="alert" className="text-sm text-red-500">
                  {survey.state.errors[question.id].join(', ')}
                </div>
              ))}
          </div>
        )
      }

      default:
        return (
          <div key={question.id}>Unknown question type: {question.type}</div>
        )
    }
  }

  // Render page questions (only visible questions)
  const pageContent = useMemo(() => {
    if (!survey.currentPage) {
      return <div className="text-center text-gray-500">No page available.</div>
    }
    const visibleQuestions = survey.getVisibleQuestions(survey.currentPage)
    return (
      <form id="survey-form" onSubmit={handleFormSubmit} className="space-y-6">
        {/* Progress bars based on config */}
        {progressLocations.includes('page') && ProgressBarComponent && (
          <div className="space-y-2">
            {showProgress.overall && (
              <ProgressBarComponent
                value={survey.overallProgress}
                showLabel
                label="Overall Progress"
              />
            )}
            {showProgress.perStage && survey.currentStage && (
              <ProgressBarComponent
                value={survey.stageProgress}
                showLabel
                label={`${survey.currentStage.title} Progress`}
              />
            )}
            {showProgress.perGroup && survey.currentGroup && (
              <ProgressBarComponent
                value={survey.groupProgress}
                showLabel
                label={`${survey.currentGroup.title} Progress`}
              />
            )}
            {showProgress.perPage && (
              <ProgressBarComponent
                value={survey.progress}
                showLabel
                label="Page Progress"
              />
            )}
          </div>
        )}
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
          {visibleQuestions.length > 0 ? (
            visibleQuestions.map(renderQuestion)
          ) : (
            <p className="text-gray-500 text-sm">
              No questions available on this page.
            </p>
          )}
        </div>
      </form>
    )
  }, [
    survey.currentPage,
    survey.currentStage,
    survey.currentGroup,
    survey.state.answers,
    survey.state.errors,
    survey.getVisibleQuestions,
    survey.overallProgress,
    survey.stageProgress,
    survey.groupProgress,
    survey.progress,
    survey.isLastPage,
    showProgress,
    progressLocations,
    ProgressBarComponent,
    handleFormSubmit,
  ])

  // Default layout
  if (layout === 'default' && !children) {
    const {
      Wrapper,
      ProgressBar,
      Button,
      Card,
      BlockedPage: BlockedPageComponent,
    } = components

    const WrapperComponent =
      Wrapper || (({ children }: { children?: React.ReactNode }) => children)
    const CardComponent =
      Card || (({ children }: { children?: React.ReactNode }) => children)

    // Show blocked page if current page is not accessible
    if (!isPageAccessible && BlockedPageComponent) {
      return (
        <WrapperComponent>
          <BlockedPageComponent redirectUrl={getRedirectUrl()} />
        </WrapperComponent>
      )
    }

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
                type="submit"
                form="survey-form"
                variant="default"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault()
                  if (survey.isLastPage) {
                    survey.submitSurvey()
                  } else {
                    survey.nextPage()
                  }
                }}
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
