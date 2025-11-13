# Voice Components

> Components for audio recording and playback

[← Back to Index](../README.md)

---

## Overview

Voice components are located in `/src/components/voice/` and provide audio recording, playback, and voice interaction features.

**Components:** 2

---

## AudioPlayer

**File:** `/src/components/voice/AudioPlayer.tsx`

Audio playback component with controls.

### Features
- Play/pause button
- Progress bar with seeking
- Time display (current/total)
- Volume control
- Playback speed control (0.5x - 2.0x)
- Loop toggle
- Download button
- Waveform visualization
- Keyboard shortcuts

### Usage

```tsx
import { AudioPlayer } from '@/components/voice/AudioPlayer'

// Basic usage
<AudioPlayer
  src="/audio/message.mp3"
/>

// Full featured
<AudioPlayer
  src="/audio/lesson.mp3"
  title="Lesson 1: Greetings"
  showWaveform={true}
  showSpeedControl={true}
  showDownload={true}
  autoPlay={false}
  onEnded={() => {
    console.log('Audio finished')
    playNextAudio()
  }}
  onTimeUpdate={(currentTime) => {
    updateProgress(currentTime)
  }}
/>

// Compact mode
<AudioPlayer
  src="/audio/quick.mp3"
  compact={true}
  showVolume={false}
/>
```

### Props

```typescript
interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string

  // Display options
  showWaveform?: boolean
  showSpeedControl?: boolean
  showVolume?: boolean
  showDownload?: boolean
  compact?: boolean

  // Playback options
  autoPlay?: boolean
  loop?: boolean
  initialVolume?: number // 0-1
  initialSpeed?: number // 0.5-2.0

  // Callbacks
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onVolumeChange?: (volume: number) => void
  onSpeedChange?: (speed: number) => void

  // Styling
  className?: string
  theme?: 'light' | 'dark'
}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause |
| `←` | Rewind 5 seconds |
| `→` | Forward 5 seconds |
| `↑` | Increase volume |
| `↓` | Decrease volume |
| `M` | Mute/Unmute |
| `L` | Toggle loop |

### Playback Speeds

- 0.5x - Half speed (for learning)
- 0.75x - Slow
- 1.0x - Normal (default)
- 1.25x - Slightly fast
- 1.5x - Fast
- 2.0x - Double speed

---

## VoiceRecorder

**File:** `/src/components/voice/VoiceRecorder.tsx`

Voice recording component with real-time visualization.

### Features
- Record/stop button
- Recording timer
- Real-time audio visualization
- Recording status indicator
- Audio preview after recording
- Re-record option
- Upload/send recorded audio
- Audio level meter
- Max duration limit
- File size display

### Usage

```tsx
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'

// Basic usage
<VoiceRecorder
  onRecordingComplete={(audioBlob) => {
    uploadAudio(audioBlob)
  }}
/>

// Full featured
<VoiceRecorder
  maxDuration={60} // 60 seconds
  showVisualization={true}
  showTimer={true}
  onRecordingStart={() => {
    console.log('Recording started')
  }}
  onRecordingComplete={(audioBlob, duration) => {
    console.log(`Recorded ${duration}s`)
    uploadAudio(audioBlob)
  }}
  onCancel={() => {
    console.log('Recording cancelled')
  }}
  onError={(error) => {
    console.error('Recording error:', error)
    showNotification({
      type: 'error',
      message: 'Failed to record audio',
    })
  }}
/>

// With custom UI
<VoiceRecorder
  renderButton={(isRecording, startRecording, stopRecording) => (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className="custom-button"
    >
      {isRecording ? 'Stop' : 'Record'}
    </button>
  )}
  onRecordingComplete={handleRecording}
/>
```

### Props

```typescript
interface VoiceRecorderProps {
  maxDuration?: number // seconds
  maxFileSize?: number // bytes

  // Display options
  showVisualization?: boolean
  showTimer?: boolean
  showFileSize?: boolean

  // Callbacks
  onRecordingStart?: () => void
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void
  onCancel?: () => void
  onError?: (error: Error) => void

  // Custom rendering
  renderButton?: (
    isRecording: boolean,
    startRecording: () => void,
    stopRecording: () => void
  ) => React.ReactNode

  // Styling
  className?: string
  visualizerColor?: string
}
```

### Recording States

1. **Idle** - Ready to record
2. **Requesting Permission** - Asking for microphone access
3. **Recording** - Active recording
4. **Processing** - Converting audio
5. **Preview** - Playback recorded audio
6. **Complete** - Audio ready to send

### Audio Formats

The recorder outputs audio in the following formats (browser-dependent):
- WebM (Chrome, Edge, Firefox)
- MP4/AAC (Safari)
- WAV (fallback)

---

## Integration Examples

### In Chat Input

```tsx
import { ChatInput } from '@/components/conversation/ChatInput'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'

