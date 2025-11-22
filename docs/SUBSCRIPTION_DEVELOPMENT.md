# Subscription System Development Roadmap

## Overview

Phased implementation plan for Gengo's credit-based subscription system.

---

## Phase 1: Core Credit Infrastructure (Week 1-2)

### Priority: CRITICAL

Database schema, credit tracking, and enforcement middleware.

### Tasks

#### 1.1 Database Schema

```prisma
// Add to prisma/schema.prisma

model Subscription {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])

  tier      SubscriptionTier @default(FREE)
  status    SubscriptionStatus @default(ACTIVE)

  // Billing
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime

  // Credits
  creditsTotal       Int      @default(0)
  creditsUsed        Int      @default(0)
  creditsRemaining   Int      @default(0)

  // Trial tracking
  trialStartDate     DateTime?
  trialEndDate       DateTime?
  trialCreditsUsed   Int      @default(0)
  trialDailyUsed     Int      @default(0)
  trialDailyReset    DateTime?

  // Character limits
  customCharactersUsed Int      @default(0)

  // Metadata
  xenditCustomerId     String?
  xenditRecurringId    String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CreditTransaction {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  type      CreditTransactionType
  amount    Int                    // Positive = add, Negative = deduct
  balance   Int                    // Balance after transaction

  // Usage details
  usageType    UsageType?
  durationSecs Int?                // For voice/realtime

  // Reference
  referenceId   String?            // Conversation ID, etc.
  referenceType String?

  description String?
  metadata    Json?

  createdAt DateTime @default(now())

  @@index([userId, createdAt])
  @@index([type, createdAt])
}

enum SubscriptionTier {
  FREE
  BASIC
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}

enum CreditTransactionType {
  GRANT           // Monthly credit allocation
  TRIAL_GRANT     // Trial credits
  USAGE           // Credit deduction
  REFUND          // Credit refund
  ADJUSTMENT      // Manual adjustment
  BONUS           // Promotional credits
}

enum UsageType {
  VOICE_STANDARD
  REALTIME
  TEXT_CHAT
}

model Voucher {
  id          String   @id @default(cuid())

  // Voucher details
  code        String   @unique
  name        String
  description String?

  // Type and value
  type        VoucherType
  value       Int              // Percentage, amount, or credits

  // Constraints
  maxUses         Int?         // Null = unlimited
  usesPerUser     Int          @default(1)
  currentUses     Int          @default(0)

  // Validity
  startDate       DateTime     @default(now())
  endDate         DateTime?
  isActive        Boolean      @default(true)

  // Eligibility
  newUsersOnly    Boolean      @default(false)
  applicableTiers SubscriptionTier[]
  minMonths       Int?         // Min subscription months required

  // Stacking
  isStackable     Boolean      @default(false)
  isExclusive     Boolean      @default(false)

  // Metadata
  createdBy       String?      // Admin userId
  metadata        Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  redemptions VoucherRedemption[]

  @@index([code])
  @@index([isActive, endDate])
}

model VoucherRedemption {
  id        String   @id @default(cuid())

  voucherId String
  voucher   Voucher  @relation(fields: [voucherId], references: [id])

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  // Applied to
  subscriptionId String?

  // Discount details
  discountType    VoucherType
  discountValue   Int
  originalAmount  Int?         // Original price in Rupiah
  finalAmount     Int?         // After discount

  // Status
  status          RedemptionStatus @default(APPLIED)

  createdAt DateTime @default(now())

  @@unique([voucherId, userId])  // One redemption per user per voucher
  @@index([userId])
  @@index([voucherId])
}

enum VoucherType {
  PERCENTAGE        // Discount percentage
  FIXED_AMOUNT      // Fixed Rupiah discount
  BONUS_CREDITS     // Extra credits
  TRIAL_EXTENSION   // Extend trial days
  TIER_UPGRADE      // Temporary tier upgrade
}

enum RedemptionStatus {
  APPLIED           // Successfully applied
  EXPIRED           // Voucher expired before use
  REVOKED           // Manually revoked
}
```

#### 1.2 Credit Service

