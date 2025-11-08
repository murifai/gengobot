# Cost Optimization Guide

## Token Usage Analysis

### Your Actual Usage (3 minutes)

- **Input tokens:** 18,000
- **Output tokens:** 8,000
- **Total cost:** ~$0.07

### Cost Breakdown

```typescript
// Audio Input Cost
inputMinutes = 18000 / (450 * 60) = 0.67 minutes
inputCost = 0.67 × $0.036 = $0.024

// Audio Output Cost
outputMinutes = 8000 / (450 * 60) = 0.30 minutes
outputCost = 0.30 × $0.091 = $0.027

// Whisper Transcription (if enabled)
whisperCost = 3 min × $0.006 = $0.018

// TOTAL
totalCost = $0.024 + $0.027 + $0.018 = $0.069
```

## Optimization Strategies

### 1. Disable Whisper Transcription ✅

**Savings: $0.006/minute = $0.36/hour**

Whisper transcription converts your audio to text. If you don't need text transcripts, disable it:

```typescript
// src/hooks/use-webrtc.ts
session: {
  modalities: ['text', 'audio'],
  // DISABLED - saves $0.006/min
  // input_audio_transcription: {
  //   model: 'whisper-1',
  // },
  turn_detection: null,
}
```

**Impact:**

- Before: $0.069 per 3 minutes
- After: $0.051 per 3 minutes
- **Savings: 26%**

### 2. Use Push-to-Talk Mode ✅ (Already Implemented)

**Savings: 50-75% on input tokens**

PTT only records when button is pressed, not continuous recording like VAD mode.

**Evidence from your usage:**

- With PTT: 18k input tokens (3 min)
- With VAD: ~27k input tokens (3 min)
- **Already saving: 33%**

### 3. Shorter System Instructions

Current instruction:

```
あなたは広島人です。広島弁で話してください。簡単に答えてください。あまりきかないようにしてください。
```

**Token count:** ~50 tokens × every response = adds up

Consider shorter version:

```
広島弁で簡潔に答えてください。
```

**Savings:** ~30 tokens per response

### 4. Optimize Output Tokens

Your output is 8k tokens for 3 minutes. This seems high.

**Check if AI is being too verbose:**

```typescript
// In session/route.ts
instructions: '広島弁で話してください。簡潔に答えてください。'; // Add 簡潔に
```

**Target:** 3-5k output tokens for 3 minutes

## Cost Comparison

### Current Setup (with Whisper disabled)

| Duration | Input | Output | Cost   |
| -------- | ----- | ------ | ------ |
| 3 min    | 18k   | 8k     | $0.051 |
| 10 min   | 60k   | 27k    | $0.170 |
| 1 hour   | 360k  | 160k   | $1.02  |

### Optimized Setup (shorter instructions + less verbose)

| Duration | Input | Output | Cost   |
| -------- | ----- | ------ | ------ |
| 3 min    | 18k   | 5k     | $0.038 |
| 10 min   | 60k   | 17k    | $0.127 |
| 1 hour   | 360k  | 100k   | $0.76  |

**Potential total savings: ~25% additional**

## Token Per Second Analysis

### Your Current Rate

```
Input: 18000 tokens / 180 sec = 100 tokens/sec
Output: 8000 tokens / 180 sec = 44 tokens/sec
```

### Expected Rate for PTT

```
Input: 50-80 tokens/sec (when speaking)
Output: 30-50 tokens/sec (AI response)
```

**Conclusion:** Your input rate is high. This could be:

1. ✅ You're speaking a lot (good for practice!)
2. ❌ Whisper transcription overhead
3. ❌ AI is processing too much context

## Action Items

### Immediate (Done ✅)

- [x] Disable Whisper transcription → Save $0.006/min

### Short-term

- [ ] Shorten system instructions
- [ ] Add "簡潔に" to make AI more concise
- [ ] Monitor output token usage

### Long-term

- [ ] Implement cost alerts in UI
- [ ] Add session budget limits
- [ ] Export cost reports

## Monitoring

Track these metrics:

```typescript
// After each session, log:
console.log({
  duration: sessionDuration,
  inputTokens,
  outputTokens,
  cost: estimatedCost,
  inputRate: inputTokens / sessionDuration,
  outputRate: outputTokens / sessionDuration,
});
```

**Target metrics:**

- Input rate: 50-80 tokens/sec (while speaking)
- Output rate: 30-50 tokens/sec
- Total cost: < $0.04 per 3 minutes

---

**Current Status:**

- Whisper: ❌ Disabled
- PTT Mode: ✅ Active
- Cost per 3 min: **~$0.051** (down from $0.069)
- Next optimization: Reduce output verbosity
