# API Cost Comparison: Realtime vs Standard (4o-mini + TTS)

## Overview

Comparing two approaches for voice chat:

1. **Realtime API** (current): `gpt-realtime-mini` with integrated audio
2. **Standard API**: `gpt-4o-mini` text + Whisper + TTS separately

---

## Pricing Reference

### Realtime API (gpt-realtime-mini-2025-10-06)

```
Text input:    $0.001 / 1K tokens
Text output:   $0.003 / 1K tokens
Audio input:   $0.036 / minute
Audio output:  $0.091 / minute
```

### Standard API Components

**GPT-4o-mini (Text)**

```
Input:         $0.150 / 1M tokens = $0.00015 / 1K tokens
Output:        $0.600 / 1M tokens = $0.00060 / 1K tokens
```

**Whisper (Speech-to-Text)**

```
Transcription: $0.006 / minute
```

**TTS-1 (Text-to-Speech)**

```
Generation:    $15.00 / 1M characters = $0.015 / 1K characters
```

---

## Cost Breakdown: 3-Minute Session

### Your Usage Pattern (from test)

- Speaking time: ~1 minute (active talking)
- AI response time: ~30 seconds of audio
- Input: 18k audio tokens
- Output: 5k audio tokens (after optimization)
- Text equivalent: ~2,000 input tokens, ~1,000 output tokens

---

## Option 1: Realtime API (Current Setup)

### Calculation

```typescript
// Audio input (1 minute of speaking)
audioInputCost = 1 min × $0.036 = $0.036

// Audio output (30 seconds of AI speech)
audioOutputCost = 0.5 min × $0.091 = $0.046

// Whisper transcription (built-in, 3 minutes total)
whisperCost = 3 min × $0.006 = $0.018

// TOTAL
totalCost = $0.036 + $0.046 + $0.018 = $0.100
```

### Per Session Cost

```
3 minutes:  $0.100
10 minutes: $0.333
1 hour:     $2.00
```

---

## Option 2: Standard API (4o-mini + TTS)

### Calculation

```typescript
// 1. Whisper: User speech to text (1 min speaking)
whisperCost = 1 min × $0.006 = $0.006

// 2. GPT-4o-mini: Text processing
//    Input: ~2,000 tokens (user message + context)
//    Output: ~1,000 tokens (AI response)
gptInputCost = 2 tokens × $0.00015 = $0.0003
gptOutputCost = 1 tokens × $0.00060 = $0.0006
gptTotalCost = $0.0003 + $0.0006 = $0.0009

// 3. TTS-1: Text to speech (AI response)
//    ~1,000 tokens ≈ 4,000 characters (Japanese)
//    30 seconds of speech ≈ 300 characters
ttsCost = 0.3K chars × $0.015 = $0.0045

// TOTAL
totalCost = $0.006 + $0.0009 + $0.0045 = $0.0114
```

### Per Session Cost

```
3 minutes:  $0.011
10 minutes: $0.037
1 hour:     $0.22
```

---

## Side-by-Side Comparison

| Metric             | Realtime API | Standard API | Difference  |
| ------------------ | ------------ | ------------ | ----------- |
| **3 min session**  | $0.100       | $0.011       | **-89%** 💰 |
| **10 min session** | $0.333       | $0.037       | **-89%** 💰 |
| **1 hour**         | $2.00        | $0.22        | **-89%** 💰 |
| **100 hours**      | $200         | $22          | **-89%** 💰 |

### Cost Savings: Standard API

```
Per 3 minutes:  Save $0.089 (89%)
Per hour:       Save $1.78 (89%)
Per 100 hours:  Save $178! 🎉
```

---

## Why Such a Big Difference?

### Realtime API Premium

Realtime API charges for:

- ✅ **Ultra-low latency** (<100ms response)
- ✅ **WebRTC streaming**
- ✅ **Real-time processing**
- ✅ **Voice interruption handling**
- ✅ **Integrated audio pipeline**

**Premium cost: ~9x more expensive**

### Standard API Economy

Standard API:

- ⏱️ Higher latency (~500ms-1s total)
- 📡 Need to manage 3 separate API calls
- 🔧 More complex implementation
- ⚡ But **89% cheaper!**

---

## Detailed Cost Analysis

### Realtime API Cost Structure

```
Component              | Cost    | % of Total
-----------------------|---------|------------
Audio Input (1 min)    | $0.036  | 36%
Audio Output (0.5 min) | $0.046  | 46%
Whisper (3 min)        | $0.018  | 18%
-----------------------|---------|------------
TOTAL                  | $0.100  | 100%
```

**Key insight:** Audio processing is expensive!

### Standard API Cost Structure

```
Component              | Cost     | % of Total
-----------------------|----------|------------
Whisper (1 min)        | $0.0060  | 53%
GPT-4o-mini            | $0.0009  | 8%
TTS-1 (300 chars)      | $0.0045  | 39%
-----------------------|----------|------------
TOTAL                  | $0.0114  | 100%
```

**Key insight:** Text processing is nearly free!

---

## Implementation Comparison

### Realtime API (Current)

```typescript
// ✅ Simple - one WebRTC connection
const session = await createRealtimeSession();
// Audio flows automatically
// Transcripts included
```

