# Page Components

> Next.js App Router pages and layouts

[← Back to Index](./README.md)

---

## Overview

Page components are located in `/src/app/` and use Next.js 15's App Router pattern with React Server Components.

**Total:** 35 page components

---

## Root Pages

### Landing Page
**File:** `/src/app/page.tsx`

Main landing page of the application.

**Features:**
- Hero section
- Feature highlights
- Call-to-action
- Pricing information

---

### Root Layout
**File:** `/src/app/layout.tsx`

Root layout that wraps the entire application.

**Features:**
- HTML structure
- Provider wrappers (SessionProvider, AuthProvider)
- Global fonts
- Metadata configuration

```tsx
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

### Error Pages
- **`error.tsx`** - Error page with reset functionality
- **`global-error.tsx`** - Global error handler
- **`not-found.tsx`** - 404 page
- **`404.tsx`** - Alternative 404 page
- **`500.tsx`** - Server error page

---

## Authentication Pages

### Login Page
**File:** `/src/app/login/page.tsx`

User login page.

**Features:**
- Email/password login
- Social login (Google, etc.)
- Remember me option
- Forgot password link
- Sign up link

**Route:** `/login`

---

### Auth Error Page
**File:** `/src/app/auth/error/page.tsx`

Authentication error handling page.

**Route:** `/auth/error`

---

## Dashboard Section

**Base Route:** `/dashboard`
**Layout:** `/src/app/dashboard/layout.tsx`

### Dashboard Home
**File:** `/src/app/dashboard/page.tsx`

Main dashboard page.

**Features:**
- Overview statistics
- Recent tasks
- Progress summary
- Quick actions
- Upcoming study sessions

**Route:** `/dashboard`

---

### Chat Page
**File:** `/src/app/dashboard/chat/page.tsx`

Free chat with AI characters.

**Features:**
- Character selection
- Chat interface
- Voice conversation option
- Save conversations

**Route:** `/dashboard/chat`

---

### Characters Pages

#### Characters List
**File:** `/src/app/dashboard/characters/page.tsx`

Browse and manage AI characters.

**Route:** `/dashboard/characters`

#### New Character
**File:** `/src/app/dashboard/characters/new/page.tsx`

Create a new AI character.

**Route:** `/dashboard/characters/new`

#### Edit Character
**File:** `/src/app/dashboard/characters/[id]/edit/page.tsx`

Edit existing character.

**Route:** `/dashboard/characters/:id/edit`

---

### Progress Page
**File:** `/src/app/dashboard/progress/page.tsx`

View learning progress and statistics.

**Features:**
- Progress charts
- Study streak
- Vocabulary learned
- Time spent
- Achievements

**Route:** `/dashboard/progress`

---

### Settings Page
**File:** `/src/app/dashboard/settings/page.tsx`

User settings and preferences.

**Features:**
- Profile settings
- Notification preferences
- Theme selection
- Language settings
- Account management

**Route:** `/dashboard/settings`

---

### Tasks Pages

#### Tasks List
**File:** `/src/app/dashboard/tasks/page.tsx`

Browse available tasks.

**Features:**
- Task categories
- Difficulty filters
- Task recommendations
- Progress indicators

**Route:** `/dashboard/tasks`

#### Pre-Study Page
**File:** `/src/app/dashboard/tasks/[taskId]/pre-study/page.tsx`

Pre-task study materials.

**Route:** `/dashboard/tasks/:taskId/pre-study`

#### Task Attempt Page
**File:** `/src/app/dashboard/tasks/[taskId]/attempt/[attemptId]/page.tsx`

Active task interface.

**Features:**
- Chat interface
- Progress tracking
- Vocabulary hints
- Real-time feedback

**Route:** `/dashboard/tasks/:taskId/attempt/:attemptId`

---

## Admin Section

**Base Route:** `/admin`
**Layout:** `/src/app/admin/layout.tsx`
**Client Component:** `/src/app/admin/AdminLayoutClient.tsx`

### Admin Dashboard
**File:** `/src/app/admin/page.tsx`

Admin overview and statistics.

**Route:** `/admin`

---

### Analytics Page
**File:** `/src/app/admin/analytics/page.tsx`

Platform analytics and metrics.

**Route:** `/admin/analytics`

---

### Categories Page
**File:** `/src/app/admin/categories/page.tsx`

Manage task categories.

**Route:** `/admin/categories`

---

### Characters Admin Page
**File:** `/src/app/admin/characters/page.tsx`

Manage all AI characters.

**Route:** `/admin/characters`

---

### Decks Pages

#### Decks List
**File:** `/src/app/admin/decks/page.tsx`

Manage all flashcard decks.

**Route:** `/admin/decks`

#### Deck Detail
**File:** `/src/app/admin/decks/[deckId]/page.tsx`

View deck details and cards.

**Route:** `/admin/decks/:deckId`

#### Edit Deck
**File:** `/src/app/admin/decks/[deckId]/edit/page.tsx`

Edit deck information.

**Route:** `/admin/decks/:deckId/edit`

#### New Deck
**File:** `/src/app/admin/decks/new/page.tsx`

Create a new deck.

**Route:** `/admin/decks/new`

---

### Admin Settings Page
**File:** `/src/app/admin/settings/page.tsx`

Platform settings and configuration.

**Route:** `/admin/settings`

---

### Tasks Admin Pages

#### Tasks List
**File:** `/src/app/admin/tasks/page.tsx`

Manage all tasks.

**Route:** `/admin/tasks`

#### Task Detail
**File:** `/src/app/admin/tasks/[taskId]/page.tsx`

View task details and attempts.

**Route:** `/admin/tasks/:taskId`

#### Edit Task
**File:** `/src/app/admin/tasks/[taskId]/edit/page.tsx`

Edit task configuration.

**Route:** `/admin/tasks/:taskId/edit`

#### New Task
**File:** `/src/app/admin/tasks/new/page.tsx`

Create a new task.

**Route:** `/admin/tasks/new`

---

### Users Admin Page
**File:** `/src/app/admin/users/page.tsx`

Manage platform users.

**Route:** `/admin/users`

---

## Study Section

**Base Route:** `/(app)/study`

### Study Home
**File:** `/src/app/(app)/study/page.tsx`

Study mode home page.

**Route:** `/study`

---

### Study Deck
**File:** `/src/app/(app)/study/[deckId]/page.tsx`

Study a specific deck.

**Route:** `/study/:deckId`

---

### My Decks
**File:** `/src/app/(app)/study/my-decks/page.tsx`

User's personal deck collection.

**Route:** `/study/my-decks`

---

### Study Statistics
**File:** `/src/app/(app)/study/stats/page.tsx`

Study session statistics and analytics.

**Route:** `/study/stats`

---

### Decks Pages

#### New Deck
**File:** `/src/app/(app)/study/decks/new/page.tsx`

Create a personal deck.

**Route:** `/study/decks/new`

#### Deck Detail
**File:** `/src/app/(app)/study/decks/[deckId]/page.tsx`

View deck details.

**Route:** `/study/decks/:deckId`

#### Edit Deck
**File:** `/src/app/(app)/study/decks/[deckId]/edit/page.tsx`

Edit personal deck.

**Route:** `/study/decks/:deckId/edit`

---

## Other Pages

### WebRTC Chat
**File:** `/src/app/chat-webrtc/page.tsx`

Experimental WebRTC-based voice chat.

**Route:** `/chat-webrtc`

---

## Route Groups

### `(app)` Group
Contains study-related pages with shared layout.

### Admin Group
Contains all admin pages with admin layout.

### Dashboard Group
Contains user dashboard pages with dashboard layout.

---

## Layouts

### Dashboard Layout
**File:** `/src/app/dashboard/layout.tsx`

```tsx
export default function DashboardLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### Admin Layout
**File:** `/src/app/admin/layout.tsx`

