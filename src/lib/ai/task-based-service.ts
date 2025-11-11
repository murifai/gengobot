// Task-Based AI Service - Main orchestrator for Japanese learning conversations
import { Task, Character } from '@prisma/client';
import { createChatCompletion } from './openai-client';
import {
  generateTaskSystemPrompt,
  generateAssessmentPrompt,
  generateHintPrompt,
  generateJLPTEstimationPrompt,
} from './prompts';
import { TaskConversationContext, TaskAssessment, Message, ConversationOptions } from '@/types/ai';

export class TaskBasedAIService {
  /**
   * Generate AI response for task-based conversation
   */
  async generateTaskResponse(
    context: TaskConversationContext,
    options?: ConversationOptions
  ): Promise<string> {
    const systemPrompt = generateTaskSystemPrompt(
      context.task,
      context.userProficiency,
      context.character
    );

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...context.conversationHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await createChatCompletion(messages, {
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 500,
      model: options?.model,
    });

    return response;
  }

  /**
   * Assess task performance based on conversation history
   */
  async assessTaskPerformance(context: TaskConversationContext): Promise<TaskAssessment> {
    const assessmentPrompt = generateAssessmentPrompt(
      context.task,
      context.conversationHistory,
      context.userProficiency
    );

    const response = await createChatCompletion([{ role: 'user', content: assessmentPrompt }], {
      temperature: 0.3, // Lower temperature for more consistent scoring
      maxTokens: 1500,
    });

    // Parse JSON response
    try {
      const assessmentData = JSON.parse(response);

      // Calculate overall score with weights
      const overallScore = this.calculateOverallScore({
        taskAchievement: assessmentData.taskAchievement,
        fluency: assessmentData.fluency,
        vocabularyGrammarAccuracy: assessmentData.vocabularyGrammarAccuracy,
        politeness: assessmentData.politeness,
      });

      return {
        taskId: context.task.id,
        attemptId: '', // Will be set by caller
        taskAchievement: assessmentData.taskAchievement,
        fluency: assessmentData.fluency,
        vocabularyGrammarAccuracy: assessmentData.vocabularyGrammarAccuracy,
        politeness: assessmentData.politeness,
        objectiveCompletion: this.evaluateObjectiveCompletion(context),
        overallScore,
        feedback: assessmentData.overallFeedback,
        specificFeedback: assessmentData.specificFeedback,
        areasForImprovement: assessmentData.areasForImprovement,
        strengths: assessmentData.strengths,
        recommendedNextTasks: [], // Will be populated by recommendation engine
        timeToComplete: this.calculateTimeToComplete(context),
        retryRecommendation: overallScore < 70,
        estimatedJLPTLevel: context.userProficiency,
        progressToNextLevel: this.estimateProgressToNextLevel(overallScore),
      };
    } catch (error) {
      console.error('Failed to parse assessment response:', error);
      throw new Error('Failed to generate task assessment');
    }
  }

  /**
   * Validate if task objectives are completed
   */
  async validateObjectiveCompletion(context: TaskConversationContext): Promise<boolean> {
    const objectives = context.task.conversationExample as unknown as string[];
    const completedCount = context.completedObjectives.length;

    // All objectives must be completed
    return completedCount >= objectives.length;
  }

  /**
   * Generate hints when student is struggling
   */
  async generateTaskHints(context: TaskConversationContext): Promise<string[]> {
    const objectives = context.task.conversationExample as unknown as string[];
    const currentObj = objectives[context.currentObjective];

    if (!currentObj) return [];

    const hintPrompt = generateHintPrompt(context.task, currentObj, context.conversationHistory);

    const hint = await createChatCompletion([{ role: 'user', content: hintPrompt }], {
      temperature: 0.7,
      maxTokens: 150,
    });

    return [hint];
  }

  /**
   * Recommend next tasks based on completed task
   */
  async recommendNextTasks(
    userId: string,
    completedTask: Task,
    assessment: TaskAssessment
  ): Promise<Task[]> {
    // This will be implemented with database queries
    // For now, return empty array
    return [];
  }

  /**
   * Evaluate task achievement criterion
   */
  async evaluateTaskAchievement(context: TaskConversationContext): Promise<number> {
    const completionRate =
      (context.completedObjectives.length /
        (context.task.conversationExample as unknown as string[]).length) *
      100;
    return Math.min(completionRate, 100);
  }

  /**
   * Evaluate fluency criterion
   */
  async evaluateFluency(context: TaskConversationContext): Promise<number> {
    // Analyze conversation flow and response timing
    const userMessages = context.conversationHistory.filter(m => m.role === 'user');

    if (userMessages.length === 0) return 0;

    // Simple heuristic: longer, more natural responses indicate better fluency
    const avgLength =
      userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;

    // Score based on message length (rough heuristic)
    return Math.min((avgLength / 50) * 100, 100);
  }

