import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { CharacterService } from '@/lib/character/character-service';
import { CharacterCreationData } from '@/types/character';

// GET /api/characters - Get all characters for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const relationshipType = searchParams.get('relationshipType');
    const preset = searchParams.get('preset');

    if (preset === 'true') {
      const characters = await CharacterService.getPresetCharacters();
      return NextResponse.json(characters);
    }

    if (userId) {
      let characters;
      if (relationshipType) {
        characters = await CharacterService.getCharactersByRelationship(
          userId,
          relationshipType as 'teman' | 'guru' | 'atasan' | 'pacar' | 'keluarga' | 'lainnya'
        );
      } else {
        characters = await CharacterService.getUserCharacters(userId);
      }
      return NextResponse.json(characters);
    }

    // Return all characters if no userId is provided
    const allCharacters = await CharacterService.getAllCharacters();
    return NextResponse.json(allCharacters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

// POST /api/characters - Create new character
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the database user ID from email
    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const body = await request.json();

    const character = await CharacterService.createCharacter(
      dbUser.id,
      body as CharacterCreationData
    );

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
