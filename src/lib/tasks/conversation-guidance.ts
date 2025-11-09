// Task conversation guidance system
// Phase 3.2: Task-Based Chat Development

/**
 * Task conversation context interface
 */
export interface TaskConversationContext {
  taskId: string;
  userId: string;
  attemptId: string;
  difficulty: string;
  category: string;
  scenario: string;
  learningObjectives: string[];
  conversationExample: string[];
  currentObjective: number;
  completedObjectives: string[];
  conversationHistory: Message[];
  userProficiency: string;
  characterPersonality?: Record<string, unknown>;
  estimatedDuration: number;
  elapsedMinutes: number;
}

/**
 * Message interface
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    objectiveCompleted?: string;
    hintProvided?: boolean;
    correctionMade?: boolean;
  };
}

/**
 * Guidance response interface
 */
export interface GuidanceResponse {
  shouldProvideHint: boolean;
  shouldCorrect: boolean;
  shouldEncourage: boolean;
  shouldProgress: boolean;
  guidanceType: 'hint' | 'correction' | 'encouragement' | 'progression' | 'none';
  message?: string;
  objectiveStatus?: {
    current: string;
    completed: boolean;
    next?: string;
  };
}

/**
 * Evaluate conversation progress and provide guidance
 */
export function evaluateConversationProgress(context: TaskConversationContext): GuidanceResponse {
  const {
    learningObjectives,
    currentObjective,
    completedObjectives,
    conversationHistory,
    estimatedDuration,
    elapsedMinutes,
  } = context;

  // Check if all objectives are completed
  if (completedObjectives.length >= learningObjectives.length) {
    return {
      shouldProvideHint: false,
      shouldCorrect: false,
      shouldEncourage: true,
      shouldProgress: true,
      guidanceType: 'progression',
      message: "Great job! You've completed all learning objectives. Ready to finish the task?",
    };
  }

  const currentObjectiveText = learningObjectives[currentObjective];
  const messageCount = conversationHistory.length;

  // Check if user is struggling (many messages without objective completion)
  const messagesPerObjective = messageCount / (completedObjectives.length + 1);
  if (messagesPerObjective > 8) {
    return {
      shouldProvideHint: true,
      shouldCorrect: false,
      shouldEncourage: true,
      shouldProgress: false,
      guidanceType: 'hint',
      message: `Hint: Try to ${currentObjectiveText.toLowerCase()}`,
      objectiveStatus: {
        current: currentObjectiveText,
        completed: false,
        next: learningObjectives[currentObjective + 1],
      },
    };
  }

  // Check if user is taking too long
  const expectedTimePerObjective = estimatedDuration / learningObjectives.length;
  const timeOnCurrentObjective =
    elapsedMinutes - completedObjectives.length * expectedTimePerObjective;

  if (timeOnCurrentObjective > expectedTimePerObjective * 1.5) {
    return {
      shouldProvideHint: true,
      shouldCorrect: false,
      shouldEncourage: true,
      shouldProgress: false,
      guidanceType: 'hint',
      message: `Take your time, but remember to focus on: ${currentObjectiveText}`,
      objectiveStatus: {
        current: currentObjectiveText,
        completed: false,
        next: learningObjectives[currentObjective + 1],
      },
    };
  }

  // Check recent progress (encourage if doing well)
  const recentCompletions = conversationHistory
    .slice(-5)
    .filter(m => m.metadata?.objectiveCompleted);

  if (recentCompletions.length > 0) {
    return {
      shouldProvideHint: false,
      shouldCorrect: false,
      shouldEncourage: true,
      shouldProgress: false,
      guidanceType: 'encouragement',
      message: "You're making great progress! Keep it up!",
    };
  }

  // No special guidance needed
  return {
    shouldProvideHint: false,
    shouldCorrect: false,
    shouldEncourage: false,
    shouldProgress: false,
    guidanceType: 'none',
  };
}

/**
 * Generate context-aware system prompt for task-based conversation
 */
export function generateTaskSystemPrompt(context: TaskConversationContext): string {
  const {
    difficulty,
    category,
    scenario,
    learningObjectives,
    conversationExample,
    currentObjective,
    userProficiency,
    characterPersonality,
  } = context;

  const currentObjectiveText = learningObjectives[currentObjective] || 'Complete the task';

  let prompt = `You are an AI language tutor helping a Japanese learner practice a task-based conversation.

**Task Context:**
- Category: ${category}
- Difficulty: ${difficulty} (User proficiency: ${userProficiency})
- Scenario: ${scenario}

**Current Objective:** ${currentObjectiveText}

**Learning Objectives:**
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

**Conversation Example:**
${conversationExample.map((example, i) => `${i + 1}. ${example}`).join('\n')}

**Your Role:**
1. Guide the learner through the scenario naturally
2. Respond appropriately in Japanese at ${difficulty} level
3. Help the learner achieve each learning objective
4. Provide gentle corrections when needed
5. Encourage natural conversation flow
6. Use appropriate politeness levels for the scenario

**Guidelines:**
- Respond in Japanese appropriate for ${difficulty} level
- Match the difficulty to the user's proficiency (${userProficiency})
- Stay in character and maintain the scenario context
- Guide learner toward completing current objective: "${currentObjectiveText}"
- Provide natural responses that encourage the learner to practice
- Give subtle hints if the learner seems stuck
- Celebrate small victories and progress

**Assessment Focus:**
- Task Achievement: Is the learner completing the objectives?
- Fluency: How natural is the conversation?
- Vocabulary & Grammar: Are they using appropriate language?
- Politeness: Is the formality level appropriate?
`;

  // Add character personality if provided
  if (characterPersonality) {
    prompt += `\n**Character Personality:**
${JSON.stringify(characterPersonality, null, 2)}

Embody this personality in your responses while maintaining the educational focus.
`;
  }

  return prompt;
}

