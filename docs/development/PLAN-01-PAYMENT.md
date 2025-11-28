# PLAN-01: Payment Integration (Midtrans)

## Overview

Integrasi pembayaran Midtrans untuk Gengobot dengan setup sandbox (ngrok) dan production.

**Priority**: HIGH
**Complexity**: Medium
**Sessions**: 2

---

## Current State Analysis

### Yang Sudah Ada:

- [x] Midtrans service (`src/lib/payment/midtrans-service.ts`)
- [x] Checkout endpoint (`src/app/api/payment/checkout/route.ts`)
- [x] Webhook handler (`src/app/api/webhooks/midtrans/route.ts`)
- [x] Payment history endpoint
- [x] Mock mode untuk development
- [x] PendingPayment model di database

### Yang Belum Ada:

- [x] Ngrok setup untuk sandbox testing ✅
- [x] Production environment configuration ✅
- [x] Payment success/failure pages ✅
- [x] Invoice generation ✅
- [ ] Receipt email (optional, low priority)

---

## Session 1: Sandbox Setup dengan Ngrok

### Tasks:

#### 1.1 Environment Configuration

```bash
# .env.local additions
MIDTRANS_SERVER_KEY_SANDBOX=SB-xxx
MIDTRANS_CLIENT_KEY_SANDBOX=SB-xxx
MIDTRANS_SERVER_KEY_PRODUCTION=xxx
MIDTRANS_CLIENT_KEY_PRODUCTION=xxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_WEBHOOK_SECRET=xxx
NGROK_URL=https://xxx.ngrok.io
```

#### 1.2 Ngrok Integration Script

**File**: `scripts/start-with-ngrok.sh`

```bash
#!/bin/bash
# Start ngrok and update webhook URL
ngrok http 3000 &
sleep 3
NGROK_URL=$(curl -s localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
echo "Ngrok URL: $NGROK_URL"
echo "NGROK_URL=$NGROK_URL" >> .env.local
npm run dev
```

#### 1.3 Dynamic Webhook URL

**File**: `src/lib/payment/midtrans-service.ts`

Update untuk support dynamic callback URL:

```typescript
const callbackUrl = process.env.NGROK_URL
  ? `${process.env.NGROK_URL}/api/webhooks/midtrans`
  : `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/midtrans`;
```

#### 1.4 Webhook Verification Enhancement

**File**: `src/app/api/webhooks/midtrans/route.ts`

Tambah signature verification yang proper:

```typescript
import crypto from 'crypto';

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey =
    process.env.MIDTRANS_IS_PRODUCTION === 'true'
      ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
      : process.env.MIDTRANS_SERVER_KEY_SANDBOX;

  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  return hash === signatureKey;
}
```

### Checklist Session 1:

- [x] Create `.env.local.example` dengan semua Midtrans variables ✅
- [x] Create ngrok startup script ✅
- [x] Update midtrans-service untuk dynamic URL ✅
- [x] Enhance webhook signature verification ✅
- [ ] Test sandbox payment flow (requires Midtrans sandbox account)
- [ ] Verify webhook receives notifications (requires ngrok + Midtrans)

---

## Session 2: Production Setup & UI

### Tasks:

#### 2.1 Production Environment Switch

**File**: `src/lib/payment/midtrans-service.ts`

```typescript
const getMidtransConfig = () => {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  return {
    serverKey: isProduction
      ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
      : process.env.MIDTRANS_SERVER_KEY_SANDBOX,
    clientKey: isProduction
      ? process.env.MIDTRANS_CLIENT_KEY_PRODUCTION
      : process.env.MIDTRANS_CLIENT_KEY_SANDBOX,
    apiUrl: isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com',
  };
};
```

#### 2.2 Payment Success Page

**File**: `src/app/app/payment/success/page.tsx`

```typescript
// UI Elements:
// - Success animation/icon
// - Order ID display
// - Amount paid
// - Subscription tier activated
// - "Kembali ke Dashboard" button
// - Receipt download option
```

#### 2.3 Payment Failed/Pending Pages

**Files**:

- `src/app/app/payment/failed/page.tsx`
- `src/app/app/payment/pending/page.tsx`

#### 2.4 Invoice Component

**File**: `src/components/payment/Invoice.tsx`

Invoice PDF generation dengan informasi:

- Invoice number
- Tanggal pembayaran
- Nama user
- Tier yang dibeli
- Harga (IDR)
- Payment method
- Status

#### 2.5 Receipt Email (Optional)

**File**: `src/lib/email/payment-receipt.ts`

Kirim email receipt setelah payment success via Mailjet.

### Checklist Session 2:

