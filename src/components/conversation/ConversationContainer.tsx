'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import MessageBubble from './MessageBubble';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  avatar?: string;
  audioUrl?: string;
}

export interface ConversationContainerProps {
  messages: Message[];
  className?: string;
  loading?: boolean;
  autoPlayLatest?: boolean;
}

export default function ConversationContainer({
  messages,
  className,
  loading = false,
  autoPlayLatest = false,
}: ConversationContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn('flex flex-col gap-4 overflow-y-auto p-4', className)}>
      {messages.map((message, index) => {
        const isLatestAIMessage = !message.isUser && index === messages.length - 1;
        return (
          <MessageBubble
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            avatar={message.avatar}
            audioUrl={message.audioUrl}
            autoPlay={autoPlayLatest && isLatestAIMessage && !!message.audioUrl}
          />
        );
      })}

      {loading && (
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-white">
            <span className="text-sm font-medium">AI</span>
          </div>
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card-background px-4 py-3">
            <div className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-secondary" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
