// API endpoint to list free conversation sessions (Kaiwa Bebas)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { creditService, TIER_CONFIG } from '@/lib/subscription';

export const runtime = 'nodejs';

interface ConversationMessage {
  role: string;
  content: string;
  timestamp: string;
}

interface ConversationHistory {
  messages?: ConversationMessage[];
  startedAt?: string;
}

/**
 * GET /api/free-conversation/sessions?userId={userId}
 * List all free conversation sessions for a user with chatroom limit info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get user's subscription to check tier limits
    const subscription = await creditService.getOrCreateSubscription(userId);
    const tierConfig = TIER_CONFIG[subscription.tier];
    const maxChatrooms = tierConfig.maxChatrooms;

    // Fetch all sessions for this user with character info
    const sessions = await prisma.freeConversation.findMany({
      where: { userId },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            avatar: true,
            voice: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Filter out sessions with no messages and transform response
    const sessionsWithMessages = sessions
      .filter(session => {
        const history = session.conversationHistory as ConversationHistory;
        return history?.messages && history.messages.length > 0;
      })
      .map(session => {
        const history = session.conversationHistory as ConversationHistory;
        const messages = history?.messages || [];
        const lastMessage = messages[messages.length - 1];

        return {
          id: session.id,
          characterId: session.characterId,
          character: session.character,
          messageCount: messages.length,
          lastMessage: lastMessage
            ? {
                content:
                  lastMessage.content.length > 50
                    ? lastMessage.content.substring(0, 50) + '...'
                    : lastMessage.content,
                role: lastMessage.role,
                timestamp: lastMessage.timestamp,
              }
            : null,
          startTime: session.startTime,
          updatedAt: session.updatedAt,
        };
      });

    // Count total sessions (including empty ones for limit purposes)
    const totalSessionCount = sessions.length;

    return NextResponse.json({
      sessions: sessionsWithMessages,
      limit: maxChatrooms, // 0 = unlimited
      used: totalSessionCount,
      canCreate: maxChatrooms === 0 || totalSessionCount < maxChatrooms,
      tier: subscription.tier,
    });
  } catch (error) {
    console.error('[Free Conversation Sessions] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
