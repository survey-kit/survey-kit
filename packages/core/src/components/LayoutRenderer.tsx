import React from 'react'
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
}

/**
 * Layout renderer component
 * Renders header, main content, and footer based on layout configuration
 * Styling is handled by registry components
 */
export function LayoutRenderer({
  layoutConfig,
  surveyConfig: _surveyConfig,
  components,
  children,
  onAction,
}: LayoutRendererProps): React.JSX.Element {
  const { Header, Button, Heading, Sidebar, LayoutWrapper, MainContent, Footer } = components

  const WrapperComponent =
    LayoutWrapper ||
    (({ children }: { children?: React.ReactNode }) => <div>{children}</div>)
  
  const MainContentComponent =
    MainContent ||
    (({ children }: { children?: React.ReactNode }) => <div>{children}</div>)
  
  const FooterComponent =
    Footer ||
    (({ children }: { children?: React.ReactNode }) => <footer>{children}</footer>)

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
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-spring-green rounded" />
                    <span className="text-white text-sm">
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
            layoutConfig.header.actions &&
            layoutConfig.header.actions.length > 0 &&
            Button ? (
              <div className="flex gap-2">
                {layoutConfig.header.actions.map((action, index) => (
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
            ) : undefined
          }
        />
      )}

      {/* Main Content */}
      {layoutConfig.main?.enabled && (
        <MainContentComponent>
          {layoutConfig.main.sidebar?.enabled && Sidebar ? (
            <div className="flex gap-8 mt-8">
              <Sidebar />
              <div className="flex-1">{children}</div>
            </div>
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
