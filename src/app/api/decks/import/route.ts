import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { parseExcelFile } from '@/lib/export/deckExport';
import { ImportCardData } from '@/types/deck';

// POST /api/decks/import - Import deck from Excel file
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string | null;
    const difficulty = formData.get('difficulty') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse Excel file
    const { cards, errors } = parseExcelFile(arrayBuffer);

    if (cards.length === 0) {
      return NextResponse.json(
        {
          success: false,
          errors:
            errors.length > 0 ? errors : [{ row: 0, message: 'No valid cards found in file' }],
        },
        { status: 400 }
      );
    }

    // Create deck and flashcards in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create deck
      const deck = await tx.deck.create({
        data: {
          name,
          description: description || null,
          category: category || null,
          difficulty: difficulty || null,
          totalCards: cards.length,
          createdBy: dbUser.id,
        },
      });

      // Create flashcards using createMany for better performance
      const flashcardData = cards.map((card: ImportCardData, index: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cardData: any = {
          deckId: deck.id,
          cardType: card.cardType,
          position: index,
          exampleSentence: card.exampleSentence || null,
          exampleTranslation: card.exampleTranslation || null,
          notes: card.notes || null,
          tags: card.tags || null,
        };

        // Add type-specific fields
        switch (card.cardType) {
          case 'kanji':
            cardData.kanji = card.kanji;
            cardData.kanjiMeaning = card.kanjiMeaning;
            cardData.onyomi = card.onyomi || null;
            cardData.kunyomi = card.kunyomi || null;
            break;
          case 'vocabulary':
            cardData.word = card.word;
            cardData.wordMeaning = card.wordMeaning;
            cardData.reading = card.reading;
            cardData.partOfSpeech = card.partOfSpeech || null;
            break;
          case 'grammar':
            cardData.grammarPoint = card.grammarPoint;
            cardData.grammarMeaning = card.grammarMeaning;
            cardData.usageNote = card.usageNote || null;
            break;
        }

        return cardData;
      });

      await tx.flashcard.createMany({
        data: flashcardData,
      });

      return { deck };
    });

    // Log admin action if user is admin
    if (dbUser.isAdmin) {
      await prisma.adminLog.create({
        data: {
          adminId: dbUser.id,
          actionType: 'import_deck',
          entityType: 'deck',
          entityId: result.deck.id,
          details: {
            deckName: name,
            cardsImported: cards.length,
            errorCount: errors.length,
            fileName: file.name,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      deckId: result.deck.id,
      cardsImported: cards.length,
      errors,
    });
  } catch (error) {
    console.error('Error importing deck:', error);
    return NextResponse.json({ error: 'Failed to import deck' }, { status: 500 });
  }
}
