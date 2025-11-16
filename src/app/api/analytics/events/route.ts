/**
 * Analytics Events API
 * POST /api/analytics/events
 * Phase 4: Analytics Integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await req.json();
    const { event, properties } = body;

    if (!event) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    // Store analytics event in database
    await prisma.analyticsEvent.create({
      data: {
        userId: userId || null,
        eventName: event,
        properties: properties || {},
        timestamp: new Date(),
        userAgent: req.headers.get('user-agent') || null,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        url: properties?.url || null,
        referrer: properties?.referrer || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: true });
  }
}
