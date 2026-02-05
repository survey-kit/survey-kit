# @survey-kit/registry

Component registry for survey UI components built with Radix UI and Tailwind CSS.

## Overview

The registry package provides pre-built, accessible React components for building survey interfaces:

- **Primitives** – Button, Input, Heading, Card, Checkbox
- **Layout** – Header, Footer, Sidebar, Wrapper, Stage Tabs, Main Content
- **Complex** – Progress Bar, Score Card, Blocked Page, Emoji Slider, Panel
- **Chat** – ChatContainer, ChatBubble, ChatMessage, ChatInput, TypingIndicator, ChatReviewScreen
- **Sections** – SectionPage for intro/completion screens
- **Form controls** – Dropdown, Select components

All components are built on accessible primitives (Radix UI) and styled with Tailwind CSS.

## Features

- WCAG 2.2 AA accessible components
- Fully customisable with Tailwind CSS
- Built on Radix UI primitives
- TypeScript support
- Mobile-first, responsive design
- Consistent design system
- Configurable Section Layouts
- Emoji Slider component
- Chat/messaging-style survey components

## Installation

```bash
npm install @survey-kit/registry
```

## Usage

```tsx
import { Button, Input, Card, ProgressBar } from '@survey-kit/registry'

function MyComponent() {
  return (
    <Card>
      <Input type="text" placeholder="Enter your name" />
      <Button variant="default">Submit</Button>
    </Card>
  )
}
```

## Component Categories

### Primitives

- `Button` – Various button variants and sizes
- `Input` – Text, email, number, date inputs
- `Heading` – Heading components
- `Card` – Card container component
- `Checkbox` – Checkbox with singular/multiple variants

### Layout

- `Header` – Survey header with logo and actions
- `Footer` – Survey footer with logo
- `Sidebar` – Collapsible sidebar navigation
- `SidebarMenu` – Sidebar menu component
- `Wrapper` – Layout wrapper component
- `LayoutWrapper` – Layout wrapper with configuration
- `StageTabs` – Stage navigation tabs
- `MainContent` – Main content area component
- `SectionPage` – Flexible page component for sections (intro, sensitive info, etc.)

### Complex

- `ProgressBar` – Progress indicator component
- `ScoreCard` – Score display component
- `BlockedPage` – Page access restriction component
- `EmojiSlider` – Interactive slider with emoji feedback
- `SingleEmojiSlider` – Single emoji slider variant
- `ScaleEmojiSlider` – Scale-based emoji slider variant
- `Panel` – Panel container component
- `CookieConsent` – Cookie consent component

### Chat Components

Messaging-style survey interface components:

- `ChatContainer` – Main container for chat interface
- `ChatBubble` – Individual chat bubble component
- `ChatMessage` – Chat message with question rendering
- `ChatInput` – Input component for chat responses
- `TypingIndicator` – Animated typing indicator
- `ChatReviewScreen` – Review screen for chat surveys

```tsx
import {
  ChatContainer,
  ChatMessage,
  ChatInput,
  TypingIndicator,
} from '@survey-kit/registry'
```

### Form Controls

- `Dropdown` / `Select` – Dropdown select component (Radix UI based)
- `SimpleDropdown` – Simplified dropdown API for survey renderer
- `DropdownTrigger`, `DropdownContent`, `DropdownItem`, `DropdownValue` – Dropdown sub-components

### Sections

- `SectionPage` – Flexible page component for intro/completion screens with configurable layouts

## Customisation

Components can be customised using Tailwind CSS classes or by extending component variants. All components accept standard React props and className overrides.

## Requirements

- React 19+
- Tailwind CSS 4+

## Licence

MIT
