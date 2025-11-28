import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET: List user's decks
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decks = await prisma.deck.findMany({
      where: {
        createdBy: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        totalCards: true,
        category: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Get decks error:', error);
    return NextResponse.json({ error: 'Failed to get decks' }, { status: 500 });
  }
}

// POST: Add vocabulary to a specific deck
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { word, reading, meaning, deckId } = await request.json();

    if (!word || !meaning) {
      return NextResponse.json({ error: 'Word and meaning required' }, { status: 400 });
    }

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID required' }, { status: 400 });
    }

    // Verify deck belongs to user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        createdBy: session.user.id,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check if card already exists in this deck
    const existingCard = await prisma.flashcard.findFirst({
      where: {
        deckId: deck.id,
        word: word,
      },
    });

    if (existingCard) {
      return NextResponse.json({ message: 'Already in deck', cardId: existingCard.id });
    }

    // Create flashcard
    const flashcard = await prisma.flashcard.create({
      data: {
        deckId: deck.id,
        cardType: 'vocabulary',
        word: word,
        reading: reading || null,
        wordMeaning: meaning,
      },
    });

    // Update deck card count
    await prisma.deck.update({
      where: { id: deck.id },
      data: { totalCards: { increment: 1 } },
    });

    return NextResponse.json({ success: true, cardId: flashcard.id, deckName: deck.name });
  } catch (error) {
    console.error('Add to deck error:', error);
    return NextResponse.json({ error: 'Failed to add to deck' }, { status: 500 });
  }
}
