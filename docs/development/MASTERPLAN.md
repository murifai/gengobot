# MASTERPLAN - Gengobot Development Roadmap

## Overview

Master plan pengembangan Gengobot berdasarkan analisis codebase dan requirements todo.

**Total Phases**: 8 fase utama
**Estimated Sessions**: 15-20 sesi pengembangan

---

## Phase Summary

| Phase | Nama                           | Priority | Kompleksitas | Sessions |
| ----- | ------------------------------ | -------- | ------------ | -------- |
| 1     | Payment Integration (Midtrans) | HIGH     | Medium       | 2        |
| 2     | UI/UX Improvements             | HIGH     | Medium       | 2-3      |
| 3     | Statistics & Dashboard         | HIGH     | High         | 2-3      |
| 4     | Dictionary System (JMDict)     | MEDIUM   | High         | 2-3      |
| 5     | Admin Enhancements             | MEDIUM   | Medium       | 2        |
| 6     | Subscription & Billing         | MEDIUM   | Medium       | 2        |
| 7     | Exam/UJIAN System (NEW)        | LOW      | Very High    | 3-4      |
| 8     | Polish & Cleanup               | LOW      | Low          | 1-2      |

---

## Phase 1: Payment Integration

**File**: [PLAN-01-PAYMENT.md](./PLAN-01-PAYMENT.md)

### Scope

- Midtrans Sandbox dengan ngrok untuk development
- Midtrans Production untuk backend
- Webhook handling
- Payment status tracking

### Status: Ready to Start

---

## Phase 2: UI/UX Improvements

**File**: [PLAN-02-UI-UX.md](./PLAN-02-UI-UX.md)

### Scope

- Semua UI language ke Bahasa Indonesia
- Font consistency (force default font)
- Grid/List view switch component fix
- Neobrutalism styling consistency
- Mobile view improvements

### Dependencies: None

---

## Phase 3: Statistics & Dashboard

**File**: [PLAN-03-STATISTICS.md](./PLAN-03-STATISTICS.md)

### Scope

- Weekly activity statistic fix
- Kaiwa minutes calculation (active chatting only, bukan AFK)
- Roleplay color differentiation
- Container cards vs kaiwa separation
- Remove streak belajar
- Recent activity simplification
- Timestamp position (right side)
- Roleplay feedback UI (Bahasa Indonesia)
- Deck statistics update (Baru, Hafal, Belum hafal, Total)

### Dependencies: Phase 2 (partial)

---

## Phase 4: Dictionary System

**File**: [PLAN-04-DICTIONARY.md](./PLAN-04-DICTIONARY.md)

### Scope

- JMDict integration (Japanese-English)
- English to Indonesian translation layer
- Word view component for Indonesian users
- Dictionary lookup API

### Dependencies: None (independent)

---

## Phase 5: Admin Enhancements

**File**: [PLAN-05-ADMIN.md](./PLAN-05-ADMIN.md)

### Scope

- Admin charts ke neobrutalism style
- Deck edit dengan difficulty di database
- User tier synchronization (user.tier ↔ subscription.tier)
- Setting subscription frontend connection

### Dependencies: Phase 2 (styling)

---

## Phase 6: Subscription & Billing

**File**: [PLAN-06-SUBSCRIPTION.md](./PLAN-06-SUBSCRIPTION.md)

### Scope

- Billing management page
- Subscription history
- Discount langganan panjang
- Tier conflict resolution

### Dependencies: Phase 1, Phase 5

---

## Phase 7: Exam/UJIAN System (NEW FEATURE)

**File**: [PLAN-07-EXAM.md](./PLAN-07-EXAM.md)

### Scope

- Flashcard drill integration
- JLPT nilai checker (offline test results)
- JLPT Tryout system
- Tryout scoring mendekati asli
- JLPT readiness statistics

### Dependencies: Phase 3, Phase 4

### Sub-features:

1. **Flashcard Drill Link** - Connect flashcard ke exam
2. **Nilai JLPT Checker** - Input hasil test offline
3. **Tryout JLPT** - Full tryout dengan timer
4. **Readiness Statistics** - Seberapa siap ikut JLPT

---

## Phase 8: Polish & Cleanup

**File**: [PLAN-08-POLISH.md](./PLAN-08-POLISH.md)

### Scope

- Hiragana/Katakana animation
- Difficulty filter fix
- Audio wave input visibility
- Drill flashcard button position
- Mobile view consistency

### Dependencies: All previous phases

---

## Execution Order

```
Week 1-2: Phase 1 (Payment) + Phase 2 (UI)
Week 3-4: Phase 3 (Statistics) + Phase 5 (Admin)
Week 5-6: Phase 4 (Dictionary) + Phase 6 (Subscription)
Week 7-9: Phase 7 (Exam System)
Week 10:  Phase 8 (Polish)
```

---

## Critical Path

```
Phase 1 (Payment) ──────────────────────┐
                                        ├──▶ Phase 6 (Subscription)
Phase 5 (Admin) ────────────────────────┘

Phase 2 (UI) ───────────────────────────┐
                                        ├──▶ Phase 3 (Statistics) ──┐
Phase 4 (Dictionary) ───────────────────┘                           │
                                                                    ├──▶ Phase 7 (Exam)
                                                                    │
                                                                    ▼
                                                            Phase 8 (Polish)
```

---

## Session Guidelines

### Per Session:

1. Read the specific PLAN-XX file
2. Execute tasks in order
3. Run tests after each major change
4. Commit with descriptive messages
5. Update checklist in plan file

### Quality Gates:

- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] Lint passes
- [ ] Manual UI testing done
- [ ] Database migrations applied (if any)

---

## File Structure

```
docs/development/
├── MASTERPLAN.md (this file)
├── PLAN-01-PAYMENT.md
├── PLAN-02-UI-UX.md
├── PLAN-03-STATISTICS.md
├── PLAN-04-DICTIONARY.md
├── PLAN-05-ADMIN.md
├── PLAN-06-SUBSCRIPTION.md
├── PLAN-07-EXAM.md
└── PLAN-08-POLISH.md
```

---

## Quick Reference

### Key Files by Feature:

**Payment**:

- `src/lib/payment/midtrans-service.ts`
- `src/app/api/payment/`
- `src/app/api/webhooks/midtrans/`

**UI/Styling**:

- `src/app/globals.css`
- `src/components/ui/`
- `tailwind.config.ts`

**Statistics**:

- `src/app/api/stats/`
- `src/components/dashboard/`
- `src/components/app/dashboard/`

**Admin**:

- `src/app/admin/`
- `src/components/admin/`

**Subscription**:

- `src/lib/subscription/`
- `src/app/api/subscription/`

**Database**:

- `prisma/schema.prisma`

---

## Notes

1. **Tidak ada JMDict saat ini** - Perlu implementasi dari awal
2. **Tidak ada sistem ujian** - Fitur baru sepenuhnya
3. **UI sudah neobrutalism** - Perlu consistency check
4. **Midtrans sudah terintegrasi** - Perlu setup ngrok untuk sandbox

---

_Last Updated: 2025-11-27_
_Version: 1.0.0_
