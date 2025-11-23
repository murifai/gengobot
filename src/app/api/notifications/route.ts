/**
 * Notifications API
 * GET - Get user notifications
 * PATCH - Mark all as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  getUserNotifications,
  getUnreadCount,
  markAllAsRead,
} from '@/lib/notification/notification-service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(session.user.id, { unreadOnly, limit, offset }),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await markAllAsRead(session.user.id);

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}
