// Voice conversation state management for task-based learning
// Phase 3.3: Voice Interaction System

import type { VoiceMessage, VoiceInteractionMetadata, TaskVoiceConfig } from './task-voice-service';

/**
 * Voice conversation state
 */
export interface VoiceConversationState {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  currentMessage: VoiceMessage | null;
  messages: VoiceMessage[];
  error: string | null;
  recordingMetadata: VoiceInteractionMetadata | null;
  config: TaskVoiceConfig;
}

/**
 * Voice conversation actions
 */
export type VoiceConversationAction =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; metadata: VoiceInteractionMetadata }
  | { type: 'START_PROCESSING' }
  | { type: 'PROCESSING_COMPLETE'; message: VoiceMessage }
  | { type: 'START_SPEAKING'; audioUrl: string }
  | { type: 'STOP_SPEAKING' }
  | { type: 'ADD_MESSAGE'; message: VoiceMessage }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_CONFIG'; config: Partial<TaskVoiceConfig> }
  | { type: 'RESET' };

/**
 * Voice conversation reducer
 */
export function voiceConversationReducer(
  state: VoiceConversationState,
  action: VoiceConversationAction
): VoiceConversationState {
  switch (action.type) {
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        error: null,
      };

    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
        recordingMetadata: action.metadata,
      };

    case 'START_PROCESSING':
      return {
        ...state,
        isProcessing: true,
        error: null,
      };

    case 'PROCESSING_COMPLETE':
      return {
        ...state,
        isProcessing: false,
        currentMessage: action.message,
      };

    case 'START_SPEAKING':
      return {
        ...state,
        isSpeaking: true,
      };

    case 'STOP_SPEAKING':
      return {
        ...state,
        isSpeaking: false,
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.message],
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isRecording: false,
        isProcessing: false,
        isSpeaking: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.config,
        },
      };

    case 'RESET':
      return {
        ...state,
        isRecording: false,
        isProcessing: false,
        isSpeaking: false,
        currentMessage: null,
        error: null,
        recordingMetadata: null,
      };

    default:
      return state;
  }
}

/**
 * Initial voice conversation state
 */
export function createInitialVoiceState(config?: Partial<TaskVoiceConfig>): VoiceConversationState {
  return {
    isRecording: false,
    isProcessing: false,
    isSpeaking: false,
    currentMessage: null,
    messages: [],
    error: null,
    recordingMetadata: null,
    config: {
      userLevel: 'N5',
      enableVoiceActivity: true,
      autoStopOnSilence: true,
      silenceDuration: 2000,
      maxRecordingDuration: 60000,
      voiceGuidance: true,
      audioFeedback: true,
      ...config,
    },
  };
}

/**
 * Voice conversation manager class
 */
export class VoiceConversationManager {
  private state: VoiceConversationState;
  private listeners: Set<(state: VoiceConversationState) => void>;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime: number = 0;

  constructor(initialConfig?: Partial<TaskVoiceConfig>) {
    this.state = createInitialVoiceState(initialConfig);
    this.listeners = new Set();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: VoiceConversationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current state
   */
  getState(): VoiceConversationState {
    return this.state;
  }

  /**
   * Dispatch action
   */
  private dispatch(action: VoiceConversationAction): void {
    this.state = voiceConversationReducer(this.state, action);
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Start voice recording
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const duration = Date.now() - this.recordingStartTime;
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        this.dispatch({
          type: 'STOP_RECORDING',
          metadata: {
            audioDuration: duration,
            voiceActivityDetected: audioBlob.size > 0,
          },
        });

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.dispatch({ type: 'START_RECORDING' });

      // Auto-stop if max duration reached
      if (this.state.config.maxRecordingDuration) {
        setTimeout(() => {
          if (this.state.isRecording) {
            this.stopRecording();
          }
        }, this.state.config.maxRecordingDuration);
      }
    } catch (error) {
      this.dispatch({
        type: 'SET_ERROR',
        error: error instanceof Error ? error.message : 'Failed to start recording',
      });
      throw error;
    }
  }

  /**
   * Stop voice recording
   */
  stopRecording(): Blob | null {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return null;
    }

    this.mediaRecorder.stop();
    return new Blob(this.audioChunks, { type: 'audio/webm' });
  }

  /**
   * Process voice input
   */
  async processVoiceInput(
    audioBlob: Blob,
    attemptId: string
  ): Promise<{
    success: boolean;
    transcript?: string;
    response?: string;
    audioUrl?: string;
    error?: string;
  }> {
    this.dispatch({ type: 'START_PROCESSING' });

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('config', JSON.stringify(this.state.config));

      const response = await fetch(`/api/task-attempts/${attemptId}/voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Voice processing failed');
      }

      const data = await response.json();

      // Add user message
      const userMessage: VoiceMessage = {
        role: 'user',
        content: data.transcription.text,
        timestamp: new Date().toISOString(),
        voiceMetadata: {
          audioDuration: data.transcription.duration,
          voiceActivityDetected: true,
          transcriptionConfidence: data.transcription.confidence,
        },
      };

      this.dispatch({ type: 'ADD_MESSAGE', message: userMessage });

      // Add assistant message
      const assistantMessage: VoiceMessage = {
        role: 'assistant',
        content: data.response.text,
        timestamp: new Date().toISOString(),
        audioUrl: data.response.audioUrl,
        voiceMetadata: {
          audioDuration: data.response.duration,
          voiceActivityDetected: true,
        },
        metadata: {
          objectiveCompleted: data.guidance.objectiveStatus?.completed
            ? data.guidance.objectiveStatus.current
            : undefined,
          hintProvided: data.guidance.shouldProvideHint,
        },
      };

      this.dispatch({ type: 'ADD_MESSAGE', message: assistantMessage });
      this.dispatch({ type: 'PROCESSING_COMPLETE', message: assistantMessage });

      return {
        success: true,
        transcript: data.transcription.text,
        response: data.response.text,
        audioUrl: data.response.audioUrl,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Voice processing failed';
      this.dispatch({ type: 'SET_ERROR', error: errorMessage });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Play audio response
   */
  async playAudioResponse(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);

      audio.onplay = () => {
        this.dispatch({ type: 'START_SPEAKING', audioUrl });
      };

      audio.onended = () => {
        this.dispatch({ type: 'STOP_SPEAKING' });
        resolve();
      };

      audio.onerror = error => {
        this.dispatch({ type: 'STOP_SPEAKING' });
        this.dispatch({ type: 'SET_ERROR', error: 'Audio playback failed' });
        reject(error);
      };

      // Apply speed adjustment
      if (this.state.config.voicePersonality?.speed) {
        audio.playbackRate = this.state.config.voicePersonality.speed;
      }

      audio.play().catch(reject);
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TaskVoiceConfig>): void {
    this.dispatch({ type: 'UPDATE_CONFIG', config });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.dispatch({ type: 'CLEAR_ERROR' });
  }

  /**
   * Reset state
   */
  reset(): void {
    this.dispatch({ type: 'RESET' });
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.listeners.clear();
  }
}

/**
 * Create voice conversation manager instance
 */
export function createVoiceConversationManager(
  config?: Partial<TaskVoiceConfig>
): VoiceConversationManager {
  return new VoiceConversationManager(config);
}
