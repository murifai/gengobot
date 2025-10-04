// API Route: Speech-to-Text using Whisper
import { NextRequest, NextResponse } from 'next/server';
import { whisperService } from '@/lib/voice/whisper-service';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    // Get audio file from form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const taskScenario = formData.get('taskScenario') as string | null;
    const expectedPhrases = formData.get('expectedPhrases') as string | null;
    const userLevel = formData.get('userLevel') as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      transcript: result.text,
      language: result.language,
      duration: result.duration,
      segments: result.segments,
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
