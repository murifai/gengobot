// API Route: Text-to-Speech using OpenAI TTS
// MUST import OpenAI shims first before any other imports
import 'openai/shims/node';

import { NextRequest, NextResponse } from 'next/server';
import { ttsService, TTSVoice } from '@/lib/voice/tts-service';
import { auth } from '@/lib/auth/auth';
import { UsageType } from '@prisma/client';
import { creditService } from '@/lib/subscription';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Check user authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      text,
      voice = 'nova',
      speed = 1.0,
      format = 'mp3',
      userLevel,
      personality,
      mode = 'standard', // 'standard' | 'learning' | 'personality'
    } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 4096 characters' },
        { status: 400 }
      );
    }

    // Check credits before synthesis (estimate based on character count)
    const estimatedSeconds = Math.ceil(text.length / 15); // ~15 chars/sec for Japanese
    const creditCheck = await creditService.checkCredits(
      session.user.id,
      UsageType.VOICE_STANDARD,
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

    let result;

    // Select synthesis mode
    switch (mode) {
      case 'learning':
        result = await ttsService.synthesizeForLearning(text, userLevel || 'N5', {
          voice: voice as TTSVoice,
          format,
          speed,
        });
        break;

      case 'personality':
        if (!personality) {
          return NextResponse.json(
            { error: 'Personality configuration required for personality mode' },
            { status: 400 }
          );
        }
        result = await ttsService.synthesizeWithPersonality(text, personality, { format, speed });
        break;

      case 'standard':
      default:
        result = await ttsService.synthesize(text, {
          voice: voice as TTSVoice,
          speed,
          format,
        });
        break;
    }

    // Deduct credits based on actual character count (usage-based billing)
    const creditResult = await creditService.deductCreditsFromUsage(
      session.user.id,
      {
        model: 'gpt-4o-mini-tts',
        characterCount: result.characterCount,
      },
      undefined, // referenceId
      'voice_synthesis',
      'Text-to-speech synthesis'
    );

    // Log synthesis for analytics
    console.log('[TTS] Speech synthesis completed:', {
      characterCount: result.characterCount,
      estimatedDuration: result.estimatedDuration,
      voice: result.voice,
      format: result.format,
      creditsDeducted: creditResult.credits,
      usdCost: creditResult.usdCost,
    });

    // Return audio as response
    // Convert Buffer to Uint8Array for NextResponse
    const audioBuffer = new Uint8Array(result.audio);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': `audio/${result.format}`,
        'Content-Length': result.audio.length.toString(),
        'X-Character-Count': result.characterCount.toString(),
        'X-Estimated-Duration': result.estimatedDuration.toString(),
        'X-Voice': result.voice,
      },
    });
  } catch (error) {
    console.error('[TTS API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Speech synthesis failed',
      },
      { status: 500 }
    );
  }
}

// GET: Check service status and available voices
export async function GET() {
  const recommendedVoices = ttsService.getRecommendedVoices();
  const voiceProfiles = recommendedVoices.map(voice => ({
    voice,
    profile: ttsService.getVoiceProfile(voice),
  }));

  return NextResponse.json({
    service: 'OpenAI Text-to-Speech',
    status: 'operational',
    supportedFormats: ['mp3', 'opus', 'aac', 'flac'],
    maxTextLength: 4096,
    recommendedVoices: voiceProfiles,
    speedRange: { min: 0.25, max: 4.0 },
    modes: ['standard', 'learning', 'personality'],
  });
}
