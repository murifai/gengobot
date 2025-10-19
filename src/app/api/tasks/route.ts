import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks - Retrieve tasks with filtering and pagination
export async function GET(request: NextRequest) {
  try {
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
          character: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
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
      'successCriteria',
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

    if (!Array.isArray(body.successCriteria) || body.successCriteria.length === 0) {
      return NextResponse.json(
        { error: 'successCriteria must be a non-empty array' },
        { status: 400 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        difficulty: body.difficulty,
        scenario: body.scenario,
        learningObjectives: body.learningObjectives,
        successCriteria: body.successCriteria,
        estimatedDuration: body.estimatedDuration,
        prerequisites: body.prerequisites || [],
        characterId: body.characterId || null,
        createdBy: body.createdBy || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log admin action if createdBy is provided
    if (body.createdBy) {
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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
