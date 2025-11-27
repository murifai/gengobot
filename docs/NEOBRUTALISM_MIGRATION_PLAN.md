# Neo Brutalism UI Migration Plan

## Overview

This document outlines the comprehensive plan to migrate the Gengobot UI from standard shadcn styling to **Neo Brutalism** design using components from [neobrutalism.dev](https://www.neobrutalism.dev/docs).

**Key Principle**: Maintain the existing primary color (`#ff5e75`) while adopting neo brutalism's distinctive design characteristics.

---

## Current UI Styling Documentation

### 1. CSS Variables (globals.css)

#### Light Theme Colors

| Variable               | Current Value | Purpose                     |
| ---------------------- | ------------- | --------------------------- |
| `--background`         | `#fcfcf9`     | Page background             |
| `--foreground`         | `#171717`     | Primary text                |
| `--primary`            | `#ff5e75`     | **Main brand color (KEEP)** |
| `--primary-foreground` | `#ffffff`     | Text on primary             |
| `--secondary`          | `#fefefe`     | Secondary surfaces          |
| `--muted`              | `#f5f5f5`     | Muted backgrounds           |
| `--accent`             | `#f8f8f8`     | Accent surfaces             |
| `--destructive`        | `#ef4343`     | Error/danger                |
| `--border`             | `#e6e6e6`     | Border color                |
| `--card`               | `#fafafa`     | Card backgrounds            |

#### Dark Theme Colors

| Variable       | Current Value | Purpose                     |
| -------------- | ------------- | --------------------------- |
| `--background` | `#09090b`     | Page background             |
| `--foreground` | `#fafafa`     | Primary text                |
| `--primary`    | `#ff5e75`     | **Main brand color (KEEP)** |
| `--secondary`  | `#252525`     | Secondary surfaces          |
| `--muted`      | `#27272a`     | Muted backgrounds           |
| `--border`     | `#ffffff1a`   | Border color                |

#### Existing Neo Brutalism Variables (Already Present)

```css
--neo-border: 3px solid #000000;
--neo-shadow: 4px 4px 0px 0px #000000;
--neo-shadow-hover: 6px 6px 0px 0px #000000;
--neo-shadow-active: 2px 2px 0px 0px #000000;
```

#### Shadow System

```css
--shadow-2xs: 2px 2px 0px 1px #000000;
--shadow-xs: 2px 2px 0px 1px #000000;
--shadow-sm: 2px 2px 0px 1px #000000, 2px 1px 2px 0px #000000;
--shadow: 2px 2px 0px 1px #000000, 2px 1px 2px 0px #000000;
--shadow-md: 2px 2px 0px 1px #000000, 2px 2px 4px 0px #000000;
--shadow-lg: 2px 2px 0px 1px #000000, 2px 4px 6px 0px #000000;
--shadow-xl: 2px 2px 0px 1px #000000, 2px 8px 10px 0px #000000;
```

### 2. Typography

```css
--font-sans: Plus Jakarta Sans, sans-serif;
--font-serif: Playfair Display, serif;
--font-mono: Roboto Mono, monospace;
--radius: 0.25rem;
```

### 3. Card Type Colors (Flashcards)

| Type       | Front Color | Back Color |
| ---------- | ----------- | ---------- |
| Hiragana   | `#FFB6C1`   | `#FFF0F3`  |
| Katakana   | `#87CEEB`   | `#E8F4F8`  |
| Kanji      | `#FFD700`   | `#FFFAE0`  |
| Vocabulary | `#98D8AA`   | `#E8F5E9`  |
| Grammar    | `#FFB347`   | `#FFF3E0`  |

---

## UI Components Inventory

### Core UI Components (src/components/ui/)

| Component     | File                | Current Style                  | Migration Priority |
| ------------- | ------------------- | ------------------------------ | ------------------ |
| Button        | `Button.tsx`        | Standard shadcn                | **HIGH**           |
| Card          | `Card.tsx`          | Rounded, shadow-sm             | **HIGH**           |
| Input         | `Input.tsx`         | Border-input, shadow-xs        | **HIGH**           |
| Badge         | `Badge.tsx`         | Rounded-full, various variants | **HIGH**           |
| Dialog        | `Dialog.tsx`        | HeadlessUI, rounded-lg         | **MEDIUM**         |
| Select        | `select.tsx`        | Radix, border-input            | **HIGH**           |
| Tabs          | `tabs.tsx`          | Rounded-lg, muted bg           | **MEDIUM**         |
| Sheet         | `sheet.tsx`         | Slide animations               | **MEDIUM**         |
| Dropdown Menu | `dropdown-menu.tsx` | Rounded-md, shadow-md          | **MEDIUM**         |
| Alert Dialog  | `alert-dialog.tsx`  | Uses Button variants           | **MEDIUM**         |
| Textarea      | `textarea.tsx`      | Border-input                   | **HIGH**           |
| Tooltip       | `tooltip.tsx`       | Rounded-md                     | **LOW**            |
| Checkbox      | `checkbox.tsx`      | Rounded-[4px]                  | **MEDIUM**         |
| Progress      | `progress.tsx`      | Rounded-full                   | **MEDIUM**         |
| Accordion     | `Accordion.tsx`     | Standard                       | **MEDIUM**         |
| Switch        | `switch.tsx`        | Rounded                        | **MEDIUM**         |
| Radio Group   | `radio-group.tsx`   | Standard                       | **MEDIUM**         |
| Avatar        | `avatar.tsx`        | Rounded-full                   | **LOW**            |
| Skeleton      | `skeleton.tsx`      | Standard                       | **LOW**            |
| Separator     | `separator.tsx`     | Standard                       | **LOW**            |
| Label         | `label.tsx`         | Standard                       | **LOW**            |
| Table         | `table.tsx`         | Standard                       | **MEDIUM**         |
| Scroll Area   | `scroll-area.tsx`   | Standard                       | **LOW**            |

---

## Neo Brutalism Design Characteristics

### Core Design Principles

1. **Bold Borders**: 2-3px solid black borders
2. **Hard Shadows**: Offset box shadows (4px 4px 0px) that shift on hover
3. **High Contrast**: Strong color contrasts, no gradients
4. **Geometric Shapes**: Sharp corners or minimal rounding (`rounded-base`)
5. **Interactive Feedback**: translate-x/translate-y on hover with shadow removal

### Key CSS Classes from neobrutalism.dev

```css
/* Borders */
border-2 border-border

/* Shadows */
shadow-shadow (offset shadow)
hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none

/* Colors */
bg-main text-main-foreground
bg-secondary-background text-foreground

/* Rounded */
rounded-base (smaller than standard)

/* Focus */
focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
```

---

## Migration Plan

### Phase 1: CSS Variables & Theme Setup

**Objective**: Update globals.css with neo brutalism CSS variables while preserving existing colors.

#### New Variables to Add

```css
:root {
  /* Neo Brutalism Core */
  --main: var(--primary); /* #ff5e75 */
  --main-foreground: var(--primary-foreground);
  --secondary-background: var(--secondary);
  --border: #000000; /* Black borders for neo brutalism */

  /* Shadow Configuration */
  --shadow-shadow: 4px 4px 0px 0px var(--border);
  --box-shadow-x: 4px;
  --box-shadow-y: 4px;
  --reverse-box-shadow-x: -4px;
  --reverse-box-shadow-y: -4px;

  /* Rounded Base */
  --radius-base: 5px;
}

.dark {
  --border: #ffffff; /* White borders in dark mode */
  --shadow-shadow: 4px 4px 0px 0px var(--border);
}
```

#### Tailwind Theme Extension

Add to `@theme inline`:

```css
--color-main: var(--main);
--color-main-foreground: var(--main-foreground);
--color-secondary-background: var(--secondary-background);
--radius-base: var(--radius-base);
--shadow-shadow: var(--shadow-shadow);
```

### Phase 2: Core Component Migration

#### 2.1 Button Component

**Current**:

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        // ...
      },
    },
  }
);
```

**Neo Brutalism**:

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-medium ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
        noShadow: 'text-main-foreground bg-main border-2 border-border',
        neutral:
          'bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
        reverse:
          'text-main-foreground bg-main border-2 border-border hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-shadow',
        outline:
          'border-2 border-border bg-background shadow-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-main underline-offset-4 hover:underline',
        destructive:
          'bg-destructive text-white border-2 border-border shadow-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

#### 2.2 Card Component

**Neo Brutalism**:

```tsx
function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-base flex flex-col shadow-shadow border-2 gap-6 py-6 border-border bg-background text-foreground',
        className
      )}
      {...props}
    />
  );
}
```

#### 2.3 Input Component

**Neo Brutalism**:

```tsx
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full rounded-base border-2 border-border bg-secondary-background selection:bg-main selection:text-main-foreground px-3 py-2 text-sm font-base text-foreground file:border-0 file:bg-transparent file:text-sm placeholder:text-foreground/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
```

#### 2.4 Badge Component

**Neo Brutalism**:

```tsx
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-base border-2 border-border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-main text-main-foreground',
        neutral: 'bg-secondary-background text-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-amber-500 text-black',
        destructive: 'bg-destructive text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

