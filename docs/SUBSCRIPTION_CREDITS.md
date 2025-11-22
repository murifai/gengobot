# Gengo Subscription & Credit System

## Overview

Gengo menggunakan sistem **credit-based billing** untuk memastikan pengguna membayar sesuai dengan penggunaan actual. Setiap credit setara dengan Rp 1.

---

## Credit Conversion Rates

| Feature        | Cost per Unit | Credits per Unit  |
| -------------- | ------------- | ----------------- |
| Voice Standard | Rp 100/menit  | 100 credits/menit |
| Realtime Chat  | Rp 350/menit  | 350 credits/menit |
| Text Chat      | Rp 4/pesan    | 4 credits/pesan\* |

\*Text chat tidak mengurangi credit untuk tier berbayar (unlimited)

---

## Subscription Tiers

### Free Tier (Rp 0)

```yaml
credits:
  monthly: 0
  trial: 7,000 credits (one-time)

features:
  drill_jlpt: unlimited
  text_chat: 20 pesan/hari (no credit deduction)
  voice_standard: trial only
  custom_characters: 1
  realtime: not available

trial_details:
  duration: 14 hari
  daily_limit: 500 credits (5 menit voice)
  total_credits: 5,000 (50 menit total)

after_trial:
  voice: disabled
  text: 20 pesan/hari continues
  upgrade_prompt: shown
```

### Basic Tier (Rp 25,000/bulan)

```yaml
credits:
  monthly: 6,000 credits

features:
  drill_jlpt: unlimited
  text_chat: unlimited (no credit deduction)
  voice_standard: 6,000 credits (~60 menit)
  custom_characters: limited 5 characters
  realtime: not available

cost_analysis:
  revenue: Rp 25,000
  max_cost: Rp 6,000 (voice) + Rp 6,000 (text estimate)
  gross_margin: 52%
```

### Pro Tier (Rp 50,000/bulan)

```yaml
credits:
  monthly: 16,500 credits

features:
  drill_jlpt: unlimited
  text_chat: unlimited (no credit deduction)
  voice_standard: available
  realtime: available
  priority_support: yes
  custom_characters: unlimited

credit_allocation:
  voice_standard: 6,000 credits (~60 menit)
  realtime: 10,500 credits (~30 menit)
  total: 16,500 credits

cost_analysis:
  revenue: Rp 50,000
  max_cost: Rp 16,500 (credits) + Rp 9,000 (text estimate)
  gross_margin: 49%
```

---

## Credit Calculation Details

### Voice Standard (Whisper + GPT-4o-mini + TTS)

```
Components per minute:
- STT (Whisper-1): $0.006
- LLM Input: $0.00009 (600 tokens)
- LLM Output: $0.00008 (133 tokens)
- TTS (gpt-4o-mini-tts): $0.0003 (500 chars)

Total: $0.00647/minute = Rp 102/minute ≈ 100 credits
```

### Realtime Chat (gpt-4o-realtime-mini)

```
Components per minute:
- Audio Input: $0.0075 (750 tokens)
- Audio Output: $0.015 (750 tokens)

Total: $0.0225/minute = Rp 353/minute ≈ 350 credits
```

### Text Chat (GPT-4o-mini)

```
Components per message:
- LLM Input: $0.00012 (800 tokens)
- LLM Output: $0.00012 (200 tokens)

Total: $0.00024/message = Rp 3.8/message ≈ 4 credits
```

---

## Usage Tracking

### Per-Second Billing

Voice chat di-track per **detik** untuk akurasi:

```typescript
// Example: 2 minutes 30 seconds voice call
duration_seconds = 150
credits_used = (150 / 60) * 100 = 250 credits
```

### Real-time Balance Display

User dapat melihat:

- Current credit balance
- Credits used this period
- Estimated minutes remaining
- Usage history

---

## Credit Rollover & Expiry

```yaml
rollover_policy:
  unused_credits: expire at period end
  reason: prevents accumulation and margin erosion

period_reset:
  monthly_credits: reset on billing date
  trial_credits: expire after 14 days
  daily_limits: reset at midnight (local time)
```

---

## Overage Protection

### Soft Limits

