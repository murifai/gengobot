# Admin Components

> Components for administrative interfaces and management

[← Back to Index](../README.md)

---

## Overview

Admin components are located in `/src/components/admin/` and provide interfaces for managing application content, users, and settings.

**Components:** 2

---

## DeckSelector

**File:** `/src/components/admin/DeckSelector.tsx`

Deck selection interface for administrators to choose decks for editing or management.

### Features
- Browse all available decks
- Filter by category
- Search functionality
- Deck statistics display
- Select deck for editing
- Multi-deck operations

### Usage

```tsx
import { DeckSelector } from '@/components/admin/DeckSelector'

<DeckSelector
  onSelect={(deckId) => {
    console.log('Selected deck:', deckId)
    router.push(`/admin/decks/${deckId}/edit`)
  }}
  selectedDeckId={currentDeckId}
/>
```

### Props

```typescript
interface DeckSelectorProps {
  onSelect: (deckId: string) => void
  selectedDeckId?: string
  filterCategory?: string
  showStatistics?: boolean
}
```

---

## TaskEditorForm

**File:** `/src/components/admin/TaskEditorForm.tsx`

Comprehensive form for creating and editing tasks.

### Features
- Edit task content and description
- Set difficulty levels (N5, N4, N3, N2, N1)
- Assign categories
- Configure task parameters:
  - Maximum messages
  - Time limits
  - Required vocabulary
  - Grammar points
- Add scenario context
- Configure AI character
- Preview task before saving

### Usage

```tsx
import { TaskEditorForm } from '@/components/admin/TaskEditorForm'

// Create new task
<TaskEditorForm
  onSave={(taskData) => {
    createTask(taskData)
  }}
  onCancel={() => router.back()}
/>

// Edit existing task
<TaskEditorForm
  taskId={taskId}
  initialData={taskData}
  onSave={(taskData) => {
    updateTask(taskId, taskData)
  }}
  onCancel={() => router.back()}
/>
```

### Props

```typescript
interface TaskEditorFormProps {
  taskId?: string
  initialData?: Task
  onSave: (taskData: Partial<Task>) => void
  onCancel: () => void
}

interface Task {
  id: string
  title: string
  description: string
  scenario: string
  difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  categoryId: string
  maxMessages?: number
  timeLimit?: number
  vocabulary?: string[]
  grammarPoints?: string[]
  characterId?: string
}
```

---

## Related Components

### Admin Pages
- [Admin Dashboard](../pages.md#admin-section)
- [Admin Layout](../pages.md#admin-layout)

### Admin Sidebar
- [Admin Sidebar Component](./dashboard.md#admin-sidebar)

---

[← Back to Index](../README.md)
