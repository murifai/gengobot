// API route for task attempt management
// Phase 3.2: Task-Based Chat Development

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/task-attempts
 * List task attempts with filtering and pagination
 * Query params:
 * - userId: Filter by user
 * - taskId: Filter by task
 * - isCompleted: Filter by completion status
 * - limit: Number of results (default: 20)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const taskId = searchParams.get('taskId');
    const isCompleted = searchParams.get('isCompleted');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (taskId) where.taskId = taskId;
    if (isCompleted !== null) {
      where.isCompleted = isCompleted === 'true';
    }

    // Get attempts with task and user details
    const attempts = await prisma.taskAttempt.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            estimatedDuration: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            proficiency: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get total count
    const total = await prisma.taskAttempt.count({ where });

    return NextResponse.json({
      attempts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching task attempts:', error);
    return NextResponse.json({ error: 'Failed to fetch task attempts' }, { status: 500 });
  }
}

/**
 * POST /api/task-attempts
 * Start a new task attempt
 * Body: { userId, taskId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, taskId } = body;

    // Validate required fields
    if (!userId || !taskId) {
      return NextResponse.json({ error: 'userId and taskId are required' }, { status: 400 });
    }

    // Verify user exists - support both authId (UUID) and id (CUID) formats
    let user = await prisma.user.findUnique({
      where: { authId: userId },
    });

    // Fallback to id lookup if authId lookup fails
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!task.isActive) {
      return NextResponse.json({ error: 'Task is not active' }, { status: 400 });
    }

    // Check if user has an incomplete attempt for this task
    const existingAttempt = await prisma.taskAttempt.findFirst({
      where: {
        userId: user.id,
        taskId,
        isCompleted: false,
      },
    });

    if (existingAttempt) {
      // Return existing attempt instead of creating new one
      return NextResponse.json({
        attempt: existingAttempt,
        isExisting: true,
        message: 'Resuming existing attempt',
      });
    }

    // Create new task attempt
    const attempt = await prisma.taskAttempt.create({
      data: {
        userId: user.id,
        taskId,
        conversationHistory: {
          messages: [],
          startedAt: new Date().toISOString(),
        },
      },
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
          },
        },
      },
    });

    // Update task usage count
    await prisma.task.update({
      where: { id: taskId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    // Update user's current task
    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentTaskId: taskId,
      },
    });

    return NextResponse.json({
      attempt,
      isExisting: false,
      message: 'Task attempt started successfully',
    });
  } catch (error) {
    console.error('Error creating task attempt:', error);
    return NextResponse.json({ error: 'Failed to create task attempt' }, { status: 500 });
  }
}
