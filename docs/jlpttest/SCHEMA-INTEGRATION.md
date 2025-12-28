# JLPT Tryout - Schema Integration Guide

**Version**: 1.0
**Created**: 2025-12-28
**Status**: Planning
**Related**: [MVP Development Plan](./MVP-DEVELOPMENT-PLAN.md), [Database Design v2](./01-database-design-v2.md)

---

## Overview

This document outlines how the JLPT Tryout feature integrates with the existing Gengobot schema and identifies necessary modifications.

---

## 1. Integration Strategy

### 1.1 Core Principle

**Minimize disruption to existing schema** while adding JLPT-specific tables as a separate module.

### 1.2 Integration Points

1. **User Authentication**: Use existing `User` model (no changes needed)
2. **Admin Management**: Use existing `Admin` model for question management
3. **Subscription/Credits**: Integrate with existing credit system (optional for MVP)
4. **Analytics**: Use existing `AnalyticsEvent` for JLPT events

---

## 2. Existing Schema - No Changes Required

These models are used **as-is** without modifications:

### 2.1 User Model

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  proficiency   String   @default("N5") // ✅ Already tracks JLPT level!
  // ... other fields

  // New JLPT relations (added)
  jlptTestAttempts      JLPTTestAttempt[]
  jlptOfflineResults    JLPTOfflineTestResult[]
}
```

**Integration**:

- Use existing `proficiency` field to suggest appropriate test level
- Add new relations for JLPT test attempts

### 2.2 Admin Model

```prisma
model Admin {
  id        String    @id @default(cuid())
  email     String    @unique
  role      AdminRole @default(ADMIN)
  // ... other fields

  // New JLPT relations (added)
  jlptQuestions JLPTQuestion[] // Questions created by this admin
  jlptPassages  JLPTPassage[]  // Passages created by this admin
}
```

**Integration**:

- Use existing admin authentication for question management
- Add new relations for JLPT content creation

### 2.3 Analytics Model

```prisma
model AnalyticsEvent {
  id         String   @id @default(cuid())
  userId     String?
  eventName  String   // e.g., 'jlpt_test_start', 'jlpt_test_complete'
  properties Json?    // Test level, score, duration, etc.
  timestamp  DateTime @default(now())
  // ... other fields
}
```

**Integration**:

- Track JLPT-specific events:
  - `jlpt_test_start` - User starts a test
  - `jlpt_section_submit` - User submits a section
  - `jlpt_test_complete` - User completes a test
  - `jlpt_calculator_use` - User uses offline calculator
  - `jlpt_question_flag` - User flags a question

---

## 3. New JLPT Tables (to be added)

### 3.1 Naming Convention

All JLPT tables use `JLPT` prefix to avoid naming conflicts:

- `JLPTPassage` instead of `Passage`
- `JLPTQuestion` instead of `Question`
- `JLPTTestAttempt` instead of `TestAttempt`

### 3.2 Schema Addition

Add to existing `schema.prisma`:

```prisma
// ============================================
// JLPT TRYOUT SYSTEM
// ============================================

// JLPT Passage - Content for reading, listening, images
model JLPTPassage {
  id           String   @id @default(cuid())
  contentType  String   // text, audio, image
  contentText  String?  @db.Text
  mediaUrl     String?
  title        String?  @db.Text

  createdBy    String?  // Admin ID
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  isActive     Boolean  @default(true)

  admin        Admin?      @relation(fields: [createdBy], references: [id], onDelete: SetNull)
  questions    JLPTQuestion[]
  primaryUnits JLPTQuestionUnit[] @relation("PrimaryPassage")
  secondaryUnits JLPTQuestionUnit[] @relation("SecondaryPassage")

  @@index([isActive])
  @@index([createdBy])
}

