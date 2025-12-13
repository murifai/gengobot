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

    let dbUser = null;

    if (adminSession) {
      // Admin session - find associated user or system admin user
      dbUser = await prisma.user.findFirst({
        where: { email: adminSession.email },
      });
      if (!dbUser) {
        dbUser = await prisma.user.findFirst({
          where: { isAdmin: true },
        });
      }
      if (!dbUser) {
        // Create a system user for admin operations if none exists
        dbUser = await prisma.user.create({
          data: {
            email: adminSession.email,
            name: adminSession.name,
            isAdmin: true,
            onboardingCompleted: true,
          },
        });
      }
    } else if (sessionUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: sessionUser.email! },
      });
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admin session users are treated as admin
    const isAdmin = dbUser.isAdmin || !!adminSession;

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

    if (myDecks) {
      where.createdBy = dbUser.id;
    } else if (!isAdmin) {
      // Non-admin users can only see their own decks and public decks
      where.OR = [{ createdBy: dbUser.id }, { isPublic: true }];
    }

    where.isActive = true;

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

    // Get user's favorites to check isFavorite status
    const userFavorites = await prisma.userFavorite.findMany({
      where: {
        userId: dbUser.id,
        deckId: { in: decks.map(d => d.id) },
      },
      select: { deckId: true },
    });
    const favoriteIds = new Set(userFavorites.map(f => f.deckId));

    // Calculate statistics for each deck including hafal/belum_hafal
    const decksWithStats = await Promise.all(
      decks.map(async deck => {
        const totalCards = deck.flashcards.length;

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

        const uniqueHafal = Number(masteredCards[0]?.count || 0);
        const uniqueBelumHafal = Number(notMasteredCards[0]?.count || 0);

        return {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          category: deck.category,
          difficulty: deck.difficulty,
          isPublic: deck.isPublic,
          studyCount: deck.studyCount,
          totalCards,
          uniqueHafal,
          uniqueBelumHafal,
          createdAt: deck.createdAt,
          updatedAt: deck.updatedAt,
          isFavorite: favoriteIds.has(deck.id),
          isOwner: deck.createdBy === dbUser.id,
          creatorName: deck.creator?.name || deck.creator?.email?.split('@')[0] || 'Anonymous',
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

    // Create deck
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

    // Log admin action if user is admin
    if (dbUser.isAdmin) {
      await prisma.adminLog.create({
        data: {
          adminId: dbUser.id,
          actionType: 'create_deck',
          entityType: 'deck',
          entityId: deck.id,
          details: {
            deckName: deck.name,
            category: deck.category,
            difficulty: deck.difficulty,
          },
        },
      });
    }

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }
}
