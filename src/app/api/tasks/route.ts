import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';

// GET /api/tasks - Retrieve tasks with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { scenario: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get tasks with pagination
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          _count: {
            select: {
              taskAttempts: true,
              conversations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'title',
      'description',
      'category',
      'difficulty',
      'scenario',
      'learningObjectives',
      'conversationExample',
      'estimatedDuration',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate difficulty level
    const validDifficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];
    if (!validDifficulties.includes(body.difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level. Must be N1-N5' },
        { status: 400 }
      );
    }

    // Validate arrays
    if (!Array.isArray(body.learningObjectives) || body.learningObjectives.length === 0) {
      return NextResponse.json(
        { error: 'learningObjectives must be a non-empty array' },
        { status: 400 }
      );
    }

    if (
      typeof body.conversationExample !== 'string' ||
      body.conversationExample.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'conversationExample must be a non-empty string' },
        { status: 400 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        subcategoryId: body.subcategoryId || null,
        difficulty: body.difficulty,
        scenario: body.scenario,
        learningObjectives: body.learningObjectives,
        conversationExample: body.conversationExample,
        estimatedDuration: body.estimatedDuration,
        createdBy: body.createdBy || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        // Voice settings
        prompt: body.prompt || '',
        voice: body.voice || 'alloy',
        speakingSpeed: body.speakingSpeed || 1.0,
        audioExample: body.audioExample || null,
      },
    });

    // Create task-deck associations if studyDeckIds provided
    if (body.studyDeckIds && Array.isArray(body.studyDeckIds) && body.studyDeckIds.length > 0) {
      await prisma.taskDeck.createMany({
        data: body.studyDeckIds.map((deckId: string, index: number) => ({
          taskId: task.id,
          deckId,
          order: index,
        })),
      });
    }

    // Log admin action if createdBy is provided and user exists
    if (body.createdBy) {
      try {
        // Verify admin user exists before logging
        const adminUser = await prisma.user.findUnique({
          where: { id: body.createdBy },
          select: { id: true },
        });

        if (adminUser) {
          await prisma.adminLog.create({
            data: {
              adminId: body.createdBy,
              actionType: 'create_task',
              entityType: 'task',
              entityId: task.id,
              details: {
                title: task.title,
                category: task.category,
                difficulty: task.difficulty,
              },
            },
          });
        }
      } catch (error) {
        // Log error but don't fail the task creation
        console.error('Failed to create admin log:', error);
      }
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
