/**
 * Notification Service
 * Handles creating and managing in-app notifications for users
 */

import { prisma } from '@/lib/prisma';
import { NotificationType, Prisma } from '@prisma/client';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Notification templates
const notificationTemplates: Record<
  NotificationType,
  {
    title: string;
    message: (params?: Record<string, unknown>) => string;
    actionUrl?: string | ((params?: Record<string, unknown>) => string);
    actionLabel?: string;
  }
> = {
  // Credit notifications
  CREDITS_80_PERCENT: {
    title: 'Credit Usage Alert',
    message: params =>
      `You've used 80% of your monthly credits. ${params?.remaining?.toLocaleString() || 0} credits remaining.`,
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'View Plans',
  },
  CREDITS_95_PERCENT: {
    title: 'Almost Out of Credits',
    message: params =>
      `You've used 95% of your monthly credits. Only ${params?.remaining?.toLocaleString() || 0} credits remaining.`,
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'Upgrade Now',
  },
  CREDITS_DEPLETED: {
    title: 'Credits Depleted',
    message: params =>
      `You've used all your credits for this period. Credits reset in ${params?.daysRemaining || 0} day${(params?.daysRemaining as number) !== 1 ? 's' : ''}.`,
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'Upgrade for More',
  },
  CREDITS_RENEWED: {
    title: 'Monthly Credits Renewed',
    message: params =>
      `${params?.creditsGranted?.toLocaleString() || 0} credits have been added to your account.`,
    actionUrl: `${appUrl}/dashboard`,
    actionLabel: 'Start Practicing',
  },

  // Trial notifications
  TRIAL_STARTED: {
    title: 'Trial Started',
    message: params =>
      `Your ${params?.trialDays || 14}-day free trial has started! You have ${params?.trialCredits?.toLocaleString() || 0} credits to explore.`,
    actionUrl: `${appUrl}/dashboard`,
    actionLabel: 'Start Learning',
  },
  TRIAL_ENDING_3_DAYS: {
    title: 'Trial Ending Soon',
    message: () =>
      'Your free trial ends in 3 days. Upgrade now to continue learning without interruption.',
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'View Plans',
  },
  TRIAL_ENDING_1_DAY: {
    title: 'Trial Ends Tomorrow',
    message: () => 'Your free trial ends tomorrow! Upgrade now to keep your learning streak going.',
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'Upgrade Now',
  },
  TRIAL_ENDED: {
    title: 'Trial Ended',
    message: () =>
      'Your free trial has ended. Upgrade to a paid plan to continue using chat and voice features.',
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'Choose a Plan',
  },

  // Payment notifications
  PAYMENT_SUCCESS: {
    title: 'Payment Successful',
    message: params =>
      `Thank you! Your payment of ${params?.amount || ''} for the ${params?.tier || ''} plan has been confirmed.`,
    actionUrl: `${appUrl}/dashboard`,
    actionLabel: 'Go to Dashboard',
  },
  PAYMENT_FAILED: {
    title: 'Payment Failed',
    message: params =>
      `We couldn't process your payment${params?.reason ? `: ${params.reason}` : ''}. Please try again.`,
    actionUrl: (params: Record<string, unknown> | undefined) =>
      (params?.invoiceUrl as string) || `${appUrl}/pricing`,
    actionLabel: 'Retry Payment',
  },
  PAYMENT_EXPIRED: {
    title: 'Invoice Expired',
    message: () => 'Your payment invoice has expired. Please create a new payment to upgrade.',
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'View Plans',
  },

  // Subscription renewal notifications
  SUBSCRIPTION_EXPIRING_3_DAYS: {
    title: 'Langganan Akan Berakhir',
    message: (params?: Record<string, unknown>) =>
      `Langganan ${params?.tier || ''} Anda akan berakhir dalam 3 hari (${params?.expiryDate || ''}). Perpanjang sekarang untuk tetap menikmati semua fitur.`,
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'Perpanjang Sekarang',
  },
  SUBSCRIPTION_EXPIRING_1_DAY: {
    title: '⚠️ Langganan Berakhir Besok!',
    message: (params?: Record<string, unknown>) =>
      `PENTING: Langganan ${params?.tier || ''} Anda akan berakhir BESOK. Anda masih memiliki ${(params?.creditsRemaining as number)?.toLocaleString() || 0} kredit yang akan hangus jika tidak diperpanjang.`,
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'Perpanjang Sekarang',
  },
  SUBSCRIPTION_EXPIRED: {
    title: 'Langganan Telah Berakhir',
    message: (params?: Record<string, unknown>) =>
      `Langganan ${params?.tier || ''} Anda telah berakhir. Perpanjang untuk melanjutkan belajar dengan fitur lengkap.`,
    actionUrl: `${appUrl}/pricing`,
    actionLabel: 'Pilih Paket',
  },

  // System notifications
  SYSTEM_ANNOUNCEMENT: {
    title: 'Announcement',
    message: params => (params?.message as string) || 'Check out the latest updates!',
  },
  FEATURE_UPDATE: {
    title: 'New Feature',
    message: params =>
      (params?.message as string) || "We've added new features to help your learning journey!",
    actionUrl: `${appUrl}/dashboard`,
    actionLabel: 'Explore',
  },
};

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  params?: Record<string, unknown>;
  customTitle?: string;
  customMessage?: string;
  customActionUrl?: string;
  customActionLabel?: string;
  metadata?: Prisma.JsonValue;
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: CreateNotificationParams) {
  const template = notificationTemplates[data.type];

  let actionUrl: string | undefined;
  if (data.customActionUrl) {
    actionUrl = data.customActionUrl;
  } else if (typeof template.actionUrl === 'function') {
    actionUrl = template.actionUrl(data.params);
  } else {
    actionUrl = template.actionUrl;
  }

  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.customTitle || template.title,
      message: data.customMessage || template.message(data.params),
      actionUrl,
      actionLabel: data.customActionLabel || template.actionLabel,
      metadata: data.metadata ?? Prisma.DbNull,
    },
  });

  return notification;
}

