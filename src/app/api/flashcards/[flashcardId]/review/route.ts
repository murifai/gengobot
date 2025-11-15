import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

type Rating = 'belum_hafal' | 'hafal';

/**
 * Calculate next review date using simplified SM-2 algorithm (2 ratings)
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
    case 'belum_hafal':
      // Belum Hafal (Not Memorized) - equivalent to 'again'
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
      newInterval = 1; // Review again in 1 day
      newRepetitions = 0;
      break;

    case 'hafal':
      // Hafal (Memorized) - equivalent to 'easy'
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

    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
      select: { id: true, email: true, name: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { rating, sessionId, responseTime } = body;

    // Validate rating
    if (!['belum_hafal', 'hafal'].includes(rating)) {
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
          belumHafalCount: studySession.belumHafalCount + (rating === 'belum_hafal' ? 1 : 0),
          hafalCount: studySession.hafalCount + (rating === 'hafal' ? 1 : 0),
        };

        const cardsReviewed = studySession.cardsReviewed + 1;
        const cardsCorrect = studySession.cardsCorrect + (rating === 'hafal' ? 1 : 0);

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
