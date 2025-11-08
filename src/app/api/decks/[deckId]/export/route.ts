import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { exportDeckToExcel } from '@/lib/export/deckExport';

// GET /api/decks/[deckId]/export - Export deck to Excel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;

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

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        flashcards: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check permissions: owner, admin, or public deck
    if (deck.createdBy !== dbUser.id && !dbUser.isAdmin && !deck.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate Excel file
    const excelBuffer = exportDeckToExcel(deck.name, deck.flashcards);

    const filename = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting deck:', error);
    return NextResponse.json({ error: 'Failed to export deck' }, { status: 500 });
  }
}
