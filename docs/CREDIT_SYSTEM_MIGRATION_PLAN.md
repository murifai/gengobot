# Credit System Migration Plan

## Overview

Migrate from **fixed-rate credit system** to **usage-based credit system** where credits directly reflect actual OpenAI API costs.

**Conversion Rate:** `1 credit = $0.0001 USD`

---

## Phase 1: Core Infrastructure

### 1.1 Add Pricing Constants

**File:** `src/lib/subscription/credit-config.ts`

```typescript
// Add OpenAI pricing constants
export const OPENAI_PRICING = {
  // GPT-5-nano (RESPONSE model)
  'gpt-5-nano': {
    input: 0.05 / 1_000_000, // $0.05 per 1M tokens
    output: 0.4 / 1_000_000, // $0.40 per 1M tokens
  },
  // GPT-4o-mini (ANALYSIS model)
  'gpt-4o-mini': {
    input: 0.15 / 1_000_000, // $0.15 per 1M tokens
    output: 0.6 / 1_000_000, // $0.60 per 1M tokens
  },
  // Whisper
  'whisper-1': {
    perMinute: 0.006, // $0.006 per minute
  },
  // TTS
  'gpt-4o-mini-tts': {
    inputPerChar: 0.6 / 1_000_000, // $0.60 per 1M chars
    outputPerToken: 12.0 / 1_000_000, // $12 per 1M audio tokens
  },
  // Realtime API
  'gpt-realtime-mini-2025-10-06': {
    audioInputPerMin: 0.036, // $0.036 per minute
    audioOutputPerMin: 0.091, // $0.091 per minute
    textInput: 0.6 / 1_000_000,
    textOutput: 2.4 / 1_000_000,
  },
} as const;

export const CREDIT_CONVERSION_RATE = 0.0001; // 1 credit = $0.0001 USD
```

### 1.2 Create Credit Calculator Utility

**File:** `src/lib/subscription/credit-calculator.ts` (NEW)

```typescript
import { OPENAI_PRICING, CREDIT_CONVERSION_RATE } from './credit-config';

export interface TokenUsage {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  audioDurationSeconds?: number;
  audioInputTokens?: number;
  audioOutputTokens?: number;
  characterCount?: number;
}

export function calculateCreditsFromUsage(usage: TokenUsage): {
  credits: number;
  usdCost: number;
  breakdown: Record<string, number>;
} {
  let totalUsdCost = 0;
  const breakdown: Record<string, number> = {};

  const pricing = OPENAI_PRICING[usage.model as keyof typeof OPENAI_PRICING];

  if (!pricing) {
    console.warn(`Unknown model pricing: ${usage.model}`);
    return { credits: 0, usdCost: 0, breakdown };
  }

  // Text tokens (GPT models)
  if ('input' in pricing && usage.inputTokens) {
    const inputCost = usage.inputTokens * pricing.input;
    totalUsdCost += inputCost;
    breakdown.inputTokens = inputCost;
  }
  if ('output' in pricing && usage.outputTokens) {
    const outputCost = usage.outputTokens * pricing.output;
    totalUsdCost += outputCost;
    breakdown.outputTokens = outputCost;
  }

  // Whisper (audio duration)
  if ('perMinute' in pricing && usage.audioDurationSeconds) {
    const minutes = usage.audioDurationSeconds / 60;
    const audioCost = minutes * pricing.perMinute;
    totalUsdCost += audioCost;
    breakdown.audioDuration = audioCost;
  }

  // TTS (characters + audio tokens)
  if ('inputPerChar' in pricing) {
    if (usage.characterCount) {
      const charCost = usage.characterCount * pricing.inputPerChar;
      totalUsdCost += charCost;
      breakdown.ttsInput = charCost;
    }
    if (usage.outputTokens) {
      const audioTokenCost = usage.outputTokens * pricing.outputPerToken;
      totalUsdCost += audioTokenCost;
      breakdown.ttsOutput = audioTokenCost;
    }
  }

  // Realtime API (audio tokens)
  if ('audioInputPerMin' in pricing) {
    if (usage.audioInputTokens) {
      const inputMinutes = usage.audioInputTokens / (450 * 60);
      const inputCost = inputMinutes * pricing.audioInputPerMin;
      totalUsdCost += inputCost;
      breakdown.realtimeAudioInput = inputCost;
    }
    if (usage.audioOutputTokens) {
      const outputMinutes = usage.audioOutputTokens / (450 * 60);
      const outputCost = outputMinutes * pricing.audioOutputPerMin;
      totalUsdCost += outputCost;
      breakdown.realtimeAudioOutput = outputCost;
    }
    if (usage.inputTokens) {
      const textInputCost = usage.inputTokens * pricing.textInput;
      totalUsdCost += textInputCost;
      breakdown.realtimeTextInput = textInputCost;
    }
    if (usage.outputTokens) {
      const textOutputCost = usage.outputTokens * pricing.textOutput;
      totalUsdCost += textOutputCost;
      breakdown.realtimeTextOutput = textOutputCost;
    }
  }

  const credits = Math.ceil(totalUsdCost / CREDIT_CONVERSION_RATE);

  return { credits, usdCost: totalUsdCost, breakdown };
}
```

