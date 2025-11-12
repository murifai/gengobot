// API route for task completion detection and finalization
// Phase 3.2: Task-Based Chat Development

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/task-attempts/[attemptId]/complete
 * Mark task attempt as complete with assessment
 * Body: {
 *   taskAchievement: number (0-100),
 *   fluency: number (0-100),
 *   vocabularyGrammarAccuracy: number (0-100),
 *   politeness: number (0-100),
 *   feedback: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();

    // Validate assessment scores
    const { taskAchievement, fluency, vocabularyGrammarAccuracy, politeness, feedback } = body;

    // Validate score ranges
    const scores = [taskAchievement, fluency, vocabularyGrammarAccuracy, politeness];
    for (const score of scores) {
      if (score !== undefined && (score < 0 || score > 100)) {
        return NextResponse.json(
          { error: 'Assessment scores must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Find existing attempt
    const attempt = await prisma.taskAttempt.findUnique({
      where: { id: attemptId },
      include: {
        task: true,
        user: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Task attempt not found' }, { status: 404 });
    }

    if (attempt.isCompleted) {
      return NextResponse.json({ error: 'Task attempt already completed' }, { status: 400 });
    }

    // Calculate overall weighted score
    // Weights: Task Achievement 30%, Fluency 25%, Vocabulary/Grammar 25%, Politeness 20%
    const overallScore =
      (taskAchievement || 0) * 0.3 +
      (fluency || 0) * 0.25 +
      (vocabularyGrammarAccuracy || 0) * 0.25 +
      (politeness || 0) * 0.2;

    // Complete the task attempt
    // Note: Since Phase 6, we store SimplifiedAssessment in feedback field as JSON
    // The old score fields (taskAchievement, fluency, etc.) have been removed from the schema
    const completedAttempt = await prisma.taskAttempt.update({
      where: { id: attemptId },
      data: {
        isCompleted: true,
        endTime: new Date(),
        feedback: JSON.stringify({
          taskAchievement,
          fluency,
          vocabularyGrammarAccuracy,
          politeness,
          overallScore,
          feedbackText: feedback,
        }),
      },
    });

    // Update task statistics
    const allCompletedAttempts = await prisma.taskAttempt.findMany({
      where: {
        taskId: attempt.taskId,
        isCompleted: true,
      },
      select: {
        feedback: true,
      },
    });

    // Calculate new average score from feedback data
    let totalScore = 0;
    let validAttempts = 0;

    allCompletedAttempts.forEach(a => {
      if (a.feedback) {
        try {
          const feedbackData = JSON.parse(a.feedback);
          if (feedbackData.overallScore !== undefined) {
            totalScore += feedbackData.overallScore;
            validAttempts++;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    const averageScore = validAttempts > 0 ? totalScore / validAttempts : 0;

    await prisma.task.update({
      where: { id: attempt.taskId },
      data: {
        averageScore,
      },
    });

    // Update user's completed tasks
    const completedTasks = (attempt.user.completedTasks as string[]) || [];
    if (!completedTasks.includes(attempt.taskId)) {
      completedTasks.push(attempt.taskId);
    }

    await prisma.user.update({
      where: { id: attempt.userId },
      data: {
        completedTasks,
        currentTaskId: null, // Clear current task
      },
    });

    // Calculate completion time
    const startTime = new Date(attempt.startTime);
    const endTime = new Date(completedAttempt.endTime!);
    const completionTimeMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    return NextResponse.json({
      attempt: completedAttempt,
      completion: {
        overallScore,
        completionTimeMinutes,
        estimatedDuration: attempt.task.estimatedDuration,
        efficiency:
          attempt.task.estimatedDuration > 0
            ? Math.round((completionTimeMinutes / attempt.task.estimatedDuration) * 100)
            : 100,
      },
      message: 'Task completed successfully',
    });
  } catch (error) {
    console.error('Error completing task attempt:', error);
    return NextResponse.json({ error: 'Failed to complete task attempt' }, { status: 500 });
  }
}

/**
 * GET /api/task-attempts/[attemptId]/complete
 * Check if task attempt is ready for completion
 * Returns completion readiness status and validation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.taskAttempt.findUnique({
      where: { id: attemptId },
      include: {
        task: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Task attempt not found' }, { status: 404 });
    }

    // Parse conversation history
    const conversationHistory = attempt.conversationHistory as {
      messages?: unknown[];
      completedObjectives?: string[];
    };

    const messages = conversationHistory?.messages || [];
    const completedObjectives = conversationHistory?.completedObjectives || [];
    const learningObjectives = (attempt.task.learningObjectives as string[]) || [];
    const conversationExample = attempt.task.conversationExample;

    // Calculate readiness
    const hasMessages = messages.length >= 5; // Minimum 5 messages
    const objectivesComplete =
      learningObjectives.length > 0
        ? completedObjectives.length >= learningObjectives.length
        : true;

    const minDuration = Math.round(attempt.task.estimatedDuration * 0.5); // At least 50% of estimated time
    const startTime = new Date(attempt.startTime);
    const now = new Date();
    const elapsedMinutes = Math.round((now.getTime() - startTime.getTime()) / 60000);
    const hasMinimumDuration = elapsedMinutes >= minDuration;

    const isReady = hasMessages && objectivesComplete && hasMinimumDuration;

    return NextResponse.json({
      isReady,
      validation: {
        hasMessages,
        objectivesComplete,
        hasMinimumDuration,
      },
      progress: {
        messageCount: messages.length,
        requiredMessages: 5,
        completedObjectives: completedObjectives.length,
        totalObjectives: learningObjectives.length,
        elapsedMinutes,
        minimumMinutes: minDuration,
        estimatedMinutes: attempt.task.estimatedDuration,
      },
      readinessFactors: {
        messages: hasMessages ? '✅' : '❌',
        objectives: objectivesComplete ? '✅' : '❌',
        duration: hasMinimumDuration ? '✅' : '⚠️',
      },
      conversationExample,
    });
  } catch (error) {
    console.error('Error checking task completion readiness:', error);
    return NextResponse.json({ error: 'Failed to check completion readiness' }, { status: 500 });
  }
}