```yaml
warnings:
  - 80%: "You've used 80% of your credits"
  - 95%: 'Almost out of credits!'
  - 100%: Feature disabled with upgrade prompt

notifications:
  - In-app banner
  - Email (optional)
  - Push notification (optional)
```

### Hard Limits

```yaml
enforcement:
  voice_standard: blocked when credits = 0
  realtime: blocked when credits = 0
  text_chat_free: blocked when daily limit reached
  text_chat_paid: never blocked

grace_period: none (immediate enforcement)
```

---

## Fixed Costs

```yaml
monthly_fixed:
  vps: Rp 95,927 (4core/8GB/75GB NVMe)
  domain_ssl: Rp 50,000 (estimate)
  maintenance: Rp 54,073 (buffer)
  total: Rp 200,000

break_even:
  basic_users: 16 (16 × Rp 13,000 margin)
  pro_users: 9 (9 × Rp 23,000 margin)
  mixed: 8 Basic + 4 Pro
```

---

## Summary Table

```
┌─────────┬──────────┬─────────────┬────────────────────────┬─────────────┬─────────┐
│ Tier    │ Harga    │ Credits     │ Approx Usage           │ Est. Cost   │ Margin  │
├─────────┼──────────┼─────────────┼────────────────────────┼─────────────┼─────────┤
│ Free    │ Rp 0     │ 5K trial    │ 50 min voice (trial)   │ Rp 5,000*   │ -       │
│ Basic   │ Rp 25K   │ 6K/month    │ 60 min voice           │ Rp 12,000   │ 52%     │
│ Pro     │ Rp 50K   │ 16.5K/month │ 60 min + 30 min RT     │ Rp 25,500   │ 49%     │
└─────────┴──────────┴─────────────┴────────────────────────┴─────────────┴─────────┘

* One-time trial cost

Feature Limits:
- Free: 1 custom character
- Basic: 5 custom characters
- Pro: Unlimited custom characters
```

---

## Voucher & Discount System

### Voucher Types

```yaml
voucher_types:
  percentage:
    description: 'Discount percentage off subscription'
    example: 'LAUNCH20 = 20% off'
    applies_to: [BASIC, PRO]

  fixed_amount:
    description: 'Fixed Rupiah discount'
    example: 'HEMAT10K = Rp 10,000 off'
    applies_to: [BASIC, PRO]

  bonus_credits:
    description: 'Extra credits added to subscription'
    example: 'BONUS2K = +2,000 bonus credits'
    applies_to: [BASIC, PRO]

  free_trial_extension:
    description: 'Extend trial period'
    example: 'EXTRA7 = +7 days trial'
    applies_to: [FREE]

  tier_upgrade:
    description: 'Temporary tier upgrade'
    example: 'TRYPRO = Pro features for 7 days'
    applies_to: [FREE, BASIC]
```

### Voucher Constraints

```yaml
constraints:
  usage_limit:
    total_uses: number # Max total redemptions
    per_user: number # Max per user (usually 1)

  validity:
    start_date: DateTime
    end_date: DateTime

  eligibility:
    new_users_only: boolean
    specific_tiers: [FREE, BASIC, PRO]
    min_subscription_months: number

  stacking:
    stackable: boolean # Can combine with other vouchers
    exclusive: boolean # Cannot combine with any discount
```

### Example Vouchers

```yaml
launch_campaign:
  code: 'LAUNCH30'
  type: percentage
  value: 30
  description: '30% off first month'
  constraints:
    total_uses: 100
    per_user: 1
    new_users_only: true
    valid_until: '2024-03-31'

referral_bonus:
  code: 'REF-{userId}'
  type: bonus_credits
  value: 1000
  description: '+1,000 bonus credits'
  constraints:
    per_user: unlimited
    requires_referral: true

influencer_code:
  code: 'NIHONGO50'
  type: percentage
  value: 50
  description: '50% off (influencer campaign)'
  constraints:
    total_uses: 500
    valid_until: '2024-02-29'
```

---

## Development Phases

See [SUBSCRIPTION_DEVELOPMENT.md](./SUBSCRIPTION_DEVELOPMENT.md) for implementation roadmap.
