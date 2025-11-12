# Task Continuation Fixes

## Issues Fixed

### Issue 1: Incorrect Message Count (All Attempts vs. Current)

**Problem**: Dialog was showing total messages from ALL previous attempts (e.g., 38 messages) instead of just the current incomplete attempt.

**Root Cause**: API query parameter `incomplete=true` was not properly handled in the GET endpoint.

**Solution**:

- Updated API to properly recognize `incomplete` query parameter
- API now filters for `isCompleted=false` when `incomplete=true` is passed
- Result is ordered by `startTime desc`, so most recent incomplete attempt is returned first
- Message count shown in dialog is now accurate to the CURRENT incomplete attempt only

**Files Modified**:

- [src/app/api/task-attempts/route.ts](../src/app/api/task-attempts/route.ts) - Added `incomplete` parameter handling

**Code Changes**:

```typescript
// Before: Only handled isCompleted parameter
if (isCompleted !== null) {
  where.isCompleted = isCompleted === 'true';
}

// After: Handles both incomplete and isCompleted
if (incomplete === 'true') {
  where.isCompleted = false;
} else if (isCompleted !== null) {
  where.isCompleted = isCompleted === 'true';
}
```

---

### Issue 2: Old Attempt Data Not Cleared When Starting Fresh

**Problem**: When starting a new attempt, old attempt's localStorage persisted, and old attempt remained in "incomplete" state.

**Requirements**:

1. Clear localStorage for old attempt when user chooses "Start Fresh"
2. Mark old attempt as "abandoned" in database
3. Preserve conversation history for statistics/analytics
4. Create clean new attempt with empty messages

**Solution**: Two-part approach

#### Part 1: Clear localStorage on Dialog Action

When user clicks "Start Fresh (New Attempt)":

1. Remove old attempt's localStorage key immediately
2. This prevents localStorage confusion between old and new attempts
3. New attempt will start with fresh localStorage

**Files Modified**:

- [src/app/dashboard/tasks/[taskId]/pre-study/PreTaskStudyClient.tsx](../src/app/dashboard/tasks/[taskId]/pre-study/PreTaskStudyClient.tsx)

**Code Changes**:

```typescript
const handleStartNew = () => {
  // Clear localStorage for the old attempt before starting new
  if (existingAttempt) {
    const storageKey = `chat_messages_${existingAttempt.id}`;
    try {
      localStorage.removeItem(storageKey);
      console.log('[PreTaskStudy] Cleared localStorage for old attempt:', existingAttempt.id);
    } catch (error) {
      console.error('[PreTaskStudy] Failed to clear localStorage:', error);
    }
  }

  setShowResumeDialog(false);
  setExistingAttempt(null);
  // User will go through pre-task steps and then create new attempt
};
```

#### Part 2: Mark Old Attempts as Abandoned

When creating new attempt with `forceNew=true`:

1. API marks ALL existing incomplete attempts for this user+task as "abandoned"
2. Sets `isCompleted=true` and `endTime=now()`
3. Preserves `conversationHistory` for statistics
4. Then creates fresh new attempt

**Files Modified**:

- [src/app/api/task-attempts/route.ts](../src/app/api/task-attempts/route.ts)

**Code Changes**:

```typescript
} else {
  console.log('[Task Attempt POST] forceNew=true, marking old incomplete attempts as abandoned');

  // Mark any existing incomplete attempts as completed (abandoned)
  const abandonedCount = await prisma.taskAttempt.updateMany({
    where: {
      userId: user.id,
      taskId,
      isCompleted: false,
    },
    data: {
      isCompleted: true,
      endTime: new Date(),
      // The conversation history remains intact for statistics
    },
  });

  console.log('[Task Attempt POST] Marked', abandonedCount.count, 'old attempt(s) as abandoned');
}
```

---

## Technical Details

### Database State Management

**Before Fix**:

```
User starts task → Creates attempt A (incomplete)
User has 10 messages in attempt A
User starts same task again → Returns attempt A (still shows 10 messages)
User starts yet again → Still returns attempt A (still shows 10 messages)
Result: Can't create new attempts, stuck with old one
```

**After Fix**:

```
User starts task → Creates attempt A (incomplete)
User has 10 messages in attempt A
User chooses "Start Fresh" →
  - localStorage cleared for attempt A
  - Goes through pre-task steps
  - Attempt A marked abandoned (isCompleted=true, endTime=now)
  - Creates attempt B (incomplete, empty messages)
  - Fresh localStorage for attempt B
Result: Clean slate, old data preserved for stats
```

### localStorage Cleanup Strategy

**Storage Keys Pattern**: `chat_messages_{attemptId}`

**Cleanup Triggers**:

1. **User chooses "Start Fresh"** → Immediate removal of old attempt's key
2. **User completes task** → Could add cleanup (future enhancement)
3. **Automatic cleanup** → Existing quota management keeps 10 most recent chats

**Why Not Clear on API Side?**:

- localStorage is client-side only
- API doesn't have access to localStorage
- Client-side cleanup is more efficient
- Immediate feedback to user

### Statistics Preservation

**Data Preserved**:

