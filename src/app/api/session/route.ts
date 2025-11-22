import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { UsageType } from '@prisma/client';
import { creditService } from '@/lib/subscription';

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  // Check user authentication and credits
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has credits for realtime (estimate 5 minutes minimum)
  const estimatedMinutes = 5;
  const estimatedSeconds = estimatedMinutes * 60;
  const creditCheck = await creditService.checkCredits(
    session.user.id,
    UsageType.REALTIME,
    estimatedSeconds
  );

  if (!creditCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Insufficient credits',
        message: creditCheck.reason,
        creditsRequired: creditCheck.creditsRequired,
        creditsAvailable: creditCheck.creditsAvailable,
        isTrialUser: creditCheck.isTrialUser,
      },
      { status: 402 }
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-realtime-mini-2025-10-06',
        voice: 'alloy',
        modalities: ['audio', 'text'],
        instructions: '関西弁で短く答えて。1-2文で簡潔に。',
        tool_choice: 'auto',
        // turn_detection disabled for Push-to-Talk mode (saves ~50-75% on audio tokens)
        // User will manually control when to record audio
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to create session',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
