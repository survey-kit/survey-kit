# @survey-kit/registry

Component registry for survey UI components built with Radix UI and Tailwind CSS.

## Overview

The registry package provides pre-built, accessible React components for building survey interfaces:

- **Primitives** – Button, Input, Heading, Card, Checkbox
- **Layout** – Header, Footer, Sidebar, Wrapper, Stage Tabs
- **Complex** – Progress Bar, Score Card, Blocked Page
- **Form controls** – Dropdown, Select components

All components are built on accessible primitives (Radix UI) and styled with Tailwind CSS.

## Features

- WCAG 2.2 AA accessible components
- Fully customisable with Tailwind CSS
- Built on Radix UI primitives
- TypeScript support
- Mobile-first, responsive design
- Consistent design system

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
- `Wrapper` – Layout wrapper component
- `StageTabs` – Stage navigation tabs
- `MainContent` – Main content area component

### Complex

- `ProgressBar` – Progress indicator component
- `ScoreCard` – Score display component
- `BlockedPage` – Page access restriction component

### Form Controls

- `Dropdown` / `Select` – Dropdown select component
- `SimpleDropdown` – Simplified dropdown API

## Customisation

Components can be customised using Tailwind CSS classes or by extending component variants. All components accept standard React props and className overrides.

## Requirements

- React 19+
- Tailwind CSS 4+

## Licence

MIT
