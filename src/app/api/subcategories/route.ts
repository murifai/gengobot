import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subcategories - Retrieve all subcategories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    // Build filter conditions
    const where: Record<string, unknown> = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get subcategories sorted by name
    const subcategories = await prisma.taskSubcategory.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

// POST /api/subcategories - Create a new subcategory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!body.categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Create the subcategory
    const subcategory = await prisma.taskSubcategory.create({
      data: {
        name: body.name.trim(),
        categoryId: body.categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error('Error creating subcategory:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A subcategory with this name already exists in this category' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 });
  }
}
