/**
 * @jest-environment node
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Task, Character } from '@prisma/client';
import { TaskConversationContext } from '@/types/ai';

// Mock the entire openai-client module
const mockCreateChatCompletion = jest.fn();

jest.mock('@/lib/ai/openai-client', () => ({
  createChatCompletion: mockCreateChatCompletion,
  MODELS: {
    GPT_4: 'gpt-4-turbo-preview',
    GPT_35_TURBO: 'gpt-3.5-turbo',
    WHISPER: 'whisper-1',
    TTS: 'tts-1',
  },
  default: jest.fn(() => ({})),
}));

import { TaskBasedAIService } from '@/lib/ai/task-based-service';

describe('TaskBasedAIService', () => {
  let service: TaskBasedAIService;
  let mockTask: Task;
  let mockContext: TaskConversationContext;

  beforeEach(() => {
    service = new TaskBasedAIService();

    mockTask = {
      id: 'task-1',
      title: 'Order Ramen at a Restaurant',
      description: 'Practice ordering food in Japanese',
      category: 'Restaurant',
      difficulty: 'N5',
      scenario: 'You are at a ramen restaurant and want to order...',
      learningObjectives: ['Food vocabulary', 'Polite ordering phrases'],
      conversationExample: ['Greet the staff', 'Order a dish', 'Specify preferences'],
      estimatedDuration: 15,
      prerequisites: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: null,
      usageCount: 0,
      averageScore: null,
      characterId: null,
    };

    mockContext = {
      mode: 'task-based',
      task: mockTask,
      currentObjective: 0,
      completedObjectives: [],
      userProficiency: 'N5',
      conversationHistory: [
        {
          role: 'assistant',
          content: 'いらっしゃいませ！',
          timestamp: new Date(),
        },
        {
          role: 'user',
          content: 'こんにちは',
          timestamp: new Date(),
        },
      ],
      taskAttemptCount: 1,
      hints: [],
    };
  });

  describe('generateTaskResponse', () => {
    it('should generate task-appropriate responses', async () => {
      mockCreateChatCompletion.mockResolvedValue('ご注文はお決まりですか？');

      const response = await service.generateTaskResponse(mockContext);

      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
      expect(mockCreateChatCompletion).toHaveBeenCalled();
    });

    it('should include character personality when provided', async () => {
      const mockCharacter: Character = {
        id: 'char-1',
        name: 'Friendly Server',
        description: 'A cheerful restaurant server',
        personality: { traits: ['friendly', 'helpful'] },
        speakingStyle: 'Casual and warm',
        taskSpecific: true,
        assignedTasks: [mockTask.id],
        relationshipType: null,
        isUserCreated: false,
        userId: null,
      };

      mockContext.character = mockCharacter;
      mockCreateChatCompletion.mockResolvedValue('どうぞ、ごゆっくり！');

      const response = await service.generateTaskResponse(mockContext);

      expect(response).toBeDefined();
      expect(mockCreateChatCompletion).toHaveBeenCalled();
    });
  });

  describe('assessTaskPerformance', () => {
    it('should evaluate all four criteria', async () => {
      const mockAssessment = {
        taskAchievement: 85,
        fluency: 75,
        vocabularyGrammarAccuracy: 80,
        politeness: 90,
        specificFeedback: {
          taskAchievement: 'Good progress',
          fluency: 'Natural flow',
          vocabularyGrammar: 'Minor errors',
          politeness: 'Excellent',
        },
        areasForImprovement: ['Grammar'],
        strengths: ['Politeness'],
        overallFeedback: 'Great job!',
      };

      mockCreateChatCompletion.mockResolvedValue(JSON.stringify(mockAssessment));

      const assessment = await service.assessTaskPerformance(mockContext);

      expect(assessment.taskAchievement).toBeDefined();
      expect(assessment.fluency).toBeDefined();
      expect(assessment.vocabularyGrammarAccuracy).toBeDefined();
      expect(assessment.politeness).toBeDefined();
      expect(assessment.overallScore).toBeGreaterThanOrEqual(0);
      expect(assessment.overallScore).toBeLessThanOrEqual(100);
    });

    it('should recommend retry for low scores', async () => {
      const mockAssessment = {
        taskAchievement: 50,
        fluency: 45,
        vocabularyGrammarAccuracy: 40,
        politeness: 55,
        specificFeedback: {
          taskAchievement: 'Needs work',
          fluency: 'Hesitant',
          vocabularyGrammar: 'Many errors',
          politeness: 'Adequate',
        },
        areasForImprovement: ['All areas'],
        strengths: [],
        overallFeedback: 'Keep practicing',
      };

      mockCreateChatCompletion.mockResolvedValue(JSON.stringify(mockAssessment));

      const assessment = await service.assessTaskPerformance(mockContext);

      expect(assessment.retryRecommendation).toBe(true);
    });
  });

  describe('validateObjectiveCompletion', () => {
    it('should return false when objectives incomplete', async () => {
      const isComplete = await service.validateObjectiveCompletion(mockContext);
      expect(isComplete).toBe(false);
    });

    it('should return true when all objectives complete', async () => {
      mockContext.completedObjectives = ['Greet the staff', 'Order a dish', 'Specify preferences'];

      const isComplete = await service.validateObjectiveCompletion(mockContext);
      expect(isComplete).toBe(true);
    });
  });

  describe('generateTaskHints', () => {
    it('should generate helpful hints', async () => {
      mockCreateChatCompletion.mockResolvedValue('Try saying "ラーメンをお願いします"');

      const hints = await service.generateTaskHints(mockContext);

      expect(hints).toBeDefined();
      expect(hints.length).toBeGreaterThan(0);
    });
  });

  describe('evaluateTaskAchievement', () => {
    it('should calculate completion percentage', async () => {
      mockContext.completedObjectives = ['Greet the staff'];

      const score = await service.evaluateTaskAchievement(mockContext);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
      // 1 out of 3 objectives = 33.33%
      expect(score).toBeCloseTo(33.33, 1);
    });

    it('should return 100 for all objectives completed', async () => {
      mockContext.completedObjectives = ['Greet the staff', 'Order a dish', 'Specify preferences'];

      const score = await service.evaluateTaskAchievement(mockContext);

      expect(score).toBe(100);
    });
  });

  describe('evaluateFluency', () => {
    it('should score based on message content', async () => {
      const score = await service.evaluateFluency(mockContext);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for no user messages', async () => {
      mockContext.conversationHistory = [];

      const score = await service.evaluateFluency(mockContext);

      expect(score).toBe(0);
    });
  });

  describe('estimateJLPTLevel', () => {
    it('should estimate level from performance history', async () => {
      const userHistory = [
        {
          taskAchievement: 85,
          fluency: 80,
          vocabularyGrammarAccuracy: 75,
          politeness: 90,
          taskDifficulty: 'N5',
        },
        {
          taskAchievement: 80,
          fluency: 78,
          vocabularyGrammarAccuracy: 82,
          politeness: 85,
          taskDifficulty: 'N5',
        },
      ];

      const mockEstimation = {
        estimatedLevel: 'N4',
        confidenceScore: 75,
        progressToNextLevel: 60,
        strengths: ['Politeness'],
        areasForImprovement: ['Grammar'],
        reasoning: 'Consistent performance',
      };

      mockCreateChatCompletion.mockResolvedValue(JSON.stringify(mockEstimation));

      const level = await service.estimateJLPTLevel(userHistory);

      expect(['N5', 'N4', 'N3', 'N2', 'N1']).toContain(level);
    });

    it('should return N5 for empty history', async () => {
      const level = await service.estimateJLPTLevel([]);
      expect(level).toBe('N5');
    });
  });
});
