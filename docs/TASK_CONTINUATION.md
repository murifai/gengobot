# Task Continuation Feature

## Overview

The task continuation feature allows users to seamlessly resume their previous task attempts or start fresh, eliminating the need to click through all pre-task steps when they have existing progress.

## User Experience

### Scenario 1: First Time Starting a Task

1. User clicks "Start" on a task card
2. System navigates to pre-task study page
3. User goes through 5 pre-task steps:
   - Scenario introduction
   - Learning objectives
   - Study materials (optional)
   - Deck learning (optional)
   - Success criteria
4. User clicks "Start Task"
5. System creates new task attempt
6. User begins conversation

### Scenario 2: Resuming an Existing Task

1. User clicks "Start" on a task they previously worked on
2. **System detects existing incomplete attempt with messages**
3. **Simple resume dialog appears:**
   - Shows task title
   - Two clear options:
     - **"Continue Where I Left Off"** → Jumps directly to chat
     - **"Start Fresh (New Attempt)"** → Creates new attempt
   - Cancel option to go back
4. User makes their choice

### Scenario 3: Starting Fresh After Previous Attempt

1. User selects "Start Fresh (New Attempt)" from resume dialog
2. **System clears localStorage for old attempt**
3. Resume dialog closes
4. User goes through all 5 pre-task steps
5. User clicks "Start Task"
6. **System marks old incomplete attempt as abandoned (isCompleted=true)**
7. System creates **new** task attempt (forceNew=true)
8. **Old attempt preserved in database for statistics**
9. User begins fresh conversation with clean localStorage

## Implementation Details

### Components

#### 1. TaskResumeDialog Component

**Location**: [src/components/task/TaskResumeDialog.tsx](../src/components/task/TaskResumeDialog.tsx)

**Features**:

- Clean, simple modal with backdrop
- Clear task title display
- Three action buttons:
  - Continue (primary action)
  - Start New (secondary action)
  - Go Back (cancel)
- Smooth animations
- Minimal, focused UI

**Props**:

```typescript
interface TaskResumeDialogProps {
  isOpen: boolean;
  taskTitle: string;
  onContinue: () => void;
  onStartNew: () => void;
  onCancel: () => void;
}
```

#### 2. PreTaskStudyClient Enhancement

**Location**: [src/app/dashboard/tasks/[taskId]/pre-study/PreTaskStudyClient.tsx](../src/app/dashboard/tasks/[taskId]/pre-study/PreTaskStudyClient.tsx)

**New Features**:

- Checks for existing incomplete attempts on mount
- Shows resume dialog if messages exist
- Handles three user choices:
  - Continue → Navigate directly to chat
  - Start New → Continue to pre-task steps, create new attempt
  - Cancel → Return to task list

**State Management**:

```typescript
const [existingAttempt, setExistingAttempt] = useState<ExistingAttempt | null>(null);
const [showResumeDialog, setShowResumeDialog] = useState(false);
```

**Key Functions**:

- `checkExistingAttempt()` - Fetches incomplete attempts for this task
- `handleContinueExisting()` - Navigates to existing attempt
- `handleStartNew()` - Clears old attempt's localStorage, dismisses dialog
- `handleCancelResume()` - Returns to task list
- `startTaskAttempt(forceNew)` - Creates attempt with forceNew flag

### API Enhancement

#### Task Attempts API

**Location**: [src/app/api/task-attempts/route.ts](../src/app/api/task-attempts/route.ts)

**Enhanced POST Endpoint**:

```typescript
POST /api/task-attempts
Body: {
  userId: string;
  taskId: string;
  forceNew?: boolean; // NEW: Force creation of new attempt
}
```

**Logic Flow**:

1. Validate user and task
2. **If forceNew=false (default)**:
   - Check for existing incomplete attempt
   - If found → Return existing attempt
   - If not found → Create new attempt
3. **If forceNew=true**:
   - Mark all existing incomplete attempts as abandoned (isCompleted=true, endTime=now)
   - Old attempts preserved in database with conversation history intact
   - Create new fresh attempt
4. Update user's currentTaskId
5. Increment task usage count

**Response**:

```typescript
{
  attempt: TaskAttempt;
  isExisting: boolean;
  message: string;
}
```

### Detection Logic

**When to Show Resume Dialog**:

```typescript
const checkExistingAttempt = async () => {
  // Fetch only INCOMPLETE attempts for this user and task
  const response = await fetch(
    `/api/task-attempts?userId=${user.id}&taskId=${taskId}&incomplete=true`
  );

  const data = await response.json();
  if (data.attempts && data.attempts.length > 0) {
    const attempt = data.attempts[0]; // Most recent incomplete attempt
    const messageCount = attempt.conversationHistory?.messages?.length || 0;

    // Only show dialog if there are actual messages (real progress)
    if (messageCount > 0) {
      setExistingAttempt(attempt);
      setShowResumeDialog(true);
    }
  }
};
```

**Key Conditions**:

- Query parameter `incomplete=true` filters for `isCompleted=false` only
- Dialog shows only if `messageCount > 0` (real progress exists)
- Uses most recent incomplete attempt (ordered by `startTime desc`)
- This ensures the message count shown is ONLY from the current incomplete attempt

## Data Flow

### Flow 1: Continue Existing

```
User clicks "Start" on task
  ↓
PreTaskStudyClient mounts
  ↓
checkExistingAttempt() called
  ↓
GET /api/task-attempts?userId={id}&taskId={id}&incomplete=true
  ↓
If attempt found with messages > 0:
  ↓
Show TaskResumeDialog
  ↓
User clicks "Continue Where I Left Off"
  ↓
handleContinueExisting() called
  ↓
router.push(`/dashboard/tasks/${taskId}/attempt/${attemptId}`)
  ↓
Chat interface loads with existing messages
  ↓
Messages restored from:
  - Database (attempt.conversationHistory.messages)
  - localStorage (chat_messages_{attemptId})
```

