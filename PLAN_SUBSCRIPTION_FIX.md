# Plan: Fix Subscription & Payment System

## Overview

Memperbaiki 7 masalah utama pada sistem subscription dan payment di production.

---

## Issue 1: PKCE Error di Production

### Problem

```
[auth][error] InvalidCheck: pkceCodeVerifier value could not be parsed
```

Error ini terjadi karena cookie PKCE tidak tersimpan dengan benar di production dengan setup:

- Cloudflare DNS
- Nginx reverse proxy
- HTTPS (gengobot.com)

### Root Cause Analysis

NextAuth menggunakan cookie untuk menyimpan PKCE verifier. Dengan Cloudflare + Nginx, ada beberapa kemungkinan:

1. Cookie `Secure` flag tidak set karena proxy menghapus HTTPS info
2. `SameSite` setting conflict dengan redirect flow
3. Nginx tidak forward header yang diperlukan

### Solution

#### A. Update Auth Config (`src/lib/auth/config.ts`)

```typescript
export const authConfig: NextAuthConfig = {
  trustHost: true,
  basePath: '/api/auth',

  // Add cookie configuration for production
  cookies: {
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: 'authjs.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15,
      },
    },
  },

  // ... rest of config
};
```

#### B. Add Debug Logging for Payment Flow (Sandbox)

Tambahkan logging di webhook untuk testing dengan Midtrans Sandbox:

- `src/app/api/webhooks/midtrans/route.ts`
- `src/lib/payment/midtrans-service.ts`

```typescript
// Enhanced webhook logging
console.log('[Midtrans Webhook] Full notification:', JSON.stringify(notification, null, 2));
console.log('[Midtrans Webhook] Environment:', {
  isProduction: MIDTRANS_IS_PRODUCTION,
  hasServerKey: !!config.serverKey,
});
```

#### C. Remove Mock Payment System

Hapus mock payment untuk menghindari konflik dengan Midtrans Sandbox:

- Hapus `src/app/api/payment/mock/` folder
- Hapus `MockInvoice` model dari schema jika tidak digunakan
- Update `midtrans-service.ts` untuk selalu gunakan real Midtrans API (Sandbox/Production)

#### D. Nginx Configuration Check