- [x] Production config switcher ✅
- [x] Payment success page ✅ (sudah ada sebelumnya, enhanced dengan invoice)
- [x] Payment failed page ✅ (sudah ada sebelumnya)
- [x] Payment pending page ✅ (sudah ada sebelumnya)
- [x] Invoice component ✅
- [ ] Email receipt (if time permits - low priority)
- [ ] End-to-end test sandbox (requires Midtrans account)
- [ ] Document production deployment steps

---

## Technical Notes

### Midtrans Snap Integration Flow:

```
User clicks "Upgrade"
    ↓
POST /api/payment/checkout
    ↓
Create Snap token via Midtrans API
    ↓
Return snap_token to client
    ↓
Open Midtrans Snap popup
    ↓
User completes payment
    ↓
Midtrans sends webhook to /api/webhooks/midtrans
    ↓
Verify signature & update PendingPayment
    ↓
Grant credits/activate subscription
    ↓
Redirect to success page
```

### Database Models Involved:

- `PendingPayment` - Tracks payment status
- `Subscription` - User subscription status
- `CreditTransaction` - Credit movements

### API Endpoints:

| Endpoint                 | Method | Purpose          |
| ------------------------ | ------ | ---------------- |
| `/api/payment/checkout`  | POST   | Create payment   |
| `/api/payment/history`   | GET    | Payment history  |
| `/api/webhooks/midtrans` | POST   | Webhook receiver |

---

## Testing Checklist

### Sandbox Testing:

- [ ] GoPay virtual payment
- [ ] Bank transfer simulation
- [ ] Credit card test card
- [ ] Webhook notification received
- [ ] Payment status updated
- [ ] Credits granted correctly
- [ ] Subscription activated

### Test Cards (Sandbox):

```
Visa: 4811 1111 1111 1114
MasterCard: 5211 1111 1111 1117
CVV: 123
Expiry: Any future date
```

---

## Files to Create/Modify

### Create:

- [x] `scripts/start-with-ngrok.sh` ✅
- [x] `src/app/app/payment/success/page.tsx` ✅ (sudah ada, enhanced)
- [x] `src/app/app/payment/failed/page.tsx` ✅ (sudah ada)
- [x] `src/app/app/payment/pending/page.tsx` ✅ (sudah ada)
- [x] `src/components/payment/Invoice.tsx` ✅
- [x] `.env.example` (updated) ✅
- [x] `src/app/api/payment/latest/route.ts` ✅ (new - untuk invoice data)

### Modify:

- [x] `src/lib/payment/midtrans-service.ts` ✅
- [ ] `src/app/api/webhooks/midtrans/route.ts` (tidak perlu diubah, sudah proper)
- [ ] `src/app/api/payment/checkout/route.ts` (tidak perlu diubah)

---

## Risks & Mitigations

| Risk                             | Impact   | Mitigation               |
| -------------------------------- | -------- | ------------------------ |
| Ngrok URL changes setiap restart | Medium   | Script otomatis update   |
| Webhook timeout                  | High     | Async processing + queue |
| Payment mismatch                 | Critical | Double verification      |

---

## Definition of Done

- [ ] Sandbox payment works end-to-end (requires Midtrans sandbox account + ngrok)
- [x] Production config ready ✅
- [x] All payment status pages created ✅
- [x] Webhook properly verified ✅
- [x] Credits granted on success ✅ (sudah ada di handlePaymentSuccess)
- [x] Error handling complete ✅
- [x] Documentation updated ✅

---

## Implementation Summary

### Files Created:

1. `scripts/start-with-ngrok.sh` - Script untuk start dev server dengan ngrok tunnel
2. `src/components/payment/Invoice.tsx` - Invoice component dengan print/download
3. `src/app/api/payment/latest/route.ts` - API untuk get latest payment data

### Files Modified:

1. `.env.example` - Ditambah Midtrans sandbox/production variables
2. `src/lib/payment/midtrans-service.ts`:
   - Ditambah `getMidtransConfig()` untuk sandbox/production switch
   - Ditambah `getBaseUrl()` untuk ngrok URL support
   - Updated signature verification dengan proper logging
3. `src/app/app/payment/success/page.tsx` - Enhanced dengan invoice display

### How to Use:

1. **Development dengan Mock Mode**: Set `MIDTRANS_MOCK_MODE=true` di `.env.local`
2. **Sandbox Testing**:
   - Get sandbox keys dari https://dashboard.sandbox.midtrans.com
   - Set keys di `.env.local`
   - Run `./scripts/start-with-ngrok.sh`
   - Configure webhook URL di Midtrans dashboard
3. **Production**: Set `MIDTRANS_IS_PRODUCTION=true` dan production keys

---

_Plan Version: 1.1_
_Created: 2025-11-27_
_Updated: 2025-11-27_
