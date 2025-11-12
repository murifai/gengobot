# Task-Based Chat Feedback System

**Version:** 1.0
**Last Updated:** 2025-01-12
**Status:** Design Complete - Ready for Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [System Architecture](#system-architecture)
4. [Data Structures](#data-structures)
5. [AI Objective Detection](#ai-objective-detection)
6. [UI Components](#ui-components)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Implementation Plan](#implementation-plan)
10. [Testing Strategy](#testing-strategy)

---

## Overview

### Purpose

Simplified task-based chat feedback system focused on **Learning Objectives Achievement** and **Conversation Feedback** without complex scoring algorithms.

### Key Principles

- ✅ **Simple** - Focus on objectives, not complex metrics
- ✅ **Clear** - User knows exactly what they achieved
- ✅ **Encouraging** - Positive, constructive feedback
- ✅ **Actionable** - Specific next steps for improvement
- ✅ **Trackable** - Time and message statistics for progress

### What We DON'T Track

- ❌ Vocabulary coverage percentages
- ❌ Grammar pattern detection scores
- ❌ Complex weighted scoring (fluency, politeness, etc.)
- ❌ Numeric ratings or grades

### What We DO Track

- ✅ Learning objectives achievement (yes/no per objective)
- ✅ Conversation quality feedback (narrative)
- ✅ Time duration (for statistics)
- ✅ Message count (with limits)
- ✅ Strengths and areas to improve

---

## Core Features

### 1. Real-time Objective Tracking

- AI detects when each learning objective is completed
- Visual progress indicators in UI
- Updates after each user-AI message exchange

### 2. Completion Suggestion

- System suggests completion when all objectives achieved
- Green banner with summary of achievements
- User can dismiss and continue practicing or complete task

### 3. Message Limits

- Each task has configurable `maxMessages` limit
- Soft warning at 80% (yellow alert)
- Hard limit at 100% (force complete or suggest retry)
- Prevents endless conversations without completion

### 4. Time Tracking

- Start time recorded when task begins
- End time recorded on completion
- Duration used for statistics only (not penalties)
- Compared against `estimatedDuration` for efficiency tracking

### 5. Simplified Assessment

- List of objectives: achieved ✓ or not achieved ✗
- Conversation feedback: strengths, improvements, encouragement
- Statistics: time, messages, completion rate
- Next steps: actionable recommendations

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Task Attempt Flow                        │
└─────────────────────────────────────────────────────────────┘

1. START TASK
   └─> Initialize attempt with objectives as "pending"
   └─> Start timer
   └─> Set maxMessages from task config

2. CONVERSATION LOOP
   ├─> User sends message
   ├─> AI responds
   ├─> Detect objective completion (AI analysis)
   ├─> Update progress state
   ├─> Show completion suggestion if all objectives done
   └─> Check message limit

3. COMPLETE TASK (Manual or Auto)
   ├─> Generate simplified assessment
   ├─> Save to database
   └─> Show feedback UI

4. POST-TASK REVIEW
   ├─> Display objectives achieved
   ├─> Show conversation feedback
   ├─> Display statistics
   └─> Offer retry or continue
```

---

## Data Structures

### ObjectiveTracking

```typescript
interface ObjectiveTracking {
  objectiveId: string; // e.g., "0", "1", "2"
  objectiveText: string; // e.g., "Greet the staff politely"
  status: 'pending' | 'completed';
  completedAt?: string; // ISO timestamp
  completedAtMessageIndex?: number;
  confidence: number; // 0-100, AI confidence score
  evidence: string[]; // Message contents proving completion
}
```

### TaskProgress (Runtime State)

```typescript
interface TaskProgress {
  attemptId: string;
  startTime: string;

  // Objectives
  objectives: ObjectiveTracking[];
  completedObjectivesCount: number;
  totalObjectivesCount: number;
  allObjectivesCompleted: boolean;

  // Messages
  totalMessages: number;
  maxMessages: number;
  messagesRemaining: number;

  // Time
  elapsedSeconds: number;
  estimatedDuration: number; // minutes

  // Completion
  readyToComplete: boolean;
  completionSuggested: boolean;
}
```

### SimplifiedAssessment (Final Result)

```typescript
interface SimplifiedAssessment {
  attemptId: string;
  taskId: string;

  // 1. Objective Achievement
  objectives: {
    text: string;
    achieved: boolean;
    evidence: string[];
  }[];
  objectivesAchieved: number;
  totalObjectives: number;

  // 2. Conversation Feedback
  conversationFeedback: {
    strengths: string[]; // What user did well
    areasToImprove: string[]; // Specific improvements
    overallFeedback: string; // General narrative
    encouragement: string; // Motivational message
  };

  // 3. Statistics
  statistics: {
    duration: number; // seconds
    durationMinutes: number;
    totalMessages: number;
    userMessagesCount: number;
    completionRate: number; // percentage
  };

  // 4. Recommendations
  suggestRetry: boolean;
  nextSteps: string[];

  assessmentDate: Date;
}
```

---

## AI Objective Detection

### Detection Flow

```
Every Message Exchange:
  1. User sends message
  2. AI responds
  3. Call objective detection endpoint
  4. AI analyzes conversation + objectives
  5. Returns updated objective statuses
  6. Update UI with progress
  7. Show completion suggestion if all done
```

### AI Detection Prompt Template

```typescript
function generateObjectiveDetectionPrompt(
  task: Task,
  conversationHistory: Message[],
  currentObjectives: ObjectiveTracking[]
): string {
  return `You are evaluating a Japanese language learning conversation to detect if learning objectives have been completed.

# Task Information
- Title: ${task.title}
- Scenario: ${task.scenario}
- JLPT Level: ${task.difficulty}

# Learning Objectives to Detect:
${(task.learningObjectives as string[])
  .map((obj, i) => `${i}. ${obj} [Status: ${currentObjectives[i]?.status || 'pending'}]`)
  .join('\n')}

# Recent Conversation:
${conversationHistory
  .slice(-8)
  .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
  .join('\n')}

# Your Task:
For EACH learning objective, determine:
1. Has it been completed in the conversation? (yes/no)
2. Confidence score (0-100)
3. Evidence (which messages show completion)

Important:
- Mark as completed ONLY if user successfully demonstrated the objective
- Consider both content and context
- User must have actually performed the action, not just asked about it
- Lower confidence if uncertain

Response Format (JSON):
{
  "objectives": [
    {
      "objectiveId": "0",
      "objectiveText": "...",
      "status": "completed" | "pending",
      "confidence": 85,
      "evidence": ["User: ...", "AI confirmed: ..."],
      "completedAtMessageIndex": 12
    }
  ],
  "allCompleted": false,
  "overallConfidence": 78
}`;
}
```

### Simplified Assessment Prompt

```typescript
function generateSimplifiedAssessmentPrompt(
  task: Task,
  conversationHistory: Message[],
  objectiveStatus: ObjectiveTracking[]
): string {
  return `You are providing feedback for a Japanese language learning task completion.

# Task Details
- Title: ${task.title}
- Scenario: ${task.scenario}
- JLPT Level: ${task.difficulty}

# Learning Objectives & Achievement:
${objectiveStatus
  .map(
    (obj, i) =>
      `${i + 1}. ${obj.objectiveText} - ${obj.status === 'completed' ? '✓ ACHIEVED' : '✗ NOT ACHIEVED'}`
  )
  .join('\n')}

# Complete Conversation:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

# Your Task:
Provide constructive feedback on the learner's conversation performance.

Focus on:
1. What they did well (strengths)
2. What they can improve (specific, actionable advice)
3. Overall assessment of their communication
4. Encouragement and next steps

Be supportive, specific, and educational. Reference actual messages when possible.

Response Format (JSON):
{
  "conversationFeedback": {
    "strengths": [
      "Successfully used polite expressions like 'お願いします'",
      "Clear and natural question formation",
      "Good use of appropriate vocabulary for the situation"
    ],
    "areasToImprove": [
      "Could use more varied sentence structures",
      "Try incorporating more conjunctions like 'それから' to connect ideas",
      "Practice using past tense forms more consistently"
    ],
    "overallFeedback": "You demonstrated good understanding of the restaurant scenario and successfully communicated your needs. Your use of polite language was appropriate, though there's room to expand your vocabulary range. Keep practicing natural conversation flow.",
    "encouragement": "Great job completing this task! You're making solid progress in practical Japanese conversation. Keep up the good work!"
  },
  "nextSteps": [
    "Practice similar restaurant scenarios to build confidence",
    "Try more complex ordering situations with multiple items",
    "Review particles (は, が, を) for more natural speech"
  ],
  "suggestRetry": false
}`;
}
```

---

## UI Components

### 1. Progress Header Bar

**Location:** Top of chat interface, below main header
**Always Visible:** Yes
**Updates:** Real-time after each message

```tsx
<ProgressHeader>
  ├─ Left: Objective Indicators (circles with checkmarks) ├─ Center: Progress Bar (0-100% based on
  objectives) └─ Right: Stats (Time elapsed, Messages count)
</ProgressHeader>
```

**Features:**

- Numbered circles for each objective
- Green checkmark when objective completed
- Gray when pending
- Hover shows full objective text
- Warning color for messages when near limit (80%+)

### 2. Completion Suggestion Banner

**Location:** Top of messages area
**Visibility:** Only when all objectives completed
**Dismissible:** Yes

```tsx
<CompletionSuggestion>
  ├─ Icon: Green checkmark ├─ Title: "Great Job! All Objectives Completed" ├─ Description: Summary
  of achievements ├─ Objectives List: All completed objectives with checkmarks └─ Actions: ├─
  "Complete Task" (primary button) └─ "Continue Chatting" (dismiss)
</CompletionSuggestion>
```

**Behavior:**

- Appears automatically when all objectives done
- Stays visible until dismissed or task completed
- Can be re-shown if user dismisses then changes mind

### 3. Message Limit Warning

**Location:** Top of messages area (above completion suggestion)
**Visibility:** When messages > 80% of limit
**Levels:** Warning (80-99%), Critical (100%)

```tsx
<MessageLimitWarning level="warning" | "critical">
  ├─ Icon: Alert triangle
  ├─ Message: "X messages remaining" or "Limit reached"
  └─ Action: Suggest completion if at limit
</MessageLimitWarning>
```

**Behavior:**

- Yellow warning at 80%
- Red critical at 100%
- Disables input at 100% (must complete)

### 4. Simplified Post-Task Review

**Location:** Full page after task completion
**Replaces:** Complex assessment UI

```tsx
<SimplifiedPostTaskReview>
  ├─ Header: │ ├─ Success icon │ ├─ "Task Completed!" │ └─ Stats (duration, messages) │ ├─
  Objectives Section: │ ├─ Progress bar │ └─ List of objectives (✓ achieved, ○ not achieved) │ ├─
  Feedback Section: │ ├─ Overall feedback (paragraph) │ ├─ Strengths (bulleted list with icons) │ ├─
  Areas to Improve (bulleted list) │ └─ Encouragement (highlighted box) │ ├─ Next Steps Section: │
  └─ Numbered recommendations │ └─ Actions: ├─ "Retry This Task" (if suggested) └─ "Back to Tasks"
</SimplifiedPostTaskReview>
```

---

## API Endpoints

### 1. Detect Objectives

**Endpoint:** `POST /api/task-attempts/[attemptId]/detect-objectives`

**Purpose:** Analyze conversation and detect objective completion

**Request:**

```typescript
{
  newUserMessage: string;
  newAssistantMessage: string;
}
```

**Response:**

```typescript
{
  objectives: ObjectiveTracking[];
  newlyCompleted: string[];      // IDs just completed
  allCompleted: boolean;
  confidence: number;
}
```

**Implementation:**

```typescript
export async function POST(request: Request, { params }: { params: { attemptId: string } }) {
  const { newUserMessage, newAssistantMessage } = await request.json();

  // 1. Get attempt with task and current objectives
  const attempt = await prisma.taskAttempt.findUnique({
    where: { id: params.attemptId },
    include: { task: true },
  });

  // 2. Get conversation history
  const history = attempt.conversationHistory.messages;

  // 3. Get current objective status
  const currentObjectives =
    attempt.objectiveCompletionStatus || initializeObjectives(attempt.task.learningObjectives);

  // 4. Call OpenAI for detection
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an objective completion detector for Japanese learning.',
      },
      {
        role: 'user',
        content: generateObjectiveDetectionPrompt(
          attempt.task,
          [
            ...history,
            { role: 'user', content: newUserMessage },
            { role: 'assistant', content: newAssistantMessage },
          ],
          currentObjectives
        ),
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);

  // 5. Update attempt
  await prisma.taskAttempt.update({
    where: { id: params.attemptId },
    data: {
      objectiveCompletionStatus: result.objectives,
      totalMessages: attempt.totalMessages + 2,
    },
  });

  // 6. Determine newly completed
  const newlyCompleted = result.objectives
    .filter((obj, i) => obj.status === 'completed' && currentObjectives[i]?.status !== 'completed')
    .map(obj => obj.objectiveId);

  return NextResponse.json({
    objectives: result.objectives,
    newlyCompleted,
    allCompleted: result.allCompleted,
    confidence: result.overallConfidence,
  });
}
```

### 2. Generate Assessment

**Endpoint:** `POST /api/assessments`

**Purpose:** Generate simplified assessment on task completion

**Request:**

```typescript
{
  attemptId: string;
}
```

**Response:**

```typescript
{
  assessment: SimplifiedAssessment;
}
```

**Implementation:**

```typescript
export async function POST(request: Request) {
  const { attemptId } = await request.json();

  // 1. Get attempt with task
  const attempt = await prisma.taskAttempt.findUnique({
    where: { id: attemptId },
    include: { task: true },
  });

  // 2. Calculate statistics
  const duration = attempt.endTime
    ? (new Date(attempt.endTime).getTime() - new Date(attempt.startTime).getTime()) / 1000
    : 0;

  const history = attempt.conversationHistory.messages;
  const userMessages = history.filter(m => m.role === 'user');
  const objectiveStatus = attempt.objectiveCompletionStatus;

  // 3. Generate AI feedback
  const feedbackResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a supportive Japanese language instructor.',
      },
      {
        role: 'user',
        content: generateSimplifiedAssessmentPrompt(attempt.task, history, objectiveStatus),
      },
    ],
    response_format: { type: 'json_object' },
  });

  const feedback = JSON.parse(feedbackResponse.choices[0].message.content);

  // 4. Build assessment
  const assessment: SimplifiedAssessment = {
    attemptId: attempt.id,
    taskId: attempt.taskId,

    objectives: objectiveStatus.map(obj => ({
      text: obj.objectiveText,
      achieved: obj.status === 'completed',
      evidence: obj.evidence || [],
    })),
    objectivesAchieved: objectiveStatus.filter(o => o.status === 'completed').length,
    totalObjectives: objectiveStatus.length,

    conversationFeedback: feedback.conversationFeedback,

    statistics: {
      duration,
      durationMinutes: Math.round(duration / 60),
      totalMessages: history.length,
      userMessagesCount: userMessages.length,
      completionRate:
        (objectiveStatus.filter(o => o.status === 'completed').length / objectiveStatus.length) *
        100,
    },

    suggestRetry: feedback.suggestRetry || false,
    nextSteps: feedback.nextSteps || [],

    assessmentDate: new Date(),
  };

  // 5. Save to database
  await prisma.taskAttempt.update({
    where: { id: attemptId },
    data: {
      feedback: JSON.stringify(assessment),
      isCompleted: true,
      endTime: new Date(),
      completionDuration: duration,
    },
  });

  return NextResponse.json({ assessment });
}
```

### 3. Get Task Progress

**Endpoint:** `GET /api/task-attempts/[attemptId]/progress`

**Purpose:** Get current progress state (for UI sync)

**Response:**

```typescript
{
  progress: TaskProgress;
}
```

---

## Database Schema

### Schema Changes Required

```prisma
// Update Task model
model Task {
  id                 String   @id @default(cuid())
  title              String
  description        String   @db.Text
  category           String
  difficulty         String
  scenario           String   @db.Text
  learningObjectives Json     // Array of strings
  conversationExample String  @db.Text
  estimatedDuration  Int      // Minutes

  // ADD THIS:
  maxMessages        Int      @default(30)  // Max messages per attempt

  // ... rest of fields
}

