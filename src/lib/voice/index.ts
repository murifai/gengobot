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

// Audio Processing
export { AudioRecorder } from './audio-processor';
export type { AudioConstraints, RecordingOptions, VoiceActivityOptions } from './audio-processor';

export {
  convertAudioFormat,
  blobToFile,
  getAudioDuration,
  checkAudioSupport,
} from './audio-processor';
