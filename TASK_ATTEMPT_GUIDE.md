# Task Attempt System - User Guide

## Overview

The task attempt system is designed to **preserve your progress** and allow you to resume tasks where you left off.

## How It Works

### Starting a Task

When you click "Start Task" (or skip pre-study), the system:

1. **Checks for existing incomplete attempts** for that task
2. If found: **Resumes the existing attempt** with all conversation history
3. If not found: **Creates a new attempt** with empty conversation history

### Resume Behavior

This is **intentional behavior** to prevent data loss:
- ✅ Your conversation history is preserved
- ✅ You can continue where you left off
- ✅ No progress is lost if you accidentally close the browser

### Expected Flow

```
User Flow 1: First Time
┌─────────────────┐
│  Select Task    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pre-Study      │  ← View flashcards
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Start Task     │  ← Creates NEW attempt
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chat Interface │  ← Empty history
└─────────────────┘

User Flow 2: Resume
┌─────────────────┐
│  Select Task    │  ← Same task
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pre-Study      │  ← View flashcards again
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Start Task     │  ← RESUMES existing attempt
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chat Interface │  ← Shows previous 2 messages
└─────────────────┘
```

## Common Scenarios

### Scenario 1: I want to continue my previous conversation
✅ **Just start the task** - The system will automatically resume with your conversation history intact.

### Scenario 2: I want to start the task fresh
You have two options:

**Option A: Complete the current attempt first**
1. Open the existing attempt
2. Click "Complete Task"
3. Review your results
4. Start the task again (will create new attempt)

**Option B: Clear incomplete attempts (Admin/Testing)**
Run the cleanup script:
```bash
npx tsx scripts/clear-incomplete-attempts.ts
```
⚠️ **WARNING**: This deletes ALL incomplete attempts for ALL users!

## Debugging

### Check Your Task Attempts
Run this script to see all your attempts:
```bash
npx tsx scripts/check-task-attempts.ts
```

Output shows:
- Number of incomplete vs completed attempts
- Message count in each attempt
- Which attempts will be resumed

### Activate Inactive Tasks
If you get "Task is not active" error:
```bash
npx tsx scripts/activate-all-tasks.ts
```

### View Logs in Browser Console
Look for these log prefixes:
- `[PreTaskStudy]` - Task start flow
- `[TaskAttemptClient]` - Chat interface loading
- `[Task Attempt POST]` - Server-side attempt creation

## Database Schema

```typescript
TaskAttempt {
  id: string
  userId: string
  taskId: string
  startTime: DateTime
  endTime: DateTime?

  // Conversation history (persisted in database)
  conversationHistory: {
    messages: [{
      role: 'user' | 'assistant'
      content: string
      timestamp: string
    }]
    completedObjectives: string[]
    startedAt: string
  }

  isCompleted: boolean  // false = will be resumed
  retryCount: number

  // Assessment scores (filled when completed)
  taskAchievement: number?
  fluency: number?
  vocabularyGrammarAccuracy: number?
  politeness: number?
  overallScore: number?
  feedback: string?
}
```

## API Endpoints

### POST /api/task-attempts
**Request:**
```json
{
  "userId": "user-id",
  "taskId": "task-id"
}
```

**Response (New Attempt):**
```json
{
  "attempt": { ... },
  "isExisting": false,
  "message": "Task attempt started successfully"
}
```

**Response (Resume Existing):**
```json
{
  "attempt": {
    "id": "attempt-id",
    "conversationHistory": {
      "messages": [ ... ]  // Your previous messages
    }
  },
  "isExisting": true,
  "message": "Resuming existing attempt"
}
```

### GET /api/task-attempts/[attemptId]
Loads the attempt with full conversation history.

### POST /api/task-attempts/[attemptId]/message
Adds a new message and updates the conversation history in the database.

## Troubleshooting

### Issue: "Task is not active" error
**Solution**: Run `npx tsx scripts/activate-all-tasks.ts`

### Issue: Chat shows old messages when I want to start fresh
**This is normal behavior!** The system is resuming your previous attempt.

**Solutions**:
1. Complete the current attempt first, then start again
2. Run `npx tsx scripts/clear-incomplete-attempts.ts` (testing only)

### Issue: Chat history not showing
**Check**:
1. Open browser console
2. Look for `[TaskAttemptClient] Loaded attempt:` log
3. Check the `messageCount` - should match your previous messages

If `messageCount` is 0 but you had messages, this indicates a database issue.

## For Developers

### How to Add a "Start Fresh" Button

You could add a button in the UI to clear the current incomplete attempt:

```typescript
// In PreTaskStudyClient.tsx
const handleStartFresh = async () => {
  // Delete any existing incomplete attempt
  const existingAttempts = await fetch(
    `/api/task-attempts?userId=${user.id}&taskId=${taskId}&isCompleted=false`
  );
  const data = await existingAttempts.json();

  if (data.attempts.length > 0) {
    await fetch(`/api/task-attempts/${data.attempts[0].id}`, {
      method: 'DELETE'
    });
  }

  // Now start fresh
  await startTaskAttempt();
};
```

### How to Show "Resume" vs "Start" Button

Check for existing attempts and show appropriate button:

```typescript
const [hasIncompleteAttempt, setHasIncompleteAttempt] = useState(false);

useEffect(() => {
  checkExistingAttempt();
}, [taskId, user.id]);

const checkExistingAttempt = async () => {
  const response = await fetch(
    `/api/task-attempts?userId=${user.id}&taskId=${taskId}&isCompleted=false`
  );
  const data = await response.json();
  setHasIncompleteAttempt(data.attempts.length > 0);
};

// In JSX
{hasIncompleteAttempt ? (
  <Button onClick={handleResume}>Resume Task</Button>
) : (
  <Button onClick={handleStart}>Start Task</Button>
)}
```

## Summary

✅ **Fixed Issues**:
1. Task activation issue - all tasks are now active
2. Added comprehensive logging for debugging

✅ **Expected Behavior**:
- Task attempts are automatically resumed to preserve your progress
- Conversation history is persisted in the database
- This is a **feature**, not a bug!

✅ **Tools Available**:
- `scripts/activate-all-tasks.ts` - Activate inactive tasks
- `scripts/check-task-attempts.ts` - View all attempts
- `scripts/clear-incomplete-attempts.ts` - Clear incomplete attempts (testing only)