// Update TaskAttempt model
model TaskAttempt {
  id        String    @id @default(cuid())
  userId    String
  taskId    String
  startTime DateTime  @default(now())
  endTime   DateTime?

  // REMOVE THESE (complex scoring):
  // taskAchievement           Float?
  // fluency                   Float?
  // vocabularyGrammarAccuracy Float?
  // politeness                Float?
  // overallScore              Float?

  // KEEP/UPDATE THESE:
  feedback            String?  @db.Text  // JSON: SimplifiedAssessment
  conversationHistory Json                // { messages: [...] }
  isCompleted         Boolean  @default(false)
  retryCount          Int      @default(0)

  // ADD THESE:
  objectiveCompletionStatus Json     // ObjectiveTracking[]
  totalMessages             Int      @default(0)
  completionDuration        Int?     // seconds
  completionSuggestedAt     DateTime?

  user User @relation(fields: [userId], references: [id])
  task Task @relation(fields: [taskId], references: [id])

  @@index([userId])
  @@index([taskId])
  @@index([isCompleted])
}
```

### Migration Steps

```bash
# 1. Create migration
npx prisma migrate dev --name add_task_feedback_system

# 2. Update existing tasks with maxMessages
# Run script to set default maxMessages = 30 for all existing tasks

# 3. Initialize objectiveCompletionStatus for active attempts
# Run script to initialize empty array for incomplete attempts
```

---

## Implementation Plan

### Phase 1: Database & Schema (Day 1)

**Estimated Time:** 2-3 hours

- [ ] Update `schema.prisma` with new fields
- [ ] Create and run migration
- [ ] Create script to set `maxMessages` for existing tasks
- [ ] Create script to initialize `objectiveCompletionStatus` for active attempts
- [ ] Test schema changes in development

**Files to Modify:**

- `prisma/schema.prisma`
- `scripts/migrate-task-feedback.ts` (new)

**Validation:**

- All migrations run successfully
- Existing data not corrupted
- New fields accessible in Prisma client

---

### Phase 2: AI Detection Endpoint (Day 1-2)

**Estimated Time:** 3-4 hours

- [ ] Create objective detection API endpoint
- [ ] Implement AI prompt generation
- [ ] Add OpenAI integration
- [ ] Handle edge cases (no objectives, all completed, etc.)
- [ ] Add error handling and logging
- [ ] Test with sample conversations

**Files to Create:**

- `src/app/api/task-attempts/[attemptId]/detect-objectives/route.ts`
- `src/lib/ai/objective-detection.ts` (helper functions)

**Files to Modify:**

- `src/lib/ai/prompts.ts` (add detection prompts)

**Testing:**

- Unit tests for prompt generation
- Integration tests for API endpoint
- Test with various conversation scenarios

---

### Phase 3: Frontend State Management (Day 2)

**Estimated Time:** 3-4 hours

- [ ] Update `useStreamingChat` hook
- [ ] Add progress state management
- [ ] Integrate objective detection calls
- [ ] Add timer for elapsed time tracking
- [ ] Add message counter
- [ ] Handle completion suggestion state

**Files to Modify:**

- `src/hooks/useStreamingChat.ts`

**Files to Create:**

- `src/hooks/useTaskProgress.ts` (new, separate progress tracking)

**Testing:**

- Test state updates after each message
- Test completion detection
- Test timer accuracy

---

### Phase 4: UI Components (Day 2-3)

**Estimated Time:** 4-5 hours

#### 4.1 Progress Header Bar

- [ ] Create `ProgressHeader` component
- [ ] Add objective indicators with animations
- [ ] Add progress bar
- [ ] Add time and message counters
- [ ] Style for light/dark mode
- [ ] Add responsive design

**Files to Create:**

- `src/components/task/ProgressHeader.tsx`

#### 4.2 Completion Suggestion Banner

- [ ] Create `CompletionSuggestion` component
- [ ] Add animation for appearance
- [ ] Add dismiss functionality
- [ ] Add complete button handler
- [ ] Style with green success theme

**Files to Create:**

- `src/components/task/CompletionSuggestion.tsx`

#### 4.3 Message Limit Warning

- [ ] Create `MessageLimitWarning` component
- [ ] Add warning level variations
- [ ] Add animations for state changes
- [ ] Style for warning and critical states

**Files to Create:**

- `src/components/task/MessageLimitWarning.tsx`

**Testing:**

- Visual testing in Storybook
- Interaction testing
- Responsive design testing

---

### Phase 5: Integration with Chat Interface (Day 3)

**Estimated Time:** 2-3 hours

- [ ] Update `StreamingChatInterface` component
- [ ] Add progress header
- [ ] Add completion suggestion banner
- [ ] Add message limit warning
- [ ] Disable input at message limit
- [ ] Update `TaskAttemptClientStreaming` wrapper
- [ ] Pass task info props

**Files to Modify:**

- `src/components/chat/StreamingChatInterface.tsx`
- `src/app/dashboard/tasks/[taskId]/attempt/[attemptId]/TaskAttemptClientStreaming.tsx`

**Testing:**

- End-to-end flow testing
- Test all UI states
- Test message limit enforcement

---

### Phase 6: Simplified Assessment (Day 3-4)

**Estimated Time:** 3-4 hours

#### 6.1 Assessment API

- [ ] Simplify assessment generation
- [ ] Remove complex scoring logic
- [ ] Add conversation feedback generation
- [ ] Update database save logic

**Files to Modify:**

- `src/app/api/assessments/route.ts`
- `src/lib/ai/task-assessment-service.ts`

#### 6.2 Assessment UI

- [ ] Create `SimplifiedPostTaskReview` component
- [ ] Add objectives display
- [ ] Add feedback sections (strengths, improvements)
- [ ] Add statistics display
- [ ] Add next steps section
- [ ] Add action buttons

**Files to Create:**

- `src/components/task/SimplifiedPostTaskReview.tsx`

**Files to Modify:**

- `src/app/dashboard/tasks/[taskId]/attempt/[attemptId]/TaskAttemptClientStreaming.tsx`

**Testing:**

- Test assessment generation
- Test UI rendering with various feedback
- Test retry flow

---

### Phase 7: Testing & Polish (Day 4-5)

**Estimated Time:** 4-5 hours

- [ ] End-to-end testing with real tasks
- [ ] Test edge cases:
  - [ ] No objectives completed
  - [ ] Some objectives completed
  - [ ] All objectives completed early
  - [ ] Message limit reached
  - [ ] Very short conversation
  - [ ] Very long conversation
- [ ] Performance testing
- [ ] Mobile responsive testing
- [ ] Dark mode testing
- [ ] Accessibility testing
- [ ] Bug fixes
- [ ] UI polish and animations

**Testing Checklist:**

- [ ] New task attempt creation
- [ ] Objective detection accuracy
- [ ] Progress updates
- [ ] Completion suggestion trigger
- [ ] Message limit warnings
- [ ] Task completion flow
- [ ] Assessment generation
- [ ] Feedback display
- [ ] Retry functionality
- [ ] Navigation flows

---

### Phase 8: Documentation & Deployment (Day 5)

**Estimated Time:** 2-3 hours

- [ ] Update user documentation
- [ ] Update admin documentation
- [ ] Create migration guide
- [ ] Update README
- [ ] Create deployment checklist
- [ ] Database backup before deployment
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor for issues

**Documentation to Create:**

- User guide for new feedback system
- Admin guide for configuring maxMessages
- Developer guide for maintaining detection logic

---

## Testing Strategy

### Unit Tests

**Objective Detection:**

```typescript
describe('Objective Detection', () => {
  it('should detect completed objectives', async () => {
    const result = await detectObjectives(attemptId, userMsg, aiMsg);
    expect(result.objectives[0].status).toBe('completed');
  });

  it('should mark objectives as pending if not completed', async () => {
    const result = await detectObjectives(attemptId, userMsg, aiMsg);
    expect(result.objectives[1].status).toBe('pending');
  });

  it('should return confidence scores', async () => {
    const result = await detectObjectives(attemptId, userMsg, aiMsg);
    expect(result.objectives[0].confidence).toBeGreaterThan(0);
  });
});
```

**Progress Tracking:**

```typescript
describe('Task Progress', () => {
  it('should calculate elapsed time correctly', () => {
    const progress = calculateProgress(attempt);
    expect(progress.elapsedSeconds).toBe(expected);
  });

  it('should track message count', () => {
    const progress = calculateProgress(attempt);
    expect(progress.totalMessages).toBe(10);
  });

  it('should determine readyToComplete', () => {
    const progress = calculateProgress(attempt);
    expect(progress.readyToComplete).toBe(true);
  });
});
```

### Integration Tests

**API Endpoints:**

```typescript
describe('POST /api/task-attempts/[attemptId]/detect-objectives', () => {
  it('should return updated objectives', async () => {
    const response = await POST(request, { params: { attemptId } });
    expect(response.status).toBe(200);
    expect(response.body.objectives).toBeDefined();
  });

  it('should handle invalid attemptId', async () => {
    const response = await POST(request, { params: { attemptId: 'invalid' } });
    expect(response.status).toBe(404);
  });
});

