// Voice-enabled task conversation API
// Phase 3.3: Voice Interaction System

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { taskVoiceService } from '@/lib/voice/task-voice-service';
import { evaluateConversationProgress } from '@/lib/tasks/conversation-guidance';
import type { TaskConversationContext } from '@/lib/tasks/conversation-guidance';

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
        task: {
          include: {
            character: true,
          },
        },
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
    const configJson = formData.get('config') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Parse optional config
    const config = configJson ? JSON.parse(configJson) : undefined;

    // Build conversation context
    const conversationHistory = attempt.conversationHistory as {
      messages?: unknown[];
      completedObjectives?: string[];
      startedAt?: string;
    };

    const messages = conversationHistory?.messages || [];
    const completedObjectives = conversationHistory?.completedObjectives || [];
    const learningObjectives = (attempt.task.learningObjectives as string[]) || [];
    const successCriteria = (attempt.task.successCriteria as string[]) || [];

    const context: TaskConversationContext = {
      taskId: attempt.taskId,
      userId: attempt.userId,
      attemptId: attempt.id,
      difficulty: attempt.task.difficulty,
      category: attempt.task.category,
      scenario: attempt.task.scenario,
      learningObjectives,
      successCriteria,
      currentObjective: completedObjectives.length,
      completedObjectives,
      conversationHistory: messages as {
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: string;
      }[],
      userProficiency: attempt.user.proficiency,
      characterPersonality: attempt.task.character?.personality as
        | Record<string, unknown>
        | undefined,
      estimatedDuration: attempt.task.estimatedDuration,
      elapsedMinutes: Math.round(
        (new Date().getTime() - new Date(attempt.startTime).getTime()) / 60000
      ),
    };

    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type,
    });

    // Transcribe audio with task context
    const transcription = await taskVoiceService.transcribeTaskInput(audioBlob, context, config);

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
    const validation = taskVoiceService.validateRecording({
      audioDuration: transcription.duration,
      voiceActivityDetected: transcription.transcript.length > 0,
      transcriptionConfidence: transcription.confidence,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Recording validation failed',
          warnings: validation.warnings,
          transcript: transcription.transcript,
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

    // Evaluate conversation progress
    const guidance = evaluateConversationProgress(context);

    // Generate AI response (simplified - in production, call OpenAI)
    let aiResponseText = `${transcription.transcript}に対する応答です。`; // Placeholder

    // Add guidance if needed
    if (guidance.message) {
      aiResponseText += `\n\n${guidance.message}`;
    }

    // Synthesize AI response
    const synthesis = await taskVoiceService.synthesizeTaskResponse(
      aiResponseText,
      context,
      config
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

    // Add assistant message to conversation
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponseText,
      timestamp: new Date().toISOString(),
      voiceMetadata: {
        audioUrl: synthesis.audioUrl,
        audioDuration: synthesis.duration || 0,
      },
      metadata: {
        hintProvided: guidance.shouldProvideHint,
        objectiveCompleted: guidance.objectiveStatus?.completed
          ? guidance.objectiveStatus.current
          : undefined,
      },
    };

    // Update conversation history
    const updatedMessages = [...messages, userMessage, assistantMessage];
    const updatedCompletedObjectives = guidance.objectiveStatus?.completed
      ? [...completedObjectives, guidance.objectiveStatus.current]
      : completedObjectives;

    // Build the update object with proper typing
    const updatedHistory = {
      messages: updatedMessages,
      completedObjectives: updatedCompletedObjectives,
      startedAt: conversationHistory?.startedAt || new Date().toISOString(),
    };

    await prisma.taskAttempt.update({
      where: { id: attemptId },
      data: {
        conversationHistory: updatedHistory as never,
      },
    });

    // Generate progress feedback audio if enabled
    let feedbackAudio = null;
    if (config?.audioFeedback && guidance.guidanceType !== 'none') {
      const feedback = await taskVoiceService.generateProgressFeedback(guidance, context, config);
      if (feedback.success) {
        feedbackAudio = {
          url: feedback.audioUrl,
          duration: feedback.duration,
          type: guidance.guidanceType,
        };
      }
    }

    // Return response with audio
    return NextResponse.json({
      success: true,
      transcription: {
        text: transcription.transcript,
        confidence: transcription.confidence,
        duration: transcription.duration,
        suggestions: transcription.suggestions,
      },
      response: {
        text: aiResponseText,
        audioUrl: synthesis.audioUrl,
        duration: synthesis.duration,
      },
      guidance: {
        type: guidance.guidanceType,
        message: guidance.message,
        shouldProvideHint: guidance.shouldProvideHint,
        objectiveStatus: guidance.objectiveStatus,
      },
      feedbackAudio,
      progress: {
        completedObjectives: updatedCompletedObjectives.length,
        totalObjectives: learningObjectives.length,
        percentage: Math.round(
          (updatedCompletedObjectives.length / learningObjectives.length) * 100
        ),
        messageCount: updatedMessages.length,
      },
      validation: {
        isValid: validation.isValid,
        warnings: validation.warnings,
      },
    });
  } catch (error) {
    console.error('Voice conversation error:', error);
    return NextResponse.json(
      {
        error: 'Voice conversation processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
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
        task: {
          include: {
            character: true,
          },
        },
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
        voice: attempt.task.character?.personality
          ? getRecommendedVoice(attempt.task.character.personality as Record<string, unknown>)
          : 'nova',
        speed: getSpeedForLevel(attempt.user.proficiency),
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

// Helper: Get recommended voice based on character personality
function getRecommendedVoice(personality: Record<string, unknown>): string {
  const gender = personality.gender as string | undefined;
  const tone = personality.tone as string | undefined;

  if (gender === 'female') {
    if (tone === 'friendly' || tone === 'warm') return 'nova';
    if (tone === 'soft' || tone === 'gentle') return 'shimmer';
    return 'alloy';
  }

  if (gender === 'male') {
    if (tone === 'warm' || tone === 'friendly') return 'echo';
    if (tone === 'deep' || tone === 'authoritative') return 'onyx';
    return 'fable';
  }

  return 'nova'; // Default
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
