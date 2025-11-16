import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// PUT /api/app/drill-sessions/[sessionId] - Update/complete study session
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

    // Parse request body (optional)
    let body = {};
    try {
      body = await request.json();
    } catch {
      // No body is fine, just mark as completed
    }

    // Update study session
    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date().toISOString(),
        isCompleted: true,
        ...(body as object),
      },
    });

    console.log('Completed study session:', sessionId);

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error updating study session:', error);
    return NextResponse.json(
      {
        error: 'Failed to update study session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
