# Rendering Modes

Survey-Kit offers two distinct rendering modes to suit different use cases.

## Form-Based Rendering

Traditional survey layout with header, sidebar, and structured pages.

**Best for:**

- Complex, multi-stage surveys
- Desktop-first experiences
- Surveys needing sidebar navigation
- Professional/corporate contexts

### Usage

```tsx
import { SurveyRenderer, LayoutRenderer } from '@survey-kit/core'
import {
  Button,
  Card,
  Input,
  Header,
  Sidebar,
  Footer,
  ProgressBar,
  Wrapper,
  LayoutWrapper,
  MainContent,
} from '@survey-kit/registry'

const components = {
  Button,
  Card,
  Input,
  Header,
  Sidebar,
  Footer,
  ProgressBar,
  Wrapper,
  LayoutWrapper,
  MainContent,
}

function FormSurvey() {
  return (
    <LayoutRenderer
      layoutConfig={layoutConfig}
      surveyConfig={surveyConfig}
      components={components}
      onAction={handleAction}
    >
      <SurveyRenderer
        config={surveyConfig}
        components={components}
        onSubmit={handleSubmit}
      />
    </LayoutRenderer>
  )
}
```

### Features

- Stage tabs for navigation
- Sidebar with group menu
- Progress bar
- Header with branding
- Footer with links

---

## Chat-Based Rendering

Conversational interface styled like a messaging app.

**Best for:**

- Mobile-first experiences
- Simple, linear surveys
- Engaging, casual contexts
- Quick feedback collection

### Usage

```tsx
import { ChatSurveyRenderer } from '@survey-kit/core'
import {
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
} from '@survey-kit/registry'

const chatComponents = {
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
}

function ChatSurvey() {
  return (
    <ChatSurveyRenderer
      config={surveyConfig}
      components={chatComponents}
      onSubmit={handleSubmit}
      typingDelay={{ min: 500, max: 1000 }}
    />
  )
}
```

### Features

- Messages appear one at a time
- Typing indicator animation
- Answers shown as message bubbles
- Review screen before submission
- Edit capability for previous answers

---

## Comparison

| Feature    | Form-Based                          | Chat-Based             |
| ---------- | ----------------------------------- | ---------------------- |
| Layout     | Header + Sidebar + Content          | Full-screen chat       |
| Navigation | Stage tabs, sidebar menu            | Linear, scroll-based   |
| Progress   | Progress bar                        | Message history        |
| Best for   | Complex surveys                     | Mobile, simple surveys |
| Components | `SurveyRenderer` + `LayoutRenderer` | `ChatSurveyRenderer`   |

---

## Shared Behaviour

Both modes share:

- Same survey configuration format
- Same `useSurvey` hook for state
- Same validation logic
- Same conditional visibility
- Same localStorage persistence

This means you can use the **same config** with either renderer.

---

## Typing Delay

The chat renderer includes a typing delay to simulate human conversation:

```tsx
<ChatSurveyRenderer
  typingDelay={{ min: 500, max: 1000 }}
  // ...
/>
```

| Property | Type     | Default | Description        |
| -------- | -------- | ------- | ------------------ |
| `min`    | `number` | 500     | Minimum delay (ms) |
| `max`    | `number` | 1500    | Maximum delay (ms) |

Set both to `0` for instant question display.
