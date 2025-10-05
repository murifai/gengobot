import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.json({ characters });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let characters;
    if (relationshipType) {
      characters = await CharacterService.getCharactersByRelationship(
        userId,
        relationshipType as 'friend' | 'colleague' | 'stranger' | 'family'
      );
    } else {
      characters = await CharacterService.getUserCharacters(userId);
    }

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

// POST /api/characters - Create new character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...characterData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const character = await CharacterService.createCharacter(
      userId,
      characterData as CharacterCreationData
    );

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