```tsx
export default function AdminLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

---

## Page Patterns

### Server Component (Default)
```tsx
// app/page.tsx
export default async function Page() {
  const data = await fetchData()

  return <div>{/* Render with data */}</div>
}
```

### Client Component
```tsx
// app/page.tsx
'use client'

import { useState } from 'react'

export default function Page() {
  const [state, setState] = useState()

  return <div>{/* Interactive UI */}</div>
}
```

### With Loading State
```tsx
// app/page.tsx
export default function Page() {
  return <div>Page content</div>
}

// app/loading.tsx
export default function Loading() {
  return <LoadingState />
}
```

### With Error Boundary
```tsx
// app/page.tsx
export default function Page() {
  return <div>Page content</div>
}

// app/error.tsx
'use client'

export default function Error({ error, reset }: Props) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Metadata

### Static Metadata
```tsx
export const metadata: Metadata = {
  title: 'Dashboard - Gengotalk',
  description: 'Learn Japanese with AI',
}
```

### Dynamic Metadata
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const task = await getTask(params.taskId)

  return {
    title: `${task.title} - Gengotalk`,
    description: task.description,
  }
}
```

---

## Data Fetching

### Server Component
```tsx
export default async function Page() {
  // Fetch on server
  const tasks = await getTasks()

  return <TaskList tasks={tasks} />
}
```

### Client Component
```tsx
'use client'

export default function Page() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    fetchTasks().then(setTasks)
  }, [])

  return <TaskList tasks={tasks} />
}
```

---

## Protected Routes

### Server-side Protection
```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <div>Protected content</div>
}
```

### Client-side Protection
```tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedPage() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingState />
  if (!user) redirect('/login')

  return <div>Protected content</div>
}
```

---

## Related Documentation

- [Dashboard Components](./components/dashboard.md) - Layout components
- [Layout Components](./components/layout.md) - Page layouts

---

[← Back to Index](./README.md)
