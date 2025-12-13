import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { parseExcelFile } from '@/lib/export/deckExport';
import { ImportCardData } from '@/types/deck';

interface BulkImportResult {
  fileName: string;
  deckName: string;
  success: boolean;
  deckId?: string;
  cardsImported: number;
  errors: Array<{ row: number; message: string }>;
}

// POST /api/decks/import-bulk - Import multiple decks from Excel files (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Use admin session for admin panel
    const adminSession = await getAdminSession();

    if (!adminSession) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }

    // Get admin's associated user account or use admin ID
    const admin = await prisma.admin.findUnique({
      where: { id: adminSession.id },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Find or create a system user for admin-created decks
    let systemUser = await prisma.user.findFirst({
      where: { email: admin.email },
    });

    if (!systemUser) {
      // Use a default system user for admin imports
      systemUser = await prisma.user.findFirst({
        where: { isAdmin: true },
      });
    }

    if (!systemUser) {
      // Create a system user for admin imports if none exists
      systemUser = await prisma.user.create({
        data: {
          email: admin.email,
          name: admin.name,
          isAdmin: true,
          onboardingCompleted: true,
        },
      });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const category = formData.get('category') as string | null;
    const difficulty = formData.get('difficulty') as string | null;
    const isPublicParam = formData.get('isPublic') as string | null;
    const isActiveParam = formData.get('isActive') as string | null;
    const isTaskDeckParam = formData.get('isTaskDeck') as string | null;

    // Parse boolean parameters (default to true for admin imports)
    const isPublic = isPublicParam !== 'false';
    const isActive = isActiveParam !== 'false';
    const isTaskDeck = isTaskDeckParam === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results: BulkImportResult[] = [];

    for (const file of files) {
      // Extract deck name from filename (remove extension)
      const fileName = file.name;
      const deckName = fileName.replace(/\.(xlsx|xls)$/i, '');

      try {
        // Convert file to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Parse Excel file
        const { cards, errors } = parseExcelFile(arrayBuffer);

        if (cards.length === 0) {
          results.push({
            fileName,
            deckName,
            success: false,
            cardsImported: 0,
            errors:
              errors.length > 0 ? errors : [{ row: 0, message: 'No valid cards found in file' }],
          });
          continue;
        }

        // Create deck and flashcards in a transaction
        const result = await prisma.$transaction(async tx => {
          // Create deck
          const deck = await tx.deck.create({
            data: {
              name: deckName,
              description: null,
              category: category || null,
              difficulty: difficulty || null,
              totalCards: cards.length,
              createdBy: systemUser.id,
              isPublic,
              isActive,
              isTaskDeck,
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

        results.push({
          fileName,
          deckName,
          success: true,
          deckId: result.deck.id,
          cardsImported: cards.length,
          errors,
        });
      } catch (error) {
        console.error(`Error importing file ${fileName}:`, error);
        results.push({
          fileName,
          deckName,
          success: false,
          cardsImported: 0,
          errors: [
            {
              row: 0,
              message: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        });
      }
    }

    // Log admin action (AdminLog references User, not Admin)
    await prisma.adminLog.create({
      data: {
        adminId: systemUser.id,
        actionType: 'bulk_import_decks',
        entityType: 'deck',
        entityId: 'bulk',
        details: {
          totalFiles: files.length,
          successfulImports: results.filter(r => r.success).length,
          failedImports: results.filter(r => !r.success).length,
          totalCardsImported: results.reduce((sum, r) => sum + r.cardsImported, 0),
          performedByAdmin: admin.email,
        },
      },
    });

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failed === 0,
      summary: {
        total: files.length,
        successful,
        failed,
        totalCardsImported: results.reduce((sum, r) => sum + r.cardsImported, 0),
      },
      results,
    });
  } catch (error) {
    console.error('Error bulk importing decks:', error);
    return NextResponse.json({ error: 'Failed to bulk import decks' }, { status: 500 });
  }
}
