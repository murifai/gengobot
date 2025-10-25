'use client';

import { useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import VoiceRecorder from '../voice/VoiceRecorder';

export type InputMode = 'text' | 'voice';

export interface ChatInputProps {
  onSend: (message: string) => void;
  onVoiceRecording?: (audioBlob: Blob, duration: number) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  enableVoice?: boolean;
  initialMode?: InputMode;
}

export default function ChatInput({
  onSend,
  onVoiceRecording,
  placeholder = 'Type your message...',
  disabled = false,
  loading = false,
  enableVoice = false,
  initialMode = 'text',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>(initialMode);

  const handleSend = () => {
    if (message.trim() && !disabled && !loading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceRecordingComplete = (audioBlob: Blob, duration: number) => {
    if (onVoiceRecording) {
      onVoiceRecording(audioBlob, duration);
    }
  };

  const toggleInputMode = () => {
    setInputMode(prev => (prev === 'text' ? 'voice' : 'text'));
  };

  return (
    <div className="space-y-2">
      {inputMode === 'text' ? (
        <div className="flex items-end gap-2 rounded-lg border-2 border-border bg-background p-2">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent px-2 py-1 text-foreground',
              'focus:outline-none disabled:opacity-50',
              'placeholder:text-foreground/50'
            )}
            style={{ maxHeight: '120px' }}
            onInput={e => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />

          {enableVoice && onVoiceRecording && (
            <Button
              onClick={toggleInputMode}
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={disabled}
              aria-label="Switch to voice input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </Button>
          )}

          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            loading={loading}
            size="sm"
            className="shrink-0"
          >
            Send
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-border bg-background p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Voice Input</h3>
            <Button
              onClick={toggleInputMode}
              variant="secondary"
              size="sm"
              aria-label="Switch to text input"
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
          </div>
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            disabled={disabled || loading}
            maxDuration={60000}
            autoStopOnSilence={true}
            silenceDuration={2000}
          />
        </div>
      )}
    </div>
  );
}
