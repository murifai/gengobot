'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageInput } from '@/components/ui/message-input';

export interface TaskChatInputProps {
  onSend: (message: string) => void;
  onVoiceRecording?: (audioBlob: Blob, duration: number) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  enableVoice?: boolean;
}

export function TaskChatInput({
  onSend,
  onVoiceRecording,
  placeholder = 'Type your message...',
  disabled = false,
  loading = false,
  enableVoice = false,
}: TaskChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSpacebarPressed, setIsSpacebarPressed] = useState(false);
  const audioRecordingRef = useRef<{
    toggleListening: () => void;
    stopRecording: () => void;
    isRecording: boolean;
  } | null>(null);

  // Spacebar push-to-talk handler
  useEffect(() => {
    if (!enableVoice || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacebarPressed) {
        const target = e.target as HTMLElement;
        // Only activate if not in input/textarea
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSpacebarPressed(true);

          // Trigger voice recording via mic button click
          const micButton = document.querySelector(
            '[aria-label="Voice input"]'
          ) as HTMLButtonElement;
          if (micButton && !audioRecordingRef.current?.isRecording) {
            micButton.click();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSpacebarPressed) {
        setIsSpacebarPressed(false);

        // Stop recording
        const micButton = document.querySelector('[aria-label="Voice input"]') as HTMLButtonElement;
        if (micButton && audioRecordingRef.current?.isRecording) {
          micButton.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableVoice, disabled, isSpacebarPressed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled && !loading) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  const transcribeAudio = useCallback(
    async (blob: Blob): Promise<string> => {
      if (!onVoiceRecording) return '';

      try {
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        console.log('🎤 Transcribing audio...');
        const response = await fetch('/api/whisper/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to transcribe audio');
        }

        const { transcript } = await response.json();
        console.log('✅ Transcription complete:', transcript);

        // Calculate duration (approximate)
        const duration = blob.size / 16000; // Rough estimate

        // Send to chat after transcription
        await onVoiceRecording(blob, duration);

        return transcript;
      } catch (error) {
        console.error('Transcription error:', error);
        throw error;
      }
    },
    [onVoiceRecording]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <MessageInput
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        isGenerating={loading}
        transcribeAudio={enableVoice ? transcribeAudio : undefined}
        submitOnEnter={true}
      />

      {/* Push-to-talk hint */}
      {enableVoice && !disabled && (
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Press and hold{' '}
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">Space</kbd> for
            push-to-talk
          </p>
        </div>
      )}
    </form>
  );
}