### 1.3 Update Credit Service

**File:** `src/lib/subscription/credit-service.ts`

Add new method for usage-based deduction:

```typescript
async deductCreditsFromUsage(
  userId: string,
  usage: TokenUsage,
  referenceId?: string,
  referenceType?: string,
  description?: string
): Promise<{ credits: number; usdCost: number }> {
  const { credits, usdCost, breakdown } = calculateCreditsFromUsage(usage);

  if (credits === 0) return { credits: 0, usdCost: 0 };

  // Update subscription credits
  // ... existing deduction logic ...

  // Record transaction with metadata
  await prisma.creditTransaction.create({
    data: {
      userId,
      type: 'USAGE',
      amount: -credits,
      balance: newBalance,
      usageType: this.getUsageTypeFromModel(usage.model),
      referenceId,
      referenceType,
      description,
      metadata: {
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        audioDurationSeconds: usage.audioDurationSeconds,
        usdCost,
        breakdown,
      },
    },
  });

  return { credits, usdCost };
}
```

---

## Phase 2: API Route Updates

### 2.1 Text Chat Routes

**Files to update:**

- `src/app/api/free-conversation/[sessionId]/stream/route.ts`
- `src/app/api/conversation/[conversationId]/stream/route.ts`
- `src/app/api/chat/route.ts` (if exists)

**Changes:**

1. Capture token usage from OpenAI response
2. Call `deductCreditsFromUsage()` with actual tokens
3. Include all API calls (response + feedback + hints)

```typescript
// Example change in stream route
const stream = await openai.chat.completions.create({
  model: MODELS.RESPONSE,
  messages: conversationMessages,
  stream: true,
  stream_options: { include_usage: true }, // ADD THIS
});

// After stream completes, get usage from final chunk
let totalInputTokens = 0;
let totalOutputTokens = 0;

for await (const chunk of stream) {
  // ... existing streaming logic ...

  // Capture usage from final chunk
  if (chunk.usage) {
    totalInputTokens = chunk.usage.prompt_tokens;
    totalOutputTokens = chunk.usage.completion_tokens;
  }
}

// Deduct based on actual usage
await creditService.deductCreditsFromUsage(
  session.userId,
  {
    model: MODELS.RESPONSE,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
  },
  sessionId,
  'free_conversation',
  'Text chat message'
);
```

### 2.2 Voice Chat Routes

**Files to update:**

- `src/app/api/voice/transcribe/route.ts`
- `src/app/api/voice/synthesize/route.ts`
- Voice chat API routes

**Changes:**

1. Track Whisper duration from response
2. Track TTS character count and audio tokens
3. Aggregate all costs for single voice exchange

### 2.3 Realtime Session

