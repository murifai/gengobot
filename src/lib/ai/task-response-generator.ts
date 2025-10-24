/**
 * AI Response Generator for Task-Based Conversations
 * Generates contextual AI responses with proper character roleplay
 */

import getOpenAIClient from './openai-client';

interface TaskContext {
  scenario: string;
  category: string;
  learningObjectives: string[];
  difficulty: string;
  userProficiency: string;
}

interface ConversationState {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  completedObjectives: string[];
}

interface CharacterInfo {
  role: string;
  description: string;
}

/**
 * Determines the appropriate character role based on task scenario
 */
export function determineCharacterRole(taskContext: TaskContext): CharacterInfo {
  const { category, scenario } = taskContext;

  // Default to station attendant
  let characterRole = '駅員 (えきいん / station attendant)';
  let roleDescription = 'a friendly and helpful station attendant who assists passengers with train information and directions';

  // Travel/Jalan-jalan category
  if (category === 'Jalan-jalan' || category.toLowerCase().includes('travel')) {
    if (scenario.includes('駅') || scenario.includes('station') || scenario.includes('peron')) {
      characterRole = '駅員 (えきいん / station attendant)';
      roleDescription = 'a friendly and helpful station attendant who assists passengers with train information and directions';
    } else if (scenario.includes('レストラン') || scenario.includes('restaurant') || scenario.includes('restoran')) {
      characterRole = 'ウェイター/ウェイトレス (waitress/waiter)';
      roleDescription = 'a polite and attentive restaurant server who helps customers order and enjoy their meal';
    } else if (scenario.includes('店') || scenario.includes('shop') || scenario.includes('toko')) {
      characterRole = '店員 (てんいん / shop clerk)';
      roleDescription = 'a helpful and friendly shop clerk who assists customers with their purchases';
    } else if (scenario.includes('ホテル') || scenario.includes('hotel')) {
      characterRole = 'ホテルスタッフ (hotel staff)';
      roleDescription = 'a professional and courteous hotel staff member who assists guests';
    } else if (scenario.includes('空港') || scenario.includes('airport')) {
      characterRole = '空港職員 (くうこうしょくいん / airport staff)';
      roleDescription = 'a helpful airport staff member who assists travelers';
    }
  }
  // Daily life category
  else if (category === 'Keseharian' || category.toLowerCase().includes('daily')) {
    if (scenario.includes('郵便局') || scenario.includes('post office')) {
      characterRole = '郵便局員 (ゆうびんきょくいん / post office clerk)';
      roleDescription = 'a helpful post office clerk who assists with mail and packages';
    } else if (scenario.includes('銀行') || scenario.includes('bank')) {
      characterRole = '銀行員 (ぎんこういん / bank clerk)';
      roleDescription = 'a professional bank clerk who helps with banking transactions';
    }
  }
  // Work category
  else if (category === 'Pekerjaan' || category.toLowerCase().includes('work')) {
    characterRole = '同僚 (どうりょう / colleague)';
    roleDescription = 'a friendly and helpful colleague at work';
  }

  return {
    role: characterRole,
    description: roleDescription,
  };
}

/**
 * Determines the current conversation stage
 */
function determineConversationStage(state: ConversationState, taskContext: TaskContext): {
  stage: 'opening' | 'early' | 'middle' | 'closing';
  guidance: string;
} {
  const messageCount = state.messages.length;
  const completedCount = state.completedObjectives.length;
  const totalObjectives = taskContext.learningObjectives.length;

  if (messageCount === 0) {
    return {
      stage: 'opening',
      guidance: 'The student is just starting the conversation. If they greet you, respond naturally in character.',
    };
  }

  if (completedCount === totalObjectives && totalObjectives > 0) {
    return {
      stage: 'closing',
      guidance: 'The student has completed the objectives. You can wrap up the conversation naturally if appropriate.',
    };
  }

  if (messageCount < 3) {
    return {
      stage: 'early',
      guidance: 'The conversation has started. Listen to what the student needs and respond helpfully.',
    };
  }

  return {
    stage: 'middle',
    guidance: 'The conversation is ongoing. Continue assisting the student with their questions.',
  };
}

/**
 * Builds the system prompt for AI character roleplay
 */
function buildSystemPrompt(taskContext: TaskContext, character: CharacterInfo): string {
  return `You are roleplaying as ${character.description} in a Japanese language learning scenario.

SCENARIO: ${taskContext.scenario}

YOUR ROLE: ${character.role}
- You are ${character.description}
- Respond naturally as this character would in the given scenario
- Use appropriate Japanese based on the situation and your role
- Be helpful and patient with the student

LEARNING OBJECTIVES:
${taskContext.learningObjectives.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n')}

STUDENT INFORMATION:
- Japanese Level: ${taskContext.userProficiency}
- Difficulty: ${taskContext.difficulty}
- This is a task-based conversation practice

GUIDELINES:
1. Stay in character as ${character.role}
2. Respond naturally to what the student says in Japanese
3. Use language appropriate for ${taskContext.difficulty} level
4. Be encouraging and helpful
5. If the student greets you (こんにちは, すみません, etc.), respond appropriately in character
6. Guide the conversation towards the learning objectives naturally
7. Keep responses concise (2-3 sentences maximum unless asked to elaborate)

IMPORTANT: Respond ONLY in Japanese as your character would. Do not break character or provide English explanations unless specifically asked.`;
}

/**
 * Generates an AI response for task-based conversation
 */
export async function generateTaskResponse(
  taskContext: TaskContext,
  conversationState: ConversationState,
  userMessage: string
): Promise<string> {
  // Determine character role
  const character = determineCharacterRole(taskContext);

  // Build conversation messages
  const conversationMessages = [
    ...conversationState.messages,
    {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString(),
    },
  ];

  // Build system prompt
  const systemPrompt = buildSystemPrompt(taskContext, character);

  // Determine conversation stage
  const { stage, guidance } = determineConversationStage(conversationState, taskContext);

  // Call OpenAI
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: `Conversation stage: ${stage}. ${guidance}` },
      ...conversationMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const aiResponse = completion.choices[0]?.message?.content || 'すみません、もう一度お願いします。';

  return aiResponse;
}

/**
 * Export types for use in API routes
 */
export type { TaskContext, ConversationState, CharacterInfo };
