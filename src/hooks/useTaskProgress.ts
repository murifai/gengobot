/**
 * useTaskProgress Hook
 *
 * Task progress save/restore functionality for interrupted sessions.
 * Automatically saves progress to localStorage and restores on return.
 */

import { useState, useEffect, useCallback } from 'react';

export interface TaskProgress {
  taskId: string;
  userId: string;
  startTime: string;
  lastUpdateTime: string;
  currentObjective: number;
  completedObjectives: string[];
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  hints: string[];
  attemptCount: number;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY_PREFIX = 'gengobot_task_progress_';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function useTaskProgress(taskId: string, userId: string) {
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${userId}_${taskId}`;

  // Load progress from localStorage on mount
  useEffect(() => {
    loadProgress();
  }, [taskId, userId]);

  // Auto-save progress periodically
  useEffect(() => {
    if (!progress || !hasUnsavedChanges) return;

    const interval = setInterval(() => {
      saveProgress();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [progress, hasUnsavedChanges]);

  // Save progress before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges) {
        saveProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as TaskProgress;
        setProgress(parsed);
      } else {
        // Initialize new progress
        const newProgress: TaskProgress = {
          taskId,
          userId,
          startTime: new Date().toISOString(),
          lastUpdateTime: new Date().toISOString(),
          currentObjective: 0,
          completedObjectives: [],
          conversationHistory: [],
          hints: [],
          attemptCount: 1,
        };
        setProgress(newProgress);
      }
    } catch (error) {
      console.error('Failed to load task progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId, userId, storageKey]);

  const saveProgress = useCallback(() => {
    if (!progress) return;

    try {
      const updated = {
        ...progress,
        lastUpdateTime: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setProgress(updated);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save task progress:', error);
    }
  }, [progress, storageKey]);

  const updateProgress = useCallback((updates: Partial<TaskProgress>) => {
    setProgress(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
    setHasUnsavedChanges(true);
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setProgress(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to clear task progress:', error);
    }
  }, [storageKey]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          {
            role,
            content,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const completeObjective = useCallback((objectiveId: string) => {
    setProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completedObjectives: [...prev.completedObjectives, objectiveId],
        currentObjective: prev.currentObjective + 1,
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const addHint = useCallback((hint: string) => {
    setProgress(prev => {
      if (!prev) return null;
      return {
        ...prev,
        hints: [...prev.hints, hint],
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  return {
    progress,
    isLoading,
    hasUnsavedChanges,
    updateProgress,
    saveProgress,
    clearProgress,
    addMessage,
    completeObjective,
    addHint,
  };
}

/**
 * Hook to check for and resume interrupted tasks
 */
export function useInterruptedTasks(userId: string) {
  const [interruptedTasks, setInterruptedTasks] = useState<TaskProgress[]>([]);

  useEffect(() => {
    findInterruptedTasks();
  }, [userId]);

  function findInterruptedTasks() {
    try {
      const tasks: TaskProgress[] = [];
      const prefix = `${STORAGE_KEY_PREFIX}${userId}_`;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const progress = JSON.parse(stored) as TaskProgress;
            tasks.push(progress);
          }
        }
      }

      // Sort by last update time (most recent first)
      tasks.sort(
        (a, b) => new Date(b.lastUpdateTime).getTime() - new Date(a.lastUpdateTime).getTime()
      );

      setInterruptedTasks(tasks);
    } catch (error) {
      console.error('Failed to find interrupted tasks:', error);
    }
  }

  const resumeTask = useCallback(
    (taskId: string) => {
      // Navigation will be handled by consuming component
      return interruptedTasks.find(task => task.taskId === taskId);
    },
    [interruptedTasks]
  );

  const deleteInterruptedTask = useCallback(
    (taskId: string) => {
      try {
        const key = `${STORAGE_KEY_PREFIX}${userId}_${taskId}`;
        localStorage.removeItem(key);
        setInterruptedTasks(prev => prev.filter(task => task.taskId !== taskId));
      } catch (error) {
        console.error('Failed to delete interrupted task:', error);
      }
    },
    [userId]
  );

  return {
    interruptedTasks,
    resumeTask,
    deleteInterruptedTask,
    refresh: findInterruptedTasks,
  };
}
