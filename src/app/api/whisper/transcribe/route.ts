// Simple Whisper transcription endpoint
// Returns only the transcript text, no AI processing

// MUST import OpenAI shims first before any other imports
import 'openai/shims/node';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/whisper/transcribe
 * Transcribe audio using Whisper API
 * Returns only the transcript text
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    console.log('[Whisper Transcribe] Processing audio:', {
      size: audioFile.size,
      type: audioFile.type,
    });

    // Transcribe using Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ja', // Japanese
      response_format: 'json',
    });

    console.log('[Whisper Transcribe] Result:', transcription.text);

    return NextResponse.json({
      transcript: transcription.text,
    });
  } catch (error) {
    console.error('[Whisper Transcribe] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Transcription failed',
      },
      { status: 500 }
    );
  }
}
