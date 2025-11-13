# Custom Hooks

> Reusable React hooks for common functionality

[← Back to Index](./README.md)

---

## Overview

Custom hooks are located in `/src/hooks/` and provide reusable logic for various features throughout the application.

**Total:** 13 custom hooks

---

## Table of Contents

- [Audio & Media](#audio--media)
- [UI Utilities](#ui-utilities)
- [Chat & Conversation](#chat--conversation)
- [Task & Progress](#task--progress)

---

## Audio & Media

### use-audio-recording

**File:** `/src/hooks/use-audio-recording.ts`

Record audio from the user's microphone.

#### Features
- Start/stop recording
- Get audio blob
- Get audio URL for playback
- Recording time tracking
- Error handling

#### Usage

```tsx
import { useAudioRecording } from '@/hooks/use-audio-recording'

function VoiceInput() {
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    audioBlob,
    audioUrl,
    error,
  } = useAudioRecording()

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? `Stop (${recordingTime}s)` : 'Start Recording'}
      </button>

      {audioUrl && (
        <audio src={audioUrl} controls />
      )}

      {error && <p>Error: {error.message}</p>}
    </div>
  )
}
```

#### Return Values

```typescript
{
  isRecording: boolean
  recordingTime: number // seconds
  startRecording: () => Promise<void>
  stopRecording: () => void
  audioBlob: Blob | null
  audioUrl: string | null
  error: Error | null
}
```

---

### use-webrtc

**File:** `/src/hooks/use-webrtc.ts`

WebRTC functionality for real-time voice communication.

#### Features
- Peer connection management
- Local/remote stream handling
- Start/end call
- Mute/unmute
- Connection status

#### Usage

```tsx
import { useWebRTC } from '@/hooks/use-webrtc'

function VideoCall() {
  const {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    startCall,
    endCall,
    toggleMute,
  } = useWebRTC()

  return (
    <div>
      <video
        ref={(video) => {
          if (video && localStream) {
            video.srcObject = localStream
          }
        }}
        autoPlay
        muted
      />

      <video
        ref={(video) => {
          if (video && remoteStream) {
            video.srcObject = remoteStream
          }
        }}
        autoPlay
      />

      <button onClick={startCall}>Start Call</button>
      <button onClick={endCall}>End Call</button>
      <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
    </div>
  )
}
```

---

## UI Utilities

### use-autosize-textarea

**File:** `/src/hooks/use-autosize-textarea.ts`

Automatically resize textarea based on content.

#### Usage

```tsx
import { useAutosizeTextarea } from '@/hooks/use-autosize-textarea'

function ChatInput() {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useAutosizeTextarea(textareaRef, value)

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      rows={1}
    />
  )
}
```

#### Parameters

```typescript
useAutosizeTextarea(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  value: string,
  maxHeight?: number // optional max height in pixels
)
```

---

### use-mobile

**File:** `/src/hooks/use-mobile.ts`

Detect if the user is on a mobile device.

#### Usage

```tsx
import { useMobile } from '@/hooks/use-mobile'

function ResponsiveComponent() {
  const isMobile = useMobile()

  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  )
}
```

#### Return Value

```typescript
boolean // true if mobile, false otherwise
```

---

### useResponsive

**File:** `/src/hooks/useResponsive.ts`

Detect current breakpoint and screen size.

#### Usage

```tsx
import { useResponsive } from '@/hooks/useResponsive'

function ResponsiveComponent() {
  const { isMobile, isTablet, isDesktop, width } = useResponsive()

  return (
    <div>
      <p>Width: {width}px</p>
      <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
      <p>Tablet: {isTablet ? 'Yes' : 'No'}</p>
      <p>Desktop: {isDesktop ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

#### Return Values

```typescript
{
  isMobile: boolean // < 768px
  isTablet: boolean // 768px - 1024px
  isDesktop: boolean // > 1024px
  width: number
  height: number
}
```

---

### useKeyboardShortcuts

**File:** `/src/hooks/useKeyboardShortcuts.tsx`

Global keyboard shortcut handling.

#### Usage

```tsx
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function App() {
  useKeyboardShortcuts({
    'ctrl+k': (e) => {
      e.preventDefault()
      openCommandPalette()
    },
    'ctrl+/': () => {
      toggleHelp()
    },
    'esc': () => {
      closeModal()
    },
  })

  return <div>App content</div>
}
```

#### Parameters

```typescript
useKeyboardShortcuts(
  shortcuts: Record<string, (event: KeyboardEvent) => void>,
  dependencies?: any[] // optional dependency array
)
```

#### Shortcut Format
- Single key: `'a'`, `'Enter'`, `'Escape'`
- With modifier: `'ctrl+k'`, `'shift+a'`, `'alt+f'`
- Multiple modifiers: `'ctrl+shift+k'`
- Case insensitive

---

## Chat & Conversation

### useChatPersistence

**File:** `/src/hooks/useChatPersistence.ts`

Persist chat messages to localStorage or database.

#### Usage

```tsx
import { useChatPersistence } from '@/hooks/useChatPersistence'

function ChatInterface() {
  const {
    messages,
    addMessage,
    clearMessages,
    isLoading,
  } = useChatPersistence(sessionId)

  return (
    <div>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      <button onClick={() => addMessage({ content: 'Hello' })}>
        Send
      </button>

      <button onClick={clearMessages}>
        Clear History
      </button>
    </div>
  )
}
```

#### Return Values

```typescript
{
  messages: Message[]
  addMessage: (message: Partial<Message>) => Promise<void>
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  clearMessages: () => Promise<void>
  isLoading: boolean
  error: Error | null
}
```

---

### useStreamingChat

**File:** `/src/hooks/useStreamingChat.ts`

Handle streaming chat responses from AI.

#### Usage

```tsx
import { useStreamingChat } from '@/hooks/useStreamingChat'

function StreamingChatInterface() {
  const {
    messages,
    sendMessage,
    isStreaming,
    currentStream,
    stopStream,
  } = useStreamingChat({
    endpoint: '/api/chat/stream',
    onComplete: (fullMessage) => {
      console.log('Stream complete:', fullMessage)
    },
  })

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.content}
          {msg.isStreaming && '...'}
        </div>
      ))}

      {currentStream && (
        <div>
          {currentStream}
          <button onClick={stopStream}>Stop</button>
        </div>
      )}

      <button onClick={() => sendMessage('Hello')}>
        Send Message
      </button>
    </div>
  )
}
```

#### Options

```typescript
{
  endpoint: string
  headers?: Record<string, string>
  onStart?: () => void
  onToken?: (token: string) => void
  onComplete?: (fullMessage: string) => void
  onError?: (error: Error) => void
}
```

---

### useVoiceConversation

**File:** `/src/hooks/useVoiceConversation.ts`

Manage voice-based conversations with AI.

#### Usage

```tsx
import { useVoiceConversation } from '@/hooks/useVoiceConversation'

