import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConversationManager } from '@/lib/ai/conversation-manager';
import { Task, Character } from '@prisma/client';
import { TaskConversationContext } from '@/types/ai';

describe('ConversationManager', () => {
  let manager: ConversationManager;
  let mockTask: Task;
  let mockCharacter: Character;

  beforeEach(() => {
    manager = new ConversationManager();

    mockTask = {
      id: 'task-1',
      title: 'Order Coffee at a Cafe',
      description: 'Practice cafe ordering',
      category: 'Restaurant',
      difficulty: 'N5',
      scenario: 'You are at a cafe...',
      learningObjectives: ['Drink vocabulary', 'Ordering phrases'],
      conversationExample: ['Greet staff', 'Order drink', 'Pay for order'],
      estimatedDuration: 10,
      prerequisites: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
      usageCount: 0,
      averageScore: null,
      characterId: null,
    };

    mockCharacter = {
      id: 'char-1',
      name: 'Barista',
      description: 'Friendly cafe worker',
      personality: { traits: ['friendly'] },
      speakingStyle: 'Casual',
      taskSpecific: true,
      assignedTasks: [mockTask.id],
      relationshipType: null,
      isUserCreated: false,
      userId: null,
    };
  });

  describe('initializeTaskContext', () => {
    it('should create new task context', () => {
      const context = manager.initializeTaskContext(mockTask, 'N5');

      expect(context.mode).toBe('task-based');
      expect(context.task).toBe(mockTask);
      expect(context.currentObjective).toBe(0);
      expect(context.completedObjectives).toEqual([]);
      expect(context.conversationHistory).toEqual([]);
      expect(context.hints).toEqual([]);
    });

    it('should include character when provided', () => {
      const context = manager.initializeTaskContext(mockTask, 'N5', mockCharacter);

      expect(context.character).toBe(mockCharacter);
    });
  });

  describe('addMessage', () => {
    it('should add user message to history', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.addMessage(context, 'user', 'こんにちは');

      expect(context.conversationHistory.length).toBe(1);
      expect(context.conversationHistory[0].role).toBe('user');
      expect(context.conversationHistory[0].content).toBe('こんにちは');
      expect(context.conversationHistory[0].timestamp).toBeDefined();
    });

    it('should add assistant message to history', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.addMessage(context, 'assistant', 'いらっしゃいませ');

      expect(context.conversationHistory.length).toBe(1);
      expect(context.conversationHistory[0].role).toBe('assistant');
    });
  });

  describe('completeObjective', () => {
    it('should mark objective as completed', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.completeObjective(context, 0);

      expect(context.completedObjectives).toContain('Greet staff');
      expect(context.currentObjective).toBe(1);
    });

    it('should not duplicate completed objectives', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.completeObjective(context, 0);
      context = manager.completeObjective(context, 0); // Try to complete again

      expect(context.completedObjectives.length).toBe(1);
    });

    it('should advance to next objective', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.completeObjective(context, 0);
      context = manager.completeObjective(context, 1);

      expect(context.currentObjective).toBe(2);
      expect(context.completedObjectives.length).toBe(2);
    });
  });

  describe('areAllObjectivesCompleted', () => {
    it('should return false when objectives incomplete', () => {
      const context = manager.initializeTaskContext(mockTask, 'N5');

      expect(manager.areAllObjectivesCompleted(context)).toBe(false);
    });

    it('should return true when all objectives complete', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.completeObjective(context, 0);
      context = manager.completeObjective(context, 1);
      context = manager.completeObjective(context, 2);

      expect(manager.areAllObjectivesCompleted(context)).toBe(true);
    });
  });

  describe('getCurrentObjective', () => {
    it('should return current objective text', () => {
      const context = manager.initializeTaskContext(mockTask, 'N5');

      const objective = manager.getCurrentObjective(context);

      expect(objective).toBe('Greet staff');
    });

    it('should return null when all objectives complete', () => {
      const context = manager.initializeTaskContext(mockTask, 'N5');
      context.currentObjective = 999; // Beyond all objectives

      const objective = manager.getCurrentObjective(context);

      expect(objective).toBeNull();
    });
  });

  describe('getProgress', () => {
    it('should calculate progress percentage', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.completeObjective(context, 0);

      const progress = manager.getProgress(context);

      // 1 out of 3 objectives = 33%
      expect(progress).toBeCloseTo(33, 0);
    });

    it('should return 100 when all complete', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.completeObjective(context, 0);
      context = manager.completeObjective(context, 1);
      context = manager.completeObjective(context, 2);

      const progress = manager.getProgress(context);

      expect(progress).toBe(100);
    });
  });

  describe('shouldOfferHint', () => {
    it('should offer hint when user asks for help', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.addMessage(context, 'user', 'わからない');
      context = manager.addMessage(context, 'assistant', 'Response');
      context = manager.addMessage(context, 'user', '助けて');

      expect(manager.shouldOfferHint(context)).toBe(true);
    });

    it('should not offer hint for short conversation', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.addMessage(context, 'user', 'こんにちは');

      expect(manager.shouldOfferHint(context)).toBe(false);
    });
  });

  describe('serializeContext', () => {
    it('should serialize context for storage', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.addMessage(context, 'user', 'Test message');
      context = manager.completeObjective(context, 0);
      context = manager.addHint(context, 'Test hint');

      const serialized = manager.serializeContext(context);

      expect(serialized.messages.length).toBe(1);
      expect(serialized.completedObjectives.length).toBe(1);
      expect(serialized.hints.length).toBe(1);
      expect(serialized.progress).toBeGreaterThan(0);
    });
  });

  describe('deserializeContext', () => {
    it('should restore context from saved data', () => {
      const savedData = {
        messages: [
          {
            role: 'user' as const,
            content: 'Saved message',
            timestamp: new Date(),
          },
        ],
        completedObjectives: ['Greet staff'],
        currentObjective: 1,
        hints: ['Saved hint'],
      };

      const context = manager.deserializeContext(mockTask, 'N5', savedData, mockCharacter);

      expect(context.conversationHistory.length).toBe(1);
      expect(context.completedObjectives.length).toBe(1);
      expect(context.currentObjective).toBe(1);
      expect(context.hints.length).toBe(1);
      expect(context.character).toBe(mockCharacter);
    });
  });

  describe('analyzeObjectiveProgress', () => {
    it('should detect completion signals', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.addMessage(context, 'user', 'できました');
      context = manager.addMessage(context, 'assistant', 'Great!');
      context = manager.addMessage(context, 'user', 'はい、完了しました');

      const analysis = manager.analyzeObjectiveProgress(context, 0);

      expect(analysis.likelyCompleted).toBe(true);
      expect(analysis.confidence).toBeGreaterThan(50);
    });

    it('should have low confidence with no signals', () => {
      let context = manager.initializeTaskContext(mockTask, 'N5');
      context = manager.addMessage(context, 'user', 'こんにちは');

      const analysis = manager.analyzeObjectiveProgress(context, 0);

      expect(analysis.confidence).toBeLessThan(50);
    });
  });
});
