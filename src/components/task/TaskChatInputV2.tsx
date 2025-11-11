'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { SimpleAudioVisualizer } from '@/components/ui/simple-audio-visualizer';
import { recordAudio } from '@/lib/audio-utils';

export interface TaskChatInputV2Props {
  onSend: (message: string) => void;
  onVoiceRecording?: (audioBlob: Blob, duration: number) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  enableVoice?: boolean;
}

export function TaskChatInputV2({
  onSend,
  onVoiceRecording,
  placeholder = 'Type your message...',
  disabled = false,
  loading = false,
  enableVoice = false,
}: TaskChatInputV2Props) {
  const [inputValue, setInputValue] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isSpacebarPressed, setIsSpacebarPressed] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeRecordingRef = useRef<Promise<Blob> | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && inputMode === 'text') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [inputValue, inputMode]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled && !loading) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  // Start recording
  const startRecording = useCallback(async () => {
    if (!onVoiceRecording || isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);
      activeRecordingRef.current = recordAudio(stream);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [onVoiceRecording, isRecording]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!isRecording || !activeRecordingRef.current) return;

    setIsRecording(false);
    setIsTranscribing(true);

    try {
      recordAudio.stop();
      const blob = await activeRecordingRef.current;

      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }

      // Transcribe
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to transcribe');

      await response.json();

      // Send to chat
      const duration = blob.size / 16000;
      await onVoiceRecording?.(blob, duration);

      // Don't set as text value - just send directly
      // User message already sent via onVoiceRecording
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      setIsTranscribing(false);
      activeRecordingRef.current = null;
    }
  }, [isRecording, audioStream, onVoiceRecording]);

  // Spacebar push-to-talk (only in voice mode)
  useEffect(() => {
    if (!enableVoice || disabled || inputMode !== 'voice') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacebarPressed) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSpacebarPressed(true);
          if (!isRecording) {
            startRecording();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSpacebarPressed) {
        setIsSpacebarPressed(false);
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
  }, [
    enableVoice,
    disabled,
    inputMode,
    isSpacebarPressed,
    isRecording,
    startRecording,
    stopRecording,
  ]);

  // Switch to voice mode
  const switchToVoice = () => {
    setInputMode('voice');
  };

  // Switch to text mode
  const switchToText = () => {
    setInputMode('text');
    if (isRecording) {
      stopRecording();
    }
  };

  if (inputMode === 'voice') {
    return (
      <div className="w-full">
        {/* Voice Mode UI - Full Width Input Bar */}
        <div className="relative flex items-center gap-2 rounded-xl border-2 border-border bg-background overflow-hidden h-[60px]">
          {/* Recording Visualizer or Voice Button */}
          {isRecording ? (
            /* Full-width audio visualizer bar - fills entire container */
            <div className="w-full h-[60px]">
              <SimpleAudioVisualizer
                stream={audioStream}
                isRecording={isRecording}
                onClick={stopRecording}
              />
            </div>
          ) : isTranscribing ? (
            <div className="flex-1 flex items-center justify-center h-[60px]">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></span>
              </div>
            </div>
          ) : (
            <>
              {/* Full-width Voice Input Bar */}
              <button
                onMouseDown={e => {
                  e.preventDefault();
                  startRecording();
                }}
                onMouseUp={e => {
                  e.preventDefault();
                  stopRecording();
                }}
                onMouseLeave={e => {
                  // Stop recording if mouse leaves while holding
                  if (isRecording) {
                    e.preventDefault();
                    stopRecording();
                  }
                }}
                onTouchStart={e => {
                  e.preventDefault();
                  startRecording();
                }}
                onTouchEnd={e => {
                  e.preventDefault();
                  stopRecording();
                }}
                onClick={e => {
                  // Prevent click event from triggering
                  e.preventDefault();
                }}
                disabled={disabled || loading}
                className={cn(
                  'flex-1 h-[60px] px-4 transition-all duration-200',
                  'flex items-center justify-center gap-3',
                  'bg-primary hover:brightness-90 active:brightness-75',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'select-none text-white font-medium'
                )}
              >
                <Mic className="w-5 h-5" />
                <span className="text-sm">Hold to Record (or press Space)</span>
              </button>
              {/* Text Input Button for non-recording state */}
              <Button
                type="button"
                onClick={switchToText}
                variant="ghost"
                size="sm"
                className="shrink-0 mr-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Text Mode UI
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-end gap-2 rounded-xl border-2 border-border bg-background p-3 min-h-[60px]">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={placeholder}
          disabled={disabled || loading}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground',
            'focus:outline-none disabled:opacity-50',
            'placeholder:text-muted-foreground',
            'max-h-[240px]'
          )}
        />

        {/* Voice Button */}
        {enableVoice && onVoiceRecording && (
          <Button
            type="button"
            onClick={switchToVoice}
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={disabled}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!inputValue.trim() || disabled || loading}
          size="sm"
          className="shrink-0"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