Pastikan nginx config include:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header Host $host;
```

---

## Issue 2: Trial Credits Flow (FREE → Paid Upgrade)

### Current Behavior

- Trial credits hilang saat upgrade ke BASIC/PRO
- Credits baru langsung replace trial credits

### Desired Behavior

- Trial credits tetap terpisah
- Trial credits digunakan dulu sebelum credits paket
- Trial credits tetap expire sesuai jadwal trial

### Solution

#### A. Update Credit Service (`src/lib/subscription/credit-service.ts`)

1. Modify `checkCredits()` to check trial credits first:

```typescript
async checkCredits(userId: string, requiredCredits: number): Promise<CreditCheckResult> {
  const subscription = await this.getOrCreateSubscription(userId);

  // Check trial credits first if still in trial period
  if (subscription.tier !== 'FREE' && this.hasRemainingTrialCredits(subscription)) {
    const trialRemaining = subscription.trialCreditsTotal - subscription.trialCreditsUsed;
    if (trialRemaining >= requiredCredits) {
      return { allowed: true, source: 'trial', remaining: trialRemaining };
    }
  }

  // Then check regular credits
  if (subscription.creditsRemaining >= requiredCredits) {
    return { allowed: true, source: 'subscription', remaining: subscription.creditsRemaining };
  }

  return { allowed: false, source: null, remaining: 0 };
}
```

2. Modify `deductCredits()` to use trial credits first:

```typescript
async deductCredits(userId: string, amount: number, description: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  // Use trial credits first
  if (this.hasRemainingTrialCredits(subscription)) {
    const trialRemaining = subscription.trialCreditsTotal - subscription.trialCreditsUsed;
    const deductFromTrial = Math.min(amount, trialRemaining);

    if (deductFromTrial > 0) {
      await prisma.subscription.update({
        where: { userId },
        data: { trialCreditsUsed: { increment: deductFromTrial } },
      });
      amount -= deductFromTrial;
    }
  }

  // Remaining from subscription credits
  if (amount > 0) {
    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsUsed: { increment: amount },
        creditsRemaining: { decrement: amount },
      },
    });
  }
}
```

#### B. Update Midtrans Service (`src/lib/payment/midtrans-service.ts`)

Saat upgrade dari FREE, preserve trial credits:

```typescript
// In handlePaymentSuccess(), when upgrading from FREE:
if (existingSubscription?.tier === 'FREE') {
  // Preserve remaining trial credits
  const trialCreditsRemaining =
    existingSubscription.trialCreditsTotal - existingSubscription.trialCreditsUsed;

  await prisma.subscription.update({
    where: { userId },
    data: {
      tier,
      status: 'ACTIVE',
      // ... other fields
      // Keep trial info if still valid
      trialCreditsTotal: trialCreditsRemaining > 0 ? existingSubscription.trialCreditsTotal : 0,
      trialCreditsUsed: existingSubscription.trialCreditsUsed,
      trialEndDate: existingSubscription.trialEndDate, // Keep original end date
    },
  });
}
```

#### C. Update Database Schema (if needed)

Tambah field di Subscription model:

```prisma
model Subscription {
  // Existing fields...

  // Trial credits (preserved after upgrade)
  trialCreditsTotal    Int       @default(0)
  trialCreditsUsed     Int       @default(0)
}
```

---

## Issue 3: Anti-Abuse untuk Free Trial

### Strategy: Email-based Tracking (Simple)

Device fingerprint terlalu kompleks dan bisa false positive. Email-based lebih simple dan cukup efektif.

### Solution

#### A. Track Trial History

Buat model baru untuk track trial:

```prisma
model TrialHistory {
  id          String   @id @default(cuid())
  email       String
  userId      String
  grantedAt   DateTime @default(now())
  expiredAt   DateTime
  creditsUsed Int      @default(0)

  @@index([email])
}
```

#### B. Check Before Granting Trial

```typescript
async canGrantTrial(email: string, userId: string): Promise<{ allowed: boolean; reason?: string }> {
  // Check if email ever had trial before
  const previousTrial = await prisma.trialHistory.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (previousTrial) {
    return {
      allowed: false,
      reason: 'Email ini sudah pernah menggunakan trial sebelumnya',
    };
  }

  return { allowed: true };
}
```

#### C. Admin Configuration

Di admin panel, bisa set:

- Trial enabled/disabled globally
- Trial duration (days)
- Trial credits
- Daily limit

Tambah di `SubscriptionTierConfig` atau buat model baru:

```prisma
model TrialConfig {
  id              String   @id @default(cuid())
  enabled         Boolean  @default(true)
  durationDays    Int      @default(14)
  totalCredits    Int      @default(5000)
  dailyLimit      Int      @default(500)
  updatedAt       DateTime @updatedAt
}
```

---

## Issue 4: Cancel & Downgrade - Keep Credits Until Period End

### Current Problem

- Saat cancel, credits langsung diganti ke FREE tier
- User kehilangan credits yang sudah dibayar

### Desired Behavior

- Saat cancel/downgrade → schedule untuk period end
- User tetap bisa pakai credits sampai period end
- Setelah period end → baru switch ke FREE/lower tier

### Current Code Analysis

Di `tier-change-service.ts` sudah ada logic untuk scheduled downgrade, tapi perlu diperbaiki:

### Solution

#### A. Fix `cancelSubscription()` in `tier-change-service.ts`

```typescript
export async function cancelSubscription(userId: string): Promise<{...}> {
  // ... existing validation ...

  // Schedule cancellation at period end, but DON'T change status to CANCELED yet
  await prisma.subscription.update({
    where: { userId },
    data: {
      scheduledTier: SubscriptionTier.FREE,
      scheduledTierStartAt: subscription.currentPeriodEnd,
      // Keep status ACTIVE until period ends!
      // status: SubscriptionStatus.ACTIVE, // Don't change
    },
  });

  // ... rest of code
}
```

#### B. Update Cron Job (`src/app/api/cron/process-scheduled-tier-changes/route.ts`)

Ensure it properly handles:

- Transition to FREE tier
- Reset credits appropriately
- Update status

```typescript
// When processing FREE tier transition:
if (subscription.scheduledTier === 'FREE') {
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      tier: 'FREE',
      status: 'ACTIVE', // or EXPIRED based on business logic
      creditsTotal: 0,
      creditsUsed: 0,
      creditsRemaining: 0,
      scheduledTier: null,
      scheduledTierStartAt: null,
      // Grant new trial if eligible
    },
  });
}
```

---

## Issue 5: Restructure Profile Page Menu

### Current Structure

```
Profile Page Tabs:
- Personal
- Akun
- Langganan
- Tampilan
- Karakter
```

### New Structure

```
Profile Page Tabs:
- Personal
- Akun (with expandable sections)
  ├── Kredit (credit balance + usage history)
  ├── Billing (subscription management, cancel, etc.)
  ├── Redeem Code
  ├── Logout
  └── Danger Zone (delete account)
