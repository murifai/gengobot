import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { CardType } from '@/types/deck';

// GET /api/flashcards/[flashcardId] - Get a specific flashcard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) {
  try {
    const { flashcardId } = await params;

    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        deck: {
          select: {
            id: true,
            name: true,
            createdBy: true,
          },
        },
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcard' }, { status: 500 });
  }
}

// PUT /api/flashcards/[flashcardId] - Update a flashcard
export async function PUT(
  request: NextRequest,
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
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        deck: true,
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    // Check permissions
    if (flashcard.deck.createdBy !== dbUser.id && !dbUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Build update data based on card type
    const updateData: Record<string, unknown> = {};

    if (body.cardType) {
      updateData.cardType = body.cardType;
    }

    const cardType = (body.cardType || flashcard.cardType) as CardType;

    // Update type-specific fields based on card type
    switch (cardType) {
      case 'kanji':
        if (body.kanji !== undefined) updateData.kanji = body.kanji;
        if (body.kanjiMeaning !== undefined) updateData.kanjiMeaning = body.kanjiMeaning;
        if (body.onyomi !== undefined) updateData.onyomi = body.onyomi;
        if (body.kunyomi !== undefined) updateData.kunyomi = body.kunyomi;
        break;

      case 'vocabulary':
        if (body.word !== undefined) updateData.word = body.word;
        if (body.wordMeaning !== undefined) updateData.wordMeaning = body.wordMeaning;
        if (body.reading !== undefined) updateData.reading = body.reading;
        if (body.partOfSpeech !== undefined) updateData.partOfSpeech = body.partOfSpeech;
        break;

      case 'grammar':
        if (body.grammarPoint !== undefined) updateData.grammarPoint = body.grammarPoint;
        if (body.grammarMeaning !== undefined) updateData.grammarMeaning = body.grammarMeaning;
        if (body.usageNote !== undefined) updateData.usageNote = body.usageNote;
        break;
    }

    // Update common fields
    if (body.exampleSentence !== undefined) updateData.exampleSentence = body.exampleSentence;
    if (body.exampleTranslation !== undefined)
      updateData.exampleTranslation = body.exampleTranslation;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Update spaced repetition fields if provided
    if (body.easeFactor !== undefined) updateData.easeFactor = body.easeFactor;
    if (body.interval !== undefined) updateData.interval = body.interval;
    if (body.repetitions !== undefined) updateData.repetitions = body.repetitions;
    if (body.nextReviewDate !== undefined) updateData.nextReviewDate = body.nextReviewDate;
    if (body.lastReviewedAt !== undefined) updateData.lastReviewedAt = body.lastReviewedAt;

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: updateData,
    });

    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 });
  }
}

// DELETE /api/flashcards/[flashcardId] - Delete a flashcard
export async function DELETE(
  request: NextRequest,
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
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        deck: true,
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    // Check permissions
    if (flashcard.deck.createdBy !== dbUser.id && !dbUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete flashcard and update deck totalCards in a transaction
    await prisma.$transaction(async tx => {
      await tx.flashcard.delete({
        where: { id: flashcardId },
      });

      await tx.deck.update({
        where: { id: flashcard.deckId },
        data: {
          totalCards: { decrement: 1 },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 });
  }
}