```typescript
// src/lib/subscription/credit-service.ts

interface CreditConfig {
  VOICE_STANDARD_PER_MINUTE: 100;
  REALTIME_PER_MINUTE: 350;
  TEXT_CHAT_PER_MESSAGE: 4;

  TIERS: {
    FREE: {
      monthlyCredits: 0;
      trialCredits: 5000;
      trialDays: 14;
      trialDailyLimit: 500;
      textDailyLimit: 20;
      customCharacters: 1;
    };
    BASIC: {
      monthlyCredits: 6000;
      textUnlimited: true;
      customCharacters: 5;
    };
    PRO: {
      monthlyCredits: 16500;
      textUnlimited: true;
      customCharactersUnlimited: true;
    };
  };
}

class CreditService {
  // Check if user can perform action
  async checkCredits(userId: string, type: UsageType, estimatedUnits: number): Promise<CreditCheck>;

  // Deduct credits after usage
  async deductCredits(
    userId: string,
    type: UsageType,
    actualUnits: number
  ): Promise<CreditTransaction>;

  // Grant monthly credits
  async grantMonthlyCredits(userId: string): Promise<CreditTransaction>;

  // Get user's credit balance
  async getBalance(userId: string): Promise<CreditBalance>;

  // Get usage history
  async getHistory(userId: string, options?: HistoryOptions): Promise<CreditTransaction[]>;
}
```

#### 1.3 Usage Guard Middleware

```typescript
// src/lib/subscription/usage-guard.ts

// Middleware for API routes
export async function withCreditCheck(
  handler: NextApiHandler,
  usageType: UsageType
): NextApiHandler;

// Hook for client-side
export function useCreditCheck(usageType: UsageType): {
  canUse: boolean;
  remaining: number;
  checkAndReserve: (units: number) => Promise<boolean>;
};
```

#### 1.4 API Endpoints

```typescript
// GET /api/subscription - Get current subscription & credits
// POST /api/subscription/check - Check if action allowed
// POST /api/subscription/usage - Record usage (internal)
// GET /api/subscription/history - Get credit history
```

### Deliverables

- [ ] Database migration
- [ ] CreditService implementation
- [ ] Usage guard middleware
- [ ] API endpoints
- [ ] Unit tests

---

## Phase 2: Usage Tracking & Recording (Week 2-3)

### Priority: CRITICAL

Accurate per-second tracking for voice features.

### Tasks

#### 2.1 Voice Duration Tracking

```typescript
// src/lib/voice/duration-tracker.ts

class VoiceDurationTracker {
  private startTime: number;
  private pausedDuration: number = 0;

  start(): void;
  pause(): void;
  resume(): void;
  stop(): { durationSeconds: number; durationMinutes: number };

  // Get credits that will be used
  getEstimatedCredits(type: 'standard' | 'realtime'): number;
}
```

#### 2.2 Integration Points

Update existing voice services:

```typescript
// src/lib/voice/voice-conversation-manager.ts
// Add duration tracking and credit deduction

// src/app/api/session/route.ts (Realtime)
// Add credit check before session creation

// src/app/api/voice/transcribe/route.ts
// Add credit deduction after transcription
```

#### 2.3 Text Chat Tracking (Free Tier)

```typescript
// src/hooks/useStreamingChat.ts
// Add daily message counter for free tier

// src/app/api/chat/route.ts
// Add message limit check for free tier
```

### Deliverables

- [ ] VoiceDurationTracker
- [ ] Voice service integration
- [ ] Realtime session integration
- [ ] Text chat limit (free tier)
- [ ] Integration tests

---

## Phase 3: User Interface (Week 3-4)

### Priority: HIGH

Credit display, warnings, and upgrade prompts.

### Tasks

#### 3.1 Credit Balance Display

```typescript
// src/components/subscription/CreditBalance.tsx
// Shows: credits remaining, usage bar, estimated minutes

// src/components/subscription/UsageHistory.tsx
// Shows: transaction history with details
```

#### 3.2 Warning System

```typescript
// src/components/subscription/UsageWarning.tsx
// Shows at 80%, 95%, 100% usage

// src/components/subscription/TrialStatus.tsx
// Shows trial days remaining, daily usage
```

#### 3.3 Upgrade Prompts

