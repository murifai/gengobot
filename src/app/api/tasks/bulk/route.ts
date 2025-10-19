import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/tasks/bulk - Bulk operations on tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, taskIds, data, adminId } = body;

    if (!operation || !taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Operation and taskIds array are required' },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case 'activate':
        result = await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { isActive: true },
        });

        if (adminId) {
          await logBulkAction(adminId, 'bulk_activate_tasks', taskIds);
        }

        return NextResponse.json({
          message: `Activated ${result.count} tasks`,
          count: result.count,
        });

      case 'deactivate':
        result = await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { isActive: false },
        });

        if (adminId) {
          await logBulkAction(adminId, 'bulk_deactivate_tasks', taskIds);
        }

        return NextResponse.json({
          message: `Deactivated ${result.count} tasks`,
          count: result.count,
        });

      case 'delete':
        result = await prisma.task.deleteMany({
          where: { id: { in: taskIds } },
        });

        if (adminId) {
          await logBulkAction(adminId, 'bulk_delete_tasks', taskIds);
        }

        return NextResponse.json({
          message: `Deleted ${result.count} tasks`,
          count: result.count,
        });

      case 'update_category':
        if (!data || !data.category) {
          return NextResponse.json(
            { error: 'Category is required for update_category operation' },
            { status: 400 }
          );
        }

        result = await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { category: data.category },
        });

        if (adminId) {
          await logBulkAction(adminId, 'bulk_update_category', taskIds, {
            newCategory: data.category,
          });
        }

        return NextResponse.json({
          message: `Updated category for ${result.count} tasks`,
          count: result.count,
        });

      case 'update_difficulty':
        if (!data || !data.difficulty) {
          return NextResponse.json(
            { error: 'Difficulty is required for update_difficulty operation' },
            { status: 400 }
          );
        }

        const validDifficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];
        if (!validDifficulties.includes(data.difficulty)) {
          return NextResponse.json(
            { error: 'Invalid difficulty level. Must be N1-N5' },
            { status: 400 }
          );
        }

        result = await prisma.task.updateMany({
          where: { id: { in: taskIds } },
          data: { difficulty: data.difficulty },
        });

        if (adminId) {
          await logBulkAction(adminId, 'bulk_update_difficulty', taskIds, {
            newDifficulty: data.difficulty,
          });
        }

        return NextResponse.json({
          message: `Updated difficulty for ${result.count} tasks`,
          count: result.count,
        });

      case 'duplicate':
        // Duplicate tasks
        const tasksToDuplicate = await prisma.task.findMany({
          where: { id: { in: taskIds } },
        });

        const duplicatedTasks = await Promise.all(
          tasksToDuplicate.map(async task => {
            return prisma.task.create({
              data: {
                title: `${task.title} (Copy)`,
                description: task.description,
                category: task.category,
                difficulty: task.difficulty,
                scenario: task.scenario,
                learningObjectives: task.learningObjectives as never,
                successCriteria: task.successCriteria as never,
                estimatedDuration: task.estimatedDuration,
                prerequisites: task.prerequisites as never,
                characterId: task.characterId,
                createdBy: adminId || null,
                isActive: task.isActive,
                usageCount: 0,
                averageScore: null,
              },
            });
          })
        );

        if (adminId) {
          await logBulkAction(adminId, 'bulk_duplicate_tasks', taskIds, {
            duplicatedCount: duplicatedTasks.length,
          });
        }

        return NextResponse.json({
          message: `Duplicated ${duplicatedTasks.length} tasks`,
          tasks: duplicatedTasks,
          count: duplicatedTasks.length,
        });

      default:
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json({ error: 'Failed to perform bulk operation' }, { status: 500 });
  }
}

// Helper function to log bulk actions
async function logBulkAction(
  adminId: string,
  actionType: string,
  taskIds: string[],
  additionalDetails?: Record<string, unknown>
) {
  await prisma.adminLog.create({
    data: {
      adminId,
      actionType,
      entityType: 'task',
      entityId: null,
      details: {
        taskIds,
        count: taskIds.length,
        ...additionalDetails,
      },
    },
  });
}
