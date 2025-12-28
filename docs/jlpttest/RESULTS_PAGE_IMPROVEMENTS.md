# JLPT Results Page Improvements

## Overview

Comprehensive improvements to the JLPT test results page addressing dark theme support, question organization, and visual feedback for correct/incorrect answers.

## Issues Fixed

### 1. Dark Theme Support ❌ → ✅

**Problem**: Dark theme showed white background with white text (unreadable)

**Solution**: Replaced all hardcoded color classes with theme-aware utility classes:

- `text-gray-600` → `text-muted-foreground`
- `text-gray-900` → uses default foreground (theme-aware)
- `bg-gray-50` → `bg-muted`
- `bg-white` → `bg-card`
- Added `dark:` variants to all colored elements (green/red badges, borders, backgrounds)

**Example**:
```tsx
// Before
<div className="bg-gray-50 text-gray-900">

// After
<div className="bg-muted">
```

### 2. Question Organization by Mondai ❌ → ✅

**Problem**: All questions displayed in a flat list, not grouped by mondai

**Solution**:
- Created `groupByMondai()` utility function to organize questions
- Sorts questions within each mondai by question number
- Displays mondai headers with question count badges
- Indents questions within each mondai for visual hierarchy

**Implementation**:
```tsx
const groupByMondai = (answers: Answer[]) => {
  const grouped = new Map<number, Answer[]>();

  answers.forEach(answer => {
    if (!grouped.has(answer.mondaiNumber)) {
      grouped.set(answer.mondaiNumber, []);
    }
    grouped.get(answer.mondaiNumber)!.push(answer);
  });

  // Sort questions within each mondai by questionNumber
  grouped.forEach((questions, mondaiNumber) => {
    grouped.set(
      mondaiNumber,
      questions.sort((a, b) => a.questionNumber - b.questionNumber)
    );
  });

  return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
};
```

### 3. Question Numbering ❌ → ✅

**Problem**: Question numbers not displayed correctly within mondai

**Solution**:
- Questions now numbered sequentially within each mondai (第1問, 第2問, etc.)
- Uses array index within the sorted mondai questions
- Clear visual hierarchy: Mondai number → Question number within mondai

**Before**: `問1 - 第5問` (confusing)
**After**:
```
問題 1
  第1問
  第2問
  第3問
問題 2
  第1問
  第2問
```

### 4. Visual Feedback for Answers ❌ → ✅

**Problem**: Unclear which answer was selected and which was correct

**Solution**: Color-coded answer choices with icons

**Color Scheme**:
- ✅ **Green border + background**: Correct answer (always shown)
- ❌ **Red border + background**: User's incorrect selection (if wrong)
- ⚪ **Neutral**: Other choices

**Features**:
- Green check icon (✓) on correct answer
- Red X icon (✗) on user's wrong answer
- Dark theme support for all colors
- Clear visual distinction between correct, incorrect, and unselected

**Implementation**:
```tsx
{answer.answerChoices.map(choice => {
  const isCorrect = choice.choiceNumber === answer.correctAnswer;
  const isSelected = choice.choiceNumber === answer.selectedAnswer;
  const isWrong = isSelected && !isCorrect;

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-2 flex items-start gap-2 transition-colors',
        isCorrect && 'border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-950/30',
        isWrong && 'border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950/30',
        !isCorrect && !isWrong && 'border-border bg-card'
      )}
    >
      <span className="font-semibold min-w-6">{choice.choiceNumber}.</span>
      <span className="flex-1">{choice.choiceText}</span>
      {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />}
      {isWrong && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />}
    </div>
  );
})}
```

## Visual Improvements

### Question Card Design

**Correct Answer Card**:
- Green border + light green background
- ✓ Green badge "正解" in header
- Correct answer choice highlighted in green with check icon

**Incorrect Answer Card**:
- Red border + light red background
- ✗ Red badge "不正解" in header
- User's wrong answer in red with X icon
- Correct answer still shown in green

### Mondai Organization

```
┌─ 問題 1 ─────────── 3問 ─┐
│                           │
│  ┌─ 第1問 ──── ✓ 正解 ─┐ │
│  │ Question content     │ │
│  │ [Choices with icons] │ │
│  └──────────────────────┘ │
│                           │
│  ┌─ 第2問 ──── ✗ 不正解 ┐ │
│  │ Question content     │ │
│  │ [Choices with icons] │ │
│  └──────────────────────┘ │
└───────────────────────────┘
```

## Dark Theme Colors Reference

### Badges & Status
- **Pass/Fail Badge**:
  - Light: `bg-green-100 text-green-800 border-green-300`
  - Dark: `dark:bg-green-900/30 dark:text-green-300 dark:border-green-700`

- **Correct Badge**:
  - Light: `bg-green-100 text-green-800 border-green-300`
  - Dark: `dark:bg-green-900/30 dark:text-green-300 dark:border-green-700`

- **Incorrect Badge**:
  - Light: `bg-red-100 text-red-800 border-red-300`
  - Dark: `dark:bg-red-900/30 dark:text-red-300 dark:border-red-700`

### Answer Choices
- **Correct Answer**:
  - Light: `border-green-500 bg-green-50`
  - Dark: `dark:border-green-700 dark:bg-green-950/30`

- **Wrong Selection**:
  - Light: `border-red-500 bg-red-50`
  - Dark: `dark:border-red-700 dark:bg-red-950/30`

- **Neutral Choice**:
  - Both: `border-border bg-card` (theme-aware)

### Backgrounds
- **Score Card**: `bg-muted` (theme-aware)
- **Time Card**:
  - Light: `bg-blue-50 border-blue-200`
  - Dark: `dark:bg-blue-900/20 dark:border-blue-800`
- **Passage Box**: `bg-card` (theme-aware)
- **Explanation Box**:
  - Light: `bg-blue-50 border-blue-200`
  - Dark: `dark:bg-blue-900/20 dark:border-blue-800`

## Testing

### Light Theme ✅
- All colors readable
- Clear distinction between correct/incorrect
- Proper contrast ratios

### Dark Theme ✅
- No white-on-white text issues
- All elements visible with proper contrast
- Green/red colors adjusted for dark backgrounds

### Question Organization ✅
- Questions properly grouped by mondai
- Sequential numbering within each mondai
- Clear visual hierarchy

### Answer Feedback ✅
- Correct answers always highlighted in green
- User's wrong answers shown in red
- Icons provide additional visual cues

## Files Modified

- [src/app/(app)/jlpt/results/[attemptId]/page.tsx](../../src/app/(app)/jlpt/results/[attemptId]/page.tsx)

## User Experience

### Before:
1. Dark theme unreadable (white on white)
2. Questions in flat list (confusing navigation)
3. Unclear which answer was selected
4. Difficult to identify mistakes

### After:
1. ✅ Perfect dark theme support
2. ✅ Questions organized by mondai with headers
3. ✅ Clear color coding: Green = correct, Red = wrong
4. ✅ Icons reinforce correct/incorrect status
5. ✅ Easy to review mistakes and learn

## Future Enhancements

1. **Statistics per Mondai**: Show accuracy % for each mondai
2. **Filter by Correctness**: Toggle to show only incorrect answers
3. **Export to PDF**: Download results with formatting
4. **Comparison with Other Tests**: Track improvement over time
5. **Weakness Analysis**: Identify weak question types or grammar points