#### 2.5 Select Component

**Key Changes**:

- SelectTrigger: `border-2 border-border rounded-base shadow-shadow`
- SelectContent: `border-2 border-border rounded-base bg-background`
- SelectItem: `rounded-base` with hover states

#### 2.6 Textarea Component

**Neo Brutalism**:

```tsx
<textarea
  className={cn(
    'flex min-h-[80px] w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm placeholder:text-foreground/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
/>
```

### Phase 3: Secondary Component Migration

#### 3.1 Tabs

- TabsList: `border-2 border-border rounded-base bg-secondary-background`
- TabsTrigger: `data-[state=active]:shadow-shadow data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px]`

#### 3.2 Dialog/AlertDialog

- Content: `border-2 border-border rounded-base shadow-shadow`
- Overlay: Keep existing backdrop

#### 3.3 Sheet

- Content: `border-2 border-border shadow-shadow`

#### 3.4 Dropdown Menu

- Content: `border-2 border-border rounded-base shadow-shadow`
- Items: `rounded-base` hover states

#### 3.5 Checkbox

- `border-2 border-border rounded-base data-[state=checked]:bg-main`

#### 3.6 Progress

- Container: `border-2 border-border rounded-base bg-secondary-background`
- Indicator: `bg-main rounded-base`

#### 3.7 Switch

