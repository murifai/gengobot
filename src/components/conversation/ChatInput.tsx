'use client';

import { useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function ChatInput({
  onSend,
  placeholder = 'Type your message...',
  disabled = false,
  loading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

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

  return (
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
  );
}