```typescript
// src/components/subscription/UpgradePrompt.tsx
// Contextual upgrade prompts when limits reached

// src/components/subscription/PricingTable.tsx
// Comparison table for tiers
```

#### 3.4 Settings Page

```typescript
// src/app/app/settings/subscription/page.tsx
// - Current plan
// - Credit balance & history
// - Upgrade/downgrade options
// - Billing history
```

### Deliverables

- [ ] CreditBalance component
- [ ] UsageHistory component
- [ ] Warning components
- [ ] Upgrade prompts
- [ ] Settings subscription page
- [ ] Mobile responsive design

---

## Phase 4: Trial System (Week 4-5)

### Priority: HIGH

14-day trial with daily limits for free users.

### Tasks

#### 4.1 Trial Management

```typescript
// src/lib/subscription/trial-service.ts

class TrialService {
  // Start trial for new user
  async startTrial(userId: string): Promise<void>;

  // Check trial status
  async getTrialStatus(userId: string): Promise<TrialStatus>;

  // Reset daily trial usage (cron job)
  async resetDailyUsage(): Promise<void>;

  // Handle trial expiration
  async handleExpiration(userId: string): Promise<void>;
}
```

#### 4.2 Trial UI

```typescript
// src/components/subscription/TrialBanner.tsx
// "X days left in trial" banner

// src/components/subscription/TrialExpired.tsx
// Post-trial upgrade prompt
```

#### 4.3 Cron Jobs

```typescript
// src/app/api/cron/trial-reset/route.ts
// Daily reset of trial usage at midnight

// src/app/api/cron/trial-expiry/route.ts
// Handle expired trials
```

### Deliverables

- [ ] TrialService implementation
- [ ] Trial UI components
- [ ] Daily reset cron
- [ ] Expiry handling cron
- [ ] Trial notification emails

---

## Phase 5: Voucher System (Week 5-6)

### Priority: HIGH

Voucher codes for discounts, bonus credits, and promotions.

### Tasks

#### 5.1 Voucher Service

```typescript
// src/lib/voucher/voucher-service.ts

class VoucherService {
  // Validate voucher code
  async validateVoucher(
    code: string,
    userId: string,
    tier: SubscriptionTier
  ): Promise<VoucherValidation>;

  // Apply voucher to subscription
  async applyVoucher(
    code: string,
    userId: string,
    subscriptionId: string
  ): Promise<VoucherRedemption>;

  // Calculate discount
  calculateDiscount(
    voucher: Voucher,
    originalAmount: number
  ): { discountAmount: number; finalAmount: number };

  // Check eligibility
  async checkEligibility(
    voucher: Voucher,
    userId: string
  ): Promise<{ eligible: boolean; reason?: string }>;

  // Get user's redeemed vouchers
  async getUserRedemptions(userId: string): Promise<VoucherRedemption[]>;
}

interface VoucherValidation {
  valid: boolean;
  voucher?: Voucher;
  error?: string;
  discountPreview?: {
    type: VoucherType;
    value: number;
    description: string;
  };
}
```

#### 5.2 Voucher API Endpoints

```typescript
// POST /api/voucher/validate
// Validate voucher code without applying

// POST /api/voucher/apply
// Apply voucher to current checkout/subscription

// GET /api/voucher/my-redemptions
// Get user's voucher history
```

#### 5.3 Voucher UI Components

```typescript
// src/components/subscription/VoucherInput.tsx
// Input field with validation feedback

// src/components/subscription/VoucherApplied.tsx
// Shows applied discount details

// src/components/subscription/VoucherHistory.tsx
// User's redeemed vouchers
```

#### 5.4 Checkout Integration

```typescript
// Update checkout flow to:
// 1. Show voucher input field
// 2. Validate on input
// 3. Show discount preview
// 4. Apply to final amount
// 5. Pass to Xendit invoice with discount
```

### Deliverables

- [ ] VoucherService implementation
- [ ] Voucher validation logic
- [ ] Voucher API endpoints
- [ ] Voucher UI components
- [ ] Checkout integration
- [ ] Unit tests for discount calculation

---

## Phase 6: Payment Integration (Week 6-8)

### Priority: HIGH

