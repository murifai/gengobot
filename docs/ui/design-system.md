# Design System Components

> Reusable UI components built with Radix UI primitives and Tailwind CSS

[← Back to Index](./README.md)

---

## Overview

The design system consists of 29 foundational UI components located in `/src/components/ui/`. These components are built using:

- **Radix UI** - Accessible, unstyled primitives
- **Tailwind CSS** - Utility-first styling
- **Class Variance Authority (CVA)** - Component variants
- **TypeScript** - Type safety

All components follow these principles:
- **Accessible by default** - WCAG AA compliant
- **Composable** - Can be combined and nested
- **Themeable** - Support light/dark modes
- **Type-safe** - Full TypeScript support
- **Polymorphic** - Support `asChild` prop for composition

---

## Table of Contents

- [Base Components](#base-components)
- [Layout Components](#layout-components)
- [Overlay Components](#overlay-components)
- [Form Components](#form-components)
- [Feedback & Status Components](#feedback--status-components)
- [Media Components](#media-components)
- [Other Components](#other-components)

---

## Base Components

### Button

**File:** `/src/components/ui/Button.tsx`

Multi-variant button component with full accessibility support.

#### Variants
- `default` - Primary action button
- `destructive` - Dangerous actions (delete, remove)
- `outline` - Secondary actions
- `secondary` - Alternative secondary style
- `ghost` - Minimal button without background
- `link` - Link-styled button

#### Sizes
- `default` - Standard size
- `sm` - Small button
- `lg` - Large button
- `icon` - Square icon button

#### Usage

```tsx
import { Button } from '@/components/ui/Button'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Skip</Button>

// With sizes
<Button size="sm">Small button</Button>
<Button size="lg">Large button</Button>
<Button size="icon"><TrashIcon /></Button>

// As child (polymorphic)
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>

// With loading state
<Button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

#### Props
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}
```

---

### Card

**File:** `/src/components/ui/Card.tsx`

Compound component for content containers with consistent styling.

#### Sub-components
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text (h3)
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section (often used for actions)

#### Usage

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/Card'

// Full card example
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      This is a description of the card content
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </CardFooter>
</Card>

// Simple card
<Card>
  <CardContent className="pt-6">
    Simple card without header
  </CardContent>
</Card>
```

---

### Input

**File:** `/src/components/ui/Input.tsx`

Text input field with consistent styling and error states.

#### Usage

```tsx
import { Input } from '@/components/ui/Input'

// Basic input
<Input type="text" placeholder="Enter text..." />

// With label
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>

// Disabled state
<Input disabled value="Cannot edit" />

// With error (add custom styling)
<Input
  className="border-red-500"
  placeholder="Error state"
/>
```

#### Props
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

---

### Textarea

**File:** `/src/components/ui/textarea.tsx`

Multi-line text input component.

#### Usage

```tsx
import { Textarea } from '@/components/ui/textarea'

// Basic textarea
<Textarea placeholder="Enter long text..." />

// With rows
<Textarea rows={5} placeholder="Your message..." />

// With label
<div>
  <Label htmlFor="description">Description</Label>
  <Textarea id="description" placeholder="Describe..." />
</div>
```

---

### Label

**File:** `/src/components/ui/label.tsx`

Accessible form label based on Radix UI Label.

#### Usage

```tsx
import { Label } from '@/components/ui/label'

<div className="grid gap-2">
  <Label htmlFor="username">Username</Label>
  <Input id="username" />
</div>
```

---

### Badge

**File:** `/src/components/ui/Badge.tsx`

Small status or label indicator.

#### Variants
- `default` - Standard badge
- `secondary` - Secondary style
- `destructive` - Error or warning
- `outline` - Outlined badge

#### Usage

```tsx
import { Badge } from '@/components/ui/Badge'

<Badge>New</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="secondary">Beta</Badge>
```

---

### Skeleton

**File:** `/src/components/ui/skeleton.tsx`

Loading skeleton placeholder for content.

#### Usage

```tsx
import { Skeleton } from '@/components/ui/skeleton'

// Line skeleton
<Skeleton className="h-4 w-full" />

// Circle skeleton (avatar)
<Skeleton className="h-12 w-12 rounded-full" />

// Card skeleton
<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>
```

---

## Layout Components

### Sidebar

**File:** `/src/components/ui/sidebar.tsx`

Complex, accessible sidebar navigation system with 20+ sub-components.

#### Key Sub-components
- `SidebarProvider` - Context provider (required)
- `Sidebar` - Main sidebar container
- `SidebarHeader` - Header area
- `SidebarContent` - Scrollable content area
- `SidebarFooter` - Footer area
- `SidebarMenu` - Menu container
- `SidebarMenuItem` - Individual menu item
- `SidebarMenuButton` - Clickable menu button
- `SidebarMenuAction` - Action button in menu item
- `SidebarMenuSub` - Submenu container
- `SidebarTrigger` - Toggle button to open/close
- `SidebarRail` - Drag handle for resizing
- `SidebarInset` - Main content area (outside sidebar)
- `SidebarGroup` - Group of menu items
- `SidebarGroupLabel` - Label for a group
- `SidebarGroupContent` - Content of a group

#### Usage

```tsx
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-semibold">App Name</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <HomeIcon />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/settings">
                  <SettingsIcon />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <UserProfile />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <h1>Page Title</h1>
        </header>
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

---

### Breadcrumb

**File:** `/src/components/ui/breadcrumb.tsx`

Navigation breadcrumb trail showing current page hierarchy.

#### Sub-components
- `Breadcrumb` - Container
- `BreadcrumbList` - List wrapper
- `BreadcrumbItem` - Individual item
- `BreadcrumbLink` - Clickable link
- `BreadcrumbSeparator` - Separator between items
- `BreadcrumbPage` - Current page (not clickable)
- `BreadcrumbEllipsis` - Collapsed items indicator

#### Usage

```tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

### Separator

**File:** `/src/components/ui/separator.tsx`

Visual divider line (horizontal or vertical).

#### Usage

```tsx
import { Separator } from '@/components/ui/separator'

// Horizontal separator (default)
<Separator />

// Vertical separator
<div className="flex h-5 items-center space-x-4">
  <div>Item 1</div>
  <Separator orientation="vertical" />
  <div>Item 2</div>
</div>

// With custom styling
<Separator className="my-4" />
```

---

## Overlay Components

### Dialog

**File:** `/src/components/ui/Dialog.tsx`

Modal dialog overlay for important interactions.

#### Sub-components
- `Dialog` - Root component (manages state)
- `DialogTrigger` - Element that opens dialog
- `DialogContent` - Dialog content container
- `DialogHeader` - Header section
- `DialogTitle` - Dialog title
- `DialogDescription` - Description text
- `DialogFooter` - Footer section (actions)
- `DialogClose` - Close button

#### Usage

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Controlled dialog
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  {/* ... */}
</Dialog>
```

---

### Sheet

**File:** `/src/components/ui/sheet.tsx`

Slide-out panel from screen edge (drawer).

#### Sides
- `top` - Slide from top
- `right` - Slide from right (default)
- `bottom` - Slide from bottom
- `left` - Slide from left

#### Sub-components
- `Sheet` - Root component
- `SheetTrigger` - Element that opens sheet
- `SheetContent` - Sheet content container
- `SheetHeader` - Header section
- `SheetTitle` - Sheet title
- `SheetDescription` - Description text
- `SheetFooter` - Footer section

#### Usage

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// Right slide (default)
<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>

  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>
        Sheet description
      </SheetDescription>
    </SheetHeader>
    <div className="py-4">
      {/* Sheet content */}
    </div>
  </SheetContent>
</Sheet>

// Bottom sheet (mobile drawer)
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="bottom">
    {/* Content */}
  </SheetContent>
</Sheet>
```

---

### Tooltip

**File:** `/src/components/ui/tooltip.tsx`

Hover tooltip for additional information.

#### Sub-components
- `TooltipProvider` - Context provider (wrap app)
- `Tooltip` - Root component
- `TooltipTrigger` - Element that shows tooltip on hover
- `TooltipContent` - Tooltip content

#### Usage

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Wrap your app with TooltipProvider once
<TooltipProvider>
  <App />
</TooltipProvider>

// Use tooltip
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>This is a tooltip</p>
  </TooltipContent>
</Tooltip>
```

---

### Dropdown Menu

**File:** `/src/components/ui/dropdown-menu.tsx`

Dropdown menu for actions and options.

#### Sub-components
- `DropdownMenu` - Root component
- `DropdownMenuTrigger` - Element that opens menu
- `DropdownMenuContent` - Menu content container
- `DropdownMenuItem` - Individual menu item
- `DropdownMenuCheckboxItem` - Checkbox menu item
- `DropdownMenuRadioGroup` - Radio group container
- `DropdownMenuRadioItem` - Radio menu item
- `DropdownMenuLabel` - Label for menu section
- `DropdownMenuSeparator` - Separator line
- `DropdownMenuShortcut` - Keyboard shortcut display
- `DropdownMenuGroup` - Group of items
- `DropdownMenuSub` - Submenu

#### Usage

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// With icons and shortcuts
<DropdownMenuContent>
  <DropdownMenuItem>
    <UserIcon className="mr-2 h-4 w-4" />
    <span>Profile</span>
    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
  </DropdownMenuItem>
</DropdownMenuContent>
```

---

## Form Components

### Select

**File:** `/src/components/ui/select.tsx`

Dropdown select component for forms.

#### Sub-components
- `Select` - Root component
- `SelectTrigger` - Button that opens select
- `SelectValue` - Shows selected value
- `SelectContent` - Dropdown content
- `SelectItem` - Individual option
- `SelectGroup` - Group of items
- `SelectLabel` - Label for group

#### Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// Controlled select
const [value, setValue] = useState('')

<Select value={value} onValueChange={setValue}>
  {/* ... */}
</Select>

// With groups
<SelectContent>
  <SelectGroup>
    <SelectLabel>Fruits</SelectLabel>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectGroup>
  <SelectGroup>
    <SelectLabel>Vegetables</SelectLabel>
    <SelectItem value="carrot">Carrot</SelectItem>
  </SelectGroup>
</SelectContent>
```

---

### Message Input

**File:** `/src/components/ui/message-input.tsx`

Advanced message input component (13KB - complex component).

#### Features
- Auto-resizing textarea
- File attachment support
- Voice recording button
- Send button
- Character count
- Keyboard shortcuts (Ctrl+Enter to send)
- Emoji picker integration
- Mentions support

#### Usage

```tsx
import { MessageInput } from '@/components/ui/message-input'

<MessageInput
  value={message}
  onChange={setMessage}
  onSend={handleSend}
  placeholder="Type a message..."
  disabled={isLoading}
  maxLength={1000}
  showCharCount={true}
  onFileAttach={handleFileAttach}
  onVoiceRecord={handleVoiceRecord}
/>
```

---

## Feedback & Status Components

### LoadingState

**File:** `/src/components/ui/LoadingState.tsx`

Loading indicator component with optional message.

#### Usage

```tsx
import { LoadingState } from '@/components/ui/LoadingState'

<LoadingState />

<LoadingState message="Loading data..." />

<LoadingState size="large" />
```

---

### ErrorBoundary

**File:** `/src/components/ui/ErrorBoundary.tsx`

React error boundary component (6.4KB).

#### Usage

```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

<ErrorBoundary
  fallback={<div>Something went wrong</div>}
  onError={(error, errorInfo) => {
    console.error('Error:', error, errorInfo)
  }}
>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  fallback={(error, resetError) => (
    <div>
      <h2>Error: {error.message}</h2>
      <Button onClick={resetError}>Try again</Button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

---

### Notification

**File:** `/src/components/ui/Notification.tsx`

Toast notification system (7.9KB).

#### Features
- Multiple variants (success, error, warning, info)
- Auto-dismiss with configurable duration
- Action buttons
- Position control
- Queue management

#### Usage

```tsx
import { useNotification } from '@/components/ui/Notification'

const { showNotification } = useNotification()

// Success notification
showNotification({
  type: 'success',
  message: 'Action completed successfully!',
  duration: 3000,
})

// Error notification
showNotification({
  type: 'error',
  message: 'Something went wrong',
  duration: 5000,
})

// With action button
showNotification({
  type: 'info',
  message: 'New update available',
  action: {
    label: 'Update',
    onClick: handleUpdate,
  },
  duration: 0, // Won't auto-dismiss
})
```

---

### Progress

**File:** `/src/components/ui/progress.tsx`

Progress bar component.

#### Usage

```tsx
import { Progress } from '@/components/ui/progress'

<Progress value={60} max={100} />

// Indeterminate progress
<Progress />

// Custom styling
<Progress value={30} className="h-2" />
```

---

### Guided Tour

**File:** `/src/components/ui/GuidedTour.tsx`

Onboarding tour component with step-by-step guidance (9.6KB).

#### Features
- Step highlighting
- Tooltips with content
- Navigation controls (next, back, skip)
- Progress indicator
- Keyboard navigation
- Custom positioning

#### Usage

```tsx
import { GuidedTour } from '@/components/ui/GuidedTour'

const steps = [
  {
    target: '#welcome',
    content: 'Welcome to the app!',
    title: 'Getting Started',
  },
  {
    target: '#feature-1',
    content: 'This is feature 1',
    title: 'Feature 1',
  },
  {
    target: '#feature-2',
    content: 'This is feature 2',
    title: 'Feature 2',
  },
]

<GuidedTour
  steps={steps}
  onComplete={handleComplete}
  onSkip={handleSkip}
  isOpen={showTour}
/>
```

---

## Media Components

### Avatar

**File:** `/src/components/ui/avatar.tsx`

User avatar component with fallback.

#### Sub-components
- `Avatar` - Container
- `AvatarImage` - Image element
- `AvatarFallback` - Fallback content (shown if image fails)

#### Usage

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// With image
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="John Doe" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Fallback only
<Avatar>
  <AvatarFallback>UN</AvatarFallback>
</Avatar>

// Different sizes
<Avatar className="h-20 w-20">
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

### File Preview

**File:** `/src/components/ui/file-preview.tsx`

Component to preview attached files.

#### Usage

```tsx
import { FilePreview } from '@/components/ui/file-preview'

<FilePreview
  file={file}
  onRemove={handleRemove}
  showSize={true}
/>
```

---

### Audio Visualizer

**File:** `/src/components/ui/audio-visualizer.tsx`

Real-time audio visualization component (5.9KB).

#### Features
- Waveform display
- Frequency bars
- Volume level indicator
- Real-time updates

#### Usage

```tsx
import { AudioVisualizer } from '@/components/ui/audio-visualizer'

const audioContext = new AudioContext()
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

<AudioVisualizer
  audioContext={audioContext}
  stream={stream}
  barCount={32}
  barColor="#ff5e75"
/>
```

---

### Simple Audio Visualizer

**File:** `/src/components/ui/simple-audio-visualizer.tsx`

Lightweight audio visualizer with basic animation.

#### Usage

```tsx
import { SimpleAudioVisualizer } from '@/components/ui/simple-audio-visualizer'

<SimpleAudioVisualizer isActive={isRecording} />
```

---

## Other Components

### Scroll Area

**File:** `/src/components/ui/scroll-area.tsx`

Custom scrollable container with styled scrollbar.

#### Usage

```tsx
import { ScrollArea } from '@/components/ui/scroll-area'

<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  <div className="space-y-2">
    {/* Long content */}
  </div>
</ScrollArea>

// Horizontal scroll
<ScrollArea className="w-96 whitespace-nowrap" orientation="horizontal">
  <div className="flex gap-4">
    {/* Horizontal content */}
  </div>
</ScrollArea>
```

---

### Interrupt Prompt

**File:** `/src/components/ui/interrupt-prompt.tsx`

Prompt to interrupt ongoing actions.

#### Usage

```tsx
import { InterruptPrompt } from '@/components/ui/interrupt-prompt'

<InterruptPrompt
  isOpen={showPrompt}
  title="Interrupt current action?"
  message="This will stop the current process. Continue?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

---

## Component Utilities

### cn() Function

Located in `/src/lib/utils.ts`, the `cn()` utility combines `clsx` and `tailwind-merge` for proper className handling.

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class',
  className // From props
)} />
```

---

## Next Steps

- [Feature Components](./components/) - Domain-specific components
- [Styling Guide](./styling-guide.md) - Theming and customization
- [Patterns & Best Practices](./patterns-and-practices.md) - Development guidelines

[← Back to Index](./README.md)
