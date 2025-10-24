# Database Migration Instructions - Deck System

## Overview

This document provides step-by-step instructions to apply the deck system database changes to your PostgreSQL database.

---

## Prerequisites

- PostgreSQL database running (Supabase)
- `.env` file configured with `DATABASE_URL`
- Node.js and npm installed
- Terminal access

---

## Migration Steps

### Step 1: Verify Database Connection

```bash
cd /Users/murifai/Code/Gengo\ Project/gengobot
npx prisma db pull
```

This should connect to your database successfully. If you see connection errors, verify your `.env` file.

### Step 2: Generate and Apply Migration

Run the migration command in an **interactive terminal** (not through Claude Code):

```bash
npx prisma migrate dev --name add_deck_system
```

**What this does:**

1. Creates a new migration file in `prisma/migrations/`
2. Generates SQL commands for the new tables
3. Applies the migration to your development database
4. Regenerates the Prisma Client

**Expected output:**

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"...

Applying migration `20250120000000_add_deck_system`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250120000000_add_deck_system/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### Step 3: Verify Migration

Open Prisma Studio to verify the new tables:

```bash
npx prisma studio
```

**Expected new tables:**

- `Deck` - Flashcard collections
- `Flashcard` - Individual cards
- `FlashcardReview` - Review history
- `StudySession` - Study sessions

### Step 4: Generate Prisma Client

If not automatically generated:

```bash
npx prisma generate
```

---

## What Gets Created

### New Tables

#### 1. **Deck**

Columns:

- `id` (String, Primary Key)
- `name` (String)
- `description` (Text, Nullable)
- `isPublic` (Boolean, Default: false)
- `category` (String, Nullable)
- `difficulty` (String, Nullable)
- `totalCards` (Integer, Default: 0)
- `studyCount` (Integer, Default: 0)
- `averageScore` (Float, Nullable)
- `createdBy` (String, Foreign Key → User.id)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

Indexes:

- `createdBy`
- `category`
- `difficulty`
- `isActive`
- `isPublic`

Constraints:

- Cascade delete when user is deleted

#### 2. **Flashcard**

Columns:

- `id` (String, Primary Key)
- `deckId` (String, Foreign Key → Deck.id)
- `cardType` (String: "kanji", "vocabulary", "grammar")
- Kanji fields: `kanji`, `kanjiMeaning`, `onyomi`, `kunyomi`
- Vocabulary fields: `word`, `wordMeaning`, `reading`, `partOfSpeech`
- Grammar fields: `grammarPoint`, `grammarMeaning`, `usageNote`
- Common fields: `exampleSentence`, `exampleTranslation`, `notes`, `tags` (JSON)
- Spaced repetition: `easeFactor` (Float, Default: 2.5), `interval` (Int, Default: 0), `repetitions` (Int, Default: 0), `nextReviewDate` (DateTime, Nullable), `lastReviewedAt` (DateTime, Nullable)
- `position` (Integer, Default: 0)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

Indexes:

- `deckId`
- `cardType`
- `nextReviewDate`
- `isActive`

Constraints:

- Cascade delete when deck is deleted

#### 3. **FlashcardReview**

Columns:

- `id` (String, Primary Key)
- `flashcardId` (String, Foreign Key → Flashcard.id)
- `sessionId` (String, Foreign Key → StudySession.id)
- `rating` (String: "again", "hard", "good", "easy")
- `responseTime` (Integer, Nullable)
- `easeFactor` (Float)
- `interval` (Integer)
- `reviewedAt` (DateTime)

Indexes:

- `flashcardId`
- `sessionId`
- `reviewedAt`

Constraints:

- Cascade delete when flashcard or session is deleted

#### 4. **StudySession**

Columns:

- `id` (String, Primary Key)
- `userId` (String, Foreign Key → User.id)
- `deckId` (String, Foreign Key → Deck.id)
- `cardsReviewed` (Integer, Default: 0)
- `cardsCorrect` (Integer, Default: 0)
- `averageResponseTime` (Float, Nullable)
- `againCount` (Integer, Default: 0)
- `hardCount` (Integer, Default: 0)
- `goodCount` (Integer, Default: 0)
- `easyCount` (Integer, Default: 0)
- `startTime` (DateTime)
- `endTime` (DateTime, Nullable)
- `isCompleted` (Boolean, Default: false)

Indexes:

- `userId`
- `deckId`
- `startTime`
- `isCompleted`

Constraints:

- Cascade delete when user or deck is deleted

### Updated Tables

#### **User**

New relations added:

- `decks` (One-to-Many → Deck)
- `studySessions` (One-to-Many → StudySession)

---

## Troubleshooting

### Error: "Database is not empty"

If you see warnings about data loss, the migration will prompt you to confirm. This is normal for new tables with no existing data.

### Error: "Connection refused"

Check your `DATABASE_URL` in `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### Error: "Migration already applied"

If the migration was already applied, you'll see:

```
No pending migrations to apply.
```

This is fine - your database is already up to date.

### Error: "Prisma Client out of sync"

Run:

```bash
npx prisma generate
```

---

## Rollback Instructions

If you need to rollback the migration:

### Option 1: Reset Database (Development Only)

**⚠️ WARNING: This deletes ALL data**

```bash
npx prisma migrate reset
```

This will:

1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run seed scripts (if configured)

### Option 2: Manual Rollback (Production Safe)

Create a new migration that reverses the changes:

```bash
npx prisma migrate dev --name remove_deck_system
```

Then manually edit the migration SQL to drop tables:

```sql
DROP TABLE IF EXISTS "FlashcardReview" CASCADE;
DROP TABLE IF EXISTS "StudySession" CASCADE;
DROP TABLE IF EXISTS "Flashcard" CASCADE;
DROP TABLE IF EXISTS "Deck" CASCADE;
```

---

## Post-Migration Testing

### 1. Test Database Connection

```bash
npx prisma studio
```

Verify you can see the new tables in Prisma Studio.

### 2. Test API Endpoints

```bash
# List decks
curl http://localhost:3000/api/decks

# Download template
curl http://localhost:3000/api/decks/template -o template.xlsx
```

### 3. Test UI

1. Navigate to http://localhost:3000/admin/decks
2. Click "Create Deck"
3. Fill out form and submit
4. Verify deck appears in list

---

## Production Deployment

For production deployment, use:

```bash
npx prisma migrate deploy
```

**DO NOT use `prisma migrate dev` in production.**

The `migrate deploy` command:

- Only applies pending migrations
- Does not prompt for input
- Safe for CI/CD pipelines

---

## Additional Commands

### View Migration Status

```bash
npx prisma migrate status
```

### View Migration History

```bash
ls -la prisma/migrations
```

### Format Schema

```bash
npx prisma format
```

### Validate Schema

```bash
npx prisma validate
```

---

## Next Steps

After successful migration:

1. ✅ Verify tables exist in Prisma Studio
2. ✅ Test API endpoints
3. ✅ Test admin UI (create deck, import, export)
4. ✅ Implement remaining UI components (see DECK_IMPLEMENTATION_SUMMARY.md)
5. ✅ Add seed data (optional)

---

## Support

If you encounter issues:

1. Check the Prisma logs in terminal
2. Verify database connection string
3. Check PostgreSQL server is running
4. Review the migration SQL in `prisma/migrations/`

---

**Migration Name**: `add_deck_system`
**Tables Added**: 4 (Deck, Flashcard, FlashcardReview, StudySession)
**Tables Modified**: 1 (User - added relations)
**Date**: 2025-10-20
