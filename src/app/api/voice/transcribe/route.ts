// API Route: Speech-to-Text using Whisper
import { NextRequest, NextResponse } from 'next/server';
import { whisperService } from '@/lib/voice/whisper-service';
import { auth } from '@/lib/auth/auth';
import { UsageType } from '@prisma/client';
import { creditService } from '@/lib/subscription';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    // Check user authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get audio file from form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const taskScenario = formData.get('taskScenario') as string | null;
    const expectedPhrases = formData.get('expectedPhrases') as string | null;
    const userLevel = formData.get('userLevel') as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Estimate duration from file size (rough estimate: ~16KB per second for webm)
    const estimatedSeconds = Math.max(1, Math.ceil(audioFile.size / 16000));

    // Check credits before transcription
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

    // Validate audio file
    const validation = whisperService.validateAudioFile(audioFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Prepare context for better transcription accuracy
    const context = {
      taskScenario: taskScenario || undefined,
      expectedPhrases: expectedPhrases ? JSON.parse(expectedPhrases) : undefined,
      userLevel: userLevel || undefined,
    };

    // Transcribe audio
    const result = await whisperService.transcribeJapanese(audioFile, context);

    // Log transcription for analytics
    console.log('[Whisper] Transcription completed:', {
      textLength: result.text.length,
      duration: result.duration,
      language: result.language,
    });

    // Deduct credits based on actual duration
    const actualDurationSeconds = Math.ceil(result.duration || estimatedSeconds);
    await creditService.deductCredits(
      session.user.id,
      UsageType.VOICE_STANDARD,
      actualDurationSeconds,
      undefined, // referenceId
      'voice_transcription'
    );

    return NextResponse.json({
      success: true,
      transcript: result.text,
      language: result.language,
      duration: result.duration,
      segments: result.segments,
      creditsUsed: creditCheck.creditsRequired,
    });
  } catch (error) {
    console.error('[Whisper API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Transcription failed',
      },
      { status: 500 }
    );
  }
}

// GET: Check service status
export async function GET() {
  return NextResponse.json({
    service: 'Whisper Speech-to-Text',
    status: 'operational',
    supportedFormats: ['mp3', 'wav', 'webm', 'ogg', 'm4a', 'mp4'],
    maxFileSize: '25MB',
    language: 'Japanese (ja)',
  });
}
