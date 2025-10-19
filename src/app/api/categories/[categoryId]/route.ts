import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories/[categoryId] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const category = await prisma.taskCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PUT /api/categories/[categoryId] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existingCategory = await prisma.taskCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const category = await prisma.taskCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        name: body.name.trim(),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/categories/[categoryId] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const existingCategory = await prisma.taskCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if there are tasks using this category
    const tasksCount = await prisma.task.count({
      where: {
        category: existingCategory.name,
      },
    });

    if (tasksCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with associated tasks',
          taskCount: tasksCount,
        },
        { status: 400 }
      );
    }

    await prisma.taskCategory.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