Xendit integration for subscriptions with voucher support. Xendit is optimized for Indonesian market with local payment methods.

### Tasks

#### 6.1 Xendit Setup

```typescript
// src/lib/payment/xendit-service.ts

class XenditService {
  // Create invoice for subscription
  async createInvoice(
    userId: string,
    tier: SubscriptionTier,
    voucherDiscount?: number
  ): Promise<XenditInvoice>;

  // Create recurring payment plan
  async createRecurringPlan(userId: string, tier: SubscriptionTier): Promise<RecurringPlan>;

  // Handle webhook callbacks
  async handleCallback(event: XenditCallback): Promise<void>;

  // Subscription management
  async cancelSubscription(userId: string): Promise<void>;
  async updateSubscription(userId: string, tier: SubscriptionTier): Promise<void>;

  // Get payment methods
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]>;
}

interface XenditInvoice {
  id: string;
  external_id: string;
  invoice_url: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  payment_method?: string;
  paid_at?: Date;
}

// Supported payment methods in Indonesia
type PaymentMethod =
  | 'BANK_TRANSFER' // BCA, BNI, BRI, Mandiri, Permata
  | 'EWALLET' // OVO, DANA, ShopeePay, LinkAja
  | 'RETAIL_OUTLET' // Alfamart, Indomaret
  | 'QRIS' // QR Code (all banks)
  | 'CREDIT_CARD'; // Visa, Mastercard
```

#### 6.2 Webhook Handlers

```typescript
// src/app/api/webhooks/xendit/route.ts

// Handle callbacks:
// - invoices (paid, expired, failed)
// - recurring (activated, stopped, paused)
// - disbursements (for refunds)

// Callback validation
async function validateXenditCallback(request: Request, callbackToken: string): Promise<boolean>;
```

#### 6.3 Recurring Payments

```typescript
// src/lib/payment/recurring-service.ts

class RecurringService {
  // Create recurring plan for subscription
  async createPlan(userId: string, tier: SubscriptionTier): Promise<RecurringPlan>;

  // Pause/resume subscription
  async pausePlan(planId: string): Promise<void>;
  async resumePlan(planId: string): Promise<void>;

  // Update payment method
  async updatePaymentMethod(planId: string, methodId: string): Promise<void>;

  // Handle failed payments
  async handleFailedPayment(planId: string): Promise<void>;
}
```

#### 6.4 Invoice Generation

```typescript
// src/lib/payment/invoice-service.ts

class InvoiceService {
  // Generate Xendit invoice
  async generateInvoice(
    userId: string,
    amount: number,
    description: string,
    options?: InvoiceOptions
  ): Promise<XenditInvoice>;

  // Apply voucher discount
  calculateFinalAmount(originalAmount: number, voucher?: Voucher): number;

  // Get invoice status
  async getInvoiceStatus(invoiceId: string): Promise<InvoiceStatus>;
}

interface InvoiceOptions {
  voucherId?: string;
  payerEmail?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  reminderTime?: number; // Hours before expiry
}
```

#### 6.5 Pricing Pages

```typescript
// src/app/pricing/page.tsx
// Public pricing page with IDR pricing

// src/app/app/upgrade/page.tsx
// In-app upgrade flow

// src/app/app/payment/page.tsx
// Payment method selection

// src/app/app/payment/success/page.tsx
// Payment success confirmation

// src/app/app/payment/failed/page.tsx
// Payment failed with retry option
```

#### 6.6 Payment UI Components

```typescript
// src/components/payment/PaymentMethodSelector.tsx
// Select bank transfer, e-wallet, QRIS, etc.

// src/components/payment/InvoiceStatus.tsx
// Show invoice status and payment instructions

// src/components/payment/PaymentHistory.tsx
// User's payment history

// src/components/payment/SubscriptionCard.tsx
// Current subscription details with manage options
```

### Deliverables

- [ ] Xendit account setup
- [ ] XenditService implementation
- [ ] Webhook handlers with validation
- [ ] Recurring payment setup
- [ ] Invoice generation with voucher support
- [ ] Payment method selector UI
- [ ] Pricing pages
- [ ] Payment success/failure pages
- [ ] Email receipts
- [ ] Payment history

