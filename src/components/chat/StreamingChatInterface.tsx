'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TaskChatInputV2 } from '@/components/task/TaskChatInputV2';
import TokenizedText from '@/components/vocabulary/TokenizedText';

export interface StreamingChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface StreamingChatInterfaceProps {
  // Header
  title: string;
  subtitle?: string;
  onBack?: () => void;
  headerActions?: React.ReactNode;

  // Messages
  messages: StreamingChatMessage[];
  isStreaming?: boolean;

  // Input
  onSendMessage: (message: string) => void;
  onVoiceRecording?: (audioBlob: Blob, duration: number) => void;
  placeholder?: string;
  disabled?: boolean;
  enableVoice?: boolean;

  // Sidebar (optional)
  sidebar?: React.ReactNode;
  sidebarDefaultOpen?: boolean;

  // Empty state
  emptyStateMessage?: string;

  // Error handling
  error?: string | null;
  onClearError?: () => void;

  // Styling
  className?: string;

  // Real-time transcription
  attemptId?: string; // For Whisper API real-time transcription
}

export default function StreamingChatInterface({
  title,
  subtitle,
  onBack,
  headerActions,
  messages,
  isStreaming = false,
  onSendMessage,
  onVoiceRecording,
  placeholder = 'Type your message...',
  disabled = false,
  enableVoice = false,
  sidebar,
  sidebarDefaultOpen = false,
  emptyStateMessage,
  error,
  onClearError,
  className,
}: StreamingChatInterfaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(sidebarDefaultOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn('flex h-screen bg-gray-50 dark:bg-gray-900', className)}>
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center gap-4 shrink-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg
                className="w-6 h-6 text-gray-900 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
          </div>
          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Responding...
              </span>
            </div>
          )}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          {sidebar && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={isSidebarOpen ? 'Hide info' : 'Show info'}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {isSidebarOpen ? '✕' : 'ℹ️'}
              </span>
            </button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {emptyStateMessage || 'Start your conversation'}
              </p>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div
                key={idx}
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  )}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <TokenizedText text={message.content} className="text-sm whitespace-pre-wrap" />
                  )}
                  {message.isStreaming && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-75" />
                      <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-150" />
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <TaskChatInputV2
            onSend={onSendMessage}
            onVoiceRecording={async (blob, duration) => {
              if (onVoiceRecording) {
                await onVoiceRecording(blob, duration);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            loading={isStreaming}
            enableVoice={enableVoice}
          />
        </div>
      </div>

      {/* Sidebar */}
      {sidebar && isSidebarOpen && (
        <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          {sidebar}
        </div>
      )}
    </div>
  );
}
