'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TaskChatInputV2 } from '@/components/task/TaskChatInputV2';
import TokenizedText from '@/components/vocabulary/TokenizedText';
import { Info, X, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { ProgressHeader } from '@/components/task/ProgressHeader';
import { CompletionSuggestion } from '@/components/task/CompletionSuggestion';
import { MessageLimitWarning } from '@/components/task/MessageLimitWarning';
import { HintButton } from '@/components/chat/HintButton';

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

  // Hint system
  hintConfig?: {
    type: 'task' | 'free-chat';
    attemptId?: string;
    sessionId?: string;
    currentObjective?: string;
  };

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
  onBack,
  headerActions,
  messages,
  isStreaming = false,
  onSendMessage,
  onVoiceRecording,
  placeholder = 'Tulis pesan kamu...',
  disabled = false,
  enableVoice = false,
  sidebar,
  sidebarDefaultOpen = false,
  emptyStateMessage,
  error,
  onClearError,
  className,
  hintConfig,
  taskProgress,
  onCompleteTask,
  onDismissCompletionSuggestion,
}: StreamingChatInterfaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(sidebarDefaultOpen);
  const [showParser, setShowParser] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mobile audio unlock state
  // On mobile, audio autoplay is blocked until user interacts with the page
  // We track if audio has been "unlocked" by a user gesture
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showAudioUnlockPrompt, setShowAudioUnlockPrompt] = useState(false);
  const [playingAudioIdx, setPlayingAudioIdx] = useState<number | null>(null);
  const [loadingAudioIdx, setLoadingAudioIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingAudioRef = useRef<{ url: string; idx: number } | null>(null);

  // Detect if on mobile
  const isMobile =
    typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Unlock audio context and play pending audio - called on user tap
  // This only shows once for the first audio, subsequent audios play automatically
  const unlockAudioAndPlay = useCallback(() => {
    if (!pendingAudioRef.current) {
      setShowAudioUnlockPrompt(false);
      setAudioUnlocked(true);
      return;
    }

    const { url, idx } = pendingAudioRef.current;

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create and play the actual pending audio directly from user tap
    const audio = new Audio(url);
    audioRef.current = audio;

    setLoadingAudioIdx(idx);
    setShowAudioUnlockPrompt(false);

    audio.onloadeddata = () => {
      setLoadingAudioIdx(null);
      setPlayingAudioIdx(idx);
      audio
        .play()
        .then(() => {
          setAudioUnlocked(true); // Mark as unlocked - future audios won't show prompt
          pendingAudioRef.current = null;
          console.log('[StreamingChatInterface] Audio unlocked and playing');
        })
        .catch(err => {
          console.error('[StreamingChatInterface] Audio play failed:', err);
          setPlayingAudioIdx(null);
        });
    };

    audio.onended = () => {
      setPlayingAudioIdx(null);
      audioRef.current = null;
    };

    audio.onerror = e => {
      console.error('[StreamingChatInterface] Audio error:', e);
      setLoadingAudioIdx(null);
      setPlayingAudioIdx(null);
      audioRef.current = null;
    };

    audio.load();
  }, []);

  // Play audio function
  const playAudio = useCallback(
    (audioUrl: string, idx: number) => {
      // On mobile, if audio not unlocked, show prompt and queue the audio
      if (isMobile && !audioUnlocked) {
        pendingAudioRef.current = { url: audioUrl, idx };
        setShowAudioUnlockPrompt(true);
        return;
      }

      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setLoadingAudioIdx(idx);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadeddata = () => {
        setLoadingAudioIdx(null);
        setPlayingAudioIdx(idx);
        audio.play().catch(err => {
          console.error('[StreamingChatInterface] Audio play failed:', err);
          setPlayingAudioIdx(null);
          // On mobile, if play fails, show unlock prompt
          if (isMobile) {
            pendingAudioRef.current = { url: audioUrl, idx };
            setShowAudioUnlockPrompt(true);
            setAudioUnlocked(false);
          }
        });
      };

      audio.onended = () => {
        setPlayingAudioIdx(null);
        audioRef.current = null;
      };

      audio.onerror = e => {
        console.error('[StreamingChatInterface] Audio error:', e);
        setLoadingAudioIdx(null);
        setPlayingAudioIdx(null);
        audioRef.current = null;
      };

      audio.load();
    },
    [isMobile, audioUnlocked]
  );

  // Stop audio function
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingAudioIdx(null);
    setLoadingAudioIdx(null);
  }, []);

  // Auto-play latest AI audio response
  const lastAudioPlayedRef = useRef<string | null>(null);
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage.role === 'assistant' &&
      lastMessage.audioUrl &&
      !lastMessage.isStreaming &&
      lastMessage.audioUrl !== lastAudioPlayedRef.current
    ) {
      lastAudioPlayedRef.current = lastMessage.audioUrl;
      playAudio(lastMessage.audioUrl, messages.length - 1);
    }
  }, [messages, playAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn('fixed inset-0 flex bg-background', className)}>
      {/* Mobile Audio Unlock Prompt */}
      {showAudioUnlockPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border-2 border-border rounded-base p-6 mx-4 max-w-sm shadow-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="w-8 h-8 text-primary" />
              <h3 className="text-lg font-bold">Aktifkan Audio</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tap tombol di bawah untuk mengaktifkan audio. Setelah diaktifkan, audio akan otomatis
              diputar.
            </p>
            <button
              onClick={unlockAudioAndPlay}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
            >
              🔊 Aktifkan Audio
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-card border-b-2 border-border px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 shrink-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-accent rounded-base transition-colors"
              aria-label="Go back"
            >
              <svg
                className="w-6 h-6 text-foreground"
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
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-base border-2 border-border">
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
              className="p-2 hover:bg-accent rounded-base transition-colors flex items-center gap-1"
              aria-label={isSidebarOpen ? 'Hide info' : 'Show info'}
              title={isSidebarOpen ? 'Hide info' : 'Show info'}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Info className="w-5 h-5 text-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Progress Header Bar (Phase 5 - Task Feedback System) */}
        {taskProgress && <ProgressHeader progress={taskProgress} onComplete={onCompleteTask} />}

        {/* Error Banner */}
        {error && (
          <div className="bg-primary/10 border-b-2 border-primary/30 px-4 py-3">
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
              <p className="text-muted-foreground text-center">
                {emptyStateMessage || 'Start your conversation'}
              </p>
            </div>
          ) : (
            messages.map((message, idx) => {
              return (
                <div
                  key={idx}
                  className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-base px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground border-2 border-border shadow-shadow'
                        : 'bg-card text-foreground border-2 border-border shadow-shadow'
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

                    {/* Audio play button for AI responses */}
                    {message.role === 'assistant' && message.audioUrl && !message.isStreaming && (
                      <button
                        onClick={() => {
                          if (playingAudioIdx === idx) {
                            stopAudio();
                          } else {
                            playAudio(message.audioUrl!, idx);
                          }
                        }}
                        className={cn(
                          'mt-2 flex items-center gap-2 px-3 py-1.5 rounded-base border-2 border-border transition-all text-sm',
                          playingAudioIdx === idx
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card hover:bg-accent'
                        )}
                        aria-label={playingAudioIdx === idx ? 'Stop audio' : 'Play audio'}
                      >
                        {loadingAudioIdx === idx ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : playingAudioIdx === idx ? (
                          <>
                            <VolumeX className="w-4 h-4" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            <span>Putar</span>
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex items-center justify-between mt-2 gap-2">
                      <p className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* Parser Toggle Button - Only for AI messages */}
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => setShowParser(!showParser)}
                          className="flex items-center justify-center px-2 py-1 rounded-base transition-colors bg-card text-primary hover:bg-accent border-2 border-border"
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

        {/* Floating Hint Button */}
        {hintConfig && messages.length > 0 && (
          <div className="absolute bottom-28 left-4 z-10">
            <HintButton
              type={hintConfig.type}
              attemptId={hintConfig.attemptId}
              sessionId={hintConfig.sessionId}
              lastMessage={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || ''}
              currentObjective={hintConfig.currentObjective}
              disabled={isStreaming || disabled}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="bg-card border-t-2 border-border p-4">
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
    </div>
  );
}
