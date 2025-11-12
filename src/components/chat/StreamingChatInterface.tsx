'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TaskChatInputV2 } from '@/components/task/TaskChatInputV2';
import TokenizedText from '@/components/vocabulary/TokenizedText';
import { Info, X } from 'lucide-react';
import { ProgressHeader } from '@/components/task/ProgressHeader';
import { CompletionSuggestion } from '@/components/task/CompletionSuggestion';
import { MessageLimitWarning } from '@/components/task/MessageLimitWarning';

export interface StreamingChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  audioUrl?: string;
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

  // Task Progress (Phase 5 - Task Feedback System)
  taskProgress?: {
    attemptId: string;
    startTime: string;
    objectives: Array<{
      objectiveId: string;
      objectiveText: string;
      status: 'pending' | 'completed';
      completedAt?: string;
      completedAtMessageIndex?: number;
      confidence: number;
      evidence: string[];
    }>;
    completedObjectivesCount: number;
    totalObjectivesCount: number;
    allObjectivesCompleted: boolean;
    totalMessages: number;
    maxMessages: number;
    messagesRemaining: number;
    elapsedSeconds: number;
    estimatedDuration: number;
    readyToComplete: boolean;
    completionSuggested: boolean;
  };
  onCompleteTask?: () => void;
  onDismissCompletionSuggestion?: () => void;
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
  taskProgress,
  onCompleteTask,
  onDismissCompletionSuggestion,
}: StreamingChatInterfaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(sidebarDefaultOpen);
  const [showParser, setShowParser] = useState(true);
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
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-150" />
              </div>
              <span className="text-xs text-secondary font-medium">Responding...</span>
            </div>
          )}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          {sidebar && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={isSidebarOpen ? 'Hide info' : 'Show info'}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              ) : (
                <Info className="w-5 h-5 text-gray-900 dark:text-white" />
              )}
            </button>
          )}
        </div>

        {/* Progress Header Bar (Phase 5 - Task Feedback System) */}
        {taskProgress && <ProgressHeader progress={taskProgress} />}

        {/* Error Banner */}
        {error && (
          <div className="bg-primary/10 border-b border-primary/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-primary">{error}</p>
              {onClearError && (
                <button onClick={onClearError} className="text-primary hover:brightness-90">
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

        {/* Message Limit Warning (Phase 5 - Task Feedback System) */}
        {taskProgress && taskProgress.messagesRemaining <= taskProgress.maxMessages * 0.2 && (
          <MessageLimitWarning
            level={taskProgress.messagesRemaining === 0 ? 'critical' : 'warning'}
            messagesRemaining={taskProgress.messagesRemaining}
            totalMessages={taskProgress.totalMessages}
            maxMessages={taskProgress.maxMessages}
            onComplete={
              taskProgress.messagesRemaining === 0 && onCompleteTask ? onCompleteTask : undefined
            }
          />
        )}

        {/* Completion Suggestion Banner (Phase 5 - Task Feedback System) */}
        {taskProgress &&
          taskProgress.completionSuggested &&
          taskProgress.allObjectivesCompleted &&
          onCompleteTask &&
          onDismissCompletionSuggestion && (
            <CompletionSuggestion
              objectives={taskProgress.objectives.filter(obj => obj.status === 'completed')}
              onComplete={onCompleteTask}
              onDismiss={onDismissCompletionSuggestion}
            />
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
            messages.map((message, idx) => {
              const isLatestAI = message.role === 'assistant' && idx === messages.length - 1;
              const shouldAutoPlay = isLatestAI && !!message.audioUrl && !message.isStreaming;

              return (
                <div
                  key={idx}
                  className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                      message.role === 'user'
                        ? 'bg-secondary text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    )}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : showParser ? (
                      <TokenizedText
                        text={message.content}
                        className="text-sm whitespace-pre-wrap"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.isStreaming && (
                      <div className="mt-2 flex items-center gap-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-75" />
                        <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-150" />
                      </div>
                    )}

                    {/* Hidden audio player for AI responses - auto-play only */}
                    {message.role === 'assistant' && message.audioUrl && !message.isStreaming && (
                      <audio
                        src={message.audioUrl}
                        autoPlay={shouldAutoPlay}
                        onLoadedMetadata={e => {
                          console.log('[StreamingChatInterface] Audio loaded:', {
                            idx,
                            audioUrl: message.audioUrl,
                            duration: e.currentTarget.duration,
                            autoPlay: shouldAutoPlay,
                          });
                        }}
                        onError={e => {
                          console.error('[StreamingChatInterface] Audio error:', {
                            idx,
                            audioUrl: message.audioUrl,
                            error: e.currentTarget.error,
                          });
                        }}
                      />
                    )}

                    <div className="flex items-center justify-between mt-2 gap-2">
                      <p className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>

                      {/* Parser Toggle Button - Only for AI messages */}
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => setShowParser(!showParser)}
                          className="flex items-center justify-center px-2 py-1 rounded transition-colors bg-white dark:bg-gray-700 text-primary hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                          aria-label={showParser ? 'Disable text parser' : 'Enable text parser'}
                          title={showParser ? 'Disable text parser' : 'Enable text parser'}
                        >
                          <span className="text-xs font-medium">{showParser ? '辞' : '文'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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
            disabled={disabled || taskProgress?.messagesRemaining === 0}
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
