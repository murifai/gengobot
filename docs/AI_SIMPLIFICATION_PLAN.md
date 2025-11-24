# Plan: Simplifikasi AI Response System

## Overview

Menyederhanakan sistem AI response untuk mengurangi penggunaan token dan memperjelas alur proses.

### Model Configuration

- **AI Response**: `gpt-5-nano`
- **Feedback/Hint/Objective Detection**: `gpt-4o-mini`

---

## Phase 1: Simplify Task Response System

### 1.1 Update Model Configuration

**File**: `src/lib/ai/openai-client.ts`

```typescript
export const MODELS = {
  RESPONSE: 'gpt-5-nano', // AI conversation response
  ANALYSIS: 'gpt-4o-mini', // Feedback, hint, objective detection
  WHISPER: 'whisper-1',
  TTS: 'gpt-4o-mini-tts',
} as const;
```

### 1.2 Refactor Task Streaming Route

**File**: `src/app/api/task-attempts/[attemptId]/stream/route.ts`

**Perubahan**:

- Gunakan `task.prompt` dari database sebagai system prompt
- Hapus hardcoded character prompt
- Simplify prompt structure

**New System Prompt Structure**:

```typescript
const systemPrompt = `${task.prompt}

**Context**:
- Scenario: ${task.scenario}
- Difficulty: ${task.difficulty}

**Learning Objectives**:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

**Instructions**:
- Respond in Japanese appropriate for ${task.difficulty} level
- Keep responses concise (1-3 sentences)
- Do not help user to answer your question.
- Adapt your next question based on the user’s answer.
- Do not answer on behalf of the user.`;
```

### 1.3 Add Hint API Endpoint

**File baru**: `src/app/api/task-attempts/[attemptId]/hint/route.ts`

```typescript
// POST /api/task-attempts/[attemptId]/hint
// Request: { lastMessage: string, currentObjective: string }
// Response: { hint: string }

// Prompt for hint generation:
const hintPrompt = `Based on this conversation context, provide a helpful hint in Japanese.

Last message: ${lastMessage}
Current objective: ${currentObjective}
Student level: ${userLevel}

Generate a short hint with this format
"kamu bisa respon sepert ... atau ... coba gunakan dengan kosakata seperti ...`;
```

### 1.4 Update Objective Detection

**File**: `src/lib/ai/objective-detection.ts`

**Perubahan**: Ubah dari keyword matching ke AI-based detection

```typescript
// Prompt for objective detection:
const detectionPrompt = `Analyze if the learning objective has been completed.

Objective: ${objective}
Recent conversation:
${recentMessages}

Has this objective been achieved? Respond with JSON:
{ "completed": boolean, "confidence": number, "evidence": string }`;
```

### 1.5 Files to Remove/Simplify

| File                                     | Action   | Reason                        |
| ---------------------------------------- | -------- | ----------------------------- |
| `src/lib/ai/task-response-generator.ts`  | Simplify | Remove character role logic   |
| `src/lib/ai/prompts.ts`                  | Simplify | Remove unused functions       |
| `src/lib/ai/task-based-service.ts`       | Simplify | Remove character-related code |
| `src/lib/tasks/conversation-guidance.ts` | Simplify | Remove complex guidance logic |

---

## Phase 2: Update Character System

### 2.1 Update Prisma Schema

**File**: `prisma/schema.prisma`

**Before**:

```prisma
model Character {
  id               String  @id @default(cuid())
  name             String
  description      String? @db.Text
  avatar           String?
  voice            String?
  personality      Json    // Personality traits
  speakingStyle    String? @db.Text
  taskSpecific     Boolean @default(false)
  assignedTasks    Json?
  relationshipType String?
  isUserCreated    Boolean @default(true)
  userId           String?
  // ...
}
```

**After**:

```prisma
model Character {
  id                 String  @id @default(cuid())
  name               String  // Stored in Katakana/Kanji
  nameRomaji         String? // Original romaji input for reference
  description        String? @db.Text
  avatar             String?
  voice              String  @default("alloy") // OpenAI TTS voice
  // speed removed - locked at 1.0
  speakingStyle      String? @db.Text // Replaces personality traits
  relationshipType   String  @default("teman") // teman, guru, atasan, pacar, keluarga, lainnya
  relationshipCustom String? // For custom "lainnya" input
  isUserCreated      Boolean @default(true)

  userId             String?
  user               User?   @relation(fields: [userId], references: [id])
  conversations      Conversation[]
  freeConversations  FreeConversation[]

  @@index([userId])
}
```

**Removed Fields**:

- `personality` (Json) → diganti dengan `speakingStyle`
- `taskSpecific` → tidak digunakan lagi
- `assignedTasks` → tidak digunakan lagi

### 2.2 Add Romaji to Katakana Converter using Wanakana

**File baru**: `src/lib/utils/japanese-converter.ts`

Install wanakana library:

```bash
npm install wanakana
npm install -D @types/wanakana
```

```typescript
import { toKatakana, isRomaji as wanakanaIsRomaji } from 'wanakana';

