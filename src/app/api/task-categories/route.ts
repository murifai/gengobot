import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/task-categories - Get all task categories
export async function GET() {
  try {
    const categories = await prisma.taskCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Get task count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async category => {
        const taskCount = await prisma.task.count({
          where: {
            category: category.name,
            isActive: true,
          },
        });

        return {
          ...category,
          taskCount,
        };
      })
    );

    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching task categories:', error);
    return NextResponse.json({ error: 'Failed to fetch task categories' }, { status: 500 });
  }
}

// POST /api/task-categories - Create a new task category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    // Check if category already exists
    const existing = await prisma.taskCategory.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.taskCategory.create({
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating task category:', error);
    return NextResponse.json({ error: 'Failed to create task category' }, { status: 500 });
  }
}
