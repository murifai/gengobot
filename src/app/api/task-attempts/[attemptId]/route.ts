// API route for individual task attempt operations
// Phase 3.2: Task-Based Chat Development

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/task-attempts/[attemptId]
 * Get detailed information about a specific task attempt
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
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            scenario: true,
            learningObjectives: true,
            successCriteria: true,
            estimatedDuration: true,
            character: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            proficiency: true,
            preferredTaskCategories: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Task attempt not found' }, { status: 404 });
    }

    // Calculate progress metrics
    const conversationHistory = attempt.conversationHistory as {
      messages?: unknown[];
      completedObjectives?: string[];
      startedAt?: string;
    };

    const messages = conversationHistory?.messages || [];
    const completedObjectives = conversationHistory?.completedObjectives || [];
    const learningObjectives = (attempt.task.learningObjectives as string[]) || [];

    const progressPercentage =
      learningObjectives.length > 0
        ? Math.round((completedObjectives.length / learningObjectives.length) * 100)
        : 0;

    // Calculate elapsed time
    const startTime = new Date(attempt.startTime);
    const endTime = attempt.endTime ? new Date(attempt.endTime) : new Date();
    const elapsedMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    return NextResponse.json({
      attempt,
      progress: {
        percentage: progressPercentage,
        completedObjectives: completedObjectives.length,
        totalObjectives: learningObjectives.length,
        messageCount: messages.length,
        elapsedMinutes,
        estimatedMinutesRemaining: attempt.task.estimatedDuration - elapsedMinutes,
      },
    });
  } catch (error) {
    console.error('Error fetching task attempt:', error);
    return NextResponse.json({ error: 'Failed to fetch task attempt' }, { status: 500 });
  }
}

/**
 * PUT /api/task-attempts/[attemptId]
 * Update task attempt progress
 * Body: { conversationHistory, completedObjectives }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();

    // Find existing attempt
    const existingAttempt = await prisma.taskAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!existingAttempt) {
      return NextResponse.json({ error: 'Task attempt not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Update conversation history if provided
    if (body.conversationHistory) {
      updateData.conversationHistory = body.conversationHistory;
    }

    // Update completion status if provided
    if (body.isCompleted !== undefined) {
      updateData.isCompleted = body.isCompleted;
      if (body.isCompleted && !existingAttempt.endTime) {
        updateData.endTime = new Date();
      }
    }

    // Update assessment scores if provided
    if (body.taskAchievement !== undefined) updateData.taskAchievement = body.taskAchievement;
    if (body.fluency !== undefined) updateData.fluency = body.fluency;
    if (body.vocabularyGrammarAccuracy !== undefined) {
      updateData.vocabularyGrammarAccuracy = body.vocabularyGrammarAccuracy;
    }
    if (body.politeness !== undefined) updateData.politeness = body.politeness;
    if (body.overallScore !== undefined) updateData.overallScore = body.overallScore;
    if (body.feedback !== undefined) updateData.feedback = body.feedback;

    // Update the attempt
    const updatedAttempt = await prisma.taskAttempt.update({
      where: { id: attemptId },
      data: updateData,
      include: {
        task: true,
        user: true,
      },
    });

    return NextResponse.json({
      attempt: updatedAttempt,
      message: 'Task attempt updated successfully',
    });
  } catch (error) {
    console.error('Error updating task attempt:', error);
    return NextResponse.json({ error: 'Failed to update task attempt' }, { status: 500 });
  }
}

/**
 * DELETE /api/task-attempts/[attemptId]
 * Delete a task attempt (admin only or incomplete attempts)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.taskAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Task attempt not found' }, { status: 404 });
    }

    // Only allow deletion of incomplete attempts
    if (attempt.isCompleted) {
      return NextResponse.json({ error: 'Cannot delete completed attempts' }, { status: 403 });
    }

    await prisma.taskAttempt.delete({
      where: { id: attemptId },
    });

    // Clear user's current task if this was their active attempt
    await prisma.user.updateMany({
      where: {
        id: attempt.userId,
        currentTaskId: attempt.taskId,
      },
      data: {
        currentTaskId: null,
      },
    });

    return NextResponse.json({
      message: 'Task attempt deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task attempt:', error);
    return NextResponse.json({ error: 'Failed to delete task attempt' }, { status: 500 });
  }
}
