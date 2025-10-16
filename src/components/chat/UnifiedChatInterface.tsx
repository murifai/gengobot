'use client';

import { cn } from '@/lib/utils';
import ConversationContainer, { Message } from '../conversation/ConversationContainer';
import ChatInput from '../conversation/ChatInput';

export interface UnifiedChatInterfaceProps {
  // Header
  title: string;
  subtitle?: string;
  onBack?: () => void;

  // Messages
  messages: Message[];
  loading?: boolean;

  // Input
  onSendMessage: (message: string) => void;
  onVoiceRecording?: (audioBlob: Blob) => void;
  placeholder?: string;
  disabled?: boolean;
  enableVoice?: boolean;

  // Sidebar (optional)
  sidebar?: React.ReactNode;

  // Empty state
  emptyStateMessage?: string;

  // Styling
  className?: string;
}

export default function UnifiedChatInterface({
  title,
  subtitle,
  onBack,
  messages,
  loading = false,
  onSendMessage,
  onVoiceRecording,
  placeholder = 'Type your message...',
  disabled = false,
  enableVoice = false,
  sidebar,
  emptyStateMessage,
  className,
}: UnifiedChatInterfaceProps) {
  return (
    <div className={cn('flex flex-col h-screen bg-gray-50 dark:bg-gray-900', className)}>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (optional) */}
        {sidebar && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto shrink-0">
            {sidebar}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 && emptyStateMessage ? (
              <div className="flex items-center justify-center h-full text-center px-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">{emptyStateMessage}</p>
                </div>
              </div>
            ) : (
              <ConversationContainer messages={messages} loading={loading} className="h-full" />
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 shrink-0">
            <ChatInput
              onSend={onSendMessage}
              onVoiceRecording={onVoiceRecording}
              placeholder={placeholder}
              disabled={disabled}
              loading={loading}
              enableVoice={enableVoice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