- Tampilan
- Karakter
```

### Solution

#### A. Update `ProfilePage.tsx`

Remove "Langganan" tab, merge into "Akun":

```tsx
<Tabs defaultValue="personal">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="personal">Personal</TabsTrigger>
    <TabsTrigger value="account">Akun</TabsTrigger>
    <TabsTrigger value="appearance">Tampilan</TabsTrigger>
    <TabsTrigger value="characters">Karakter</TabsTrigger>
  </TabsList>

  <TabsContent value="account">
    <AccountTab /> {/* New combined component */}
  </TabsContent>
</Tabs>
```

#### B. Create New `AccountTab.tsx`

```tsx
export function AccountTab() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Kredit Section */}
      <Collapsible open={expandedSection === 'kredit'}>
        <CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>Kredit</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CreditBalance />
          <UsageHistory />
        </CollapsibleContent>
      </Collapsible>

      {/* Billing Section */}
      <Collapsible open={expandedSection === 'billing'}>
        <CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SubscriptionManagement />
        </CollapsibleContent>
      </Collapsible>

      {/* Redeem Code Section */}
      <Collapsible>
        <CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span>Redeem Code</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <RedeemCodeInput />
        </CollapsibleContent>
      </Collapsible>

      {/* Logout */}
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>

      {/* Danger Zone */}
      <DangerZone />
    </div>
  );
}
```

#### C. Update Sidebar Navigation

Remove separate "Billing" link, keep only "Profile":

```tsx
const bottomItems = [
  // Remove billing, it's now in profile
  {
    title: 'Profile',
    url: '/app/profile',
    icon: UserIcon,
  },
];
```

---

## Issue 6: Renewal Reminder System (Indonesia Market)

### Requirements

- Kirim reminder 3 hari sebelum expiry
- Jika tidak diperpanjang → langsung downgrade ke FREE
- Tidak ada grace period

### Solution

#### A. Create Notification Cron Job

`src/app/api/cron/subscription-reminder/route.ts`

```typescript
export async function GET(request: NextRequest) {
  // Verify cron secret

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Find subscriptions expiring in 3 days
  const expiringSubscriptions = await prisma.subscription.findMany({
    where: {
      tier: { not: 'FREE' },
      status: 'ACTIVE',
      currentPeriodEnd: {
        gte: now,
        lte: threeDaysFromNow,
      },
      // Not already reminded
      metadata: {
        path: ['reminderSent'],
        equals: null,
      },
    },
    include: { user: true },
  });

  for (const subscription of expiringSubscriptions) {
    // Send email notification
    await sendRenewalReminderEmail(subscription.user.email, {
      tier: subscription.tier,
      expiresAt: subscription.currentPeriodEnd,
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: subscription.userId,
        type: 'SUBSCRIPTION_EXPIRING',
        title: 'Langganan Akan Berakhir',
        message: `Langganan ${subscription.tier} Anda akan berakhir dalam 3 hari. Perpanjang sekarang untuk tetap menikmati fitur premium.`,
        metadata: {
          tier: subscription.tier,
          expiresAt: subscription.currentPeriodEnd.toISOString(),
        },
      },
    });

    // Mark as reminded
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        metadata: {
          ...((subscription.metadata as object) || {}),
          reminderSent: now.toISOString(),
        },
      },
    });
  }

  return NextResponse.json({ reminded: expiringSubscriptions.length });
}
```

#### B. Update Existing Expiry Cron

Ensure `process-scheduled-tier-changes` handles expired subscriptions properly:

```typescript
// Also check for naturally expired subscriptions (no scheduled change but period ended)
const expiredSubscriptions = await prisma.subscription.findMany({
  where: {
    tier: { not: 'FREE' },
    status: 'ACTIVE',
    currentPeriodEnd: { lt: now },
    scheduledTier: null, // No scheduled change
  },
});

for (const subscription of expiredSubscriptions) {
  // Downgrade to FREE
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      tier: 'FREE',
      status: 'EXPIRED',
      creditsRemaining: 0,
    },
  });

  // Notify user
  await prisma.notification.create({
    data: {
      userId: subscription.userId,
      type: 'SUBSCRIPTION_EXPIRED',
      title: 'Langganan Berakhir',
      message: 'Langganan Anda telah berakhir. Upgrade untuk melanjutkan akses premium.',
    },
  });
}
```

---

## Issue 7: Redeem Code System

### Existing Voucher System

Voucher system sudah ada tapi hanya untuk payment/checkout. Perlu sistem terpisah untuk redeem code yang bisa digunakan langsung dari dashboard.

### Redeem Code Types Needed

1. **BONUS_CREDITS** - Tambah kredit langsung
2. **FREE_SUBSCRIPTION** - Gratis langganan X bulan tier tertentu

### Solution

#### A. Extend Voucher Types

Di Prisma schema, tambah tipe:

```prisma
enum VoucherType {
  PERCENTAGE
  FIXED_AMOUNT
  BONUS_CREDITS
  TRIAL_EXTENSION
  TIER_UPGRADE
  // New types for direct redemption
  FREE_SUBSCRIPTION  // e.g., "1 bulan PRO gratis"
}
```

#### B. Create Redeem Service

`src/lib/voucher/redeem-service.ts`

```typescript
export class RedeemService {
  /**
   * Redeem a code directly (not at checkout)
   */
  async redeemCode(userId: string, code: string): Promise<RedeemResult> {
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      return { success: false, error: 'Kode tidak ditemukan' };
    }

