import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all flashcards from user's decks
    const decks = await prisma.deck.findMany({
      where: {
        createdBy: userId,
      },
      include: {
        flashcards: {
          select: {
            id: true,
          },
        },
      },
    });

    const totalCards = decks.reduce((sum, deck) => sum + deck.flashcards.length, 0);

    // Get the latest review for each flashcard
    const flashcardIds = decks.flatMap(deck => deck.flashcards.map(f => f.id));

    if (flashcardIds.length === 0) {
      return NextResponse.json({
        totalCards: 0,
        masteredCards: 0,
        masteryPercentage: 0,
      });
    }

    // Get latest review for each flashcard through study sessions
    const latestReviews = await prisma.flashcardReview.findMany({
      where: {
        flashcardId: { in: flashcardIds },
        session: {
          userId,
        },
      },
      orderBy: {
        reviewedAt: 'desc',
      },
      distinct: ['flashcardId'],
      select: {
        flashcardId: true,
        interval: true,
      },
    });

    // Consider a card mastered if it has been reviewed and has interval >= 21 days
    const masteredCards = latestReviews.filter(review => review.interval >= 21).length;

    const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

    return NextResponse.json({
      totalCards,
      masteredCards,
      masteryPercentage,
    });
  } catch (error) {
    console.error('Error fetching Drill stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
