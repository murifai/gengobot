import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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

    const where: Prisma.JLPTQuestionWhereInput = { isActive: true };

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
        orderBy: [{ mondaiNumber: 'asc' }, { createdAt: 'asc' }],
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
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// POST /api/jlpt/questions - Create new question(s)
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

    const { mondai, passages, questions } = validation.data;

    // Create questions with passages in transaction
    const result = await prisma.$transaction(async tx => {
      const createdPassageIds: string[] = [];
      let passageIdPrimary: string | undefined;
      let passageIdSecondary: string | undefined;

      // Create passages if provided
      if (passages && passages.length > 0) {
        for (const passage of passages) {
          // Check if updating existing passage
          if (passage.id) {
            await tx.jLPTPassage.update({
              where: { id: passage.id },
              data: {
                contentType: passage.content_type,
                title: passage.title,
                contentText: passage.content_text,
                mediaUrl: passage.media_url,
              },
            });
            createdPassageIds.push(passage.id);
          } else {
            // Create new passage
            const createdPassage = await tx.jLPTPassage.create({
              data: {
                contentType: passage.content_type,
                title: passage.title,
                contentText: passage.content_text,
                mediaUrl: passage.media_url,
                createdBy: session.adminId,
              },
            });
            createdPassageIds.push(createdPassage.id);
          }
        }

        // Assign passage IDs
        passageIdPrimary = createdPassageIds[0];
        passageIdSecondary = createdPassageIds[1]; // Will be undefined if only 1 passage
      }

      // Create question unit if passages exist (for grouped questions)
      let unitId: string | undefined;
      if (passageIdPrimary) {
        const unitType = passageIdSecondary
          ? 'ab_comparison'
          : mondai.question_type === 'cloze_test'
            ? 'cloze_test'
            : mondai.question_type === 'long_reading'
              ? 'long_reading'
              : 'reading_comp';

        const unit = await tx.jLPTQuestionUnit.create({
          data: {
            level: mondai.level,
            sectionType: mondai.section_type,
            mondaiNumber: mondai.mondai_number,
            unitType,
            passageId: passageIdPrimary,
            passageIdSecondary: passageIdSecondary,
            difficulty: mondai.difficulty,
          },
        });
        unitId = unit.id;
      }

      // Create all questions
      const createdQuestions = [];
      for (const questionData of questions) {
        const createdQuestion = await tx.jLPTQuestion.create({
          data: {
            level: mondai.level,
            sectionType: mondai.section_type,
            mondaiNumber: mondai.mondai_number,
            questionText: questionData.question_text,
            questionType: mondai.question_type,
            correctAnswer: questionData.correct_answer,
            difficulty: mondai.difficulty,
            passageId: passageIdPrimary,
            createdBy: session.adminId,
          },
        });

        // Create answer choices
        await tx.jLPTAnswerChoice.createMany({
          data: questionData.answer_choices.map(choice => ({
            questionId: createdQuestion.id,
            choiceNumber: choice.choice_number,
            choiceType: choice.choice_type || 'text',
            choiceText: choice.choice_text,
            choiceMediaUrl: choice.choice_media_url,
            orderIndex: choice.order_index || 0,
          })),
        });

        // Link question to unit if unit exists
        if (unitId) {
          await tx.jLPTUnitQuestion.create({
            data: {
              unitId,
              questionId: createdQuestion.id,
            },
          });
        }

        createdQuestions.push(createdQuestion);
      }

      return {
        questions: createdQuestions,
        unit_id: unitId,
        passage_ids: createdPassageIds,
      };
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
        count: result.questions.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create questions', details: errorMessage },
      { status: 500 }
    );
  }
}
