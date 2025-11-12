'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatPersistence } from './useChatPersistence';

export interface StreamingMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  audioUrl?: string; // Kept for backward compatibility but not used in one-time playback
}

export interface UseStreamingChatReturn {
  messages: StreamingMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  addMessages: (newMessages: StreamingMessage[]) => void;
  clearError: () => void;
  resetMessages: () => void;
}

/**
 * Custom hook for streaming chat with WebRTC-like feel
 * Provides instant UI updates and real-time streaming
 * Now includes automatic localStorage persistence across page reloads
 */
export function useStreamingChat(
  attemptId: string,
  initialMessages: StreamingMessage[] = []
): UseStreamingChatReturn {
  const [messages, setMessages] = useState<StreamingMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Restore messages from localStorage on mount
  const handleRestore = useCallback(
    (restoredMessages: StreamingMessage[]) => {
      console.log('[useStreamingChat] Restoring messages from localStorage:', {
        count: restoredMessages.length,
        attemptId,
      });
      setMessages(restoredMessages);
      setIsInitialized(true);
    },
    [attemptId]
  );

  // Initialize chat persistence
  const { clearMessages } = useChatPersistence(attemptId, messages, handleRestore);

  // Set initialized flag if no messages were restored
  useEffect(() => {
    if (!isInitialized && messages.length === 0) {
      setIsInitialized(true);
    }
  }, [isInitialized, messages.length]);

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      // Add user message immediately (optimistic UI)
      const userMessage: StreamingMessage = {
        role: 'user',
        content: messageText.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Create placeholder for assistant message
      const assistantMessage: StreamingMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/task-attempts/${attemptId}/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText.trim() }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[useStreamingChat] API error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });

          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || 'Failed to send message' };
          }

          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Read streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // Decode and process chunks
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.done) {
                // Convert base64 audio data to temporary blob URL for one-time playback
                let temporaryAudioUrl: string | undefined;
                if (data.audioData) {
                  try {
                    // Convert base64 to blob
                    const audioBytes = Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0));
                    const audioBlob = new Blob([audioBytes], {
                      type: data.audioType || 'audio/mpeg',
                    });

                    // Create temporary blob URL
                    temporaryAudioUrl = URL.createObjectURL(audioBlob);

                    console.log('[useStreamingChat] Created temporary audio blob URL:', {
                      url: temporaryAudioUrl,
                      size: audioBlob.size,
                    });

                    // Auto-play the audio
                    const audio = new Audio(temporaryAudioUrl);
                    audio.onended = () => {
                      // Automatically revoke blob URL after playback
                      URL.revokeObjectURL(temporaryAudioUrl!);
                      console.log('[useStreamingChat] Blob URL revoked after playback');
                    };
                    audio.onerror = () => {
                      // Revoke on error too
                      URL.revokeObjectURL(temporaryAudioUrl!);
                      console.error('[useStreamingChat] Audio playback failed, blob URL revoked');
                    };
                    audio.play().catch(err => {
                      console.error('[useStreamingChat] Auto-play failed:', err);
                      // Revoke if play fails
                      URL.revokeObjectURL(temporaryAudioUrl!);
                    });
                  } catch (error) {
                    console.error('[useStreamingChat] Failed to create audio blob:', error);
                  }
                }

                // Mark streaming as complete (no audioUrl stored)
                setMessages(prev =>
                  prev.map((msg, idx) =>
                    idx === prev.length - 1
                      ? {
                          ...msg,
                          isStreaming: false,
                          // Don't store audioUrl - it's one-time use only
                        }
                      : msg
                  )
                );
                console.log('[useStreamingChat] Streaming complete with audio:', {
                  hasAudioData: !!data.audioData,
                  temporaryUrl: temporaryAudioUrl,
                });
              } else if (data.content) {
                // Update assistant message with streamed content
                setMessages(prev =>
                  prev.map((msg, idx) =>
                    idx === prev.length - 1 ? { ...msg, content: msg.content + data.content } : msg
                  )
                );
              }
            }
          }
        }
      } catch (err) {
        console.error('Streaming error:', err);

        // Remove the failed assistant message
        setMessages(prev => prev.slice(0, -1));

        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Failed to send message');
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [attemptId, isStreaming]
  );

  const addMessages = useCallback((newMessages: StreamingMessage[]) => {
    setMessages(prev => [...prev, ...newMessages]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetMessages = useCallback(() => {
    setMessages([]);
    clearMessages(); // Also clear from localStorage
  }, [clearMessages]);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    addMessages,
    clearError,
    resetMessages,
  };
}