### Flow 2: Start Fresh

```
User clicks "Start" on task
  ↓
PreTaskStudyClient mounts
  ↓
checkExistingAttempt() called
  ↓
GET /api/task-attempts?userId={id}&taskId={id}&incomplete=true
  ↓
If attempt found with messages > 0:
  ↓
Show TaskResumeDialog
  ↓
User clicks "Start Fresh (New Attempt)"
  ↓
handleStartNew() called
  ↓
localStorage.removeItem(`chat_messages_${oldAttemptId}`)
setShowResumeDialog(false)
setExistingAttempt(null)
  ↓
User goes through pre-task steps (5 steps)
  ↓
User clicks "Start Task"
  ↓
startTaskAttempt(forceNew=true) called
  ↓
POST /api/task-attempts { userId, taskId, forceNew: true }
  ↓
API marks old incomplete attempts as abandoned:
  - isCompleted = true
  - endTime = now
  - conversationHistory preserved for statistics
  ↓
Creates new TaskAttempt record
  ↓
router.push(`/dashboard/tasks/${taskId}/attempt/${newAttemptId}`)
  ↓
Chat interface loads with empty messages
  ↓
Fresh localStorage created for new attempt
```

### Flow 3: First Time (No Existing Attempt)

```
User clicks "Start" on task
  ↓
PreTaskStudyClient mounts
  ↓
checkExistingAttempt() called
  ↓
GET /api/task-attempts?userId={id}&taskId={id}&incomplete=true
  ↓
No attempt found (or messageCount === 0)
  ↓
No dialog shown
  ↓
User goes through pre-task steps (5 steps)
  ↓
User clicks "Start Task"
  ↓
startTaskAttempt(forceNew=false) called
  ↓
POST /api/task-attempts { userId, taskId, forceNew: false }
  ↓
API checks for existing attempt
  ↓
Creates new TaskAttempt record
  ↓
router.push(`/dashboard/tasks/${taskId}/attempt/${attemptId}`)
  ↓
Chat interface loads with empty messages
```

## Benefits

### User Experience Improvements

✅ **No Repetitive Clicking** - Users with existing progress skip pre-task steps
✅ **Clear Choice** - Visual dialog makes it obvious what will happen
✅ **Accurate Progress** - Shows message count from CURRENT incomplete attempt only
✅ **Flexibility** - Option to start fresh if desired
✅ **Clean Slate** - Starting fresh clears old localStorage and creates new attempt
✅ **Statistics Preserved** - Old attempts saved in database for analytics

### Technical Benefits

✅ **Backwards Compatible** - Works with existing task flow
✅ **localStorage Integration** - Leverages existing persistence
✅ **Clean State Management** - Clear separation of concerns
✅ **API Flexibility** - forceNew parameter supports both flows

## Edge Cases Handled

1. **Empty Attempt Exists**
   - messageCount === 0
   - Dialog NOT shown
   - User goes through normal flow

2. **Multiple Incomplete Attempts**
   - API returns most recent attempt
   - Only one dialog shown

3. **Attempt Exists but No Messages in localStorage**
   - Database messages still loaded
   - localStorage will be populated from database

4. **User Cancels Resume Dialog**
   - Navigates back to task list
   - No attempt created or modified

5. **Network Failure During Check**
   - Error caught and logged
   - User continues with normal flow (fail gracefully)

## Testing Checklist

### Manual Testing

- [ ] First time task start → No dialog → Goes through pre-steps
- [ ] Task with 0 messages → No dialog → Goes through pre-steps
- [ ] Task with messages → Dialog shown → Continue works
- [ ] Task with messages → Dialog shown → Start fresh works
- [ ] Task with messages → Dialog shown → Cancel returns to task list
- [ ] Continue → Messages restored correctly
- [ ] Start fresh → New attempt created with empty messages
- [ ] Progress bar shows correctly based on message count
- [ ] Attempt ID displayed correctly (truncated)

### Browser Testing

- [ ] Chrome/Edge - Dialog animations smooth
- [ ] Firefox - Backdrop and modal work
- [ ] Safari - No layout issues
- [ ] Mobile - Dialog responsive and usable

### API Testing

- [ ] POST with forceNew=false → Returns existing if found
- [ ] POST with forceNew=true → Creates new always
- [ ] GET with incomplete=true → Returns only incomplete attempts
- [ ] Multiple attempts → Most recent returned

## Future Enhancements

### Potential Improvements

1. **Attempt History View** - Show list of all previous attempts
2. **Delete Old Attempts** - Allow users to clean up attempts
3. **Progress Metrics** - Show completion percentage
4. **Time Stamps** - Display "Last worked on X days ago"
5. **Preview Messages** - Show snippet of last conversation
6. **Quick Resume** - Add "Resume" button on task card itself

### Analytics Opportunities

- Track continuation vs. fresh start rates
- Measure pre-task step completion rates
- Monitor average messages per attempt
- Identify tasks with high retry rates

## Related Files

- [src/components/task/TaskResumeDialog.tsx](../src/components/task/TaskResumeDialog.tsx) - Resume dialog UI
- [src/app/dashboard/tasks/[taskId]/pre-study/PreTaskStudyClient.tsx](../src/app/dashboard/tasks/[taskId]/pre-study/PreTaskStudyClient.tsx) - Pre-task client with detection
- [src/app/api/task-attempts/route.ts](../src/app/api/task-attempts/route.ts) - API with forceNew support
- [docs/CHAT_PERSISTENCE.md](./CHAT_PERSISTENCE.md) - Chat persistence documentation
