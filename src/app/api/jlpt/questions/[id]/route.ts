import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { prisma } from '@/lib/prisma';
import { questionSchema } from '@/lib/validation/jlpt-question';

// GET /api/jlpt/questions/[id] - Get single question
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const question = await prisma.jLPTQuestion.findUnique({
      where: { id: params.id },
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
  } catch (error: any) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

// PUT /api/jlpt/questions/[id] - Update question
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question: questionData, answer_choices } = body;

    // Validate question data
    const validation = questionSchema.safeParse({
      ...questionData,
      answer_choices,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update question
      const updatedQuestion = await tx.jLPTQuestion.update({
        where: { id: params.id },
        data: {
          questionText: questionData.question_text,
          questionType: questionData.question_type,
          mondaiExplanation: questionData.mondai_explanation,
          blankPosition: questionData.blank_position,
          mediaUrl: questionData.media_url,
          mediaType: questionData.media_type,
          correctAnswer: questionData.correct_answer,
          difficulty: questionData.difficulty,
        },
      });

      // Delete existing choices and create new ones
      await tx.jLPTAnswerChoice.deleteMany({
        where: { questionId: params.id },
      });

      await tx.jLPTAnswerChoice.createMany({
        data: answer_choices.map((choice: any) => ({
          questionId: params.id,
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
  } catch (error: any) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/jlpt/questions/[id] - Delete question
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete (set isActive to false)
    await prisma.jLPTQuestion.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question', details: error.message },
      { status: 500 }
    );
  }
}
