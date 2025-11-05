# AI Response Improvements

## Problem

The AI was responding with generic, unnatural responses like:

```
User: こんにちは。
AI: こんにちは。に対する応答です。
```

This happened because:

1. The voice route had a placeholder response: `${transcription.transcript}に対する応答です。`
2. The message route lacked specific character roleplay context
3. No clear conversation stage guidance

## Solution

### 1. Created Task Response Generator Utility

**File**: [src/lib/ai/task-response-generator.ts](src/lib/ai/task-response-generator.ts)

This centralized utility provides:

- **Character role determination** based on task scenario
- **Conversation stage tracking** (opening, early, middle, closing)
- **Context-aware prompting** for natural roleplay
- **Reusable logic** for both text and voice routes

### 2. Character Role Detection

The system now automatically detects the appropriate character based on:

- Task category (Jalan-jalan, Keseharian, Pekerjaan)
- Scenario keywords (駅/station, レストラン/restaurant, 店/shop, etc.)

**Supported Characters**:

- 駅員 (えきいん / station attendant) - for train stations
- ウェイター/ウェイトレス - for restaurants
- 店員 (てんいん / shop clerk) - for shops
- ホテルスタッフ - for hotels
- 空港職員 - for airports
- 郵便局員 - for post offices
- 銀行員 - for banks
- 同僚 (どうりょう) - for work scenarios

### 3. Enhanced System Prompt

The AI now receives detailed context:

```
SCENARIO: [Full scenario description]

YOUR ROLE: [Character role]
- Respond naturally as this character would
- Use appropriate Japanese for the situation
- Be helpful and patient

LEARNING OBJECTIVES:
1. [Objective 1]
2. [Objective 2]

STUDENT INFORMATION:
- Japanese Level: N5
- Difficulty: N5
- This is task-based practice

GUIDELINES:
1. Stay in character
2. Respond naturally in Japanese
3. Use appropriate difficulty level
4. Be encouraging
5. Respond appropriately to greetings
6. Guide toward objectives naturally
7. Keep responses concise (2-3 sentences)
```

### 4. Conversation Stage Awareness

The AI adapts its behavior based on conversation stage:

**Opening** (0 messages):

- "If they greet you, respond naturally in character"
- Expects こんにちは, すみません, etc.

**Early** (1-2 messages):

- "Listen to what the student needs"
- Help establish the conversation flow

**Middle** (3+ messages):

- "Continue assisting with questions"
- Main conversation body

**Closing** (objectives completed):

- "Wrap up naturally if appropriate"
- Natural conversation ending

### 5. Updated API Routes

**Text Message Route**: [src/app/api/task-attempts/[attemptId]/message/route.ts](src/app/api/task-attempts/[attemptId]/message/route.ts)

- Now uses `generateTaskResponse()` utility
- Removed duplicated prompt logic
- Consistent with voice route

**Voice Route**: [src/app/api/task-attempts/[attemptId]/voice/route.ts](src/app/api/task-attempts/[attemptId]/voice/route.ts)

- Replaced placeholder response with actual OpenAI call
- Uses same `generateTaskResponse()` utility
- Ensures voice and text responses are consistent

## Expected Behavior Now

### Example 1: Station Scenario

**Scenario**: "Kamu sedang berada di peron stasiun. Tujuanmu adalah Stasiun Tokyo..."

```
User: こんにちは。
AI: こんにちは！何かお手伝いしましょうか？(Hello! Can I help you with something?)
```

The AI responds as a station attendant would - politely acknowledging the greeting and offering assistance.

### Example 2: Continuing Conversation

```
User: すみません、この電車は東京駅に止まりますか？
AI: はい、止まります。東京駅は次の次の駅です。(Yes, it stops there. Tokyo Station is two stops from here.)
```

The AI stays in character and provides relevant information.

### Example 3: Restaurant Scenario

If the scenario involves a restaurant:

```
User: こんにちは。
AI: いらっしゃいませ！何名様ですか？(Welcome! How many people?)
```

The AI adapts to the restaurant context.

## Benefits

1. **Natural Roleplay**: AI responds as the character would in real life
2. **Context Awareness**: Understands the scenario and objectives
3. **Appropriate Language**: Uses difficulty-appropriate Japanese
4. **Consistent Experience**: Same quality for text and voice inputs
5. **Maintainable Code**: Single source of truth for prompt generation
6. **Extensible**: Easy to add new character types and scenarios

## Testing

To test the improvements:

1. **Start fresh** (incomplete attempts cleared):

   ```bash
   npx tsx scripts/clear-incomplete-attempts.ts
   ```

2. **Start a task** and try different greetings:
   - こんにちは
   - すみません
   - お願いします

3. **Test conversation flow**:
   - Initial greeting → AI responds in character
   - Ask main question → AI provides relevant help
   - Continue conversation → AI guides toward objectives

4. **Test voice input**:
   - Record voice message
   - Check that response is natural and in character

## Configuration

### Adding New Character Types

Edit [src/lib/ai/task-response-generator.ts](src/lib/ai/task-response-generator.ts):

```typescript
// In determineCharacterRole function
if (scenario.includes('病院') || scenario.includes('hospital')) {
  characterRole = '医者 (いしゃ / doctor)';
  roleDescription = 'a caring doctor who helps patients';
}
```

### Adjusting Response Length

In the system prompt, modify:

```
7. Keep responses concise (2-3 sentences maximum unless asked to elaborate)
```

Change "2-3 sentences" to your preferred length.

### Changing AI Model

In the `generateTaskResponse` function:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4', // Change to 'gpt-4-turbo', 'gpt-3.5-turbo', etc.
  // ...
});
```

## Utilities Created

1. **activate-all-tasks.ts** - Activates inactive tasks
2. **check-task-attempts.ts** - Shows all attempts with message counts
3. **clear-incomplete-attempts.ts** - Clears incomplete attempts for fresh start

## Related Files Modified

- ✅ [src/app/api/task-attempts/[attemptId]/message/route.ts](src/app/api/task-attempts/[attemptId]/message/route.ts)
- ✅ [src/app/api/task-attempts/[attemptId]/voice/route.ts](src/app/api/task-attempts/[attemptId]/voice/route.ts)
- ✅ [src/lib/ai/task-response-generator.ts](src/lib/ai/task-response-generator.ts) (new)

## Summary

The AI now provides **natural, context-aware, roleplay-based responses** instead of generic placeholder text. Both text and voice inputs receive the same high-quality, character-appropriate responses that guide students toward their learning objectives naturally.
