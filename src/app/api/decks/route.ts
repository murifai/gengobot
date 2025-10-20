import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET /api/decks - List decks with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const isPublic = searchParams.get('isPublic');
    const myDecks = searchParams.get('myDecks') === 'true';

    // Build filter conditions
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    if (myDecks) {
      where.createdBy = dbUser.id;
    } else if (!dbUser.isAdmin) {
      // Non-admin users can only see their own decks and public decks
      where.OR = [{ createdBy: dbUser.id }, { isPublic: true }];
    }

    where.isActive = true;

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
          _count: {
            select: {
              flashcards: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.deck.count({ where }),
    ]);

    return NextResponse.json({
      decks,
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
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
