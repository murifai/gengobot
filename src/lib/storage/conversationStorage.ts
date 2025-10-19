/**
 * Conversation Storage Service
 * Handles task-based conversation history persistence and retrieval
 */

import { PrismaClient, Prisma } from '@prisma/client';
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface ConversationData {
  id: string;
  type: 'task-based' | 'free-chat';
  userId: string;
  taskId?: string;
  characterId?: string;
  messages: Message[];
  assessment?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationFilter {
  userId?: string;
  taskId?: string;
  type?: 'task-based' | 'free-chat';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Create a new conversation record
 */
export async function createConversation(data: {
  userId: string;
  type: 'task-based' | 'free-chat';
  taskId?: string;
  characterId?: string;
  initialMessage?: Message;
}): Promise<ConversationData> {
  const conversation = await prisma.conversation.create({
    data: {
      userId: data.userId,
      type: data.type,
      taskId: data.taskId,
      characterId: data.characterId,
      messages: (data.initialMessage ? [data.initialMessage] : []) as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    id: conversation.id,
    type: conversation.type as 'task-based' | 'free-chat',
    userId: conversation.userId,
    taskId: conversation.taskId || undefined,
    characterId: conversation.characterId || undefined,
    messages: conversation.messages as unknown as Message[],
    assessment: conversation.assessment as Record<string, unknown> | undefined,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

/**
 * Add a message to an existing conversation
 */
export async function addMessage(
  conversationId: string,
  message: Message
): Promise<ConversationData> {
  // Get current conversation
  const current = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!current) {
    throw new Error(`Conversation ${conversationId} not found`);
  }

  // Append new message
  const messages = current.messages as unknown as Message[];
  messages.push(message);

  // Update conversation
  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      messages: messages as unknown as Prisma.InputJsonValue,
      updatedAt: new Date(),
    },
  });

  return {
    id: updated.id,
    type: updated.type as 'task-based' | 'free-chat',
    userId: updated.userId,
    taskId: updated.taskId || undefined,
    characterId: updated.characterId || undefined,
    messages: updated.messages as unknown as Message[],
    assessment: updated.assessment as Record<string, unknown> | undefined,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId: string): Promise<ConversationData | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user: true,
      task: true,
      character: true,
    },
  });

  if (!conversation) {
    return null;
  }

  return {
    id: conversation.id,
    type: conversation.type as 'task-based' | 'free-chat',
    userId: conversation.userId,
    taskId: conversation.taskId || undefined,
    characterId: conversation.characterId || undefined,
    messages: conversation.messages as unknown as Message[],
    assessment: conversation.assessment as Record<string, unknown> | undefined,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

/**
 * Get conversations with filtering
 */
export async function getConversations(filter: ConversationFilter): Promise<ConversationData[]> {
  const where: Record<string, unknown> = {};

  if (filter.userId) where.userId = filter.userId;
  if (filter.taskId) where.taskId = filter.taskId;
  if (filter.type) where.type = filter.type;
  if (filter.startDate || filter.endDate) {
    const createdAt: Record<string, Date> = {};
    if (filter.startDate) createdAt.gte = filter.startDate;
    if (filter.endDate) createdAt.lte = filter.endDate;
    where.createdAt = createdAt;
  }

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filter.limit || 50,
    skip: filter.offset || 0,
  });

  return conversations.map(conv => ({
    id: conv.id,
    type: conv.type as 'task-based' | 'free-chat',
    userId: conv.userId,
    taskId: conv.taskId || undefined,
    characterId: conv.characterId || undefined,
    messages: conv.messages as unknown as Message[],
    assessment: conv.assessment as Record<string, unknown> | undefined,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  }));
}

/**
 * Update conversation assessment
 */
export async function updateAssessment(
  conversationId: string,
  assessment: Record<string, unknown>
): Promise<ConversationData> {
  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      assessment: assessment as unknown as Prisma.InputJsonValue,
      updatedAt: new Date(),
    },
  });

  return {
    id: updated.id,
    type: updated.type as 'task-based' | 'free-chat',
    userId: updated.userId,
    taskId: updated.taskId || undefined,
    characterId: updated.characterId || undefined,
    messages: updated.messages as unknown as Message[],
    assessment: updated.assessment as Record<string, unknown> | undefined,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  await prisma.conversation.delete({
    where: { id: conversationId },
  });
}

/**
 * Get conversation statistics
 */
export async function getConversationStats(userId: string) {
  const [total, taskBased, freeChat] = await Promise.all([
    prisma.conversation.count({ where: { userId } }),
    prisma.conversation.count({ where: { userId, type: 'task-based' } }),
    prisma.conversation.count({ where: { userId, type: 'free-chat' } }),
  ]);

  return {
    total,
    taskBased,
    freeChat,
  };
}
