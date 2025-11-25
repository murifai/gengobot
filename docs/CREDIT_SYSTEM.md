# Credit System Documentation

This document describes how the credit system works in Gengo, including calculation methods based on actual OpenAI API costs, credit updates, and reset mechanisms.

---

## Table of Contents

1. [Overview](#overview)
2. [OpenAI Models Used](#openai-models-used)
3. [OpenAI API Pricing Reference](#openai-api-pricing-reference)
4. [Credit Costs & Calculation](#credit-costs--calculation)
5. [Subscription Tiers](#subscription-tiers)
6. [Credit Check Flow](#credit-check-flow)
7. [Credit Deduction](#credit-deduction)
8. [Credit Reset Mechanisms](#credit-reset-mechanisms)
9. [Transaction Types](#transaction-types)
10. [API Endpoints](#api-endpoints)
11. [Database Schema](#database-schema)

---

## Overview

The credit system manages user access to features based on subscription tiers. Credits are directly tied to **actual OpenAI API costs**, ensuring transparent and fair pricing.

### Core Philosophy: Usage-Based Credits

```
┌─────────────────────────────────────────────────────────────┐
│             1 CREDIT = $0.0001 USD                          │
│                                                             │
│  Credits = Actual API Cost / $0.0001                        │
│                                                             │
│  - No fixed rates per message/minute                        │
│  - Each API call is tracked individually                    │
│  - Users pay exactly what they use                          │
│  - No loss for the platform                                 │
└─────────────────────────────────────────────────────────────┘
```

**Why Usage-Based?**

- **Transparency**: Users see exactly what their API usage costs
- **Fairness**: Light users aren't subsidizing heavy users
- **No Loss**: Platform always covers API costs
- **Scalable**: Works regardless of how OpenAI changes pricing

### Key Components

| Component      | File                                     | Purpose                           |
| -------------- | ---------------------------------------- | --------------------------------- |
| Credit Config  | `src/lib/subscription/credit-config.ts`  | Credit costs, tier configurations |
| Credit Service | `src/lib/subscription/credit-service.ts` | Core credit operations            |
| Trial Service  | `src/lib/subscription/trial-service.ts`  | Trial-specific logic              |
| Usage Guard    | `src/lib/subscription/usage-guard.ts`    | API middleware for credit checks  |
| OpenAI Client  | `src/lib/ai/openai-client.ts`            | Model definitions                 |

---

## OpenAI Models Used

The application uses the following OpenAI models:

```typescript
// src/lib/ai/openai-client.ts:18-26
export const MODELS = {
  RESPONSE: 'gpt-5-nano', // AI conversation responses
  ANALYSIS: 'gpt-4o-mini', // Feedback, hints, objective detection
  WHISPER: 'whisper-1', // Speech-to-text transcription
  TTS: 'gpt-4o-mini-tts', // Text-to-speech generation
};
```

### Model Usage by Feature

| Feature               | Model                          | Configuration                         |
| --------------------- | ------------------------------ | ------------------------------------- |
| Text Chat             | `gpt-5-nano`                   | max_tokens: 300, temperature: 0.7-0.8 |
| Hints                 | `gpt-4o-mini`                  | max_tokens: 200, temperature: 0.7     |
| Objective Detection   | `gpt-4o-mini`                  | temperature: 0.3 (for consistency)    |
| Voice Transcription   | `whisper-1`                    | language: 'ja', format: verbose_json  |
| Text-to-Speech        | `gpt-4o-mini-tts`              | voices: alloy, nova, shimmer, etc.    |
| Realtime Conversation | `gpt-realtime-mini-2025-10-06` | WebRTC, PTT mode                      |

---

## OpenAI API Pricing Reference

> **Source**: [OpenAI Pricing](https://openai.com/api/pricing/), [DocsBot Calculator](https://docsbot.ai/tools/gpt-openai-api-pricing-calculator)
> **Last Updated**: November 2025

### GPT-5-nano (Text Chat - RESPONSE)

| Type         | Price per 1M tokens |
| ------------ | ------------------- |
| Input        | $0.05               |
| Output       | $0.40               |
| Cached Input | $0.005              |

### GPT-4o-mini (Analysis, Hints, Objective Detection)

| Type         | Price per 1M tokens |
| ------------ | ------------------- |
| Input        | $0.15               |
| Output       | $0.60               |
| Cached Input | $0.075              |

### Whisper (Speech-to-Text)

| Model     | Price           |
| --------- | --------------- |
| whisper-1 | $0.006 / minute |

```typescript
// src/lib/voice/whisper-service.ts:146-150
getEstimatedCost(durationSeconds: number): number {
  const minutes = durationSeconds / 60;
  return minutes * 0.006;  // $0.006 per minute
}
```

### TTS (Text-to-Speech)

| Model            | Input             | Output                   | Est. per Minute |
| ---------------- | ----------------- | ------------------------ | --------------- |
| gpt-4o-mini-tts  | $0.60 / 1M chars  | $12.00 / 1M audio tokens | ~$0.015         |
| tts-1 (standard) | $15.00 / 1M chars | -                        | -               |
| tts-1-hd         | $30.00 / 1M chars | -                        | -               |

```typescript
// src/lib/voice/tts-service.ts:193-195
getEstimatedCost(characterCount: number): number {
  return (characterCount / 1_000_000) * 15.0;  // Legacy pricing
}
```

### Realtime API (gpt-realtime-mini-2025-10-06)

| Type         | Price per 1M tokens | Est. per Minute          |
| ------------ | ------------------- | ------------------------ |
| Text Input   | $0.60               | -                        |
| Text Output  | $2.40               | -                        |
| Audio Input  | ~$0.036/min         | Based on ~450 tokens/sec |
| Audio Output | ~$0.091/min         | Based on ~450 tokens/sec |

```typescript
// src/hooks/use-webrtc.ts:386-393
// Token to cost calculation (gpt-realtime-mini-2025-10-06)
const inputMinutes = inputAudioTokens / (450 * 60); // ~450 tokens/sec
const outputMinutes = outputAudioTokens / (450 * 60);
const cost = inputMinutes * 0.036 + outputMinutes * 0.091;
```

---

## Credit Costs & Calculation

### Credit Philosophy: Usage-Based Pricing

**Credits = Actual API Cost**

Instead of fixed rates (e.g., "4 credits per message"), credits are calculated based on **actual token usage** per API call. This ensures:

- **No loss** - credits always reflect real costs
- **Fair pricing** - heavy users pay proportionally more
- **Accurate** - each API call is measured individually

### Credit Conversion Rate

```
1 credit = $0.0001 USD
```

Or inversely:

```
$0.001 USD = 10 credits
$0.01 USD = 100 credits
$0.10 USD = 1,000 credits
$1.00 USD = 10,000 credits
```

### How Credits Are Calculated

**For EVERY API call:**

1. Track actual tokens used (input + output)
2. Calculate USD cost using OpenAI pricing
3. Convert to credits: `credits = USD_cost / 0.0001`

```typescript
// Pseudo-code for credit calculation
function calculateCredits(apiResponse): number {
  const inputTokens = apiResponse.usage.prompt_tokens;
  const outputTokens = apiResponse.usage.completion_tokens;

  // Calculate USD cost based on model
  const inputCost = inputTokens * MODEL_INPUT_PRICE_PER_TOKEN;
  const outputCost = outputTokens * MODEL_OUTPUT_PRICE_PER_TOKEN;
  const totalCost = inputCost + outputCost;

  // Convert to credits (1 credit = $0.0001)
  const credits = Math.ceil(totalCost / 0.0001);
  return credits;
}
```

### API Cost to Credit Conversion

> **Conversion Rate: 1 credit = $0.0001 USD**

#### Text Chat (Variable credits based on actual usage)

**A. Free Conversation (Kaiwa Bebas) - Simple Chat:**

```
┌─────────────────────────────────────────────────────────────┐
│ GPT-5-nano (RESPONSE) - Chat Generation                     │
├─────────────────────────────────────────────────────────────┤
│ System prompt: ~500 tokens (input)                          │
│ User message: ~50 tokens (input)                            │
│ Context (50 msgs): ~2,500 tokens (input)                    │
│ AI response: ~150 tokens (output, max 300)                  │
├─────────────────────────────────────────────────────────────┤
│ Input: ~3,050 tokens × $0.05/1M = $0.00015                  │
│ Output: ~150 tokens × $0.40/1M = $0.00006                   │
├─────────────────────────────────────────────────────────────┤
│ USD COST: ~$0.00021                                         │
│ CREDITS: $0.00021 ÷ $0.0001 = ~2-3 credits                  │
└─────────────────────────────────────────────────────────────┘
```

**B. Task Conversation (with Feedback & Hints) - Full Learning:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. GPT-5-nano (RESPONSE) - Chat Generation                  │
│    Input: ~3,050 tokens × $0.05/1M = $0.00015               │
│    Output: ~150 tokens × $0.40/1M = $0.00006                │
│    Subtotal: $0.00021 → 2-3 credits                         │
├─────────────────────────────────────────────────────────────┤
│ 2. GPT-4o-mini (ANALYSIS) - Feedback Generation             │
│    Input: ~800 tokens × $0.15/1M = $0.00012                 │
│    Output: ~200 tokens × $0.60/1M = $0.00012                │
│    Subtotal: $0.00024 → 2-3 credits                         │
├─────────────────────────────────────────────────────────────┤
│ 3. GPT-4o-mini (ANALYSIS) - Objective Detection             │
│    Input: ~600 tokens × $0.15/1M = $0.00009                 │
│    Output: ~100 tokens × $0.60/1M = $0.00006                │
│    Subtotal: $0.00015 → 1-2 credits                         │
├─────────────────────────────────────────────────────────────┤
│ USD COST: ~$0.00060                                         │
│ CREDITS: $0.00060 ÷ $0.0001 = ~6 credits                    │
└─────────────────────────────────────────────────────────────┘
```

**C. Hint Request (optional, user-triggered):**

```
┌─────────────────────────────────────────────────────────────┐
│ GPT-4o-mini (ANALYSIS) - Hint Generation                    │
│    Input: ~500 tokens × $0.15/1M = $0.000075                │
│    Output: ~200 tokens × $0.60/1M = $0.00012                │
├─────────────────────────────────────────────────────────────┤
│ USD COST: ~$0.00020                                         │
│ CREDITS: $0.00020 ÷ $0.0001 = ~2 credits                    │
└─────────────────────────────────────────────────────────────┘
```

**Credit Summary (Text Chat):**

```
┌─────────────────────────────────────────────────────────────┐
│ Feature              │ USD Cost  │ Credits (actual usage)   │
├─────────────────────────────────────────────────────────────┤
│ Free Chat (1 msg)    │ $0.00021  │ ~2-3 credits             │
│ Task Chat (1 msg)    │ $0.00060  │ ~6 credits               │
│ Hint Request         │ $0.00020  │ ~2 credits               │
└─────────────────────────────────────────────────────────────┘
```

#### Voice Standard (Variable credits based on actual usage)

**Voice Chat Flow: User speaks → Whisper → GPT → TTS → Audio response**

```
┌─────────────────────────────────────────────────────────────┐
│ VOICE STANDARD - Each API Call Tracked Separately           │
├─────────────────────────────────────────────────────────────┤
│ 1. Whisper (whisper-1) - Speech-to-Text                     │
│    Billed per audio duration                                │
│    Example: 10 sec audio = $0.006 × (10/60) = $0.001        │
│    CREDITS: $0.001 ÷ $0.0001 = 10 credits                   │
├─────────────────────────────────────────────────────────────┤
│ 2. GPT-5-nano (RESPONSE) - Text Generation                  │
│    Billed per actual tokens used                            │
│    Example: 1,500 input + 150 output tokens                 │
│    Cost: $0.000075 + $0.00006 = $0.000135                   │
│    CREDITS: $0.000135 ÷ $0.0001 = ~1-2 credits              │
├─────────────────────────────────────────────────────────────┤
│ 3. TTS (gpt-4o-mini-tts) - Text-to-Speech                   │
│    Billed per characters + audio tokens                     │
│    Example: 200 chars response                              │
│    Input: 200 × $0.60/1M = $0.00012                         │
│    Output: ~200 audio tokens × $12/1M = $0.0024             │
│    CREDITS: $0.00252 ÷ $0.0001 = ~25 credits                │
└─────────────────────────────────────────────────────────────┘
```

**Credit Summary (Voice - per exchange):**

```
┌─────────────────────────────────────────────────────────────┐
│ API Call             │ USD Cost    │ Credits               │
├─────────────────────────────────────────────────────────────┤
│ Whisper (10s audio)  │ ~$0.001     │ ~10 credits           │
│ GPT Response         │ ~$0.00014   │ ~1-2 credits          │
│ TTS (200 chars)      │ ~$0.0025    │ ~25 credits           │
├─────────────────────────────────────────────────────────────┤
│ TOTAL per exchange   │ ~$0.0036    │ ~36 credits           │
└─────────────────────────────────────────────────────────────┘
```

**Note**: Voice is expensive mainly due to TTS audio output tokens ($12/1M).

#### Realtime Conversation (Variable credits based on actual usage)

**Realtime API Flow: Bidirectional audio streaming with built-in Whisper**

```
┌─────────────────────────────────────────────────────────────┐
│ REALTIME API (gpt-realtime-mini-2025-10-06) - All-in-One    │
│ Includes: Whisper transcription + GPT + TTS (bundled)       │
│ ALL COSTS ARE CALCULATED PER ACTUAL TOKEN USAGE             │
├─────────────────────────────────────────────────────────────┤
│ 1. Audio Input (User speaking + Whisper transcription)      │
│    Billed per actual audio tokens used                      │
│    Pricing: $0.036/minute equivalent (~450 tokens/sec)      │
│    Example: 30 sec speaking = $0.036 × 0.5 = $0.018         │
│    CREDITS: $0.018 ÷ $0.0001 = 180 credits                  │
├─────────────────────────────────────────────────────────────┤
│ 2. Audio Output (AI response + TTS generation)              │
│    Billed per actual audio tokens generated                 │
│    Pricing: $0.091/minute equivalent (~450 tokens/sec)      │
│    Example: 20 sec response = $0.091 × 0.33 = $0.030        │
│    CREDITS: $0.030 ÷ $0.0001 = 300 credits                  │
├─────────────────────────────────────────────────────────────┤
│ 3. Text Tokens (Instructions, context)                      │
│    Billed per actual text tokens                            │
│    Input: ~500 tokens × $0.60/1M = $0.0003                  │
│    Output: ~200 tokens × $2.40/1M = $0.0005                 │
│    CREDITS: $0.0008 ÷ $0.0001 = ~8 credits                  │
└─────────────────────────────────────────────────────────────┘
```

**Credit Summary (Realtime - per exchange):**

```
┌─────────────────────────────────────────────────────────────┐
│ Token Type           │ USD Cost    │ Credits               │
├─────────────────────────────────────────────────────────────┤
│ Audio Input (30s)    │ ~$0.018     │ ~180 credits          │
│ Audio Output (20s)   │ ~$0.030     │ ~300 credits          │
│ Text Tokens          │ ~$0.0008    │ ~8 credits            │
├─────────────────────────────────────────────────────────────┤
│ TOTAL per exchange   │ ~$0.049     │ ~488 credits          │
└─────────────────────────────────────────────────────────────┘
```

**Per Minute Estimate (typical conversation):**

```
┌─────────────────────────────────────────────────────────────┐
│ ~2 exchanges per minute × ~488 credits = ~976 credits/min   │
│ USD Cost: ~$0.10/min                                        │
│ (Actual varies based on speaking duration and response len) │
└─────────────────────────────────────────────────────────────┘
```

**Note**: Realtime API pricing is bundled - you pay for audio tokens which include Whisper transcription and TTS generation automatically. Credits calculated from actual token usage, not fixed rates.

### Summary: Usage-Based Credit System

> **Conversion Rate: 1 credit = $0.0001 USD**
> Credits = Actual API Cost - NO fixed rates, NO loss

| Feature                 | Credits  | Est. USD Cost | How Calculated                                         |
| ----------------------- | -------- | ------------- | ------------------------------------------------------ |
| Free Chat               | ~2-3/msg | ~$0.00021     | GPT-5-nano tokens                                      |
| Task Chat               | ~6/msg   | ~$0.00060     | GPT-5-nano + Analysis + Feedback tokens                |
| Voice (per exchange)    | ~36      | ~$0.0036      | Whisper duration + GPT tokens + TTS audio tokens       |
| Realtime (per exchange) | ~488     | ~$0.049       | Audio input tokens + Audio output tokens + Text tokens |

**Key Principle:**

```
Credits are NOT fixed rates.
Each API call is measured individually.
Credits = (Total USD Cost of all API calls) ÷ $0.0001
```

### Calculation Formula

**Usage-Based Credit Calculation:**

```typescript
// Pseudo-code for actual implementation
// Credits are calculated AFTER each API call based on actual usage

function calculateCreditsFromAPIResponse(model: string, response: APIResponse): number {
  let totalUSDCost = 0;

  // For text models (GPT-5-nano, GPT-4o-mini)
  if (response.usage) {
    const inputTokens = response.usage.prompt_tokens;
    const outputTokens = response.usage.completion_tokens;

    totalUSDCost += inputTokens * MODEL_PRICING[model].input;
    totalUSDCost += outputTokens * MODEL_PRICING[model].output;
  }

  // For Whisper
  if (response.duration) {
    totalUSDCost += (response.duration / 60) * 0.006; // $0.006/min
  }

  // For TTS
  if (response.audioTokens) {
    totalUSDCost += response.audioTokens * (12.0 / 1_000_000); // $12/1M audio tokens
  }

  // For Realtime API
  if (response.inputAudioTokens) {
    const inputMinutes = response.inputAudioTokens / (450 * 60);
    const outputMinutes = response.outputAudioTokens / (450 * 60);
    totalUSDCost += inputMinutes * 0.036 + outputMinutes * 0.091;
  }

  // Convert USD to credits (1 credit = $0.0001)
  return Math.ceil(totalUSDCost / 0.0001);
}
```

**Current Legacy Code (to be updated):**

```typescript
// src/lib/subscription/credit-config.ts:86-102
// NOTE: This uses fixed rates - should be updated to usage-based
export function getCreditCost(usageType: UsageType, units: number): number {
  switch (usageType) {
    case 'VOICE_STANDARD':
      const voiceMinutes = Math.ceil(units / 60);
      return voiceMinutes * CREDIT_COSTS.VOICE_STANDARD_PER_MINUTE;
    case 'REALTIME':
      const realtimeMinutes = Math.ceil(units / 60);
      return realtimeMinutes * CREDIT_COSTS.REALTIME_PER_MINUTE;
    case 'TEXT_CHAT':
      return units * CREDIT_COSTS.TEXT_CHAT_PER_MESSAGE;
    default:
      return 0;
  }
}
```

**Implementation Note:** The current code uses fixed per-minute/per-message rates. For true usage-based pricing, the credit calculation should happen AFTER each API call completes, using the actual token counts from the API response.

---

## Subscription Tiers

### Tier Configuration

```typescript
// src/lib/subscription/credit-config.ts:11-48
export const TIER_CONFIG = {
  FREE: {
    trialCredits: 5000, // Total credits during trial
    trialDays: 14, // Trial duration
    trialDailyLimit: 500, // Max credits per day during trial
    textDailyLimit: 20, // Max text messages per day
    customCharactersAllowed: 1,
    customCharactersLimited: true,
    textUnlimited: false,
    realtimeEnabled: false,
    maxChatrooms: 5,
  },
  BASIC: {
    monthlyCredits: 6000, // Credits per billing cycle
    customCharactersAllowed: 5,
    customCharactersLimited: true,
    textUnlimited: true,
    realtimeEnabled: false,
    maxChatrooms: 5,
  },
  PRO: {
    monthlyCredits: 16500, // Credits per billing cycle
    customCharactersAllowed: -1, // Unlimited
    customCharactersLimited: false,
    textUnlimited: true,
    realtimeEnabled: true,
    maxChatrooms: -1, // Unlimited
  },
};
```

### Tier Comparison

| Feature            | FREE (Trial)  | BASIC       | PRO          |
| ------------------ | ------------- | ----------- | ------------ |
| Credits            | 5,000 (total) | 6,000/month | 16,500/month |
| Trial Duration     | 14 days       | -           | -            |
| Daily Credit Limit | 500           | None        | None         |
| Text Messages/Day  | 20            | Unlimited   | Unlimited    |
| Custom Characters  | 1             | 5           | Unlimited    |
| Realtime Chat      | No            | No          | Yes          |
| Max Chatrooms      | 5             | 5           | Unlimited    |
| Price (IDR)        | Free          | Rp 29,000   | Rp 49,000    |

### Duration Discounts

```typescript
// src/lib/subscription/credit-config.ts:58-63
export const DURATION_DISCOUNTS = {
  1: 0, // No discount for monthly
  3: 0.1, // 10% off for 3 months
  6: 0.2, // 20% off for 6 months
  12: 0.3, // 30% off for 12 months
};
```

### Business Economics: Usage-Based Credit Analysis

> Exchange rate assumed: 1 USD = Rp 15,500
> **Credit System: 1 credit = $0.0001 USD (actual API cost)**
> Revenue = Subscription Price, Cost = Credits Used × $0.0001

#### BASIC Tier (Rp 29,000/month ≈ $1.87 USD)

| Usage Scenario              | Est. Credits | Est. API Cost | Margin  |
| --------------------------- | ------------ | ------------- | ------- |
| 100% Free Chat (~800 msgs)  | 6,000        | $0.60         | **68%** |
| 100% Task Chat (~300 msgs)  | 6,000        | $0.60         | **68%** |
| 100% Voice (~170 exchanges) | 6,000        | $0.60         | **68%** |
| Mixed typical               | 6,000        | $0.60         | **68%** |

**What 6,000 credits ($0.60 API cost) gets you:**

- ~2,500 free chat messages (~2.4 credits/msg), OR
- ~1,000 task chat messages (~6 credits/msg), OR
- ~170 voice exchanges (~36 credits/exchange), OR
- ~12 realtime exchanges (~488 credits/exchange), OR
- Combination of these

#### PRO Tier (Rp 49,000/month ≈ $3.16 USD)

| Usage Scenario                | Est. Credits | Est. API Cost | Margin  |
| ----------------------------- | ------------ | ------------- | ------- |
| 100% Free Chat (~6,900 msgs)  | 16,500       | $1.65         | **48%** |
| 100% Task Chat (~2,750 msgs)  | 16,500       | $1.65         | **48%** |
| 100% Voice (~460 exchanges)   | 16,500       | $1.65         | **48%** |
| 100% Realtime (~34 exchanges) | 16,500       | $1.65         | **48%** |
| Mixed typical                 | 16,500       | $1.65         | **48%** |

**What 16,500 credits ($1.65 API cost) gets you:**

- ~6,900 free chat messages, OR
- ~2,750 task chat messages, OR
- ~460 voice exchanges, OR
- ~34 realtime exchanges (~17 min), OR
- Combination of these

**Usage-Based Advantages:**

1. **No Loss** - Credits = Actual API cost, margin is always positive
2. **Fair Pricing** - Users pay proportionally to their actual usage
3. **Transparent** - Each API call is tracked and converted to credits

> **Cost Per Feature (1 credit = $0.0001):**
>
> ```
> Free Chat:  ~2-3 credits/msg    = $0.00021/msg (cheapest)
> Task Chat:  ~6 credits/msg      = $0.00060/msg
> Voice:      ~36 credits/exchange = $0.0036/exchange
> Realtime:   ~488 credits/exchange = $0.049/exchange (most expensive)
> ```

### Estimating Minutes from Credits

```typescript
// src/lib/subscription/credit-config.ts:105-116
export function estimateMinutesFromCredits(credits: number, usageType: UsageType): number {
  const costPerMinute =
    usageType === 'REALTIME'
      ? CREDIT_COSTS.REALTIME_PER_MINUTE
      : CREDIT_COSTS.VOICE_STANDARD_PER_MINUTE;

  return Math.floor(credits / costPerMinute);
}
```

### Credit Balance Calculation

For **Trial Users** (FREE tier):

```
remaining = trialCredits - trialCreditsUsed
dailyRemaining = trialDailyLimit - trialDailyUsed
```

For **Paid Users** (BASIC/PRO):

```
remaining = creditsRemaining (stored in DB)
// or calculated as: creditsTotal - creditsUsed
```

---

## Credit Check Flow

### Before Feature Usage

```
┌─────────────────────────────────────────────────────────────┐
│                    CREDIT CHECK FLOW                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   User requests action │
              │   (chat, voice, etc.)  │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  creditService.check() │
              │  - usageType           │
              │  - estimatedUnits      │
              └────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
    ┌─────────────┐                ┌─────────────┐
    │  FREE Tier  │                │ BASIC/PRO   │
    └─────────────┘                └─────────────┘
           │                               │
           ▼                               ▼
    ┌─────────────────┐            ┌─────────────────┐
    │ Check trial:    │            │ Check tier:     │
    │ - isExpired?    │            │ - textUnlimited?│
    │ - dailyLimit?   │            │ - realtimeOK?   │
    │ - totalRemain?  │            │ - hasCredits?   │
    └─────────────────┘            └─────────────────┘
           │                               │
           └───────────────┬───────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Return CreditCheck   │
              │   - allowed: boolean   │
              │   - creditsNeeded      │
              │   - creditsAvailable   │
              │   - reason (if denied) │
              └────────────────────────┘
```

### Check Implementation

```typescript
// src/lib/subscription/credit-service.ts:23-112
async checkCredits(
  userId: string,
  usageType: UsageType,
  estimatedUnits: number
): Promise<CreditCheck>
```

#### FREE Tier Check Logic

1. **Trial Expired?** → Return `TRIAL_EXPIRED`
2. **Daily Limit Check** (for trial):
   ```typescript
   if (trialDailyUsed + creditsNeeded > trialDailyLimit) {
     return { allowed: false, reason: 'DAILY_LIMIT_EXCEEDED' };
   }
   ```
3. **Total Credits Check**:
   ```typescript
   const remaining = trialCredits - trialCreditsUsed;
   if (remaining < creditsNeeded) {
     return { allowed: false, reason: 'INSUFFICIENT_CREDITS' };
   }
   ```

#### BASIC/PRO Tier Check Logic

1. **Text Unlimited?** (for TEXT_CHAT):
   ```typescript
   if (usageType === 'TEXT_CHAT' && tierConfig.textUnlimited) {
     return { allowed: true, creditsNeeded: 0 };
   }
   ```
2. **Realtime Enabled?** (for REALTIME):
   ```typescript
   if (usageType === 'REALTIME' && !tierConfig.realtimeEnabled) {
     return { allowed: false, reason: 'FEATURE_NOT_AVAILABLE' };
   }
   ```
3. **Credit Balance Check**:
   ```typescript
   if (creditsRemaining < creditsNeeded) {
     return { allowed: false, reason: 'INSUFFICIENT_CREDITS' };
   }
   ```

---

## Credit Deduction

### Deduction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   CREDIT DEDUCTION FLOW                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Feature usage complete│
              │  (e.g., AI response)   │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ creditService.deduct() │
              │  - usageType           │
              │  - actualUnits         │
              │  - referenceId         │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Calculate actual cost  │
              │ getCreditCost(type,    │
              │              units)    │
              └────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
    ┌─────────────┐                ┌─────────────┐
    │  FREE Tier  │                │ BASIC/PRO   │
    └─────────────┘                └─────────────┘
           │                               │
           ▼                               ▼
    ┌─────────────────┐            ┌─────────────────┐
    │ Update:         │            │ Update:         │
    │ - trialCredits- │            │ - creditsUsed   │
    │   Used += cost  │            │   += cost       │
    │ - trialDailyUsed│            │ - creditsRemain │
    │   += cost       │            │   -= cost       │
    └─────────────────┘            └─────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Record transaction     │
              │ type: USAGE            │
              │ amount: -creditsUsed   │
              │ balance: newBalance    │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Check thresholds       │
              │ - 80% → notify         │
              │ - 95% → notify         │
              │ - 100% → notify        │
              └────────────────────────┘
```

### Deduction Implementation

```typescript
// src/lib/subscription/credit-service.ts:117-208
async deductCredits(
  userId: string,
  usageType: UsageType,
  actualUnits: number,
  referenceId?: string,
  referenceType?: string
): Promise<void>
```

#### For Trial Users:

```typescript
await prisma.subscription.update({
  where: { userId },
  data: {
    trialCreditsUsed: { increment: creditsUsed },
    trialDailyUsed: { increment: creditsUsed },
  },
});
```

#### For Paid Users:

```typescript
await prisma.subscription.update({
  where: { userId },
  data: {
    creditsUsed: { increment: creditsUsed },
    creditsRemaining: { decrement: creditsUsed },
  },
});
```

---

## Credit Reset Mechanisms

### 1. Daily Trial Reset

Resets the daily usage counter for trial users every day at midnight.

```typescript
// src/lib/subscription/trial-service.ts:152-176
async resetDailyUsage(): Promise<void> {
  await prisma.subscription.updateMany({
    where: {
      tier: 'FREE',
      status: 'ACTIVE',
      trialEndDate: { gt: new Date() }
    },
    data: {
      trialDailyUsed: 0,
      trialDailyReset: new Date()
    }
  })
}
```

**When**: Daily via cron job
**Affects**: `trialDailyUsed` field only
**Who**: All active trial users

### 2. Monthly Credit Reset (Billing Cycle)

Resets credits when a new billing period starts.

```typescript
// src/lib/subscription/credit-service.ts:251-286
async grantMonthlyCredits(userId: string): Promise<void> {
  const subscription = await this.getOrCreateSubscription(userId)
  const tierConfig = TIER_CONFIG[subscription.tier]
  const monthlyCredits = tierConfig.monthlyCredits

  await prisma.subscription.update({
    where: { userId },
    data: {
      creditsTotal: monthlyCredits,
      creditsUsed: 0,
      creditsRemaining: monthlyCredits,
      currentPeriodStart: new Date(),
      currentPeriodEnd: addMonths(new Date(), 1)
    }
  })

  // Record transaction
  await prisma.creditTransaction.create({
    data: {
      userId,
      type: 'GRANT',
      amount: monthlyCredits,
      balance: monthlyCredits,
      description: `Monthly credit grant - ${subscription.tier}`
    }
  })
}
```

**When**: Start of new billing period
**Affects**: `creditsTotal`, `creditsUsed`, `creditsRemaining`
**Who**: Paid users (BASIC/PRO)

### 3. Trial Expiration

Handles trial period ending.

```typescript
// src/lib/subscription/trial-service.ts:215-261
async processExpiredTrials(): Promise<void> {
  await prisma.subscription.updateMany({
    where: {
      tier: 'FREE',
      status: 'ACTIVE',
      trialEndDate: { lt: new Date() }
    },
    data: {
      status: 'EXPIRED'
    }
  })
}
```

**When**: Daily via cron job
**Affects**: `status` field
**Who**: Users with expired trial dates

### Reset Summary Table

| Reset Type       | Frequency        | Fields Reset                                      | Triggers              |
| ---------------- | ---------------- | ------------------------------------------------- | --------------------- |
| Daily Trial      | Daily (midnight) | `trialDailyUsed`                                  | Cron job              |
| Monthly Grant    | Billing cycle    | `creditsTotal`, `creditsUsed`, `creditsRemaining` | Payment success       |
| Trial Expiration | Daily            | `status` → EXPIRED                                | Trial end date passed |

---

## Transaction Types

All credit changes are recorded as transactions for audit purposes.

```typescript
// prisma/schema.prisma - CreditTransactionType enum
enum CreditTransactionType {
  GRANT          // Monthly credit allocation
  TRIAL_GRANT    // Initial trial credits
  USAGE          // Feature usage (negative amount)
  REFUND         // Credit refund (positive amount)
  ADJUSTMENT     // Manual admin adjustment
  BONUS          // Promotional/voucher credits
}
```

### Transaction Examples

| Type        | Amount | Description                                      |
| ----------- | ------ | ------------------------------------------------ |
| TRIAL_GRANT | +5,000 | "Trial period started"                           |
| GRANT       | +6,000 | "Monthly credit grant - BASIC"                   |
| USAGE       | -488   | "Realtime conversation exchange (actual tokens)" |
| USAGE       | -6     | "Task chat message (GPT + feedback + detection)" |
| USAGE       | -3     | "Free chat message (GPT only)"                   |
| USAGE       | -37    | "Voice exchange (Whisper + GPT + TTS)"           |
| BONUS       | +1,000 | "Voucher: WELCOME2024"                           |
| REFUND      | +500   | "Refund for service issue"                       |
| ADJUSTMENT  | +200   | "Admin adjustment: compensation"                 |

### Transaction Record Structure

```typescript
// prisma/schema.prisma - CreditTransaction model
model CreditTransaction {
  id            String                 @id @default(cuid())
  userId        String
  type          CreditTransactionType
  amount        Int                    // Positive = add, Negative = deduct
  balance       Int                    // Balance after transaction
  usageType     UsageType?            // For USAGE type
  durationSecs  Int?                  // For voice/realtime
  referenceId   String?               // Related entity ID
  referenceType String?               // "conversation", "session", etc.
  description   String?
  metadata      Json?
  createdAt     DateTime              @default(now())
}
```

---

## API Endpoints

### GET /api/subscription

Returns current subscription status and balance.

**Response:**

```json
{
  "subscription": {
    "tier": "FREE",
    "status": "ACTIVE",
    "trialEndDate": "2024-12-31T00:00:00.000Z",
    "creditsRemaining": 4500
  },
  "balance": {
    "total": 5000,
    "used": 500,
    "remaining": 4500,
    "isTrial": true,
    "dailyUsed": 100,
    "dailyLimit": 500
  },
  "tierConfig": { ... }
}
```

### POST /api/subscription/check

Checks if user can perform an action.

**Request:**

```json
{
  "usageType": "TEXT_CHAT",
  "estimatedUnits": 1
}
```

**Response:**

```json
{
  "allowed": true,
  "creditsNeeded": 6,
  "creditsAvailable": 4500,
  "estimatedMinutesRemaining": null
}
```

**Note:** `creditsNeeded` is an estimate based on typical usage. Actual credits deducted are calculated from real API token usage.

### GET /api/subscription/history

Returns credit transaction history.

**Query Params:**

- `limit` (default: 50)
- `offset` (default: 0)
- `type` (optional): Filter by transaction type

**Response:**

```json
{
  "transactions": [
    {
      "id": "clx123...",
      "type": "USAGE",
      "amount": -6,
      "balance": 4494,
      "usageType": "TEXT_CHAT",
      "description": "Task chat message (GPT + feedback + detection)",
      "metadata": {
        "inputTokens": 4450,
        "outputTokens": 450,
        "usdCost": 0.0006
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 156,
  "hasMore": true
}
```

### POST /api/voucher/apply

Applies a voucher code.

**Request:**

```json
{
  "code": "WELCOME2024"
}
```

**Response:**

```json
{
  "success": true,
  "type": "BONUS_CREDITS",
  "value": 1000,
  "message": "1,000 bonus credits added!"
}
```

---

## Database Schema

### Subscription Model

```prisma
model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique

  // Tier & Status
  tier                 SubscriptionTier   @default(FREE)
  status               SubscriptionStatus @default(ACTIVE)

  // Billing Period
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?

  // Credit Balance (Paid Tiers)
  creditsTotal         Int                @default(0)
  creditsUsed          Int                @default(0)
  creditsRemaining     Int                @default(0)

  // Trial (FREE Tier)
  trialStartDate       DateTime?
  trialEndDate         DateTime?
  trialCreditsUsed     Int                @default(0)
  trialDailyUsed       Int                @default(0)
  trialDailyReset      DateTime?

  // Feature Usage
  customCharactersUsed Int                @default(0)

  // Payment Provider
  paymentCustomerId    String?
  paymentRecurringId   String?

  // Relations
  user                 User               @relation(...)
  transactions         CreditTransaction[]
}
```

### Key Field Descriptions

| Field              | Description                                    |
| ------------------ | ---------------------------------------------- |
| `creditsTotal`     | Total credits for current billing period       |
| `creditsUsed`      | Credits consumed this period                   |
| `creditsRemaining` | Available credits (creditsTotal - creditsUsed) |
| `trialCreditsUsed` | Total credits used during trial                |
| `trialDailyUsed`   | Credits used today (resets daily)              |
| `trialDailyReset`  | Timestamp of last daily reset                  |

---

## Usage Examples

### Example 1: Text Chat Message (Usage-Based)

```
User: Sends chat message (Task mode)
  │
  ├─ Check: TEXT_CHAT (estimate ~6 credits)
  │    └─ estimated based on typical usage
  │
  ├─ (User is FREE tier with 4500 remaining)
  │    └─ allowed = true
  │
  ├─ AI processes and responds
  │    ├─ GPT-5-nano: 3,050 input + 150 output tokens
  │    │   └─ Cost: $0.00015 + $0.00006 = $0.00021
  │    ├─ Analysis (feedback): 800 input + 200 output tokens
  │    │   └─ Cost: $0.00012 + $0.00012 = $0.00024
  │    └─ Objective detection: 600 input + 100 output tokens
  │        └─ Cost: $0.00009 + $0.00006 = $0.00015
  │
  └─ Deduct: Total $0.00060 ÷ $0.0001 = 6 credits
       ├─ trialCreditsUsed: 500 → 506
       ├─ trialDailyUsed: 100 → 106
       └─ Transaction: USAGE, -6, balance: 4494
```

### Example 2: Realtime Session (Usage-Based)

```
User: Starts realtime session (PRO tier)
  │
  ├─ Check: REALTIME (estimate based on session type)
  │    └─ pre-check passed
  │
  ├─ (User has 16,500 remaining)
  │    └─ allowed = true
  │
  ├─ Session runs with 10 exchanges
  │    ├─ Exchange 1: 30s input + 20s output
  │    │   └─ Audio in: $0.018, Audio out: $0.030, Text: $0.001
  │    │   └─ Total: $0.049 → 490 credits
  │    ├─ Exchange 2-10: Similar pattern...
  │    └─ Total session: $0.49 → 4,900 credits
  │
  └─ Deduct: 4,900 credits (actual usage)
       ├─ creditsUsed: 0 → 4,900
       ├─ creditsRemaining: 16,500 → 11,600
       └─ Transaction: USAGE, -4900, balance: 11,600
```

### Example 3: Voice Chat Exchange (Usage-Based)

```
User: Sends voice message
  │
  ├─ Check: VOICE_STANDARD (estimate ~36 credits)
  │
  ├─ (User has 4000 remaining)
  │    └─ allowed = true
  │
  ├─ Process voice exchange
  │    ├─ Whisper: 10 sec audio
  │    │   └─ Cost: $0.006 × (10/60) = $0.001 → 10 credits
  │    ├─ GPT-5-nano: 1,500 input + 150 output tokens
  │    │   └─ Cost: $0.000075 + $0.00006 = $0.000135 → 1-2 credits
  │    └─ TTS: 200 chars response
  │        └─ Cost: $0.00012 + $0.0024 = $0.00252 → 25 credits
  │
  └─ Deduct: Total $0.00365 ÷ $0.0001 = ~37 credits
       ├─ creditsUsed: 500 → 537
       ├─ creditsRemaining: 4000 → 3963
       └─ Transaction: USAGE, -37, balance: 3963
```

### Example 4: Monthly Reset

```
Billing Cycle Ends:
  │
  ├─ Payment processed successfully
  │
  └─ grantMonthlyCredits():
       ├─ creditsTotal: 6,000 (new allocation)
       ├─ creditsUsed: 0 (reset)
       ├─ creditsRemaining: 6,000 (reset)
       ├─ currentPeriodStart: now
       ├─ currentPeriodEnd: now + 1 month
       └─ Transaction: GRANT, +6000, balance: 6000
```

---

## Notification Thresholds

The system sends notifications at specific usage thresholds:

| Threshold | Notification Type  | Trigger                           |
| --------- | ------------------ | --------------------------------- |
| 80% used  | CREDITS_80_PERCENT | creditsUsed ≥ 80% of creditsTotal |
| 95% used  | CREDITS_95_PERCENT | creditsUsed ≥ 95% of creditsTotal |
| 100% used | CREDITS_DEPLETED   | creditsRemaining ≤ 0              |

```typescript
// src/lib/subscription/credit-service.ts:213-246
async checkUsageThresholdsAndNotify(subscription): Promise<void> {
  const usagePercent = (creditsUsed / creditsTotal) * 100

  if (usagePercent >= 100) {
    await notify(CREDITS_DEPLETED)
  } else if (usagePercent >= 95) {
    await notify(CREDITS_95_PERCENT)
  } else if (usagePercent >= 80) {
    await notify(CREDITS_80_PERCENT)
  }
}
```

---

## Summary

### Credit System Overview

| Aspect                 | Implementation                                   |
| ---------------------- | ------------------------------------------------ |
| **Credit Rate**        | 1 credit = $0.0001 USD (actual API cost)         |
| **Credit Calculation** | Per API call based on actual token usage         |
| **Tier Config**        | Defined in `TIER_CONFIG` constant                |
| **Check Credits**      | `CreditService.checkCredits()`                   |
| **Deduct Credits**     | `CreditService.deductCredits()`                  |
| **Daily Reset**        | `TrialService.resetDailyUsage()` via cron        |
| **Monthly Reset**      | `CreditService.grantMonthlyCredits()` on payment |
| **Transaction Log**    | `CreditTransaction` model with token metadata    |
| **Notifications**      | At 80%, 95%, 100% usage thresholds               |

### Feature Cost Summary

| Feature           | Est. Credits | API Calls Included                 |
| ----------------- | ------------ | ---------------------------------- |
| Free Chat         | ~2-3/msg     | GPT-5-nano                         |
| Task Chat         | ~6/msg       | GPT-5-nano + Analysis + Feedback   |
| Voice Exchange    | ~36          | Whisper + GPT-5-nano + TTS         |
| Realtime Exchange | ~488         | Realtime API (audio in/out + text) |

### Key Implementation Notes

1. **Usage-Based**: Credits are calculated AFTER each API call using actual token counts
2. **No Fixed Rates**: The `CREDIT_COSTS` constants in code are legacy - to be updated
3. **Accurate Tracking**: Each transaction stores token counts and USD cost in metadata
4. **Fair Margins**: Since credits = actual cost, margins depend only on subscription price
