import React, { useState, useEffect } from 'react'
import * as LucideIcons from 'lucide-react'
import { cn } from '../lib/utils'
import type { LayoutConfig } from '../types/layout'
import type { SurveyConfig } from '../types/survey'

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Get current page from props, URL, or default to first page
  const getCurrentPageId = () => {
    if (currentPageId) return currentPageId
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        return hash
      }
      const params = new URLSearchParams(window.location.search)
      return params.get('page') || ''
    }
    return surveyConfig?.pages?.[0]?.id || ''
  }

  const activePageId = getCurrentPageId()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Generate sidebar items from survey pages
  const sidebarItems =
    surveyConfig?.pages?.map((page, index) => ({
      id: page.id,
      label: page.title || `Page ${index + 1}`,
      icon: page.icon,
      active: activePageId === page.id,
    })) || []

  const handleSidebarItemClick = (pageId: string) => {
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

  return (
    <WrapperComponent>
      {/* Header */}
      {layoutConfig.header?.enabled && Header && (
        <Header
          variant="primary"
          size="lg"
          logo={
            layoutConfig.header.organization || layoutConfig.header.title ? (
              <div className="flex flex-col">
                {layoutConfig.header.organization && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-spring-green rounded" />
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
              {layoutConfig.header.actions &&
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
                        onClick={() => handleSidebarItemClick(item.id)}
                        className={cn(
                          'flex items-center gap-2 rounded cursor-pointer transition-colors',
                          sidebarCollapsed ? 'justify-center p-2' : 'p-2',
                          item.active
                            ? 'bg-ocean-blue text-white'
                            : 'hover:bg-muted'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        {IconComponent && (
                          <IconComponent className="w-4 h-4 flex-shrink-0" />
                        )}
                        {!sidebarCollapsed && (
                          <span className="text-sm">{item.label}</span>
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
                            handleSidebarItemClick(item.id)
                            setSidebarOpen(false)
                          }}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded cursor-pointer transition-colors',
                            item.active
                              ? 'bg-ocean-blue text-white'
                              : 'hover:bg-muted'
                          )}
                        >
                          {IconComponent && (
                            <IconComponent className="w-4 h-4" />
                          )}
                          <span className="text-sm">{item.label}</span>
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
        <FooterComponent>
          {layoutConfig.footer.organization && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-spring-green rounded" />
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
