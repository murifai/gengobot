# Task Components

> Components for task-based Japanese learning

[← Back to Index](../README.md)

---

## Overview

Task components are located in `/src/components/task/` and provide the complete workflow for task-based language learning including pre-study, active tasks, and post-task reviews.

**Components:** 9

---

## CompletionSuggestion

**File:** `/src/components/task/CompletionSuggestion.tsx`

Suggests task completion when criteria are met.

### Features
- Task completion criteria checking
- Completion suggestion dialog
- User confirmation
- Redirect to review

### Usage

```tsx
import { CompletionSuggestion } from '@/components/task/CompletionSuggestion'

<CompletionSuggestion
  taskId={taskId}
  attemptId={attemptId}
  completionCriteria={{
    minMessages: 10,
    objectives: ['greet', 'order', 'thank'],
  }}
  currentProgress={{
    messages: 12,
    completedObjectives: ['greet', 'order', 'thank'],
  }}
  onAccept={() => completeTask()}
  onDecline={() => continueTask()}
/>
```

---

## MessageLimitWarning

**File:** `/src/components/task/MessageLimitWarning.tsx`

Warning when approaching message limit.

### Features
- Message count display
- Warning threshold
- Upgrade prompt for premium users
- Dismiss option

### Usage

```tsx
import { MessageLimitWarning } from '@/components/task/MessageLimitWarning'

<MessageLimitWarning
  current={45}
  limit={50}
  threshold={0.9} // Show at 90%
  onUpgrade={() => router.push('/pricing')}
  onDismiss={() => setWarningDismissed(true)}
/>
```

---

## PostTaskReview

**File:** `/src/components/task/PostTaskReview.tsx`

Comprehensive post-task review interface.

### Features
- Task completion summary
- Difficulty rating
- Feedback text input
- Learning points review
- Vocabulary learned
- Grammar points practiced
- Mistakes review
- Performance statistics
- Next task suggestion
- Export conversation

### Usage

```tsx
import { PostTaskReview } from '@/components/task/PostTaskReview'

<PostTaskReview
  attemptId={attemptId}
  taskData={{
    title: 'Restaurant Ordering',
    duration: 1200,
    messagesExchanged: 15,
    objectivesCompleted: 3,
  }}
  vocabularyLearned={['注文', 'メニュー', 'お会計']}
  grammarPoints={['~てください', '~たいです']}
  mistakes={[
    { original: 'たべました', correction: '食べました', explanation: '...' }
  ]}
  onSubmit={(feedback) => {
    saveFeedback(attemptId, feedback)
    router.push('/dashboard/tasks')
  }}
/>
```

### Props

```typescript
interface PostTaskReviewProps {
  attemptId: string
  taskData: {
    title: string
    duration: number
    messagesExchanged: number
    objectivesCompleted: number
  }
  vocabularyLearned?: string[]
  grammarPoints?: string[]
  mistakes?: Mistake[]
  onSubmit: (feedback: TaskFeedback) => void
  onSkip?: () => void
}

interface TaskFeedback {
  rating: 1 | 2 | 3 | 4 | 5
  difficulty: 'too_easy' | 'appropriate' | 'too_hard'
  feedback: string
  wouldRecommend: boolean
}
```

---

## PreTaskStudy

**File:** `/src/components/task/PreTaskStudy.tsx`

Pre-task study materials and preparation.

### Features
- Task description
- Scenario context
- Vocabulary preview with:
  - Readings (furigana)
  - Definitions
  - Audio pronunciation
  - Example sentences
- Grammar points explanation
- Learning objectives
- Estimated duration
- Ready button
- Skip option

### Usage

```tsx
import { PreTaskStudy } from '@/components/task/PreTaskStudy'

<PreTaskStudy
  taskId={taskId}
  taskTitle="Restaurant Ordering"
  scenario="You're at a Japanese restaurant and want to order food"
  vocabulary={[
    {
      word: '注文',
      reading: 'ちゅうもん',
      meaning: 'order',
      audioUrl: '/audio/chuumon.mp3',
      examples: ['注文をお願いします'],
    },
  ]}
  grammarPoints={[
    {
      pattern: '~てください',
      explanation: 'Please do...',
      examples: ['注文してください'],
    },
  ]}
  objectives={[
    'Greet the staff',
    'Order your meal',
    'Ask for the bill',
  ]}
  estimatedDuration={15}
  onReady={() => startTask(taskId)}
  onSkip={() => startTask(taskId)}
/>
```

---

## ProgressHeader

**File:** `/src/components/task/ProgressHeader.tsx`

Header showing task progress during active task.

### Features
- Task title
- Progress bar
- Objectives checklist
- Time elapsed
- Message count
- Exit button with confirmation

### Usage

```tsx
import { ProgressHeader } from '@/components/task/ProgressHeader'

<ProgressHeader
  taskTitle="Restaurant Ordering"
  progress={60}
  objectives={[
    { text: 'Greet the staff', completed: true },
    { text: 'Order your meal', completed: true },
    { text: 'Ask for the bill', completed: false },
  ]}
  timeElapsed={600}
  messageCount={10}
  maxMessages={20}
  onExit={() => {
    if (confirm('Exit task?')) {
      exitTask()
    }
  }}
/>
```

