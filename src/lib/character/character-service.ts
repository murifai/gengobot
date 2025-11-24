// Character service for free chat mode
import { prisma } from '@/lib/prisma';
import { Character, CharacterCreationData, RelationshipType } from '@/types/character';
import { convertNameIfNeeded } from '@/lib/utils/japanese-converter';

export class CharacterService {
  /**
   * Create a new character for free chat
   */
  static async createCharacter(userId: string, data: CharacterCreationData): Promise<Character> {
    // Convert name to katakana if romaji
    const { displayName, romajiName } = convertNameIfNeeded(data.name);

    const character = await prisma.character.create({
      data: {
        name: displayName,
        nameRomaji: data.nameRomaji || romajiName,
        description: data.description,
        avatar: data.avatar,
        voice: data.voice || 'alloy',
        speakingStyle: data.speakingStyle,
        relationshipType: data.relationshipType,
        relationshipCustom: data.relationshipCustom,
        isUserCreated: true,
        userId: userId,
      },
    });

    return this.mapToCharacter(character);
  }

  /**
   * Get character by ID
   */
  static async getCharacterById(id: string): Promise<Character | null> {
    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) return null;
    return this.mapToCharacter(character);
  }

  /**
   * Get all characters for a user
   */
  static async getUserCharacters(userId: string): Promise<Character[]> {
    const characters = await prisma.character.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });

    return characters.map(this.mapToCharacter);
  }

  /**
   * Get all characters (admin/debug use)
   */
  static async getAllCharacters(): Promise<Character[]> {
    const characters = await prisma.character.findMany({
      orderBy: { id: 'desc' },
    });

    return characters.map(this.mapToCharacter);
  }

  /**
   * Get characters by relationship type
   */
  static async getCharactersByRelationship(
    userId: string,
    relationshipType: RelationshipType
  ): Promise<Character[]> {
    const characters = await prisma.character.findMany({
      where: {
        userId,
        relationshipType,
      },
      orderBy: { id: 'desc' },
    });

    return characters.map(this.mapToCharacter);
  }

  /**
   * Update character
   */
  static async updateCharacter(
    id: string,
    data: Partial<CharacterCreationData>
  ): Promise<Character> {
    const updateData: Record<string, unknown> = {};

    if (data.name) {
      const { displayName, romajiName } = convertNameIfNeeded(data.name);
      updateData.name = displayName;
      if (romajiName) {
        updateData.nameRomaji = romajiName;
      }
    }
    if (data.nameRomaji !== undefined) updateData.nameRomaji = data.nameRomaji;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.avatar !== undefined) updateData.avatar = data.avatar || null;
    if (data.voice) updateData.voice = data.voice;
    if (data.speakingStyle !== undefined) updateData.speakingStyle = data.speakingStyle;
    if (data.relationshipType) updateData.relationshipType = data.relationshipType;
    if (data.relationshipCustom !== undefined)
      updateData.relationshipCustom = data.relationshipCustom;

    const character = await prisma.character.update({
      where: { id },
      data: updateData,
    });

    return this.mapToCharacter(character);
  }

  /**
   * Delete character
   */
  static async deleteCharacter(id: string): Promise<void> {
    await prisma.character.delete({
      where: { id },
    });
  }

  /**
   * Get default/preset characters
   */
  static async getPresetCharacters(): Promise<Character[]> {
    const characters = await prisma.character.findMany({
      where: {
        isUserCreated: false,
      },
      orderBy: { id: 'asc' },
    });

    return characters.map(this.mapToCharacter);
  }

  /**
   * Create preset characters (for seeding)
   */
  static async createPresetCharacter(data: CharacterCreationData): Promise<Character> {
    const { displayName, romajiName } = convertNameIfNeeded(data.name);

    const character = await prisma.character.create({
      data: {
        name: displayName,
        nameRomaji: data.nameRomaji || romajiName,
        description: data.description,
        voice: data.voice || 'alloy',
        speakingStyle: data.speakingStyle,
        relationshipType: data.relationshipType,
        relationshipCustom: data.relationshipCustom,
        isUserCreated: false,
      },
    });

    return this.mapToCharacter(character);
  }

  /**
   * Map Prisma character to Character type
   */
  private static mapToCharacter(character: Record<string, unknown>): Character {
    return {
      id: character.id as string,
      name: character.name as string,
      nameRomaji: (character.nameRomaji as string) || undefined,
      description: (character.description as string) || undefined,
      avatar: (character.avatar as string) || undefined,
      voice: (character.voice as string) || 'alloy',
      speakingStyle: (character.speakingStyle as string) || undefined,
      relationshipType: (character.relationshipType as RelationshipType) || 'teman',
      relationshipCustom: (character.relationshipCustom as string) || undefined,
      isUserCreated: character.isUserCreated as boolean,
      userId: (character.userId as string) || undefined,
    };
  }

  /**
   * Generate character prompt for AI
   */
  static generateCharacterPrompt(character: Character): string {
    const relationshipContext =
      character.relationshipType === 'lainnya'
        ? character.relationshipCustom
        : character.relationshipType;

    return `You are ${character.name}, a Japanese conversation partner.

**Relationship**: ${relationshipContext}
**Description**: ${character.description || 'A friendly conversation partner'}
**Speaking Style**: ${character.speakingStyle || 'Natural and friendly'}

**Guidelines**:
- Respond naturally in Japanese as this character
- Maintain the speaking style described above
- Be helpful and engaging
- Keep responses concise (1-2 sentences)`;
  }
}
