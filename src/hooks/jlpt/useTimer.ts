/**
 * JLPT Timer Hook
 *
 * Countdown timer for test sections with auto-submit
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  durationSeconds: number;
  onExpire?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeRemaining: number; // seconds
  isRunning: boolean;
  isExpired: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  formatTime: () => string;
}

export function useTimer({
  durationSeconds,
  onExpire,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const expiryCalledRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setTimeRemaining(durationSeconds);
    setIsRunning(true);
    setIsExpired(false);
    expiryCalledRef.current = false;
  }, [durationSeconds, clearTimer]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isExpired) {
      setIsRunning(true);
    }
  }, [isExpired]);

  const reset = useCallback(() => {
    clearTimer();
    setTimeRemaining(durationSeconds);
    setIsRunning(false);
    setIsExpired(false);
    expiryCalledRef.current = false;
  }, [durationSeconds, clearTimer]);

  const formatTime = useCallback(() => {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // Timer effect
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsExpired(true);
          clearInterval(intervalRef.current!);
          intervalRef.current = null;

          // Call onExpire only once
          if (!expiryCalledRef.current && onExpire) {
            expiryCalledRef.current = true;
            onExpire();
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [isRunning, onExpire, clearTimer]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  return {
    timeRemaining,
    isRunning,
    isExpired,
    start,
    pause,
    resume,
    reset,
    formatTime,
  };
}