**Files to update:**

- `src/hooks/use-webrtc.ts`
- `src/app/api/session/route.ts`

**Changes:**

1. Already tracks audio tokens - update to use new calculator
2. Call `deductCreditsFromUsage()` on session end

---

## Phase 3: Database Updates

### 3.1 Add Metadata to Transaction Schema

**File:** `prisma/schema.prisma`

```prisma
model CreditTransaction {
  // ... existing fields ...

  // Add or ensure these exist
  metadata Json?  // Store token breakdown, USD cost, model info
}
```

### 3.2 Migration

```bash
npx prisma migrate dev --name add_usage_metadata
```

---

## Phase 4: Update Existing Functions

### 4.1 Deprecate Fixed-Rate Functions

**File:** `src/lib/subscription/credit-config.ts`

```typescript
/**
 * @deprecated Use calculateCreditsFromUsage() instead
 * Kept for backward compatibility during migration
 */
export function getCreditCost(usageType: UsageType, units: number): number {
  console.warn('getCreditCost is deprecated. Use calculateCreditsFromUsage()');
  // ... existing logic ...
}
```

### 4.2 Update Tier Configuration

Keep tier credit allocations the same, but understand they now represent USD value:

```typescript
// 6,000 credits = $0.60 worth of API usage
// 16,500 credits = $1.65 worth of API usage
```

---

## Phase 5: Testing

### 5.1 Unit Tests

**File:** `src/lib/subscription/__tests__/credit-calculator.test.ts` (NEW)

```typescript
describe('calculateCreditsFromUsage', () => {
  it('should calculate GPT-5-nano credits correctly', () => {
    const result = calculateCreditsFromUsage({
      model: 'gpt-5-nano',
      inputTokens: 3050,
      outputTokens: 150,
    });

    // Input: 3050 * $0.05/1M = $0.0001525
    // Output: 150 * $0.40/1M = $0.00006
    // Total: $0.0002125 → 3 credits (rounded up)
    expect(result.credits).toBe(3);
  });

  it('should calculate Whisper credits correctly', () => {
    const result = calculateCreditsFromUsage({
      model: 'whisper-1',
      audioDurationSeconds: 10,
    });

    // 10 sec = 0.167 min * $0.006 = $0.001 → 10 credits
    expect(result.credits).toBe(10);
  });

  // ... more tests
});
```

### 5.2 Integration Tests

- Test full flow: API call → token capture → credit deduction
- Verify transaction metadata is stored correctly
- Test edge cases (zero tokens, very large responses)

---

## Phase 6: Admin Analytics Integration

### 6.1 Update Earnings Analytics API

**File:** `src/app/api/admin/analytics/earnings/route.ts`

**Current Issue:** Line 118 uses placeholder `estimatedAPICost = revenue * 0.15`

**Replace with actual calculation:**

```typescript
// Replace line 118 placeholder with:
const tokenUsageStats = await prisma.creditTransaction.aggregate({
  _sum: { amount: true },
  where: { type: 'USAGE' },
});

// Get breakdown by usage type
const usageByType = await prisma.creditTransaction.groupBy({
  by: ['usageType'],
  _sum: { amount: true },
  _count: true,
  where: { type: 'USAGE' },
});

// Calculate actual API cost (1 credit = $0.0001)
const totalCreditsUsed = Math.abs(tokenUsageStats._sum.amount || 0);
const actualAPICostUSD = totalCreditsUsed * 0.0001;
const actualAPICostIDR = actualAPICostUSD * 15500;

// Return in expenses object
expenses: {
  total: actualAPICostIDR,
  apiUsage: actualAPICostIDR,
  credits: totalCreditsUsed,
  byType: {
    textChat: getTypeAmount(usageByType, 'TEXT_CHAT'),
    voice: getTypeAmount(usageByType, 'VOICE_STANDARD'),
    realtime: getTypeAmount(usageByType, 'REALTIME'),
  },
},
```

