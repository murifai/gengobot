# Voice Processing Foundation - Phase 2.2

Comprehensive voice processing system for Gengobot Japanese learning application.

## 🎯 Overview

Complete voice interaction pipeline including:

- **Speech-to-Text**: OpenAI Whisper API + Web Speech API fallback
- **Text-to-Speech**: OpenAI TTS with Japanese-optimized voices
- **Audio Recording**: Browser-based recording with voice activity detection
- **Audio Playback**: Custom player with speed control for learning

## 📁 Architecture

```
src/lib/voice/
├── whisper-service.ts       # Speech-to-Text service
├── tts-service.ts            # Text-to-Speech service
├── web-speech-api.ts         # Browser API fallback
├── audio-processor.ts        # Recording & processing utilities
└── index.ts                  # Unified exports

src/components/voice/
├── VoiceRecorder.tsx         # Recording component
└── AudioPlayer.tsx           # Playback component

src/app/api/voice/
├── transcribe/route.ts       # Whisper API endpoint
└── synthesize/route.ts       # TTS API endpoint

__tests__/voice/
├── whisper-service.test.ts   # Whisper service tests
├── tts-service.test.ts       # TTS service tests
├── components.test.tsx       # Component tests
└── api-routes.test.ts        # API route tests
```

## 🚀 Quick Start

### 1. Basic Speech-to-Text

```typescript
import { whisperService } from '@/lib/voice';

// Transcribe audio file
const result = await whisperService.transcribe(audioFile, {
  language: 'ja',
  responseFormat: 'verbose_json',
});

console.log(result.text); // Transcribed text
console.log(result.duration); // Audio duration
```

### 2. Japanese-Optimized Transcription

```typescript
// With context for better accuracy
const result = await whisperService.transcribeJapanese(audioFile, {
  taskScenario: 'Ordering food at a restaurant',
  expectedPhrases: ['いらっしゃいませ', 'ご注文は'],
  userLevel: 'N5',
});
```

### 3. Text-to-Speech

```typescript
import { ttsService } from '@/lib/voice';

// Standard synthesis
const result = await ttsService.synthesize('こんにちは', {
  voice: 'nova',
  speed: 1.0,
  format: 'mp3',
});

// For language learning (adjusts speed by level)
const learningAudio = await ttsService.synthesizeForLearning(
  'こんにちは',
  'N5' // Slower for beginners
);

// With character personality
const personalizedAudio = await ttsService.synthesizeWithPersonality('こんにちは', {
  gender: 'female',
  tone: 'friendly',
});
```

### 4. Voice Recorder Component

```tsx
import VoiceRecorder from '@/components/voice/VoiceRecorder';

<VoiceRecorder
  maxDuration={60000} // 60 seconds
  autoStopOnSilence={true}
  silenceDuration={2000}
  onRecordingComplete={(blob, duration) => {
    console.log('Recording complete:', duration);
  }}
  onVoiceDetected={isDetected => {
    console.log('Voice activity:', isDetected);
  }}
/>;
```

### 5. Audio Player Component

```tsx
import AudioPlayer from '@/components/voice/AudioPlayer';

<AudioPlayer
  src={audioBlob}
  autoPlay={false}
  playbackRate={0.85} // Slower for learning
  showControls={true}
  onEnded={() => console.log('Playback finished')}
/>;
```

## 🔌 API Endpoints

### POST /api/voice/transcribe

Transcribe audio to text using Whisper.

**Request:**

```typescript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('taskScenario', 'Restaurant ordering');
formData.append('expectedPhrases', JSON.stringify(['いらっしゃいませ']));

const response = await fetch('/api/voice/transcribe', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// { success: true, transcript: '...', duration: 2.5 }
```

### POST /api/voice/synthesize

Generate speech from text using TTS.

**Request:**

```typescript
const response = await fetch('/api/voice/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'こんにちは',
    mode: 'learning', // 'standard' | 'learning' | 'personality'
    userLevel: 'N5',
    voice: 'nova',
    speed: 0.85,
  }),
});

const audioBlob = await response.blob();
```

## 🎨 Features

### Whisper Service

- ✅ Japanese-optimized transcription
- ✅ Context-aware accuracy improvements
- ✅ File validation (25MB limit)
- ✅ Multiple response formats
- ✅ Cost estimation

