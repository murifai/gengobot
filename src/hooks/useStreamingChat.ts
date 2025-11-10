'use client';

import { useState, useRef, useCallback } from 'react';

export interface StreamingMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
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
 */
export function useStreamingChat(
  attemptId: string,
  initialMessages: StreamingMessage[] = []
): UseStreamingChatReturn {
  const [messages, setMessages] = useState<StreamingMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Failed to send message' }));
          throw new Error(errorData.error || 'Failed to send message');
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
                // Mark streaming as complete
                setMessages(prev =>
                  prev.map((msg, idx) =>
                    idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
                  )
                );
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
  }, []);

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
