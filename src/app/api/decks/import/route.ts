import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { parseExcelFile } from '@/lib/export/deckExport';
import { ImportCardData } from '@/types/deck';

// POST /api/decks/import - Import deck from Excel file
export async function POST(request: NextRequest) {
  try {
    // Check for admin session first (admin panel), then user session
    const adminSession = await getAdminSession();
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine if this is an admin operation
    const isAdminOperation = !!adminSession;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string | null;
    const difficulty = formData.get('difficulty') as string | null;
    const isPublicParam = formData.get('isPublic') as string | null;
    const isActiveParam = formData.get('isActive') as string | null;
    const isTaskDeckParam = formData.get('isTaskDeck') as string | null;

    // Parse boolean parameters
    // For admins: default to true, for users: default to false for isPublic
    const isPublic = isPublicParam !== null ? isPublicParam !== 'false' : isAdminOperation;
    const isActive = isActiveParam !== 'false'; // Default to true
    const isTaskDeck = isTaskDeckParam === 'true';

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
      // Build deck data based on who is creating it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deckData: any = {
        name,
        description: description || null,
        category: category || null,
        difficulty: difficulty || null,
        totalCards: cards.length,
        isPublic,
        isActive,
        isTaskDeck,
      };

      if (isAdminOperation) {
        // Admin creating deck - use createdByAdmin
        deckData.createdByAdmin = adminSession.id;
      } else {
        // User creating deck - use createdBy
        const dbUser = await tx.user.findUnique({
          where: { email: sessionUser!.email! },
        });
        if (!dbUser) {
          throw new Error('User not found');
        }
        deckData.createdBy = dbUser.id;
      }

      const deck = await tx.deck.create({
        data: deckData,
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

    // Log admin action if admin operation
    if (isAdminOperation) {
      await prisma.adminLog.create({
        data: {
          adminId: adminSession.id,
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
