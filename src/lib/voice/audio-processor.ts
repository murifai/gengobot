// Audio Processing Utilities
// Handles audio recording, format conversion, and voice activity detection

export interface AudioConstraints {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface RecordingOptions extends AudioConstraints {
  maxDuration?: number; // milliseconds
  silenceThreshold?: number; // 0-1
  silenceDuration?: number; // milliseconds before auto-stop
}

export interface VoiceActivityOptions {
  threshold?: number; // 0-1, volume threshold to detect voice
  smoothing?: number; // 0-1, smoothing factor for volume detection
  minDecibels?: number; // minimum decibel level
}

/**
 * Audio Recorder with Voice Activity Detection
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private maxDuration: number = 60000; // 60 seconds default
  private recordingTimer: NodeJS.Timeout | null = null;

  // Voice activity detection
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private isVoiceDetected: boolean = false;

  /**
   * Request microphone permission and initialize
   */
  async initialize(constraints: AudioConstraints = {}): Promise<void> {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'getUserMedia is not available. Please use HTTPS or check browser compatibility.'
        );
      }

      const defaultConstraints: MediaStreamConstraints = {
        audio: {
          sampleRate: constraints.sampleRate || 48000,
          channelCount: constraints.channelCount || 1,
          echoCancellation: constraints.echoCancellation ?? true,
          noiseSuppression: constraints.noiseSuppression ?? true,
          autoGainControl: constraints.autoGainControl ?? true,
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);

      // Initialize audio context for voice activity detection
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error);
      throw new Error('Microphone permission denied or unavailable');
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(
    options: RecordingOptions = {},
    callbacks: {
      onDataAvailable?: (blob: Blob) => void;
      onStop?: (blob: Blob, duration: number) => void;
      onError?: (error: Error) => void;
      onVoiceStart?: () => void;
      onVoiceEnd?: () => void;
    } = {}
  ): Promise<void> {
    if (!this.stream) {
      await this.initialize(options);
    }

    this.audioChunks = [];
    this.maxDuration = options.maxDuration || 60000;

    const mimeType = this.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(this.stream!, { mimeType });

    this.mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
        callbacks.onDataAvailable?.(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const duration = Date.now() - this.startTime;
      const blob = new Blob(this.audioChunks, { type: mimeType });
      callbacks.onStop?.(blob, duration);

      // Clear timers
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
      }
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
      }
    };

    this.mediaRecorder.onerror = (_event: Event) => {
      callbacks.onError?.(new Error('Recording error'));
    };

    // Start recording
    this.startTime = Date.now();
    this.mediaRecorder.start(100); // Collect data every 100ms

    // Auto-stop after max duration
    this.recordingTimer = setTimeout(() => {
      this.stopRecording();
    }, this.maxDuration);

    // Start voice activity detection if silence options provided
    if (options.silenceThreshold !== undefined) {
      this.startVoiceActivityDetection(
        {
          threshold: options.silenceThreshold,
          smoothing: 0.8,
        },
        {
          onVoiceStart: callbacks.onVoiceStart,
          onVoiceEnd: callbacks.onVoiceEnd,
          onSilenceDetected: () => {
            if (options.silenceDuration) {
              this.silenceTimer = setTimeout(() => {
                this.stopRecording();
              }, options.silenceDuration);
            }
          },
        }
      );
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Voice Activity Detection
   */
  private startVoiceActivityDetection(
    options: VoiceActivityOptions,
    callbacks: {
      onVoiceStart?: () => void;
      onVoiceEnd?: () => void;
      onSilenceDetected?: () => void;
    }
  ): void {
    if (!this.analyser) return;

    const { threshold = 0.1 } = options;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const detectVoice = () => {
      if (!this.analyser || this.mediaRecorder?.state !== 'recording') return;

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedVolume = average / 255;

      // Detect voice activity
      if (normalizedVolume > threshold) {
        if (!this.isVoiceDetected) {
          this.isVoiceDetected = true;
          callbacks.onVoiceStart?.();

          // Clear silence timer
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        }
      } else {
        if (this.isVoiceDetected) {
          this.isVoiceDetected = false;
          callbacks.onVoiceEnd?.();
          callbacks.onSilenceDetected?.();
        }
      }

      requestAnimationFrame(detectVoice);
    };

    detectVoice();
  }

  /**
   * Get current volume level (0-1)
   */
  getVolumeLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    return average / 255;
  }

  /**
   * Get supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopRecording();

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }
  }

  /**
   * Get recording state
   */
  getState(): 'inactive' | 'recording' | 'paused' {
    return this.mediaRecorder?.state || 'inactive';
  }

  /**
   * Get recording duration
   */
  getDuration(): number {
    if (this.mediaRecorder?.state === 'recording') {
      return Date.now() - this.startTime;
    }
    return 0;
  }
}

/**
 * Convert audio blob to different formats
 */
export async function convertAudioFormat(blob: Blob, _targetMimeType: string): Promise<Blob> {
  // For now, return as-is. Future: implement actual conversion
  // This would require a library like lamejs for mp3 conversion
  return blob;
}

/**
 * Convert blob to File
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Get audio duration from blob
 */
export async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(audio.src);
      resolve(audio.duration);
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(audio.src);
      reject(new Error('Failed to load audio'));
    });
  });
}

/**
 * Check browser audio support
 */
export function checkAudioSupport() {
  return {
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    audioContext: typeof AudioContext !== 'undefined',
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    webAudio: typeof AudioContext !== 'undefined',
  };
}
