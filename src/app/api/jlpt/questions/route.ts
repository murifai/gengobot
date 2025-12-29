import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { prisma } from '@/lib/prisma';
import { questionSchema, createQuestionRequestSchema } from '@/lib/validation/jlpt-question';

// GET /api/jlpt/questions - List questions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const section = searchParams.get('section');
    const mondai = searchParams.get('mondai');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { isActive: true };

    if (level) where.level = level;
    if (section) where.sectionType = section;
    if (mondai) where.mondaiNumber = parseInt(mondai);

    const [questions, total] = await Promise.all([
      prisma.jLPTQuestion.findMany({
        where,
        include: {
          passage: true,
          answerChoices: {
            orderBy: { choiceNumber: 'asc' },
          },
        },
        orderBy: [{ mondaiNumber: 'asc' }, { questionNumber: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.jLPTQuestion.count({ where }),
    ]);

    return NextResponse.json({
      questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// POST /api/jlpt/questions - Create new question
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createQuestionRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { question, passage, passage_secondary } = validation.data;

    // Create question with passage in transaction
    const result = await prisma.$transaction(async (tx) => {
      let passageId: string | undefined;
      let passageSecondaryId: string | undefined;

      // Create primary passage if provided
      if (passage) {
        const createdPassage = await tx.jLPTPassage.create({
          data: {
            contentType: passage.content_type,
            title: passage.title,
            contentText: passage.content_text,
            mediaUrl: passage.media_url,
            createdBy: session.adminId,
          },
        });
        passageId = createdPassage.id;
      }

      // Create secondary passage if provided (for A-B comparison)
      if (passage_secondary) {
        const createdPassageSecondary = await tx.jLPTPassage.create({
          data: {
            contentType: passage_secondary.content_type,
            title: passage_secondary.title,
            contentText: passage_secondary.content_text,
            mediaUrl: passage_secondary.media_url,
            createdBy: session.adminId,
          },
        });
        passageSecondaryId = createdPassageSecondary.id;
      }

      // Create question
      const createdQuestion = await tx.jLPTQuestion.create({
        data: {
          level: question.level,
          sectionType: question.section_type,
          mondaiNumber: question.mondai_number,
          questionNumber: question.question_number,
          questionText: question.question_text,
          questionType: question.question_type,
          mondaiExplanation: question.mondai_explanation,
          blankPosition: question.blank_position,
          mediaUrl: question.media_url,
          mediaType: question.media_type,
          correctAnswer: question.correct_answer,
          difficulty: question.difficulty,
          passageId: passageId || question.passage_id,
          createdBy: session.adminId,
        },
      });

      // Create answer choices
      await tx.jLPTAnswerChoice.createMany({
        data: question.answer_choices.map((choice) => ({
          questionId: createdQuestion.id,
          choiceNumber: choice.choice_number,
          choiceType: choice.choice_type || 'text',
          choiceText: choice.choice_text,
          choiceMediaUrl: choice.choice_media_url,
          orderIndex: choice.order_index || 0,
        })),
      });

      // Create question unit if passages exist
      if (passageId || passageSecondaryId) {
        const unitType = passageSecondaryId
          ? 'ab_comparison'
          : question.question_type === 'cloze'
            ? 'cloze_test'
            : 'reading_comp';

        const unit = await tx.jLPTQuestionUnit.create({
          data: {
            level: question.level,
            sectionType: question.section_type,
            mondaiNumber: question.mondai_number,
            unitType,
            passageId: passageId!,
            passageIdSecondary: passageSecondaryId,
            difficulty: question.difficulty,
          },
        });

        // Link question to unit
        await tx.jLPTUnitQuestion.create({
          data: {
            unitId: unit.id,
            questionId: createdQuestion.id,
          },
        });
      }

      return createdQuestion;
    });

    return NextResponse.json({ success: true, question: result }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question', details: error.message },
      { status: 500 }
    );
  }
}
