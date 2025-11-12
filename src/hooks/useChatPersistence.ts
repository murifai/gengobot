'use client';

import { useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/conversation';

const STORAGE_KEY_PREFIX = 'chat_messages_';
const STORAGE_VERSION = '1.0';

interface StoredChatData {
  version: string;
  attemptId: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

/**
 * Custom hook for persisting chat messages to localStorage
 * Provides automatic save/restore functionality across page reloads
 */
export function useChatPersistence(
  attemptId: string,
  messages: ChatMessage[],
  onRestore?: (messages: ChatMessage[]) => void
) {
  const storageKey = `${STORAGE_KEY_PREFIX}${attemptId}`;

  /**
   * Clear old chat data to prevent quota issues
   * Keeps only the 10 most recent chats
   */
  const clearOldChatData = useCallback(() => {
    try {
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX)) {
          allKeys.push(key);
        }
      }

      // Sort by lastUpdated timestamp (newest first)
      const sortedKeys = allKeys
        .map(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}') as StoredChatData;
            return { key, lastUpdated: new Date(data.lastUpdated || 0).getTime() };
          } catch {
            return { key, lastUpdated: 0 };
          }
        })
        .sort((a, b) => b.lastUpdated - a.lastUpdated);

      // Remove all except the 10 most recent
      const keysToRemove = sortedKeys.slice(10).map(item => item.key);
      keysToRemove.forEach(key => localStorage.removeItem(key));

      console.log('[useChatPersistence] Cleared old chat data:', {
        totalChats: allKeys.length,
        removedCount: keysToRemove.length,
      });
    } catch (error) {
      console.error('[useChatPersistence] Failed to clear old chat data:', error);
    }
  }, []);

  /**
   * Save messages to localStorage
   */
  const saveMessages = useCallback(
    (messagesToSave: ChatMessage[]) => {
      try {
        const data: StoredChatData = {
          version: STORAGE_VERSION,
          attemptId,
          messages: messagesToSave,
          lastUpdated: new Date().toISOString(),
        };

        localStorage.setItem(storageKey, JSON.stringify(data));
        console.log('[useChatPersistence] Messages saved to localStorage:', {
          attemptId,
          messageCount: messagesToSave.length,
        });
      } catch (error) {
        console.error('[useChatPersistence] Failed to save messages:', error);
        // Handle quota exceeded or other localStorage errors gracefully
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('[useChatPersistence] localStorage quota exceeded, clearing old data');
          clearOldChatData();
        }
      }
    },
    [attemptId, storageKey, clearOldChatData]
  );

  /**
   * Restore messages from localStorage
   */
  const restoreMessages = useCallback((): ChatMessage[] | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        console.log('[useChatPersistence] No cached messages found for attemptId:', attemptId);
        return null;
      }

      const data: StoredChatData = JSON.parse(stored);

      // Version check for future compatibility
      if (data.version !== STORAGE_VERSION) {
        console.warn('[useChatPersistence] Version mismatch, clearing cache');
        localStorage.removeItem(storageKey);
        return null;
      }

      // Validate attemptId matches
      if (data.attemptId !== attemptId) {
        console.warn('[useChatPersistence] AttemptId mismatch, clearing cache');
        localStorage.removeItem(storageKey);
        return null;
      }

      console.log('[useChatPersistence] Messages restored from localStorage:', {
        attemptId,
        messageCount: data.messages.length,
        lastUpdated: data.lastUpdated,
      });

      return data.messages;
    } catch (error) {
      console.error('[useChatPersistence] Failed to restore messages:', error);
      // Clear corrupted data
      localStorage.removeItem(storageKey);
      return null;
    }
  }, [attemptId, storageKey]);

  /**
   * Clear messages for current attempt
   */
  const clearMessages = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      console.log('[useChatPersistence] Messages cleared for attemptId:', attemptId);
    } catch (error) {
      console.error('[useChatPersistence] Failed to clear messages:', error);
    }
  }, [attemptId, storageKey]);

  /**
   * Auto-save messages when they change
   */
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages]);

  /**
   * Auto-restore messages on mount
   */
  useEffect(() => {
    const restored = restoreMessages();
    if (restored && restored.length > 0 && onRestore) {
      onRestore(restored);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    saveMessages,
    restoreMessages,
    clearMessages,
    clearOldChatData,
  };
}
