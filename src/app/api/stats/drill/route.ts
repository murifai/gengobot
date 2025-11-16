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

    // Get all user's decks
    const decks = await prisma.deck.findMany({
      where: {
        userId,
      },
      include: {
        cards: {
          include: {
            reviews: {
              where: {
                userId,
              },
              orderBy: {
                reviewedAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    let totalCards = 0;
    let masteredCards = 0;

    decks.forEach(deck => {
      deck.cards.forEach(card => {
        totalCards++;

        // Consider a card mastered if it has been reviewed and has interval > 21 days
        if (card.reviews.length > 0) {
          const lastReview = card.reviews[0];
          if (lastReview.interval && lastReview.interval >= 21) {
            masteredCards++;
          }
        }
      });
    });

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
