# UI Components Documentation

> **Gengotalk** - Japanese Language Learning Platform
>
> Complete UI Component Reference Guide

---

## 📚 Documentation Index

Welcome to the Gengotalk UI components documentation. This guide provides comprehensive information about all UI components, patterns, and best practices used in the application.

### Quick Stats
- **117+** total component files
- **29** design system components
- **32** feature components across 10 categories
- **35** page components
- **13** custom hooks
- Built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**

---

## 📖 Documentation Structure

### Core Documentation

#### [🎨 Design System Components](./design-system.md)
Complete reference for all reusable UI components (29 components):
- Base components (Button, Card, Input, Badge, etc.)
- Layout components (Sidebar, Breadcrumb, Separator)
- Overlay components (Dialog, Sheet, Tooltip, Dropdown)
- Form components (Select, Message Input)
- Feedback components (Loading, Error, Notification, Progress)
- Media components (Avatar, Audio Visualizer, File Preview)

#### [🔧 Feature Components](./components/)
Domain-specific components organized by feature area:
- [Admin Components](./components/admin.md) - Admin interfaces
- [Character Components](./components/character.md) - AI character management
- [Chat Components](./components/chat.md) - Chat interfaces
- [Conversation Components](./components/conversation.md) - Message bubbles and input
- [Dashboard Components](./components/dashboard.md) - Dashboard layouts
- [Deck & Flashcard Components](./components/deck-flashcard.md) - Study materials
- [Layout Components](./components/layout.md) - Page layouts
- [Task Components](./components/task.md) - Task-based learning
- [Vocabulary Components](./components/vocabulary.md) - Japanese vocabulary
- [Voice Components](./components/voice.md) - Audio recording and playback

#### [📄 Page Components](./pages.md)
All Next.js App Router pages (35 components):
- Root pages
- Authentication
- Dashboard section
- Admin section
- Study section

#### [🪝 Custom Hooks](./hooks.md)
Reusable React hooks (13 hooks):
- Audio & Media hooks
- UI utility hooks
- Chat & Conversation hooks
- Task & Progress hooks

---

### Guides & Resources

#### [🎨 Styling Guide](./styling-guide.md)
- Tailwind CSS configuration
- Custom color palette
- Theme support (light/dark mode)
- Custom animations
- Responsive design
- CSS architecture

#### [🏗️ Patterns & Best Practices](./patterns-and-practices.md)
- Component patterns (compound, polymorphic, variants)
- Development best practices
- Performance optimization
- Accessibility guidelines
- State management
- Contributing guidelines

---

## 🚀 Quick Start

### Technology Stack

**Framework & Core:**
- Next.js 15 (App Router)
- React 19.1.0
- TypeScript 5.9.3

**Styling:**
- Tailwind CSS 4.0.12
- Framer Motion 12.1.0
- CSS Variables for theming

**Component Libraries:**
- Shadcn UI (Radix UI primitives)
- Lucide React (icons)
- Class Variance Authority (variants)

### Installation & Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Basic Usage Example

```tsx
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog'

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            Dialog content here
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
```

---

## 📂 Directory Structure

```
src/
├── components/
│   ├── ui/              # Design system components (29)
│   ├── admin/           # Admin components (2)
│   ├── character/       # Character components (3)
│   ├── chat/            # Chat components (2)
│   ├── conversation/    # Conversation components (3)
│   ├── dashboard/       # Dashboard components (4)
│   ├── deck/            # Deck components (4)
│   ├── flashcard/       # Flashcard components (1)
│   ├── layout/          # Layout components (3)
│   ├── task/            # Task components (9)
│   ├── vocabulary/      # Vocabulary components (2)
│   └── voice/           # Voice components (2)
├── app/                 # Next.js pages (35)
├── hooks/               # Custom hooks (13)
└── contexts/            # React contexts (2)
```

---

## 🎯 Common Use Cases

### Building a Form
See [Design System - Form Components](./design-system.md#form-components)

### Creating a Modal Dialog
See [Design System - Dialog](./design-system.md#dialog)

### Adding Navigation
See [Design System - Sidebar](./design-system.md#sidebar)

### Recording Audio
See [Voice Components](./components/voice.md) and [Audio Hooks](./hooks.md#audio--media)

### Managing Chat Messages
See [Chat Components](./components/chat.md) and [Chat Hooks](./hooks.md#chat--conversation)

### Implementing Task Flow
See [Task Components](./components/task.md)

---

## 🔍 Search by Component Type

### Need a specific component?

**Buttons & Actions:**
- [Button](./design-system.md#button)
- [Dropdown Menu](./design-system.md#dropdown-menu)
- [SidebarMenuButton](./design-system.md#sidebar)

**Forms & Inputs:**
- [Input](./design-system.md#input)
- [Textarea](./design-system.md#textarea)
- [Select](./design-system.md#select)
- [Label](./design-system.md#label)
- [ChatInput](./components/conversation.md#chatinput)
- [MessageInput](./design-system.md#message-input)

**Layouts & Containers:**
- [Card](./design-system.md#card)
- [Sidebar](./design-system.md#sidebar)
- [ScrollArea](./design-system.md#scroll-area)
- [MainLayout](./components/layout.md#mainlayout)

**Overlays & Modals:**
- [Dialog](./design-system.md#dialog)
- [Sheet](./design-system.md#sheet)
- [Tooltip](./design-system.md#tooltip)

**Feedback & Status:**
- [LoadingState](./design-system.md#loadingstate)
- [ErrorBoundary](./design-system.md#errorboundary)
- [Notification](./design-system.md#notification)
- [Progress](./design-system.md#progress)
- [Skeleton](./design-system.md#skeleton)

**Navigation:**
- [Breadcrumb](./design-system.md#breadcrumb)
- [Sidebar Menu](./design-system.md#sidebar)

**Media & Rich Content:**
- [Avatar](./design-system.md#avatar)
- [AudioPlayer](./components/voice.md#audioplayer)
- [AudioVisualizer](./design-system.md#audio-visualizer)
- [FilePreview](./design-system.md#file-preview)

---

## 🤝 Contributing

Before adding new components or modifying existing ones, please review:
- [Patterns & Best Practices](./patterns-and-practices.md)
- Existing similar components to maintain consistency
- Accessibility guidelines
- TypeScript typing conventions

### Component Checklist
- [ ] TypeScript types defined
- [ ] Proper ref forwarding (if applicable)
- [ ] displayName set
- [ ] Accessible (keyboard, screen reader)
- [ ] Responsive design
- [ ] Light/dark mode support
- [ ] Loading and error states
- [ ] Documented with examples

---

## 📚 External Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Component Libraries
- [Shadcn UI](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)
- [Framer Motion](https://www.framer.com/motion)

### Tools
- [Class Variance Authority](https://cva.style)
- [clsx](https://github.com/lukeed/clsx)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)

---

## 📝 Changelog

### Version 1.0.0 (2025-11-13)
- Initial documentation structure
- Documented all 117+ components
- Added usage examples
- Created comprehensive guides

---

## 📧 Support

For questions or issues related to UI components:
1. Check the relevant documentation section
2. Review [Best Practices](./patterns-and-practices.md)
3. Look at existing component implementations
4. Consult the development team

---

**Last Updated:** 2025-11-13
**Maintainer:** Development Team
**Version:** 1.0.0
