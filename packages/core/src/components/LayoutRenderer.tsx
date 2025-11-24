import React, { useState, useEffect, useMemo, useCallback } from 'react'
import * as LucideIcons from 'lucide-react'
import { Check, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { validateQuestion, isValidForNavigation } from '../lib/validation'
import {
  shouldShowPage,
  shouldShowQuestion,
  shouldShowGroup,
  shouldShowStage,
} from '../lib/conditional'
import {
  normaliseSurveyConfig,
  getAllPages,
  findPageById,
} from '../lib/migration'
import type { LayoutConfig } from '../types/layout'
import type {
  SurveyConfig,
  SurveyStage,
  SurveyGroup,
  SurveyPage,
  SurveyQuestion,
  PageCompletionStatus,
} from '../types/survey'

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
  pageId: string,
  config: SurveyConfig,
  answers: Record<string, { value: unknown }>
): boolean => {
  // Flatten answers for conditional logic
  const flattenedAnswers = Object.entries(answers).reduce(
    (acc, [key, answer]) => {
      acc[key] = answer.value
      return acc
    },
    {} as Record<string, unknown>
  )

  // Find page in stages/groups
  const page = findPageById(config, pageId)
  if (!page) return false

  // Get visible questions for this page
  const visibleQuestions = page.questions.filter((question: SurveyQuestion) =>
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
  pageId: string,
  config: SurveyConfig,
  answers: Record<string, { value: unknown }>
): PageCompletionStatus => {
  // Find page in stages/groups
  const page = findPageById(config, pageId)
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
  const visibleQuestions = page.questions.filter((question: SurveyQuestion) =>
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
    (q: SurveyQuestion) => q.requiredToNavigate
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

  // Get all pages (flattened from stages/groups or legacy pages)
  const allPages = getAllPages(config)

  // Get visible pages
  const visiblePages = allPages.filter((page) =>
    shouldShowPage(page, flattenedAnswers)
  )

  if (visiblePages.length === 0) return 0

  const navConfig = config.navigation
  const pageOrder = navConfig?.pageOrder || 'sequential'

  // If free navigation, all pages are accessible
  if (pageOrder === 'free') {
    const lastPage = visiblePages[visiblePages.length - 1]
    if (lastPage) {
      const index = allPages.findIndex((p) => p.id === lastPage.id)
      return index >= 0 ? index : 0
    }
    return 0
  }

  // Sequential navigation - check completion
  let latestAccessible = 0

  for (let i = 1; i < visiblePages.length; i++) {
    // Check if all visible pages BEFORE this one (i) are complete
    let allPreviousComplete = true
    for (let j = 0; j < i; j++) {
      const page = visiblePages[j]
      if (!isPageComplete(page.id, config, answers)) {
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
    const actualIndex = allPages.findIndex((p) => p.id === latestVisiblePage.id)
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
    StageTabs,
    ProgressBar,
  } = components

  // Normalise config to always have stages structure
  const normalisedConfig = useMemo(
    () =>
      normaliseSurveyConfig(surveyConfig || { id: '', title: '', pages: [] }),
    [surveyConfig]
  )

  // Get progress configuration
  const progressConfig = normalisedConfig.progress || {}

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [activePageId, setActivePageId] = useState<string>(() => {
    // Get current page from props, URL, or default to first page
    if (currentPageId) return currentPageId
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash) return hash
      const params = new URLSearchParams(window.location.search)
      const pageId = params.get('page')
      if (pageId) return pageId
    }
    // Get first page from normalised config
    const normalised = normaliseSurveyConfig(
      surveyConfig || { id: '', title: '', stages: [] }
    )
    const firstPage = getAllPages(normalised)[0]
    return firstPage?.id || ''
  })

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
        const normalised = normaliseSurveyConfig(
          surveyConfig || { id: '', title: '', stages: [] }
        )
        const firstPage = getAllPages(normalised)[0]
        setActivePageId(firstPage?.id || '')
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
  const [isMobile, setIsMobile] = useState(false)
  const [surveyAnswers, setSurveyAnswers] = useState<
    Record<string, { value: unknown }>
  >(() => getSurveyAnswers(surveyConfig?.id || ''))

  // Detect mobile view and handle sidebar collapse state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      // Auto-uncollapse sidebar when switching to mobile
      if (mobile && sidebarCollapsed) {
        setSidebarCollapsed(false)
      }
    }

    // Initial check
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [sidebarCollapsed])

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

  // Calculate overall progress from visible pages
  const overallProgress = useMemo(() => {
    const allPages = getAllPages(normalisedConfig)
    const visiblePages = allPages.filter((page) =>
      shouldShowPage(page, flattenedAnswers)
    )
    if (visiblePages.length === 0) return 0

    // Find current page index in visible pages
    const currentPageIndex = visiblePages.findIndex(
      (p) => p.id === activePageId
    )
    if (currentPageIndex < 0) return 0
    return ((currentPageIndex + 1) / visiblePages.length) * 100
  }, [normalisedConfig, flattenedAnswers, activePageId])

  // Calculate latest accessible page
  const latestAccessiblePageIndex = getLatestAccessiblePageIndex(
    normalisedConfig,
    surveyAnswers
  )

  // Get all pages (flattened)
  const allPages = useMemo(
    () => getAllPages(normalisedConfig),
    [normalisedConfig]
  )

  // Get visible stages
  const visibleStages = useMemo(() => {
    if (!normalisedConfig.stages) return []
    return normalisedConfig.stages.filter((stage) =>
      shouldShowStage(stage, flattenedAnswers)
    )
  }, [normalisedConfig.stages, flattenedAnswers])

  // Get visible groups for a stage
  const getVisibleGroupsForStage = useCallback(
    (stage: SurveyStage): SurveyGroup[] => {
      return stage.groups.filter((group) =>
        shouldShowGroup(group, flattenedAnswers)
      )
    },
    [flattenedAnswers]
  )

  // Get visible pages for a group
  const getVisiblePagesForGroup = useCallback(
    (group: SurveyGroup) => {
      return group.pages.filter((page) =>
        shouldShowPage(page, flattenedAnswers)
      )
    },
    [flattenedAnswers]
  )

  // Generate stage tabs
  const stageTabs = useMemo(() => {
    if (!normalisedConfig.stages || visibleStages.length === 0) return []
    const navConfig = normalisedConfig.navigation
    const stageOrder = navConfig?.stageOrder || 'sequential'

    return visibleStages.map((stage, index) => {
      // Check if stage is accessible (for sequential navigation)
      let disabled = false
      if (stageOrder === 'sequential' && index > 0) {
        // Check if all previous stages are complete
        for (let i = 0; i < index; i++) {
          const prevStage = visibleStages[i]
          const visibleGroups = getVisibleGroupsForStage(prevStage)
          let prevStageComplete = true
          for (const group of visibleGroups) {
            const visiblePages = getVisiblePagesForGroup(group)
            for (const page of visiblePages) {
              if (!isPageComplete(page.id, normalisedConfig, surveyAnswers)) {
                prevStageComplete = false
                break
              }
            }
            if (!prevStageComplete) break
          }
          if (!prevStageComplete) {
            disabled = true
            break
          }
        }
      }

      return {
        id: stage.id,
        title: stage.title,
        description: stage.description,
        icon: stage.icon,
        active: false, // Will be set based on current page
        disabled,
      }
    })
  }, [
    visibleStages,
    normalisedConfig,
    surveyAnswers,
    getVisibleGroupsForStage,
    getVisiblePagesForGroup,
  ])

  // Update active stage in tabs (must be defined before sidebarItems)
  const activeStageId = useMemo(() => {
    if (!normalisedConfig.stages || !activePageId) return null
    for (const stage of normalisedConfig.stages) {
      for (const group of stage.groups) {
        if (group.pages.some((p) => p.id === activePageId)) {
          return stage.id
        }
      }
    }
    return null
  }, [normalisedConfig.stages, activePageId])

  // Generate hierarchical sidebar items
  interface SidebarItem {
    id: string
    label: string
    icon?: string
    active: boolean
    completionStatus: PageCompletionStatus
    disabled: boolean
    tooltip?: string
    level: number // 0 = page, 1 = group, 2 = stage (if needed)
    type: 'page' | 'group'
    groupId?: string
    stageId?: string
  }

  const sidebarItems = useMemo(() => {
    const items: SidebarItem[] = []
    const navConfig = normalisedConfig.navigation
    const groupOrder = navConfig?.groupOrder || 'sequential'
    const pageOrder = navConfig?.pageOrder || 'sequential'

    // Only show sidebar items for the current stage
    const currentStageForSidebar = activeStageId
      ? visibleStages.find((s) => s.id === activeStageId)
      : visibleStages[0]

    if (!currentStageForSidebar) return items

    const visibleGroups = getVisibleGroupsForStage(currentStageForSidebar)

    visibleGroups.forEach((group) => {
      const visiblePages = getVisiblePagesForGroup(group)
      const isGroupCollapsed = collapsedGroups.has(group.id)

      // Add group header (collapsible)
      if (visiblePages.length > 0) {
        // Check if group is accessible
        let groupDisabled = false
        if (groupOrder === 'sequential') {
          const groupIndex = visibleGroups.findIndex(
            (g: SurveyGroup) => g.id === group.id
          )
          if (groupIndex > 0) {
            // Check if all previous groups are complete
            for (let i = 0; i < groupIndex; i++) {
              const prevGroup = visibleGroups[i]
              const prevPages = getVisiblePagesForGroup(prevGroup)
              for (const page of prevPages) {
                if (!isPageComplete(page.id, normalisedConfig, surveyAnswers)) {
                  groupDisabled = true
                  break
                }
              }
              if (groupDisabled) break
            }
          }
        }

        // Calculate group completion status
        let groupCompletionStatus: PageCompletionStatus = 'empty'
        let allComplete = true
        visiblePages.forEach((page: SurveyPage) => {
          const status = getPageCompletionStatus(
            page.id,
            normalisedConfig,
            surveyAnswers
          )
          if (status !== 'complete') allComplete = false
          if (status === 'partial' || status === 'complete') {
            groupCompletionStatus = 'partial'
          }
        })
        if (allComplete && visiblePages.length > 0) {
          groupCompletionStatus = 'complete'
        }

        items.push({
          id: `group-${group.id}`,
          label: group.title,
          icon: group.icon,
          active: false,
          completionStatus: groupCompletionStatus,
          disabled: groupDisabled,
          tooltip: group.description,
          level: 0,
          type: 'group',
          groupId: group.id,
          stageId: currentStageForSidebar.id,
        })

        // Add pages within group (with indentation if not collapsed)
        if (!isGroupCollapsed) {
          visiblePages.forEach((page: SurveyPage, pageIndex: number) => {
            // Check if page is accessible
            let pageDisabled = false
            if (pageOrder === 'sequential') {
              // Check if all previous pages in group are complete
              for (let i = 0; i < pageIndex; i++) {
                const prevPage = visiblePages[i]
                if (
                  !isPageComplete(prevPage.id, normalisedConfig, surveyAnswers)
                ) {
                  pageDisabled = true
                  break
                }
              }
            }

            // Check if page is beyond latest accessible
            const pageIndexInAll = allPages.findIndex((p) => p.id === page.id)
            if (pageIndexInAll > latestAccessiblePageIndex) {
              pageDisabled = true
            }

            const completionStatus = getPageCompletionStatus(
              page.id,
              normalisedConfig,
              surveyAnswers
            )

            items.push({
              id: page.id,
              label: page.title || `Page ${pageIndex + 1}`,
              icon: page.icon,
              active: activePageId === page.id,
              completionStatus,
              disabled: pageDisabled || groupDisabled,
              tooltip: pageDisabled
                ? 'Please complete all required questions on previous pages before accessing this page'
                : page.description,
              level: 1, // Indented under group
              type: 'page',
              groupId: group.id,
              stageId: currentStageForSidebar.id,
            })
          })
        }
      }
    })

    return items
  }, [
    visibleStages,
    activeStageId,
    getVisibleGroupsForStage,
    getVisiblePagesForGroup,
    collapsedGroups,
    normalisedConfig,
    surveyAnswers,
    activePageId,
    latestAccessiblePageIndex,
    allPages,
  ])

  const stageTabsWithActive = useMemo(() => {
    return stageTabs.map((tab) => ({
      ...tab,
      active: tab.id === activeStageId,
    }))
  }, [stageTabs, activeStageId])

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])

  const handleSidebarItemClick = (
    itemId: string,
    itemType: 'page' | 'group',
    disabled?: boolean
  ) => {
    // Prevent navigation if disabled
    if (disabled) return

    if (itemType === 'group') {
      // Toggle group collapse
      const groupId = itemId.replace('group-', '')
      toggleGroupCollapse(groupId)
      return
    }

    // Handle page navigation
    const pageId = itemId

    // Check if page is accessible
    const pageIndex = allPages.findIndex((p) => p.id === pageId)
    if (pageIndex > latestAccessiblePageIndex) {
      // Redirect to latest accessible page
      const latestPage = allPages[latestAccessiblePageIndex]
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

  const handleStageChange = (stageId: string) => {
    // Find first page in the stage
    const stage = normalisedConfig.stages?.find((s) => s.id === stageId)
    if (!stage) return

    const visibleGroups = getVisibleGroupsForStage(stage)
    if (visibleGroups.length === 0) return

    const firstGroup = visibleGroups[0]
    const visiblePages = getVisiblePagesForGroup(firstGroup)
    if (visiblePages.length === 0) return

    const firstPage = visiblePages[0]
    handleSidebarItemClick(firstPage.id, 'page', false)
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
              {layoutConfig.main?.sidebar?.enabled && Sidebar && Button && (
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
              {layoutConfig.header.actions &&
                layoutConfig.header.actions.length > 0 &&
                Button &&
                layoutConfig.header.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="bg-white border-white text-night-blue hover:bg-gray-100 hidden lg:inline-flex"
                    onClick={() => onAction?.(action.onClick)}
                  >
                    {action.label}
                  </Button>
                ))}
            </div>
          }
        />
      )}

      {/* Stage Tabs Subheader */}
      {layoutConfig.main?.sidebar?.enabled &&
        StageTabs &&
        normalisedConfig.stages &&
        normalisedConfig.stages.length > 0 &&
        stageTabsWithActive.length > 0 && (
          <div>
            <StageTabs
              stages={stageTabsWithActive.map((tab) => ({
                ...tab,
                onClick: () => handleStageChange(tab.id),
              }))}
              onStageChange={handleStageChange}
              size="md"
              variant="default"
            />
            {/* Overall Progress Bar below Stage Tabs */}
            {progressConfig.showOverall &&
              ProgressBar &&
              overallProgress !== undefined && (
                <div className="px-4 py-2 bg-white border-b">
                  <ProgressBar
                    value={overallProgress}
                    showLabel
                    label="Overall Progress"
                  />
                </div>
              )}
          </div>
        )}

      {/* Main Content */}
      {layoutConfig.main?.enabled && (
        <MainContentComponent>
          {layoutConfig.main.sidebar?.enabled && Sidebar ? (
            <div className="flex gap-8 relative flex-1">
              {/* Sidebar - responsive via CSS classes */}
              <Sidebar
                mobile={true}
                mobileOpen={sidebarOpen}
                collapsed={!isMobile && sidebarCollapsed}
                size={layoutConfig.main?.sidebar?.size || 'md'}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  // Only close if clicking directly on the sidebar backdrop, not on content
                  if (e.target === e.currentTarget) {
                    setSidebarOpen(false)
                  }
                }}
                header={
                  Button && (
                    <div className="flex items-center justify-between">
                      {(!sidebarCollapsed || isMobile) && (
                        <span className="font-semibold text-sm">
                          Navigation
                        </span>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        {/* Close button for mobile */}
                        {isMobile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close sidebar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </Button>
                        )}
                        {/* Collapse toggle for desktop */}
                        {!isMobile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex"
                            onClick={() =>
                              setSidebarCollapsed(!sidebarCollapsed)
                            }
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
                        )}
                      </div>
                    </div>
                  )
                }
                footer={
                  layoutConfig.header?.actions &&
                  layoutConfig.header.actions.length > 0 &&
                  Button ? (
                    <div className="space-y-2 lg:hidden">
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
                  // Get icon from lucide-react
                  const IconComponent = item.icon
                    ? (LucideIcons[item.icon as keyof typeof LucideIcons] as
                        | React.ComponentType<{ className?: string }>
                        | undefined)
                    : null

                  const isGroup = item.type === 'group'
                  const isCollapsed =
                    isGroup && collapsedGroups.has(item.groupId || '')

                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        // Stop propagation to prevent sidebar from closing when clicking inside
                        e.stopPropagation()
                        if (!item.disabled) {
                          handleSidebarItemClick(
                            item.id,
                            item.type,
                            item.disabled
                          )
                          // Close sidebar on mobile when clicking a page
                          if (item.type === 'page' && isMobile) {
                            setSidebarOpen(false)
                          }
                        }
                      }}
                      className={cn(
                        'flex items-center gap-2 rounded transition-colors',
                        sidebarCollapsed ? 'justify-center p-2' : 'p-2',
                        item.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer',
                        item.active && !item.disabled
                          ? 'border-ocean-blue border-1 bg-ocean-blue/10'
                          : !item.disabled && 'hover:bg-muted',
                        // Indentation for pages under groups
                        item.level === 1 && !sidebarCollapsed && 'ml-8'
                      )}
                      title={
                        sidebarCollapsed
                          ? item.label
                          : item.tooltip || item.label
                      }
                    >
                      {/* Collapse/expand icon for groups */}
                      {isGroup && !sidebarCollapsed && (
                        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                          {isCollapsed ? (
                            <ChevronRight className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      )}
                      {/* {!isGroup && item.level === 1 && !sidebarCollapsed && (
                        <div className="w-4 h-4 flex-shrink-0" />
                      )} */}
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
