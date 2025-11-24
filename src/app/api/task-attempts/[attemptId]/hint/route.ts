// Hint generation API for task-based conversations
import 'openai/shims/node';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { MODELS } from '@/lib/ai/openai-client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/task-attempts/[attemptId]/hint
 * Generate a helpful hint based on conversation context
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();
    const { lastMessage, currentObjective } = body;

    if (!lastMessage) {
      return NextResponse.json({ error: 'Last message is required' }, { status: 400 });
    }

    // Get task attempt with user info
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

    const userLevel = attempt.user.proficiency || 'N5';

    // Generate hint prompt
    const hintPrompt = `Based on this conversation context, provide a helpful hint in Indonesian for a Japanese language learner.

Last message from AI: ${lastMessage}
${currentObjective ? `Current objective: ${currentObjective}` : ''}
Student level: ${userLevel}
Task scenario: ${attempt.task.scenario}

Generate a short hint in Indonesian with this format:
"Kamu bisa respon seperti ... atau ... Coba gunakan kosakata seperti ..."

The hint should:
- Be in Indonesian (not Japanese)
- Suggest 2-3 example responses the student could use
- Include relevant vocabulary or grammar patterns
- Be encouraging and educational
- Match the student's proficiency level (${userLevel})`;

    const response = await openai.chat.completions.create({
      model: MODELS.ANALYSIS,
      messages: [
        {
          role: 'system',
          content:
            'You are a Japanese language learning assistant providing hints in Indonesian to help students respond in conversations.',
        },
        { role: 'user', content: hintPrompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const hint =
      response.choices[0]?.message?.content ||
      'Coba jawab dengan sopan menggunakan kata-kata yang sesuai dengan situasi.';

    return NextResponse.json({ hint });
  } catch (error) {
    console.error('Hint API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate hint',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
