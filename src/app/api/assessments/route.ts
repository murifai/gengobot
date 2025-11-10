import { NextRequest, NextResponse } from 'next/server';
import { TaskAssessmentService } from '@/lib/ai/task-assessment-service';
import { prisma } from '@/lib/prisma';

// POST /api/assessments - Generate task assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attemptId } = body;

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 });
    }

    // Get task attempt data
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

    // Parse conversation history
    const conversationHistory =
      (
        attempt.conversationHistory as {
          messages: Array<{
            role: 'user' | 'assistant';
            content: string;
            timestamp: string;
          }>;
        }
      )?.messages || [];

    // Get task objectives
    const taskObjectives = (attempt.task.learningObjectives as string[]) || [];

    // Determine completed objectives based on conversation quality
    // (simplified - in production, this would analyze the actual conversation)
    const conversationQuality = conversationHistory.length / 10; // Basic quality metric
    const completedObjectives = taskObjectives.slice(
      0,
      Math.min(taskObjectives.length, Math.ceil(conversationQuality * taskObjectives.length))
    );

    // Generate assessment
    const assessment = await TaskAssessmentService.generateTaskAssessment({
      taskId: attempt.taskId,
      attemptId: attempt.id,
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      })),
      taskObjectives,
      completedObjectives,
      taskDifficulty: attempt.task.difficulty as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
      startTime: attempt.startTime,
      endTime: attempt.endTime || new Date(),
    });

    // Update task attempt with assessment scores
    await prisma.taskAttempt.update({
      where: { id: attemptId },
      data: {
        taskAchievement: assessment.taskAchievement,
        fluency: assessment.fluency,
        vocabularyGrammarAccuracy: assessment.vocabularyGrammarAccuracy,
        politeness: assessment.politeness,
        overallScore: assessment.overallScore,
        feedback: assessment.feedback,
        isCompleted: true,
        endTime: new Date(),
      },
    });

    // Update task average score
    const allAttempts = await prisma.taskAttempt.findMany({
      where: {
        taskId: attempt.taskId,
        isCompleted: true,
        overallScore: { not: null },
      },
    });

    const averageScore =
      allAttempts.reduce((sum, a) => sum + (a.overallScore || 0), 0) / allAttempts.length;

    await prisma.task.update({
      where: { id: attempt.taskId },
      data: {
        averageScore,
        usageCount: { increment: 1 },
      },
    });

    return NextResponse.json({ assessment }, { status: 200 });
  } catch (error) {
    console.error('Error generating assessment:', error);
    return NextResponse.json({ error: 'Failed to generate assessment' }, { status: 500 });
  }
}

// GET /api/assessments - Get user assessments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const attempts = await prisma.taskAttempt.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      include: {
        task: true,
      },
      orderBy: {
        endTime: 'desc',
      },
      take: limit,
    });

    // Convert to assessment format
    const assessments = attempts.map(attempt => ({
      taskId: attempt.taskId,
      attemptId: attempt.id,
      taskTitle: attempt.task.title,
      taskCategory: attempt.task.category,
      taskDifficulty: attempt.task.difficulty,
      taskAchievement: attempt.taskAchievement || 0,
      fluency: attempt.fluency || 0,
      vocabularyGrammarAccuracy: attempt.vocabularyGrammarAccuracy || 0,
      politeness: attempt.politeness || 0,
      overallScore: attempt.overallScore || 0,
      feedback: attempt.feedback,
      assessmentDate: attempt.endTime,
    }));

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}
