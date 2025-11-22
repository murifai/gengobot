// Voice Processing Library - Unified exports

// Services
export { WhisperService, whisperService } from './whisper-service';
export type {
  TranscriptionOptions,
  TranscriptionResult,
  TranscriptionSegment,
} from './whisper-service';

export { TTSService, ttsService } from './tts-service';
export type { TTSVoice, TTSFormat, TTSOptions, TTSResult } from './tts-service';

// Web Speech API
export {
  WebSpeechRecognition,
  WebSpeechSynthesis,
  webSpeechRecognition,
  webSpeechSynthesis,
  isWebSpeechSupported,
} from './web-speech-api';
export type {
  WebSpeechRecognitionOptions,
  RecognitionResult,
  SpeechSynthesisOptions,
} from './web-speech-api';

// Audio Processing
export { AudioRecorder } from './audio-processor';
export type { AudioConstraints, RecordingOptions, VoiceActivityOptions } from './audio-processor';

export {
  convertAudioFormat,
  blobToFile,
  getAudioDuration,
  checkAudioSupport,
} from './audio-processor';

// Duration Tracking (for credit calculation)
export { VoiceDurationTracker, createDurationTracker } from './duration-tracker';
