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
  const { Header, Button, Heading, Sidebar, LayoutWrapper } = components

  const WrapperComponent =
    LayoutWrapper ||
    (({ children }: { children?: React.ReactNode }) => <div>{children}</div>)

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
                    <div className="w-8 h-8 bg-green-500 rounded" />
                    <span className="text-black text-sm">
                      {layoutConfig.header.organization}
                    </span>
                  </div>
                )}
                {layoutConfig.header.title && Heading && (
                  <Heading level="h1" className="text-black text-3xl font-bold">
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
                    className="bg-white border-white text-primary hover:bg-gray-100"
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
        <div className="bg-white px-8 py-8 max-w-4xl mx-auto box-border">
          {layoutConfig.main.sidebar?.enabled && Sidebar ? (
            <div className="flex gap-8 mt-8">
              <Sidebar />
              <div className="flex-1">{children}</div>
            </div>
          ) : (
            children
          )}
        </div>
      )}

      {/* Footer */}
      {layoutConfig.footer?.enabled && (
        <div className="border-t border-gray-200">
          <div className="flex items-center justify-between w-full h-20 px-8 bg-primary text-primary-foreground">
            {layoutConfig.footer.organization && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded" />
                <span className="text-sm text-foreground">
                  {layoutConfig.footer.organization}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </WrapperComponent>
  )
}
