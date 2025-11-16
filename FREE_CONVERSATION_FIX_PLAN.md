# Free Conversation (Kaiwa Bebas) - Fix Plan

## Current Issues

1. **No Character Selection**: User can't choose which character to talk to
2. **Wrong API Endpoint**: Using `/api/task-attempts/[id]/stream` instead of free conversation endpoint
3. **No Character-Specific History**: All conversations in one session

## What's Been Done ✅

### 1. Database Schema Updated

```prisma
model FreeConversation {
  characterId String? // Added for character-specific conversations
  character   Character? @relation(...)
}

model Character {
  freeConversations FreeConversation[] // Added relation
}
```

**Status**: ✅ Schema updated and pushed to database

---

## What Needs to Be Done

### 2. Create Free Conversation Streaming API

**File to Create**: `src/app/api/free-conversation/[sessionId]/stream/route.ts`

**Purpose**: Stream AI responses for free conversation (not task-based)

**Key Features**:

- Use character personality from database
- No task/objective checking
- Simple conversation flow
- Save to `conversationHistory` in FreeConversation table

**Reference**: Copy from `src/app/api/task-attempts/[attemptId]/stream/route.ts` and simplify

---

### 3. Add Character Selection UI

**File to Modify**: `src/app/app/kaiwa/bebas/FreeConversationClient.tsx`

**Add Before Chat**:

```typescript
// 1. Fetch available characters
const [characters, setCharacters] = useState<Character[]>([]);
const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

// 2. Show character selection if not selected
if (!selectedCharacter) {
  return <CharacterSelectionUI />;
}

// 3. Create/get session with characterId
const response = await fetch('/api/free-conversation/session', {
  body: JSON.stringify({
    userId: user.id,
    characterId: selectedCharacter
  })
});
```

---

### 4. Update Session API to Handle CharacterId

**File to Modify**: `src/app/api/free-conversation/session/route.ts`

**Changes**:

```typescript
// Accept characterId in request
const { userId, characterId } = await request.json();

// Find existing session for this user + character combo
const existingSession = await prisma.freeConversation.findFirst({
  where: {
    userId,
    characterId,  // ← Add this
    endTime: null,
  }
});

// Create with characterId
const newSession = await prisma.freeConversation.create({
  data: {
    userId,
    characterId,  // ← Add this
    ...
  }
});
```

---

### 5. Create or Modify Hook for Free Conversation

**Option A**: Modify `useStreamingChat` to accept endpoint parameter

```typescript
export function useStreamingChat(
  sessionId: string,
  initialMessages: StreamingMessage[] = [],
  apiEndpoint?: string // ← Add this
): UseStreamingChatReturn {
  const endpoint = apiEndpoint || `/api/task-attempts/${sessionId}/stream`;
  // Use endpoint in fetch...
}
```

**Option B**: Create new `useFreeChat` hook

```typescript
export function useFreeChat(
  sessionId: string,
  initialMessages: StreamingMessage[] = []
): UseStreamingChatReturn {
  // Similar to useStreamingChat but uses free-conversation endpoint
  const response = await fetch(`/api/free-conversation/${sessionId}/stream`, ...);
}
```

---

### 6. Update FreeConversationClient to Use Correct Hook

**File**: `src/app/app/kaiwa/bebas/FreeConversationClient.tsx`

**Change**:

```typescript
// Current (wrong)
const { messages, sendMessage } = useStreamingChat(session?.id || '', initialMessages);

// Option A: Pass endpoint
const { messages, sendMessage } = useStreamingChat(
  session?.id || '',
  initialMessages,
  `/api/free-conversation/${session?.id}/stream`
);

// Option B: Use new hook
const { messages, sendMessage } = useFreeChat(session?.id || '', initialMessages);
```

---

## Implementation Priority

### Phase 1 - Critical (Do First) ✅

1. ✅ Update database schema
2. ⏳ Create `/api/free-conversation/[sessionId]/stream` endpoint
3. ⏳ Update session API to accept `characterId`

### Phase 2 - Character Selection

4. ⏳ Add character selection UI
5. ⏳ Update FreeConversationClient to use correct API

### Phase 3 - Testing

6. ⏳ Test character selection
7. ⏳ Test streaming conversation
8. ⏳ Test multiple sessions per character

---

## File Checklist

### Files to Create (1)

- [ ] `src/app/api/free-conversation/[sessionId]/stream/route.ts`

### Files to Modify (3)

- [ ] `src/app/api/free-conversation/session/route.ts` (add characterId)
- [ ] `src/app/app/kaiwa/bebas/FreeConversationClient.tsx` (character selection + correct API)
- [ ] `src/hooks/useStreamingChat.ts` (optional: add endpoint parameter)

---

## Quick Implementation Guide

### Step 1: Create Streaming API

```bash
# Create directory
mkdir -p src/app/api/free-conversation/[sessionId]/stream

# Create route.ts (copy from task-attempts and simplify)
```

### Step 2: Update Session API

```typescript
// In /api/free-conversation/session/route.ts
// Add characterId to request/response
```

### Step 3: Add Character Selection

```typescript
// In FreeConversationClient.tsx
// Add character fetching and selection UI
```

### Step 4: Fix Hook Usage

```typescript
// Either modify useStreamingChat or create useFreeChat
```

### Step 5: Test

```bash
npm run dev
# Navigate to /app/kaiwa/bebas
# Select character
# Start conversation
# Verify API calls
```

---

## Expected Behavior After Fix

1. **User visits /app/kaiwa/bebas**
2. **Sees character selection screen**
   - List of available characters
   - Character details (name, description, personality)
   - "Start Conversation" button
3. **Selects character**
4. **System creates/resumes session** for that user + character
5. **Chat interface loads** with character-specific history
6. **User can chat** with selected character
7. **System saves** to correct session with characterId
8. **User can switch** to different character (new session)

---

## Testing Checklist

- [ ] Character list loads
- [ ] Can select a character
- [ ] Session created with correct characterId
- [ ] Chat interface loads
- [ ] Can send messages
- [ ] AI responds with character personality
- [ ] Messages saved to database
- [ ] Can reload page and history persists
- [ ] Can switch to different character
- [ ] Each character has separate history

---

## Current Status

**Completed**:

- ✅ Database schema updated
- ✅ Prisma client regenerated

**In Progress**:

- ⏳ API endpoint creation
- ⏳ UI modifications

**Not Started**:

- ❌ Character selection UI
- ❌ Testing

---

## Next Immediate Steps

Due to complexity and time, I recommend:

1. **Quick Fix for Now**:
   - Create a default character in database
   - Hardcode characterId in session creation
   - Just fix the API endpoint issue

2. **Full Fix Later**:
   - Add character selection UI
   - Implement proper character switching

Would you like me to:

- **A**: Do the quick fix now (just fix API, use default character)
- **B**: Implement full character selection (takes longer)
- **C**: Create all the files and you can test manually

Let me know which approach you prefer!
