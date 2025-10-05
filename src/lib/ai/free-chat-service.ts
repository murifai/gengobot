// AI service for free chat conversations
import OpenAI from 'openai';
import { Character, FreeChatMessage } from '@/types/character';
import { CharacterService } from '@/lib/character/character-service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FreeChatContext {
  character: Character;
  conversationHistory: FreeChatMessage[];
  userMessage: string;
}

/**
 * Generate AI response for free chat
 */
export async function generateFreeChatResponse(context: FreeChatContext): Promise<string> {
  const { character, conversationHistory, userMessage } = context;

  // Build system prompt from character
  const systemPrompt = CharacterService.generateCharacterPrompt(character);

  // Build conversation history for OpenAI
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Add conversation history (last 10 messages for context)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.8,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'すみません、もう一度言ってください。';
  } catch (error) {
    console.error('Error generating free chat response:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Generate character suggestions based on user preferences
 */
export async function suggestCharacters(
  userProficiency: string,
  interests?: string[]
): Promise<string[]> {
  const prompt = `Based on a Japanese language learner with proficiency level ${userProficiency}${
    interests ? ` and interests in ${interests.join(', ')}` : ''
  }, suggest 3 character personalities that would be most helpful for conversation practice. Return only the personality types as a comma-separated list.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a Japanese language learning expert. Provide concise, practical suggestions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content || '';
    return content.split(',').map(s => s.trim());
  } catch (error) {
    console.error('Error suggesting characters:', error);
    return ['friendly', 'professional', 'casual'];
  }
}

/**
 * Generate conversation starters based on character and relationship
 */
export async function generateConversationStarters(character: Character): Promise<string[]> {
  const prompt = `Generate 3 natural conversation starters in Japanese for a ${character.relationshipType || 'friend'} character named ${character.name} who is ${character.personality.type}. Keep them simple and natural. Return only the Japanese phrases, one per line.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a Japanese language expert. Generate natural, appropriate conversation starters.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '';
    return content
      .split('\n')
      .filter(s => s.trim())
      .slice(0, 3);
  } catch (error) {
    console.error('Error generating conversation starters:', error);
    return ['こんにちは！', '元気ですか？', '今日はいい天気ですね。'];
  }
}

/**
 * Evaluate conversation quality and provide feedback
 */
export async function evaluateFreeChatConversation(
  conversationHistory: FreeChatMessage[]
): Promise<{
  overallQuality: number;
  feedback: string;
  suggestions: string[];
}> {
  if (conversationHistory.length < 4) {
    return {
      overallQuality: 0,
      feedback: 'Continue practicing to get feedback on your conversation.',
      suggestions: ['Try to have longer conversations for better assessment'],
    };
  }

  const userMessages = conversationHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join('\n');

  const prompt = `Evaluate this Japanese conversation from a language learner. Provide:
1. Overall quality score (0-100)
2. Brief feedback (2-3 sentences)
3. 3 specific suggestions for improvement

User messages:
${userMessages}

Format your response as JSON: {"score": number, "feedback": "text", "suggestions": ["text1", "text2", "text3"]}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Japanese language teacher providing constructive feedback.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const evaluation = JSON.parse(content);

    return {
      overallQuality: evaluation.score || 50,
      feedback: evaluation.feedback || 'Keep practicing!',
      suggestions: evaluation.suggestions || [
        'Practice more vocabulary',
        'Try longer sentences',
        'Use more varied expressions',
      ],
    };
  } catch (error) {
    console.error('Error evaluating conversation:', error);
    return {
      overallQuality: 50,
      feedback: 'Keep practicing to improve your Japanese!',
      suggestions: [
        'Practice more vocabulary',
        'Try longer sentences',
        'Use more varied expressions',
      ],
    };
  }
}
