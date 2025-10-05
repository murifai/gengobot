// Task-based assessment service for Japanese language learning
import 'openai/shims/node';
import OpenAI from 'openai';
import {
  TaskAssessment,
  AssessmentCriteria,
  JLPTLevelEstimation,
  SkillGapAnalysis,
  DEFAULT_ASSESSMENT_WEIGHTS,
  AssessmentWeights,
} from '@/types/assessment';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AssessmentContext {
  taskId: string;
  attemptId: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  taskObjectives: string[];
  completedObjectives: string[];
  taskDifficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  startTime: Date;
  endTime: Date;
}

export class TaskAssessmentService {
  /**
   * Generate comprehensive task assessment
   */
  static async generateTaskAssessment(
    context: AssessmentContext,
    weights: AssessmentWeights = DEFAULT_ASSESSMENT_WEIGHTS
  ): Promise<TaskAssessment> {
    // Evaluate all four criteria in parallel
    const [taskAchievement, fluency, vocabularyGrammar, politeness, criteria] = await Promise.all([
      this.evaluateTaskAchievement(context),
      this.evaluateFluency(context),
      this.evaluateVocabularyGrammar(context),
      this.evaluatePoliteness(context),
      this.extractDetailedCriteria(context),
    ]);

    // Calculate overall weighted score
    const overallScore =
      taskAchievement * weights.taskAchievement +
      fluency * weights.fluency +
      vocabularyGrammar * weights.vocabularyGrammarAccuracy +
      politeness * weights.politeness;

    // Generate specific feedback for each criterion
    const specificFeedback = await this.generateSpecificFeedback({
      taskAchievement,
      fluency,
      vocabularyGrammarAccuracy: vocabularyGrammar,
      politeness,
      criteria,
      context,
    });

    // Analyze skill gaps and strengths
    const skillAnalysis = await this.analyzeSkillGaps({
      taskAchievement,
      fluency,
      vocabularyGrammarAccuracy: vocabularyGrammar,
      politeness,
      conversationHistory: context.conversationHistory,
    });

    // Estimate JLPT level
    const jlptEstimation = await this.estimateJLPTLevel(context);

    // Determine objective completion
    const objectiveCompletion: { [key: string]: boolean } = {};
    context.taskObjectives.forEach((objective, index) => {
      objectiveCompletion[`objective_${index}`] = context.completedObjectives.includes(objective);
    });

    // Calculate time to complete in minutes
    const timeToComplete = Math.round(
      (context.endTime.getTime() - context.startTime.getTime()) / 60000
    );

    // Determine if retry is recommended
    const retryRecommendation = overallScore < 70 || taskAchievement < 60;

    // Get recommended next tasks
    const recommendedNextTasks = await this.recommendNextTasks(
      context.taskId,
      skillAnalysis,
      jlptEstimation.currentLevel
    );

    return {
      taskId: context.taskId,
      attemptId: context.attemptId,
      taskAchievement,
      fluency,
      vocabularyGrammarAccuracy: vocabularyGrammar,
      politeness,
      objectiveCompletion,
      overallScore: Math.round(overallScore),
      feedback: await this.generateOverallFeedback({
        overallScore,
        taskAchievement,
        fluency,
        vocabularyGrammar,
        politeness,
      }),
      specificFeedback,
      areasForImprovement: skillAnalysis.weakestAreas.map(a => a.category),
      strengths: skillAnalysis.strongestAreas.map(a => a.category),
      recommendedNextTasks,
      timeToComplete,
      retryRecommendation,
      estimatedJLPTLevel: jlptEstimation.currentLevel,
      progressToNextLevel: jlptEstimation.progressToNextLevel,
      assessmentDate: new Date(),
      conversationTurns: Math.floor(context.conversationHistory.length / 2),
      totalMessages: context.conversationHistory.length,
    };
  }

