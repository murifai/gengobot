/**
 * Notification Component
 *
 * Toast notification system for task completion and progress updates.
 * Supports multiple notification types with auto-dismiss and action buttons.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => string;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const duration = notification.duration !== undefined ? notification.duration : 5000;
    const newNotification: Notification = {
      ...notification,
      id,
      duration,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }

    return id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
        clearAll,
      }}
    >
      {children}
      <NotificationContainer notifications={notifications} onClose={hideNotification} />
    </NotificationContext.Provider>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { type, title, message, action } = notification;

  const typeStyles = {
    success: {
      bg: 'bg-tertiary-green/10',
      border: 'border-tertiary-green/30',
      icon: (
        <svg
          className="w-5 h-5 text-tertiary-green"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: 'text-tertiary-green',
      message: 'text-foreground/80',
    },
    error: {
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      title: 'text-primary',
      message: 'text-foreground/80',
    },
    warning: {
      bg: 'bg-tertiary-yellow/10',
      border: 'border-tertiary-yellow/30',
      icon: (
        <svg
          className="w-5 h-5"
          style={{ color: 'hsl(48, 50%, 50%)' }}
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
      ),
      title: 'text-foreground',
      message: 'text-foreground/80',
    },
    info: {
      bg: 'bg-secondary/10',
      border: 'border-secondary/30',
      icon: (
        <svg
          className="w-5 h-5 text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'text-secondary',
      message: 'text-foreground/80',
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`${styles.bg} ${styles.border} border-2 rounded-base shadow-shadow p-4 animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${styles.title} mb-1`}>{title}</h4>
          {message && <p className={`text-sm ${styles.message}`}>{message}</p>}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${styles.title} underline hover:no-underline`}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Utility hook for common task notifications
 */
export function useTaskNotifications() {
  const { showNotification } = useNotification();

  return {
    taskCompleted: (taskTitle: string) =>
      showNotification({
        type: 'success',
        title: 'タスク完了！ (Task Completed!)',
        message: `${taskTitle}を完了しました`,
      }),

    taskStarted: (taskTitle: string) =>
      showNotification({
        type: 'info',
        title: 'タスク開始 (Task Started)',
        message: `${taskTitle}を開始しました`,
        duration: 3000,
      }),

    taskError: (taskTitle: string, error: string) =>
      showNotification({
        type: 'error',
        title: 'タスクエラー (Task Error)',
        message: `${taskTitle}: ${error}`,
        duration: 0, // No auto-dismiss for errors
      }),

    progressUpdate: (message: string) =>
      showNotification({
        type: 'info',
        title: '進捗更新 (Progress Update)',
        message,
        duration: 3000,
      }),

    achievementUnlocked: (achievement: string) =>
      showNotification({
        type: 'success',
        title: '🎉 達成！ (Achievement Unlocked!)',
        message: achievement,
        duration: 7000,
      }),
  };
}
