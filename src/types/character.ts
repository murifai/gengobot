// Character types for free chat mode

// Relationship types: teman, guru, atasan, pacar, keluarga, lainnya
export type RelationshipType = 'teman' | 'guru' | 'atasan' | 'pacar' | 'keluarga' | 'lainnya';

export interface CharacterCreationData {
  name: string;
  nameRomaji?: string;
  description?: string;
  avatar?: string;
  voice?: string;
  speakingStyle?: string;
  relationshipType: RelationshipType;
  relationshipCustom?: string;
}

export interface Character {
  id: string;
  name: string;
  nameRomaji?: string;
  description?: string;
  avatar?: string;
  voice: string;
  speakingStyle?: string;
  relationshipType: RelationshipType;
  relationshipCustom?: string;
  isUserCreated: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FreeChatConversation {
  id: string;
  userId: string;
  characterId: string;
  messages: FreeChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FreeChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface ConversationState {
  conversationId: string;
  characterId: string;
  messages: FreeChatMessage[];
  isActive: boolean;
  lastMessageAt: Date;
}