// JLPT Question
model JLPTQuestion {
  id             String  @id @default(cuid())
  passageId      String?

  // JLPT Structure
  level          String  // N1, N2, N3, N4, N5
  sectionType    String  // vocabulary, grammar_reading, listening
  mondaiNumber   Int
  questionNumber Int

  // Question Content
  questionText   String  @db.Text
  blankPosition  String?
  questionType   String  @default("standard")

  // Standalone Media
  mediaUrl       String?
  mediaType      String?

  // Answer
  correctAnswer  Int     // 1-4
  difficulty     String  @default("medium")

  createdBy      String? // Admin ID
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  isActive       Boolean  @default(true)

  passage        JLPTPassage?        @relation(fields: [passageId], references: [id], onDelete: SetNull)
  admin          Admin?              @relation(fields: [createdBy], references: [id], onDelete: SetNull)
  answerChoices  JLPTAnswerChoice[]
  unitQuestions  JLPTUnitQuestion[]
  userAnswers    JLPTUserAnswer[]
  analytics      JLPTQuestionAnalytics?

  @@index([level, sectionType, mondaiNumber, isActive])
  @@index([passageId])
  @@index([difficulty])
  @@index([createdBy])
}

// JLPT Answer Choice
model JLPTAnswerChoice {
  id            String  @id @default(cuid())
  questionId    String

  choiceNumber  Int     // 1-4 (static answer key)
  choiceType    String  @default("text")
  choiceText    String? @db.Text
  choiceMediaUrl String?
  orderIndex    Int     @default(0)

  createdAt     DateTime @default(now())

  question      JLPTQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([questionId, choiceNumber])
  @@index([questionId, choiceNumber])
}

// JLPT Question Unit (for grouped questions)
model JLPTQuestionUnit {
  id                  String  @id @default(cuid())

  level               String
  sectionType         String
  mondaiNumber        Int
  unitType            String  // cloze_test, reading_comp, long_reading, etc.

  passageId           String
  passageIdSecondary  String? // For A-B comparison

  difficulty          String  @default("medium")
  createdAt           DateTime @default(now())
  isActive            Boolean  @default(true)

  passage             JLPTPassage @relation("PrimaryPassage", fields: [passageId], references: [id], onDelete: Cascade)
  passageSecondary    JLPTPassage? @relation("SecondaryPassage", fields: [passageIdSecondary], references: [id], onDelete: Cascade)
  unitQuestions       JLPTUnitQuestion[]

  @@index([level, sectionType, mondaiNumber, isActive])
  @@index([passageId])
}

// JLPT Unit-Question Mapping
model JLPTUnitQuestion {
  unitId      String
  questionId  String

  unit        JLPTQuestionUnit @relation(fields: [unitId], references: [id], onDelete: Cascade)
  question    JLPTQuestion     @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([unitId, questionId])
  @@index([unitId])
  @@index([questionId])
}

// JLPT Test Attempt
model JLPTTestAttempt {
  id                String   @id @default(cuid())
  userId            String

  level             String
  testMode          String   @default("full_test")
  questionsSnapshot Json     // Embedded question IDs per section/mondai

  startedAt         DateTime @default(now())
  completedAt       DateTime?
  status            String   @default("in_progress")

  totalScore        Float?
  isPassed          Boolean?
  shuffleSeed       String   @default(cuid())

  user              User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  sectionSubmissions JLPTSectionSubmission[]
  userAnswers       JLPTUserAnswer[]
  sectionScores     JLPTSectionScore[]

  @@index([userId, startedAt(sort: Desc)])
  @@index([userId, status])
  @@index([userId, level, completedAt(sort: Desc)])
}

// JLPT Section Submission
model JLPTSectionSubmission {
  id              String   @id @default(cuid())
  testAttemptId   String
  sectionType     String

  submittedAt     DateTime @default(now())
  timeSpentSeconds Int?
  isLocked        Boolean  @default(true)

  testAttempt     JLPTTestAttempt @relation(fields: [testAttemptId], references: [id], onDelete: Cascade)

  @@unique([testAttemptId, sectionType])
  @@index([testAttemptId])
}

// JLPT User Answer
model JLPTUserAnswer {
  id              String   @id @default(cuid())
  testAttemptId   String
  questionId      String

  selectedAnswer  Int?     // 1-4 (choice_number, not display position)
  isCorrect       Boolean?
  isFlagged       Boolean  @default(false)

  timeSpentSeconds Int?
  answeredAt      DateTime @default(now())

  testAttempt     JLPTTestAttempt @relation(fields: [testAttemptId], references: [id], onDelete: Cascade)
  question        JLPTQuestion    @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([testAttemptId, questionId])
  @@index([testAttemptId])
  @@index([questionId, isCorrect])
}