- `border-2 border-border data-[state=checked]:bg-main`

### Phase 4: Application-Level Styling

#### 4.1 Landing Page Components

- Navbar: Bold borders, shadow effects
- Hero: Strong typography, neo brutalism cards
- Features: Card-based layout with shadows
- Pricing: Cards with prominent borders
- FAQ/Accordion: Border-based styling

#### 4.2 App Dashboard Components (Dock-based Navigation)

**Note**: The app dashboard uses a floating Dock component (not sidebar) for navigation.

##### Current Dock Implementation

Location: `src/components/ui/shadcn-io/dock/index.tsx`
Usage: `src/components/layout/mobile-bottom-nav.tsx`

**Current Styling**:

- Dock container: `rounded-2xl bg-gray-50 dark:bg-neutral-900`
- Dock items: `rounded-full bg-gray-200/80 dark:bg-gray-800/80`
- Label tooltip: `rounded-md border border-gray-200 bg-gray-100 dark:border-neutral-900 dark:bg-neutral-800`

##### Neo Brutalism Dock Component

**Dock Container** (update in `dock/index.tsx`):

```tsx
// Current
className={cn(
  'mx-auto flex w-fit gap-4 rounded-2xl bg-gray-50 px-4 dark:bg-neutral-900',
  className
)}

// Neo Brutalism
className={cn(
  'mx-auto flex w-fit gap-4 rounded-base border-2 border-border bg-background px-4 shadow-shadow dark:bg-background',
  className
)}
```

**DockItem Icons** (update in `mobile-bottom-nav.tsx`):

```tsx
// Current
<Link
  href={item.href}
  className={cn(
    'group flex items-center justify-center rounded-full transition-all duration-200',
    'w-12 h-12',
    active
      ? 'bg-primary/20 text-primary scale-110'
      : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 hover:scale-110 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700/80'
  )}
>

// Neo Brutalism
<Link
  href={item.href}
  className={cn(
    'group flex items-center justify-center rounded-base border-2 border-border transition-all duration-200',
    'w-12 h-12',
    active
      ? 'bg-main text-main-foreground shadow-shadow translate-x-[2px] translate-y-[2px]'
      : 'bg-secondary-background text-foreground hover:bg-main/20 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
  )}
>
```

**DockLabel Tooltip** (update in `dock/index.tsx`):

```tsx
// Current
className={cn(
  'absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white',
  className
)}

// Neo Brutalism
className={cn(
  'absolute -top-8 left-1/2 w-fit whitespace-pre rounded-base border-2 border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground shadow-shadow',
  className
)}
```

