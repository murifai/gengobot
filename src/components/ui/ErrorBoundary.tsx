/**
 * ErrorBoundary Component
 *
 * Comprehensive error handling UI for task-based scenarios.
 * Provides user-friendly error messages with recovery options.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => prevProps.resetKeys?.[index] !== key
      );

      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return <ErrorFallback error={error} onReset={this.reset} />;
    }

    return children;
  }
}

/**
 * Default Error Fallback UI
 */
interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-background px-4">
      <div className="max-w-md w-full bg-background rounded-base border-2 border-border shadow-shadow p-8">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          予期しないエラーが発生しました
        </h2>
        <p className="text-sm text-center text-muted-foreground mb-6">
          An unexpected error occurred
        </p>

        {error && (
          <div className="bg-primary/10 border-2 border-primary/30 rounded-base p-4 mb-6">
            <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-primary text-white rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-200"
          >
            もう一度試す (Try Again)
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="w-full px-4 py-2 bg-secondary-background text-foreground rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-200"
          >
            ホームに戻る (Go Home)
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          問題が続く場合は、サポートにお問い合わせください
          <br />
          If the problem persists, please contact support
        </p>
      </div>
    </div>
  );
}

/**
 * Task-Specific Error Component
 */
export interface TaskErrorProps {
  title?: string;
  message: string;
  errorCode?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function TaskError({
  title = 'タスクエラー',
  message,
  errorCode,
  onRetry,
  onCancel,
}: TaskErrorProps) {
  return (
    <div className="bg-primary/10 border-2 border-primary/30 rounded-base p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-primary mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">{title}</h3>
          <p className="text-sm text-red-700 dark:text-red-400 mb-3">{message}</p>

          {errorCode && (
            <p className="text-xs font-mono text-red-600 dark:text-red-500 mb-3">
              Error Code: {errorCode}
            </p>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                再試行 (Retry)
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-sm bg-secondary-background text-foreground rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                キャンセル (Cancel)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
