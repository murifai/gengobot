# Dashboard Components

> Layout components for dashboard and admin sections

[← Back to Index](../README.md)

---

## Overview

Dashboard components are located in `/src/components/dashboard/` and provide navigation and layout structure for both user dashboard and admin sections.

**Components:** 4

---

## Admin Header

**File:** `/src/components/dashboard/admin-header.tsx`

Header component for the admin section.

### Features
- Admin breadcrumb navigation
- Page title display
- Quick actions menu
- User profile dropdown
- Settings access
- Notification bell
- Search functionality

### Usage

```tsx
import { AdminHeader } from '@/components/dashboard/admin-header'

<AdminHeader
  title="Manage Tasks"
  breadcrumbs={[
    { label: 'Admin', href: '/admin' },
    { label: 'Tasks', href: '/admin/tasks' },
  ]}
/>
```

---

## Admin Sidebar

**File:** `/src/components/dashboard/admin-sidebar.tsx`

Sidebar navigation for the admin section.

### Features
- Admin navigation links:
  - Dashboard
  - Users
  - Tasks
  - Decks
  - Characters
  - Categories
  - Analytics
  - Settings
- Active route highlighting
- Collapsible groups
- Icon + label navigation
- Badge indicators (counts, alerts)
- Mobile-responsive

### Usage

```tsx
import { AdminSidebar } from '@/components/dashboard/admin-sidebar'

<AdminSidebar
  currentPath="/admin/tasks"
  onNavigate={(path) => router.push(path)}
/>
```

---

## App Sidebar

**File:** `/src/components/dashboard/app-sidebar.tsx`

Main application sidebar for user dashboard.

### Features
- User navigation links:
  - Dashboard home
  - Tasks
  - Study decks
  - Characters
  - Progress
  - Settings
- Character quick-select
- Deck quick-access
- Recent items
- Upcoming tasks indicator
- Progress widgets
- User profile section
- Theme toggle

### Usage

```tsx
import { AppSidebar } from '@/components/dashboard/app-sidebar'

<AppSidebar
  user={currentUser}
  currentPath="/dashboard/tasks"
  recentDecks={recentDecks}
  upcomingTasks={upcomingTasks}
/>
```

### Props

```typescript
interface AppSidebarProps {
  user: User
  currentPath: string
  recentDecks?: Deck[]
  upcomingTasks?: Task[]
  onNavigate?: (path: string) => void
}
```

---

## Dashboard Header

**File:** `/src/components/dashboard/dashboard-header.tsx`

Header component for user dashboard pages.

### Features
- Page title and description
- Breadcrumb navigation
- Quick action buttons
- Search bar
- Notification center
- User profile menu
- Help/documentation link

### Usage

```tsx
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

<DashboardHeader
  title="My Tasks"
  description="Practice Japanese with interactive tasks"
  actions={
    <Button onClick={() => router.push('/dashboard/tasks/new')}>
      New Task
    </Button>
  }
/>

// With breadcrumbs
<DashboardHeader
  title="Task Details"
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tasks', href: '/dashboard/tasks' },
    { label: 'Current Task', href: '#' },
  ]}
/>
```

### Props

```typescript
interface DashboardHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode
  showSearch?: boolean
  showNotifications?: boolean
}
```

---

## Layout Integration

### User Dashboard Layout

```tsx
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} currentPath={pathname} />
      <SidebarInset>
        <DashboardHeader
          title="Dashboard"
          showSearch={true}
          showNotifications={true}
        />
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### Admin Dashboard Layout

```tsx
import { AdminSidebar } from '@/components/dashboard/admin-sidebar'
import { AdminHeader } from '@/components/dashboard/admin-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <AdminSidebar currentPath={pathname} />
      <SidebarInset>
        <AdminHeader
          title="Admin Panel"
          breadcrumbs={breadcrumbs}
        />
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

---

## Customization

### Theme Integration

Both sidebars support theme switching:

```tsx
<AppSidebar
  user={user}
  currentPath={pathname}
  theme={theme}
  onThemeChange={(newTheme) => setTheme(newTheme)}
/>
```

### Custom Navigation Items

```tsx
const customNavItems = [
  {
    label: 'Custom Page',
    href: '/custom',
    icon: CustomIcon,
    badge: '3',
  },
]

<AppSidebar
  user={user}
  currentPath={pathname}
  customItems={customNavItems}
/>
```

---

## Related Components

- [Sidebar (Design System)](../design-system.md#sidebar) - Base sidebar component
- [Breadcrumb](../design-system.md#breadcrumb) - Navigation breadcrumbs
- [Layout Components](./layout.md) - Page layouts

---

[← Back to Index](../README.md)
