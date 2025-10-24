import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/study-sessions/[sessionId]
 * Get study session details
 */
export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id: params.sessionId },
      include: {
        deck: {
          include: {
            flashcards: {
              orderBy: { position: 'asc' },
            },
          },
        },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
        },
      },
    });

    if (!studySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify ownership
    if (studySession.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(studySession);
  } catch (error) {
    console.error('Error fetching study session:', error);
    return NextResponse.json({ error: 'Failed to fetch study session' }, { status: 500 });
  }
}

/**
 * PUT /api/study-sessions/[sessionId]
 * Complete study session
 */
export async function PUT(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id: params.sessionId },
    });

    if (!studySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify ownership
    if (studySession.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Mark session as completed
    const updatedSession = await prisma.studySession.update({
      where: { id: params.sessionId },
      data: {
        endTime: new Date(),
        isCompleted: true,
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error completing study session:', error);
    return NextResponse.json({ error: 'Failed to complete study session' }, { status: 500 });
  }
}
