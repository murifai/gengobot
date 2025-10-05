/**
 * LoadingState Component
 *
 * Provides smooth loading states and animations for task transitions.
 * Task-focused with progress indication.
 */

import React from 'react';

export interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'progress' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  progress?: number; // 0-100 for progress type
  className?: string;
}

export function LoadingState({
  type = 'spinner',
  size = 'md',
  message,
  progress,
  className = '',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary`}
          role="status"
          aria-label="Loading"
        />
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">{message}</p>
        )}
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
      </div>
    );
  }

  if (type === 'progress') {
    const progressValue = Math.min(100, Math.max(0, progress || 0));

    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-between mb-2">
          {message && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{message}</span>
          )}
          <span className="text-sm font-medium text-primary">{progressValue}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressValue}%` }}
            role="progressbar"
            aria-valuenow={progressValue}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
        </div>
        {message && <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>}
      </div>
    );
  }

  return null;
}

/**
 * Task Loading Component
 * Specialized loading state for task-based operations
 */
export interface TaskLoadingProps {
  taskTitle?: string;
  stage?: string;
  progress?: number;
}

export function TaskLoading({ taskTitle, stage, progress }: TaskLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <LoadingState type="spinner" size="lg" />

      {taskTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{taskTitle}</h3>
      )}

      {stage && <p className="text-sm text-gray-600 dark:text-gray-400">{stage}</p>}

      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <LoadingState type="progress" progress={progress} />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton Loader for Task Cards
 */
export function TaskCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    </div>
  );
}
