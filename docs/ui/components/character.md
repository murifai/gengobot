# Character Components

> Components for AI character creation and interaction

[← Back to Index](../README.md)

---

## Overview

Character components are located in `/src/components/character/` and handle AI character management, display, and free conversation interfaces.

**Components:** 3

---

## CharacterCard

**File:** `/src/components/character/CharacterCard.tsx`

Display card for AI characters showing their information and providing quick actions.

### Features
- Character avatar display
- Character name and description
- Personality traits display
- Language level indicator
- Action buttons (select, edit, delete)
- Hover effects
- Character statistics

### Usage

```tsx
import { CharacterCard } from '@/components/character/CharacterCard'

<CharacterCard
  character={{
    id: '1',
    name: 'Sakura',
    description: 'A friendly Japanese teacher',
    avatarUrl: '/avatars/sakura.jpg',
    personality: ['patient', 'encouraging'],
    level: 'N5',
  }}
  onSelect={(id) => selectCharacter(id)}
  onEdit={(id) => router.push(`/characters/${id}/edit`)}
  onDelete={(id) => deleteCharacter(id)}
  showActions={true}
/>

// Grid of characters
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {characters.map((character) => (
    <CharacterCard
      key={character.id}
      character={character}
      onSelect={handleSelect}
    />
  ))}
</div>
```

### Props

```typescript
interface CharacterCardProps {
  character: {
    id: string
    name: string
    description: string
    avatarUrl?: string
    personality?: string[]
    level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
    voiceId?: string
  }
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  showActions?: boolean
  selected?: boolean
}
```

---

## CharacterCreator

**File:** `/src/components/character/CharacterCreator.tsx`

Comprehensive interface for creating and editing AI characters.

### Features
- Character name input
- Description editor
- Avatar upload/selection
- Personality trait selection
- Voice settings configuration
- System prompt editor
- Character level setting
- Preview character
- Advanced settings:
  - Temperature control
  - Response length
  - Formality level
  - Speaking style

### Usage

```tsx
import { CharacterCreator } from '@/components/character/CharacterCreator'

// Create new character
<CharacterCreator
  onSave={(characterData) => {
    createCharacter(characterData)
    router.push('/characters')
  }}
  onCancel={() => router.back()}
/>

// Edit existing character
<CharacterCreator
  characterId={characterId}
  initialData={characterData}
  onSave={(characterData) => {
    updateCharacter(characterId, characterData)
  }}
  onCancel={() => router.back()}
  mode="edit"
/>
```

### Props

```typescript
interface CharacterCreatorProps {
  characterId?: string
  initialData?: Partial<Character>
  onSave: (data: CharacterData) => void
  onCancel: () => void
  mode?: 'create' | 'edit'
}

interface CharacterData {
  name: string
  description: string
  avatarUrl?: string
  personality: string[]
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  systemPrompt: string
  voiceSettings?: {
    voiceId: string
    speed: number
    pitch: number
  }
  advancedSettings?: {
    temperature: number
    maxTokens: number
    formality: 'casual' | 'polite' | 'formal'
    speakingStyle: string
  }
}
```

---

## FreeChatInterface

**File:** `/src/components/character/FreeChatInterface.tsx`

Free conversation interface for chatting with AI characters without task constraints.

### Features
- Real-time chat with AI character
- Voice input support
- Voice output (character speaks)
- Message history
- Character context awareness
- Translation toggle
- Furigana display
- Save conversation
- Export chat history
- Character personality displayed

### Usage

```tsx
import { FreeChatInterface } from '@/components/character/FreeChatInterface'

<FreeChatInterface
  characterId={characterId}
  onClose={() => router.back()}
/>

// With voice enabled
<FreeChatInterface
  characterId={characterId}
  enableVoice={true}
  enableVoiceInput={true}
  onClose={() => router.back()}
/>

// With saved conversation
<FreeChatInterface
  characterId={characterId}
  conversationId={conversationId}
  onSave={(conversation) => saveConversation(conversation)}
/>
```

### Props

```typescript
interface FreeChatInterfaceProps {
  characterId: string
  conversationId?: string
  enableVoice?: boolean
  enableVoiceInput?: boolean
  showTranslation?: boolean
  showFurigana?: boolean
  onClose?: () => void
  onSave?: (conversation: Conversation) => void
}

interface Conversation {
  id: string
  characterId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
```

### Related Hooks
- [useStreamingChat](../hooks.md#usestreamingchat)
- [useVoiceConversation](../hooks.md#usevoiceconversation)

---

## Character System

### Character Personality

Characters can have multiple personality traits that affect their responses:
- `patient` - Slower pace, more explanations
- `encouraging` - Positive feedback, motivation
- `strict` - Corrects mistakes, formal
- `friendly` - Casual tone, warm
- `professional` - Business-like, formal

### Voice Settings

Characters support text-to-speech with customizable:
- Voice selection (multiple Japanese voices)
- Speaking speed (0.5x - 2.0x)
- Pitch adjustment

### System Prompts

Each character has a system prompt that defines:
- Role and personality
- Speaking style
- Language level
- Teaching approach
- Response format

---

## Related Components

- [Chat Components](./chat.md) - Core chat functionality
- [Conversation Components](./conversation.md) - Message display
- [Voice Components](./voice.md) - Audio features

---

[← Back to Index](../README.md)
