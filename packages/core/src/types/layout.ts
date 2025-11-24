/**
 * Layout configuration types
 * Simple declarative config - styling handled by registry components
 */

export interface LogoConfig {
  small?: string // Path to small logo (relative to /public)
  large?: string // Path to large logo (relative to /public)
}

export interface HeaderConfig {
  enabled: boolean
  organization?: string
  title?: string
  logo?: LogoConfig
  actions?: Array<{
    label: string
    onClick: string
  }>
}

export interface MainContentConfig {
  enabled: boolean
  sidebar?: {
    enabled: boolean
    size?: 'sm' | 'md' | 'lg' // Sidebar width: sm (192px), md (256px), lg (320px)
  }
}

export interface FooterConfig {
  enabled: boolean
  organization?: string
  logo?: LogoConfig
}

export interface LayoutConfig {
  favicon?: string // Path to favicon (relative to /public)
  header?: HeaderConfig
  main?: MainContentConfig
  footer?: FooterConfig
}