##### Alternative: Square Icons for Strong Neo Brutalism

For a more pronounced neo brutalism feel, use square icons instead of rounded:

```tsx
<Link
  href={item.href}
  className={cn(
    'group flex items-center justify-center rounded-base border-2 border-border transition-all duration-100',
    'w-11 h-11',
    active
      ? 'bg-main text-main-foreground translate-x-[3px] translate-y-[3px] shadow-none'
      : 'bg-background text-foreground shadow-shadow hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none'
  )}
>
```

#### 4.3 Flashcard Components

- Keep existing card type colors
- Add neo brutalism borders and shadows
- Maintain flip animations

### Phase 5: Animation Adjustments

#### Hover Transitions

```css
.neo-button {
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;
}

.neo-button:hover {
  transform: translate(4px, 4px);
  box-shadow: none;
}

.neo-button:active {
  transform: translate(2px, 2px);
}
```

#### Maintain Existing Animations

- Keep all current keyframe animations (slide-in, fade-in, bounce-in, etc.)
- Add neo brutalism specific hover effects

---

## Implementation Checklist

### Phase 1: Theme Setup

- [ ] Update `:root` CSS variables in globals.css
- [ ] Add neo brutalism specific variables
- [ ] Update dark mode variables
- [ ] Add tailwind theme inline mappings

### Phase 2: Core Components

- [ ] Button.tsx
- [ ] Card.tsx
- [ ] Input.tsx
- [ ] Badge.tsx
- [ ] Select.tsx
- [ ] Textarea.tsx

### Phase 3: Secondary Components

- [ ] Tabs.tsx
- [ ] Dialog.tsx
- [ ] AlertDialog.tsx
- [ ] Sheet.tsx
- [ ] Dropdown-menu.tsx
- [ ] Checkbox.tsx
- [ ] Progress.tsx
- [ ] Switch.tsx
- [ ] Radio-group.tsx
- [ ] Accordion.tsx

### Phase 4: Tertiary Components

- [ ] Tooltip.tsx
- [ ] Avatar.tsx
- [ ] Skeleton.tsx
- [ ] Table.tsx
- [ ] Label.tsx
- [ ] Separator.tsx

### Phase 5: Navigation & Layout Components

- [ ] Dock component (`src/components/ui/shadcn-io/dock/index.tsx`)
- [ ] Mobile bottom nav (`src/components/layout/mobile-bottom-nav.tsx`)

### Phase 6: Application Components

- [ ] Landing page components
- [ ] App Dashboard components
- [ ] Flashcard components
- [ ] Settings/Profile components
- [ ] Admin components

### Phase 7: Testing & QA

- [ ] Visual regression testing
- [ ] Dark mode verification
- [ ] Responsive design check
- [ ] Accessibility audit
- [ ] Animation performance

---

## Color Mapping

| Shadcn Variable        | Neo Brutalism Mapping    | Value (Light) | Value (Dark) |
| ---------------------- | ------------------------ | ------------- | ------------ |
| `--primary`            | `--main`                 | `#ff5e75`     | `#ff5e75`    |
| `--primary-foreground` | `--main-foreground`      | `#ffffff`     | `#18181b`    |
| `--secondary`          | `--secondary-background` | `#fefefe`     | `#252525`    |
| `--border`             | `--border`               | `#000000`     | `#ffffff`    |

---

## Risk Assessment

| Risk                            | Impact | Mitigation                                   |
| ------------------------------- | ------ | -------------------------------------------- |
| Breaking existing functionality | High   | Incremental migration, thorough testing      |
| Dark mode inconsistencies       | Medium | Test both modes during each component update |
| Accessibility concerns          | Medium | Maintain WCAG contrast ratios, focus states  |
| Animation performance           | Low    | Use CSS transforms only                      |
| Third-party component conflicts | Medium | Isolate changes to UI components             |

---

## Rollback Strategy

1. Create feature branch for migration
2. Implement changes incrementally
3. Maintain original component code as backup
4. Use CSS custom properties for easy theme switching
5. Document all changes for potential revert

---

## Success Criteria

- [ ] All core UI components updated to neo brutalism style
- [ ] Primary brand color (#ff5e75) preserved throughout
- [ ] Dark mode fully functional
- [ ] No accessibility regressions
- [ ] Consistent visual language across all pages
- [ ] Animation performance maintained
- [ ] Build passes without errors