const [showRecorder, setShowRecorder] = useState(false)

<div className="relative">
  <ChatInput
    value={message}
    onChange={setMessage}
    onSend={handleSend}
  />

  <button
    onClick={() => setShowRecorder(true)}
    className="absolute right-2 bottom-2"
  >
    <MicIcon />
  </button>

  {showRecorder && (
    <div className="absolute bottom-full mb-2 right-0">
      <VoiceRecorder
        onRecordingComplete={(blob) => {
          sendVoiceMessage(blob)
          setShowRecorder(false)
        }}
        onCancel={() => setShowRecorder(false)}
      />
    </div>
  )}
</div>
```

### In Message Bubble

```tsx
import { MessageBubble } from '@/components/conversation/MessageBubble'
import { AudioPlayer } from '@/components/voice/AudioPlayer'

<MessageBubble
  message={{
    ...message,
    content: message.type === 'voice' ? (
      <AudioPlayer
        src={message.audioUrl}
        compact={true}
      />
    ) : (
      message.content
    ),
  }}
  isUser={message.sender === 'user'}
/>
```

### Voice Conversation Mode

```tsx
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { AudioPlayer } from '@/components/voice/AudioPlayer'
import { SimpleAudioVisualizer } from '@/components/ui/simple-audio-visualizer'

function VoiceConversation() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-8">
      {/* User recording */}
      <VoiceRecorder
        showVisualization={true}
        onRecordingComplete={async (audioBlob) => {
          setIsProcessing(true)
          const response = await sendVoiceToAI(audioBlob)
          setAiResponse(response.audioUrl)
          setIsProcessing(false)
        }}
      />

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2">
          <SimpleAudioVisualizer isActive={true} />
          <span>AI is thinking...</span>
        </div>
      )}

      {/* AI response */}
      {aiResponse && (
        <AudioPlayer
          src={aiResponse}
          autoPlay={true}
          onEnded={() => {
            // Ready for next user input
            setAiResponse(null)
          }}
        />
      )}
    </div>
  )
}
```

---

## Browser Permissions

### Microphone Access

Both components require microphone permission:

```tsx
// Check permission status
const checkMicPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    console.error('Microphone permission denied')
    return false
  }
}

// Request permission before showing recorder
<Button onClick={async () => {
  const hasPermission = await checkMicPermission()
  if (hasPermission) {
    setShowRecorder(true)
  } else {
    showNotification({
      type: 'error',
      message: 'Microphone permission required'
    })
  }
}}>
  Record Voice
</Button>
```

---

## Audio Visualization

### Waveform Display

The AudioPlayer can show a visual waveform:

```tsx
<AudioPlayer
  src="/audio/lesson.mp3"
  showWaveform={true}
  waveformColor="#ff5e75"
  waveformHeight={60}
/>
```

### Real-time Recording Visualization

The VoiceRecorder shows live audio levels:

```tsx
<VoiceRecorder
  showVisualization={true}
  visualizerColor="#1dcddc"
  visualizerBars={32}
/>
```

---

## Error Handling

### Common Errors

```tsx
<VoiceRecorder
  onError={(error) => {
    if (error.name === 'NotAllowedError') {
      showNotification({
        type: 'error',
        message: 'Microphone permission denied',
      })
    } else if (error.name === 'NotFoundError') {
      showNotification({
        type: 'error',
        message: 'No microphone found',
      })
    } else {
      showNotification({
        type: 'error',
        message: 'Recording failed. Please try again.',
      })
    }
  }}
/>
```

---

## Performance Optimization

### Audio Blob Handling

```tsx
const handleRecording = async (audioBlob: Blob) => {
  // Compress if too large
  if (audioBlob.size > 5 * 1024 * 1024) { // 5MB
    const compressed = await compressAudio(audioBlob)
    uploadAudio(compressed)
  } else {
    uploadAudio(audioBlob)
  }
}
```

### Cleanup

```tsx
useEffect(() => {
  return () => {
    // Stop all audio tracks on unmount
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop())
    }
  }
}, [])
```

---

## Related Components

- [Audio Visualizer](../design-system.md#audio-visualizer) - Visual audio representation
- [Simple Audio Visualizer](../design-system.md#simple-audio-visualizer) - Lightweight visualizer
- [Conversation Components](./conversation.md) - Message display

### Related Hooks
- [useAudioRecording](../hooks.md#use-audio-recording)
- [useWebRTC](../hooks.md#use-webrtc)
- [useVoiceConversation](../hooks.md#usevoiceconversation)

---

[← Back to Index](../README.md)
