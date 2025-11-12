import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateObjectiveDetectionPrompt,
  initializeObjectives,
  ObjectiveTracking,
  Message,
} from '@/lib/ai/objective-detection';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest, { params }: { params: { attemptId: string } }) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { newUserMessage, newAssistantMessage } = body;

    if (!newUserMessage || !newAssistantMessage) {
      return NextResponse.json({ error: 'Missing required messages' }, { status: 400 });
    }

    // Get attempt with task and user verification
    const attempt = await prisma.taskAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        task: true,
        user: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Task attempt not found' }, { status: 404 });
    }

    // Verify user owns this attempt
    if (attempt.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get conversation history
    const history = (attempt.conversationHistory as { messages: Message[] }).messages || [];

    // Add new messages to history for analysis
    const updatedHistory: Message[] = [
      ...history,
      { role: 'user', content: newUserMessage },
      { role: 'assistant', content: newAssistantMessage },
    ];

    // Get current objective status or initialize
    let currentObjectives = attempt.objectiveCompletionStatus as ObjectiveTracking[] | null;
    if (!currentObjectives) {
      currentObjectives = initializeObjectives(attempt.task.learningObjectives);
    }

    // Call OpenAI for objective detection
    console.log('[detect-objectives] Calling OpenAI for detection...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an objective completion detector for Japanese language learning. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: generateObjectiveDetectionPrompt(
            attempt.task,
            updatedHistory,
            currentObjectives
          ),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent detection
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    console.log('[detect-objectives] Detection result:', {
      objectivesCount: result.objectives?.length,
      allCompleted: result.allCompleted,
      confidence: result.overallConfidence,
    });

    // Update attempt with new objective status
    const updatedObjectives = result.objectives as ObjectiveTracking[];

    await prisma.taskAttempt.update({
      where: { id: params.attemptId },
      data: {
        objectiveCompletionStatus: updatedObjectives,
        totalMessages: attempt.totalMessages + 2, // User + assistant
      },
    });

    // Determine newly completed objectives
    const newlyCompleted = updatedObjectives
      .filter((obj, i) => {
        const wasCompleted = currentObjectives?.[i]?.status === 'completed';
        const isNowCompleted = obj.status === 'completed';
        return !wasCompleted && isNowCompleted;
      })
      .map(obj => obj.objectiveId);

    console.log('[detect-objectives] Newly completed:', newlyCompleted);

    return NextResponse.json({
      objectives: updatedObjectives,
      newlyCompleted,
      allCompleted: result.allCompleted || false,
      confidence: result.overallConfidence || 0,
    });
  } catch (error) {
    console.error('[detect-objectives] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect objectives',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