### TTS Service

- ✅ 6 voice options (male/female/neutral)
- ✅ Speed adjustment (0.25-4.0x)
- ✅ Learning mode (auto-adjusts by JLPT level)
- ✅ Personality-based voice selection
- ✅ Multiple audio formats (mp3, opus, aac, flac)
- ✅ Batch synthesis support

### Audio Recording

- ✅ Voice activity detection
- ✅ Auto-stop on silence
- ✅ Real-time volume visualization
- ✅ Pause/resume functionality
- ✅ Max duration limits
- ✅ Browser permission handling

### Audio Playback

- ✅ Custom speed control (0.5-2.0x)
- ✅ Volume control
- ✅ Progress bar with seeking
- ✅ Time display
- ✅ Auto-play support
- ✅ Loop functionality

### Web Speech API Fallback

- ✅ Browser-native speech recognition
- ✅ Browser-native speech synthesis
- ✅ Japanese language support
- ✅ No API costs for fallback

## 🧪 Testing

```bash
# Run all voice tests
npm test -- __tests__/voice

# Run specific test suite
npm test -- whisper-service.test.ts
npm test -- tts-service.test.ts
npm test -- components.test.tsx
npm test -- api-routes.test.ts
```

## 📊 Browser Compatibility

| Feature                | Chrome | Firefox | Safari | Edge |
| ---------------------- | ------ | ------- | ------ | ---- |
| MediaRecorder          | ✅     | ✅      | ✅     | ✅   |
| AudioContext           | ✅     | ✅      | ✅     | ✅   |
| Web Speech Recognition | ✅     | ❌      | ❌     | ✅   |
| Web Speech Synthesis   | ✅     | ✅      | ✅     | ✅   |

## 💰 Cost Considerations

### OpenAI Whisper

- **Pricing**: $0.006 per minute
- **Example**: 10 min/day × 30 days = $1.80/month

### OpenAI TTS

- **Pricing**: $15.00 per 1M characters
- **Example**: 1000 chars/day × 30 days = $0.45/month

### Fallback Strategy

Use Web Speech API for non-critical interactions to reduce costs.

## 🔐 Security

- ✅ File type validation
- ✅ File size limits (25MB)
- ✅ Text length limits (4096 chars)
- ✅ Input sanitization
- ✅ Error handling
- ✅ Permission management

## 🎯 Learning Optimizations

### Speed Adjustments by JLPT Level

- **N5**: 0.85x (slower for beginners)
- **N4**: 0.90x
- **N3**: 0.95x
- **N2**: 1.00x (normal speed)
- **N1**: 1.05x (slightly faster)

### Voice Recommendations

- **Nova**: Clear female voice (recommended for learning)
- **Echo**: Warm male voice
- **Shimmer**: Soft female voice
- **Onyx**: Deep male voice

### Context-Aware Transcription

Provides scenario and expected phrases to improve accuracy for learning contexts.

## 📚 Next Steps

Phase 2.2 is complete! Ready for:

- **Phase 2.3**: Real-time conversation implementation
- **Phase 3.1**: Task-based learning UI
- **Phase 3.2**: Voice-enabled conversation interface

## 🤝 Integration with Existing Systems

### AI Services

```typescript
import { conversationManager } from '@/lib/ai';
import { whisperService, ttsService } from '@/lib/voice';

// Voice conversation flow
const audioBlob = await recordUserVoice();
const transcript = await whisperService.transcribeJapanese(audioBlob);
const response = await conversationManager.processMessage(transcript);
const speech = await ttsService.synthesizeForLearning(response, userLevel);
```

### Database Integration

```typescript
// Store voice interactions in TaskAttempt
await prisma.taskAttempt.update({
  where: { id: attemptId },
  data: {
    conversationHistory: {
      push: {
        role: 'user',
        content: transcript,
        voiceMetadata: { duration, confidence },
      },
    },
  },
});
```

## 📖 Documentation

- [Development Plan](../../../../docs/Gengobot-app-dev-plan.md)
- [Architecture Overview](../../../../docs/ARCHITECTURE.md)
- [API Documentation](../../../../docs/API.md)
