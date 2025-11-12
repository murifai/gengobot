'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ObjectiveTracking } from '@/lib/ai/objective-detection';

export interface TaskFeedbackProgress {
  attemptId: string;
  startTime: string;

  // Objectives
  objectives: ObjectiveTracking[];
  completedObjectivesCount: number;
  totalObjectivesCount: number;
  allObjectivesCompleted: boolean;

  // Messages
  totalMessages: number;
  maxMessages: number;
  messagesRemaining: number;

  // Time
  elapsedSeconds: number;
  estimatedDuration: number; // minutes

  // Completion
  readyToComplete: boolean;
  completionSuggested: boolean;
}

export interface UseTaskFeedbackProgressReturn {
  progress: TaskFeedbackProgress;
  updateObjectives: (objectives: ObjectiveTracking[]) => void;
  incrementMessageCount: (count?: number) => void;
  dismissCompletionSuggestion: () => void;
  resetProgress: () => void;
}

/**
 * Hook for managing task feedback progress state including objectives, messages, and time tracking
 */
export function useTaskFeedbackProgress(
  attemptId: string,
  maxMessages: number = 30,
  estimatedDuration: number = 10,
  initialObjectives: ObjectiveTracking[] = []
): UseTaskFeedbackProgressReturn {
  const [startTime] = useState<string>(new Date().toISOString());
  const [objectives, setObjectives] = useState<ObjectiveTracking[]>(initialObjectives);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [completionSuggested, setCompletionSuggested] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate derived state
  const completedObjectivesCount = objectives.filter(obj => obj.status === 'completed').length;
  const totalObjectivesCount = objectives.length;
  const allObjectivesCompleted =
    completedObjectivesCount === totalObjectivesCount && totalObjectivesCount > 0;
  const messagesRemaining = Math.max(0, maxMessages - totalMessages);

  // Timer for elapsed time
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto-suggest completion when all objectives done
  useEffect(() => {
    if (allObjectivesCompleted && !completionSuggested && totalMessages > 0) {
      setCompletionSuggested(true);
    }
  }, [allObjectivesCompleted, completionSuggested, totalMessages]);

  const updateObjectives = useCallback((newObjectives: ObjectiveTracking[]) => {
    setObjectives(newObjectives);
  }, []);

  const incrementMessageCount = useCallback((count: number = 1) => {
    setTotalMessages(prev => prev + count);
  }, []);

  const dismissCompletionSuggestion = useCallback(() => {
    setCompletionSuggested(false);
  }, []);

  const resetProgress = useCallback(() => {
    setObjectives(initialObjectives);
    setTotalMessages(0);
    setElapsedSeconds(0);
    setCompletionSuggested(false);
  }, [initialObjectives]);

  const progress: TaskFeedbackProgress = {
    attemptId,
    startTime,
    objectives,
    completedObjectivesCount,
    totalObjectivesCount,
    allObjectivesCompleted,
    totalMessages,
    maxMessages,
    messagesRemaining,
    elapsedSeconds,
    estimatedDuration,
    readyToComplete: allObjectivesCompleted || messagesRemaining === 0,
    completionSuggested,
  };

  return {
    progress,
    updateObjectives,
    incrementMessageCount,
    dismissCompletionSuggestion,
    resetProgress,
  };
}