/**
 * Detect if a learning objective has been completed based on conversation
 */
export function detectObjectiveCompletion(
  objective: string,
  userMessage: string,
  assistantResponse: string,
  context: TaskConversationContext
): boolean {
  // This is a simplified version - in production, use AI to evaluate
  const objectiveLower = objective.toLowerCase();
  const userLower = userMessage.toLowerCase();
  const assistantLower = assistantResponse.toLowerCase();

  // Check for keywords related to common objectives
  const completionIndicators: Record<string, string[]> = {
    order: ['注文', 'ください', 'お願いします', 'いただけますか'],
    greet: ['こんにちは', 'おはよう', 'こんばんは', 'はじめまして'],
    introduce: ['です', 'と申します', 'といいます'],
    ask: ['ですか', 'でしょうか', 'か？'],
    confirm: ['はい', 'そうです', 'かしこまりました'],
    thank: ['ありがとう', 'すみません', 'お願いします'],
    respond: ['はい', 'いいえ', 'そうですね'],
  };

  // Check if user message contains completion indicators
  for (const [action, indicators] of Object.entries(completionIndicators)) {
    if (objectiveLower.includes(action)) {
      const hasIndicator = indicators.some(
        indicator => userLower.includes(indicator) || assistantLower.includes(indicator)
      );
      if (hasIndicator) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Generate hints for the current objective
 */
export function generateObjectiveHint(
  objective: string,
  difficulty: string,
  category: string
): string {
  const hints: Record<string, string> = {
    order: `Try using "〜をください" or "〜をお願いします" to order something`,
    greet: `Start with a greeting like "こんにちは" or "いらっしゃいませ"`,
    introduce: `Introduce yourself using "〜と申します" or "〜です"`,
    ask: `Form a question using "〜ですか" or "〜でしょうか"`,
    confirm: `Confirm understanding with "はい、わかりました" or "かしこまりました"`,
    thank: `Express gratitude with "ありがとうございます"`,
    respond: `Respond appropriately to the question or statement`,
  };

  const objectiveLower = objective.toLowerCase();

  for (const [action, hint] of Object.entries(hints)) {
    if (objectiveLower.includes(action)) {
      return hint;
    }
  }

  return `Focus on: ${objective}`;
}

/**
 * Calculate conversation quality metrics
 */
export function calculateConversationMetrics(conversationHistory: Message[]): {
  messageCount: number;
  averageUserMessageLength: number;
  averageResponseTime: number;
  japaneseUsageRate: number;
} {
  const userMessages = conversationHistory.filter(m => m.role === 'user');

  const totalLength = userMessages.reduce((sum, m) => sum + m.content.length, 0);
  const averageLength = userMessages.length > 0 ? totalLength / userMessages.length : 0;

  // Calculate average response time (simplified)
  let totalResponseTime = 0;
  for (let i = 1; i < conversationHistory.length; i++) {
    if (conversationHistory[i].role === 'user' && conversationHistory[i - 1].role === 'assistant') {
      const time1 = new Date(conversationHistory[i - 1].timestamp).getTime();
      const time2 = new Date(conversationHistory[i].timestamp).getTime();
      totalResponseTime += time2 - time1;
    }
  }
  const averageResponseTime =
    userMessages.length > 1 ? totalResponseTime / (userMessages.length - 1) : 0;

  // Estimate Japanese usage (very simplified - counts Japanese characters)
  const japaneseCharPattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g;
  let japaneseChars = 0;
  let totalChars = 0;

  userMessages.forEach(m => {
    const matches = m.content.match(japaneseCharPattern);
    japaneseChars += matches ? matches.length : 0;
    totalChars += m.content.length;
  });

  const japaneseUsageRate = totalChars > 0 ? (japaneseChars / totalChars) * 100 : 0;

  return {
    messageCount: conversationHistory.length,
    averageUserMessageLength: Math.round(averageLength),
    averageResponseTime: Math.round(averageResponseTime / 1000), // in seconds
    japaneseUsageRate: Math.round(japaneseUsageRate),
  };
}
