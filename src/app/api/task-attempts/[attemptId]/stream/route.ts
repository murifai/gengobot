// Streaming API for task conversations with optimized token efficiency
// MUST import OpenAI shims first before any other imports
import 'openai/shims/node';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { taskVoiceService } from '@/lib/voice/task-voice-service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/task-attempts/[attemptId]/stream
 * Send a message and get streaming AI response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
      return new Response(JSON.stringify({ error: 'Task attempt not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (attempt.isCompleted) {
      return new Response(JSON.stringify({ error: 'Task attempt already completed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build conversation context
    const conversationHistory = attempt.conversationHistory as {
      messages?: Array<{
        role: string;
        content: string;
        timestamp: string;
      }>;
      completedObjectives?: string[];
      startedAt?: string;
    };

    const messages = conversationHistory?.messages || [];
    const completedObjectives = conversationHistory?.completedObjectives || [];
    const learningObjectives = (attempt.task.learningObjectives as string[]) || [];

    // Build system prompt
    const systemPrompt = `You are a Japanese language tutor helping a student practice in this scenario:

**Scenario**: ${attempt.task.scenario}
**Category**: ${attempt.task.category}
**Difficulty**: ${attempt.task.difficulty}
**Student Level**: ${attempt.user.proficiency}

**Learning Objectives**:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

**Character**: ${attempt.task.character?.name || 'Friendly tutor'}
${attempt.task.character?.description ? `Description: ${attempt.task.character.description}` : ''}

**Completed Objectives**: ${completedObjectives.join(', ') || 'None yet'}

**Instructions**:
- Respond naturally in Japanese as the character
- Keep responses concise (1-3 sentences)
- Guide the student towards completing the learning objectives
- Provide gentle corrections when needed
- Use appropriate formality level for the scenario
- Be encouraging and supportive

Respond ONLY in Japanese unless explaining a complex grammar point.`;

    // Build conversation messages for OpenAI
    const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message.trim(),
      },
    ];

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 300,
      stream: true,
    });

    // Create readable stream for SSE
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              // Send SSE format: data: {json}\n\n
              const data = JSON.stringify({ content, done: false });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Save to database after streaming completes
          const userMessage = {
            role: 'user',
            content: message.trim(),
            timestamp: new Date().toISOString(),
          };

          // Generate TTS audio for AI response (non-blocking)
          let synthesis: {
            success: boolean;
            audioUrl?: string;
            duration?: number;
            error?: string;
          } = {
            success: false,
            audioUrl: undefined,
            duration: undefined,
            error: '',
          };

          try {
            console.log('[Streaming] Generating TTS for response...');
            synthesis = await taskVoiceService.synthesizeResponse(
              fullResponse,
              attempt.task.character,
              attempt.user.proficiency
            );

            console.log('[Streaming] TTS result:', {
              success: synthesis.success,
              audioUrl: synthesis.audioUrl,
              error: synthesis.error,
            });
          } catch (ttsError) {
            console.error('[Streaming] TTS generation failed (non-blocking):', ttsError);
          }

          const assistantMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString(),
            voiceMetadata: synthesis.success
              ? {
                  audioUrl: synthesis.audioUrl,
                  audioDuration: synthesis.duration || 0,
                }
              : undefined,
          };

          const updatedMessages = [...messages, userMessage, assistantMessage];

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

          // Send completion event with audioUrl
          const doneData = JSON.stringify({
            content: '',
            done: true,
            audioUrl: synthesis.success ? synthesis.audioUrl : undefined,
            messageCount: updatedMessages.length,
            progress: {
              completedObjectives: completedObjectives.length,
              totalObjectives: learningObjectives.length,
              percentage: Math.round(
                (completedObjectives.length / learningObjectives.length) * 100
              ),
            },
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            error: 'Streaming failed',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process message',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
