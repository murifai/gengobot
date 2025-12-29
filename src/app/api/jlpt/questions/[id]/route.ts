import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { prisma } from '@/lib/prisma';
import { questionSchema, createQuestionRequestSchema } from '@/lib/validation/jlpt-question';

// GET /api/jlpt/questions/[id] - Get single question
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const question = await prisma.jLPTQuestion.findUnique({
      where: { id },
      include: {
        passage: true,
        answerChoices: {
          orderBy: { choiceNumber: 'asc' },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

// PUT /api/jlpt/questions/[id] - Update question
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

    const { mondai, passages, questions: questionsData } = validation.data;

    // For updating single question, we expect only one question in the array
    if (questionsData.length !== 1) {
      return NextResponse.json(
        { error: 'Update endpoint expects exactly one question' },
        { status: 400 }
      );
    }

    const questionData = questionsData[0];
    const passage = passages?.[0];

    // Update in transaction
    const result = await prisma.$transaction(async tx => {
      let passageId: string | undefined;

      // Handle passage update or creation
      if (passage) {
        if (passage.id) {
          // Update existing passage
          await tx.jLPTPassage.update({
            where: { id: passage.id },
            data: {
              contentType: passage.content_type,
              title: passage.title,
              contentText: passage.content_text,
              mediaUrl: passage.media_url,
            },
          });
          passageId = passage.id;
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
          passageId = createdPassage.id;
        }
      }

      // Update question
      const updatedQuestion = await tx.jLPTQuestion.update({
        where: { id },
        data: {
          level: mondai.level,
          sectionType: mondai.section_type,
          mondaiNumber: mondai.mondai_number,
          questionType: mondai.question_type,
          difficulty: mondai.difficulty,
          questionText: questionData.question_text,
          correctAnswer: questionData.correct_answer,
          passageId: passageId,
        },
      });

      // Delete existing choices and create new ones
      await tx.jLPTAnswerChoice.deleteMany({
        where: { questionId: id },
      });

      await tx.jLPTAnswerChoice.createMany({
        data: questionData.answer_choices.map(choice => ({
          questionId: id,
          choiceNumber: choice.choice_number,
          choiceType: choice.choice_type || 'text',
          choiceText: choice.choice_text,
          choiceMediaUrl: choice.choice_media_url,
          orderIndex: choice.order_index || 0,
        })),
      });

      return updatedQuestion;
    });

    return NextResponse.json({ success: true, question: result });
  } catch (error) {
    console.error('Error updating question:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update question', details: message },
      { status: 500 }
    );
  }
}

// DELETE /api/jlpt/questions/[id] - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete (set isActive to false)
    await prisma.jLPTQuestion.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete question', details: message },
      { status: 500 }
    );
  }
}
