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

    // Get userId and characterId from request body
    let userId: string;
    let characterId: string | undefined;
    try {
      const body = await request.json();
      userId = body.userId;
      characterId = body.characterId;
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!characterId) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify character exists
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      console.error('Character not found in database:', characterId);
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Check if user has an active session with this specific character
    const existingSession = await prisma.freeConversation.findFirst({
      where: {
        userId,
        characterId,
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        character: true,
      },
    });

    if (existingSession) {
      console.log('Returning existing free conversation session:', {
        sessionId: existingSession.id,
        character: character.name,
      });
      return NextResponse.json({ session: existingSession });
    }

    // Create new free conversation session with character
    const newSession = await prisma.freeConversation.create({
      data: {
        userId,
        characterId,
        startTime: new Date().toISOString(),
        conversationHistory: {
          messages: [],
          startedAt: new Date().toISOString(),
        },
      },
      include: {
        character: true,
      },
    });

    console.log('Created new free conversation session:', {
      sessionId: newSession.id,
      character: character.name,
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
