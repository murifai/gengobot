import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// Validation schema
const MondaiBreakdownSchema = z.object({
  mondaiNumber: z.number().int().positive(),
  correct: z.number().int().min(0),
  total: z.number().int().positive(),
  weightedScore: z.number(),
  maxScore: z.number(),
});

const MondaiScoreInputSchema = z.object({
  sectionType: z.enum(['vocabulary', 'grammar_reading', 'listening']),
  mondaiNumber: z.number().int().positive(),
  correct: z.number().int().min(0),
  total: z.number().int().positive(),
  weightedScore: z.number().optional(),
  maxScore: z.number().optional(),
});

const SectionResultSchema = z.object({
  sectionType: z.enum(['vocabulary', 'grammar_reading', 'listening']),
  rawScore: z.number().int(),
  weightedScore: z.number(),
  rawMaxScore: z.number(),
  normalizedScore: z.number(),
  isPassed: z.boolean(),
  referenceGrade: z.enum(['A', 'B', 'C']),
  mondaiBreakdown: z.array(MondaiBreakdownSchema),
});

const SaveRequestSchema = z.object({
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  source: z.string().optional(),
  userNote: z.string().optional(),
  totalScore: z.number(),
  isPassed: z.boolean(),
  sectionResults: z.array(SectionResultSchema),
  rawInputs: z.array(MondaiScoreInputSchema),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request
    const validationResult = SaveRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { level, source, userNote, totalScore, isPassed, sectionResults, rawInputs } =
      validationResult.data;

    // Save offline test result
    const offlineTestResult = await prisma.jLPTOfflineTestResult.create({
      data: {
        userId: session.user.id,
        level,
        source: source || null,
        userNote: userNote || null,
        totalScore,
        isPassed,
        rawInputs: rawInputs,
        sectionScores: {
          create: sectionResults.map(section => ({
            sectionType: section.sectionType,
            rawScore: section.rawScore,
            weightedScore: section.weightedScore,
            rawMaxScore: section.rawMaxScore,
            normalizedScore: section.normalizedScore,
            isPassed: section.isPassed,
            referenceGrade: section.referenceGrade,
          })),
        },
      },
      include: {
        sectionScores: true,
      },
    });

    return NextResponse.json({
      success: true,
      resultId: offlineTestResult.id,
      message: 'Hasil berhasil disimpan',
    });
  } catch (error) {
    console.error('Save calculator result error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save result',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
