import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks/[taskId] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        studyDecks: {
          include: {
            deck: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                difficulty: true,
                totalCards: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            taskAttempts: true,
            conversations: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Transform studyDecks to include deck IDs array for easier form handling
    const taskWithDeckIds = {
      ...task,
      studyDeckIds: task.studyDecks.map(td => td.deckId),
    };

    return NextResponse.json(taskWithDeckIds);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT /api/tasks/[taskId] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Validate difficulty level if provided
    if (body.difficulty) {
      const validDifficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];
      if (!validDifficulties.includes(body.difficulty)) {
        return NextResponse.json(
          { error: 'Invalid difficulty level. Must be N1-N5' },
          { status: 400 }
        );
      }
    }

    // Validate arrays if provided
    if (body.learningObjectives !== undefined) {
      if (!Array.isArray(body.learningObjectives) || body.learningObjectives.length === 0) {
        return NextResponse.json(
          { error: 'learningObjectives must be a non-empty array' },
          { status: 400 }
        );
      }
    }

    if (body.conversationExample !== undefined) {
      if (
        typeof body.conversationExample !== 'string' ||
        body.conversationExample.trim().length === 0
      ) {
        return NextResponse.json(
          { error: 'conversationExample must be a non-empty string' },
          { status: 400 }
        );
      }
    }

    // Build update data object
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title',
      'description',
      'category',
      'subcategoryId',
      'difficulty',
      'scenario',
      'learningObjectives',
      'conversationExample',
      'estimatedDuration',
      'prerequisites',
      'characterId',
      'isActive',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // Handle study deck associations if studyDeckIds provided
    if (body.studyDeckIds !== undefined && Array.isArray(body.studyDeckIds)) {
      // Delete existing associations
      await prisma.taskDeck.deleteMany({
        where: { taskId },
      });

      // Create new associations
      if (body.studyDeckIds.length > 0) {
        await prisma.taskDeck.createMany({
          data: body.studyDeckIds.map((deckId: string, index: number) => ({
            taskId,
            deckId,
            order: index,
          })),
        });
      }
    }

    // Log admin action if updatedBy is provided and user exists
    if (body.updatedBy) {
      try {
        // Verify admin user exists before logging
        const adminUser = await prisma.user.findUnique({
          where: { id: body.updatedBy },
          select: { id: true },
        });

        if (adminUser) {
          await prisma.adminLog.create({
            data: {
              adminId: body.updatedBy,
              actionType: 'edit_task',
              entityType: 'task',
              entityId: taskId,
              details: {
                updatedFields: Object.keys(updateData),
                title: updatedTask.title,
              },
            },
          });
        }
      } catch (error) {
        // Log error but don't fail the task update
        console.error('Failed to create admin log:', error);
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[taskId] - Soft delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const deletedBy = searchParams.get('deletedBy');
    const hardDelete = searchParams.get('hard') === 'true';

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let result;

    if (hardDelete) {
      // Hard delete - remove from database with cascade
      // First, delete all related data to avoid foreign key constraint violations

      // Delete TaskAttempts related to this task
      await prisma.taskAttempt.deleteMany({
        where: { taskId },
      });

      // Delete Conversations related to this task
      await prisma.conversation.deleteMany({
        where: { taskId },
      });

      // Now delete the task itself
      result = await prisma.task.delete({
        where: { id: taskId },
      });
    } else {
      // Soft delete - set isActive to false
      result = await prisma.task.update({
        where: { id: taskId },
        data: { isActive: false },
      });
    }

    // Log admin action if deletedBy is provided and user exists
    if (deletedBy) {
      try {
        // Verify admin user exists before logging
        const adminUser = await prisma.user.findUnique({
          where: { id: deletedBy },
          select: { id: true },
        });

        if (adminUser) {
          await prisma.adminLog.create({
            data: {
              adminId: deletedBy,
              actionType: hardDelete ? 'hard_delete_task' : 'soft_delete_task',
              entityType: 'task',
              entityId: taskId,
              details: {
                title: existingTask.title,
                category: existingTask.category,
              },
            },
          });
        }
      } catch (error) {
        // Log error but don't fail the task deletion
        console.error('Failed to create admin log:', error);
      }
    }

    return NextResponse.json({
      message: hardDelete ? 'Task permanently deleted' : 'Task deactivated',
      task: result,
    });
  } catch (error) {
    console.error('Error deleting task:', error);

    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to delete task',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
