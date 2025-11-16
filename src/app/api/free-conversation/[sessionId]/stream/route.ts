// Streaming API for free conversation (Kaiwa Bebas)
// MUST import OpenAI shims first before any other imports
import 'openai/shims/node';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

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
    const { message } = body;

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

    // Build system prompt with character personality
    const character = session.character;
    const personality = character?.personality as {
      traits?: string[];
      background?: string;
      interests?: string[];
    } | null;

    const systemPrompt = `You are ${character?.name || 'a friendly Japanese conversation partner'} having a casual conversation in Japanese.

${character?.description ? `About you: ${character.description}` : ''}

${character?.speakingStyle ? `Speaking style: ${character.speakingStyle}` : ''}

${personality?.traits ? `Personality traits: ${personality.traits.join(', ')}` : ''}

${personality?.background ? `Background: ${personality.background}` : ''}

${personality?.interests ? `Interests: ${personality.interests.join(', ')}` : ''}

${character?.relationshipType ? `Relationship: ${character.relationshipType}` : 'You are a friendly conversation partner'}

**Instructions**:
- Respond naturally in Japanese as this character
- Keep responses conversational and concise (1-3 sentences typically)
- Stay in character and maintain the personality
- Be engaging and show interest in what the user says
- Use appropriate formality level (casual/polite based on relationship)
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
      model: 'gpt-4o-mini',
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

          console.log('[Free Conversation Stream] Saved messages:', {
            sessionId,
            totalMessages: updatedMessages.length,
            character: character?.name,
          });

          // Send final done message
          const doneData = JSON.stringify({ content: '', done: true });
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
