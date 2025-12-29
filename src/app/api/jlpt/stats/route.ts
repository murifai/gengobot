import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/jlpt/stats - Get question counts by level, section, and mondai
export async function GET() {
  try {
    // Get all questions with active status
    const questions = await prisma.jLPTQuestion.findMany({
      where: { isActive: true },
      select: {
        level: true,
        sectionType: true,
        mondaiNumber: true,
      },
    });

    // Calculate statistics
    const stats = {
      byLevel: {} as Record<string, { totalQuestions: number; totalMondai: number }>,
      bySection: {} as Record<string, Record<string, { questions: number; mondai: Set<number> }>>,
    };

    // Process questions
    questions.forEach(q => {
      const { level, sectionType, mondaiNumber } = q;

      // Level statistics
      if (!stats.byLevel[level]) {
        stats.byLevel[level] = { totalQuestions: 0, totalMondai: 0 };
      }
      stats.byLevel[level].totalQuestions++;

      // Section statistics
      if (!stats.bySection[level]) {
        stats.bySection[level] = {};
      }
      if (!stats.bySection[level][sectionType]) {
        stats.bySection[level][sectionType] = {
          questions: 0,
          mondai: new Set<number>(),
        };
      }
      stats.bySection[level][sectionType].questions++;
      stats.bySection[level][sectionType].mondai.add(mondaiNumber);
    });

    // Calculate unique mondai counts per level
    Object.keys(stats.bySection).forEach(level => {
      const mondaiSet = new Set<number>();
      Object.values(stats.bySection[level]).forEach(section => {
        section.mondai.forEach(m => mondaiSet.add(m));
      });
      stats.byLevel[level].totalMondai = mondaiSet.size;
    });

    // Convert Sets to counts for JSON response
    const response = {
      byLevel: stats.byLevel,
      bySection: Object.entries(stats.bySection).reduce(
        (acc, [level, sections]) => {
          acc[level] = Object.entries(sections).reduce(
            (sectionAcc, [sectionType, data]) => {
              sectionAcc[sectionType] = {
                questions: data.questions,
                mondai: data.mondai.size,
              };
              return sectionAcc;
            },
            {} as Record<string, { questions: number; mondai: number }>
          );
          return acc;
        },
        {} as Record<string, Record<string, { questions: number; mondai: number }>>
      ),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching JLPT stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