---

## Phase 7: Admin Dashboard (Week 8-9)

### Priority: MEDIUM

Monitoring, analytics, and voucher management for admin.

### Tasks

#### 7.1 Metrics Dashboard

```typescript
// src/app/admin/subscription/page.tsx

// Metrics:
// - Total revenue (MTD)
// - Total API costs
// - Gross margin
// - Users by tier
// - Conversion rate
// - Churn rate
// - Voucher usage stats
```

#### 7.2 User Management

```typescript
// src/app/admin/users/[id]/subscription/page.tsx

// Features:
// - View user's credit history
// - Manual credit adjustment
// - Subscription override
// - Usage analysis
// - Applied vouchers
```

#### 7.3 Voucher Management

```typescript
// src/app/admin/vouchers/page.tsx
// List all vouchers with stats

// src/app/admin/vouchers/new/page.tsx
// Create new voucher

// src/app/admin/vouchers/[id]/page.tsx
// Edit voucher details

// src/app/admin/vouchers/[id]/redemptions/page.tsx
// View all redemptions for a voucher
```

#### 7.4 Voucher Admin Service

```typescript
// src/lib/admin/voucher-admin-service.ts

class VoucherAdminService {
  // CRUD operations
  async createVoucher(data: CreateVoucherInput): Promise<Voucher>;
  async updateVoucher(id: string, data: UpdateVoucherInput): Promise<Voucher>;
  async deleteVoucher(id: string): Promise<void>;
  async toggleActive(id: string, isActive: boolean): Promise<Voucher>;

  // Analytics
  async getVoucherStats(id: string): Promise<VoucherStats>;
  async getAllVouchersWithStats(): Promise<VoucherWithStats[]>;

  // Bulk operations
  async generateBulkCodes(
    prefix: string,
    count: number,
    template: VoucherTemplate
  ): Promise<Voucher[]>;
  async exportRedemptions(voucherId: string): Promise<CSVExport>;
}

interface VoucherStats {
  totalRedemptions: number;
  totalDiscountGiven: number;
  conversionRate: number; // Users who upgraded after using voucher
  averageOrderValue: number;
  redemptionsByDate: DateSeries;
}
```

#### 7.5 Voucher Admin UI

```typescript
// src/components/admin/voucher/VoucherForm.tsx
// Create/edit voucher form with all constraints

// src/components/admin/voucher/VoucherTable.tsx
// Sortable, filterable table of vouchers

// src/components/admin/voucher/VoucherStats.tsx
// Usage stats and charts

// src/components/admin/voucher/RedemptionTable.tsx
// Table of all redemptions with user details
```

#### 7.6 Anomaly Detection

```typescript
// src/lib/subscription/anomaly-detector.ts

// Detect:
// - Users with cost > 2x average
// - Unusual usage patterns
// - Potential abuse
// - Voucher abuse patterns
```

### Deliverables

- [ ] Admin dashboard
- [ ] User subscription management
- [ ] Credit adjustment tool
- [ ] Voucher CRUD pages
- [ ] Voucher analytics
- [ ] Bulk voucher generation
- [ ] Redemption export
- [ ] Anomaly detection
- [ ] Export reports

---

## Phase 8: Notifications & Alerts (Week 9-10)

### Priority: MEDIUM

Proactive user communication.

### Tasks

#### 7.1 In-App Notifications

```typescript
// src/lib/notification/notification-service.ts

// Notifications:
// - 80% credits used
// - 95% credits used
// - Credits depleted
// - Trial ending (3 days)
// - Trial ended
// - Payment failed
```

#### 7.2 Email Notifications

```typescript
// src/lib/email/subscription-emails.ts

// Emails:
// - Welcome + trial start
// - Trial ending reminder
// - Subscription confirmed
// - Usage warning
// - Payment receipt
// - Payment failed
```

### Deliverables

- [ ] Notification service
- [ ] Email templates
- [ ] Email sending (Resend/SendGrid)
- [ ] Notification preferences

---

## Phase 9: Analytics & Optimization (Week 10-11)

### Priority: LOW

Data-driven improvements.

### Tasks

#### 8.1 Usage Analytics

