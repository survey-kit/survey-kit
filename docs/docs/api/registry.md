# Registry API Reference

The `@survey-kit/registry` package provides pre-built, accessible UI components.

## Installation

```bash
npm install @survey-kit/registry
```

---

## Primitives

Basic building blocks for survey interfaces.

### Button

Versatile button with multiple variants.

```tsx
import { Button } from '@survey-kit/registry'
;<Button variant="primary" size="md" onClick={handleClick}>
  Continue
</Button>
```

| Prop       | Type                                               | Default     | Description    |
| ---------- | -------------------------------------------------- | ----------- | -------------- |
| `variant`  | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Style variant  |
| `size`     | `'sm' \| 'md' \| 'lg'`                             | `'md'`      | Size           |
| `disabled` | `boolean`                                          | `false`     | Disabled state |

### Input

Text input with validation support.

```tsx
import { Input } from '@survey-kit/registry'
;<Input
  type="text"
  value={value}
  onChange={setValue}
  placeholder="Enter your name"
  error={errorMessage}
/>
```

### Checkbox

Checkbox for single or multiple selections.

```tsx
import { Checkbox } from '@survey-kit/registry'
;<Checkbox
  checked={isChecked}
  onChange={setChecked}
  label="I agree to the terms"
/>
```

### Card

Container for grouping content.

```tsx
import { Card } from '@survey-kit/registry'
;<Card>
  <Card.Header>
    <Card.Title>Question Title</Card.Title>
  </Card.Header>
  <Card.Content>{/* Content here */}</Card.Content>
</Card>
```

### Heading

Semantic heading component.

```tsx
import { Heading } from '@survey-kit/registry'
;<Heading level={2}>Section Title</Heading>
```

---

## Layout

Components for structuring the survey interface.

### Header

Survey header with logo and actions.

```tsx
import { Header } from '@survey-kit/registry'
;<Header
  variant="primary"
  logoSmall="/logo-sm.svg"
  logoLarge="/logo-lg.svg"
  actions={<Button>Save</Button>}
/>
```

### Footer

Survey footer with links and branding.

```tsx
import { Footer } from '@survey-kit/registry'
;<Footer
  logoSmall="/logo-sm.svg"
  links={[{ label: 'Privacy', href: '/privacy' }]}
  description="© 2024 Survey-Kit"
  onAction={handleAction}
/>
```

### Sidebar

Side navigation panel.

```tsx
import { Sidebar } from '@survey-kit/registry'
;<Sidebar variant="default">{/* Sidebar content */}</Sidebar>
```

### SidebarMenu

Navigation menu for the sidebar.

```tsx
import { SidebarMenu } from '@survey-kit/registry'
;<SidebarMenu
  items={menuItems}
  currentPage={currentPage}
  onNavigate={handleNavigate}
/>
```

### Wrapper

Container wrapper component.

```tsx
import { Wrapper } from '@survey-kit/registry'
;<Wrapper>{children}</Wrapper>
```

### LayoutWrapper

Main layout container.

```tsx
import { LayoutWrapper } from '@survey-kit/registry'
;<LayoutWrapper>{/* Layout content */}</LayoutWrapper>
```

### MainContent

Main content area component.

```tsx
import { MainContent } from '@survey-kit/registry'
;<MainContent>{children}</MainContent>
```

### StageTabs

Tab navigation for survey stages.

```tsx
import { StageTabs } from '@survey-kit/registry'
;<StageTabs
  stages={stages}
  currentStageId={currentStage}
  onStageClick={handleStageClick}
/>
```

---

## Complex

Advanced components with specific functionality.

### ProgressBar

Visual progress indicator.

```tsx
import { ProgressBar } from '@survey-kit/registry'
;<ProgressBar progress={45} showPercentage />
```

### EmojiSlider

Visual rating scale using emojis.

```tsx
import { EmojiSlider } from '@survey-kit/registry'
;<EmojiSlider value={rating} onChange={setRating} min={1} max={5} />
```

### Panel

Expandable information panel.

```tsx
import { Panel } from '@survey-kit/registry'
;<Panel title="More Information" expanded={isOpen}>
  {/* Panel content */}
</Panel>
```

### BlockedPage

Displayed when navigation is blocked.

```tsx
import { BlockedPage } from '@survey-kit/registry'
;<BlockedPage
  message="Complete previous sections first"
  redirectUrl="/survey/page-1"
/>
```

### CookieConsent

GDPR-compliant cookie consent banner.

```tsx
import { CookieConsent, useCookieConsent } from '@survey-kit/registry'

const consent = useCookieConsent(categories)

<CookieConsent
  config={cookieConfig}
  onAcceptAll={consent.acceptAll}
  onRejectAll={consent.rejectAll}
  onSavePreferences={consent.saveGranular}
/>
```

---

## Chat

Components for chat-style survey rendering.

### ChatContainer

Main wrapper for chat interface.

```tsx
import { ChatContainer } from '@survey-kit/registry'
;<ChatContainer>{/* Chat messages */}</ChatContainer>
```

### ChatBubble

Individual message bubble.

```tsx
import { ChatBubble } from '@survey-kit/registry'

<ChatBubble variant="question">
  What is your name?
</ChatBubble>

<ChatBubble variant="answer">
  John
</ChatBubble>
```

| Prop      | Type                     | Description  |
| --------- | ------------------------ | ------------ |
| `variant` | `'question' \| 'answer'` | Bubble style |

### ChatMessage

Complete message with avatar/metadata.

```tsx
import { ChatMessage } from '@survey-kit/registry'
;<ChatMessage type="question" content="What is your name?" />
```

### ChatInput

Input field for chat responses.

```tsx
import { ChatInput } from '@survey-kit/registry'
;<ChatInput
  type="text"
  value={value}
  onChange={setValue}
  onSubmit={handleSubmit}
  placeholder="Type your answer..."
/>
```

Supports types: `'text'`, `'radio'`, `'checkbox'`

### TypingIndicator

Animated typing dots.

```tsx
import { TypingIndicator } from '@survey-kit/registry'
;<TypingIndicator />
```

### ChatReviewScreen

Summary screen before submission.

```tsx
import { ChatReviewScreen } from '@survey-kit/registry'
;<ChatReviewScreen
  questions={questions}
  answers={answers}
  onEdit={handleEdit}
  onSubmit={handleSubmit}
/>
```

---

## Sections

### SectionPage

Standalone page for intro/completion screens.

```tsx
import { SectionPage } from '@survey-kit/registry'
;<SectionPage
  config={sectionConfig}
  onNavigate={handleNavigate}
  onAction={handleAction}
/>
```

---

## Accessibility

All components follow WCAG 2.2 AA guidelines:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast mode support
