/**
 * Layout configuration types
 * Simple declarative config - styling handled by registry components
 */

export interface HeaderConfig {
  enabled: boolean
  organization?: string
  title?: string
  actions?: Array<{
    label: string
    onClick: string
  }>
}

export interface MainContentConfig {
  enabled: boolean
  sidebar?: {
    enabled: boolean
  }
}

export interface FooterConfig {
  enabled: boolean
  organization?: string
}

export interface LayoutConfig {
  header?: HeaderConfig
  main?: MainContentConfig
  footer?: FooterConfig
}
