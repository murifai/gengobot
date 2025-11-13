# Patterns & Best Practices

> Component patterns, development guidelines, and best practices

[← Back to Index](./README.md)

---

## Table of Contents

- [Component Patterns](#component-patterns)
- [Development Best Practices](#development-best-practices)
- [Performance Optimization](#performance-optimization)
- [Accessibility Guidelines](#accessibility-guidelines)
- [State Management](#state-management)
- [Testing](#testing)
- [Contributing Guidelines](#contributing-guidelines)

---

## Component Patterns

### 1. Compound Components

Components that work together to form a complete UI pattern.

**Example: Card Component**

```tsx
// components/ui/Card.tsx
export function Card({ children, ...props }: CardProps) {
  return <div className="rounded-lg border bg-card" {...props}>{children}</div>
}

export function CardHeader({ children }: Props) {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>
}

export function CardTitle({ children }: Props) {
  return <h3 className="font-semibold">{children}</h3>
}

export function CardContent({ children }: Props) {
  return <div className="p-6 pt-0">{children}</div>
}

// Usage
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

**Benefits:**
- Flexible composition
- Clear component hierarchy
- Easy to understand and maintain

---

### 2. Polymorphic Components (`asChild` Pattern)

Components that can render as different elements using Radix UI's `Slot` component.

```tsx
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps {
  asChild?: boolean
  children: React.ReactNode
}

export function Button({ asChild = false, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp className="button-styles" {...props}>
      {children}
    </Comp>
  )
}

// Usage
// As button
<Button>Click me</Button>

// As link
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>

// As custom component
<Button asChild>
  <CustomComponent>Custom</CustomComponent>
</Button>
```

**Benefits:**
- Reuse styling without wrapper divs
- Better semantic HTML
- Type-safe composition

---

### 3. Variant-based Design (CVA)

Using Class Variance Authority for managing component variants.

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// Usage
<Button variant="default">Default</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline" size="lg">Outline</Button>
```

**Benefits:**
- Type-safe variants
- Clear API
- Easy to maintain and extend

---

### 4. Context Pattern

For sharing state across component trees.

```tsx
import { createContext, useContext, useState } from 'react'

// Define context type
interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
}

// Create context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

// Provider component
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

// Hook to use context
export function useSidebar() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }

  return context
}

// Usage
function App() {
  return (
    <SidebarProvider>
      <Sidebar />
      <MainContent />
    </SidebarProvider>
  )
}

function Sidebar() {
  const { isOpen, toggle } = useSidebar()

  return (
    <div className={cn('sidebar', isOpen && 'open')}>
      <button onClick={toggle}>Toggle</button>
    </div>
  )
}
```

---

### 5. Render Props Pattern

For flexible component rendering.

```tsx
interface DataFetcherProps<T> {
  url: string
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return children(data, loading, error)
}

// Usage
<DataFetcher<User> url="/api/user">
  {(user, loading, error) => {
    if (loading) return <LoadingState />
    if (error) return <ErrorState error={error} />
    if (!user) return null

    return <UserProfile user={user} />
  }}
</DataFetcher>
```

---

### 6. Forward Ref Pattern

For components that need ref access.

```tsx
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn('input-styles', className)}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

// Usage
const inputRef = useRef<HTMLInputElement>(null)

<Input ref={inputRef} />

// Access ref
inputRef.current?.focus()
```

---

## Development Best Practices

### TypeScript

#### 1. Define Clear Interfaces

```tsx
// Good
interface UserProfileProps {
  user: {
    id: string
    name: string
    email: string
  }
  onEdit: (userId: string) => void
  showActions?: boolean
}

// Avoid
function UserProfile(props: any) {
  // ...
}
```

#### 2. Use Type Inference

```tsx
// Good
const [count, setCount] = useState(0) // inferred as number

// Avoid unnecessary typing
const [count, setCount] = useState<number>(0)
```

#### 3. Export Types

```tsx
// components/Button.tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

// Other files can import
import type { ButtonProps } from './Button'
```

---

### Component Structure

#### File Organization

```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// 2. Types
interface MyComponentProps {
  // ...
}

// 3. Component
export function MyComponent({ ...props }: MyComponentProps) {
  // 3a. Hooks
  const [state, setState] = useState()

  // 3b. Derived values
  const derivedValue = useMemo(() => compute(state), [state])

  // 3c. Event handlers
  const handleClick = useCallback(() => {
    // ...
  }, [])

  // 3d. Effects
  useEffect(() => {
    // ...
  }, [])

  // 3e. Render
  return <div>{/* JSX */}</div>
}

// 4. Display name (for debugging)
MyComponent.displayName = 'MyComponent'
```

---

### Naming Conventions

```tsx
// Components: PascalCase
function UserProfile() {}

// Hooks: camelCase with 'use' prefix
function useUserData() {}

// Utilities: camelCase
function formatDate() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3

// Props interfaces: PascalCase with 'Props' suffix
interface UserProfileProps {}

// Event handlers: 'handle' prefix
const handleClick = () => {}
const handleSubmit = () => {}

// Boolean props: 'is' or 'has' prefix
<Button isLoading disabled hasError />

// Callback props: 'on' prefix
<Button onClick={handleClick} onSubmit={handleSubmit} />
```

---

## Performance Optimization

### 1. React.memo

Prevent unnecessary re-renders for components that receive the same props.

```tsx
import { memo } from 'react'

interface ExpensiveComponentProps {
  data: ComplexData
  onAction: () => void
}

export const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  onAction,
}: ExpensiveComponentProps) {
  // Expensive rendering logic
  return <div>{/* Complex UI */}</div>
})

// Usage
<ExpensiveComponent data={data} onAction={handleAction} />
```

**When to use:**
- Component renders often with same props
- Component has expensive rendering logic
- Component is in a list

**When NOT to use:**
- Props change frequently
- Simple components
- Premature optimization

---

### 2. useMemo

Cache expensive computations.

```tsx
import { useMemo } from 'react'

function DataTable({ data }: { data: Item[] }) {
  const sortedData = useMemo(() => {
    // Expensive sorting operation
    return data.sort((a, b) => a.value - b.value)
  }, [data])

  return (
    <table>
      {sortedData.map((item) => (
        <tr key={item.id}>{/* ... */}</tr>
      ))}
    </table>
  )
}
```

---

### 3. useCallback

Memoize callback functions.

```tsx
import { useCallback } from 'react'

function ParentComponent() {
  const [count, setCount] = useState(0)

  // Memoized callback
  const handleIncrement = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  return <ChildComponent onIncrement={handleIncrement} />
}

const ChildComponent = memo(function ChildComponent({
  onIncrement
}: {
  onIncrement: () => void
}) {
  return <button onClick={onIncrement}>Increment</button>
})
```

---

### 4. Code Splitting

```tsx
import { lazy, Suspense } from 'react'

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

---

### 5. Virtual Lists

For long lists, use virtualization.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function LongList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Accessibility Guidelines

### 1. Semantic HTML

```tsx
// Good
<button onClick={handleClick}>Click me</button>
<nav><ul><li><a href="/home">Home</a></li></ul></nav>
<main><article>Content</article></main>

// Avoid
<div onClick={handleClick}>Click me</div>
<div><div><div><span>Home</span></div></div></div>
```

---

### 2. ARIA Labels

```tsx
// Button with icon only
<button aria-label="Close dialog">
  <XIcon />
</button>

// Input with label
<div>
  <label htmlFor="email">Email</label>
  <input id="email" type="email" aria-required="true" />
</div>

// Section with description
<section aria-labelledby="section-title" aria-describedby="section-desc">
  <h2 id="section-title">Title</h2>
  <p id="section-desc">Description</p>
</section>
```

---

### 3. Keyboard Navigation

```tsx
function AccessibleMenu() {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        handleSelect()
        break
      case 'Escape':
        handleClose()
        break
      case 'ArrowDown':
        focusNext()
        break
      case 'ArrowUp':
        focusPrevious()
        break
    }
  }

  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {/* Menu items */}
    </div>
  )
}
```

---

### 4. Focus Management

```tsx
import { useEffect, useRef } from 'react'

function Dialog({ isOpen }: { isOpen: boolean }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus close button when dialog opens
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div role="dialog" aria-modal="true">
      <button ref={closeButtonRef}>Close</button>
      {/* Dialog content */}
    </div>
  )
}
```

---

### 5. Color Contrast

Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text).

```tsx
// Good contrast
<p className="text-gray-900 dark:text-gray-100">
  High contrast text
</p>

// Check contrast ratios in design system
// Primary color #ff5e75 has good contrast with white
<button className="bg-primary text-white">Button</button>
```

---

## State Management

### Local State

Use `useState` for component-local state.

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

---

### Lifted State

Share state between components by lifting it up.

```tsx
function Parent() {
  const [value, setValue] = useState('')

  return (
    <>
      <Input value={value} onChange={setValue} />
      <Display value={value} />
    </>
  )
}
```

---

### Context

For app-wide state (auth, theme, etc.).

```tsx
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

---

### URL State

For shareable/bookmarkable state.

```tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'

function FilteredList() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const filter = searchParams.get('filter') || 'all'

  const setFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('filter', newFilter)
    router.push(`?${params.toString()}`)
  }

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
      </select>
    </div>
  )
}
```

---

## Testing

### Unit Testing Components

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-destructive')
  })
})
```

---

## Contributing Guidelines

### Component Checklist

Before submitting a new component:

- [ ] TypeScript types defined with proper interfaces
- [ ] Proper ref forwarding (if applicable)
- [ ] `displayName` set for debugging
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Light/dark mode support
- [ ] Loading and error states handled
- [ ] Documented with usage examples
- [ ] Tests written
- [ ] Reviewed for performance

---

### Code Review Guidelines

When reviewing code:

1. **Functionality** - Does it work as expected?
2. **TypeScript** - Are types correct and comprehensive?
3. **Accessibility** - Can it be used with keyboard and screen reader?
4. **Performance** - Are there any performance issues?
5. **Styling** - Follows design system conventions?
6. **Testing** - Adequate test coverage?
7. **Documentation** - Clear and complete?

---

### Git Commit Messages

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting, missing semicolons, etc.
refactor: Code restructuring
test: Adding tests
chore: Maintenance

# Examples:
feat(ui): add Button component
fix(chat): resolve message ordering issue
docs(readme): update installation instructions
refactor(hooks): simplify useAuth implementation
```

---

## Related Documentation

- [Design System](./design-system.md) - UI components
- [Styling Guide](./styling-guide.md) - Styling conventions
- [Hooks](./hooks.md) - Custom hooks

---

[← Back to Index](./README.md)
