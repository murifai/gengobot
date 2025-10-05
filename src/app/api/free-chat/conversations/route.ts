import { NextRequest, NextResponse } from 'next/server';
import { FreeChatConversationService } from '@/lib/character/conversation-service';

// GET /api/free-chat/conversations - Get conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const characterId = searchParams.get('characterId');
    const query = searchParams.get('query');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let conversations;

    if (query) {
      conversations = await FreeChatConversationService.searchConversations(userId, query);
    } else if (characterId) {
      conversations = await FreeChatConversationService.getCharacterConversations(
        userId,
        characterId
      );
    } else {
      conversations = await FreeChatConversationService.getUserConversations(userId);
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/free-chat/conversations - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, characterId } = body;

    if (!userId || !characterId) {
      return NextResponse.json({ error: 'User ID and Character ID are required' }, { status: 400 });
    }

    const conversation = await FreeChatConversationService.getOrCreateConversation(
      userId,
      characterId
    );

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