    // Validate voucher
    const validation = await this.validateForRedeem(voucher, userId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Process based on type
    switch (voucher.type) {
      case 'BONUS_CREDITS':
        return this.processBonusCredits(userId, voucher);

      case 'FREE_SUBSCRIPTION':
        return this.processFreeSubscription(userId, voucher);

      case 'TRIAL_EXTENSION':
        return this.processTrialExtension(userId, voucher);

      default:
        return {
          success: false,
          error: 'Kode ini hanya bisa digunakan saat checkout',
        };
    }
  }

  private async processBonusCredits(userId: string, voucher: Voucher): Promise<RedeemResult> {
    const subscription = await prisma.subscription.findUnique({ where: { userId } });

    if (!subscription) {
      return { success: false, error: 'Subscription tidak ditemukan' };
    }

    await prisma.$transaction([
      // Add credits
      prisma.subscription.update({
        where: { userId },
        data: {
          creditsRemaining: { increment: voucher.value },
          creditsTotal: { increment: voucher.value },
        },
      }),
      // Record transaction
      prisma.creditTransaction.create({
        data: {
          userId,
          type: 'BONUS',
          amount: voucher.value,
          balance: subscription.creditsRemaining + voucher.value,
          description: `Redeem code: ${voucher.code}`,
        },
      }),
      // Record redemption
      prisma.voucherRedemption.create({
        data: {
          voucherId: voucher.id,
          userId,
          discountType: voucher.type,
          discountValue: voucher.value,
          status: 'APPLIED',
        },
      }),
      // Increment usage
      prisma.voucher.update({
        where: { id: voucher.id },
        data: { currentUses: { increment: 1 } },
      }),
    ]);

    return {
      success: true,
      message: `Berhasil! ${voucher.value.toLocaleString()} kredit telah ditambahkan.`,
      creditsAdded: voucher.value,
    };
  }

  private async processFreeSubscription(userId: string, voucher: Voucher): Promise<RedeemResult> {
    // Extract tier and duration from voucher metadata
    const metadata = voucher.metadata as { tier: SubscriptionTier; durationMonths: number };
    const { tier, durationMonths } = metadata;

    const tierConfig = TIER_CONFIG[tier];
    const totalCredits = tierConfig.monthlyCredits * durationMonths;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + durationMonths);

    await prisma.$transaction([
      // Update/create subscription
      prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          tier,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          creditsTotal: totalCredits,
          creditsRemaining: totalCredits,
        },
        update: {
          tier,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          creditsTotal: totalCredits,
          creditsUsed: 0,
          creditsRemaining: totalCredits,
        },
      }),
      // Record transaction
      prisma.creditTransaction.create({
        data: {
          userId,
          type: 'GRANT',
          amount: totalCredits,
          balance: totalCredits,
          description: `Redeem code: ${voucher.code} - ${tier} ${durationMonths} bulan`,
        },
      }),
      // Record redemption
      prisma.voucherRedemption.create({
        data: {
          voucherId: voucher.id,
          userId,
          discountType: voucher.type,
          discountValue: voucher.value,
          status: 'APPLIED',
        },
      }),
      // Increment usage
      prisma.voucher.update({
        where: { id: voucher.id },
        data: { currentUses: { increment: 1 } },
      }),
    ]);

    return {
      success: true,
      message: `Berhasil! Anda mendapat langganan ${tier} gratis selama ${durationMonths} bulan.`,
      tier,
      durationMonths,
    };
  }
}

export const redeemService = new RedeemService();
```

#### C. Create API Endpoint

`src/app/api/redeem/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code } = await request.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Kode tidak valid' }, { status: 400 });
  }

  const result = await redeemService.redeemCode(session.user.id, code);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
