import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        character: {
          select: {
            id: true,
            name: true,
            description: true,
            personality: true,
            speakingStyle: true,
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

    return NextResponse.json(task);
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

    if (body.successCriteria !== undefined) {
      if (!Array.isArray(body.successCriteria) || body.successCriteria.length === 0) {
        return NextResponse.json(
          { error: 'successCriteria must be a non-empty array' },
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
      'difficulty',
      'scenario',
      'learningObjectives',
      'successCriteria',
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
      include: {
        character: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log admin action if updatedBy is provided
    if (body.updatedBy) {
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
      // Hard delete - remove from database
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

    // Log admin action
    if (deletedBy) {
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

    return NextResponse.json({
      message: hardDelete ? 'Task permanently deleted' : 'Task deactivated',
      task: result,
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