// JLPT Section Score
model JLPTSectionScore {
  id              String  @id @default(cuid())
  testAttemptId   String
  sectionType     String

  rawScore        Int
  weightedScore   Float
  rawMaxScore     Float
  normalizedScore Float   // 0-60 scale

  isPassed        Boolean
  referenceGrade  String? // A, B, or C

  testAttempt     JLPTTestAttempt @relation(fields: [testAttemptId], references: [id], onDelete: Cascade)

  @@unique([testAttemptId, sectionType])
  @@index([testAttemptId])
  @@index([sectionType, normalizedScore(sort: Desc)])
}

// JLPT Question Analytics (Phase 1 - MVP)
model JLPTQuestionAnalytics {
  questionId            String   @id

  timesPresented        Int      @default(0)
  timesCorrect          Int      @default(0)
  successRate           Float?

  averageTimeSpent      Int?
  discriminationIndex   Float?

  isTooEasy             Boolean  @default(false)
  isTooHard             Boolean  @default(false)
  needsReview           Boolean  @default(false)

  lastUpdated           DateTime @default(now())

  question              JLPTQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([successRate, needsReview])
}

// JLPT Offline Test Result (Calculator)
model JLPTOfflineTestResult {
  id          String   @id @default(cuid())
  userId      String

  level       String
  source      String?  // Sou Matome, Kanzen Master, etc.
  userNote    String?  @db.Text

  totalScore  Float
  isPassed    Boolean

  rawInputs   Json     // Preserves original mondai scores

  createdAt   DateTime @default(now())

  user        User                      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sectionScores JLPTOfflineSectionScore[]

  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, level])
}

// JLPT Offline Section Score
model JLPTOfflineSectionScore {
  id                  String  @id @default(cuid())
  offlineTestResultId String
  sectionType         String

  rawScore            Int
  weightedScore       Float
  rawMaxScore         Float
  normalizedScore     Float

  isPassed            Boolean
  referenceGrade      String?

  offlineTestResult   JLPTOfflineTestResult @relation(fields: [offlineTestResultId], references: [id], onDelete: Cascade)

  @@unique([offlineTestResultId, sectionType])
  @@index([offlineTestResultId])
}

// JLPT Scoring Config (moved from static config for easier updates)
model JLPTScoringConfig {
  id                    String  @id @default(cuid())
  level                 String  // N1-N5
  sectionType           String

  rawMaxScore           Float
  overallPassingScore   Int
  sectionPassingScore   Int
  hasDualNormalization  Boolean @default(false)
  combinedWithSection   String?

  @@unique([level, sectionType])
  @@index([level, sectionType])
}
```

---

## 4. Migration Strategy

### 4.1 Migration File Structure

```
prisma/migrations/
└── 20250128_add_jlpt_tryout/
    └── migration.sql