```

#### D. Create UI Component

`src/components/subscription/RedeemCodeInput.tsx`

```tsx
export function RedeemCodeInput() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleRedeem = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
        setCode('');
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch {
      setResult({ success: false, message: 'Terjadi kesalahan' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Masukkan kode redeem"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          className="uppercase"
        />
        <Button onClick={handleRedeem} disabled={!code || isLoading}>
          {isLoading ? 'Memproses...' : 'Redeem'}
        </Button>
      </div>

      {result && (
        <Alert variant={result.success ? 'success' : 'destructive'}>{result.message}</Alert>
      )}
    </div>
  );
}
```

#### E. Admin: Create Redeem Codes

Di admin panel voucher yang sudah ada, tambah option untuk create:

- Type: FREE_SUBSCRIPTION
- Metadata: { tier: 'PRO', durationMonths: 1 }
- Type: BONUS_CREDITS
- Value: 5000

---

## Implementation Order

### Phase 1: Critical Fixes (Production Issues)

1. **PKCE Error Fix** - Blocking production auth
2. **Remove Mock Payment** - Use Midtrans Sandbox only
3. **Add Debug Logging** - For Sandbox testing

### Phase 2: Core Subscription Fixes

4. **Cancel/Downgrade Fix** - Keep credits until period end
5. **Trial Credits Flow** - Use trial credits first after upgrade

### Phase 3: Anti-Abuse & Reminders

6. **Trial Anti-Abuse** - Email-based tracking
7. **Renewal Reminder** - 3-day notification

### Phase 4: UI & Features

8. **Profile Page Restructure** - New menu structure
9. **Redeem Code System** - Direct redemption from dashboard

---

## Files to Modify

### Phase 1

- `src/lib/auth/config.ts` - Cookie settings
- `src/app/api/webhooks/midtrans/route.ts` - Debug logging
- `src/lib/payment/midtrans-service.ts` - Remove mock mode, debug logging
- Delete `src/app/api/payment/mock/` folder

### Phase 2

- `src/lib/subscription/tier-change-service.ts` - Fix cancel logic
- `src/lib/subscription/credit-service.ts` - Trial credits flow
- `src/lib/payment/midtrans-service.ts` - Preserve trial on upgrade

### Phase 3

- `prisma/schema.prisma` - TrialHistory, TrialConfig models
- `src/lib/subscription/trial-service.ts` - Anti-abuse check
- `src/app/api/cron/subscription-reminder/route.ts` - New cron

### Phase 4

- `src/components/app/profile/ProfilePage.tsx` - Remove Langganan tab
- `src/components/app/profile/tabs/AccountTab.tsx` - New combined tab
- `src/components/dashboard/app-sidebar.tsx` - Remove Billing link
- `src/lib/voucher/redeem-service.ts` - New service
- `src/app/api/redeem/route.ts` - New endpoint
- `src/components/subscription/RedeemCodeInput.tsx` - New component

---

## Database Migrations Needed

```prisma
// 1. TrialHistory for anti-abuse
model TrialHistory {
  id          String   @id @default(cuid())
  email       String
  userId      String
  grantedAt   DateTime @default(now())
  expiredAt   DateTime
  creditsUsed Int      @default(0)

  @@index([email])
}

// 2. TrialConfig for admin control
model TrialConfig {
  id              String   @id @default(cuid())
  enabled         Boolean  @default(true)
  durationDays    Int      @default(14)
  totalCredits    Int      @default(5000)
  dailyLimit      Int      @default(500)
  updatedAt       DateTime @updatedAt
}

// 3. Update Subscription model (if not exist)
model Subscription {
  // Add fields to preserve trial credits after upgrade
  trialCreditsTotal    Int       @default(0)
  trialCreditsPreserved Boolean  @default(false)
}

// 4. Add FREE_SUBSCRIPTION to VoucherType enum
enum VoucherType {
  PERCENTAGE
  FIXED_AMOUNT
  BONUS_CREDITS
  TRIAL_EXTENSION
  TIER_UPGRADE
  FREE_SUBSCRIPTION  // NEW
}
```

---

## Testing Checklist

- [ ] Auth flow works in production (PKCE fix)
- [ ] Mock payment removed, Midtrans Sandbox works
- [ ] Payment webhook receives and processes correctly
- [ ] Cancel subscription keeps credits until period end
- [ ] Upgrade from FREE preserves trial credits
- [ ] Trial credits used before subscription credits
- [ ] Same email cannot get trial twice
- [ ] Renewal reminder sent 3 days before expiry
- [ ] Expired subscription auto-downgrades to FREE
- [ ] Profile page new menu structure works
- [ ] Redeem code adds credits correctly
- [ ] Redeem code grants free subscription correctly
