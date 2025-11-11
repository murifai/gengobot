// Conversation context management for task-based learning
import { Task, Character } from '@prisma/client';
import { TaskConversationContext, Message } from '@/types/ai';

export class ConversationManager {
  /**
   * Initialize a new task-based conversation context
   */
  initializeTaskContext(
    task: Task,
    userProficiency: string,
    character?: Character
  ): TaskConversationContext {
    return {
      mode: 'task-based',
      task,
      currentObjective: 0,
      completedObjectives: [],
      character,
      userProficiency,
      conversationHistory: [],
      taskAttemptCount: 0,
      hints: [],
    };
  }

  /**
   * Add a message to conversation history
   */
  addMessage(
    context: TaskConversationContext,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): TaskConversationContext {
    return {
      ...context,
      conversationHistory: [
        ...context.conversationHistory,
        {
          role,
          content,
          timestamp: new Date(),
        },
      ],
    };
  }

  /**
   * Mark an objective as completed
   */
  completeObjective(
    context: TaskConversationContext,
    objectiveIndex: number
  ): TaskConversationContext {
    const objectives = context.task.conversationExample as unknown as string[];
    const objective = objectives[objectiveIndex];

    if (!objective || context.completedObjectives.includes(objective)) {
      return context;
    }

    return {
      ...context,
      completedObjectives: [...context.completedObjectives, objective],
      currentObjective: Math.min(objectiveIndex + 1, objectives.length),
    };
  }

  /**
   * Check if all objectives are completed
   */
  areAllObjectivesCompleted(context: TaskConversationContext): boolean {
    const objectives = context.task.conversationExample as unknown as string[];
    return context.completedObjectives.length >= objectives.length;
  }

  /**
   * Get current objective
   */
  getCurrentObjective(context: TaskConversationContext): string | null {
    const objectives = context.task.conversationExample as unknown as string[];
    return objectives[context.currentObjective] || null;
  }

  /**
   * Get progress percentage
   */
  getProgress(context: TaskConversationContext): number {
    const objectives = context.task.conversationExample as unknown as string[];
    return Math.round((context.completedObjectives.length / objectives.length) * 100);
  }

  /**
   * Add a hint to the context
   */
  addHint(context: TaskConversationContext, hint: string): TaskConversationContext {
    return {
      ...context,
      hints: [...context.hints, hint],
    };
  }

  /**
   * Increment task attempt count
   */
  incrementAttemptCount(context: TaskConversationContext): TaskConversationContext {
    return {
      ...context,
      taskAttemptCount: context.taskAttemptCount + 1,
    };
  }

  /**
   * Get conversation summary for saving to database
   */
  serializeContext(context: TaskConversationContext): {
    messages: Message[];
    completedObjectives: string[];
    currentObjective: number;
    hints: string[];
    progress: number;
  } {
    return {
      messages: context.conversationHistory,
      completedObjectives: context.completedObjectives,
      currentObjective: context.currentObjective,
      hints: context.hints,
      progress: this.getProgress(context),
    };
  }

  /**
   * Restore context from saved data
   */
  deserializeContext(
    task: Task,
    userProficiency: string,
    savedData: {
      messages: Message[];
      completedObjectives: string[];
      currentObjective: number;
      hints: string[];
    },
    character?: Character
  ): TaskConversationContext {
    return {
      mode: 'task-based',
      task,
      currentObjective: savedData.currentObjective,
      completedObjectives: savedData.completedObjectives,
      character,
      userProficiency,
      conversationHistory: savedData.messages,
      taskAttemptCount: 0,
      hints: savedData.hints,
    };
  }

  /**
   * Detect if user needs help based on conversation patterns
   */
  shouldOfferHint(context: TaskConversationContext): boolean {
    const recentMessages = context.conversationHistory.slice(-6);
    const userMessages = recentMessages.filter(m => m.role === 'user');

    // Offer hint if:
    // 1. User has sent 3+ messages on same objective
    // 2. Messages are getting shorter (possible frustration)
    // 3. User explicitly asks for help

    if (userMessages.length === 0) return false;

    const lastMessage = userMessages[userMessages.length - 1];

    // Check for help keywords
    const helpKeywords = ['help', '助けて', 'わからない', 'どう', 'hint'];
    const asksForHelp = helpKeywords.some(keyword =>
      lastMessage.content.toLowerCase().includes(keyword)
    );

    // If user explicitly asks for help, offer hint immediately
    if (asksForHelp) return true;

    // Otherwise, check message patterns only if 3+ messages
    if (userMessages.length < 3) return false;

    const avgLength =
      userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;

    // Check if messages are getting shorter (possible frustration)
    const isGettingShorter = lastMessage.content.length < avgLength * 0.6;

    return isGettingShorter;
  }

  /**
   * Analyze if objective might be completed based on recent conversation
   */
  analyzeObjectiveProgress(
    context: TaskConversationContext,
    objectiveIndex: number
  ): {
    likelyCompleted: boolean;
    confidence: number;
  } {
    // This is a simple heuristic. In production, use GPT-4 to analyze
    const objective = (context.task.conversationExample as unknown as string[])[objectiveIndex];
    const recentMessages = context.conversationHistory.slice(-6);

    // Check for completion keywords in recent messages
    const completionKeywords = [
      'できました',
      'finished',
      'done',
      'completed',
      '完了',
      'はい',
      'yes',
    ];

    let completionSignals = 0;
    recentMessages.forEach(msg => {
      completionKeywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword)) {
          completionSignals++;
        }
      });
    });

    const confidence = Math.min((completionSignals / 3) * 100, 100);
    return {
      likelyCompleted: confidence > 50,
      confidence,
    };
  }
}

// Export singleton instance
export const conversationManager = new ConversationManager();
