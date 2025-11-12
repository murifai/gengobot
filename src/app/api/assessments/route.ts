import { NextRequest, NextResponse } from 'next/server';
import { SimplifiedAssessmentService } from '@/lib/ai/simplified-assessment-service';
import { ObjectiveTracking } from '@/lib/ai/objective-detection';
import { prisma } from '@/lib/prisma';

// POST /api/assessments - Generate simplified task assessment (Phase 6)
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

    // Get objective completion status from the attempt
    const objectiveStatus =
      (attempt.objectiveCompletionStatus as unknown as ObjectiveTracking[]) || [];

    // If objectives not initialized, create them from task objectives
    let finalObjectiveStatus = objectiveStatus;
    if (objectiveStatus.length === 0) {
      const taskObjectives = (attempt.task.learningObjectives as string[]) || [];
      finalObjectiveStatus = taskObjectives.map((text, index) => ({
        objectiveId: index.toString(),
        objectiveText: text,
        status: 'pending' as const,
        confidence: 0,
        evidence: [],
      }));
    }

    // Generate simplified assessment
    const assessment = await SimplifiedAssessmentService.generateAssessment({
      task: attempt.task,
      conversationHistory,
      objectiveStatus: finalObjectiveStatus,
      startTime: attempt.startTime,
      endTime: attempt.endTime || new Date(),
    });

    // Set the attemptId
    assessment.attemptId = attemptId;

    // Update task attempt with simplified feedback
    await prisma.taskAttempt.update({
      where: { id: attemptId },
      data: {
        feedback: JSON.stringify(assessment),
        isCompleted: true,
        endTime: new Date(),
        completionDuration: assessment.statistics.duration,
      },
    });

    // Update task usage count
    await prisma.task.update({
      where: { id: attempt.taskId },
      data: {
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

    // Convert to assessment format with simplified assessment data
    const assessments = attempts.map(attempt => {
      // Try to parse SimplifiedAssessment from feedback field
      let simplifiedAssessment = null;
      let objectivesAchieved = 0;
      let totalObjectives = 1;

      try {
        if (attempt.feedback) {
          simplifiedAssessment = JSON.parse(attempt.feedback);
          objectivesAchieved = simplifiedAssessment.objectivesAchieved || 0;
          totalObjectives = simplifiedAssessment.totalObjectives || 1;
        }
      } catch (e) {
        // Ignore parse errors
      }

      const completionRate = totalObjectives > 0 ? (objectivesAchieved / totalObjectives) * 100 : 0;

      return {
        taskId: attempt.taskId,
        attemptId: attempt.id,
        taskTitle: attempt.task.title,
        taskCategory: attempt.task.category,
        taskDifficulty: attempt.task.difficulty,
        objectivesAchieved,
        totalObjectives,
        completionRate: Math.round(completionRate),
        feedback: simplifiedAssessment,
        assessmentDate: attempt.endTime,
      };
    });

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}
