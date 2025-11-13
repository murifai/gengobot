# Layout Components

> Page layout and structure components

[← Back to Index](../README.md)

---

## Overview

Layout components are located in `/src/components/layout/` and provide the fundamental structure for pages in the application.

**Components:** 3

**Note:** Some of these are legacy components. For new implementations, consider using the newer components in `/src/components/dashboard/` and `/src/components/ui/sidebar.tsx`.

---

## Header

**File:** `/src/components/layout/Header.tsx`

Main application header component.

### Features
- Logo and branding
- Main navigation links
- User authentication status
- Login/logout buttons
- User profile dropdown
- Mobile hamburger menu
- Sticky positioning
- Theme toggle

### Usage

```tsx
import { Header } from '@/components/layout/Header'

<Header
  user={currentUser}
  onLogin={() => router.push('/login')}
  onLogout={handleLogout}
  navigationLinks={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Study', href: '/study' },
    { label: 'Progress', href: '/progress' },
  ]}
/>
```

### Props

```typescript
interface HeaderProps {
  user?: User | null
  onLogin?: () => void
  onLogout?: () => void
  navigationLinks?: NavigationLink[]
  showThemeToggle?: boolean
  sticky?: boolean
}

interface NavigationLink {
  label: string
  href: string
  icon?: React.ComponentType
  badge?: string | number
}
```

---

## MainLayout

**File:** `/src/components/layout/MainLayout.tsx`

Main layout wrapper that combines header, sidebar, and content area.

### Features
- Responsive layout structure
- Header integration
- Sidebar integration
- Main content area
- Footer area
- Authentication checks
- Loading states
- Error boundaries
- Mobile-responsive
- Breadcrumb support

### Usage

```tsx
import { MainLayout } from '@/components/layout/MainLayout'

export default function Page() {
  return (
    <MainLayout
      title="Page Title"
      subtitle="Page description"
      showSidebar={true}
      requireAuth={true}
    >
      <div>
        {/* Page content */}
      </div>
    </MainLayout>
  )
}

// With breadcrumbs
<MainLayout
  title="Task Details"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Current Task', href: '#' },
  ]}
>
  {/* Content */}
</MainLayout>

// Without sidebar
<MainLayout showSidebar={false}>
  {/* Full-width content */}
</MainLayout>
```

### Props

```typescript
interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  showSidebar?: boolean
  showHeader?: boolean
  showFooter?: boolean
  requireAuth?: boolean
  loading?: boolean
  className?: string
}
```

### Layout Structure

```tsx
<MainLayout>
  {/* Rendered as: */}
  <div className="min-h-screen">
    <Header />
    <div className="flex">
      {showSidebar && <Sidebar />}
      <main className="flex-1">
        {breadcrumbs && <Breadcrumb />}
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
        {children}
      </main>
    </div>
    {showFooter && <Footer />}
  </div>
</MainLayout>
```

---

## Sidebar

**File:** `/src/components/layout/Sidebar.tsx`

**⚠️ Legacy Component** - Consider using `/src/components/ui/sidebar.tsx` or `/src/components/dashboard/app-sidebar.tsx` for new implementations.

Basic sidebar navigation component.

### Features
- Navigation menu
- Collapsible sections
- Active link highlighting
- Icon support
- Mobile drawer mode

### Usage

```tsx
import { Sidebar } from '@/components/layout/Sidebar'

<Sidebar
  links={[
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      label: 'Tasks',
      href: '/tasks',
      icon: TaskIcon,
    },
  ]}
  currentPath={pathname}
  onNavigate={(path) => router.push(path)}
/>
```

### Migration to New Sidebar

**Old (Legacy):**
```tsx
import { Sidebar } from '@/components/layout/Sidebar'

<Sidebar links={links} />
```

**New (Recommended):**
```tsx
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

<SidebarProvider>
  <Sidebar>
    <SidebarContent>
      <SidebarMenu>
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild>
              <Link href={link.href}>
                <link.icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
</SidebarProvider>
```

---

## Layout Patterns

### Dashboard Layout

```tsx
import { MainLayout } from '@/components/layout/MainLayout'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default function DashboardPage() {
  return (
    <MainLayout>
      <AppSidebar />
      <div className="flex-1">
        <DashboardHeader title="Dashboard" />
        <main className="p-6">
          {/* Dashboard content */}
        </main>
      </div>
    </MainLayout>
  )
}
```

### Full-Width Layout

```tsx
<MainLayout showSidebar={false} showHeader={false}>
  <div className="container mx-auto py-12">
    {/* Centered content */}
  </div>
</MainLayout>
```

### Authenticated Layout

```tsx
<MainLayout requireAuth={true}>
  {/* Only shown to logged-in users */}
</MainLayout>
```

---

## Responsive Behavior

### Mobile
- Header becomes compact
- Sidebar converts to drawer
- Navigation in hamburger menu
- Content takes full width

### Tablet
- Sidebar can be toggled
- Header remains full
- Content adjusts to available space

### Desktop
- Full sidebar visible
- All navigation expanded
- Optimal content width

---

## Authentication Integration

```tsx
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedPage() {
  const { user, loading } = useAuth()

  return (
    <MainLayout requireAuth={true} loading={loading}>
      {user ? (
        <div>Welcome, {user.name}!</div>
      ) : (
        <div>Please log in</div>
      )}
    </MainLayout>
  )
}
```

---

## Recommended Modern Alternatives

For new development, use these instead:

### Dashboard Layouts
- [AppSidebar](./dashboard.md#app-sidebar) - Modern user sidebar
- [AdminSidebar](./dashboard.md#admin-sidebar) - Modern admin sidebar
- [DashboardHeader](./dashboard.md#dashboard-header) - Modern header

### Base Components
- [Sidebar (Design System)](../design-system.md#sidebar) - Full-featured sidebar
- [Breadcrumb](../design-system.md#breadcrumb) - Navigation breadcrumbs

---

## Related Components

- [Dashboard Components](./dashboard.md) - Modern layout components
- [Design System Sidebar](../design-system.md#sidebar) - Advanced sidebar

---

[← Back to Index](../README.md)