  /**
   * Evaluate vocabulary and grammar accuracy
   */
  async evaluateVocabularyGrammar(context: TaskConversationContext): Promise<number> {
    // This would require more sophisticated NLP analysis
    // For now, return a placeholder
    // In production, this would use GPT-4 to analyze grammar and vocabulary
    return 75; // Placeholder
  }

  /**
   * Evaluate politeness level
   */
  async evaluatePoliteness(context: TaskConversationContext): Promise<number> {
    // Analyze use of polite forms and appropriate language
    const userMessages = context.conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content);

    // Check for common polite forms
    const politeMarkers = ['です', 'ます', 'ございます', 'お', 'ご'];
    let politeCount = 0;

    userMessages.forEach(msg => {
      politeMarkers.forEach(marker => {
        if (msg.includes(marker)) politeCount++;
      });
    });

    // Score based on politeness marker frequency
    return Math.min((politeCount / userMessages.length) * 50 + 50, 100);
  }

  /**
   * Generate specific feedback for each criterion
   */
  async generateSpecificFeedback(assessment: TaskAssessment): Promise<{
    taskAchievement: string;
    fluency: string;
    vocabularyGrammar: string;
    politeness: string;
  }> {
    // Generate detailed feedback for each criterion
    return {
      taskAchievement: this.getFeedbackForScore(assessment.taskAchievement, 'task completion'),
      fluency: this.getFeedbackForScore(assessment.fluency, 'fluency'),
      vocabularyGrammar: this.getFeedbackForScore(
        assessment.vocabularyGrammarAccuracy,
        'vocabulary and grammar'
      ),
      politeness: this.getFeedbackForScore(assessment.politeness, 'politeness'),
    };
  }

  /**
   * Estimate JLPT level from user history
   */
  async estimateJLPTLevel(
    userHistory: Array<{
      taskAchievement: number;
      fluency: number;
      vocabularyGrammarAccuracy: number;
      politeness: number;
      taskDifficulty: string;
    }>
  ): Promise<string> {
    if (userHistory.length === 0) return 'N5';

    const prompt = generateJLPTEstimationPrompt(userHistory);
    const response = await createChatCompletion([{ role: 'user', content: prompt }], {
      temperature: 0.3,
      maxTokens: 500,
    });

    try {
      const estimation = JSON.parse(response);
      return estimation.estimatedLevel;
    } catch (error) {
      console.error('Failed to parse JLPT estimation:', error);
      return 'N5';
    }
  }

  // Helper methods

  private calculateOverallScore(scores: {
    taskAchievement: number;
    fluency: number;
    vocabularyGrammarAccuracy: number;
    politeness: number;
  }): number {
    // Weighted scoring
    const weights = {
      taskAchievement: 0.35,
      fluency: 0.25,
      vocabularyGrammarAccuracy: 0.25,
      politeness: 0.15,
    };

    return (
      scores.taskAchievement * weights.taskAchievement +
      scores.fluency * weights.fluency +
      scores.vocabularyGrammarAccuracy * weights.vocabularyGrammarAccuracy +
      scores.politeness * weights.politeness
    );
  }

  private evaluateObjectiveCompletion(context: TaskConversationContext): {
    [objective: string]: boolean;
  } {
    const objectives = context.task.conversationExample as unknown as string[];
    const completion: { [objective: string]: boolean } = {};

    objectives.forEach((obj, index) => {
      completion[obj] = context.completedObjectives.includes(obj);
    });

    return completion;
  }

  private calculateTimeToComplete(context: TaskConversationContext): number {
    // Calculate based on conversation history timestamps
    if (context.conversationHistory.length < 2) return 0;

    const start = context.conversationHistory[0].timestamp;
    const end = context.conversationHistory[context.conversationHistory.length - 1].timestamp;

    if (!start || !end) return 0;

    return Math.round((end.getTime() - start.getTime()) / 1000 / 60); // Minutes
  }

  private estimateProgressToNextLevel(overallScore: number): number {
    // Simple heuristic: score above 80 shows readiness for next level
    if (overallScore >= 80) return Math.min((overallScore - 80) * 5, 100);
    return (overallScore / 80) * 50;
  }

  private getFeedbackForScore(score: number, criterion: string): string {
    if (score >= 90) return `Excellent ${criterion}! Keep up the great work.`;
    if (score >= 75) return `Good ${criterion}. A few areas could be refined.`;
    if (score >= 60) return `Adequate ${criterion}, but there's room for improvement.`;
    return `${criterion} needs significant work. Focus on this area.`;
  }
}
