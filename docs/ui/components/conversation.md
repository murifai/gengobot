# Conversation Components

> Components for displaying and managing chat messages

[← Back to Index](../README.md)

---

## Overview

Conversation components are located in `/src/components/conversation/` and handle the display and input of chat messages.

**Components:** 3

---

## ChatInput

**File:** `/src/components/conversation/ChatInput.tsx`

Chat message input field with advanced features.

### Features
- Auto-resizing textarea (grows with content)
- Send button
- File upload button
- Voice record button
- Keyboard shortcuts:
  - `Ctrl + Enter` or `Cmd + Enter` - Send message
  - `Shift + Enter` - New line
- Character count
- Disabled state during processing
- Emoji picker integration
- Placeholder text

### Usage

```tsx
import { ChatInput } from '@/components/conversation/ChatInput'

<ChatInput
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onSend={handleSend}
  placeholder="Type a message..."
  disabled={isLoading}
  maxLength={1000}
  showCharCount={true}
/>

// With file upload
<ChatInput
  value={message}
  onChange={setMessage}
  onSend={handleSend}
  onFileSelect={(file) => handleFileUpload(file)}
  enableFileUpload={true}
/>

// With voice recording
<ChatInput
  value={message}
  onChange={setMessage}
  onSend={handleSend}
  onVoiceRecord={(audioBlob) => handleVoiceMessage(audioBlob)}
  enableVoiceRecord={true}
/>
```

### Props

```typescript
interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  showCharCount?: boolean

  // Feature toggles
  enableFileUpload?: boolean
  enableVoiceRecord?: boolean
  enableEmoji?: boolean

  // Callbacks
  onFileSelect?: (file: File) => void
  onVoiceRecord?: (audioBlob: Blob) => void

  // Styling
  className?: string
  variant?: 'default' | 'compact'
}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` / `Cmd+Enter` | Send message |
| `Shift+Enter` | Insert new line |
| `Esc` | Clear input / Cancel |

---

## ConversationContainer

**File:** `/src/components/conversation/ConversationContainer.tsx`

Container component for displaying conversation messages.

### Features
- Message list display
- Auto-scroll to bottom on new messages
- Manual scroll lock (stays where user scrolled)
- Loading states
- Empty state display
- Infinite scroll (load more messages)
- Date separators
- Typing indicator
- Virtualization for long conversations

### Usage

```tsx
import { ConversationContainer } from '@/components/conversation/ConversationContainer'

<ConversationContainer
  messages={messages}
  isLoading={isLoading}
  emptyMessage="No messages yet. Start chatting!"
  showTypingIndicator={isTyping}
/>

// With infinite scroll
<ConversationContainer
  messages={messages}
  onLoadMore={loadMoreMessages}
  hasMore={hasMoreMessages}
  isLoadingMore={isLoadingMore}
/>

// With custom message renderer
<ConversationContainer
  messages={messages}
  renderMessage={(message) => (
    <CustomMessageBubble
      key={message.id}
      message={message}
    />
  )}
/>
```

### Props

```typescript
interface ConversationContainerProps {
  messages: Message[]
  isLoading?: boolean
  isLoadingMore?: boolean
  emptyMessage?: string
  showTypingIndicator?: boolean
  showDateSeparators?: boolean

  // Infinite scroll
  onLoadMore?: () => void
  hasMore?: boolean

  // Custom rendering
  renderMessage?: (message: Message) => React.ReactNode

  // Styling
  className?: string
  autoScroll?: boolean
}
```

---

## MessageBubble

**File:** `/src/components/conversation/MessageBubble.tsx`

Individual message bubble component.

### Features
- User vs AI message styling
- Timestamp display
- Message status indicators:
  - Sending
  - Sent
  - Error
- Message actions:
  - Copy text
  - Delete message
  - Translate
  - Show original
- Audio playback for voice messages
- File attachment display
- Markdown rendering
- Code syntax highlighting
- Japanese text features:
  - Furigana display
  - Word highlighting
  - JLPT level indicators
- Message reactions

### Usage

