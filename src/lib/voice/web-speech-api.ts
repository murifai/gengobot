// Web Speech API Fallback for Browser Compatibility
// Provides browser-native speech recognition and synthesis as fallback

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface WebSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{ transcript: string; confidence: number }>;
}

export interface SpeechSynthesisOptions {
  lang?: string;
  voice?: SpeechSynthesisVoice | null;
  pitch?: number;
  rate?: number;
  volume?: number;
}

/**
 * Check if browser supports Web Speech API
 */
export function isWebSpeechSupported(): {
  recognition: boolean;
  synthesis: boolean;
} {
  return {
    recognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    synthesis: 'speechSynthesis' in window,
  };
}

/**
 * Web Speech Recognition Service (Browser-based STT)
 */
export class WebSpeechRecognition {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
      }
    }
  }

  /**
   * Start listening for speech
   */
  start(
    options: WebSpeechRecognitionOptions = {},
    callbacks: {
      onResult?: (result: RecognitionResult) => void;
      onError?: (error: Error) => void;
      onEnd?: () => void;
      onStart?: () => void;
    } = {}
  ): void {
    if (!this.recognition) {
      callbacks.onError?.(new Error('Web Speech Recognition not supported'));
      return;
    }

    // Configure recognition
    this.recognition.lang = options.language || 'ja-JP';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = options.maxAlternatives ?? 3;

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      // Get alternatives
      const alternatives = [];
      for (let i = 1; i < result.length; i++) {
        alternatives.push({
          transcript: result[i].transcript,
          confidence: result[i].confidence,
        });
      }

      callbacks.onResult?.({
        transcript,
        confidence,
        isFinal,
        alternatives,
      });
    };

    this.recognition.onerror = (event: any) => {
      callbacks.onError?.(new Error(event.error));
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    // Start recognition
    this.recognition.start();
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort recognition immediately
   */
  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

/**
 * Web Speech Synthesis Service (Browser-based TTS)
 */
export class WebSpeechSynthesis {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    // Voices might load asynchronously
    this.voices = this.synthesis.getVoices();

    if (this.voices.length === 0) {
      this.synthesis.onvoiceschanged = () => {
        this.voices = this.synthesis!.getVoices();
      };
    }
  }

  /**
   * Speak text using browser TTS
   */
  speak(
    text: string,
    options: SpeechSynthesisOptions = {},
    callbacks: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): void {
    if (!this.synthesis) {
      callbacks.onError?.(new Error('Web Speech Synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure utterance
    utterance.lang = options.lang || 'ja-JP';
    utterance.pitch = options.pitch ?? 1.0;
    utterance.rate = options.rate ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Select voice
    if (options.voice) {
      utterance.voice = options.voice;
    } else {
      // Try to find a Japanese voice
      const japaneseVoice = this.voices.find(voice => voice.lang.startsWith('ja'));
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }
    }

    // Set up event handlers
    utterance.onstart = () => callbacks.onStart?.();
    utterance.onend = () => callbacks.onEnd?.();
    utterance.onerror = event => {
      callbacks.onError?.(new Error(event.error));
    };

    // Speak
    this.synthesis.speak(utterance);
  }

  /**
   * Get available voices filtered by language
   */
  getVoices(language?: string): SpeechSynthesisVoice[] {
    if (!language) return this.voices;

    return this.voices.filter(voice => voice.lang.startsWith(language));
  }

  /**
   * Get Japanese voices specifically
   */
  getJapaneseVoices(): SpeechSynthesisVoice[] {
    return this.getVoices('ja');
  }

  /**
   * Cancel ongoing speech
   */
  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Pause speech
   */
  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.synthesis?.paused ?? false;
  }
}

// Export singleton instances
export const webSpeechRecognition = new WebSpeechRecognition();
export const webSpeechSynthesis = new WebSpeechSynthesis();
