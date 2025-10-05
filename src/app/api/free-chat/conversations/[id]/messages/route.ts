import { NextRequest, NextResponse } from 'next/server';
import { FreeChatConversationService } from '@/lib/character/conversation-service';
import { CharacterService } from '@/lib/character/character-service';
import { generateFreeChatResponse } from '@/lib/ai/free-chat-service';

// GET /api/free-chat/conversations/[id]/messages - Get conversation history
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    const messages = await FreeChatConversationService.getConversationHistory(
      id,
      limit ? parseInt(limit) : undefined
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/free-chat/conversations/[id]/messages - Add message to conversation
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Add user message
    await FreeChatConversationService.addMessage(id, {
      role: 'user',
      content,
    });

    // Get conversation to get character info
    const conversation = await FreeChatConversationService.getConversationById(id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get character for AI response
    const character = await CharacterService.getCharacterById(conversation.characterId);
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Generate AI response
    const aiResponse = await generateFreeChatResponse({
      character,
      conversationHistory: conversation.messages,
      userMessage: content,
    });

    // Add AI response
    const updatedConversation = await FreeChatConversationService.addMessage(id, {
      role: 'assistant',
      content: aiResponse,
    });

    return NextResponse.json({ conversation: updatedConversation });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
}

// DELETE /api/free-chat/conversations/[id]/messages - Clear messages
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversation = await FreeChatConversationService.clearMessages(id);

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error clearing messages:', error);
    return NextResponse.json({ error: 'Failed to clear messages' }, { status: 500 });
  }
}