  /**
   * Evaluate task achievement (タスク達成度)
   */
  static async evaluateTaskAchievement(context: AssessmentContext): Promise<number> {
    const objectiveCompletionRate =
      (context.completedObjectives.length / context.taskObjectives.length) * 100;

    // Use AI to evaluate quality of completion
    const prompt = `Evaluate the task achievement quality for a Japanese language learning task.

Task Objectives:
${context.taskObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Completed Objectives:
${context.completedObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Recent Conversation:
${context.conversationHistory
  .slice(-6)
  .map(msg => `${msg.role}: ${msg.content}`)
  .join('\n')}

Provide a quality score (0-100) for how well the objectives were completed.
Consider: thoroughness, appropriateness of responses, successful communication.

Respond with only a number between 0 and 100.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a Japanese language learning expert evaluating task achievement.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const qualityScore = parseInt(response.choices[0]?.message?.content || '50');

      // Combine completion rate and quality
      return Math.round(objectiveCompletionRate * 0.6 + qualityScore * 0.4);
    } catch (error) {
      console.error('Error evaluating task achievement:', error);
      return Math.round(objectiveCompletionRate);
    }
  }

  /**
   * Evaluate fluency (流暢さ)
   */
  static async evaluateFluency(context: AssessmentContext): Promise<number> {
    const userMessages = context.conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');

    const prompt = `Evaluate the Japanese language fluency (流暢さ) of this learner's conversation.

Level: ${context.taskDifficulty}

User Messages:
${userMessages}

Evaluate based on:
1. Response naturalness and flow
2. Sentence complexity appropriate for level
3. Lack of hesitation or unnatural pauses (based on message structure)
4. Appropriate use of connecting words and particles

Provide a fluency score (0-100) where:
- 90-100: Native-like fluency for the level
- 70-89: Good fluency with minor issues
- 50-69: Moderate fluency with some awkwardness
- 30-49: Limited fluency with frequent issues
- 0-29: Very limited fluency

Respond with only a number between 0 and 100.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a Japanese language expert evaluating conversational fluency.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const score = parseInt(response.choices[0]?.message?.content || '50');
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Error evaluating fluency:', error);
      return 50;
    }
  }

  /**
   * Evaluate vocabulary and grammar accuracy (語彙・文法的正確さ)
   */
  static async evaluateVocabularyGrammar(context: AssessmentContext): Promise<number> {
    const userMessages = context.conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');

    const prompt = `Evaluate the vocabulary and grammar accuracy (語彙・文法的正確さ) of this Japanese learner.

Expected Level: ${context.taskDifficulty}

User Messages:
${userMessages}

Evaluate based on:
1. Grammar accuracy (particles, verb conjugations, sentence structure)
2. Vocabulary appropriateness for the level and context
3. Correct word choice and collocations
4. Proper use of JLPT-appropriate grammar patterns

Provide a score (0-100) where:
- 90-100: Excellent accuracy with minimal errors
- 70-89: Good accuracy with minor errors
- 50-69: Moderate accuracy with some errors
- 30-49: Limited accuracy with frequent errors
- 0-29: Very limited accuracy

Respond with only a number between 0 and 100.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a Japanese language expert evaluating grammar and vocabulary.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const score = parseInt(response.choices[0]?.message?.content || '50');
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Error evaluating vocabulary/grammar:', error);
      return 50;
    }
  }

  /**
   * Evaluate politeness (丁寧さ)
   */
  static async evaluatePoliteness(context: AssessmentContext): Promise<number> {
    const userMessages = context.conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');

    const prompt = `Evaluate the politeness and appropriateness (丁寧さ) of this Japanese learner's language use.

Context Level: ${context.taskDifficulty}

User Messages:
${userMessages}

Evaluate based on:
1. Appropriate level of formality for the situation
2. Correct use of keigo (honorifics) when needed
3. Polite expressions and phrases
4. Cultural appropriateness of responses

Provide a score (0-100) where:
- 90-100: Excellent politeness and appropriateness
- 70-89: Good politeness with minor issues
- 50-69: Moderate politeness but some inappropriate choices
- 30-49: Limited politeness with frequent issues
- 0-29: Inappropriate or rude language use

Respond with only a number between 0 and 100.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a Japanese language expert evaluating politeness and cultural appropriateness.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const score = parseInt(response.choices[0]?.message?.content || '50');
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Error evaluating politeness:', error);
      return 50;
    }
  }

  /**
   * Extract detailed assessment criteria
   */
  private static async extractDetailedCriteria(
    context: AssessmentContext
  ): Promise<AssessmentCriteria> {
    // This would involve more detailed analysis
    // For now, return a simplified version
    return {
      taskAchievement: {
        objectivesCompleted: context.completedObjectives.length,
        totalObjectives: context.taskObjectives.length,
        qualityOfCompletion: 75,
      },
      fluency: {
        averageResponseTime: 3000,
        hesitationMarkers: 2,
        sentenceComplexity: 70,
        naturalness: 75,
      },
      vocabularyGrammar: {
        vocabularyRange: 70,
        grammarAccuracy: 75,
        appropriateWordChoice: 80,
        jlptLevelMatch: true,
      },
      politeness: {
        appropriateFormality: 85,
        honorifics: 70,
        culturalAwareness: 75,
      },
    };
  }

  /**
   * Generate specific feedback for each criterion
   */
  private static async generateSpecificFeedback(params: {
    taskAchievement: number;
    fluency: number;
    vocabularyGrammarAccuracy: number;
    politeness: number;
    criteria: AssessmentCriteria;
    context: AssessmentContext;
  }): Promise<TaskAssessment['specificFeedback']> {
    const { taskAchievement, fluency, vocabularyGrammarAccuracy, politeness } = params;

    return {
      taskAchievement: this.getFeedbackText('taskAchievement', taskAchievement),
      fluency: this.getFeedbackText('fluency', fluency),
      vocabularyGrammar: this.getFeedbackText('vocabularyGrammar', vocabularyGrammarAccuracy),
      politeness: this.getFeedbackText('politeness', politeness),
    };
  }

  /**
   * Get feedback text based on score
   */
  private static getFeedbackText(category: string, score: number): string {
    const feedbackTemplates: Record<string, Record<string, string>> = {
      taskAchievement: {
        excellent:
          'Excellent task completion! You successfully achieved all objectives with high quality responses.',
        good: 'Good job completing the task objectives. Most goals were achieved effectively.',
        moderate:
          'You completed some objectives, but there is room for improvement in thoroughness.',
        needs_improvement:
          'Task objectives were partially completed. Focus on addressing all required points.',
      },
      fluency: {
        excellent: 'Your Japanese flows naturally and smoothly. Excellent conversational ability!',
        good: 'Good fluency overall. Your responses are generally natural with minor hesitations.',
        moderate: 'Moderate fluency. Work on connecting ideas more smoothly and reducing pauses.',
        needs_improvement:
          'Focus on building more natural conversation flow and sentence connections.',
      },
      vocabularyGrammar: {
        excellent: 'Excellent vocabulary range and grammar accuracy! Very few errors.',
        good: 'Good use of vocabulary and grammar with only minor mistakes.',
        moderate: 'Adequate vocabulary but some grammar errors. Review particles and verb forms.',
        needs_improvement: 'Focus on improving grammar accuracy and expanding vocabulary range.',
      },
      politeness: {
        excellent: 'Perfect use of polite language and appropriate formality levels!',
        good: 'Good politeness and appropriate formality in most situations.',
        moderate: 'Adequate politeness but inconsistent formality levels. Review keigo usage.',
        needs_improvement: 'Work on using more appropriate polite expressions and honorifics.',
      },
    };

    const level =
      score >= 90
        ? 'excellent'
        : score >= 70
          ? 'good'
          : score >= 50
            ? 'moderate'
            : 'needs_improvement';

    return feedbackTemplates[category]?.[level] || 'Keep practicing!';
  }

  /**
   * Analyze skill gaps
   */
  private static async analyzeSkillGaps(params: {
    taskAchievement: number;
    fluency: number;
    vocabularyGrammarAccuracy: number;
    politeness: number;
    conversationHistory: Array<{ role: string; content: string }>;
  }): Promise<SkillGapAnalysis> {
    const scores = {
      'Task Completion': params.taskAchievement,
      Fluency: params.fluency,
      'Vocabulary & Grammar': params.vocabularyGrammarAccuracy,
      Politeness: params.politeness,
    };

    const sortedScores = Object.entries(scores).sort(([, a], [, b]) => a - b);

    return {
      weakestAreas: sortedScores.slice(0, 2).map(([category, score]) => ({
        category,
        score,
        examples: [],
        recommendedTasks: [],
      })),
      strongestAreas: sortedScores.slice(-2).map(([category, score]) => ({
        category,
        score,
        examples: [],
      })),
      overallProgress: {
        taskAchievement: params.taskAchievement,
        fluency: params.fluency,
        vocabularyGrammar: params.vocabularyGrammarAccuracy,
        politeness: params.politeness,
      },
    };
  }

  /**
   * Estimate JLPT level
   */
  static async estimateJLPTLevel(context: AssessmentContext): Promise<JLPTLevelEstimation> {
    // Simple estimation based on task difficulty and performance
    const levels: Array<'N5' | 'N4' | 'N3' | 'N2' | 'N1'> = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const currentIndex = levels.indexOf(context.taskDifficulty);
    const completionRate = context.completedObjectives.length / context.taskObjectives.length;

    let estimatedLevel = context.taskDifficulty;
    let progressToNext = completionRate * 100;

    if (completionRate >= 0.9 && currentIndex < levels.length - 1) {
      // Performing very well, suggest next level
      progressToNext = 75;
    } else if (completionRate < 0.6 && currentIndex > 0) {
      // Struggling, might need to work at lower level
      estimatedLevel = levels[currentIndex - 1];
      progressToNext = 40;
    }

    return {
      currentLevel: estimatedLevel,
      confidence: 75,
      progressToNextLevel: Math.round(progressToNext),
      estimationBasis: {
        vocabularyLevel: context.taskDifficulty,
        grammarLevel: context.taskDifficulty,
        conversationComplexity: context.taskDifficulty,
        taskDifficultyHandled: context.taskDifficulty,
      },
      recommendedStudyAreas: [],
    };
  }

  /**
   * Recommend next tasks based on performance
   */
  private static async recommendNextTasks(
    _currentTaskId: string,
    _skillAnalysis: SkillGapAnalysis,
    _jlptLevel: string
  ): Promise<string[]> {
    // This would query the database for appropriate tasks
    // For now, return empty array
    return [];
  }

  /**
   * Generate overall feedback summary
   */
  private static async generateOverallFeedback(params: {
    overallScore: number;
    taskAchievement: number;
    fluency: number;
    vocabularyGrammar: number;
    politeness: number;
  }): Promise<string> {
    const { overallScore, taskAchievement, fluency, vocabularyGrammar, politeness } = params;

    if (overallScore >= 90) {
      return `Outstanding performance! You demonstrated excellent Japanese language skills across all areas. Your task completion (${taskAchievement}%), fluency (${fluency}%), grammar accuracy (${vocabularyGrammar}%), and politeness (${politeness}%) were all exceptional. Keep up the excellent work!`;
    } else if (overallScore >= 75) {
      return `Great job! You showed strong Japanese language abilities. Continue to refine your skills, particularly in areas where you scored below 80%. Focus on consistent practice to maintain this level.`;
    } else if (overallScore >= 60) {
      return `Good effort! You're making progress in Japanese. Focus on improving your weaker areas while maintaining your strengths. Regular practice with similar tasks will help you improve.`;
    } else {
      return `Keep practicing! Japanese language learning takes time. Focus on the specific areas for improvement mentioned in the detailed feedback. Consider reviewing the task objectives and trying similar tasks to build confidence.`;
    }
  }

  /**
   * Calculate progress metrics for a user
   */
  static calculateProgressMetrics(assessments: TaskAssessment[]): {
    averageScores: {
      taskAchievement: number;
      fluency: number;
      vocabularyGrammarAccuracy: number;
      politeness: number;
      overall: number;
    };
    trend: 'improving' | 'stable' | 'declining';
  } {
    if (assessments.length === 0) {
      return {
        averageScores: {
          taskAchievement: 0,
          fluency: 0,
          vocabularyGrammarAccuracy: 0,
          politeness: 0,
          overall: 0,
        },
        trend: 'stable',
      };
    }

    const averageScores = {
      taskAchievement:
        assessments.reduce((sum, a) => sum + a.taskAchievement, 0) / assessments.length,
      fluency: assessments.reduce((sum, a) => sum + a.fluency, 0) / assessments.length,
      vocabularyGrammarAccuracy:
        assessments.reduce((sum, a) => sum + a.vocabularyGrammarAccuracy, 0) / assessments.length,
      politeness: assessments.reduce((sum, a) => sum + a.politeness, 0) / assessments.length,
      overall: assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length,
    };

    // Calculate trend (comparing first half to second half)
    if (assessments.length >= 4) {
      const midpoint = Math.floor(assessments.length / 2);
      const firstHalf = assessments.slice(0, midpoint);
      const secondHalf = assessments.slice(midpoint);

      const firstAvg = firstHalf.reduce((sum, a) => sum + a.overallScore, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, a) => sum + a.overallScore, 0) / secondHalf.length;

      const difference = secondAvg - firstAvg;

      return {
        averageScores,
        trend: difference > 5 ? 'improving' : difference < -5 ? 'declining' : 'stable',
      };
    }

    return {
      averageScores,
      trend: 'stable',
    };
  }
}