```

### 4.2 Migration Steps

1. **Create new tables** (JLPT-specific)
2. **Add relations to existing tables** (User, Admin)
3. **Seed scoring config data**
4. **Create indexes**
5. **Add triggers** (question analytics auto-update)

### 4.3 Rollback Plan

All JLPT tables are **isolated** - can be dropped without affecting core Gengobot functionality:

```sql
-- Rollback script (if needed)
DROP TABLE IF EXISTS "JLPTOfflineSectionScore" CASCADE;
DROP TABLE IF EXISTS "JLPTOfflineTestResult" CASCADE;
DROP TABLE IF EXISTS "JLPTQuestionAnalytics" CASCADE;
DROP TABLE IF EXISTS "JLPTSectionScore" CASCADE;
DROP TABLE IF EXISTS "JLPTUserAnswer" CASCADE;
DROP TABLE IF EXISTS "JLPTSectionSubmission" CASCADE;
DROP TABLE IF EXISTS "JLPTTestAttempt" CASCADE;
DROP TABLE IF EXISTS "JLPTUnitQuestion" CASCADE;
DROP TABLE IF EXISTS "JLPTQuestionUnit" CASCADE;
DROP TABLE IF EXISTS "JLPTAnswerChoice" CASCADE;
DROP TABLE IF EXISTS "JLPTQuestion" CASCADE;
DROP TABLE IF EXISTS "JLPTPassage" CASCADE;
DROP TABLE IF EXISTS "JLPTScoringConfig" CASCADE;
```

---

## 5. Configuration Integration

### 5.1 JLPT Mondai Weights

**Location**: `src/config/jlpt-mondai.ts` (new file, no schema changes)

**Decision**: Keep weights in TypeScript config for:

- Type safety at compile time
- Faster lookups (in-memory)
- No database migrations for config changes
- Version controlled with code

### 5.2 Scoring Config Table

**Purpose**: Store level-specific pass/fail thresholds

**Why database?**: May need runtime updates by admins without code deployment

---

## 6. API Route Integration

### 6.1 Existing Auth Middleware

```typescript
// src/middleware/auth.ts (existing)
import { getServerSession } from 'next-auth';

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}
```

**Integration**: Use existing auth for all JLPT API routes

### 6.2 Existing Admin Middleware

```typescript
// src/middleware/admin-auth.ts (existing)
export async function requireAdmin() {
  // Check admin session
  // Return admin user
}
```

**Integration**: Use for JLPT question management APIs

---

## 7. Credit System Integration (Optional - Phase 2)

### 7.1 Current System

```prisma
model Subscription {
  creditsRemaining Int @default(0)
  // ...
}

model CreditTransaction {
  type   CreditTransactionType
  amount Int
  usageType UsageType?
  // ...
}
```

### 7.2 JLPT Integration (Future)

**Option A**: Free for all users (MVP approach)

- No credit deduction for JLPT tests
- Focus on core functionality first

**Option B**: Credit-based (Phase 2)

- Deduct credits per test attempt
- New `UsageType.JLPT_TEST`
- Free users: 1 test/month
- Paid users: Unlimited tests

**Recommendation**: Start with Option A (free for all) to maximize adoption

---

## 8. Analytics Integration

### 8.1 Existing Events

```typescript
// Current analytics events
await trackEvent({
  userId: user.id,
  eventName: 'task_started',
  properties: { taskId, difficulty },
});
```

### 8.2 New JLPT Events

```typescript
// New JLPT-specific events
await trackEvent({
  userId: user.id,
  eventName: 'jlpt_test_start',
  properties: { level: 'N5', testMode: 'full_test' },
});

await trackEvent({
  userId: user.id,
  eventName: 'jlpt_test_complete',
  properties: {
    level: 'N5',
    totalScore: 128,
    isPassed: true,
    duration: 3600, // seconds
  },
});

await trackEvent({
  userId: user.id,
  eventName: 'jlpt_calculator_use',
  properties: {
    level: 'N3',
    source: 'Sou Matome',
    totalScore: 105,
  },
});
```

---

## 9. Prisma Client Updates

### 9.1 Generation Command

```bash
# Generate updated Prisma Client after schema changes
npx prisma generate
```

### 9.2 Type-Safe Queries

```typescript
// Example: Create test attempt
const attempt = await prisma.jLPTTestAttempt.create({
  data: {
    userId: user.id,
    level: 'N5',
    questionsSnapshot: {
      /* ... */
    },
    shuffleSeed: generateSeed(),
  },
});

