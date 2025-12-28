# JLPT Section Submission Error Fix

## Problem

Users were encountering a console error "Failed to submit section" when trying to submit a JLPT test section. Investigation revealed that the section had already been submitted, but the UI state wasn't properly synchronized with the database.

## Root Cause

1. **State Management Issue**: When resuming a test, the `submittedSections` state in the Zustand store was not being restored from the database
2. **No Prevention Check**: The UI allowed users to click "Submit Section" even if the section was already submitted
3. **Missing Navigation**: After all sections were submitted, users weren't automatically redirected to the results page
4. **Poor Error Messages**: Generic error messages didn't help users understand what went wrong

## Changes Made

### 1. Auto-Complete Test Status (submit-section/route.ts)

**Added logic to mark test as completed when all sections are submitted:**

```typescript
// Check if all sections are now submitted
const allSubmissions = await prisma.jLPTSectionSubmission.findMany({
  where: { testAttemptId: attemptId },
  select: { sectionType: true },
});

const submittedSections = new Set(allSubmissions.map(s => s.sectionType));
const allSections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
const allSectionsCompleted = allSections.every(s => submittedSections.has(s));

// If all sections are completed, update attempt status
if (allSectionsCompleted) {
  await prisma.jLPTTestAttempt.update({
    where: { id: attemptId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });
}
```

**Impact**: Test attempts are automatically marked as `'completed'` when the last section is submitted, allowing the results page to load properly.

### 2. Enhanced API Endpoint (attempt/[attemptId]/route.ts)

**Before:**
```typescript
const attempt = await prisma.jLPTTestAttempt.findUnique({
  where: { id: attemptId },
});
```

**After:**
```typescript
const attempt = await prisma.jLPTTestAttempt.findUnique({
  where: { id: attemptId },
  include: {
    sectionSubmissions: {
      select: {
        sectionType: true,
        submittedAt: true,
      },
    },
  },
});
```

**Impact**: The API now returns which sections have been submitted, allowing the frontend to restore state correctly.

### 2. State Restoration on Test Resume (page.tsx)

**Added:**
- Check if test status is 'completed' and redirect to results immediately
- Restore `submittedSections` from database when resuming a test
- Navigate to the first unsubmitted section automatically
- Redirect to results if all sections are already submitted

```typescript
// Restore submitted sections state
if (data.sectionSubmissions && data.sectionSubmissions.length > 0) {
  const submittedSectionTypes = new Set<SectionType>();
  data.sectionSubmissions.forEach((submission: { sectionType: SectionType }) => {
    submitSection(submission.sectionType);
    submittedSectionTypes.add(submission.sectionType);
  });

  // Navigate to the first unsubmitted section
  const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
  const nextUnsubmittedSection = sections.find(s => !submittedSectionTypes.has(s));

  if (nextUnsubmittedSection) {
    setCurrentSection(nextUnsubmittedSection);
  } else {
    // All sections submitted, go to results
    toast.info('すべてのセクションが完了しています。結果ページに移動します。');
    router.push(`/jlpt/results/${attemptId}`);
  }
}
```

### 3. Prevent Double Submission (page.tsx)

**Added early return check in `handleSubmitSection`:**
```typescript
// Check if section is already submitted
if (submittedSections.has(currentSection)) {
  toast.error('このセクションは既に提出されています');
  // Move to next section or results
  const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
  const currentIndex = sections.indexOf(currentSection);
  if (currentIndex < sections.length - 1) {
    const nextSection = sections[currentIndex + 1];
    setCurrentSection(nextSection);
    setCurrentQuestionIndex(0);
    setViewedMondais(new Set());
  } else {
    router.push(`/jlpt/results/${sessionAttemptId}`);
  }
  return;
}
```

### 4. Improved Error Logging (submit-section/route.ts)

**Enhanced error details:**
```typescript
catch (error) {
  console.error('Error submitting section:', error);
  console.error('Error details:', {
    attemptId,
    sectionType,
    answersCount: answers?.length,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    errorStack: error instanceof Error ? error.stack : undefined,
  });
  return NextResponse.json(
    {
      error: 'セクションの提出中にエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}
```

### 5. Better Frontend Error Handling (page.tsx)

**Parse and display detailed error messages:**
```typescript
if (!response.ok) {
  const errorData = await response.json();
  console.error('Submit section error:', errorData);
  throw new Error(errorData.details || errorData.error || 'Failed to submit section');
}
```

```typescript
catch (error) {
  console.error('Error submitting section:', error);
  const errorMessage = error instanceof Error ? error.message : 'セクションの提出に失敗しました';
  toast.error(errorMessage);
}
```

## User Experience Improvements

### Before:
1. User completes all sections
2. Tries to navigate back and submit again
3. Gets generic error: "Failed to submit section"
4. Confused about what went wrong

### After:
1. User completes all sections
2. Automatically redirected to results page
3. If they navigate back to test:
   - Test status is checked
   - Redirected to results if completed
   - If in progress, navigated to next unsubmitted section
4. If they somehow try to resubmit:
   - Clear error: "このセクションは既に提出されています" (This section has already been submitted)
   - Automatically navigated to next section or results

## Testing

To test the fix:

1. **Start a new test**: Create a test at `/jlpt/tryout`
2. **Complete a section**: Answer questions and submit
3. **Try to navigate back**: Use browser back button
4. **Verify**: Should be redirected to next section or results
5. **Resume test**: Refresh page or close and reopen
6. **Verify**: Should resume at correct section with proper state

## Database Queries for Debugging

```typescript
// Check test attempt status
await prisma.jLPTTestAttempt.findUnique({
  where: { id: attemptId },
  include: { sectionSubmissions: true }
});

// Check submitted sections
await prisma.jLPTSectionSubmission.findMany({
  where: { testAttemptId: attemptId }
});
```

## Migration Script

For existing tests that have all sections submitted but status is still `'in_progress'`, run:

```bash
npx tsx scripts/fix-completed-tests.ts
```

This script will:
1. Find all tests with status `'in_progress'`
2. Check if all three sections are submitted
3. Update status to `'completed'` with `completedAt` set to the last submission time

## Related Files

- `/src/app/(app)/jlpt/tryout/[attemptId]/page.tsx` - Main test page
- `/src/app/api/jlpt/tryout/attempt/[attemptId]/route.ts` - Fetch attempt API
- `/src/app/api/jlpt/tryout/submit-section/route.ts` - Submit section API
- `/src/app/api/jlpt/tryout/results/[attemptId]/route.ts` - Results API
- `/src/hooks/jlpt/useTestSession.ts` - State management
- `/scripts/test-submit-section.ts` - Debug script
- `/scripts/fix-completed-tests.ts` - Migration script

## Future Improvements

1. **Visual indicator**: Show which sections are completed in the UI
2. **Progress bar**: Add a progress indicator showing section completion
3. **Prevent navigation**: Lock submitted sections so users can't navigate back
4. **Better results flow**: Automatically calculate and display results after last section
