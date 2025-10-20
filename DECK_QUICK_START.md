# Deck System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Apply Database Migration (2 minutes)

Open a terminal and run:

```bash
cd /Users/murifai/Code/Gengo\ Project/gengobot
npx prisma migrate dev --name add_deck_system
```

### Step 2: Start Development Server (1 minute)

```bash
npm run dev
```

### Step 3: Access Deck Management (1 minute)

1. Open http://localhost:3000
2. Sign in as an admin user
3. Navigate to **Admin → Decks**

### Step 4: Create Your First Deck (1 minute)

1. Click **"Create Deck"** button
2. Fill in:
   - **Name**: "JLPT N5 Vocabulary"
   - **Category**: Vocabulary
   - **Difficulty**: N5
   - **Description**: (optional)
3. Click **"Create Deck"**

---

## 📥 Import Cards from Excel

### Option 1: Use Template

1. In Decks page, click **"Download Template"**
2. Open the Excel file
3. Fill in cards in the appropriate sheets:
   - **Kanji Template**: Kanji, Meaning, Onyomi, Kunyomi, etc.
   - **Vocabulary Template**: Word, Meaning, Reading, Part of Speech, etc.
   - **Grammar Template**: Grammar Point, Meaning, Usage Note, etc.
4. Save the file
5. Click **"Import Excel"**
6. Select your file
7. Enter a deck name
8. Click **Import**

### Option 2: Create from Scratch

**Kanji Sheet Example:**
| Kanji | Meaning | Onyomi | Kunyomi | Example Sentence | Example Translation |
|-------|---------|--------|---------|------------------|---------------------|
| 日 | sun, day | ニチ、ジツ | ひ、か | 今日は良い天気です。 | Today's weather is good. |
| 月 | moon, month | ゲツ、ガツ | つき | 来月行きます。 | I will go next month. |

**Vocabulary Sheet Example:**
| Word | Meaning | Reading | Part of Speech | Example Sentence | Example Translation |
|------|---------|---------|----------------|------------------|---------------------|
| 食べる | to eat | たべる | Verb (Ichidan) | ご飯を食べます。 | I eat rice. |
| 飲む | to drink | のむ | Verb (Godan) | 水を飲みます。 | I drink water. |

**Grammar Sheet Example:**
| Grammar Point | Meaning | Usage Note | Example Sentence | Example Translation |
|---------------|---------|------------|------------------|---------------------|
| 〜ています | To be doing (progressive) | Verb て-form + います | 今、本を読んでいます。 | I am reading a book now. |
| 〜ました | Past tense (polite) | Verb ます-stem + ました | 昨日、映画を見ました。 | I watched a movie yesterday. |

---

## 📤 Export Decks

1. In Decks page, find your deck
2. Click the **Download icon** (⬇️) next to the deck
3. Excel file will download automatically
4. Open in Excel/Google Sheets/LibreOffice

---

## 🎴 Study Your Decks

### Current Implementation

The core deck management is complete. To study cards, you'll need to:

1. Navigate to the deck you want to study
2. Cards are stored and can be retrieved via API
3. Use the existing FlashcardSession component (integration pending)

### Planned Integration (See DECK_IMPLEMENTATION_SUMMARY.md)

```typescript
// Example of how to fetch cards for study
const response = await fetch(`/api/flashcards?deckId=${deckId}&dueForReview=true`);
const { flashcards } = await response.json();

// Cards due for review (nextReviewDate <= now)
const dueCards = flashcards.filter(
  card => !card.nextReviewDate || new Date(card.nextReviewDate) <= new Date()
);
```

---

## 🛠️ Common Operations

### Create Deck via API

```bash
curl -X POST http://localhost:3000/api/decks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Deck",
    "description": "Description here",
    "category": "Vocabulary",
    "difficulty": "N5",
    "isPublic": false
  }'
```

### List Decks

```bash
curl http://localhost:3000/api/decks
```

### Get Specific Deck

```bash
curl http://localhost:3000/api/decks/{deckId}
```

