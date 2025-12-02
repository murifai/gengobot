import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { UsageType } from '@prisma/client';
import { creditService } from '@/lib/subscription';

// Character info for generating prompt
interface CharacterInfo {
  name: string;
  description: string | null;
  speakingStyle: string | null;
  relationshipType: string | null;
}

// Build character prompt for realtime session
function buildCharacterPrompt(character?: CharacterInfo): string {
  if (!character) {
    // Default prompt if no character provided
    return '日本語で短く答えて。1-2文で簡潔に。';
  }

  const parts: string[] = [];

  // Character identity
  parts.push(`あなたは「${character.name}」というキャラクターです。`);

  // Description
  if (character.description) {
    parts.push(`キャラクター説明: ${character.description}`);
  }

  // Relationship type
  if (character.relationshipType) {
    parts.push(`ユーザーとの関係性: ${character.relationshipType}`);
  }

  // Speaking style
  if (character.speakingStyle) {
    parts.push(`話し方: ${character.speakingStyle}`);
  }

  // General instructions
  parts.push(
    '日本語で会話してください。短く自然に答えて、1-3文で簡潔に。キャラクターの性格と話し方を一貫して維持してください。'
  );

  return parts.join('\n');
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  // Check user authentication and credits
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body for character info
  let character: CharacterInfo | undefined;
  try {
    const body = await request.json();
    character = body.character;
  } catch {
    // No body or invalid JSON - use default prompt
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

  // Build character-specific prompt
  const instructions = buildCharacterPrompt(character);
  console.log('[Realtime Session] Character:', character?.name || 'default');
  console.log('[Realtime Session] Instructions:', instructions);

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
        instructions,
        tool_choice: 'auto',
        // Force Japanese transcription for user audio input
        input_audio_transcription: { model: 'whisper-1', language: 'ja' },
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
