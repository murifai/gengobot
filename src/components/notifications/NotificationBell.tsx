/**
 * NotificationBell Component
 *
 * Displays a bell icon with notification count badge and dropdown list
 * of user notifications from the database.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Refresh notifications periodically
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // Get notification type icon and color
  const getNotificationStyle = (type: string) => {
    const styles: Record<string, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
      CREDITS_80_PERCENT: {
        icon: <CreditIcon />,
        bgColor: 'bg-tertiary-yellow/20',
        textColor: 'text-tertiary-yellow',
      },
      CREDITS_95_PERCENT: {
        icon: <CreditIcon />,
        bgColor: 'bg-tertiary-orange/20',
        textColor: 'text-tertiary-orange',
      },
      CREDITS_DEPLETED: {
        icon: <CreditIcon />,
        bgColor: 'bg-primary/20',
        textColor: 'text-primary',
      },
      CREDITS_RENEWED: {
        icon: <CreditIcon />,
        bgColor: 'bg-tertiary-green/20',
        textColor: 'text-tertiary-green',
      },
      TRIAL_STARTED: {
        icon: <TrialIcon />,
        bgColor: 'bg-tertiary-blue/20',
        textColor: 'text-tertiary-blue',
      },
      TRIAL_ENDING_3_DAYS: {
        icon: <TrialIcon />,
        bgColor: 'bg-tertiary-yellow/20',
        textColor: 'text-tertiary-yellow',
      },
      TRIAL_ENDING_1_DAY: {
        icon: <TrialIcon />,
        bgColor: 'bg-tertiary-orange/20',
        textColor: 'text-tertiary-orange',
      },
      TRIAL_ENDED: {
        icon: <TrialIcon />,
        bgColor: 'bg-primary/20',
        textColor: 'text-primary',
      },
      PAYMENT_SUCCESS: {
        icon: <PaymentIcon />,
        bgColor: 'bg-tertiary-green/20',
        textColor: 'text-tertiary-green',
      },
      PAYMENT_FAILED: {
        icon: <PaymentIcon />,
        bgColor: 'bg-primary/20',
        textColor: 'text-primary',
      },
      PAYMENT_EXPIRED: {
        icon: <PaymentIcon />,
        bgColor: 'bg-muted/20',
        textColor: 'text-muted-foreground',
      },
      SYSTEM_ANNOUNCEMENT: {
        icon: <SystemIcon />,
        bgColor: 'bg-tertiary-purple/20',
        textColor: 'text-tertiary-purple',
      },
      FEATURE_UPDATE: {
        icon: <SystemIcon />,
        bgColor: 'bg-tertiary-blue/20',
        textColor: 'text-tertiary-blue',
      },
    };

    return (
      styles[type] || {
        icon: <SystemIcon />,
        bgColor: 'bg-muted/20',
        textColor: 'text-muted-foreground',
      }
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-base hover:bg-secondary-background transition-colors"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-xs font-bold text-primary-foreground bg-primary rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background rounded-base shadow-shadow border-2 border-border z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b-2 border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-sm text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => {
                const style = getNotificationStyle(notification.type);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 border-b border-border hover:bg-secondary-background transition-colors ${
                      !notification.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full ${style.bgColor} flex items-center justify-center`}
                      >
                        <span className={style.textColor}>{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function BellIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function CreditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function TrialIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
