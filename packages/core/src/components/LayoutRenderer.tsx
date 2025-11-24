import React, { useState, useEffect, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import { Check, MoreHorizontal } from 'lucide-react'
import { cn } from '../lib/utils'
import { validateQuestion, isValidForNavigation } from '../lib/validation'
import { shouldShowPage, shouldShowQuestion } from '../lib/conditional'
import type { LayoutConfig } from '../types/layout'
import type { SurveyConfig, PageCompletionStatus } from '../types/survey'

const STORAGE_KEY_PREFIX = 'survey-kit-'

// Helper function to get survey answers from localStorage
const getSurveyAnswers = (
  surveyId: string
): Record<string, { value: unknown }> => {
  if (typeof window === 'undefined') return {}
  const storageKey = `${STORAGE_KEY_PREFIX}${surveyId}`
  const savedData = localStorage.getItem(storageKey)
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData)
      return parsed.answers || {}
    } catch {
      return {}
    }
  }
  return {}
}

// Helper function to check if page is complete (all visible requiredToNavigate questions are valid)
const isPageComplete = (
  pageIndex: number,
  config: SurveyConfig,
  answers: Record<string, { value: unknown }>
): boolean => {
  const page = config.pages[pageIndex]
  if (!page) return false

  // Flatten answers for conditional logic
  const flattenedAnswers = Object.entries(answers).reduce(
    (acc, [key, answer]) => {
      acc[key] = answer.value
      return acc
    },
    {} as Record<string, unknown>
  )

  // Get visible questions for this page
  const visibleQuestions = page.questions.filter((question) =>
    shouldShowQuestion(question, flattenedAnswers)
  )

  for (const question of visibleQuestions) {
    if (question.requiredToNavigate) {
      const answer = answers[question.id]?.value
      if (!isValidForNavigation(question, answer, answers)) {
        return false
      }
    }
  }

  return true
}

// Helper function to get page completion status (only considers visible questions)
const getPageCompletionStatus = (
  pageIndex: number,
  config: SurveyConfig,
  answers: Record<string, { value: unknown }>
): PageCompletionStatus => {
  const page = config.pages[pageIndex]
  if (!page) return 'empty'

  // Flatten answers for conditional logic
  const flattenedAnswers = Object.entries(answers).reduce(
    (acc, [key, answer]) => {
      acc[key] = answer.value
      return acc
    },
    {} as Record<string, unknown>
  )

  // Get visible questions for this page
  const visibleQuestions = page.questions.filter((question) =>
    shouldShowQuestion(question, flattenedAnswers)
  )

  // If no visible questions, consider empty
  if (visibleQuestions.length === 0) return 'empty'

  let hasAnyAnswer = false
  let hasAllAnswers = true
  let hasAllRequiredAnswers = true

  for (const question of visibleQuestions) {
    const answer = answers[question.id]?.value
    const hasAnswer =
      answer !== null &&
      answer !== '' &&
      answer !== undefined &&
      !(Array.isArray(answer) && answer.length === 0)

    // Check if answer is valid (not just exists, but passes validation)
    const isValid =
      hasAnswer && validateQuestion(question, answer, answers).length === 0

    if (hasAnswer) {
      hasAnyAnswer = true
    } else {
      hasAllAnswers = false
    }

    // For requiredToNavigate questions, check if they're valid
    if (question.requiredToNavigate && !isValid) {
      hasAllRequiredAnswers = false
    }
  }

  // If page has requiredToNavigate questions, use stricter criteria
  const hasRequiredToNavigate = visibleQuestions.some(
    (q) => q.requiredToNavigate
  )
  if (hasRequiredToNavigate) {
    // Only mark as complete if all requiredToNavigate questions are valid
    return hasAllRequiredAnswers
      ? 'complete'
      : hasAnyAnswer
        ? 'partial'
        : 'empty'
  }

  // For pages without requiredToNavigate, use original logic
  if (hasAllAnswers) return 'complete'
  if (hasAnyAnswer) return 'partial'
  return 'empty'
}