export function romajiToKatakana(romaji: string): string {
  return toKatakana(romaji);
}

export function isRomaji(text: string): boolean {
  return wanakanaIsRomaji(text);
}

export function convertNameIfNeeded(name: string): {
  displayName: string;
  romajiName: string | null;
} {
  if (isRomaji(name)) {
    return {
      displayName: romajiToKatakana(name),
      romajiName: name,
    };
  }
  return {
    displayName: name,
    romajiName: null,
  };
}
```

### 2.3 Update Character Creation Form

**File**: `src/app/app/profile/characters/new/page.tsx`

**Form Fields**:

1. **Avatar** (existing)
   - Image upload

2. **Nama Karakter**
   - Input field
   - Auto-convert preview jika romaji
   - Placeholder: `例: タナカ ユキ`

3. **Deskripsi**
   - Textarea
   - Deskripsi karakter

4. **Voice**
   - button select: semua voice
   - Sama dengan task creation ada contoh suaranya
   - Speed locked at 1.0 (tidak ada field)

5. **Hubungan**
   - Dropdown: Teman, Guru, Atasan, Pacar, Keluarga, Lainnya
   - Jika "Lainnya" dipilih, tampilkan input tambahan

6. **Speaking Style**
   - Textarea
   - Deskripsi bebas gaya bicara karakter
   - Placeholder: `contoh: Kasual, malu malu, dialek kansai.`

### 2.4 Update Character Edit Form

**File**: `src/app/app/profile/characters/[id]/edit/page.tsx`

Same updates as creation form.

### 2.5 Update Character Prompt Generation

**File**: `src/lib/character/character-service.ts`

```typescript
export function generateCharacterPrompt(character: Character): string {
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
```

---

## Phase 3: Add Hint UI Components

### 3.1 Create Hint Button Component

**File baru**: `src/components/chat/HintButton.tsx`

```typescript
interface HintButtonProps {
  attemptId: string;
  lastMessage: string;
  currentObjective?: string;
  disabled?: boolean;
}

export function HintButton({ attemptId, lastMessage, currentObjective, disabled }: HintButtonProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchHint = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/task-attempts/${attemptId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessage, currentObjective }),
      });
      const data = await response.json();
      setHint(data.hint);
      setShowTooltip(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={fetchHint}
        disabled={disabled || loading}
        variant="ghost"
        size="icon"
        className="h-8 w-8"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
      </Button>

      {showTooltip && hint && (
        <div className="absolute bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border max-w-xs">
          <p className="text-sm">{hint}</p>
          <button onClick={() => setShowTooltip(false)} className="absolute top-1 right-1">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
```

### 3.2 Update Chat Interfaces

**Task Chat** - Add hint button di atas input field (kiri)
**Free Chat** - Add hint button untuk normal dan realtime mode

### 3.3 Create Hint API for Free Chat

**File baru**: `src/app/api/free-conversation/[sessionId]/hint/route.ts`

```typescript
// POST /api/free-conversation/[sessionId]/hint
// Request: { lastMessage: string }
// Response: { hint: string }

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { lastMessage } = await request.json();

  // Get session with character info
  const session = await prisma.freeConversation.findUnique({
    where: { id: sessionId },
    include: { character: true },
  });

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const character = session.character;
  const relationshipContext =
    character.relationshipType === 'lainnya'
      ? character.relationshipCustom
      : character.relationshipType;

  // Generate hint based on character context
  const hintPrompt = `Based on this conversation with a ${relationshipContext}, provide a helpful hint.

Character: ${character.name}
Relationship: ${relationshipContext}
Speaking Style: ${character.speakingStyle || 'Natural'}
Last message from character: ${lastMessage}

Generate a short hint in Indonesian with this format:
"kamu bisa respon seperti ... atau ... coba gunakan dengan kosakata seperti ..."`;

  const response = await openai.chat.completions.create({
    model: MODELS.ANALYSIS, // gpt-4o-mini
    messages: [
      {
        role: 'system',
        content: 'You are a Japanese language learning assistant providing hints.',
      },
      { role: 'user', content: hintPrompt },
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  return NextResponse.json({
    hint: response.choices[0]?.message?.content || 'Coba jawab dengan sopan.',
  });
}
```

### 3.4 Update Free Chat Interface with Hint Button

**File**: `src/app/app/kaiwa/bebas/FreeConversationClient.tsx`

**Perubahan**:

- Import HintButton component
- Add hint button di atas input field (kiri) untuk normal mode
- Add hint button untuk realtime mode
- Pass sessionId dan lastMessage ke HintButton

```typescript
// Di normal chat interface
<div className="flex items-center gap-2">
  <HintButton
    sessionId={session.id}
    lastMessage={lastAssistantMessage}
    disabled={isStreaming}
    type="free-chat"
  />
  {/* Input field */}
</div>

// Di realtime mode
{isSessionActive && (
  <div className="flex items-center gap-2">
    <HintButton
      sessionId={selectedCharacter.id}
      lastMessage={lastWebRTCMessage}
      disabled={false}
      type="free-chat"
    />
    {/* Text input */}
  </div>
)}
```

### 3.5 Update HintButton Component for Multiple Types

**File**: `src/components/chat/HintButton.tsx`

```typescript
interface HintButtonProps {
  // For task-based
  attemptId?: string;
  currentObjective?: string;
  // For free chat
  sessionId?: string;
  // Common
  lastMessage: string;
  disabled?: boolean;
  type: 'task' | 'free-chat';
}

export function HintButton({
  attemptId,
  sessionId,
  lastMessage,
  currentObjective,
  disabled,
  type,
}: HintButtonProps) {
  const fetchHint = async () => {
    setLoading(true);
    try {
      const endpoint =
        type === 'task'
          ? `/api/task-attempts/${attemptId}/hint`
          : `/api/free-conversation/${sessionId}/hint`;

      const body = type === 'task' ? { lastMessage, currentObjective } : { lastMessage };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setHint(data.hint);
      setShowTooltip(true);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

---

## Phase 4: Cleanup & Optimization

### 4.1 Files to Delete

| File                          | Reason             |
| ----------------------------- | ------------------ |
| (Review setelah implementasi) | Remove unused code |

### 4.2 Files to Update

| File                     | Changes                        |
| ------------------------ | ------------------------------ |
| `src/types/ai.ts`        | Update types for new structure |
| `src/types/character.ts` | Update Character type          |
| `src/lib/ai/index.ts`    | Update exports                 |

### 4.3 Database Migration

```bash
npx prisma migrate dev --name simplify_character_schema
```

**Migration Script** (jika perlu convert existing data):

```typescript
// Convert existing characters
await prisma.character.updateMany({
  data: {
    relationshipType: 'teman', // default for existing
  },
});

// Convert personality to speakingStyle if needed
const characters = await prisma.character.findMany();
for (const char of characters) {
  if (char.personality && !char.speakingStyle) {
    const traits = char.personality as { traits?: string[] };
    await prisma.character.update({
      where: { id: char.id },
      data: {
        speakingStyle: traits?.traits?.join(', ') || null,
      },
    });
  }
}
```

---

## Summary

### Task Flow (Simplified)

```
Session Start
    ↓
Use task.prompt (from DB) + user level
    ↓
AI Response (gpt-5-nano)
    ↓
Objective Detection (gpt-4o-mini)
    ↓
[Optional] User clicks Hint button
    ↓
Feedback (gpt-4o-mini) when "Selesai" pressed
```

### Character Flow

```
User creates character
    ↓
Name auto-converted to Katakana (if romaji)
    ↓
Select hubungan + speaking style
    ↓
Use in Free Chat / WebRTC
    ↓
[Optional] Hint button available
```

### Field Changes Summary

| Area                       | Before           | After                    |
| -------------------------- | ---------------- | ------------------------ |
| Task Prompt                | Hardcoded        | `task.prompt` from DB    |
| Task Character             | Used             | Removed                  |
| Character.personality      | Json with traits | Removed                  |
| Character.speakingStyle    | Optional         | Primary style field      |
| Character.relationshipType | Optional         | Required (dropdown)      |
| Character.voice speed      | Configurable     | Locked at 1.0            |
| Hint System                | Auto/complex     | Button-triggered tooltip |

---

## Additional Improvements

### Audio Response Differentiation ✅

**Issue**: Currently AI always responds with audio regardless of input type.

**Solution**: Differentiate response based on input method:

- **Text message** → No audio response (text only)
- **Voice message** → Include audio response (TTS)

**Implementation**: ✅ COMPLETED

1. Added `isVoiceMessage` parameter to streaming APIs
2. Conditionally generate TTS only when `isVoiceMessage === true`
3. Updated client components to pass voice flag when sending messages

**Files modified**:

- `src/app/api/task-attempts/[attemptId]/stream/route.ts` ✅
- `src/app/api/free-conversation/[sessionId]/stream/route.ts` ✅
- `src/hooks/useStreamingChat.ts` ✅
- `src/components/app/kaiwa/TaskAttemptClientStreaming.tsx` ✅
- `src/app/app/kaiwa/bebas/FreeConversationClient.tsx` ✅

---

## Resolved

- ✅ **Model Configuration**: `gpt-5-nano` untuk AI response, `gpt-4o-mini` untuk analysis
- ✅ **Romaji Converter**: Menggunakan library `wanakana`
- ✅ **Data Migration**: Tidak perlu - mulai fresh di VPS

---

## Implementation Order

1. Phase 1.1-1.2: Model config & Task streaming (backend)
2. Phase 2.1: Schema update & migration
3. Phase 2.2-2.4: Character form updates (frontend)
4. Phase 1.3-1.4: Hint & detection APIs
5. Phase 3: Hint UI components
6. Phase 4: Cleanup
