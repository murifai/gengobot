import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Retrieve all categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeSubcategories = searchParams.get('includeSubcategories') === 'true';

    const categories = await prisma.taskCategory.findMany({
      include: includeSubcategories
        ? {
            subcategories: {
              include: {
                _count: {
                  select: {
                    tasks: true,
                  },
                },
              },
              orderBy: {
                name: 'asc',
              },
            },
          }
        : undefined,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const category = await prisma.taskCategory.create({
      data: {
        name: body.name.trim(),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