// Helper function to get latest accessible page index
// A page is accessible if all visible pages BEFORE it are complete
const getLatestAccessiblePageIndex = (
  config: SurveyConfig,
  answers: Record<string, { value: unknown }>
): number => {
  // Flatten answers for conditional logic
  const flattenedAnswers = Object.entries(answers).reduce(
    (acc, [key, answer]) => {
      acc[key] = answer.value
      return acc
    },
    {} as Record<string, unknown>
  )

  // Get visible pages
  const visiblePages = config.pages.filter((page) =>
    shouldShowPage(page, flattenedAnswers)
  )

  if (visiblePages.length === 0) return 0

  let latestAccessible = 0

  for (let i = 1; i < visiblePages.length; i++) {
    // Check if all visible pages BEFORE this one (i) are complete
    let allPreviousComplete = true
    for (let j = 0; j < i; j++) {
      const page = visiblePages[j]
      const pageIndex = config.pages.findIndex((p) => p.id === page.id)
      if (pageIndex >= 0 && !isPageComplete(pageIndex, config, answers)) {
        allPreviousComplete = false
        break
      }
    }

    if (allPreviousComplete) {
      latestAccessible = i
    } else {
      break
    }
  }

  // Convert visible page index back to actual page index
  const latestVisiblePage = visiblePages[latestAccessible]
  if (latestVisiblePage) {
    const actualIndex = config.pages.findIndex(
      (p) => p.id === latestVisiblePage.id
    )
    return actualIndex >= 0 ? actualIndex : 0
  }

  return 0
}

interface LayoutRendererProps {
  layoutConfig: LayoutConfig
  surveyConfig: SurveyConfig
  components: {
    LayoutWrapper?: React.ComponentType<any>
    Wrapper?: React.ComponentType<any>
    Header?: React.ComponentType<any>
    Sidebar?: React.ComponentType<any>
    Footer?: React.ComponentType<any>
    MainContent?: React.ComponentType<any>
    Button?: React.ComponentType<any>
    Heading?: React.ComponentType<any>
    [key: string]: React.ComponentType<any> | undefined
  }
  children: React.ReactNode
  onAction?: (actionId: string, ...args: unknown[]) => void
  onPageChange?: (pageId: string) => void
  currentPageId?: string
}

/**
 * Layout renderer component
 * Renders header, main content, and footer based on layout configuration
 * Styling is handled by registry components
 */
