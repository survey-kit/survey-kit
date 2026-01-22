/**
 * Section types for non-survey pages
 * Flexible configuration for intro, login, sign-out, and custom pages
 */

/**
 * Button/link action in a section
 */
export interface SectionButton {
  label: string
  href?: string // External link (e.g., Cognito URL)
  to?: string // Internal route (React Router)
  onClick?: string // Handler name for custom logic
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  external?: boolean // Opens in new tab if true
}

/**
 * Input field in a section
 */
export interface SectionInput {
  id: string
  type: 'text' | 'email' | 'password'
  label?: string
  placeholder?: string
  required?: boolean
}

/**
 * Image configuration for a section
 */
export interface SectionImage {
  src: string
  alt?: string
  position?: 'top' | 'left' | 'right' | 'background'
}

/**
 * Layout configuration for a section
 * Controls whether header/footer are shown
 */
export interface SectionLayout {
  header?: boolean // Show header (default: false)
  footer?: boolean // Show footer (default: false)
}

/**
 * Section page configuration
 * A flexible, composable page that can display various elements
 */
export interface SectionConfig {
  id: string
  path: string // Route path, e.g., "/intro", "/login"
  title?: string
  subtitle?: string
  body?: string // Can include HTML/markdown
  image?: SectionImage
  buttons?: SectionButton[]
  inputs?: SectionInput[]
  layout?: SectionLayout // Header/footer configuration
  className?: string // Custom styling
}

/**
 * App-level sections configuration
 */
export interface SectionsConfig {
  sections: SectionConfig[]
  defaultPath?: string // Where to redirect on "/"
}
