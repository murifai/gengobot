import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subcategories/[subcategoryId] - Get a specific subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) {
  try {
    const { subcategoryId } = await params;
    const subcategory = await prisma.taskSubcategory.findUnique({
      where: {
        id: subcategoryId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategory' }, { status: 500 });
  }
}

// PUT /api/subcategories/[subcategoryId] - Update a subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) {
  try {
    const { subcategoryId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if subcategory exists
    const existingSubcategory = await prisma.taskSubcategory.findUnique({
      where: {
        id: subcategoryId,
      },
    });

    if (!existingSubcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    // Build update data
    const updateData: { name: string; categoryId?: string } = {
      name: body.name.trim(),
    };

    if (body.categoryId) {
      updateData.categoryId = body.categoryId;
    }

    // Update the subcategory
    const subcategory = await prisma.taskSubcategory.update({
      where: {
        id: subcategoryId,
      },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Error updating subcategory:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A subcategory with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 });
  }
}

// DELETE /api/subcategories/[subcategoryId] - Delete a subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) {
  try {
    const { subcategoryId } = await params;
    // Check if subcategory exists
    const existingSubcategory = await prisma.taskSubcategory.findUnique({
      where: {
        id: subcategoryId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!existingSubcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    // Check if there are tasks using this subcategory
    if (existingSubcategory._count.tasks > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete subcategory with associated tasks',
          taskCount: existingSubcategory._count.tasks,
        },
        { status: 400 }
      );
    }

    // Delete the subcategory
    await prisma.taskSubcategory.delete({
      where: {
        id: subcategoryId,
      },
    });

    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 });
  }
}
