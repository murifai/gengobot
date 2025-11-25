import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// PUT /api/free-conversation/session/[sessionId] - Update session (e.g., reset chat)
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
    const body = await request.json();

    const updatedSession = await prisma.freeConversation.update({
      where: { id: sessionId },
      data: body,
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error updating free conversation session:', error);
    return NextResponse.json(
      {
        error: 'Failed to update session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/free-conversation/session/[sessionId] - Delete a chatroom session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Verify the session exists and belongs to the user
    const existingSession = await prisma.freeConversation.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify ownership - check if the session's user email matches the authenticated user
    if (existingSession.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only delete your own chatrooms' },
        { status: 403 }
      );
    }

    // Delete the session
    await prisma.freeConversation.delete({
      where: { id: sessionId },
    });

    console.log('Deleted free conversation session:', {
      sessionId,
      userId: existingSession.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Chatroom deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting free conversation session:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
