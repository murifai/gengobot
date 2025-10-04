// React hook for voice-enabled task conversations
// Phase 3.3: Voice Interaction System

'use client';

import { useEffect, useReducer, useCallback, useRef } from 'react';
import {
  VoiceConversationManager,
  createVoiceConversationManager,
  voiceConversationReducer,
  createInitialVoiceState,
} from '@/lib/voice/voice-conversation-manager';
import type { TaskVoiceConfig } from '@/lib/voice/task-voice-service';
import type { VoiceConversationState } from '@/lib/voice/voice-conversation-manager';

/**
 * Hook options
 */
export interface UseVoiceConversationOptions {
  attemptId: string;
  initialConfig?: Partial<TaskVoiceConfig>;
  onTranscription?: (transcript: string) => void;
  onResponse?: (response: string, audioUrl?: string) => void;
  onError?: (error: string) => void;
  autoPlay?: boolean;
}

/**
 * Hook return type
 */
export interface UseVoiceConversationReturn {
  state: VoiceConversationState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  processRecording: () => Promise<void>;
  updateConfig: (config: Partial<TaskVoiceConfig>) => void;
  clearError: () => void;
  reset: () => void;
  isReady: boolean;
}

/**
 * Hook for voice-enabled task conversations
 */
export function useVoiceConversation(
  options: UseVoiceConversationOptions
): UseVoiceConversationReturn {
  const {
    attemptId,
    initialConfig,
    onTranscription,
    onResponse,
    onError,
    autoPlay = true,
  } = options;

  // Voice conversation manager
  const managerRef = useRef<VoiceConversationManager | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  // State management with reducer
  const [state, dispatch] = useReducer(
    voiceConversationReducer,
    createInitialVoiceState(initialConfig)
  );

  // Initialize manager
  useEffect(() => {
    managerRef.current = createVoiceConversationManager(initialConfig);

    // Subscribe to manager state changes
    const unsubscribe = managerRef.current.subscribe(newState => {
      dispatch({ type: 'RESET' }); // Reset to sync with manager
      // Sync state from manager
      Object.entries(newState).forEach(([key, value]) => {
        if (key === 'config') {
          dispatch({ type: 'UPDATE_CONFIG', config: value as TaskVoiceConfig });
        }
      });
    });

    return () => {
      unsubscribe();
      managerRef.current?.destroy();
    };
  }, [initialConfig]);

  // Check if browser supports required APIs
  const isReady =
    typeof window !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices;

  // Start recording
  const startRecording = useCallback(async () => {
    if (!managerRef.current || !isReady) {
      const error = !isReady
        ? 'Browser does not support voice recording'
        : 'Voice manager not initialized';
      dispatch({ type: 'SET_ERROR', error });
      onError?.(error);
      return;
    }

    try {
      dispatch({ type: 'START_RECORDING' });
      await managerRef.current.startRecording();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      onError?.(errorMessage);
    }
  }, [isReady, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!managerRef.current) return;

    const blob = managerRef.current.stopRecording();
    if (blob) {
      recordedBlobRef.current = blob;
      dispatch({
        type: 'STOP_RECORDING',
        metadata: {
          audioDuration: blob.size,
          voiceActivityDetected: blob.size > 0,
        },
      });
    }
  }, []);

  // Process recording
  const processRecording = useCallback(async () => {
    if (!managerRef.current || !recordedBlobRef.current) {
      const error = 'No recording to process';
      dispatch({ type: 'SET_ERROR', error });
      onError?.(error);
      return;
    }

    try {
      dispatch({ type: 'START_PROCESSING' });

      const result = await managerRef.current.processVoiceInput(recordedBlobRef.current, attemptId);

      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      // Call callbacks
      if (result.transcript) {
        onTranscription?.(result.transcript);
      }

      if (result.response) {
        onResponse?.(result.response, result.audioUrl);
      }

      // Auto-play response if enabled
      if (autoPlay && result.audioUrl) {
        dispatch({ type: 'START_SPEAKING', audioUrl: result.audioUrl });
        await managerRef.current.playAudioResponse(result.audioUrl);
        dispatch({ type: 'STOP_SPEAKING' });
      }

      // Clear recorded blob
      recordedBlobRef.current = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process recording';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      onError?.(errorMessage);
    }
  }, [attemptId, onTranscription, onResponse, onError, autoPlay]);

  // Update configuration
  const updateConfig = useCallback((config: Partial<TaskVoiceConfig>) => {
    managerRef.current?.updateConfig(config);
    dispatch({ type: 'UPDATE_CONFIG', config });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    managerRef.current?.clearError();
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Reset state
  const reset = useCallback(() => {
    managerRef.current?.reset();
    recordedBlobRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    processRecording,
    updateConfig,
    clearError,
    reset,
    isReady,
  };
}
