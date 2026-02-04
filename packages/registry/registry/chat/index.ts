/**
 * Chat components for the survey-kit chat interface.
 *
 * These components provide a messaging-app-style survey experience
 * whilst maintaining ONS design system styling.
 *
 * @module @survey-kit/registry/chat
 */

export { ChatBubble, type ChatBubbleProps } from './ChatBubble'
export {
  ChatMessage,
  type ChatMessageProps,
  type ChatQuestion,
} from './ChatMessage'
export {
  ChatInput,
  type ChatInputProps,
  type ChatInputOption,
} from './ChatInput'
export { TypingIndicator, type TypingIndicatorProps } from './TypingIndicator'
export { ChatContainer, type ChatContainerProps } from './ChatContainer'
export {
  ChatReviewScreen,
  type ChatReviewScreenProps,
  type ReviewQuestion,
} from './ChatReviewScreen'
