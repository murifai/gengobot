// Streaming API for free conversation (Kaiwa Bebas)
// MUST import OpenAI shims first before any other imports
import 'openai/shims/node';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { UsageType } from '@prisma/client';
import { creditService, TIER_CONFIG } from '@/lib/subscription';
import { MODELS } from '@/lib/ai/openai-client';
import { ttsService } from '@/lib/voice/tts-service';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/free-conversation/[sessionId]/stream
 * Send a message and get streaming AI response for free conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { message, isVoiceMessage = false } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get free conversation session with character
    const session = await prisma.freeConversation.findUnique({
      where: { id: sessionId },
      include: {
        character: true,
        user: true,
      },
    });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Conversation session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check credits for text chat
    const creditCheck = await creditService.checkCredits(session.userId, UsageType.TEXT_CHAT, 1);

    if (!creditCheck.allowed) {
      // For free tier, check daily message limit
      const subscription = await creditService.getOrCreateSubscription(session.userId);
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
    const conversationHistory = session.conversationHistory as {
      messages?: Array<{
        role: string;
        content: string;
        timestamp: string;
      }>;
      startedAt?: string;
    };

    const messages = conversationHistory?.messages || [];

    // Build system prompt with character
    const character = session.character;

    // Get relationship context - use custom if "lainnya"
    const relationshipContext =
      character?.relationshipType === 'lainnya'
        ? character?.relationshipCustom || 'a conversation partner'
        : character?.relationshipType || 'teman';

    const systemPrompt = `You are ${character?.name || 'a friendly Japanese conversation partner'}, a Japanese conversation partner.

**Relationship**: ${relationshipContext}
**Description**: ${character?.description || 'A friendly conversation partner'}
**Speaking Style**: ${character?.speakingStyle || 'Natural and friendly'}

**Guidelines**:
- Respond naturally in Japanese as this character
- Maintain the speaking style described above
- Be helpful and engaging
- Keep responses concise (1-2 sentences)
- Use appropriate formality level based on relationship
- Help the user practice Japanese naturally
- Occasionally introduce new vocabulary or expressions naturally
- Be supportive and encouraging

Respond primarily in Japanese. Only use English if explaining something complex or if asked directly.`;

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
      model: MODELS.RESPONSE,
      messages: conversationMessages,
      temperature: 0.8, // More creative for casual conversation
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

          // Generate TTS audio for AI response only if user sent a voice message
          let audioData: string | undefined;
          let audioType: string | undefined;

          if (isVoiceMessage) {
            try {
              console.log(
                '[Free Conversation Stream] Generating TTS for response (voice message received)...'
              );
              // Use character voice or default to 'alloy'
              const voiceId = (character?.voice || 'alloy') as
                | 'alloy'
                | 'echo'
                | 'fable'
                | 'onyx'
                | 'nova'
                | 'shimmer';
              const result = await ttsService.synthesize(fullResponse, {
                voice: voiceId,
                speed: 1.0,
              });

              // Convert audio buffer to base64 for transmission
              audioData = Buffer.from(result.audio).toString('base64');
              audioType = 'audio/mpeg';

              console.log('[Free Conversation Stream] TTS generated successfully');
            } catch (ttsError) {
              console.error(
                '[Free Conversation Stream] TTS generation failed (non-blocking):',
                ttsError
              );
            }
          } else {
            console.log('[Free Conversation Stream] Skipping TTS (text message received)');
          }

          const assistantMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString(),
          };

          const updatedMessages = [...messages, userMessage, assistantMessage];

          // Update session with new messages
          await prisma.freeConversation.update({
            where: { id: sessionId },
            data: {
              conversationHistory: {
                messages: updatedMessages,
                startedAt: conversationHistory?.startedAt || new Date().toISOString(),
              },
            },
          });

          // Deduct credit for text chat message
          await creditService.deductCredits(
            session.userId,
            UsageType.TEXT_CHAT,
            1,
            sessionId,
            'free_conversation'
          );

          console.log('[Free Conversation Stream] Saved messages:', {
            sessionId,
            totalMessages: updatedMessages.length,
            character: character?.name,
          });

          // Send final done message with audio data if available
          const doneData = JSON.stringify({
            content: '',
            done: true,
            audioData: audioData,
            audioType: audioType,
          });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));

          controller.close();
        } catch (error) {
          console.error('[Free Conversation Stream] Error:', error);
          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : 'Stream error',
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
    console.error('[Free Conversation Stream] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process message',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
