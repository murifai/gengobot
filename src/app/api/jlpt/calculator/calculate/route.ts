import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  calculateOfflineTestScore,
  calculateTotalScore,
  evaluatePassFail,
} from '@/lib/jlpt/scoring-engine';
import type { JLPTLevel, SectionType } from '@/lib/jlpt/types';

// Validation schema
const MondaiScoreSchema = z.object({
  sectionType: z.enum(['vocabulary', 'grammar_reading', 'listening']),
  mondaiNumber: z.number().int().positive(),
  correct: z.number().int().min(0),
  total: z.number().int().positive(),
});

const CalculateRequestSchema = z.object({
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  source: z.string().optional(),
  userNote: z.string().optional(),
  mondaiScores: z.array(MondaiScoreSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = CalculateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { level, mondaiScores } = validationResult.data;

    // Calculate section scores
    const sectionResults = calculateOfflineTestScore(
      level as JLPTLevel,
      mondaiScores.map(m => ({
        sectionType: m.sectionType as SectionType,
        mondaiNumber: m.mondaiNumber,
        correct: m.correct,
        total: m.total,
      }))
    );

    // Calculate total score
    const totalScore = calculateTotalScore(sectionResults);

    // Evaluate pass/fail
    const passFailResult = evaluatePassFail(level as JLPTLevel, sectionResults, totalScore);

    // Return results
    return NextResponse.json({
      success: true,
      results: {
        level,
        totalScore,
        isPassed: passFailResult.isPassed,
        sectionResults: sectionResults.map(section => ({
          sectionType: section.sectionType,
          rawScore: section.rawScore,
          weightedScore: section.weightedScore,
          rawMaxScore: section.rawMaxScore,
          normalizedScore: section.normalizedScore,
          isPassed: section.isPassed,
          referenceGrade: section.referenceGrade,
          mondaiBreakdown: section.mondaiBreakdown,
        })),
        sectionsPassed: passFailResult.sectionsPassed,
        failureReasons: passFailResult.failureReasons,
      },
    });
  } catch (error) {
    console.error('Calculator error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate score',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
