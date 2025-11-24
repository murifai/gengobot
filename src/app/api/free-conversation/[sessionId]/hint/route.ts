// Hint generation API for free conversation
import 'openai/shims/node';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { MODELS } from '@/lib/ai/openai-client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/free-conversation/[sessionId]/hint
 * Generate a helpful hint based on conversation context with character
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { lastMessage } = body;

    if (!lastMessage) {
      return NextResponse.json({ error: 'Last message is required' }, { status: 400 });
    }

    // Get session with character info
    const session = await prisma.freeConversation.findUnique({
      where: { id: sessionId },
      include: {
        character: true,
        user: true,
      },
    });

    if (!session || !session.character) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const character = session.character;
    const userLevel = session.user.proficiency || 'N5';
    const relationshipContext =
      character.relationshipType === 'lainnya'
        ? character.relationshipCustom || character.relationshipType
        : character.relationshipType || 'teman';

    // Generate hint based on character context
    const hintPrompt = `Based on this conversation with a ${relationshipContext}, provide a helpful hint in Indonesian for a Japanese language learner.

Character: ${character.name}
Relationship: ${relationshipContext}
Speaking Style: ${character.speakingStyle || 'Natural and friendly'}
Last message from character: ${lastMessage}
Student level: ${userLevel}

Generate a short hint in Indonesian with this format:
"Kamu bisa respon seperti ... atau ... Coba gunakan kosakata seperti ..."

The hint should:
- Be in Indonesian (not Japanese)
- Suggest 2-3 example responses appropriate for the relationship type (${relationshipContext})
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
    console.error('Free conversation hint API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate hint',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
