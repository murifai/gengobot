// Simplified assessment service for task feedback system (Phase 6)
import 'openai/shims/node';
import OpenAI from 'openai';
import { Task } from '@prisma/client';
import { SimplifiedAssessment } from '@/types/assessment';
import { ObjectiveTracking } from './objective-detection';
import { MODELS } from './openai-client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GenerateAssessmentParams {
  task: Task;
  conversationHistory: Message[];
  objectiveStatus: ObjectiveTracking[];
  startTime: Date;
  endTime: Date;
}

export class SimplifiedAssessmentService {
  /**
   * Generate simplified assessment based on conversation and objectives
   */
  static async generateAssessment(params: GenerateAssessmentParams): Promise<SimplifiedAssessment> {
    const { task, conversationHistory, objectiveStatus, startTime, endTime } = params;

    // Calculate statistics
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    const durationMinutes = Math.round(duration / 60);
    const totalMessages = conversationHistory.length;
    const userMessagesCount = conversationHistory.filter(msg => msg.role === 'user').length;
    const objectivesAchieved = objectiveStatus.filter(obj => obj.status === 'completed').length;
    const totalObjectives = objectiveStatus.length;
    const completionRate = totalObjectives > 0 ? (objectivesAchieved / totalObjectives) * 100 : 0;

    // Generate conversation feedback using AI
    const conversationFeedback = await this.generateConversationFeedback(
      task,
      conversationHistory,
      objectiveStatus
    );

    // Generate next steps
    const nextSteps = this.generateNextSteps(objectiveStatus, task);

    // Determine if retry is suggested
    const suggestRetry = objectivesAchieved < totalObjectives * 0.7; // Suggest retry if < 70% objectives achieved

    // Build simplified assessment
    const assessment: SimplifiedAssessment = {
      attemptId: '', // Will be set by the caller
      taskId: task.id,

      // Objectives
      objectives: objectiveStatus.map(obj => ({
        text: obj.objectiveText,
        achieved: obj.status === 'completed',
        evidence: obj.evidence || [],
      })),
      objectivesAchieved,
      totalObjectives,

      // Conversation feedback
      conversationFeedback,

      // Statistics
      statistics: {
        duration,
        durationMinutes,
        totalMessages,
        userMessagesCount,
        completionRate: Math.round(completionRate),
      },

      // Recommendations
      suggestRetry,
      nextSteps,

      assessmentDate: new Date(),
    };

    return assessment;
  }

  /**
   * Generate conversation feedback using AI
   */
  private static async generateConversationFeedback(
    task: Task,
    conversationHistory: Message[],
    objectiveStatus: ObjectiveTracking[]
  ): Promise<SimplifiedAssessment['conversationFeedback']> {
    const prompt = this.buildFeedbackPrompt(task, conversationHistory, objectiveStatus);

    try {
      const response = await openai.chat.completions.create({
        model: MODELS.ANALYSIS,
        messages: [
          {
            role: 'system',
            content:
              'You are a supportive Japanese language learning instructor providing constructive feedback. Be specific, educational, and encouraging.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      });

      const feedbackData = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        strengths: feedbackData.strengths || [
          'You participated in the conversation and attempted the task.',
        ],
        areasToImprove: feedbackData.areasToImprove || [
          'Continue practicing to improve your skills.',
        ],
        overallFeedback:
          feedbackData.overallFeedback ||
          'You made a good effort in this task. Keep practicing to improve your Japanese skills.',
        encouragement:
          feedbackData.encouragement ||
          'Keep up the good work! Regular practice will help you improve.',
      };
    } catch (error) {
      console.error('Error generating conversation feedback:', error);

      // Fallback feedback if AI fails
      return {
        strengths: ['You participated in the conversation and attempted the task.'],
        areasToImprove: ['Continue practicing to build your confidence and skills.'],
        overallFeedback:
          'You engaged with the task. Keep practicing to improve your Japanese conversation skills.',
        encouragement: 'Every conversation is a learning opportunity. Keep going!',
      };
    }
  }

  /**
   * Build the feedback prompt for AI
   */
  private static buildFeedbackPrompt(
    task: Task,
    conversationHistory: Message[],
    objectiveStatus: ObjectiveTracking[]
  ): string {
    return `You are providing feedback for a Japanese language learning task completion.

# Task Details
- Title: ${task.title}
- Scenario: ${task.scenario}
- JLPT Level: ${task.difficulty}

# Learning Objectives & Achievement:
${objectiveStatus
  .map(
    (obj, i) =>
      `${i + 1}. ${obj.objectiveText} - ${obj.status === 'completed' ? '✓ ACHIEVED' : '✗ NOT ACHIEVED'}`
  )
  .join('\n')}

# Complete Conversation:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

# Your Task:
Provide constructive feedback on the learner's conversation performance.

Focus on:
1. What they did well (strengths) - be specific with examples
2. What they can improve (specific, actionable advice)
3. Overall assessment of their communication
4. Encouragement and positive reinforcement

Be supportive, specific, and educational. Reference actual messages when possible.

Response Format (JSON):
{
  "strengths": [
    "Successfully used polite expressions like 'お願いします'",
    "Clear and natural question formation",
    "Good use of appropriate vocabulary for the situation"
  ],
  "areasToImprove": [
    "Could use more varied sentence structures",
    "Try incorporating more conjunctions like 'それから' to connect ideas",
    "Practice using past tense forms more consistently"
  ],
  "overallFeedback": "You demonstrated good understanding of the restaurant scenario and successfully communicated your needs. Your use of polite language was appropriate, though there's room to expand your vocabulary range. Keep practicing natural conversation flow.",
  "encouragement": "Great job completing this task! You're making solid progress in practical Japanese conversation. Keep up the good work!"
}`;
  }

  /**
   * Generate next steps based on performance
   */
  private static generateNextSteps(objectiveStatus: ObjectiveTracking[], task: Task): string[] {
    const achievedCount = objectiveStatus.filter(obj => obj.status === 'completed').length;
    const totalCount = objectiveStatus.length;
    const completionRate = totalCount > 0 ? achievedCount / totalCount : 0;

    const steps: string[] = [];

    if (completionRate < 0.5) {
      // Low completion - focus on basics
      steps.push(`Review the task scenario and objectives before trying again`);
      steps.push(`Practice basic ${task.difficulty} level vocabulary and grammar`);
      steps.push(`Try similar beginner-friendly tasks to build confidence`);
    } else if (completionRate < 1.0) {
      // Partial completion - focus on missed objectives
      const missedObjectives = objectiveStatus
        .filter(obj => obj.status !== 'completed')
        .map(obj => obj.objectiveText);

      if (missedObjectives.length > 0) {
        steps.push(`Focus on the objectives you didn't complete: ${missedObjectives[0]}`);
      }
      steps.push(`Retry this task to achieve all objectives`);
      steps.push(`Practice similar scenarios to reinforce your skills`);
    } else {
      // Full completion - advance
      steps.push(`Try more challenging tasks at the ${task.difficulty} level`);
      steps.push(`Explore tasks in different categories to broaden your skills`);
      if (task.difficulty !== 'N1') {
        steps.push(`Consider trying tasks at the next JLPT level`);
      }
    }

    return steps.slice(0, 3); // Return top 3 suggestions
  }
}
