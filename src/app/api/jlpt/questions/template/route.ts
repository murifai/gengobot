import { NextRequest, NextResponse } from 'next/server';
import { getMondaiConfig } from '@/config/jlpt-mondai-config';
import { generateExcelTemplate } from '@/lib/utils/excel-parser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const section = searchParams.get('section');
    const mondai = searchParams.get('mondai');

    if (!level || !section || !mondai) {
      return NextResponse.json(
        { error: 'level, section, and mondai are required' },
        { status: 400 }
      );
    }

    // Get mondai configuration
    const mondaiConfig = getMondaiConfig(level, section, parseInt(mondai));

    if (!mondaiConfig) {
      return NextResponse.json(
        { error: `Invalid mondai configuration for ${level}-${section}-${mondai}` },
        { status: 400 }
      );
    }

    // Generate Excel template
    const buffer = generateExcelTemplate({
      requiresPassage: mondaiConfig.requiresPassage,
      passageCount: mondaiConfig.passageCount,
      questionsPerPassage: mondaiConfig.questionsPerPassage,
      questionNumbers: mondaiConfig.questionNumbers,
      mondaiType: mondaiConfig.mondaiType,
    });

    const filename = `jlpt_${level}_${section}_mondai${mondai}_template.xlsx`;

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate template', details: message },
      { status: 500 }
    );
  }
}