### Export Deck

```bash
curl http://localhost:3000/api/decks/{deckId}/export -o my-deck.xlsx
```

### Duplicate Deck

```bash
curl -X POST http://localhost:3000/api/decks/{deckId}/duplicate \
  -H "Content-Type: application/json" \
  -d '{"name": "My Deck (Copy)"}'
```

---

## 📁 File Locations

### Frontend Pages

- Deck List: `/admin/decks` → `src/app/admin/decks/page.tsx`
- Create Deck: `/admin/decks/new` → `src/app/admin/decks/new/page.tsx`
- View Deck: `/admin/decks/[deckId]` → **Pending Implementation**
- Edit Deck: `/admin/decks/[deckId]/edit` → **Pending Implementation**

### API Endpoints

- `GET /api/decks` - List decks
- `POST /api/decks` - Create deck
- `GET /api/decks/template` - Download template
- `POST /api/decks/import` - Import deck
- `GET /api/decks/[deckId]` - Get deck
- `PUT /api/decks/[deckId]` - Update deck
- `DELETE /api/decks/[deckId]` - Delete deck
- `POST /api/decks/[deckId]/duplicate` - Duplicate deck
- `GET /api/decks/[deckId]/export` - Export deck
- `GET /api/flashcards` - List flashcards
- `POST /api/flashcards` - Create flashcard
- `GET /api/flashcards/[id]` - Get flashcard
- `PUT /api/flashcards/[id]` - Update flashcard
- `DELETE /api/flashcards/[id]` - Delete flashcard

### Database Tables

- `Deck` - Flashcard collections
- `Flashcard` - Individual cards
- `FlashcardReview` - Review history
- `StudySession` - Study sessions

---

## 🎯 Completed Features

✅ Database schema with 4 new models
✅ Full CRUD API for decks and flashcards
✅ Excel import with auto-detection of card types
✅ Excel export grouped by card type
✅ Duplicate deck functionality
✅ Admin UI for deck management
✅ Search and filter (difficulty, category)
✅ Statistics dashboard
✅ Permission system (owner/admin/public)
✅ Spaced repetition fields
✅ Admin action logging

---

## 🔜 Pending Features

See [DECK_IMPLEMENTATION_SUMMARY.md](DECK_IMPLEMENTATION_SUMMARY.md) for details:

⏳ Deck view/edit pages
⏳ Flashcard editor component
⏳ Import dialog with drag-and-drop
⏳ FlashcardSession integration
⏳ User deck browser
⏳ Study statistics

---

## 🐛 Troubleshooting

### Migration fails

- Run in an **interactive terminal** (not through Claude Code)
- Verify `.env` has correct `DATABASE_URL`
- Check PostgreSQL is running

### "Deck not found" error

- Verify you're signed in as admin
- Check deck exists in database (use Prisma Studio)

### Import fails

- Verify Excel file has correct headers (use template)
- Check for required fields per card type
- Review error messages for specific issues

### Cards not showing

- Check `isActive = true` in database
- Verify `deckId` matches in query

---

## 📚 Learn More

- **Full Documentation**: [DECK_IMPLEMENTATION_SUMMARY.md](DECK_IMPLEMENTATION_SUMMARY.md)
- **Migration Guide**: [MIGRATION_INSTRUCTIONS.md](MIGRATION_INSTRUCTIONS.md)
- **Type Definitions**: `src/types/deck.ts`
- **API Routes**: `src/app/api/decks/` and `src/app/api/flashcards/`

---

## 💡 Tips

1. **Card Type Detection**: Excel import automatically detects card type from headers
2. **Mixed Decks**: You can have Kanji, Vocabulary, and Grammar cards in one deck
3. **Tags**: Use comma-separated values in Tags column (e.g., "JLPT N5, common, verbs")
4. **Public Decks**: Public decks are visible to all users but can only be edited by owner/admin
5. **Duplicate First**: Before editing a public deck, duplicate it to create your own version

---

**Ready to create your first deck? Start with Step 1 above!** 🎉
