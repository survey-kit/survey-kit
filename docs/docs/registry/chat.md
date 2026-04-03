# Chat Components

The chat components in `@survey-kit/registry` let you present a survey as a conversational interface.

## What you can do

- Render one question at a time in a messaging-style flow
- Show a typing indicator before the next question appears
- Display user answers on the right and allow tap-to-edit behaviour
- Show a review screen before final submission
- Open an information drawer from the header to explain the page context and editing behaviour
- Support `text`, `radio`, `checkbox` and `emoji-slider` question types

## What it looks like

The chat layout includes:

- A sticky header with survey title, information icon and progress bar
- A scrollable message area with question and answer bubbles
- A sticky footer input area for the current response
- A bottom drawer for contextual guidance

## Example

```tsx
import { ChatSurveyRenderer } from '@survey-kit/core'
import {
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
  EmojiSlider,
} from '@survey-kit/registry'

const chatComponents = {
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
  EmojiSlider,
}

export function ChatSurveyPage({ surveyConfig, handleSubmit }) {
  return (
    <ChatSurveyRenderer
      config={surveyConfig}
      components={chatComponents}
      onSubmit={handleSubmit}
      typingDelay={{ min: 600, max: 1200 }}
    />
  )
}
```

Run the template with `make dev` and open `/chat-survey` to view a working example; with `VITE_API_URL` set, the template wires `onSubmit` through the same submit helper as the form survey so responses reach your backend.

## Component overview

| Component          | Purpose                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `ChatContainer`    | Full-screen chat shell with header, progress, messages and footer |
| `ChatBubble`       | Individual question or answer bubble                              |
| `ChatMessage`      | Question plus optional answer display with edit support           |
| `ChatInput`        | Input controls for active question types                          |
| `TypingIndicator`  | Animated typing state between messages                            |
| `ChatReviewScreen` | Review-and-edit step before submission                            |

For complete props and API details, see [Registry API](../api/registry.md).
