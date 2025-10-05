// Character service for free chat mode
import { prisma } from '@/lib/prisma';
import {
  Character,
  CharacterCreationData,
  PersonalityType,
  RelationshipType,
} from '@/types/character';

export class CharacterService {
  /**
   * Create a new character for free chat
   */
  static async createCharacter(userId: string, data: CharacterCreationData): Promise<Character> {
    const character = await prisma.character.create({
      data: {
        name: data.name,
        description: data.description,
        personality: data.personality as object,
        speakingStyle: data.personality.speakingStyle,
        taskSpecific: data.taskSpecific,
        assignedTasks: data.assignedTasks || [],
        relationshipType: data.relationshipType,
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
      where: {
        OR: [{ userId }, { taskSpecific: false }],
      },
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
        taskSpecific: false,
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

    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.personality) {
      updateData.personality = data.personality as object;
      updateData.speakingStyle = data.personality.speakingStyle;
    }
    if (data.relationshipType) updateData.relationshipType = data.relationshipType;
    if (data.assignedTasks) updateData.assignedTasks = data.assignedTasks;

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
        taskSpecific: false,
      },
      orderBy: { id: 'asc' },
    });

    return characters.map(this.mapToCharacter);
  }

  /**
   * Create preset characters (for seeding)
   */
  static async createPresetCharacter(
    data: Omit<CharacterCreationData, 'taskSpecific'>
  ): Promise<Character> {
    const character = await prisma.character.create({
      data: {
        name: data.name,
        description: data.description,
        personality: data.personality as object,
        speakingStyle: data.personality.speakingStyle,
        taskSpecific: false,
        relationshipType: data.relationshipType,
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
      description: (character.description as string) || undefined,
      personality: character.personality as {
        type: PersonalityType;
        traits: string[];
        speakingStyle: string;
        interests: string[];
        backgroundStory: string;
      },
      speakingStyle: (character.speakingStyle as string) || undefined,
      taskSpecific: character.taskSpecific as boolean,
      assignedTasks: (character.assignedTasks as string[]) || undefined,
      relationshipType: (character.relationshipType as RelationshipType) || undefined,
      isUserCreated: character.isUserCreated as boolean,
      userId: (character.userId as string) || undefined,
    };
  }

  /**
   * Get personality suggestions based on relationship type
   */
  static getPersonalitySuggestions(relationshipType: RelationshipType): PersonalityType[] {
    const suggestions: Record<RelationshipType, PersonalityType[]> = {
      friend: ['friendly', 'casual', 'playful', 'helpful'],
      colleague: ['professional', 'helpful', 'friendly'],
      stranger: ['formal', 'reserved', 'professional'],
      family: ['friendly', 'casual', 'helpful', 'playful'],
    };

    return suggestions[relationshipType];
  }

  /**
   * Generate character prompt for AI
   */
  static generateCharacterPrompt(character: Character): string {
    const personality = character.personality;

    return `You are ${character.name}. ${character.description || ''}

Personality Type: ${personality.type}
Traits: ${personality.traits.join(', ')}
Speaking Style: ${personality.speakingStyle}
Interests: ${personality.interests.join(', ')}
Background: ${personality.backgroundStory}

${character.relationshipType ? `Relationship: ${character.relationshipType}` : ''}

Please respond in character, maintaining your personality and speaking style consistently.
Use natural Japanese appropriate for your character and relationship type.`;
  }
}
