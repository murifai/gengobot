# Styling Guide

> Tailwind CSS configuration, theming, and styling conventions

[← Back to Index](./README.md)

---

## Overview

Gengotalk uses **Tailwind CSS 4** as the primary styling solution with custom design tokens, animations, and theming support.

---

## Technology Stack

- **Tailwind CSS 4.0.12** - Utility-first CSS framework
- **CSS Variables** - For theming and design tokens
- **Framer Motion 12.1.0** - For complex animations
- **clsx + tailwind-merge** - For className management

---

## Color Palette

### Brand Colors

```css
:root {
  /* Primary Colors */
  --primary: #ff5e75;        /* Pink/Red - Main brand color */
  --secondary: #1dcddc;      /* Cyan - Secondary accent */

  /* Tertiary Colors */
  --tertiary-yellow: #fdf29d;
  --tertiary-green: #8bd17b;
  --tertiary-purple: #4a3e72;

  /* Neutrals */
  --dark: #0c1231;          /* Deep navy */
  --light: #ffffff;
}
```

### Semantic Colors

#### Light Mode
```css
:root {
  --background: 0 0% 100%;              /* White */
  --foreground: 222.2 84% 4.9%;         /* Dark navy */

  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  --primary: 352 89% 68%;                /* #ff5e75 */
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 352 89% 68%;

  --radius: 0.5rem;
}
```

#### Dark Mode
```css
.dark {
  --background: 222.2 84% 4.9%;         /* Deep navy */
  --foreground: 210 40% 98%;

  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;

  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;

  --primary: 352 89% 68%;
  --primary-foreground: 222.2 47.4% 11.2%;

  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;

  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 352 89% 68%;
}
```

---

## Using Colors

### Via Tailwind Classes

```tsx
// Background colors
<div className="bg-primary">Primary background</div>
<div className="bg-secondary">Secondary background</div>
<div className="bg-background">Background color</div>

// Text colors
<p className="text-primary">Primary text</p>
<p className="text-foreground">Foreground text</p>
<p className="text-muted-foreground">Muted text</p>

// Border colors
<div className="border border-primary">Primary border</div>
<div className="border border-border">Default border</div>
```

### Via CSS Variables

```tsx
<div style={{ backgroundColor: 'hsl(var(--primary))' }}>
  Custom styling
</div>
```

---

## Typography

### Font Families

```tsx
// Default font (Geist Sans)
<p className="font-sans">Default text</p>

// Mono font (Geist Mono)
<code className="font-mono">Code text</code>
```

### Font Sizes

```tsx
<p className="text-xs">12px</p>
<p className="text-sm">14px</p>
<p className="text-base">16px (default)</p>
<p className="text-lg">18px</p>
<p className="text-xl">20px</p>
<p className="text-2xl">24px</p>
<p className="text-3xl">30px</p>
<p className="text-4xl">36px</p>
<p className="text-5xl">48px</p>
```

### Font Weights

```tsx
<p className="font-normal">400</p>
<p className="font-medium">500</p>
<p className="font-semibold">600</p>
<p className="font-bold">700</p>
```

### Line Height

```tsx
<p className="leading-none">1</p>
<p className="leading-tight">1.25</p>
<p className="leading-normal">1.5 (default)</p>
<p className="leading-relaxed">1.625</p>
<p className="leading-loose">2</p>
```

---

## Spacing

### Margin & Padding Scale

```tsx
// Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
<div className="p-4">padding: 1rem (16px)</div>
<div className="m-8">margin: 2rem (32px)</div>
<div className="px-6 py-3">padding-x: 1.5rem, padding-y: 0.75rem</div>

// Negative margins
<div className="-m-4">margin: -1rem</div>

// Auto margins (centering)
<div className="mx-auto">margin-x: auto</div>
```

### Gap (Flexbox & Grid)

```tsx
<div className="flex gap-4">Flex with 1rem gap</div>
<div className="grid gap-6">Grid with 1.5rem gap</div>
```

---

## Layout

### Container

```tsx
// Responsive container with padding
<div className="container mx-auto px-4">
  Content
</div>

// Max widths
<div className="max-w-sm">max-width: 24rem (384px)</div>
<div className="max-w-md">max-width: 28rem (448px)</div>
<div className="max-w-lg">max-width: 32rem (512px)</div>
<div className="max-w-xl">max-width: 36rem (576px)</div>
<div className="max-w-2xl">max-width: 42rem (672px)</div>
<div className="max-w-4xl">max-width: 56rem (896px)</div>
<div className="max-w-6xl">max-width: 72rem (1152px)</div>
```

### Flexbox

```tsx
// Flex container
<div className="flex">Flex container</div>
<div className="flex flex-col">Flex column</div>
<div className="flex flex-row">Flex row (default)</div>

// Justify content
<div className="flex justify-start">justify-content: flex-start</div>
<div className="flex justify-center">justify-content: center</div>
<div className="flex justify-between">justify-content: space-between</div>
<div className="flex justify-end">justify-content: flex-end</div>

// Align items
<div className="flex items-start">align-items: flex-start</div>
<div className="flex items-center">align-items: center</div>
<div className="flex items-end">align-items: flex-end</div>
<div className="flex items-stretch">align-items: stretch</div>

// Flex wrap
<div className="flex flex-wrap">flex-wrap: wrap</div>
<div className="flex flex-nowrap">flex-wrap: nowrap</div>

// Gap
<div className="flex gap-4">gap: 1rem</div>
```

### Grid

```tsx
// Grid container
<div className="grid">Grid container</div>
<div className="grid grid-cols-2">2 columns</div>
<div className="grid grid-cols-3">3 columns</div>
<div className="grid grid-cols-4">4 columns</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>

// Gap
<div className="grid gap-4">gap: 1rem</div>
<div className="grid gap-x-4 gap-y-8">Different x/y gaps</div>
```

