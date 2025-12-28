# JLPT Question Seed Script

## Overview

The `seed-jlpt-questions.ts` script creates sample JLPT test questions for all levels (N5-N1) to test the JLPT tryout functionality.

## What It Creates

### Questions per Level (38 total per level)

1. **Vocabulary (mondai1)**: 10 questions
   - Section: `vocabulary`
   - Question type: `standard`
   - Questions: Single letters (A-J)
   - Choices: a, b, c, d

2. **Grammar (mondai2)**: 10 questions
   - Section: `grammar_reading`
   - Question type: `standard`
   - Questions: Single letters (K-T)
   - Choices: a, b, c, d

3. **Reading (mondai3)**: 8 questions
   - Section: `grammar_reading`
   - Question type: `reading_comp`
   - 2 passages with 4 questions each
   - Questions: Single letters (U-Z, etc.)
   - Choices: a, b, c, d

4. **Listening (mondai4)**: 10 questions
   - Section: `listening`
   - Question type: `audio`
   - Audio files: Uses existing `/audio/*.mp3` files
   - Questions: Single letters
   - Choices: a, b, c, d

### Total Statistics

- **Total Questions**: 190 (38 questions × 5 levels)
- **Total Answer Choices**: 760 (4 choices × 190 questions)
- **Total Passages**: 10 (2 passages × 5 levels)
- **Total Analytics Records**: 190 (1 per question)

## Usage

### Prerequisites

1. Ensure database is running
2. Run schema migrations:
   ```bash
   npx prisma db push
   ```

### Run Seed Script

```bash
npx tsx scripts/seed-jlpt-questions.ts
```

### Re-run Script

The script will automatically:
- Clear existing JLPT questions and related data
- Create fresh seed data
- Can be run multiple times safely

## Data Structure

### Question Format

```typescript
{
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
  sectionType: 'vocabulary' | 'grammar_reading' | 'listening',
  mondaiNumber: 1 | 2 | 3 | 4,
  questionNumber: 1-10,
  questionText: 'A', // Single letter
  correctAnswer: 1-4, // Rotates through choices
  difficulty: 'medium',
  isActive: true
}
```

### Answer Choices Format

```typescript
{
  choiceNumber: 1-4, // Static answer key
  choiceType: 'text',
  choiceText: 'a' | 'b' | 'c' | 'd',
  orderIndex: 0-3
}
```

### Passage Format (Reading)

```typescript
{
  contentType: 'text',
  contentText: 'Reading passage 1 for N5 level.',
  title: 'N5 Reading 1',
  isActive: true
}
```

### Audio Questions (Listening)

Uses existing audio files from `/public/audio/`:
- alloy.mp3
- echo.mp3
- nova.mp3
- shimmer.mp3
- fable.mp3
- onyx.mp3
- coral.mp3
- sage.mp3
- verse.mp3
- ballad.mp3

## Testing the Data

### View in Prisma Studio

```bash
npx prisma studio
```

Navigate to:
- `JLPTQuestion` - View all questions
- `JLPTAnswerChoice` - View answer choices
- `JLPTPassage` - View reading passages
- `JLPTQuestionAnalytics` - View analytics records

### Query Examples

**Count questions by level:**
```sql
SELECT level, COUNT(*) as count
FROM "JLPTQuestion"
GROUP BY level
ORDER BY level DESC;
```

**Get questions with choices:**
```typescript
const questions = await prisma.jLPTQuestion.findMany({
  where: { level: 'N5', sectionType: 'vocabulary' },
  include: { answerChoices: true }
});
```

**Get reading questions with passages:**
```typescript
const reading = await prisma.jLPTQuestion.findMany({
  where: {
    level: 'N5',
    sectionType: 'grammar_reading',
    mondaiNumber: 3
  },
  include: {
    answerChoices: true,
    passage: true
  }
});
```

## Notes

- Questions use simple single letters for easy identification
- Answer choices rotate through 1-4 to ensure variety
- All questions are marked as `medium` difficulty
- Analytics records are initialized with zero counts
- Listening questions reference existing audio files
- Reading passages are simple text for testing purposes

## Next Steps

After seeding, you can:

1. Start a test attempt through the UI
2. Test question shuffling with the `shuffle-choices.ts` utility
3. Submit answers and verify scoring
4. View results and analytics
5. Replace placeholder questions with real JLPT content

## Troubleshooting

### Table doesn't exist error

Run database migrations first:
```bash
npx prisma db push
```

### Admin not found

The script will automatically create a seed admin if none exists.

### Clear all data

To start fresh:
```bash
npx tsx scripts/seed-jlpt-questions.ts
```

The script handles cleanup automatically.
