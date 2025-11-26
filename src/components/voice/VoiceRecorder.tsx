'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioRecorder } from '@/lib/voice/audio-processor';

export interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onError?: (error: Error) => void;
  onVoiceDetected?: (isDetected: boolean) => void;
  maxDuration?: number; // milliseconds
  autoStopOnSilence?: boolean;
  silenceDuration?: number; // milliseconds
  silenceThreshold?: number; // 0-1
  disabled?: boolean;
  className?: string;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
  onVoiceDetected,
  maxDuration = 60000,
  autoStopOnSilence = false,
  silenceDuration = 2000,
  silenceThreshold = 0.1,
  disabled = false,
  className = '',
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSpacebarPressedRef = useRef<boolean>(false);

  // Initialize recorder
  useEffect(() => {
    recorderRef.current = new AudioRecorder();

    return () => {
      if (recorderRef.current) {
        recorderRef.current.cleanup();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
    };
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      if (!recorderRef.current) return;
      await recorderRef.current.initialize();
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
      onError?.(error as Error);
    }
  }, [onError]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!recorderRef.current || isRecording) return;

    try {
      // Request permission if not already granted
      if (hasPermission === null) {
        await requestPermission();
      }

      await recorderRef.current.startRecording(
        {
          maxDuration,
          silenceThreshold: autoStopOnSilence ? silenceThreshold : undefined,
          silenceDuration: autoStopOnSilence ? silenceDuration : undefined,
        },
        {
          onStop: (blob, dur) => {
            setIsRecording(false);
            setDuration(0);
            setVolumeLevel(0);
            setIsVoiceActive(false);
            onRecordingStop?.();
            onRecordingComplete?.(blob, dur);

            // Clear intervals
            if (durationIntervalRef.current) {
              clearInterval(durationIntervalRef.current);
            }
            if (volumeIntervalRef.current) {
              clearInterval(volumeIntervalRef.current);
            }
          },
          onError: error => {
            setIsRecording(false);
            onError?.(error);
          },
          onVoiceStart: () => {
            setIsVoiceActive(true);
            onVoiceDetected?.(true);
          },
          onVoiceEnd: () => {
            setIsVoiceActive(false);
            onVoiceDetected?.(false);
          },
        }
      );

      setIsRecording(true);
      onRecordingStart?.();

      // Update duration
      durationIntervalRef.current = setInterval(() => {
        if (recorderRef.current) {
          setDuration(recorderRef.current.getDuration());
        }
      }, 100);

      // Update volume level
      volumeIntervalRef.current = setInterval(() => {
        if (recorderRef.current) {
          setVolumeLevel(recorderRef.current.getVolumeLevel());
        }
      }, 50);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [
    isRecording,
    hasPermission,
    maxDuration,
    autoStopOnSilence,
    silenceThreshold,
    silenceDuration,
    onRecordingStart,
    onRecordingStop,
    onRecordingComplete,
    onError,
    onVoiceDetected,
    requestPermission,
  ]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stopRecording();
    }
  }, [isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (recorderRef.current && isRecording && !isPaused) {
      recorderRef.current.pauseRecording();
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (recorderRef.current && isRecording && isPaused) {
      recorderRef.current.resumeRecording();
      setIsPaused(false);
    }
  }, [isRecording, isPaused]);

  // Handle spacebar push-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !disabled && !isSpacebarPressedRef.current) {
        // Prevent default spacebar behavior (page scroll)
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          isSpacebarPressedRef.current = true;
          if (!isRecording) {
            startRecording();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSpacebarPressedRef.current) {
        isSpacebarPressedRef.current = false;
        if (isRecording) {
          stopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, isRecording, startRecording, stopRecording]);

  // Format duration
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate remaining time
  const remainingTime = maxDuration - duration;
  const progress = (duration / maxDuration) * 100;

  return (
    <div className={`voice-recorder ${className}`}>
      {/* Permission Request */}
      {hasPermission === false && (
        <div className="permission-denied">
          <p className="text-primary text-sm mb-2">
            Microphone permission denied. Please allow microphone access to record audio.
          </p>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-secondary text-white rounded hover:brightness-90 transition-all"
          >
            Request Permission
          </button>
        </div>
      )}

      {/* Recording Controls */}
      {hasPermission !== false && (
        <div className="recording-controls space-y-4">
          {/* Push-to-Talk Hint */}
          {!isRecording && (
            <div className="text-center mb-2">
              <p className="text-xs text-muted-foreground">
                Press and hold{' '}
                <kbd className="px-2 py-1 bg-secondary-background border-2 border-border rounded-base text-xs font-mono">
                  Space
                </kbd>{' '}
                for push-to-talk
              </p>
            </div>
          )}

          {/* Record Button */}
          <div className="flex items-center justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                className="w-16 h-16 rounded-full bg-primary hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
                aria-label="Start recording"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <>
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-secondary-background border-2 border-border hover:bg-muted text-foreground flex items-center justify-center"
                  aria-label="Stop recording"
                >
                  <div className="w-6 h-6 bg-foreground rounded-sm" />
                </button>

                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="w-12 h-12 rounded-full bg-secondary hover:brightness-90 text-white flex items-center justify-center transition-all"
                  aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
                >
                  {isPaused ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="recording-status space-y-2">
              {/* Duration and Progress */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground/80">{formatDuration(duration)}</span>
                <span className="text-muted-foreground">{formatDuration(remainingTime)}</span>
              </div>

              <div className="w-full bg-secondary-background rounded-base h-2 border-2 border-border overflow-hidden">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Volume Indicator */}
              <div className="volume-indicator">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Volume:</span>
                  <div className="flex-1 bg-secondary-background rounded-base h-1.5 border border-border overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isVoiceActive ? 'bg-tertiary-green' : 'bg-muted-foreground/50'
                      }`}
                      style={{ width: `${volumeLevel * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Voice Activity Indicator */}
              {autoStopOnSilence && (
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isVoiceActive ? 'bg-tertiary-green' : 'bg-muted-foreground/50'
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {isVoiceActive ? 'Voice detected' : 'Listening...'}
                  </span>
                </div>
              )}

              {/* Pause Indicator */}
              {isPaused && (
                <div className="text-center text-sm" style={{ color: 'hsl(48, 50%, 50%)' }}>
                  Recording paused
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