---

## Responsive Design

### Breakpoints

```typescript
{
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X extra large devices
}
```

### Usage

```tsx
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  Responsive grid
</div>

<div className="hidden md:block">
  Hidden on mobile, visible on tablet+
</div>

<div className="block md:hidden">
  Visible on mobile, hidden on tablet+
</div>
```

---

## Animations

### Custom Animations

Defined in `/src/app/globals.css`:

```css
@keyframes slide-in-from-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slide-in-from-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slide-in-from-top {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

@keyframes slide-in-from-bottom {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounce-in {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Using Animations

```tsx
<div className="animate-slide-in-from-right">Slides in from right</div>
<div className="animate-fade-in">Fades in</div>
<div className="animate-bounce-in">Bounces in</div>
<div className="animate-shake">Shakes</div>
<div className="animate-pulse-slow">Pulses slowly</div>

// With Tailwind utilities
<div className="animate-spin">Spins</div>
<div className="animate-ping">Pings</div>
<div className="animate-pulse">Pulses</div>
<div className="animate-bounce">Bounces</div>
```

### Animation Duration & Timing

```tsx
<div className="transition duration-150">150ms transition</div>
<div className="transition duration-300">300ms transition</div>
<div className="transition duration-500">500ms transition</div>

<div className="transition ease-in">ease-in</div>
<div className="transition ease-out">ease-out</div>
<div className="transition ease-in-out">ease-in-out</div>
```

---

## Borders & Radius

### Border Width

```tsx
<div className="border">1px border</div>
<div className="border-2">2px border</div>
<div className="border-4">4px border</div>

<div className="border-t">Top border</div>
<div className="border-r">Right border</div>
<div className="border-b">Bottom border</div>
<div className="border-l">Left border</div>
```

### Border Radius

```tsx
<div className="rounded-none">border-radius: 0</div>
<div className="rounded-sm">border-radius: 0.125rem</div>
<div className="rounded">border-radius: 0.25rem</div>
<div className="rounded-md">border-radius: 0.375rem</div>
<div className="rounded-lg">border-radius: 0.5rem</div>
<div className="rounded-xl">border-radius: 0.75rem</div>
<div className="rounded-2xl">border-radius: 1rem</div>
<div className="rounded-3xl">border-radius: 1.5rem</div>
<div className="rounded-full">border-radius: 9999px (pill)</div>

// Individual corners
<div className="rounded-t-lg">Top corners</div>
<div className="rounded-tl-lg">Top-left corner</div>
```

---

## Shadows

```tsx
<div className="shadow-sm">Small shadow</div>
<div className="shadow">Default shadow</div>
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow</div>
<div className="shadow-xl">Extra large shadow</div>
<div className="shadow-2xl">2X large shadow</div>
<div className="shadow-none">No shadow</div>
```

---

## Opacity

```tsx
<div className="opacity-0">0% (invisible)</div>
<div className="opacity-25">25%</div>
<div className="opacity-50">50%</div>
<div className="opacity-75">75%</div>
<div className="opacity-100">100% (default)</div>
```

---

## Dark Mode

### Enabling Dark Mode

```tsx
// Add dark variant to any class
<div className="bg-white dark:bg-gray-900">
  White in light mode, dark gray in dark mode
</div>

<p className="text-gray-900 dark:text-gray-100">
  Dark text in light mode, light text in dark mode
</p>

<div className="border-gray-200 dark:border-gray-800">
  Light border in light mode, dark border in dark mode
</div>
```

### Toggle Dark Mode

```tsx
'use client'

import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

---

## Utility Function: `cn()`

Located in `/src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Usage

```tsx
import { cn } from '@/lib/utils'

// Conditional classes
<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)} />

// Merging props className
function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        className
      )}
      {...props}
    />
  )
}

// Complex conditions
<div className={cn(
  'text-base',
  size === 'sm' && 'text-sm',
  size === 'lg' && 'text-lg',
  variant === 'primary' && 'bg-primary text-white',
  variant === 'secondary' && 'bg-secondary text-gray-900'
)} />
```

---

## Best Practices

### 1. Use Semantic Color Variables

```tsx
// Good
<div className="bg-background text-foreground">Content</div>

// Avoid
<div className="bg-white text-black dark:bg-black dark:text-white">Content</div>
```

### 2. Mobile-First Responsive Design

```tsx
// Good
<div className="text-sm md:text-base lg:text-lg">Text</div>

// Avoid
<div className="lg:text-lg md:text-base text-sm">Text</div>
```

### 3. Use `cn()` for Conditional Classes

```tsx
// Good
<div className={cn('base', isActive && 'active')} />

// Avoid
<div className={`base ${isActive ? 'active' : ''}`} />
```

### 4. Consistent Spacing

```tsx
// Use spacing scale consistently
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### 5. Extract Repeated Patterns

```tsx
// Create reusable classes or components
const cardStyles = 'rounded-lg border bg-card p-6 shadow-sm'

<div className={cardStyles}>Card 1</div>
<div className={cardStyles}>Card 2</div>
```

---

## Custom CSS

### When to Use Custom CSS

Use custom CSS for:
- Complex animations not possible with Tailwind
- Component-specific styling that's hard to express with utilities
- Global styles that affect multiple elements

### Adding Custom CSS

Add to `/src/app/globals.css`:

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90;
  }

  .card-hover {
    @apply transition-transform hover:scale-105;
  }
}
```

---

## Related Documentation

- [Design System Components](./design-system.md) - Styled components
- [Patterns & Best Practices](./patterns-and-practices.md) - Component patterns

---

[← Back to Index](./README.md)
