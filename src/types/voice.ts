// Type definitions for voice processing

export interface VoiceConfig {
  // Whisper configuration
  whisper: {
    language: string;
    responseFormat: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    temperature: number;
  };

  // TTS configuration
  tts: {
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed: number;
    format: 'mp3' | 'opus' | 'aac' | 'flac';
  };

  // Recording configuration
  recording: {
    maxDuration: number;
    sampleRate: number;
    channelCount: number;
    autoStopOnSilence: boolean;
    silenceDuration: number;
    silenceThreshold: number;
  };
}

export interface VoiceProcessingState {
  isRecording: boolean;
  isPlaying: boolean;
  isProcessing: boolean;
  error: string | null;
  currentAudio: Blob | null;
  transcript: string | null;
}

export interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  audio?: Blob;
  timestamp: Date;
  duration?: number;
  voiceMetadata?: {
    voice?: string;
    speed?: number;
    confidence?: number;
    language?: string;
  };
}

export interface VoiceInteractionMetrics {
  recordingDuration: number;
  transcriptionTime: number;
  responseGenerationTime: number;
  ttsGenerationTime: number;
  totalInteractionTime: number;
  audioQuality: number; // 0-1
  transcriptionConfidence: number; // 0-1
}

export interface VoiceFeatureSupport {
  mediaRecorder: boolean;
  audioContext: boolean;
  getUserMedia: boolean;
  webSpeechRecognition: boolean;
  webSpeechSynthesis: boolean;
  openAIWhisper: boolean;
  openAITTS: boolean;
}