function VoiceChat() {
  const {
    isListening,
    isProcessing,
    transcript,
    startListening,
    stopListening,
    sendVoiceMessage,
  } = useVoiceConversation({
    onResponse: (audioUrl) => {
      playAudio(audioUrl)
    },
  })

  return (
    <div>
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
      >
        {isListening ? 'Stop' : 'Speak'}
      </button>

      {transcript && <p>You said: {transcript}</p>}

      {isProcessing && <LoadingState message="AI is thinking..." />}
    </div>
  )
}
```

#### Return Values

```typescript
{
  isListening: boolean
  isProcessing: boolean
  transcript: string
  startListening: () => Promise<void>
  stopListening: () => void
  sendVoiceMessage: (audioBlob: Blob) => Promise<void>
  error: Error | null
}
```

---

## Task & Progress

### useTaskProgress

**File:** `/src/hooks/useTaskProgress.ts`

Track task completion progress.

#### Usage

```tsx
import { useTaskProgress } from '@/hooks/useTaskProgress'

function TaskInterface() {
  const {
    progress,
    objectives,
    totalMessages,
    timeElapsed,
    updateProgress,
    completeObjective,
  } = useTaskProgress(taskId, attemptId)

  return (
    <div>
      <ProgressBar value={progress} />

      <div>
        {objectives.map((obj) => (
          <div key={obj.id}>
            <input
              type="checkbox"
              checked={obj.completed}
              onChange={() => completeObjective(obj.id)}
            />
            {obj.text}
          </div>
        ))}
      </div>

      <p>Messages: {totalMessages}</p>
      <p>Time: {Math.floor(timeElapsed / 60)}m</p>
    </div>
  )
}
```

#### Return Values

```typescript
{
  progress: number // 0-100
  objectives: Objective[]
  totalMessages: number
  timeElapsed: number // seconds
  updateProgress: (data: Partial<Progress>) => void
  completeObjective: (objectiveId: string) => void
  isComplete: boolean
}
```

---

### useTaskFeedbackProgress

**File:** `/src/hooks/useTaskFeedbackProgress.ts`

Track task feedback submission progress.

#### Usage

```tsx
import { useTaskFeedbackProgress } from '@/hooks/useTaskFeedbackProgress'

function PostTaskReview() {
  const {
    hasSubmittedFeedback,
    feedbackData,
    submitFeedback,
    isSubmitting,
  } = useTaskFeedbackProgress(attemptId)

  if (hasSubmittedFeedback) {
    return <div>Thanks for your feedback!</div>
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      submitFeedback({
        rating: 5,
        feedback: 'Great task!',
      })
    }}>
      {/* Feedback form */}
      <button type="submit" disabled={isSubmitting}>
        Submit Feedback
      </button>
    </form>
  )
}
```

---

## Hook Composition

Hooks can be composed together:

```tsx
function AdvancedChatInterface() {
  // Combine multiple hooks
  const isMobile = useMobile()
  const { messages, addMessage } = useChatPersistence(sessionId)
  const { isStreaming, sendMessage } = useStreamingChat()
  const textareaRef = useRef(null)

  useAutosizeTextarea(textareaRef, message)

  useKeyboardShortcuts({
    'ctrl+enter': () => {
      if (message.trim()) {
        sendMessage(message)
      }
    },
  })

  return (
    <div>
      {/* Chat UI */}
    </div>
  )
}
```

---

## Best Practices

### 1. Cleanup
```tsx
useEffect(() => {
  // Setup
  const subscription = subscribe()

  // Cleanup
  return () => {
    subscription.unsubscribe()
  }
}, [])
```

### 2. Dependencies
```tsx
// Specify all dependencies
useEffect(() => {
  fetchData(userId)
}, [userId]) // userId is a dependency
```

### 3. Memoization
```tsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

### 4. Callbacks
```tsx
const handleClick = useCallback(() => {
  doSomething(value)
}, [value])
```

---

## Related Documentation

- [Component Patterns](./patterns-and-practices.md) - Hook patterns
- [Chat Components](./components/chat.md) - Using chat hooks
- [Voice Components](./components/voice.md) - Using audio hooks

---

[← Back to Index](./README.md)