### 6.2 Create Token Usage Analytics Endpoint

**File:** `src/app/api/admin/analytics/token-usage/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [totalUsage, thisMonthUsage, lastMonthUsage, usageByType, dailyUsage, topUsers] =
    await Promise.all([
      // Total credits used (all time)
      prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: { type: 'USAGE' },
      }),

      // This month
      prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'USAGE',
          createdAt: { gte: startOfMonth },
        },
      }),

      // Last month
      prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'USAGE',
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
      }),

      // By usage type
      prisma.creditTransaction.groupBy({
        by: ['usageType'],
        _sum: { amount: true },
        _count: true,
        where: { type: 'USAGE' },
      }),

      // Daily usage (last 30 days)
      prisma.creditTransaction.groupBy({
        by: ['createdAt'],
        _sum: { amount: true },
        _count: true,
        where: {
          type: 'USAGE',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      // Top 10 users by usage
      prisma.creditTransaction.groupBy({
        by: ['userId'],
        _sum: { amount: true },
        _count: true,
        where: { type: 'USAGE' },
        orderBy: { _sum: { amount: 'asc' } },
        take: 10,
      }),
    ]);

  const CREDIT_TO_USD = 0.0001;
  const USD_TO_IDR = 15500;

  const totalCredits = Math.abs(totalUsage._sum.amount || 0);
  const thisMonthCredits = Math.abs(thisMonthUsage._sum.amount || 0);
  const lastMonthCredits = Math.abs(lastMonthUsage._sum.amount || 0);

  return NextResponse.json({
    summary: {
      totalCredits,
      totalCostUSD: totalCredits * CREDIT_TO_USD,
      totalCostIDR: totalCredits * CREDIT_TO_USD * USD_TO_IDR,
      thisMonth: {
        credits: thisMonthCredits,
        costUSD: thisMonthCredits * CREDIT_TO_USD,
        costIDR: thisMonthCredits * CREDIT_TO_USD * USD_TO_IDR,
      },
      lastMonth: {
        credits: lastMonthCredits,
        costUSD: lastMonthCredits * CREDIT_TO_USD,
        costIDR: lastMonthCredits * CREDIT_TO_USD * USD_TO_IDR,
      },
      growth:
        lastMonthCredits > 0 ? ((thisMonthCredits - lastMonthCredits) / lastMonthCredits) * 100 : 0,
    },
    byType: usageByType.map(item => ({
      type: item.usageType,
      credits: Math.abs(item._sum.amount || 0),
      costUSD: Math.abs(item._sum.amount || 0) * CREDIT_TO_USD,
      costIDR: Math.abs(item._sum.amount || 0) * CREDIT_TO_USD * USD_TO_IDR,
      transactions: item._count,
    })),
    dailyUsage,
    topUsers: topUsers.map(u => ({
      userId: u.userId,
      credits: Math.abs(u._sum.amount || 0),
      transactions: u._count,
    })),
  });
}
```

### 6.3 Update Dashboard API

**File:** `src/app/api/admin/analytics/dashboard/route.ts`

**Current Issue:** Lines 137-143 `apiUsage` is all zeros (placeholder)

**Replace with:**

```typescript
// Add to Promise.all queries:
const tokenUsage = await prisma.creditTransaction.aggregate({
  _sum: { amount: true },
  _count: true,
  where: {
    type: 'USAGE',
    createdAt: { gte: startOfMonth },
  },
});

// Replace apiUsage object (lines 137-143):
const monthlyCredits = Math.abs(tokenUsage._sum.amount || 0);
const CREDIT_TO_USD = 0.0001;
const USD_TO_IDR = 15500;
const monthlyCostIDR = monthlyCredits * CREDIT_TO_USD * USD_TO_IDR;

const apiUsage = {
  credits: monthlyCredits,
  transactions: tokenUsage._count || 0,
  costUSD: monthlyCredits * CREDIT_TO_USD,
  costIDR: monthlyCostIDR,
  // Budget based on expected API costs
  budgetIDR: 2000000, // Rp 2M budget
  percentageUsed: ((monthlyCostIDR / 2000000) * 100).toFixed(1),
};
```

