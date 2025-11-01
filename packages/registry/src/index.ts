// Export all components from the registry
export * from '../registry/primitives/button/button'
export * from '../registry/primitives/input/input'
export * from '../registry/primitives/heading/heading'
export * from '../registry/primitives/card/card'
export * from '../registry/layout/header/header'
export * from '../registry/layout/wrapper/wrapper'
export * from '../registry/layout/sidebar/sidebar'
export * from '../registry/layout/dropdown/dropdown'
export * from '../registry/layout/layout-wrapper/layout-wrapper'
export * from '../registry/layout/main-content/main-content'
export * from '../registry/layout/footer/footer'
export * from '../registry/complex/progress-bar/progress-bar'
export * from '../registry/complex/score-card/score-card'

// Create a Dropdown alias for convenience
export {
  Select as Dropdown,
  SelectTrigger as DropdownTrigger,
  SelectContent as DropdownContent,
  SelectItem as DropdownItem,
  SelectValue as DropdownValue,
} from '../registry/layout/dropdown/dropdown'

// Export utilities
export { cn } from '../lib/utils'