**Pros:**

- ✅ Simplest implementation
- ✅ Lowest latency (<100ms)
- ✅ Best user experience
- ✅ Handles interruptions naturally

**Cons:**

- ❌ Most expensive (9x more)
- ❌ Limited to audio modalities
- ❌ Less control over pipeline

### Standard API (Alternative)

```typescript
// ⚠️ Complex - manage 3 API calls

// 1. Record audio
const audioBlob = await recordAudio();

// 2. Transcribe with Whisper
const userText = await whisper.transcribe(audioBlob);

// 3. Get text response from GPT-4o-mini
const aiText = await gpt4oMini.chat(userText);

// 4. Generate speech with TTS
const aiAudio = await tts.generate(aiText);

// 5. Play audio
playAudio(aiAudio);
```

**Pros:**

- ✅ 89% cheaper!
- ✅ More control over each step
- ✅ Can use different voices
- ✅ Can cache text responses

**Cons:**

- ❌ Higher latency (500ms-1s total)
- ❌ More complex code
- ❌ Need to manage audio buffering
- ❌ No natural interruption handling

---

## Latency Comparison

### Realtime API

```
User speaks → AI responds
Total latency: 50-150ms ⚡
```

**Flow:**

1. Audio streaming (continuous)
2. Processing (real-time)
3. Response (immediate)

### Standard API

```
User speaks → Whisper → GPT → TTS → Play
Total latency: 500-1000ms 🐢
```

**Flow:**

1. Record audio: 50ms
2. Whisper API: 200ms
3. GPT-4o-mini: 150ms
4. TTS-1 API: 200ms
5. Audio playback: instant

**Difference: 5-10x slower**

---

## Use Case Recommendations

### Use Realtime API When:

- ✅ **Conversation practice** (needs low latency)
- ✅ **Real-time tutoring** (interactive dialogue)
- ✅ **Live roleplay** (natural interruptions)
- ✅ **Budget: >$100/month** (cost not critical)
- ✅ **Best UX required** (professional app)

### Use Standard API When:

- ✅ **Budget-conscious** (<$50/month)
- ✅ **High volume usage** (>100 hours/month)
- ✅ **Latency acceptable** (500ms-1s OK)
- ✅ **Asynchronous practice** (flashcards, etc)
- ✅ **Need text control** (custom TTS voices)

---

## Your Current Usage Analysis

### With Realtime API (Current)

```
Current usage: 3 min test
Current cost:  $0.100

Projected for 100 hours:
Cost: $200
```

### If Switch to Standard API

```
Same usage: 3 min test
New cost:    $0.011

Projected for 100 hours:
Cost: $22
Savings: $178 (89%)! 🎉
```

---

## Recommendation

### For Language Learning App (Your Use Case)

**Short-term (MVP/Testing):**

- ✅ **Keep Realtime API**
- Reasons:
  - Already implemented
  - Better UX for conversation practice
  - Worth the cost during development
  - Easier to test and iterate

**Long-term (Production/Scale):**

- 🔄 **Consider Standard API**
- When:
  - Monthly cost >$100
  - User base >100 active users
  - Need to reduce operating costs
  - Latency <1s is acceptable

### Hybrid Approach

```typescript
// Best of both worlds
if (userTier === 'premium') {
  useRealtimeAPI(); // Best experience
} else {
  useStandardAPI(); // Cost-effective
}
```

**Cost:**

- Premium users: $2/hour (realtime)
- Free users: $0.22/hour (standard)
- **90% cost reduction on free tier**

---

## Migration Complexity

### From Realtime → Standard API

**Effort:** Medium (1-2 weeks)
**Changes needed:**

1. Replace WebRTC with audio recording
2. Add Whisper API integration
3. Replace realtime chat with GPT-4o-mini
4. Add TTS-1 API integration
5. Manage audio playback queue
6. Handle latency gracefully

**Code impact:** ~500 lines

---

## Final Verdict

| Factor             | Realtime API | Standard API | Winner                     |
| ------------------ | ------------ | ------------ | -------------------------- |
| **Cost**           | $2/hour      | $0.22/hour   | 🏆 Standard (89% cheaper)  |
| **Latency**        | 50-150ms     | 500-1000ms   | 🏆 Realtime (5-10x faster) |
| **UX Quality**     | Excellent    | Good         | 🏆 Realtime                |
| **Implementation** | Simple       | Complex      | 🏆 Realtime                |
| **Scalability**    | Expensive    | Cheap        | 🏆 Standard                |
| **Maintenance**    | Easy         | Moderate     | 🏆 Realtime                |

### For Your App (Language Learning):

**Current phase (Development/MVP):**
→ **Keep Realtime API** ✅

- Best UX for testing
- Faster to iterate
- Worth the cost now

**Future (Production/Scale):**
→ **Switch to Standard API or Hybrid** 🔄

- 89% cost savings
- Supports more users
- Sustainable long-term

---

**Bottom line:** Realtime API costs **9x more** but provides **5-10x better latency**. For language learning where conversation flow matters, Realtime API is worth it initially. Switch to Standard API when cost becomes a concern (>$100/month).

**Current recommendation: Keep Realtime API for now** ✅
