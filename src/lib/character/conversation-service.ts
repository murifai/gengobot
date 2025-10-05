// Free chat conversation service
import { prisma } from '@/lib/prisma';
import { FreeChatConversation, FreeChatMessage, ConversationState } from '@/types/character';

export class FreeChatConversationService {
  /**
   * Create a new free chat conversation
   */
  static async createConversation(
    userId: string,
    characterId: string
  ): Promise<FreeChatConversation> {
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        characterId,
        type: 'free-chat',
        messages: [],
      },
    });

    return this.mapToFreeChatConversation(conversation);
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(id: string): Promise<FreeChatConversation | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        character: true,
      },
    });

    if (!conversation) return null;
    return this.mapToFreeChatConversation(conversation);
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(userId: string): Promise<FreeChatConversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        type: 'free-chat',
      },
      include: {
        character: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return conversations.map(this.mapToFreeChatConversation);
  }

  /**
   * Get conversations by character
   */
  static async getCharacterConversations(
    userId: string,
    characterId: string
  ): Promise<FreeChatConversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        characterId,
        type: 'free-chat',
      },
      include: {
        character: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return conversations.map(this.mapToFreeChatConversation);
  }

  /**
   * Add message to conversation
   */
  static async addMessage(
    conversationId: string,
    message: Omit<FreeChatMessage, 'id' | 'timestamp'>
  ): Promise<FreeChatConversation> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = (conversation.messages as unknown as FreeChatMessage[]) || [];
    const newMessage: FreeChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...message,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messages: updatedMessages as unknown as object,
        updatedAt: new Date(),
      },
    });

    return this.mapToFreeChatConversation(updated);
  }

  /**
   * Get conversation state
   */
  static async getConversationState(conversationId: string): Promise<ConversationState | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return null;

    const messages = (conversation.messages as unknown as FreeChatMessage[]) || [];
    const lastMessage = messages[messages.length - 1];

    return {
      conversationId: conversation.id,
      characterId: conversation.characterId!,
      messages: messages as FreeChatMessage[],
      isActive: true,
      lastMessageAt: lastMessage?.timestamp || conversation.updatedAt,
    };
  }

  /**
   * Delete conversation
   */
  static async deleteConversation(id: string): Promise<void> {
    await prisma.conversation.delete({
      where: { id },
    });
  }

  /**
   * Clear conversation messages (keep conversation)
   */
  static async clearMessages(id: string): Promise<FreeChatConversation> {
    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        messages: [],
        updatedAt: new Date(),
      },
    });

    return this.mapToFreeChatConversation(updated);
  }

  /**
   * Get active conversation for user and character
   */
  static async getActiveConversation(
    userId: string,
    characterId: string
  ): Promise<FreeChatConversation | null> {
    const conversation = await prisma.conversation.findFirst({
      where: {
        userId,
        characterId,
        type: 'free-chat',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        character: true,
      },
    });

    if (!conversation) return null;
    return this.mapToFreeChatConversation(conversation);
  }

  /**
   * Get or create conversation for user and character
   */
  static async getOrCreateConversation(
    userId: string,
    characterId: string
  ): Promise<FreeChatConversation> {
    // Try to find existing active conversation
    const existing = await this.getActiveConversation(userId, characterId);

    if (existing) {
      return existing;
    }

    // Create new conversation
    return this.createConversation(userId, characterId);
  }

  /**
   * Map Prisma conversation to FreeChatConversation type
   */
  private static mapToFreeChatConversation(
    conversation: Record<string, unknown>
  ): FreeChatConversation {
    return {
      id: conversation.id as string,
      userId: conversation.userId as string,
      characterId: conversation.characterId as string,
      messages: (conversation.messages as unknown as FreeChatMessage[]) || [],
      createdAt: conversation.createdAt as Date,
      updatedAt: conversation.updatedAt as Date,
    };
  }

  /**
   * Get conversation history (last N messages)
   */
  static async getConversationHistory(
    conversationId: string,
    limit: number = 20
  ): Promise<FreeChatMessage[]> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return [];

    const messages = (conversation.messages as unknown as FreeChatMessage[]) || [];
    return messages.slice(-limit);
  }

  /**
   * Search conversations by content
   */
  static async searchConversations(userId: string, query: string): Promise<FreeChatConversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        type: 'free-chat',
      },
      include: {
        character: true,
      },
    });

    // Filter conversations that contain the query in messages
    const filtered = conversations.filter(conv => {
      const messages = (conv.messages as unknown as FreeChatMessage[]) || [];
      return messages.some(msg => msg.content.toLowerCase().includes(query.toLowerCase()));
    });

    return filtered.map(this.mapToFreeChatConversation);
  }
}