describe('POST /api/assessments', () => {
  it('should generate simplified assessment', async () => {
    const response = await POST(request);
    expect(response.body.assessment).toBeDefined();
    expect(response.body.assessment.objectives).toBeDefined();
  });
});
```

### E2E Tests

**Complete Task Flow:**

```typescript
describe('Task Completion Flow', () => {
  it('should complete full task workflow', async () => {
    // 1. Start task
    await startTask(taskId);

    // 2. Send messages
    await sendMessage('こんにちは');
    await sendMessage('コーヒーをください');

    // 3. Check progress
    const progress = await getProgress();
    expect(progress.objectives[0].status).toBe('completed');

    // 4. Complete task
    await completeTask();

    // 5. Verify assessment
    const assessment = await getAssessment();
    expect(assessment.objectivesAchieved).toBeGreaterThan(0);
  });
});
```

### Manual Testing Checklist

- [ ] **Happy Path:**
  - [ ] Start task
  - [ ] Complete all objectives naturally
  - [ ] See completion suggestion
  - [ ] Complete task
  - [ ] See feedback

- [ ] **Edge Cases:**
  - [ ] Reach message limit without completing objectives
  - [ ] Dismiss completion suggestion
  - [ ] Complete partial objectives
  - [ ] Retry after completion

- [ ] **UI/UX:**
  - [ ] Progress updates smoothly
  - [ ] Animations work
  - [ ] Responsive on mobile
  - [ ] Dark mode works
  - [ ] Icons display correctly

- [ ] **Performance:**
  - [ ] Detection is fast (<2s)
  - [ ] Assessment generation is fast (<5s)
  - [ ] UI remains responsive

---

## Success Metrics

### Technical Metrics

- [ ] Objective detection accuracy >85%
- [ ] API response time <2s for detection
- [ ] Assessment generation <5s
- [ ] Zero data loss during migration
- [ ] All tests passing

### User Experience Metrics

- [ ] Task completion rate increase
- [ ] Average time to complete tasks
- [ ] User satisfaction with feedback
- [ ] Retry rate for tasks

### Performance Metrics

- [ ] Page load time <3s
- [ ] Interaction response time <500ms
- [ ] Mobile performance scores >90

---

## Future Enhancements

### Potential Improvements (Not in v1.0)

1. **Smart Hints:**
   - AI-generated hints when user struggles
   - Context-aware suggestions

2. **Vocabulary Integration:**
   - Link to dictionary while chatting
   - Track new words encountered

3. **Voice Feedback:**
   - Pronunciation assessment
   - Audio playback of corrections

4. **Progress Analytics:**
   - Charts showing improvement over time
   - Identify weak objective types

5. **Adaptive Difficulty:**
   - Adjust maxMessages based on user level
   - Suggest easier/harder tasks

6. **Gamification:**
   - Streak tracking
   - Achievement badges for objectives

---

## Troubleshooting

### Common Issues

**Issue:** Objectives not detecting

- **Check:** AI prompt is correct
- **Check:** Conversation history is being sent
- **Check:** OpenAI API key is valid
- **Solution:** Review detection logs, test prompt manually

**Issue:** Progress not updating

- **Check:** useStreamingChat hook is calling detection
- **Check:** State management is working
- **Solution:** Check browser console for errors

**Issue:** Message limit not enforcing

- **Check:** maxMessages field exists on task
- **Check:** totalMessages is incrementing
- **Solution:** Verify database field and counter logic

**Issue:** Assessment not generating

- **Check:** OpenAI API is accessible
- **Check:** Prompt is valid JSON format
- **Solution:** Review API logs, test prompt separately

---

## Appendix

### Environment Variables Required

```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

### Dependencies

```json
{
  "openai": "^4.x",
  "next": "^14.x",
  "prisma": "^5.x",
  "@prisma/client": "^5.x"
}
```

### References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**End of Documentation**

For questions or issues, refer to the main project README or contact the development team.
