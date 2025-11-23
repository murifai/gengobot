// Text message API for task conversations
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTaskResponse } from '@/lib/ai/task-response-generator';

/**
 * POST /api/task-attempts/[attemptId]/message
 * Send a text message in a task conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get task attempt with full context
    const attempt = await prisma.taskAttempt.findUnique({
      where: { id: attemptId },
      include: {
        task: true,
        user: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Task attempt not found' }, { status: 404 });
    }

    if (attempt.isCompleted) {
      return NextResponse.json({ error: 'Task attempt already completed' }, { status: 400 });
    }

    // Build conversation context
    const conversationHistory = attempt.conversationHistory as {
      messages?: Array<{
        role: string;
        content: string;
        timestamp: string;
      }>;
      completedObjectives?: string[];
      startedAt?: string;
    };

    const messages = conversationHistory?.messages || [];
    const completedObjectives = conversationHistory?.completedObjectives || [];
    const learningObjectives = (attempt.task.learningObjectives as string[]) || [];

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Generate AI response using the task response generator
    const aiResponseText = await generateTaskResponse(
      {
        scenario: attempt.task.scenario,
        category: attempt.task.category,
        learningObjectives,
        difficulty: attempt.task.difficulty,
        userProficiency: attempt.user.proficiency,
      },
      {
        messages: messages as Array<{
          role: 'user' | 'assistant' | 'system';
          content: string;
          timestamp: string;
        }>,
        completedObjectives,
      },
      message.trim()
    );

    // Add assistant message
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponseText,
      timestamp: new Date().toISOString(),
    };

    // Update conversation history
    const updatedMessages = [...messages, userMessage, assistantMessage];

    const updatedHistory = {
      messages: updatedMessages,
      completedObjectives: completedObjectives,
      startedAt: conversationHistory?.startedAt || new Date().toISOString(),
    };

    // Update the attempt in database
    const updatedAttempt = await prisma.taskAttempt.update({
      where: { id: attemptId },
      data: {
        conversationHistory: updatedHistory as never,
      },
      include: {
        task: true,
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt,
      progress: {
        completedObjectives: completedObjectives.length,
        totalObjectives: learningObjectives.length,
        percentage: Math.round((completedObjectives.length / learningObjectives.length) * 100),
        messageCount: updatedMessages.length,
      },
    });
  } catch (error) {
    console.error('Message error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
