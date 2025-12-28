# JLPT Score Calculation Fix

## Problem

When tests were completed, scores were not being calculated automatically:

1. ❌ `totalScore` was `null`
2. ❌ `isPassed` was `null`
3. ❌ `sectionScores` table was empty
4. ❌ `isCorrect` field in answers was not set
5. ❌ Results page showed blank scores

## Root Cause

The `submit-section` API endpoint only:
- Saved user answers
- Created section submission records
- Marked test as `completed`

But it **did NOT**:
- Calculate section scores
- Calculate total score
- Determine pass/fail status
- Mark answers as correct/incorrect

## Solution

### 1. Enhanced Section Submission API

Added automatic score calculation when the last section is submitted:

**Location**: `src/app/api/jlpt/tryout/submit-section/route.ts`

**What it does when all sections are complete**:

```typescript
// 1. Fetch all answers with questions
const allAnswers = await prisma.jLPTUserAnswer.findMany({
  where: { testAttemptId: attemptId },
  include: {
    question: {
      select: {
        sectionType: true,
        correctAnswer: true,
      },
    },
  },
});

// 2. Calculate scores for each section
for (const section of ['vocabulary', 'grammar_reading', 'listening']) {
  const sectionAnswers = allAnswers.filter(a => a.question.sectionType === section);
  const correctCount = sectionAnswers.filter(
    a => a.selectedAnswer === a.question.correctAnswer
  ).length;

  // Calculate normalized score (0-60 scale)
  const normalizedScore = (correctCount / sectionAnswers.length) * 60;

  // Save to JLPTSectionScore table
  await prisma.jLPTSectionScore.upsert({
    where: { testAttemptId_sectionType: { testAttemptId, sectionType: section } },
    create: {
      testAttemptId,
      sectionType: section,
      rawScore: correctCount,
      rawMaxScore: sectionAnswers.length,
      weightedScore: normalizedScore,
      normalizedScore,
      isPassed: normalizedScore >= 19,
      referenceGrade: /* A/B/C based on accuracy */,
    },
    update: { /* same fields */ },
  });
}

// 3. Calculate total score
const totalScore = Math.round((totalCorrect / totalQuestions) * 180);

// 4. Determine pass/fail (need ≥90/180 AND all sections ≥19/60)
const isPassed = totalScore >= 90 && allSectionsPassed;

// 5. Update test attempt
await prisma.jLPTTestAttempt.update({
  where: { id: attemptId },
  data: {
    status: 'completed',
    completedAt: new Date(),
    totalScore,
    isPassed,
  },
});

// 6. Mark all answers as correct/incorrect
for (const answer of allAnswers) {
  await prisma.jLPTUserAnswer.update({
    where: { id: answer.id },
    data: {
      isCorrect: answer.selectedAnswer === answer.question.correctAnswer,
    },
  });
}
```

### 2. Score Calculation Details

**Section Score (0-60 scale)**:
```typescript
normalizedScore = Math.round((correctAnswers / totalQuestions) * 60)
```

**Total Score (0-180 scale)**:
```typescript
totalScore = Math.round((totalCorrect / totalQuestions) * 180)
```

**Reference Grade**:
- **A**: Accuracy ≥ 80%
- **B**: Accuracy ≥ 60%
- **C**: Accuracy < 60%

**Passing Criteria**:
- Total score ≥ 90/180 (50%)
- AND all sections ≥ 19/60 (~32%)

### 3. Migration Script

Created `scripts/calculate-test-scores.ts` to calculate scores for existing completed tests.

**Usage**:
```bash
# Calculate for all completed tests without scores
npx tsx scripts/calculate-test-scores.ts

# Calculate for specific test
npx tsx scripts/calculate-test-scores.ts cmjpcy4y60001bte5tk8ckdmg
```

**Output Example**:
```
📊 Calculating scores for attempt: cmjpcy4y60001bte5tk8ckdmg

Found 91 answers

vocabulary:
  Total: 35 questions
  Correct: 9
  Accuracy: 25.7%
  Normalized Score: 15.4/60
  Grade: C
  Passed: No

grammar_reading:
  Total: 32 questions
  Correct: 7
  Accuracy: 21.9%
  Normalized Score: 13.1/60
  Grade: C
  Passed: No

listening:
  Total: 24 questions
  Correct: 3
  Accuracy: 12.5%
  Normalized Score: 7.5/60
  Grade: C
  Passed: No

Overall Results:
  Total Score: 38/180
  All Sections Passed: No
  Test Result: ❌ FAILED

✅ Updated 91 answers with correct/incorrect status
```

## Database Changes

### JLPTSectionScore Table

**Fields populated**:
- `rawScore`: Number of correct answers
- `rawMaxScore`: Total number of questions
- `weightedScore`: Currently same as normalizedScore
- `normalizedScore`: Score on 0-60 scale
- `isPassed`: Whether section passed (≥19/60)
- `referenceGrade`: 'A', 'B', or 'C'

### JLPTTestAttempt Table

**Fields updated**:
- `status`: 'completed'
- `completedAt`: Timestamp
- `totalScore`: Total score on 0-180 scale
- `isPassed`: Overall pass/fail status

### JLPTUserAnswer Table

**Fields updated**:
- `isCorrect`: Boolean indicating if answer was correct

## Results Page Integration

The results page now correctly displays:

✅ **Overall Summary**:
- Total score (e.g., "38/180")
- Pass/fail badge (合格/不合格)
- Completion date/time

✅ **Section Scores**:
- Normalized score for each section (e.g., "15.4/60")
- Accuracy percentage
- Correct/total questions
- Reference grade badge (A/B/C)

✅ **Question Review**:
- Grouped by mondai
- Shows selected vs correct answers
- Color-coded (green = correct, red = wrong)
- Icons for visual feedback (✓/✗)

## Testing Results

**Test Attempt**: `cmjpcy4y60001bte5tk8ckdmg` (N5)

**Before Fix**:
- Total Score: `null`
- Section Scores: `[]` (empty)
- Results page: Blank/error

**After Fix**:
- Total Score: `38/180`
- Section Scores: 3 entries with full data
- Results page: Fully functional with all data

## Future Improvements

1. **Weighted Scoring**: Implement actual JLPT weighted scoring algorithm
2. **Item Response Theory (IRT)**: Use difficulty-based scoring
3. **Score Caching**: Cache calculated scores to avoid recalculation
4. **Score Analytics**: Track score distribution and question difficulty
5. **Percentile Ranking**: Show user's percentile among all test-takers

## Related Files

- `src/app/api/jlpt/tryout/submit-section/route.ts` - Auto score calculation
- `scripts/calculate-test-scores.ts` - Migration script
- `src/app/(app)/jlpt/results/[attemptId]/page.tsx` - Results display
