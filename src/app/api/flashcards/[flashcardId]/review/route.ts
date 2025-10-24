import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

type Rating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculate next review date using SM-2 algorithm
 */
function calculateNextReview(
  rating: Rating,
  easeFactor: number,
  interval: number,
  repetitions: number
): { newEaseFactor: number; newInterval: number; newRepetitions: number } {
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;

  // Update ease factor based on rating
  switch (rating) {
    case 'again':
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
      newInterval = 1; // Review again in 1 day
      newRepetitions = 0;
      break;

    case 'hard':
      newEaseFactor = Math.max(1.3, easeFactor - 0.15);
      if (repetitions === 0) {
        newInterval = 1;
      } else {
        newInterval = Math.round(interval * 1.2);
      }
      newRepetitions = repetitions + 1;
      break;

    case 'good':
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * easeFactor);
      }
      newRepetitions = repetitions + 1;
      break;

    case 'easy':
      newEaseFactor = easeFactor + 0.15;
      if (repetitions === 0) {
        newInterval = 4;
      } else if (repetitions === 1) {
        newInterval = 10;
      } else {
        newInterval = Math.round(interval * easeFactor * 1.3);
      }
      newRepetitions = repetitions + 1;
      break;
  }

  return { newEaseFactor, newInterval, newRepetitions };
}

/**
 * POST /api/flashcards/[flashcardId]/review
 * Record a flashcard review and update spaced repetition data
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ flashcardId: string }> }
) {
  try {
    const { flashcardId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database - support both authId (UUID) and id (CUID) formats
    let dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true, email: true, name: true },
    });

    // Fallback to email lookup if authId lookup fails
    if (!dbUser && user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, email: true, name: true },
      });
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { rating, sessionId, responseTime } = body;

    // Validate rating
    if (!['again', 'hard', 'good', 'easy'].includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Get flashcard
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        deck: true,
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    // Check access
    if (!flashcard.deck.isPublic && flashcard.deck.createdBy !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate new spaced repetition values
    const { newEaseFactor, newInterval, newRepetitions } = calculateNextReview(
      rating as Rating,
      flashcard.easeFactor,
      flashcard.interval,
      flashcard.repetitions
    );

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Update flashcard with new spaced repetition data
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        easeFactor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReviewDate,
        lastReviewedAt: new Date(),
      },
    });

    // Create review record
    const review = await prisma.flashcardReview.create({
      data: {
        flashcard: {
          connect: { id: flashcardId },
        },
        session: {
          connect: { id: sessionId },
        },
        rating: rating as Rating,
        responseTime: responseTime || 0,
        easeFactor: flashcard.easeFactor,
        interval: flashcard.interval,
      },
    });

    // Update study session statistics if sessionId provided
    if (sessionId) {
      const studySession = await prisma.studySession.findUnique({
        where: { id: sessionId },
      });

      if (studySession && studySession.userId === dbUser.id) {
        const ratingCounts = {
          againCount: studySession.againCount + (rating === 'again' ? 1 : 0),
          hardCount: studySession.hardCount + (rating === 'hard' ? 1 : 0),
          goodCount: studySession.goodCount + (rating === 'good' ? 1 : 0),
          easyCount: studySession.easyCount + (rating === 'easy' ? 1 : 0),
        };

        const cardsReviewed = studySession.cardsReviewed + 1;
        const cardsCorrect = studySession.cardsCorrect + (rating !== 'again' ? 1 : 0);

        // Calculate average response time
        const totalResponseTime =
          (studySession.averageResponseTime || 0) * studySession.cardsReviewed +
          (responseTime || 0);
        const averageResponseTime = totalResponseTime / cardsReviewed;

        await prisma.studySession.update({
          where: { id: sessionId },
          data: {
            cardsReviewed,
            cardsCorrect,
            averageResponseTime,
            ...ratingCounts,
          },
        });
      }
    }

    return NextResponse.json({
      flashcard: updatedFlashcard,
      review,
      nextReviewDate,
      interval: newInterval,
    });
  } catch (error) {
    console.error('Error recording review:', error);
    return NextResponse.json({ error: 'Failed to record review' }, { status: 500 });
  }
}