export function LayoutRenderer({
  layoutConfig,
  surveyConfig,
  components,
  children,
  onAction,
  onPageChange,
  currentPageId,
}: LayoutRendererProps): React.JSX.Element {
  // Set favicon if configured
  useEffect(() => {
    if (layoutConfig.favicon && typeof document !== 'undefined') {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      link.href = layoutConfig.favicon
    }
  }, [layoutConfig.favicon])
  const {
    Header,
    Button,
    Heading,
    Sidebar,
    LayoutWrapper,
    MainContent,
    Footer,
  } = components
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activePageId, setActivePageId] = useState<string>(() => {
    // Get current page from props, URL, or default to first page
    if (currentPageId) return currentPageId
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash) return hash
      const params = new URLSearchParams(window.location.search)
      return params.get('page') || surveyConfig?.pages?.[0]?.id || ''
    }
    return surveyConfig?.pages?.[0]?.id || ''
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Watch for URL changes to update active page
  useEffect(() => {
    if (currentPageId) {
      setActivePageId(currentPageId)
      return
    }

    const updateActivePage = () => {
      if (typeof window === 'undefined') return
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setActivePageId(hash)
        return
      }
      const params = new URLSearchParams(window.location.search)
      const pageId = params.get('page')
      if (pageId) {
        setActivePageId(pageId)
      } else {
        setActivePageId(surveyConfig?.pages?.[0]?.id || '')
      }
    }

    // Initial check
    updateActivePage()

    // Listen to custom event from useSurvey hook
    const handlePageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ pageId: string }>
      if (customEvent.detail?.pageId) {
        setActivePageId(customEvent.detail.pageId)
      }
    }

    // Listen to hashchange events (for direct URL navigation)
    window.addEventListener('hashchange', updateActivePage)
    // Listen to custom event from useSurvey (for programmatic navigation)
    window.addEventListener(
      'survey-page-change',
      handlePageChange as EventListener
    )

    return () => {
      window.removeEventListener('hashchange', updateActivePage)
      window.removeEventListener(
        'survey-page-change',
        handlePageChange as EventListener
      )
    }
  }, [currentPageId, surveyConfig])

  const WrapperComponent =
    LayoutWrapper ||
    (({ children }: { children?: React.ReactNode }) => <div>{children}</div>)

  const MainContentComponent =
    MainContent ||
    (({ children }: { children?: React.ReactNode }) => <div>{children}</div>)

  const FooterComponent =
    Footer ||
    (({ children }: { children?: React.ReactNode }) => (
      <footer>{children}</footer>
    ))

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [surveyAnswers, setSurveyAnswers] = useState<
    Record<string, { value: unknown }>
  >(() => getSurveyAnswers(surveyConfig?.id || ''))

  // Listen for answer changes via localStorage events or polling
  useEffect(() => {
    const updateAnswers = () => {
      const answers = getSurveyAnswers(surveyConfig?.id || '')
      setSurveyAnswers(answers)
    }

    // Initial load
    updateAnswers()

    // Listen for storage events (from other tabs/windows)
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith(STORAGE_KEY_PREFIX + surveyConfig?.id)) {
        updateAnswers()
      }
    }

    // Poll for changes (since same-tab changes don't trigger storage events)
    // Also listen for custom events from useSurvey
    const handleAnswerChange = () => {
      updateAnswers()
    }

    const interval = setInterval(updateAnswers, 100)
    window.addEventListener('survey-answer-change', handleAnswerChange)

    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('survey-answer-change', handleAnswerChange)
      clearInterval(interval)
    }
  }, [surveyConfig?.id])

  // Flatten answers for conditional logic (convert from { value: ... } to flat structure)
  const flattenedAnswers = useMemo(() => {
    const flat: Record<string, unknown> = {}
    Object.entries(surveyAnswers).forEach(([key, answer]) => {
      flat[key] = answer.value
    })
    return flat
  }, [surveyAnswers])

  // Calculate latest accessible page
  const latestAccessiblePageIndex = getLatestAccessiblePageIndex(
    surveyConfig || { id: '', title: '', pages: [] },
    surveyAnswers
  )

  // Get visible pages (filtered by conditional logic)
  const visiblePages =
    surveyConfig?.pages?.filter((page) =>
      shouldShowPage(page, flattenedAnswers)
    ) || []

  // Generate sidebar items from visible pages only
  const sidebarItems = visiblePages.map((page) => {
    const pageIndex =
      surveyConfig?.pages?.findIndex((p) => p.id === page.id) ?? -1
    const completionStatus =
      pageIndex >= 0
        ? getPageCompletionStatus(pageIndex, surveyConfig, surveyAnswers)
        : 'empty'
    const disabled = pageIndex > latestAccessiblePageIndex
    const tooltip = disabled
      ? 'Please complete all required questions on previous pages before accessing this page'
      : undefined

    return {
      id: page.id,
      label: page.title || `Page ${pageIndex + 1}`,
      icon: page.icon,
      active: activePageId === page.id,
      completionStatus,
      disabled,
      tooltip,
    }
  })

  const handleSidebarItemClick = (pageId: string, disabled?: boolean) => {
    // Prevent navigation if page is disabled
    if (disabled) return

    // Check if page is accessible
    const pageIndex =
      surveyConfig?.pages?.findIndex((p) => p.id === pageId) ?? -1
    if (pageIndex > latestAccessiblePageIndex) {
      // Redirect to latest accessible page
      const latestPage = surveyConfig?.pages?.[latestAccessiblePageIndex]
      if (latestPage) {
        const url = new URL(window.location.href)
        url.hash = latestPage.id
        url.searchParams.set('page', latestPage.id)
        window.location.href = url.toString()
      }
      return
    }

    if (onPageChange) {
      onPageChange(pageId)
    } else if (typeof window !== 'undefined') {
      // Fallback to URL navigation
      const newUrl = new URL(window.location.href)
      newUrl.hash = pageId
      newUrl.searchParams.set('page', pageId)
      window.location.href = newUrl.toString()
    }
  }

  // Note: We don't auto-redirect here - let SurveyRenderer show BlockedPage instead
  // This allows users to see the blocked page and use the redirect button

  return (
    <WrapperComponent>
      {/* Header */}
      {layoutConfig.header?.enabled && Header && (
        <Header
          variant="primary"
          size="lg"
          logoSmall={layoutConfig.header.logo?.small}
          logoLarge={layoutConfig.header.logo?.large}
          logo={
            !layoutConfig.header.logo &&
            (layoutConfig.header.organization || layoutConfig.header.title) ? (
              <div className="flex flex-col">
                {layoutConfig.header.organization && (
                  <div className="flex items-center gap-2">
                    {!layoutConfig.header.logo && (
                      <div className="w-8 h-8 bg-spring-green rounded" />
                    )}
                    <span className="sm:block hidden text-white text-sm">
                      {layoutConfig.header.organization}
                    </span>
                  </div>
                )}
                {layoutConfig.header.title && Heading && (
                  <Heading level="h1" className="text-white text-3xl font-bold">
                    {layoutConfig.header.title}
                  </Heading>
                )}
              </div>
            ) : undefined
          }
          actions={
            <div className="flex gap-2 items-center">
              {/* Mobile sidebar toggle button */}
              {layoutConfig.main?.sidebar?.enabled &&
                isMobile &&
                Sidebar &&
                Button && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 lg:hidden"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </Button>
                )}
              {/* Desktop: Show header actions in header */}
              {!isMobile &&
                layoutConfig.header.actions &&
                layoutConfig.header.actions.length > 0 &&
                Button &&
                layoutConfig.header.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="bg-white border-white text-night-blue hover:bg-gray-100"
                    onClick={() => onAction?.(action.onClick)}
                  >
                    {action.label}
                  </Button>
                ))}
            </div>
          }
        />
      )}

      {/* Main Content */}
      {layoutConfig.main?.enabled && (
        <MainContentComponent>
          {layoutConfig.main.sidebar?.enabled && Sidebar ? (
            <>
              {/* Desktop sidebar - always visible on large screens */}
              <div className="hidden lg:flex lg:gap-8 relative flex-1">
                <Sidebar
                  mobile={false}
                  mobileOpen={true}
                  collapsed={sidebarCollapsed}
                  size="md"
                  header={
                    Button && (
                      <div className="flex items-center justify-between">
                        {!sidebarCollapsed && (
                          <span className="font-semibold text-sm">
                            Navigation
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto"
                          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                          aria-label={
                            sidebarCollapsed
                              ? 'Expand sidebar'
                              : 'Collapse sidebar'
                          }
                        >
                          {sidebarCollapsed ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          )}
                        </Button>
                      </div>
                    )
                  }
                  footer={undefined}
                >
                  {sidebarItems.map((item) => {
                    // Get icon from lucide-react
                    const IconComponent = item.icon
                      ? (LucideIcons[item.icon as keyof typeof LucideIcons] as
                          | React.ComponentType<{ className?: string }>
                          | undefined)
                      : null

                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          handleSidebarItemClick(item.id, item.disabled)
                        }
                        className={cn(
                          'flex items-center gap-2 rounded transition-colors',
                          sidebarCollapsed ? 'justify-center p-2' : 'p-2',
                          item.disabled
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer',
                          item.active
                            ? item.disabled
                              ? 'text-ocean-blue border-2 border-ocean-blue'
                              : 'border-ocean-blue border-1'
                            : !item.disabled && 'hover:border-muted'
                        )}
                        title={
                          sidebarCollapsed
                            ? item.label
                            : item.tooltip || item.label
                        }
                      >
                        {IconComponent && (
                          <IconComponent className="w-4 h-4 flex-shrink-0" />
                        )}
                        {!sidebarCollapsed && (
                          <>
                            <span className="text-sm flex-1">{item.label}</span>
                            {item.completionStatus === 'complete' && (
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                            {item.completionStatus === 'partial' && (
                              <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </Sidebar>
                <div className="flex-1 w-full">{children}</div>
              </div>
              {/* Mobile layout - no sidebar by default, shows in overlay when open */}
              <div className="lg:hidden flex-1">
                {isMobile && sidebarOpen && (
                  <Sidebar
                    mobile={true}
                    mobileOpen={sidebarOpen}
                    onClick={() => setSidebarOpen(false)}
                    footer={
                      layoutConfig.header?.actions &&
                      layoutConfig.header.actions.length > 0 &&
                      Button ? (
                        <div className="space-y-2">
                          {layoutConfig.header.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="default"
                              className="w-full"
                              onClick={() => {
                                onAction?.(action.onClick)
                                setSidebarOpen(false)
                              }}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      ) : undefined
                    }
                  >
                    {sidebarItems.map((item) => {
                      const IconComponent = item.icon
                        ? (LucideIcons[
                            item.icon as keyof typeof LucideIcons
                          ] as
                            | React.ComponentType<{ className?: string }>
                            | undefined)
                        : null
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (!item.disabled) {
                              handleSidebarItemClick(item.id, item.disabled)
                              setSidebarOpen(false)
                            }
                          }}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded transition-colors',
                            item.disabled
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer',
                            item.active
                              ? item.disabled
                                ? 'bg-ocean-blue/30 text-ocean-blue border-2 border-ocean-blue'
                                : 'bg-ocean-blue text-white'
                              : !item.disabled && 'hover:bg-muted'
                          )}
                          title={item.tooltip || item.label}
                        >
                          {IconComponent && (
                            <IconComponent className="w-4 h-4" />
                          )}
                          <span className="text-sm flex-1">{item.label}</span>
                          {item.completionStatus === 'complete' && (
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          {item.completionStatus === 'partial' && (
                            <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </Sidebar>
                )}
                {children}
              </div>
            </>
          ) : (
            children
          )}
        </MainContentComponent>
      )}

      {/* Footer */}
      {layoutConfig.footer?.enabled && FooterComponent && (
        <FooterComponent
          logoSmall={layoutConfig.footer.logo?.small}
          logoLarge={layoutConfig.footer.logo?.large}
        >
          {layoutConfig.footer.organization && (
            <div className="flex items-center gap-2">
              {!layoutConfig.footer.logo && (
                <div className="w-6 h-6 bg-spring-green rounded" />
              )}
              <span className="text-sm text-foreground">
                {layoutConfig.footer.organization}
              </span>
            </div>
          )}
        </FooterComponent>
      )}
    </WrapperComponent>
  )
}
