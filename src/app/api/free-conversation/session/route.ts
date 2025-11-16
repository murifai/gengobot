import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// POST /api/free-conversation/session - Create or get active free conversation session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    // Check if user has an active (non-completed) free conversation session
    const existingSession = await prisma.freeConversation.findFirst({
      where: {
        userId,
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    if (existingSession) {
      return NextResponse.json({ session: existingSession });
    }

    // Create new free conversation session
    const newSession = await prisma.freeConversation.create({
      data: {
        userId,
        startTime: new Date().toISOString(),
        conversationHistory: {
          messages: [],
          startedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Error in free conversation session API:', error);
    return NextResponse.json(
      {
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
