import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks/search - Advanced task search with multiple filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const difficulties = searchParams.get('difficulties')?.split(',').filter(Boolean);
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');
    const characterId = searchParams.get('characterId');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build complex filter conditions
    const where: Record<string, unknown> = {};
    const andConditions: Record<string, unknown>[] = [];

    // Keyword search across multiple fields
    if (keyword) {
      andConditions.push({
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { scenario: { contains: keyword, mode: 'insensitive' } },
          { category: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }

    // Category filter
    if (categories && categories.length > 0) {
      andConditions.push({
        category: { in: categories },
      });
    }

    // Difficulty filter
    if (difficulties && difficulties.length > 0) {
      andConditions.push({
        difficulty: { in: difficulties },
      });
    }

    // Duration range filter
    if (minDuration || maxDuration) {
      const durationFilter: Record<string, unknown> = {};
      if (minDuration) durationFilter.gte = parseInt(minDuration);
      if (maxDuration) durationFilter.lte = parseInt(maxDuration);
      andConditions.push({
        estimatedDuration: durationFilter,
      });
    }

    // Character filter
    if (characterId) {
      andConditions.push({
        characterId: characterId,
      });
    }

    // Active status filter
    if (isActive !== null && isActive !== undefined) {
      andConditions.push({
        isActive: isActive === 'true',
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Build order by clause
    const orderBy: Record<string, string> = {};
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'title',
      'difficulty',
      'estimatedDuration',
      'usageCount',
      'averageScore',
    ];

    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Execute search with pagination
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    // Build facets for filtering UI
    const facets = await buildFacets(where);

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      facets,
      filters: {
        keyword,
        categories,
        difficulties,
        minDuration,
        maxDuration,
        characterId,
        isActive,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error('Error searching tasks:', error);
    return NextResponse.json({ error: 'Failed to search tasks' }, { status: 500 });
  }
}

// Helper function to build facets for filtering
async function buildFacets(baseWhere: Record<string, unknown>) {
  const [categories, difficulties] = await Promise.all([
    // Get all categories with task counts
    prisma.task.groupBy({
      by: ['category'],
      where: baseWhere,
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    }),
    // Get all difficulties with task counts
    prisma.task.groupBy({
      by: ['difficulty'],
      where: baseWhere,
      _count: {
        difficulty: true,
      },
      orderBy: {
        difficulty: 'desc',
      },
    }),
  ]);

  // Get duration ranges
  const durationStats = await prisma.task.aggregate({
    where: baseWhere,
    _min: {
      estimatedDuration: true,
    },
    _max: {
      estimatedDuration: true,
    },
    _avg: {
      estimatedDuration: true,
    },
  });

  return {
    categories: categories.map(c => ({
      value: c.category,
      count: c._count.category,
    })),
    difficulties: difficulties.map(d => ({
      value: d.difficulty,
      count: d._count.difficulty,
    })),
    duration: {
      min: durationStats._min.estimatedDuration || 0,
      max: durationStats._max.estimatedDuration || 0,
      avg: Math.round(durationStats._avg.estimatedDuration || 0),
    },
  };
}
