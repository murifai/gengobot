// Voice-enabled task conversation API
// Phase 3.3: Voice Interaction System

// MUST import OpenAI shims first before any other imports
import 'openai/shims/node';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskVoiceService } from '@/lib/voice/task-voice-service';
import { generateTaskResponse } from '@/lib/ai/task-response-generator';

/**
 * POST /api/task-attempts/[attemptId]/voice
 * Process voice input for task conversation
 *
 * Body: FormData with 'audio' file and optional configuration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    // Get task attempt with full context
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

    if (attempt.isCompleted) {
      return NextResponse.json({ error: 'Task attempt already completed' }, { status: 400 });
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    console.log('Voice endpoint - received formData:', {
      hasAudio: !!audioFile,
      audioType: audioFile?.type,
      audioSize: audioFile?.size,
      formDataKeys: Array.from(formData.keys()),
    });

    if (!audioFile) {
      console.error('Voice endpoint - No audio file in formData');
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Build conversation context
    const conversationHistory = attempt.conversationHistory as {
      messages?: unknown[];
      completedObjectives?: string[];
      startedAt?: string;
    };

    const messages = conversationHistory?.messages || [];
    const completedObjectives = conversationHistory?.completedObjectives || [];
    const learningObjectives = (attempt.task.learningObjectives as string[]) || [];

    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type,
    });

    console.log('Attempting transcription with blob:', {
      size: audioBlob.size,
      type: audioBlob.type,
    });

    // Transcribe audio
    let transcription;
    try {
      // Convert Blob to File for Whisper service
      const audioFile = new File([await audioBlob.arrayBuffer()], 'recording.webm', {
        type: audioBlob.type || 'audio/webm',
      });

      transcription = await taskVoiceService.transcribeAudio(audioFile);
    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
      return NextResponse.json(
        {
          error: 'Transcription service error',
          message:
            transcriptionError instanceof Error
              ? transcriptionError.message
              : 'Unknown transcription error',
        },
        { status: 500 }
      );
    }

    if (!transcription.success) {
      return NextResponse.json(
        {
          error: 'Transcription failed',
          message: transcription.error,
        },
        { status: 500 }
      );
    }

    // Validate transcription quality
    // Note: transcription.duration is in seconds, convert to milliseconds
    const validation = taskVoiceService.validateRecording({
      audioDuration: transcription.duration * 1000,
      voiceActivityDetected: transcription.transcript.length > 0,
      transcriptionConfidence: transcription.confidence,
    });

    if (!validation.isValid) {
      console.error('Recording validation failed:', validation);
      return NextResponse.json(
        {
          error: 'Recording validation failed',
          warnings: validation.warnings,
          transcript: transcription.transcript,
          validation: validation,
        },
        { status: 400 }
      );
    }

    // Add user message to conversation
    const userMessage = {
      role: 'user' as const,
      content: transcription.transcript,
      timestamp: new Date().toISOString(),
      voiceMetadata: {
        audioDuration: transcription.duration,
        voiceActivityDetected: true,
        transcriptionConfidence: transcription.confidence,
      },
    };

    // Generate AI response using the task response generator
    const aiResponseText = await generateTaskResponse(
      {
        scenario: attempt.task.scenario,
        category: attempt.task.category,
        learningObjectives,
        difficulty: attempt.task.difficulty,
        userProficiency: attempt.user.proficiency,
      },
      {
        messages: messages as Array<{
          role: 'user' | 'assistant' | 'system';
          content: string;
          timestamp: string;
        }>,
        completedObjectives,
      },
      transcription.transcript
    );

    // Synthesize AI response
    // Cast task to access voice/speakingSpeed fields added in schema migration
    const taskWithVoice = attempt.task as typeof attempt.task & {
      voice?: string;
      speakingSpeed?: number;
    };
    const synthesis = await taskVoiceService.synthesizeResponse(
      aiResponseText,
      {
        voice: taskWithVoice.voice,
        speakingSpeed: taskWithVoice.speakingSpeed,
      },
      attempt.user.proficiency
    );

    if (!synthesis.success) {
      return NextResponse.json(
        {
          error: 'Speech synthesis failed',
          message: synthesis.error,
        },
        { status: 500 }
      );
    }

    // Add assistant message to conversation (without audio URL since it's temporary)
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponseText,
      timestamp: new Date().toISOString(),
      voiceMetadata: {
        // Don't store audio URL - client gets temporary blob
        audioDuration: synthesis.duration || 0,
      },
    };

    // Update conversation history
    const updatedMessages = [...messages, userMessage, assistantMessage];

    // Build the update object with proper typing
    const updatedHistory = {
      messages: updatedMessages,
      completedObjectives: completedObjectives,
      startedAt: conversationHistory?.startedAt || new Date().toISOString(),
    };

    await prisma.taskAttempt.update({
      where: { id: attemptId },
      data: {
        conversationHistory: updatedHistory as never,
      },
    });

    // Convert audio blob to base64 for transmission
    // Client will create temporary blob URL and revoke after playback
    const audioBuffer = await synthesis.audioBlob?.arrayBuffer();
    const audioBase64 = audioBuffer ? Buffer.from(audioBuffer).toString('base64') : undefined;

    // Return response with temporary audio data
    return NextResponse.json({
      success: true,
      transcription: {
        text: transcription.transcript,
        confidence: transcription.confidence,
        duration: transcription.duration,
      },
      response: {
        text: aiResponseText,
        audioData: audioBase64, // Base64 audio for one-time playback
        audioType: 'audio/mpeg',
        duration: synthesis.duration,
      },
      progress: {
        completedObjectives: completedObjectives.length,
        totalObjectives: learningObjectives.length,
        percentage: Math.round((completedObjectives.length / learningObjectives.length) * 100),
        messageCount: updatedMessages.length,
      },
      validation: {
        isValid: validation.isValid,
        warnings: validation.warnings,
      },
    });
  } catch (error) {
    console.error('Voice conversation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Voice conversation processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/task-attempts/[attemptId]/voice
 * Get voice conversation configuration and status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

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

    // Get recommended voice configuration
    const recommendedConfig = {
      userLevel: attempt.user.proficiency,
      enableVoiceActivity: true,
      autoStopOnSilence: true,
      silenceDuration: 2000,
      maxRecordingDuration: 60000,
      voiceGuidance: true,
      audioFeedback: true,
      voicePersonality: {
        // Cast task to access voice/speakingSpeed fields added in schema migration
        voice: (attempt.task as typeof attempt.task & { voice?: string }).voice || 'nova',
        speed:
          (attempt.task as typeof attempt.task & { speakingSpeed?: number }).speakingSpeed ||
          getSpeedForLevel(attempt.user.proficiency),
      },
    };

    // Get conversation stats
    const conversationHistory = attempt.conversationHistory as {
      messages?: unknown[];
    };
    const messages = conversationHistory?.messages || [];
    const voiceMessages = (messages as Array<Record<string, unknown>>).filter(
      m => m.voiceMetadata !== undefined
    );

    return NextResponse.json({
      recommendedConfig,
      stats: {
        totalMessages: messages.length,
        voiceMessages: voiceMessages.length,
        textOnlyMessages: messages.length - voiceMessages.length,
        voiceUsagePercentage:
          messages.length > 0 ? Math.round((voiceMessages.length / messages.length) * 100) : 0,
      },
      capabilities: {
        transcription: true,
        synthesis: true,
        voiceActivity: true,
        audioFeedback: true,
        voiceGuidance: true,
      },
    });
  } catch (error) {
    console.error('Error getting voice configuration:', error);
    return NextResponse.json({ error: 'Failed to get voice configuration' }, { status: 500 });
  }
}

// Helper: Get speech speed based on JLPT level
function getSpeedForLevel(level: string): number {
  const speeds: Record<string, number> = {
    N5: 0.85,
    N4: 0.9,
    N3: 0.95,
    N2: 1.0,
    N1: 1.05,
  };

  return speeds[level] || 1.0;
}
