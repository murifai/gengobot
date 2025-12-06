// Simplified assessment service for task feedback system (Phase 6)
import 'openai/shims/node';
import OpenAI from 'openai';
import { Task } from '@prisma/client';
import { SimplifiedAssessment } from '@/types/assessment';
import { ObjectiveTracking } from './objective-detection';
import { MODELS } from './openai-client';
import { creditService } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';

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
  userId: string;
  attemptId: string;
}

export class SimplifiedAssessmentService {
  /**
   * Fetch related tasks from database based on current task's category and difficulty
   */
  private static async getRelatedTasks(
    task: Task,
    limit: number = 3
  ): Promise<SimplifiedAssessment['taskRecommendations']> {
    try {
      // Find tasks in the same category, excluding the current task
      const relatedTasks = await prisma.task.findMany({
        where: {
          isActive: true,
          id: { not: task.id },
          OR: [
            // Same category
            { category: task.category },
            // Same difficulty level
            { difficulty: task.difficulty },
          ],
        },
        select: {
          id: true,
          title: true,
          category: true,
          difficulty: true,
        },
        orderBy: [
          // Prioritize same category first
          { usageCount: 'desc' },
        ],
        take: limit * 2, // Get more to filter
      });

      // Sort to prioritize same category, then same difficulty
      const sortedTasks = relatedTasks.sort((a, b) => {
        const aScore =
          (a.category === task.category ? 2 : 0) + (a.difficulty === task.difficulty ? 1 : 0);
        const bScore =
          (b.category === task.category ? 2 : 0) + (b.difficulty === task.difficulty ? 1 : 0);
        return bScore - aScore;
      });

      // Take top tasks and format as recommendations
      return sortedTasks.slice(0, limit).map(t => ({
        title: t.title,
        reason:
          t.category === task.category
            ? `Task serupa dalam kategori ${t.category}`
            : `Latihan level ${t.difficulty}`,
        category: t.category,
        taskId: t.id,
      }));
    } catch (error) {
      console.error('[SimplifiedAssessmentService] Error fetching related tasks:', error);
      return [];
    }
  }