### 6.4 Update EarningReportsTab Component

**File:** `src/components/admin/statistik/EarningReportsTab.tsx`

**Update interface and component to show token breakdown:**

```typescript
// Update EarningReportsTabProps.expenses
expenses: {
  total: number;
  apiUsage: number;
  credits?: number;
  byType?: {
    textChat: number;
    voice: number;
    realtime: number;
  };
};

// Update the "API Expenses" card (around line 147-156)
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">API Expenses</CardTitle>
    <CreditCard className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{formatRupiah(expenses.apiUsage)}</div>
    <p className="text-xs text-muted-foreground">
      {expenses.credits?.toLocaleString() || 0} credits used
    </p>
    {expenses.byType && (
      <div className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Text Chat:</span>
          <span>{formatRupiah(expenses.byType.textChat)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Voice:</span>
          <span>{formatRupiah(expenses.byType.voice)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Realtime:</span>
          <span>{formatRupiah(expenses.byType.realtime)}</span>
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

### 6.5 Add Token Usage Card to Dashboard

**File:** `src/components/admin/dashboard/APIUsageAlert.tsx`

Update to show actual token usage instead of placeholder:

```typescript
// Fetch from /api/admin/analytics/token-usage
// Display:
// - Total credits used this month
// - Cost in IDR
// - Breakdown by feature type (pie chart)
// - Daily usage trend (line chart)
```

---

## Phase 7: Frontend User Updates

### 7.1 Update Credit Display

**Files to update:**

- Credit balance components
- Usage history display
- Subscription info pages

**Changes:**

1. Show credits with estimated USD value
2. Display token breakdown in transaction history
3. Update "credits remaining" estimates

---

## Implementation Order

| Step | Task                                  | Priority | Estimate |
| ---- | ------------------------------------- | -------- | -------- |
| 1    | Add pricing constants                 | High     | 1 hour   |
| 2    | Create credit calculator utility      | High     | 2 hours  |
| 3    | Update credit service with new method | High     | 2 hours  |
| 4    | Update text chat stream routes        | High     | 3 hours  |
| 5    | Update voice routes (Whisper + TTS)   | High     | 3 hours  |
| 6    | Update realtime session               | Medium   | 2 hours  |
| 7    | Add database migration                | Medium   | 1 hour   |
| 8    | Write unit tests                      | Medium   | 2 hours  |
| 9    | Deprecate old functions               | Low      | 1 hour   |
| 10   | Update frontend user displays         | Low      | 2 hours  |
| 11   | Create token-usage admin API          | Medium   | 2 hours  |
| 12   | Update earnings analytics API         | Medium   | 1 hour   |
| 13   | Update dashboard analytics API        | Medium   | 1 hour   |
| 14   | Update EarningReportsTab component    | Low      | 1 hour   |
| 15   | Update APIUsageAlert component        | Low      | 1 hour   |

**Total Estimate:** ~25 hours

---

## Rollback Plan

If issues arise:

1. Keep old `getCreditCost()` function available
2. Feature flag to switch between fixed/usage-based
3. Database stores both old and new credit values during transition

---

## Success Criteria

### Core System

- [ ] All API routes track actual token usage
- [ ] Credits deducted match actual API cost
- [ ] Transaction history shows token breakdown
- [ ] No fixed-rate credit deductions remaining
- [ ] Unit tests pass for all calculations
- [ ] Profit margin stays positive for all tiers

### Admin Analytics

- [ ] Dashboard shows real API usage (not placeholder zeros)
- [ ] Earnings page shows actual API costs from CreditTransaction
- [ ] Token usage breakdown by type (Text/Voice/Realtime)
- [ ] Daily/monthly usage trends visible
- [ ] Top users by API usage tracked
- [ ] Cost displayed in both USD and IDR
