# Quick Start

Build your first survey in minutes.

## 1. Create a Survey Configuration

Create `survey.json`:

```json
{
  "id": "feedback-survey",
  "title": "Feedback Survey",
  "stages": [
    {
      "id": "main",
      "title": "Main",
      "groups": [
        {
          "id": "questions",
          "title": "Questions",
          "pages": [
            {
              "id": "page-1",
              "questions": [
                {
                  "id": "name",
                  "type": "text",
                  "label": "What is your name?",
                  "requiredToNavigate": true
                }
              ]
            },
            {
              "id": "page-2",
              "questions": [
                {
                  "id": "rating",
                  "type": "radio",
                  "label": "How would you rate our service?",
                  "options": [
                    { "value": "excellent", "label": "Excellent" },
                    { "value": "good", "label": "Good" },
                    { "value": "average", "label": "Average" },
                    { "value": "poor", "label": "Poor" }
                  ],
                  "requiredToNavigate": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 2. Render the Survey

### Form-Based Rendering

```tsx
import { SurveyRenderer, LayoutRenderer } from '@survey-kit/core'
import { Button, Input, Card, Header } from '@survey-kit/registry'
import surveyConfig from './survey.json'

const components = { Button, Input, Card, Header }

function MySurvey() {
  const handleSubmit = (answers) => {
    console.log('Submitted:', answers)
  }

  return (
    <SurveyRenderer
      config={surveyConfig}
      components={components}
      onSubmit={handleSubmit}
    />
  )
}
```

### Chat-Based Rendering

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
import surveyConfig from './survey.json'

const chatComponents = {
  ChatBubble,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  ChatContainer,
  ChatReviewScreen,
}

function MyChatSurvey() {
  const handleSubmit = (answers) => {
    console.log('Submitted:', answers)
  }

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

## 3. What Happens Automatically

Survey-Kit handles:

- **Navigation**: One question per page with back/next
- **Validation**: Required fields checked before proceeding
- **Progress**: Tracks completion percentage
- **Persistence**: Saves answers to localStorage
- **Accessibility**: WCAG 2.2 AA compliant

## Next Steps

- [Survey Configuration](../guides/configuration.md) – Learn the full
  configuration options
- [Rendering Modes](../guides/rendering-modes.md) – Compare form vs chat
  rendering
- [Core API](../api/core.md) – Full API reference