/**
 * Create notifications for multiple users (batch)
 */
export async function createNotificationsBatch(
  userIds: string[],
  type: NotificationType,
  params?: Record<string, unknown>,
  metadata?: Prisma.JsonValue
) {
  const template = notificationTemplates[type];

  let actionUrl: string | undefined;
  if (typeof template.actionUrl === 'function') {
    actionUrl = template.actionUrl(params);
  } else {
    actionUrl = template.actionUrl;
  }

  const notifications = await prisma.notification.createMany({
    data: userIds.map(userId => ({
      userId,
      type,
      title: template.title,
      message: template.message(params),
      actionUrl,
      actionLabel: template.actionLabel,
      metadata: metadata || Prisma.DbNull,
    })),
  });

  return notifications;
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  const { unreadOnly = false, limit = 20, offset = 0 } = options || {};

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  return notifications;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return count;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return notification;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  const result = await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
  });

  return result;
}

/**
 * Delete old read notifications (cleanup)
 */
export async function cleanupOldNotifications(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      isRead: true,
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result;
}

// Helper functions for common notification scenarios

/**
 * Notify user about credit usage milestone
 */
export async function notifyCreditUsage(
  userId: string,
  percentage: number,
  remaining: number,
  daysRemaining?: number
) {
  if (percentage >= 100) {
    return createNotification({
      userId,
      type: 'CREDITS_DEPLETED',
      params: { daysRemaining: daysRemaining || 0 },
    });
  } else if (percentage >= 95) {
    return createNotification({
      userId,
      type: 'CREDITS_95_PERCENT',
      params: { remaining },
    });
  } else if (percentage >= 80) {
    return createNotification({
      userId,
      type: 'CREDITS_80_PERCENT',
      params: { remaining },
    });
  }
  return null;
}

/**
 * Notify user about trial status
 */
export async function notifyTrialStatus(
  userId: string,
  status: 'started' | 'ending_3_days' | 'ending_1_day' | 'ended',
  params?: { trialDays?: number; trialCredits?: number }
) {
  const typeMap: Record<string, NotificationType> = {
    started: 'TRIAL_STARTED',
    ending_3_days: 'TRIAL_ENDING_3_DAYS',
    ending_1_day: 'TRIAL_ENDING_1_DAY',
    ended: 'TRIAL_ENDED',
  };

  return createNotification({
    userId,
    type: typeMap[status],
    params,
  });
}

/**
 * Notify user about payment status
 */
export async function notifyPaymentStatus(
  userId: string,
  status: 'success' | 'failed' | 'expired',
  params?: {
    amount?: string;
    tier?: string;
    reason?: string;
    invoiceUrl?: string;
  }
) {
  const typeMap: Record<string, NotificationType> = {
    success: 'PAYMENT_SUCCESS',
    failed: 'PAYMENT_FAILED',
    expired: 'PAYMENT_EXPIRED',
  };

  return createNotification({
    userId,
    type: typeMap[status],
    params,
  });
}

/**
 * Notify user about monthly credit renewal
 */
export async function notifyCreditsRenewed(userId: string, creditsGranted: number) {
  return createNotification({
    userId,
    type: 'CREDITS_RENEWED',
    params: { creditsGranted },
  });
}

/**
 * Notify user about subscription expiring soon
 * For Indonesia market with non-recurring payments, this is critical
 */
export async function notifySubscriptionExpiring(
  userId: string,
  tier: string,
  expiryDate: Date,
  creditsRemaining: number,
  daysRemaining: 1 | 3
) {
  const formattedDate = expiryDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const tierDisplayName = tier === 'BASIC' ? 'Basic' : tier === 'PRO' ? 'Pro' : tier;

  // Note: These notification types need to be added to Prisma schema and regenerated
  const type: NotificationType =
    daysRemaining === 1
      ? ('SUBSCRIPTION_EXPIRING_1_DAY' as NotificationType)
      : ('SUBSCRIPTION_EXPIRING_3_DAYS' as NotificationType);

  return createNotification({
    userId,
    type,
    params: {
      tier: tierDisplayName,
      expiryDate: formattedDate,
      creditsRemaining,
    },
  });
}

/**
 * Notify user that subscription has expired
 */
export async function notifySubscriptionExpired(userId: string, tier: string) {
  const tierDisplayName = tier === 'BASIC' ? 'Basic' : tier === 'PRO' ? 'Pro' : tier;

  return createNotification({
    userId,
    type: 'SUBSCRIPTION_EXPIRED' as NotificationType,
    params: { tier: tierDisplayName },
  });
}