- `conversationHistory` - Full message history
- `startTime` - When attempt began
- `endTime` - When abandoned/completed
- `retryCount` - Attempt number
- All assessment scores (if any)

**Use Cases**:

- Analytics: Track task completion rates
- Insights: Average attempts per task
- Learning: Identify difficult tasks (high retry count)
- Progress: User improvement over time

---

## Behavior Summary

### Message Count Display

| Scenario                                                  | Message Count Shown | Source                     |
| --------------------------------------------------------- | ------------------- | -------------------------- |
| First incomplete attempt with 5 messages                  | 5                   | Current incomplete attempt |
| Second incomplete attempt (after abandon) with 0 messages | Dialog not shown    | No messages = no dialog    |
| User completes task, starts again                         | Dialog not shown    | No incomplete attempts     |
| User has 2 incomplete attempts (shouldn't happen)         | Most recent one     | Ordered by startTime desc  |

### localStorage State

| User Action       | Old Attempt localStorage | New Attempt localStorage       |
| ----------------- | ------------------------ | ------------------------------ |
| Continue existing | Kept and used            | N/A - same attempt             |
| Start fresh       | Removed immediately      | Created fresh on first message |
| Cancel dialog     | Kept unchanged           | N/A                            |

### Database State

| User Action       | Old Attempt Status            | New Attempt Created |
| ----------------- | ----------------------------- | ------------------- |
| Continue existing | isCompleted=false             | No                  |
| Start fresh       | isCompleted=true, endTime=now | Yes, fresh attempt  |
| Cancel dialog     | isCompleted=false             | No                  |

---

## Testing Checklist

### Message Count Accuracy

- [x] First attempt shows correct count (only current attempt)
- [x] Multiple attempts don't sum up message counts
- [x] API filters by incomplete=true correctly
- [x] Most recent incomplete attempt is returned

### localStorage Cleanup

- [x] Old attempt localStorage cleared when choosing "Start Fresh"
- [x] New attempt starts with empty localStorage
- [x] localStorage keys don't conflict between attempts
- [x] Quota management still works (keeps 10 most recent)

### Database Integrity

- [x] Old attempts marked as abandoned (isCompleted=true)
- [x] Old attempts have endTime set
- [x] Old attempts preserve conversationHistory
- [x] New attempts created with empty messages
- [x] retryCount increments properly

### User Experience

- [x] Dialog shows accurate message count
- [x] "Continue" works without data loss
- [x] "Start Fresh" gives clean slate
- [x] No confusion between old/new attempts
- [x] Statistics still trackable

---

## Edge Cases Handled

### Multiple Incomplete Attempts (Race Condition)

**Scenario**: User somehow has 2+ incomplete attempts (shouldn't happen)
**Handling**:

- Returns most recent (ordered by startTime desc)
- When starting fresh, ALL incomplete attempts marked abandoned

### localStorage Quota Exceeded

**Scenario**: localStorage is full
**Handling**:

- Try-catch on localStorage operations
- Error logged but doesn't block flow
- Existing quota management clears old chats

### API Failure During Cleanup

**Scenario**: API fails to mark old attempt as abandoned
**Handling**:

- User still gets new attempt (attempt creation is separate transaction)
- Old attempt will still appear on next visit (retry opportunity)
- No data loss

### Browser Without localStorage

**Scenario**: localStorage disabled or unavailable
**Handling**:

- Try-catch on all localStorage operations
- Dialog still works (database-driven)
- Messages not persisted across reloads (graceful degradation)

---

## Performance Impact

### API Changes

- **GET /api/task-attempts**: +1 query parameter check (negligible)
- **POST /api/task-attempts**: +1 updateMany operation when forceNew=true (~5-10ms)
- **Overall**: Minimal performance impact, operations are simple and indexed

### Client Changes

- **localStorage.removeItem()**: Synchronous, <1ms
- **Overall**: No noticeable performance impact

### Database Operations

```sql
-- Old flow (forceNew=false)
SELECT * FROM TaskAttempt WHERE userId=? AND taskId=? AND isCompleted=false
-- Returns existing if found

-- New flow (forceNew=true)
UPDATE TaskAttempt SET isCompleted=true, endTime=NOW()
WHERE userId=? AND taskId=? AND isCompleted=false;
-- Marks old as abandoned

INSERT INTO TaskAttempt (...) VALUES (...);
-- Creates new attempt
```

**Impact**: One additional UPDATE query, properly indexed, minimal overhead.

---

## Future Enhancements

### Potential Improvements

1. **Attempt History UI** - Show list of all previous attempts with timestamps
2. **Selective Data Transfer** - Option to copy specific messages to new attempt
3. **Auto-Abandon Old Attempts** - Cron job to abandon incomplete attempts >7 days old
4. **Analytics Dashboard** - Visualize retry counts, success rates, etc.
5. **Export History** - Allow users to export their conversation history

### Migration Considerations

If implementing new features, consider:

- Backward compatibility with existing attempts
- Database migration scripts if schema changes
- localStorage version management for new data structures

---

## Related Documentation

- [TASK_CONTINUATION.md](./TASK_CONTINUATION.md) - Full feature documentation
- [CHAT_PERSISTENCE.md](./CHAT_PERSISTENCE.md) - Chat persistence system