  /**
   * Generate simplified assessment based on conversation and objectives
   */
  static async generateAssessment(params: GenerateAssessmentParams): Promise<SimplifiedAssessment> {
    const { task, conversationHistory, objectiveStatus, startTime, endTime, userId, attemptId } =
      params;

    // Calculate statistics
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    const durationMinutes = Math.round(duration / 60);
    const totalMessages = conversationHistory.length;
    const userMessagesCount = conversationHistory.filter(msg => msg.role === 'user').length;
    const objectivesAchieved = objectiveStatus.filter(obj => obj.status === 'completed').length;
    const totalObjectives = objectiveStatus.length;
    const completionRate = totalObjectives > 0 ? (objectivesAchieved / totalObjectives) * 100 : 0;

    // Generate conversation feedback using AI (returns new structure)
    // Fetch related tasks from database (in parallel with AI feedback)
    const [feedbackResult, relatedTasks] = await Promise.all([
      this.generateConversationFeedback(
        task,
        conversationHistory,
        objectiveStatus,
        userId,
        attemptId
      ),
      this.getRelatedTasks(task, 3),
    ]);

    // Generate next steps
    const nextSteps = this.generateNextSteps(objectiveStatus, task);

    // Determine if retry is suggested
    const suggestRetry = objectivesAchieved < totalObjectives * 0.7; // Suggest retry if < 70% objectives achieved

    // Build objectives with feedback from AI
    const objectivesWithFeedback = objectiveStatus.map(obj => {
      // Find matching feedback from AI response
      const aiFeedback = feedbackResult.objectiveFeedback.find(
        f => f.objectiveText === obj.objectiveText || f.achieved === (obj.status === 'completed')
      );

      return {
        text: obj.objectiveText,
        achieved: obj.status === 'completed',
        evidence: obj.evidence || [],
        feedback: aiFeedback?.feedback,
        exampleJp: aiFeedback?.exampleJp,
        suggestion: aiFeedback?.suggestion,
      };
    });

    // Build simplified assessment with new structure
    const assessment: SimplifiedAssessment = {
      attemptId: '', // Will be set by the caller
      taskId: task.id,

      // Task Info
      taskTitle: task.title,
      scenarioName: task.scenario,
      difficulty: task.difficulty,

      // Objectives with feedback
      objectives: objectivesWithFeedback,
      objectivesAchieved,
      totalObjectives,

      // Language corrections
      corrections: feedbackResult.corrections,
      grammarPoint: feedbackResult.grammarPoint,
      tips: feedbackResult.tips,

      // Conversation highlights (Poin Penting Percakapan)
      conversationHighlights: feedbackResult.conversationHighlights,

      // Task recommendations (from database, not AI)
      taskRecommendations: relatedTasks,

      // Legacy fields for backward compatibility
      achievements: feedbackResult.achievements,
      practice: relatedTasks.map(r => r.reason),
      moments: feedbackResult.moments,

      // Legacy conversation feedback for backward compatibility
      conversationFeedback: feedbackResult.legacy,

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
   * AI feedback response structure
   */
  private static defaultFeedbackResponse = {
    objectiveFeedback: [],
    corrections: [],
    tips: [],
  };

  /**
   * Generate conversation feedback using AI - returns full feedback structure
   */
  private static async generateConversationFeedback(
    task: Task,
    conversationHistory: Message[],
    objectiveStatus: ObjectiveTracking[],
    userId: string,
    attemptId: string
  ): Promise<{
    legacy: SimplifiedAssessment['conversationFeedback'];
    objectiveFeedback: {
      objectiveText: string;
      achieved: boolean;
      feedback?: string;
      exampleJp?: string;
      suggestion?: string;
    }[];
    corrections: SimplifiedAssessment['corrections'];
    grammarPoint?: SimplifiedAssessment['grammarPoint'];
    tips: SimplifiedAssessment['tips'];
    conversationHighlights: SimplifiedAssessment['conversationHighlights'];
    // Legacy fields
    achievements: SimplifiedAssessment['achievements'];
    moments: SimplifiedAssessment['moments'];
  }> {
    const prompt = this.buildFeedbackPrompt(task, conversationHistory, objectiveStatus);

    try {
      const response = await openai.chat.completions.create({
        model: MODELS.ANALYSIS,
        messages: [
          {
            role: 'system',
            content:
              'You are a supportive Japanese language learning instructor providing constructive feedback in Indonesian. Be specific, educational, and encouraging. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Deduct credits for feedback generation (usage-based billing)
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;

      const creditResult = await creditService.deductCreditsFromUsage(
        userId,
        {
          model: MODELS.ANALYSIS,
          inputTokens,
          outputTokens,
        },
        attemptId,
        'task_assessment_feedback',
        'AI feedback generation for task assessment'
      );

      console.log('[Assessment Feedback] Credit deduction:', {
        attemptId,
        tokensUsed: { input: inputTokens, output: outputTokens },
        creditsDeducted: creditResult.credits,
        usdCost: creditResult.usdCost,
      });

      const feedbackData = JSON.parse(response.choices[0]?.message?.content || '{}');

      // Map objective feedback from AI response
      const objectiveFeedback = (feedbackData.objective_feedback || []).map(
        (obj: {
          objective_text: string;
          achieved: boolean;
          feedback?: string;
          example_jp?: string;
          suggestion?: string;
        }) => ({
          objectiveText: obj.objective_text,
          achieved: obj.achieved,
          feedback: obj.feedback || undefined,
          exampleJp: obj.example_jp || undefined,
          suggestion: obj.suggestion || undefined,
        })
      );

      const corrections: SimplifiedAssessment['corrections'] =
        feedbackData.corrections || this.defaultFeedbackResponse.corrections;

      const grammarPoint: SimplifiedAssessment['grammarPoint'] | undefined =
        feedbackData.grammar_point
          ? {
              title: feedbackData.grammar_point.title,
              explanation: feedbackData.grammar_point.explanation,
              examples: feedbackData.grammar_point.examples || [],
            }
          : undefined;

      const tips: SimplifiedAssessment['tips'] =
        feedbackData.tips || this.defaultFeedbackResponse.tips;

      // Map conversation highlights from AI response
      const conversationHighlights: SimplifiedAssessment['conversationHighlights'] = (
        feedbackData.conversation_highlights || []
      ).map((highlight: { exchanges: { speaker: string; text: string }[]; note: string }) => ({
        exchanges: highlight.exchanges.map(ex => ({
          speaker: ex.speaker as 'user' | 'partner',
          text: ex.text,
        })),
        note: highlight.note,
      }));

      // Generate legacy fields for backward compatibility
      const achievedObjectives = objectiveFeedback.filter((o: { achieved: boolean }) => o.achieved);
      const legacyAchievements = achievedObjectives.map(
        (o: { feedback?: string; exampleJp?: string }) => ({
          text: o.feedback || 'Objektif tercapai',
          exampleJp: o.exampleJp,
        })
      );

      const legacyStrengths = achievedObjectives.map(
        (o: { feedback?: string }) => o.feedback || 'Objektif tercapai'
      );
      const legacyAreasToImprove = corrections.map((c: { explanation: string }) => c.explanation);

      return {
        legacy: {
          strengths:
            legacyStrengths.length > 0
              ? legacyStrengths
              : ['Kamu sudah berusaha mengikuti percakapan dengan baik.'],
          areasToImprove:
            legacyAreasToImprove.length > 0
              ? legacyAreasToImprove
              : ['Terus berlatih untuk meningkatkan kemampuanmu.'],
          overallFeedback:
            grammarPoint?.explanation ||
            'Kamu sudah berusaha dengan baik dalam percakapan ini. Terus berlatih!',
          encouragement: 'Setiap percakapan adalah kesempatan belajar. Terus semangat! 頑張って！',
        },
        objectiveFeedback,
        corrections,
        grammarPoint,
        tips,
        conversationHighlights,
        // Legacy
        achievements:
          legacyAchievements.length > 0
            ? legacyAchievements
            : [{ text: 'Kamu sudah berusaha mengikuti percakapan dengan baik.' }],
        moments: [],
      };
    } catch (error) {
      console.error('Error generating conversation feedback:', error);

      // Fallback feedback if AI fails
      return {
        legacy: {
          strengths: ['Kamu sudah berusaha mengikuti percakapan dengan baik.'],
          areasToImprove: ['Terus berlatih untuk meningkatkan kepercayaan diri dan kemampuanmu.'],
          overallFeedback:
            'Kamu sudah berusaha dalam tugas ini. Terus berlatih untuk meningkatkan kemampuan percakapan Jepangmu.',
          encouragement: 'Setiap percakapan adalah kesempatan belajar. Terus semangat!',
        },
        objectiveFeedback: [],
        corrections: [],
        tips: [],
        conversationHighlights: [],
        achievements: [{ text: 'Kamu sudah berusaha mengikuti percakapan dengan baik.' }],
        moments: [],
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
    return `You are a Japanese language education expert specializing in conversational assessment. Analyze the conversation and provide helpful feedback for Indonesian learners.

## CONVERSATION LOG
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

## TASK INFORMATION
- Task Title: ${task.title}
- Scenario: ${task.scenario}
- Learner Level: ${task.difficulty}
- Category: ${task.category || 'General'}

## TASK OBJECTIVES STATUS
${objectiveStatus
  .map(
    (obj, i) =>
      `${i + 1}. "${obj.objectiveText}" - ${obj.status === 'completed' ? '✓ ACHIEVED' : '✗ NOT ACHIEVED'}`
  )
  .join('\n')}

## ASSESSMENT CRITERIA

### 1. Objective Feedback
For EACH objective above, provide:
- If ACHIEVED: Brief positive feedback describing what they did well (in Indonesian) + Japanese example from conversation
- If NOT ACHIEVED: Constructive suggestion on how to achieve it next time (in Indonesian)

### 2. Language Corrections
Identify grammar/vocabulary errors. For each error:
- Show what learner said
- Show the correct expression
- Brief explanation in Indonesian

### 3. Grammar Point (Poin Penting)
Highlight ONE important grammar point relevant to this scenario with examples.

### 4. Natural Speaking Tips
Provide tips for more natural expressions in this context.

### 5. Poin Penting Percakapan (Conversation Highlights)
Select 1-2 key moments from the conversation that are educational/noteworthy. Show the exchange and explain what happened.

## OUTPUT FORMAT (JSON)
{
  "objective_feedback": [
    {
      "objective_text": "The exact objective text",
      "achieved": true,
      "feedback": "Positive description of what they did well (Indonesian)",
      "example_jp": "Japanese example from conversation",
      "suggestion": null
    },
    {
      "objective_text": "The exact objective text",
      "achieved": false,
      "feedback": null,
      "example_jp": null,
      "suggestion": "Constructive suggestion for improvement (Indonesian)"
    }
  ],
  "corrections": [
    {
      "error": "What learner said in Japanese",
      "correct": "Correct Japanese expression",
      "explanation": "Brief explanation in Indonesian"
    }
  ],
  "grammar_point": {
    "title": "Grammar point title in Indonesian",
    "explanation": "Explanation in Indonesian",
    "examples": [
      {
        "japanese": "Japanese example",
        "meaning": "Indonesian meaning"
      }
    ]
  },
  "tips": [
    {
      "situation": "Situation description in Indonesian",
      "expression": "Japanese expression to use",
      "note": "Additional note in Indonesian"
    }
  ],
  "conversation_highlights": [
    {
      "exchanges": [
        {
          "speaker": "user",
          "text": "Japanese text from learner"
        },
        {
          "speaker": "partner",
          "text": "Japanese text from AI partner"
        }
      ],
      "note": "Explanation of what happened and why it's noteworthy (Indonesian)"
    }
  ]
}

## IMPORTANT GUIDELINES
1. Be encouraging - Frame corrections as "tips" not "mistakes"
2. Keep it simple - Maximum 4 corrections, prioritize most impactful ones
3. Be specific - Use actual quotes from the conversation
4. Use casual Indonesian - Friendly tone, like a supportive tutor
5. No scores - Only qualitative feedback
6. For objective_feedback: MUST include ALL objectives from the list above
7. Maximum 3 tips
8. Maximum 2 conversation_highlights
9. If there are no errors to correct, return empty corrections array
10. If no significant grammar point to highlight, omit grammar_point field`;
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
