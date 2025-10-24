import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks/[taskId]/decks - Get all decks associated with a task including flashcards
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Fetch task decks with flashcards
    const taskDecks = await prisma.taskDeck.findMany({
      where: { taskId },
      include: {
        deck: {
          include: {
            flashcards: {
              where: { isActive: true },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Transform to return decks with their flashcards
    const decks = taskDecks.map(td => ({
      id: td.deck.id,
      name: td.deck.name,
      description: td.deck.description,
      category: td.deck.category,
      difficulty: td.deck.difficulty,
      totalCards: td.deck.totalCards,
      flashcards: td.deck.flashcards,
      order: td.order,
    }));

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching task decks:', error);
    return NextResponse.json({ error: 'Failed to fetch task decks' }, { status: 500 });
  }
}