```typescript
// Track:
// - Average credits per user per tier
// - Feature usage patterns
// - Conversion funnel
// - Churn predictors
```

#### 8.2 A/B Testing

```typescript
// Test:
// - Credit allocations
// - Upgrade prompts
// - Pricing display
// - Trial length
```

#### 8.3 Margin Optimization

```typescript
// Analyze:
// - Actual vs projected margins
// - Heavy users impact
// - Tier profitability
```

### Deliverables

- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Margin reports
- [ ] Optimization recommendations

---

## Technical Considerations

### Performance

```yaml
caching:
  - User subscription status (Redis)
  - Credit balance (Redis with TTL)
  - Tier configurations (memory)

database:
  - Index on userId + createdAt for transactions
  - Partitioning for large transaction tables
  - Read replicas for analytics
```

### Security

```yaml
payment:
  - Xendit callback token verification
  - PCI compliance (Xendit handles)
  - Secure API keys

user_data:
  - Encrypt payment info
  - GDPR compliance
  - Data retention policy
```

### Reliability

```yaml
critical_paths:
  - Credit check before usage: must not fail
  - Credit deduction: must be atomic
  - Webhook processing: idempotent

fallbacks:
  - Cache miss: query database
  - Xendit down: queue for retry
  - Credit service down: allow with logging
```

---

## Testing Strategy

### Unit Tests

- CreditService methods
- Calculation accuracy
- Tier configurations

### Integration Tests

- Credit flow (check → use → deduct)
- Subscription lifecycle
- Webhook processing

### E2E Tests

- Upgrade flow
- Trial to paid conversion
- Usage limits enforcement

---

## Rollout Plan

### Stage 1: Internal Testing

- Deploy to staging
- Team testing
- Fix critical bugs

### Stage 2: Beta Users

- Select 10-20 beta users
- Monitor closely
- Gather feedback

### Stage 3: Gradual Rollout

- 10% → 25% → 50% → 100%
- Monitor metrics at each stage
- Rollback plan ready

### Stage 4: Full Launch

- Marketing announcement
- Support documentation
- Monitor first week closely

---

## Success Metrics

### Phase 1-2 (Infrastructure)

- [ ] Credit tracking accuracy: 100%
- [ ] Usage recording latency: <100ms
- [ ] Zero credit leakage

### Phase 3-4 (User Experience)

- [ ] Trial completion rate: >50%
- [ ] Upgrade prompt CTR: >10%
- [ ] User satisfaction: >4/5

### Phase 5-6 (Revenue)

- [ ] Payment success rate: >95%
- [ ] Churn rate: <5%/month
- [ ] Gross margin: >45%

### Phase 7-8 (Optimization)

- [ ] Notification open rate: >30%
- [ ] Conversion rate improvement: >10%
- [ ] Cost per user reduction: >5%

---

## Dependencies

### External Services

- **Xendit**: Payment processing (Indonesian market)
- **Resend/SendGrid**: Email delivery
- **Redis**: Caching (optional, can use Vercel KV)
- **Vercel Cron**: Scheduled jobs

### Internal Systems

- User authentication (existing)
- Notification system (to build)
- Admin panel (to build)

---

## Timeline Summary

| Phase                             | Duration | Priority | Status      |
| --------------------------------- | -------- | -------- | ----------- |
| 1. Core Infrastructure            | 2 weeks  | CRITICAL | Not started |
| 2. Usage Tracking                 | 1 week   | CRITICAL | Not started |
| 3. User Interface                 | 1 week   | HIGH     | Not started |
| 4. Trial System                   | 1 week   | HIGH     | Not started |
| 5. Voucher System                 | 1 week   | HIGH     | Not started |
| 6. Payment Integration            | 2 weeks  | HIGH     | Not started |
| 7. Admin Dashboard + Voucher Mgmt | 1 week   | MEDIUM   | Not started |
| 8. Notifications                  | 1 week   | MEDIUM   | Not started |
| 9. Analytics                      | 1 week   | LOW      | Not started |

**Total: 11 weeks**

---

## Next Steps

1. Review and approve this plan
2. Set up Xendit account
3. Begin Phase 1 database schema
4. Create GitHub issues for each task