```tsx
import { MessageBubble } from '@/components/conversation/MessageBubble'

// User message
<MessageBubble
  message={{
    id: '1',
    content: 'Hello!',
    sender: 'user',
    timestamp: new Date(),
    status: 'sent',
  }}
  isUser={true}
/>

// AI message with translation
<MessageBubble
  message={{
    id: '2',
    content: 'こんにちは',
    translation: 'Hello',
    sender: 'ai',
    timestamp: new Date(),
    showFurigana: true,
  }}
  isUser={false}
  onTranslate={handleTranslate}
/>

// Voice message
<MessageBubble
  message={{
    id: '3',
    audioUrl: '/audio/message.mp3',
    content: 'Transcribed text',
    sender: 'user',
    timestamp: new Date(),
    type: 'voice',
  }}
  isUser={true}
/>

// With actions
<MessageBubble
  message={message}
  isUser={message.sender === 'user'}
  onCopy={() => copyToClipboard(message.content)}
  onDelete={() => deleteMessage(message.id)}
  onTranslate={() => translateMessage(message.id)}
  showActions={true}
/>
```

### Props

```typescript
interface MessageBubbleProps {
  message: Message
  isUser: boolean

  // Display options
  showTimestamp?: boolean
  showAvatar?: boolean
  showActions?: boolean
  showFurigana?: boolean
  showTranslation?: boolean

  // Callbacks
  onCopy?: () => void
  onDelete?: () => void
  onTranslate?: () => void
  onReact?: (reaction: string) => void

  // Styling
  className?: string
  compact?: boolean
}

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  type?: 'text' | 'voice' | 'file'

  // Optional fields
  translation?: string
  audioUrl?: string
  fileUrl?: string
  fileName?: string
  showFurigana?: boolean
  reactions?: Reaction[]
}
```

### Message Types

#### Text Message
Standard text message with optional markdown.

```tsx
<MessageBubble
  message={{
    type: 'text',
    content: '**Bold** and *italic* text',
    // ...
  }}
/>
```

#### Voice Message
Audio message with playback controls and transcription.

```tsx
<MessageBubble
  message={{
    type: 'voice',
    audioUrl: '/audio/message.mp3',
    content: 'Transcribed text',
    duration: 12.5,
    // ...
  }}
/>
```

#### File Message
File attachment display with download button.

```tsx
<MessageBubble
  message={{
    type: 'file',
    fileUrl: '/files/document.pdf',
    fileName: 'document.pdf',
    fileSize: 1024000,
    // ...
  }}
/>
```

---

## Message Actions

### Copy to Clipboard
```tsx
const handleCopy = async (text: string) => {
  await navigator.clipboard.writeText(text)
  showNotification({
    type: 'success',
    message: 'Copied to clipboard',
  })
}

<MessageBubble
  message={message}
  onCopy={() => handleCopy(message.content)}
/>
```

### Translation
```tsx
const handleTranslate = async (messageId: string) => {
  const translation = await translateMessage(messageId)
  updateMessage(messageId, { translation })
}

<MessageBubble
  message={message}
  onTranslate={() => handleTranslate(message.id)}
  showTranslation={true}
/>
```

### Delete Message
```tsx
const handleDelete = async (messageId: string) => {
  if (confirm('Delete this message?')) {
    await deleteMessage(messageId)
    removeMessageFromUI(messageId)
  }
}

<MessageBubble
  message={message}
  onDelete={() => handleDelete(message.id)}
/>
```

---

## Styling Patterns

### User vs AI Messages

```tsx
// User messages align right, AI messages align left
<div className={cn(
  'flex',
  isUser ? 'justify-end' : 'justify-start'
)}>
  <MessageBubble message={message} isUser={isUser} />
</div>
```

### Message Groups

```tsx
// Group consecutive messages from same sender
const messageGroups = groupConsecutiveMessages(messages)

{messageGroups.map((group) => (
  <div key={group.id} className="mb-4">
    {!group.isUser && <Avatar src={group.avatar} />}
    {group.messages.map((msg) => (
      <MessageBubble key={msg.id} message={msg} isUser={group.isUser} />
    ))}
  </div>
))}
```

---

## Related Components

- [Chat Components](./chat.md) - Chat interfaces
- [Voice Components](./voice.md) - Audio features
- [Vocabulary Components](./vocabulary.md) - Japanese text features

### Related Hooks
- [useChatPersistence](../hooks.md#usechatpersistence)
- [useAutosizeTextarea](../hooks.md#useautosizetextarea)

---

[← Back to Index](../README.md)
