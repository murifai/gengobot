// Streaming API for task conversations with optimized token efficiency
// MUST import OpenAI shims first before any other imports
import 'openai/shims/node';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { taskVoiceService } from '@/lib/voice/task-voice-service';
import { UsageType } from '@prisma/client';
import { creditService, TIER_CONFIG } from '@/lib/subscription';
import { MODELS } from '@/lib/ai/openai-client';

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
    const { message, isVoiceMessage = false } = body;

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
        task: true,
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

    // Check credits for text chat
    const creditCheck = await creditService.checkCredits(attempt.userId, UsageType.TEXT_CHAT, 1);

    if (!creditCheck.allowed) {
      // For free tier, check daily message limit
      const subscription = await creditService.getOrCreateSubscription(attempt.userId);
      if (subscription.tier === 'FREE') {
        const tierConfig = TIER_CONFIG.FREE;
        return new Response(
          JSON.stringify({
            error: 'Daily message limit reached',
            message: `Free tier limit is ${tierConfig.textDailyLimit} messages per day. Upgrade for unlimited messages.`,
            isTrialUser: true,
          }),
          {
            status: 402,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          message: creditCheck.reason,
          creditsRequired: creditCheck.creditsRequired,
          creditsAvailable: creditCheck.creditsAvailable,
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    // Build system prompt using task.prompt from database
    const systemPrompt = `${attempt.task.prompt || 'You are a Japanese conversation partner.'}

# Context
- Scenario: ${attempt.task.scenario}
- JLPT Level: ${attempt.task.difficulty}

# Learning Objectives
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

# Response Guidelines
- Respond ONLY in Japanese appropriate for ${attempt.task.difficulty} level
- Keep responses concise (1-3 sentences)
- Stay in character throughout the conversation
- Adapt your responses based on user's answers

# Implicit Feedback Rules
When the user makes errors, use ONE of these three approaches (match your character's speech style - keigo, teineigo, or futsukei):

1. Cannot understand at all:
   Ask the user to repeat in a way that matches your character's formality level

2. Can guess but need confirmation:
   Confirm by rephrasing with the correct form, using your character's natural speech pattern

3. Understood despite error:
   Respond naturally using the correct form (recast) without highlighting the correction

IMPORTANT:
- NEVER explicitly point out errors or say things like "you made a mistake"
- NEVER break character to give grammar explanations
- NEVER use any language other than Japanese in your responses
- Let the user learn through natural conversation flow

# Boundaries
- Do NOT answer questions on behalf of the user
- Do NOT provide translations in any other language
- Do NOT give hints unless explicitly asked
- ALWAYS respond in Japanese only`;

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

    // Create streaming response with usage tracking
    const stream = await openai.chat.completions.create({
      model: MODELS.RESPONSE,
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 300,
      stream: true,
      stream_options: { include_usage: true }, // Enable usage tracking for usage-based credits
    });

    // Create readable stream for SSE
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          // Track token usage for usage-based credit deduction
          let inputTokens = 0;
          let outputTokens = 0;

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              // Send SSE format: data: {json}\n\n
              const data = JSON.stringify({ content, done: false });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            // Capture usage from the final chunk (contains total token counts)
            if (chunk.usage) {
              inputTokens = chunk.usage.prompt_tokens;
              outputTokens = chunk.usage.completion_tokens;
            }
          }

          // Save to database after streaming completes
          const userMessage = {
            role: 'user',
            content: message.trim(),
            timestamp: new Date().toISOString(),
          };

          // Generate TTS audio for AI response only if user sent a voice message
          let synthesis: {
            success: boolean;
            audioBlob?: Blob;
            duration?: number;
            error?: string;
          } = {
            success: false,
            audioBlob: undefined,
            duration: undefined,
            error: '',
          };

          let audioData: string | undefined;
          let audioType: string | undefined;

          // Track TTS credit deduction
          let ttsCreditsDeducted = 0;
          let ttsUsdCost = 0;

          // Only generate TTS if user sent a voice message
          if (isVoiceMessage) {
            try {
              console.log('[Streaming] Generating TTS for response (voice message received)...');
              // Cast task to access voice/speakingSpeed fields added in schema migration
              const taskWithVoice = attempt.task as typeof attempt.task & {
                voice?: string;
                speakingSpeed?: number;
              };
              synthesis = await taskVoiceService.synthesizeResponse(
                fullResponse,
                {
                  voice: taskWithVoice.voice,
                  speakingSpeed: taskWithVoice.speakingSpeed,
                },
                attempt.user.proficiency
              );

              // Convert audio blob to base64 for transmission
              if (synthesis.success && synthesis.audioBlob) {
                const audioBuffer = await synthesis.audioBlob.arrayBuffer();
                audioData = Buffer.from(audioBuffer).toString('base64');
                audioType = 'audio/mpeg';

                // Deduct credits for TTS usage
                const ttsResult = await creditService.deductCreditsFromUsage(
                  attempt.userId,
                  {
                    model: 'gpt-4o-mini-tts',
                    characterCount: fullResponse.length,
                  },
                  attemptId,
                  'task_attempt_tts',
                  'TTS synthesis for voice response'
                );
                ttsCreditsDeducted = ttsResult.credits;
                ttsUsdCost = ttsResult.usdCost;
              }

              console.log('[Streaming] TTS result:', {
                success: synthesis.success,
                hasAudioData: !!audioData,
                characterCount: fullResponse.length,
                ttsCreditsDeducted,
                ttsUsdCost,
                error: synthesis.error,
              });
            } catch (ttsError) {
              console.error('[Streaming] TTS generation failed (non-blocking):', ttsError);
            }
          } else {
            console.log('[Streaming] Skipping TTS (text message received)');
          }

          const assistantMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString(),
            voiceMetadata: synthesis.success
              ? {
                  // Don't store audio data - just duration
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

          // Deduct credits based on actual token usage (usage-based billing)
          // For voice messages, force deduct text credits even for unlimited text tiers
          // This ensures voice chat uses credits while text-only chat remains unlimited
          const creditResult = await creditService.deductCreditsFromUsage(
            attempt.userId,
            {
              model: MODELS.RESPONSE,
              inputTokens,
              outputTokens,
            },
            attemptId,
            isVoiceMessage ? 'task_attempt_voice' : 'task_attempt',
            isVoiceMessage ? 'Voice chat text generation' : 'Task chat message',
            isVoiceMessage // forceDeduct: true for voice messages
          );

          console.log('[Task Stream] Credit deduction:', {
            attemptId,
            tokensUsed: { input: inputTokens, output: outputTokens },
            textCreditsDeducted: creditResult.credits,
            textUsdCost: creditResult.usdCost,
            ttsCreditsDeducted,
            ttsUsdCost,
            totalCreditsDeducted: creditResult.credits + ttsCreditsDeducted,
          });

          // Send completion event with audio data (base64)
          const doneData = JSON.stringify({
            content: '',
            done: true,
            audioData: audioData, // Base64 audio for one-time playback
            audioType: audioType,
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
