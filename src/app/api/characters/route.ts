import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
          relationshipType as 'friend' | 'colleague' | 'stranger' | 'family'
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const character = await CharacterService.createCharacter(
      user.id,
      body as CharacterCreationData
    );

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