---

## SimplifiedPostTaskReview

**File:** `/src/components/task/SimplifiedPostTaskReview.tsx`

Simplified, quick post-task review.

### Features
- Simple star rating
- Optional text feedback
- Quick continue button
- Less detailed than full review

### Usage

```tsx
import { SimplifiedPostTaskReview } from '@/components/task/SimplifiedPostTaskReview'

<SimplifiedPostTaskReview
  attemptId={attemptId}
  taskTitle="Restaurant Ordering"
  onSubmit={(rating, feedback) => {
    saveQuickFeedback(attemptId, rating, feedback)
    router.push('/dashboard/tasks')
  }}
  onSkip={() => router.push('/dashboard/tasks')}
/>
```

---

## TaskChatInputV2

**File:** `/src/components/task/TaskChatInputV2.tsx`

Task-specific chat input (version 2) with enhanced features.

### Features
- Auto-resizing textarea
- Task context awareness
- Vocabulary hints integration
- Grammar assistance
- Character counter with limit
- Send button
- Voice input button
- File attachment (optional)
- Keyboard shortcuts

### Usage

```tsx
import { TaskChatInputV2 } from '@/components/task/TaskChatInputV2'

<TaskChatInputV2
  value={message}
  onChange={setMessage}
  onSend={handleSend}
  taskId={taskId}
  vocabularyHints={vocabularyHints}
  grammarSuggestions={grammarSuggestions}
  maxLength={500}
  disabled={isLoading}
/>
```

---

## TaskResumeDialog

**File:** `/src/components/task/TaskResumeDialog.tsx`

Dialog to resume incomplete task.

### Features
- Previous progress summary
- Time since last message
- Resume or restart options
- Progress preview

### Usage

```tsx
import { TaskResumeDialog } from '@/components/task/TaskResumeDialog'

<TaskResumeDialog
  isOpen={showResumeDialog}
  taskTitle="Restaurant Ordering"
  progress={{
    messages: 8,
    objectivesCompleted: 2,
    lastMessageTime: new Date('2025-11-12T10:30:00'),
  }}
  onResume={() => {
    resumeTask(attemptId)
  }}
  onRestart={() => {
    startNewAttempt(taskId)
  }}
  onCancel={() => setShowResumeDialog(false)}
/>
```

---

## VocabularyHints

**File:** `/src/components/task/VocabularyHints.tsx`

Contextual vocabulary hints during tasks.

### Features
- Relevant vocabulary for current context
- Readings (furigana)
- Definitions
- Audio playback
- Usage examples
- JLPT level indicator
- Click to insert into message
- Expandable/collapsible

### Usage

```tsx
import { VocabularyHints } from '@/components/task/VocabularyHints'

<VocabularyHints
  vocabulary={[
    {
      word: 'お願いします',
      reading: 'おねがいします',
      meaning: 'please',
      jlptLevel: 'N5',
      audioUrl: '/audio/onegaishimasu.mp3',
      examples: ['注文をお願いします'],
    },
  ]}
  onWordClick={(word) => {
    insertText(word.word)
  }}
  onAudioPlay={(audioUrl) => {
    playAudio(audioUrl)
  }}
  position="right"
  collapsible={true}
/>
```

### Props

```typescript
interface VocabularyHintsProps {
  vocabulary: VocabularyItem[]
  onWordClick?: (word: VocabularyItem) => void
  onAudioPlay?: (audioUrl: string) => void
  position?: 'right' | 'bottom'
  collapsible?: boolean
  defaultCollapsed?: boolean
}

interface VocabularyItem {
  word: string
  reading: string
  meaning: string
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  audioUrl?: string
  examples?: string[]
  partOfSpeech?: string
}
```

---

## Task Flow

### Complete Task Workflow

```tsx
// 1. Pre-task study
<PreTaskStudy
  taskId={taskId}
  onReady={() => setPhase('active')}
/>

// 2. Active task
{phase === 'active' && (
  <>
    <ProgressHeader
      taskTitle={task.title}
      progress={progress}
      objectives={objectives}
    />
    <UnifiedChatInterface
      mode="task"
      taskId={taskId}
      attemptId={attemptId}
    />
    <VocabularyHints vocabulary={hints} />
  </>
)}

// 3. Completion suggestion
{shouldSuggestCompletion && (
  <CompletionSuggestion
    onAccept={() => setPhase('review')}
    onDecline={() => continueTask()}
  />
)}

// 4. Post-task review
{phase === 'review' && (
  <PostTaskReview
    attemptId={attemptId}
    onSubmit={() => router.push('/dashboard')}
  />
)}
```

---

## Related Components

- [Chat Components](./chat.md) - Chat interfaces
- [Conversation Components](./conversation.md) - Messages
- [Vocabulary Components](./vocabulary.md) - Japanese text
- [Progress Bar](../design-system.md#progress) - Progress indicator

### Related Hooks
- [useTaskProgress](../hooks.md#usetaskprogress)
- [useTaskFeedbackProgress](../hooks.md#usetaskfeedbackprogress)

---

[← Back to Index](../README.md)
