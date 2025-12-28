import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');

    // Build where clause
    const where: { userId: string; level?: string } = {
      userId: session.user.id,
    };

    if (level) {
      where.level = level;
    }

    // Fetch calculator history
    const history = await prisma.jLPTOfflineTestResult.findMany({
      where,
      include: {
        sectionScores: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      history: history.map(result => ({
        id: result.id,
        level: result.level,
        source: result.source,
        userNote: result.userNote,
        totalScore: result.totalScore,
        isPassed: result.isPassed,
        createdAt: result.createdAt,
        sectionScores: result.sectionScores.map(section => ({
          sectionType: section.sectionType,
          normalizedScore: section.normalizedScore,
          isPassed: section.isPassed,
          referenceGrade: section.referenceGrade,
        })),
      })),
    });
  } catch (error) {
    console.error('Get calculator history error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 });
    }

    // Verify ownership and delete
    const result = await prisma.jLPTOfflineTestResult.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    if (result.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.jLPTOfflineTestResult.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Hasil berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete calculator result error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete result',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
