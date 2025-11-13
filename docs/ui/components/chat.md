# Chat Components

> Core chat interface components with streaming support

[← Back to Index](../README.md)

---

## Overview

Chat components are located in `/src/components/chat/` and provide the core chat interfaces with real-time streaming capabilities.

**Components:** 2

---

## StreamingChatInterface

**File:** `/src/components/chat/StreamingChatInterface.tsx`

Real-time streaming chat interface with Server-Sent Events (SSE).

### Features
- Real-time message streaming
- Token-by-token display
- Typing indicators
- Message history
- Auto-scroll to latest message
- Connection status indicator
- Retry failed messages
- Stop generation button
- Message persistence

### Usage

```tsx
import { StreamingChatInterface } from '@/components/chat/StreamingChatInterface'

<StreamingChatInterface
  sessionId={sessionId}
  characterId={characterId}
  onMessageSent={(message) => {
    console.log('Message sent:', message)
  }}
  onStreamComplete={(fullMessage) => {
    console.log('Stream complete:', fullMessage)
  }}
/>

// With custom endpoint
<StreamingChatInterface
  sessionId={sessionId}
  endpoint="/api/chat/stream"
  headers={{
    'X-Custom-Header': 'value',
  }}
/>
```

### Props

```typescript
interface StreamingChatInterfaceProps {
  sessionId: string
  characterId?: string
  endpoint?: string
  headers?: Record<string, string>
  initialMessages?: Message[]
  onMessageSent?: (message: Message) => void
  onStreamStart?: () => void
  onStreamComplete?: (message: string) => void
  onError?: (error: Error) => void
  maxMessages?: number
  showTypingIndicator?: boolean
}
```

### Events

The component emits several events during streaming:

```typescript
// Stream lifecycle
onStreamStart()  // When stream begins
onStreamComplete(fullMessage)  // When stream finishes
onError(error)  // On stream error

// Message events
onMessageSent(message)  // When user sends message
```

---

## UnifiedChatInterface

**File:** `/src/components/chat/UnifiedChatInterface.tsx`

Unified chat interface combining multiple chat modes (task-based, free chat, voice).

### Features
- Multiple chat modes:
  - Task-based conversation
  - Free conversation
  - Voice conversation
- Mode switching
- Persistent chat history
- Context awareness
- File attachments
- Voice messages
- Translation toggle
- Vocabulary hints
- Grammar suggestions
- Export conversation

### Usage

```tsx
import { UnifiedChatInterface } from '@/components/chat/UnifiedChatInterface'

// Task mode
<UnifiedChatInterface
  mode="task"
  taskId={taskId}
  attemptId={attemptId}
  onTaskComplete={(result) => {
    console.log('Task completed:', result)
  }}
/>

// Free chat mode
<UnifiedChatInterface
  mode="free"
  characterId={characterId}
/>

// Voice mode
<UnifiedChatInterface
  mode="voice"
  characterId={characterId}
  enableVoiceInput={true}
  enableVoiceOutput={true}
/>

// With all features
<UnifiedChatInterface
  mode={selectedMode}
  taskId={taskId}
  characterId={characterId}
  enableAttachments={true}
  enableVoice={true}
  showTranslation={true}
  showVocabularyHints={true}
  onModeChange={(newMode) => setSelectedMode(newMode)}
/>
```

### Props

```typescript
interface UnifiedChatInterfaceProps {
  mode: 'task' | 'free' | 'voice'
  taskId?: string
  attemptId?: string
  characterId?: string

  // Feature toggles
  enableAttachments?: boolean
  enableVoice?: boolean
  enableVoiceInput?: boolean
  enableVoiceOutput?: boolean
  showTranslation?: boolean
  showVocabularyHints?: boolean
  showGrammarHelp?: boolean

  // Callbacks
  onModeChange?: (mode: 'task' | 'free' | 'voice') => void
  onTaskComplete?: (result: TaskResult) => void
  onExportConversation?: () => void

  // Styling
  className?: string
  compactMode?: boolean
}
```

### Mode Details

#### Task Mode
- Structured conversation with objectives
- Progress tracking
- Message limits
- Completion criteria
- Post-task review

#### Free Mode
- Unstructured conversation
- No limits or objectives
- Save conversation feature
- Character personality focus

#### Voice Mode
- Real-time voice conversation
- Push-to-talk or continuous
- Voice activity detection
- Audio visualization
- Speech-to-text display

---

## Integration with Other Components

### Used Components
- [MessageBubble](./conversation.md#messagebubble) - Message display
- [ChatInput](./conversation.md#chatinput) - Message input
- [VoiceRecorder](./voice.md#voicerecorder) - Voice input
- [AudioPlayer](./voice.md#audioplayer) - Audio playback
- [VocabularyHints](./task.md#vocabularyhints) - Vocabulary help

### Related Hooks
- [useStreamingChat](../hooks.md#usestreamingchat)
- [useChatPersistence](../hooks.md#usechatpersistence)
- [useVoiceConversation](../hooks.md#usevoiceconversation)

---

## Best Practices

### Performance
1. Use virtualization for long message histories
2. Implement message pagination
3. Debounce user input
4. Use React.memo for message bubbles

### Error Handling
```tsx
<StreamingChatInterface
  sessionId={sessionId}
  onError={(error) => {
    if (error.message.includes('rate limit')) {
      showNotification({
        type: 'warning',
        message: 'Slow down! Too many messages.',
      })
    } else {
      showNotification({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      })
    }
  }}
/>
```

### Accessibility
- Ensure keyboard navigation works
- Add ARIA labels for screen readers
- Announce new messages
- Support keyboard shortcuts

---

## Related Components

- [Conversation Components](./conversation.md) - Message UI
- [Character Components](./character.md) - Character system
- [Voice Components](./voice.md) - Audio features
- [Task Components](./task.md) - Task-based features

---

[← Back to Index](../README.md)
