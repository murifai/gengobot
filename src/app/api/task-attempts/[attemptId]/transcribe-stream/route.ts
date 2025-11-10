// Real-time transcription API using Whisper
// Processes audio chunks during recording for live transcription

// MUST import OpenAI shims first before any other imports
import 'openai/shims/node';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/task-attempts/[attemptId]/transcribe-stream
 * Transcribe audio chunk in real-time using Whisper API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const formData = await request.formData();
    const audioChunk = formData.get('audio') as File;

    if (!audioChunk) {
      return NextResponse.json({ error: 'Audio chunk is required' }, { status: 400 });
    }

    console.log('[Transcribe Stream] Processing chunk:', {
      attemptId,
      size: audioChunk.size,
      type: audioChunk.type,
    });

    // Transcribe using Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioChunk,
      model: 'whisper-1',
      language: 'ja', // Japanese
      response_format: 'json',
    });

    console.log('[Transcribe Stream] Result:', transcription.text);

    return NextResponse.json({
      success: true,
      text: transcription.text,
    });
  } catch (error) {
    console.error('[Transcribe Stream] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Transcription failed',
      },
      { status: 500 }
    );
  }
}
