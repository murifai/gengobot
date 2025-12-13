import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { getAdminSession } from '@/lib/auth/admin-auth';

// GET /api/decks - List decks with pagination and filters
export async function GET(request: NextRequest) {
  try {
    // Check for admin session first (admin panel), then user session
    const adminSession = await getAdminSession();
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminPanelRequest = !!adminSession;
    let dbUser = null;

    // For admin panel requests, we don't need a user record for the listing
    // For user requests, we need the user record
    if (sessionUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: sessionUser.email! },
      });
    }

    // For user operations, we need the user record
    if (!isAdminPanelRequest && !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const isPublic = searchParams.get('isPublic');
    const isTaskDeck = searchParams.get('isTaskDeck');
    const myDecks = searchParams.get('myDecks') === 'true';

    // Build filter conditions
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    if (isTaskDeck !== null && isTaskDeck !== undefined) {
      where.isTaskDeck = isTaskDeck === 'true';
    }

    if (myDecks && dbUser) {
      where.createdBy = dbUser.id;
    } else if (!isAdminPanelRequest && dbUser) {
      // Non-admin users can only see their own decks and public decks
      where.OR = [{ createdBy: dbUser.id }, { isPublic: true }];
    }

    // Only filter by isActive for non-admin users
    // Admin can see all decks including inactive ones
    if (!isAdminPanelRequest) {
      where.isActive = true;
    }

    // Apply search filter with AND to combine with visibility conditions
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Fetch decks with pagination
    const [decks, total] = await Promise.all([
      prisma.deck.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          flashcards: {
            select: {
              id: true,
              nextReviewDate: true,
              repetitions: true,
              isActive: true,
            },
            where: {
              isActive: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.deck.count({ where }),
    ]);

    // Get user's favorites to check isFavorite status (only for user requests)
    let favoriteIds = new Set<string>();
    if (dbUser) {
      const userFavorites = await prisma.userFavorite.findMany({
        where: {
          userId: dbUser.id,
          deckId: { in: decks.map(d => d.id) },
        },
        select: { deckId: true },
      });
      favoriteIds = new Set(userFavorites.map(f => f.deckId));
    }

    // Calculate statistics for each deck including hafal/belum_hafal
    const decksWithStats = await Promise.all(
      decks.map(async deck => {
        const totalCards = deck.flashcards.length;

        let uniqueHafal = 0;
        let uniqueBelumHafal = 0;

        // Only calculate user-specific stats if we have a user
        if (dbUser) {
          // Get unique mastered cards (based on latest review rating)
          const masteredCards = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) as count
            FROM (
              SELECT DISTINCT ON (fr."flashcardId") fr."flashcardId", fr."rating"
              FROM "FlashcardReview" fr
              INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
              INNER JOIN "Flashcard" f ON fr."flashcardId" = f."id"
              WHERE ss."userId" = ${dbUser.id} AND f."deckId" = ${deck.id}
              ORDER BY fr."flashcardId", fr."reviewedAt" DESC
            ) latest_reviews
            WHERE latest_reviews."rating" = 'hafal'
          `;

          // Get unique not mastered cards (based on latest review rating)
          const notMasteredCards = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) as count
            FROM (
              SELECT DISTINCT ON (fr."flashcardId") fr."flashcardId", fr."rating"
              FROM "FlashcardReview" fr
              INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
              INNER JOIN "Flashcard" f ON fr."flashcardId" = f."id"
              WHERE ss."userId" = ${dbUser.id} AND f."deckId" = ${deck.id}
              ORDER BY fr."flashcardId", fr."reviewedAt" DESC
            ) latest_reviews
            WHERE latest_reviews."rating" = 'belum_hafal'
          `;

          uniqueHafal = Number(masteredCards[0]?.count || 0);
          uniqueBelumHafal = Number(notMasteredCards[0]?.count || 0);
        }

        return {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          category: deck.category,
          difficulty: deck.difficulty,
          isPublic: deck.isPublic,
          isActive: deck.isActive,
          isTaskDeck: deck.isTaskDeck,
          studyCount: deck.studyCount,
          totalCards,
          uniqueHafal,
          uniqueBelumHafal,
          createdAt: deck.createdAt,
          updatedAt: deck.updatedAt,
          isFavorite: favoriteIds.has(deck.id),
          isOwner: dbUser ? deck.createdBy === dbUser.id : false,
          creatorName: deck.creator?.name || deck.creator?.email?.split('@')[0] || 'Anonymous',
          creator: deck.creator,
        };
      })
    );

    return NextResponse.json({
      decks: decksWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 });
  }
}

// POST /api/decks - Create a new deck
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
    }

    // Create deck (user-created decks use createdBy)
    const deck = await prisma.deck.create({
      data: {
        name: body.name,
        description: body.description || null,
        isPublic: body.isPublic ?? false,
        category: body.category || null,
        difficulty: body.difficulty || null,
        createdBy: dbUser.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }
}
