import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// PATCH /api/app/drill-sessions/[sessionId] - Update session progress (save current position)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify session belongs to user
    const existingSession = await prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession || existingSession.userId !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { currentCardIndex, reviewedCardIds, cardsReviewed, belumHafalCount, hafalCount } = body;

    // Build update data - only include provided fields
    const updateData: {
      currentCardIndex?: number;
      reviewedCardIds?: string[];
      cardsReviewed?: number;
      belumHafalCount?: number;
      hafalCount?: number;
    } = {};

    if (typeof currentCardIndex === 'number') {
      updateData.currentCardIndex = currentCardIndex;
    }
    if (Array.isArray(reviewedCardIds)) {
      updateData.reviewedCardIds = reviewedCardIds;
    }
    if (typeof cardsReviewed === 'number') {
      updateData.cardsReviewed = cardsReviewed;
    }
    if (typeof belumHafalCount === 'number') {
      updateData.belumHafalCount = belumHafalCount;
    }
    if (typeof hafalCount === 'number') {
      updateData.hafalCount = hafalCount;
    }

    // Update study session progress
    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error updating study session progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to update study session progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/app/drill-sessions/[sessionId] - Complete study session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify session belongs to user
    const existingSession = await prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession || existingSession.userId !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Parse request body (optional)
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // No body is fine, just mark as completed
    }

    // Extract valid fields from body
    const { cardsReviewed, belumHafalCount, hafalCount, averageResponseTime } = body as {
      cardsReviewed?: number;
      belumHafalCount?: number;
      hafalCount?: number;
      averageResponseTime?: number;
    };

    // Update study session to completed
    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        isCompleted: true,
        ...(typeof cardsReviewed === 'number' && { cardsReviewed }),
        ...(typeof belumHafalCount === 'number' && { belumHafalCount }),
        ...(typeof hafalCount === 'number' && { hafalCount }),
        ...(typeof averageResponseTime === 'number' && { averageResponseTime }),
      },
    });

    console.log('Completed study session:', sessionId);

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error completing study session:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete study session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
