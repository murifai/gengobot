// Text message API for task conversations
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateConversationProgress } from '@/lib/tasks/conversation-guidance';
import type { TaskConversationContext } from '@/lib/tasks/conversation-guidance';
import getOpenAIClient from '@/lib/ai/openai-client';

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
        task: {
          include: {
            character: true,
          },
        },
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
    const successCriteria = (attempt.task.successCriteria as string[]) || [];

    const context: TaskConversationContext = {
      taskId: attempt.taskId,
      userId: attempt.userId,
      attemptId: attempt.id,
      difficulty: attempt.task.difficulty,
      category: attempt.task.category,
      scenario: attempt.task.scenario,
      learningObjectives,
      successCriteria,
      currentObjective: completedObjectives.length,
      completedObjectives,
      conversationHistory: messages as {
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: string;
      }[],
      userProficiency: attempt.user.proficiency,
      characterPersonality: attempt.task.character?.personality as
        | Record<string, unknown>
        | undefined,
      estimatedDuration: attempt.task.estimatedDuration,
      elapsedMinutes: Math.round(
        (new Date().getTime() - new Date(attempt.startTime).getTime()) / 60000
      ),
    };

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Evaluate conversation progress
    const guidance = evaluateConversationProgress(context);

    // Generate AI response using OpenAI
    const conversationMessages = [...messages, userMessage];

    const systemPrompt = `You are a Japanese language teacher conducting a task-based conversation.
Scenario: ${attempt.task.scenario}
Learning Objectives: ${learningObjectives.join(', ')}
Student Level: ${attempt.user.proficiency}
Difficulty: ${attempt.task.difficulty}

Help the student practice Japanese conversation naturally while working towards the learning objectives.
Respond in Japanese, keeping the conversation engaging and educational.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    let aiResponseText =
      completion.choices[0]?.message?.content || 'すみません、もう一度お願いします。';

    // Add guidance if needed
    if (guidance.message && guidance.guidanceType !== 'none') {
      aiResponseText += `\n\n${guidance.message}`;
    }

    // Add assistant message
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponseText,
      timestamp: new Date().toISOString(),
      metadata: {
        hintProvided: guidance.shouldProvideHint,
        objectiveCompleted: guidance.objectiveStatus?.completed
          ? guidance.objectiveStatus.current
          : undefined,
      },
    };

    // Update conversation history
    const updatedMessages = [...messages, userMessage, assistantMessage];
    const updatedCompletedObjectives = guidance.objectiveStatus?.completed
      ? [...completedObjectives, guidance.objectiveStatus.current]
      : completedObjectives;

    const updatedHistory = {
      messages: updatedMessages,
      completedObjectives: updatedCompletedObjectives,
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
      guidance: {
        type: guidance.guidanceType,
        message: guidance.message,
        shouldProvideHint: guidance.shouldProvideHint,
        objectiveStatus: guidance.objectiveStatus,
      },
      progress: {
        completedObjectives: updatedCompletedObjectives.length,
        totalObjectives: learningObjectives.length,
        percentage: Math.round(
          (updatedCompletedObjectives.length / learningObjectives.length) * 100
        ),
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