// Example: Get user's test history
const history = await prisma.jLPTTestAttempt.findMany({
  where: { userId: user.id },
  include: {
    sectionScores: true,
    user: { select: { name: true, proficiency: true } },
  },
  orderBy: { startedAt: 'desc' },
});
```

---

## 10. Database Size Considerations

### 10.1 Estimated Data Volume

| Table            | Rows (Year 1) | Avg Row Size | Total Size  |
| ---------------- | ------------- | ------------ | ----------- |
| JLPTQuestion     | ~2,000        | 1 KB         | 2 MB        |
| JLPTAnswerChoice | ~8,000        | 200 B        | 1.6 MB      |
| JLPTPassage      | ~500          | 5 KB         | 2.5 MB      |
| JLPTTestAttempt  | ~10,000       | 500 B        | 5 MB        |
| JLPTUserAnswer   | ~1,000,000    | 100 B        | 100 MB      |
| JLPTSectionScore | ~30,000       | 200 B        | 6 MB        |
| **Total**        |               |              | **~120 MB** |

**Conclusion**: Minimal database impact, well within PostgreSQL limits

### 10.2 Index Strategy

All high-frequency queries have indexes:

- User lookups by test history
- Question lookups by level/section/mondai
- Answer lookups for scoring

---

## 11. Deployment Checklist

### 11.1 Pre-Deployment

- [ ] Review schema changes with team
- [ ] Test migration on staging database
- [ ] Backup production database
- [ ] Update Prisma Client generation in CI/CD
- [ ] Test all existing Gengobot features (regression)

### 11.2 Deployment

- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Generate client: `npx prisma generate`
- [ ] Seed JLPT scoring config
- [ ] Verify new tables created
- [ ] Test JLPT API routes

### 11.3 Post-Deployment

- [ ] Monitor database performance
- [ ] Check for migration errors
- [ ] Verify existing features still work
- [ ] Test JLPT feature end-to-end

---

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
// Test Prisma queries
describe('JLPT Database Operations', () => {
  it('should create test attempt', async () => {
    const attempt = await prisma.jLPTTestAttempt.create({
      data: {
        /* ... */
      },
    });
    expect(attempt.id).toBeDefined();
  });

  it('should fetch user test history', async () => {
    const history = await prisma.jLPTTestAttempt.findMany({
      where: { userId: testUser.id },
    });
    expect(history.length).toBeGreaterThan(0);
  });
});
```

### 12.2 Integration Tests

- Test foreign key constraints
- Test cascade deletions
- Test unique constraints
- Test indexes performance

---

## 13. Performance Optimization

### 13.1 Query Optimization

```typescript
// Good: Select only needed fields
const attempts = await prisma.jLPTTestAttempt.findMany({
  select: {
    id: true,
    level: true,
    totalScore: true,
    completedAt: true,
  },
});

// Bad: Fetch all fields + deep includes
const attempts = await prisma.jLPTTestAttempt.findMany({
  include: {
    sectionScores: true,
    userAnswers: { include: { question: true } },
  },
});
```

### 13.2 Connection Pooling

```typescript
// prisma/client.ts (existing pattern)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 14. Future Enhancements

### 14.1 Potential Schema Additions (Phase 2+)

1. **Question Tags/Categories**

   ```prisma
   model JLPTQuestionTag {
     id         String @id @default(cuid())
     questionId String
     tag        String // "polite-form", "business-vocabulary", etc.
   }
   ```

2. **User Bookmarks**

   ```prisma
   model JLPTUserBookmark {
     userId     String
     questionId String
     note       String? @db.Text
     createdAt  DateTime @default(now())
   }
   ```

3. **Test Templates**
   ```prisma
   model JLPTTestTemplate {
     id              String @id @default(cuid())
     name            String
     level           String
     mondaiSelection Json // Custom mondai weights/counts
   }
   ```

---

## 15. Summary

### 15.1 Key Integration Points

✅ **User Authentication**: Existing `User` model (add relations only)
✅ **Admin Management**: Existing `Admin` model (add relations only)
✅ **Analytics**: Existing `AnalyticsEvent` model (new event types)
✅ **Credits**: Optional integration (Phase 2)

### 15.2 New Components

📦 **13 new tables** with `JLPT` prefix
📄 **1 new config file** (`jlpt-mondai.ts`)
🔧 **Isolated module** - can be removed without breaking core app

### 15.3 Migration Safety

🛡️ **Zero impact** on existing Gengobot features
🔄 **Easy rollback** - all JLPT tables can be dropped independently
📊 **Minimal database growth** (~120 MB in year 1)

---

**Related Documentation**:

- [MVP Development Plan](./MVP-DEVELOPMENT-PLAN.md) - Full implementation roadmap
- [Database Design v2](./01-database-design-v2.md) - Detailed table specifications
- [Test Level Details](./02-test-level-details.md) - JLPT structure per level
- [Scoring Calculation](./03-scoring-calculation.md) - Scoring algorithms

---

**Document Status**: Final
**Last Updated**: 2025-12-28
**Reviewed By**: **\*\*\*\***\_**\*\*\*\***
