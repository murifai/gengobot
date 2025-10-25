// Character types for free chat mode

export type RelationshipType = 'friend' | 'colleague' | 'stranger' | 'family';

export type PersonalityType =
  | 'friendly'
  | 'professional'
  | 'casual'
  | 'formal'
  | 'playful'
  | 'serious'
  | 'helpful'
  | 'reserved';

export interface CharacterPersonality {
  type: PersonalityType;
  traits: string[];
  speakingStyle: string;
  interests: string[];
  backgroundStory: string;
}

export interface CharacterCreationData {
  name: string;
  description: string;
  voice?: string;
  personality: CharacterPersonality;
  relationshipType: RelationshipType;
  taskSpecific: boolean;
  assignedTasks?: string[];
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  voice?: string;
  personality: CharacterPersonality;
  speakingStyle?: string;
  taskSpecific: boolean;
  assignedTasks?: string[];
  relationshipType?: RelationshipType;
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
