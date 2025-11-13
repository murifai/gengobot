# UI Components Documentation

> **Gengotalk** - Japanese Language Learning Platform
>
> Complete UI Component Reference Guide

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Design System Components](#design-system-components)
4. [Feature Components](#feature-components)
5. [Page Components](#page-components)
6. [Styling Guide](#styling-guide)
7. [Component Patterns](#component-patterns)
8. [Custom Hooks](#custom-hooks)
9. [Best Practices](#best-practices)

---

## Architecture Overview

### Framework
- **Next.js 15** with App Router
- **React 19.1.0** with Server Components
- **TypeScript 5.9.3** for type safety

### Component Philosophy
- **Composition over inheritance**
- **Accessibility-first** (using Radix UI primitives)
- **Reusability** through compound components
- **Type safety** with TypeScript

### Directory Structure
```
src/
├── components/
│   ├── ui/              # Design system components (29 components)
│   ├── admin/           # Admin-specific components
│   ├── character/       # Character management components
│   ├── chat/           # Chat interface components
│   ├── conversation/   # Conversation components
│   ├── dashboard/      # Dashboard layouts
│   ├── deck/           # Flashcard deck components
│   ├── flashcard/      # Flashcard session components
│   ├── layout/         # Layout components
│   ├── task/           # Task-based learning components
│   ├── vocabulary/     # Vocabulary learning components
│   └── voice/          # Voice recording/playback components
├── app/                # Next.js pages (35 pages)
├── hooks/              # Custom React hooks (13 hooks)
└── contexts/           # React contexts
```

---

## Technology Stack

### Core Libraries
- **Next.js 15.1.4** - React framework
- **React 19.1.0** - UI library
- **TypeScript 5.9.3** - Type safety

### UI & Styling
- **Tailwind CSS 4.0.12** - Utility-first CSS
- **Shadcn UI** - Component library
- **Radix UI** - Accessible primitives
- **Lucide React** - Icon library
- **Framer Motion 12.1.0** - Animations

### Utilities
- **clsx** - Conditional classNames
- **tailwind-merge** - Merge Tailwind classes
- **Class Variance Authority (CVA)** - Component variants

---

## Design System Components

### Base Components

#### Button (`/src/components/ui/Button.tsx`)
Multi-variant button component with full accessibility support.

**Variants:**
- `default` - Primary action button
- `destructive` - Dangerous actions
- `outline` - Secondary actions
- `secondary` - Alternative secondary style
- `ghost` - Minimal button
- `link` - Link-styled button

**Sizes:** `default`, `sm`, `lg`, `icon`

**Usage:**
```tsx
import { Button } from '@/components/ui/Button'

<Button variant="default">Click me</Button>
<Button variant="outline" size="sm">Small button</Button>
<Button variant="destructive">Delete</Button>
```

**Props:**
- `variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"`
- `size?: "default" | "sm" | "lg" | "icon"`
- `asChild?: boolean` - Compose with child element
- All standard button HTML attributes

---

#### Card (`/src/components/ui/Card.tsx`)
Compound component for content containers.

**Sub-components:**
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

---

#### Input (`/src/components/ui/Input.tsx`)
Text input field with error states.

**Usage:**
```tsx
import { Input } from '@/components/ui/Input'

<Input type="text" placeholder="Enter text..." />
<Input type="email" disabled />
```

**Props:**
- All standard input HTML attributes
- Supports `disabled` and error states

---

#### Textarea (`/src/components/ui/textarea.tsx`)
Multi-line text input.

**Usage:**
```tsx
import { Textarea } from '@/components/ui/textarea'

<Textarea placeholder="Enter long text..." rows={5} />
```

---

#### Label (`/src/components/ui/label.tsx`)
Accessible form label.

**Usage:**
```tsx
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

---

#### Badge (`/src/components/ui/Badge.tsx`)
Small status or label indicator.

**Variants:** `default`, `secondary`, `destructive`, `outline`

**Usage:**
```tsx
import { Badge } from '@/components/ui/Badge'

<Badge>New</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
```

---

### Layout Components

#### Sidebar (`/src/components/ui/sidebar.tsx`)
Complex sidebar navigation system with 20+ sub-components.

**Key Sub-components:**
- `SidebarProvider` - Context provider
- `Sidebar` - Main sidebar container
- `SidebarHeader` - Header area
- `SidebarContent` - Scrollable content area
- `SidebarFooter` - Footer area
- `SidebarMenu` - Menu container
- `SidebarMenuItem` - Individual menu item
- `SidebarMenuButton` - Clickable menu button
- `SidebarTrigger` - Toggle button
- `SidebarRail` - Resize handle
- `SidebarInset` - Content area when sidebar is active

**Usage:**
```tsx
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

<SidebarProvider>
  <Sidebar>
    <SidebarHeader>
      <h2>Navigation</h2>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/dashboard">Dashboard</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    {/* Main content */}
  </SidebarInset>
</SidebarProvider>
```

---

#### Breadcrumb (`/src/components/ui/breadcrumb.tsx`)
Navigation breadcrumb trail.

**Sub-components:**
- `Breadcrumb`
- `BreadcrumbList`
- `BreadcrumbItem`
- `BreadcrumbLink`
- `BreadcrumbSeparator`
- `BreadcrumbPage`

**Usage:**
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
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

#### Separator (`/src/components/ui/separator.tsx`)
Visual divider line.

**Usage:**
```tsx
import { Separator } from '@/components/ui/separator'

<Separator />
<Separator orientation="vertical" />
```

---

### Overlay Components

#### Dialog (`/src/components/ui/Dialog.tsx`)
Modal dialog overlay.

**Sub-components:**
- `Dialog` - Root component
- `DialogTrigger` - Trigger button
- `DialogContent` - Content container
- `DialogHeader` - Header area
- `DialogTitle` - Title
- `DialogDescription` - Description
- `DialogFooter` - Footer area

**Usage:**
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

#### Sheet (`/src/components/ui/sheet.tsx`)
Slide-out panel from screen edge.

**Sides:** `top`, `right`, `bottom`, `left`

**Usage:**
```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Sheet description</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

---

#### Tooltip (`/src/components/ui/tooltip.tsx`)
Hover tooltip component.

**Usage:**
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

#### Dropdown Menu (`/src/components/ui/dropdown-menu.tsx`)
Dropdown menu component.

**Sub-components:**
- `DropdownMenu`
- `DropdownMenuTrigger`
- `DropdownMenuContent`
- `DropdownMenuItem`
- `DropdownMenuCheckboxItem`
- `DropdownMenuRadioItem`
- `DropdownMenuLabel`
- `DropdownMenuSeparator`
- `DropdownMenuShortcut`
- `DropdownMenuGroup`
- `DropdownMenuSub`

**Usage:**
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Form Components

#### Select (`/src/components/ui/select.tsx`)
Dropdown select component.

**Usage:**
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

#### Message Input (`/src/components/ui/message-input.tsx`)
Advanced message input component (13KB - complex component).

**Features:**
- Auto-resizing textarea
- File attachments
- Voice recording
- Send button
- Character count
- Keyboard shortcuts

**Usage:**
```tsx
import { MessageInput } from '@/components/ui/message-input'

<MessageInput
  value={message}
  onChange={setMessage}
  onSend={handleSend}
  placeholder="Type a message..."
  disabled={isLoading}
/>
```

---

### Feedback & Status Components

#### LoadingState (`/src/components/ui/LoadingState.tsx`)
Loading indicator component.

**Usage:**
```tsx
import { LoadingState } from '@/components/ui/LoadingState'

<LoadingState message="Loading..." />
```

---

#### ErrorBoundary (`/src/components/ui/ErrorBoundary.tsx`)
React error boundary (6.4KB).

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

<ErrorBoundary fallback={<div>Error occurred</div>}>
  <YourComponent />
</ErrorBoundary>
```

---

#### Notification (`/src/components/ui/Notification.tsx`)
Toast notification system (7.9KB).

**Features:**
- Success, error, warning, info variants
- Auto-dismiss
- Action buttons
- Positioning

**Usage:**
```tsx
import { useNotification } from '@/components/ui/Notification'

const { showNotification } = useNotification()

showNotification({
  type: 'success',
  message: 'Action completed!',
  duration: 3000,
})
```

---

#### Progress (`/src/components/ui/progress.tsx`)
Progress bar component.

**Usage:**
```tsx
import { Progress } from '@/components/ui/progress'

<Progress value={60} max={100} />
```

---

#### Skeleton (`/src/components/ui/skeleton.tsx`)
Loading skeleton placeholder.

**Usage:**
```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-full" />
<Skeleton className="h-12 w-12 rounded-full" />
```

---

#### Guided Tour (`/src/components/ui/GuidedTour.tsx`)
Onboarding tour component (9.6KB).

**Features:**
- Step-by-step guidance
- Highlighting elements
- Navigation controls
- Progress indicator

**Usage:**
```tsx
import { GuidedTour } from '@/components/ui/GuidedTour'

<GuidedTour
  steps={[
    { target: '#step1', content: 'Welcome!' },
    { target: '#step2', content: 'This is feature X' },
  ]}
  onComplete={handleComplete}
/>
```

---

### Media Components

#### Avatar (`/src/components/ui/avatar.tsx`)
User avatar component.

**Sub-components:**
- `Avatar` - Container
- `AvatarImage` - Image element
- `AvatarFallback` - Fallback content

**Usage:**
```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
```

---

#### File Preview (`/src/components/ui/file-preview.tsx`)
File preview component.

**Usage:**
```tsx
import { FilePreview } from '@/components/ui/file-preview'

<FilePreview file={file} onRemove={handleRemove} />
```

---

#### Audio Visualizer (`/src/components/ui/audio-visualizer.tsx`)
Audio visualization component (5.9KB).

**Features:**
- Real-time audio visualization
- Waveform display
- Volume levels

**Usage:**
```tsx
import { AudioVisualizer } from '@/components/ui/audio-visualizer'

<AudioVisualizer audioContext={audioContext} stream={mediaStream} />
```

---

#### Simple Audio Visualizer (`/src/components/ui/simple-audio-visualizer.tsx`)
Lightweight audio visualizer.

**Usage:**
```tsx
import { SimpleAudioVisualizer } from '@/components/ui/simple-audio-visualizer'

<SimpleAudioVisualizer isActive={isRecording} />
```

---

### Other Components

#### Scroll Area (`/src/components/ui/scroll-area.tsx`)
Custom scrollable container.

**Usage:**
```tsx
import { ScrollArea } from '@/components/ui/scroll-area'

<ScrollArea className="h-[200px]">
  {/* Scrollable content */}
</ScrollArea>
```

---

#### Interrupt Prompt (`/src/components/ui/interrupt-prompt.tsx`)
User interruption prompt.

**Usage:**
```tsx
import { InterruptPrompt } from '@/components/ui/interrupt-prompt'

<InterruptPrompt
  isOpen={showPrompt}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

---

## Feature Components

### Admin Components

Located in `/src/components/admin/`

#### DeckSelector (`DeckSelector.tsx`)
Deck selection interface for admin.

**Features:**
- Browse all decks
- Filter and search
- Select deck for editing

**Usage:**
```tsx
import { DeckSelector } from '@/components/admin/DeckSelector'

<DeckSelector onSelect={handleDeckSelect} />
```

---

#### TaskEditorForm (`TaskEditorForm.tsx`)
Task editing form for admins.

**Features:**
- Edit task content
- Set difficulty levels
- Manage task categories
- Configure task parameters

**Usage:**
```tsx
import { TaskEditorForm } from '@/components/admin/TaskEditorForm'

<TaskEditorForm
  taskId={taskId}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

---

### Character Components

Located in `/src/components/character/`

#### CharacterCard (`CharacterCard.tsx`)
Display card for AI characters.

**Features:**
- Character avatar
- Character name and description
- Personality traits
- Action buttons

**Usage:**
```tsx
import { CharacterCard } from '@/components/character/CharacterCard'

<CharacterCard
  character={character}
  onSelect={handleSelect}
  onEdit={handleEdit}
/>
```

---

#### CharacterCreator (`CharacterCreator.tsx`)
Character creation interface.

**Features:**
- Character name input
- Avatar upload
- Personality configuration
- Voice settings
- System prompt editing

**Usage:**
```tsx
import { CharacterCreator } from '@/components/character/CharacterCreator'

<CharacterCreator
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

---

#### FreeChatInterface (`FreeChatInterface.tsx`)
Free conversation interface with characters.

**Features:**
- Real-time chat
- Voice input/output
- Character context
- Conversation history

**Usage:**
```tsx
import { FreeChatInterface } from '@/components/character/FreeChatInterface'

<FreeChatInterface characterId={characterId} />
```

---

### Chat Components

Located in `/src/components/chat/`

#### StreamingChatInterface (`StreamingChatInterface.tsx`)
Streaming chat interface with SSE.

**Features:**
- Real-time message streaming
- Typing indicators
- Message history
- Auto-scroll

**Usage:**
```tsx
import { StreamingChatInterface } from '@/components/chat/StreamingChatInterface'

<StreamingChatInterface sessionId={sessionId} />
```

---

#### UnifiedChatInterface (`UnifiedChatInterface.tsx`)
Unified chat interface combining all chat features.

**Features:**
- Multi-mode support (task, free, voice)
- Message persistence
- File attachments
- Voice messages

**Usage:**
```tsx
import { UnifiedChatInterface } from '@/components/chat/UnifiedChatInterface'

<UnifiedChatInterface mode="task" taskId={taskId} />
```

---

### Conversation Components

Located in `/src/components/conversation/`

#### ChatInput (`ChatInput.tsx`)
Chat message input field.

**Features:**
- Auto-resizing textarea
- Send button
- File upload button
- Voice record button
- Keyboard shortcuts (Ctrl+Enter)

**Usage:**
```tsx
import { ChatInput } from '@/components/conversation/ChatInput'

<ChatInput
  value={message}
  onChange={setMessage}
  onSend={handleSend}
  disabled={isLoading}
/>
```

---

#### ConversationContainer (`ConversationContainer.tsx`)
Container for conversation messages.

**Features:**
- Message list
- Auto-scroll to bottom
- Loading states
- Empty state

**Usage:**
```tsx
import { ConversationContainer } from '@/components/conversation/ConversationContainer'

<ConversationContainer messages={messages} isLoading={isLoading} />
```

---

#### MessageBubble (`MessageBubble.tsx`)
Individual message bubble component.

**Features:**
- User/AI styling
- Timestamp
- Message actions (copy, delete)
- Audio playback for voice messages
- Markdown rendering

**Usage:**
```tsx
import { MessageBubble } from '@/components/conversation/MessageBubble'

<MessageBubble
  message={message}
  isUser={message.sender === 'user'}
  onDelete={handleDelete}
/>
```

---

### Dashboard Components

Located in `/src/components/dashboard/`

#### Admin Header (`admin-header.tsx`)
Header for admin section.

**Features:**
- Navigation breadcrumbs
- User menu
- Settings access

---

#### Admin Sidebar (`admin-sidebar.tsx`)
Sidebar navigation for admin.

**Features:**
- Admin navigation links
- User management
- Analytics access
- Settings

---

#### App Sidebar (`app-sidebar.tsx`)
Main application sidebar.

**Features:**
- Dashboard navigation
- Character selection
- Study decks access
- Progress tracking
- Settings

---

#### Dashboard Header (`dashboard-header.tsx`)
Header for dashboard section.

**Features:**
- Page title
- User profile
- Notifications
- Quick actions

---

### Deck & Flashcard Components

Located in `/src/components/deck/` and `/src/components/flashcard/`

#### DeckBrowser (`DeckBrowser.tsx`)
Browse available flashcard decks.

**Features:**
- Grid/list view
- Filter by category
- Search functionality
- Deck statistics

**Usage:**
```tsx
import { DeckBrowser } from '@/components/deck/DeckBrowser'

<DeckBrowser onSelectDeck={handleSelectDeck} />
```

---

#### DeckLearning (`DeckLearning.tsx`)
Flashcard learning interface.

**Features:**
- Card flip animation
- Answer revelation
- Navigation controls
- Progress tracking

**Usage:**
```tsx
import { DeckLearning } from '@/components/deck/DeckLearning'

<DeckLearning deckId={deckId} />
```

---

#### DeckLearningWithSRS (`DeckLearningWithSRS.tsx`)
SRS-based (Spaced Repetition System) flashcard learning.

**Features:**
- SRS algorithm integration
- Due date tracking
- Difficulty ratings
- Learning statistics

**Usage:**
```tsx
import { DeckLearningWithSRS } from '@/components/deck/DeckLearningWithSRS'

<DeckLearningWithSRS deckId={deckId} />
```

---

#### FlashcardEditor (`FlashcardEditor.tsx`)
Edit flashcard content.

**Features:**
- Front/back editing
- Add furigana for Japanese
- Add audio
- Preview mode

**Usage:**
```tsx
import { FlashcardEditor } from '@/components/deck/FlashcardEditor'

<FlashcardEditor
  flashcard={flashcard}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

---

#### FlashcardSession (`FlashcardSession.tsx`)
Complete flashcard study session.

**Features:**
- Session management
- Progress tracking
- Performance analytics
- Session summary

**Usage:**
```tsx
import { FlashcardSession } from '@/components/flashcard/FlashcardSession'

<FlashcardSession deckId={deckId} />
```

---

### Layout Components

Located in `/src/components/layout/`

#### Header (`Header.tsx`)
Main application header.

**Features:**
- Logo/branding
- Navigation links
- User menu
- Mobile menu toggle

---

#### MainLayout (`MainLayout.tsx`)
Main layout wrapper.

**Features:**
- Header + Sidebar + Content structure
- Responsive design
- Authentication checks

**Usage:**
```tsx
import { MainLayout } from '@/components/layout/MainLayout'

<MainLayout>
  {/* Page content */}
</MainLayout>
```

---

#### Sidebar (`Sidebar.tsx`)
Legacy sidebar component.

**Note:** Prefer using the new `/src/components/ui/sidebar.tsx` instead.

---

### Task Components

Located in `/src/components/task/`

#### CompletionSuggestion (`CompletionSuggestion.tsx`)
Suggest task completion to user.

**Features:**
- Task completion criteria check
- Confirmation dialog
- Feedback prompt

---

#### MessageLimitWarning (`MessageLimitWarning.tsx`)
Warning when approaching message limit.

**Features:**
- Message count display
- Warning threshold
- Upgrade prompt

---

#### PostTaskReview (`PostTaskReview.tsx`)
Post-task review interface.

**Features:**
- Task feedback collection
- Difficulty rating
- Learning points review
- Vocabulary review

---

#### PreTaskStudy (`PreTaskStudy.tsx`)
Pre-task study materials.

**Features:**
- Vocabulary preview
- Grammar points
- Task instructions
- Ready button

---

#### ProgressHeader (`ProgressHeader.tsx`)
Header showing task progress.

**Features:**
- Progress bar
- Current task info
- Time elapsed
- Message count

---

#### SimplifiedPostTaskReview (`SimplifiedPostTaskReview.tsx`)
Simplified post-task review.

**Features:**
- Quick rating
- Text feedback
- Continue button

---

#### TaskChatInputV2 (`TaskChatInputV2.tsx`)
Task-specific chat input (version 2).

**Features:**
- Task context awareness
- Vocabulary hints
- Grammar assistance
- Send button

---

#### TaskResumeDialog (`TaskResumeDialog.tsx`)
Dialog to resume incomplete task.

**Features:**
- Previous progress summary
- Resume/restart options

---

#### VocabularyHints (`VocabularyHints.tsx`)
Vocabulary hints during tasks.

**Features:**
- Contextual vocabulary
- Readings (furigana)
- Definitions
- Usage examples

---

### Vocabulary Components

Located in `/src/components/vocabulary/`

#### TokenizedText (`TokenizedText.tsx`)
Display tokenized Japanese text with furigana.

**Features:**
- Automatic tokenization
- Furigana display
- Word definitions on hover
- JLPT level indicators

**Usage:**
```tsx
import { TokenizedText } from '@/components/vocabulary/TokenizedText'

<TokenizedText text="今日は良い天気ですね" showFurigana={true} />
```

---

#### VocabularyDetail (`VocabularyDetail.tsx`)
Detailed vocabulary information.

**Features:**
- Word readings
- Definitions
- JLPT level
- Example sentences
- Audio pronunciation

**Usage:**
```tsx
import { VocabularyDetail } from '@/components/vocabulary/VocabularyDetail'

<VocabularyDetail word="食べる" />
```

---

### Voice Components

Located in `/src/components/voice/`

#### AudioPlayer (`AudioPlayer.tsx`)
Audio playback component.

**Features:**
- Play/pause controls
- Progress bar
- Volume control
- Playback speed

**Usage:**
```tsx
import { AudioPlayer } from '@/components/voice/AudioPlayer'

<AudioPlayer src="/audio/message.mp3" />
```

---

#### VoiceRecorder (`VoiceRecorder.tsx`)
Voice recording component.

**Features:**
- Record/stop controls
- Audio visualization
- Recording timer
- Audio preview
- Upload functionality

**Usage:**
```tsx
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'

<VoiceRecorder onRecordingComplete={handleRecording} />
```

---

## Page Components

### App Router Pages

Located in `/src/app/`

#### Root Pages
- **`page.tsx`** - Landing/home page
- **`layout.tsx`** - Root layout with providers
- **`error.tsx`** - Error page
- **`global-error.tsx`** - Global error handler
- **`not-found.tsx`** - 404 page
- **`404.tsx`** - Alternative 404
- **`500.tsx`** - Server error page

#### Auth Pages
- **`login/page.tsx`** - Login page
- **`auth/error/page.tsx`** - Authentication error

#### Dashboard Section (`/dashboard`)
- **`page.tsx`** - Dashboard home
- **`layout.tsx`** - Dashboard layout
- **`chat/page.tsx`** - Chat page
- **`characters/page.tsx`** - Characters list
- **`characters/new/page.tsx`** - Create character
- **`characters/[id]/edit/page.tsx`** - Edit character
- **`progress/page.tsx`** - Progress tracking
- **`settings/page.tsx`** - User settings
- **`tasks/page.tsx`** - Task list
- **`tasks/[taskId]/pre-study/page.tsx`** - Pre-task study
- **`tasks/[taskId]/attempt/[attemptId]/page.tsx`** - Task attempt

#### Admin Section (`/admin`)
- **`page.tsx`** - Admin dashboard
- **`layout.tsx`** - Admin layout
- **`AdminLayoutClient.tsx`** - Admin layout client component
- **`analytics/page.tsx`** - Analytics dashboard
- **`categories/page.tsx`** - Category management
- **`characters/page.tsx`** - Character management
- **`decks/page.tsx`** - Deck management
- **`decks/[deckId]/page.tsx`** - Deck detail
- **`decks/[deckId]/edit/page.tsx`** - Edit deck
- **`decks/new/page.tsx`** - Create deck
- **`settings/page.tsx`** - Admin settings
- **`tasks/page.tsx`** - Task management
- **`tasks/[taskId]/page.tsx`** - Task detail
- **`tasks/[taskId]/edit/page.tsx`** - Edit task
- **`tasks/new/page.tsx`** - Create task
- **`users/page.tsx`** - User management

#### Study Section (`/(app)/study`)
- **`page.tsx`** - Study home
- **`[deckId]/page.tsx`** - Study specific deck
- **`my-decks/page.tsx`** - My decks
- **`stats/page.tsx`** - Study statistics
- **`decks/new/page.tsx`** - Create deck
- **`decks/[deckId]/page.tsx`** - Deck detail
- **`decks/[deckId]/edit/page.tsx`** - Edit deck

#### Other Pages
- **`chat-webrtc/page.tsx`** - WebRTC chat (experimental)

---

## Styling Guide

### Tailwind Configuration

#### Custom Colors
```css
--primary: #ff5e75        /* Pink/Red */
--secondary: #1dcddc      /* Cyan */
--tertiary-yellow: #fdf29d
--tertiary-green: #8bd17b
--tertiary-purple: #4a3e72
--dark: #0c1231
```

#### Theme Variables
The app supports light and dark modes via CSS custom properties:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 352 89% 68%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

---

### Custom Animations

Defined in `/src/app/globals.css`:

```css
@keyframes slide-in-from-right { /* ... */ }
@keyframes slide-in-from-left { /* ... */ }
@keyframes slide-in-from-top { /* ... */ }
@keyframes slide-in-from-bottom { /* ... */ }
@keyframes fade-in { /* ... */ }
@keyframes scale-in { /* ... */ }
@keyframes bounce-in { /* ... */ }
@keyframes shake { /* ... */ }
@keyframes pulse-slow { /* ... */ }
```

**Usage:**
```tsx
<div className="animate-slide-in-from-right">Content</div>
<div className="animate-fade-in">Fading content</div>
```

---

### Utility Function: `cn()`

Located in `/src/lib/utils.ts`:

```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage:**
```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

---

### Responsive Design

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Usage:**
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

---

## Component Patterns

### 1. Compound Components

Used in Card, Sidebar, Dialog, etc.

**Example:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 2. Polymorphic Components (asChild)

From Radix UI's Slot component:

```tsx
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### 3. Variant-based Design (CVA)

Using Class Variance Authority:

```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        destructive: "destructive-classes",
      },
      size: {
        default: "default-size",
        sm: "small-size",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### 4. Forward Ref Pattern

For ref forwarding:

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn("...", className)} {...props} />
  }
)
Input.displayName = "Input"
```

### 5. Context Providers

Used in Sidebar, Auth, etc.:

```tsx
const [SidebarProvider, useSidebar] = createContext<SidebarContext>()

export function SidebarProvider({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SidebarProvider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarProvider>
  )
}
```

---

## Custom Hooks

Located in `/src/hooks/`

### Audio & Media

#### `use-audio-recording.ts`
Record audio from microphone.

**Usage:**
```tsx
import { useAudioRecording } from '@/hooks/use-audio-recording'

const {
  isRecording,
  startRecording,
  stopRecording,
  audioBlob,
  audioUrl,
} = useAudioRecording()
```

---

#### `use-webrtc.ts`
WebRTC functionality for real-time communication.

**Usage:**
```tsx
import { useWebRTC } from '@/hooks/use-webrtc'

const { localStream, remoteStream, startCall, endCall } = useWebRTC()
```

---

### UI Hooks

#### `use-autosize-textarea.ts`
Auto-resize textarea based on content.

**Usage:**
```tsx
import { useAutosizeTextarea } from '@/hooks/use-autosize-textarea'

const textareaRef = useRef<HTMLTextAreaElement>(null)
useAutosizeTextarea(textareaRef, value)
```

---

#### `use-mobile.ts`
Detect mobile devices.

**Usage:**
```tsx
import { useMobile } from '@/hooks/use-mobile'

const isMobile = useMobile()
```

---

#### `useResponsive.ts`
Responsive breakpoint detection.

**Usage:**
```tsx
import { useResponsive } from '@/hooks/useResponsive'

const { isMobile, isTablet, isDesktop } = useResponsive()
```

---

#### `useKeyboardShortcuts.tsx`
Global keyboard shortcuts.

**Usage:**
```tsx
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

useKeyboardShortcuts({
  'ctrl+k': () => openCommandPalette(),
  'ctrl+/': () => toggleHelp(),
})
```

---

### Chat & Conversation

#### `useChatPersistence.ts`
Persist chat messages.

**Usage:**
```tsx
import { useChatPersistence } from '@/hooks/useChatPersistence'

const { messages, addMessage, clearMessages } = useChatPersistence(sessionId)
```

---

#### `useStreamingChat.ts`
Handle streaming chat responses.

**Usage:**
```tsx
import { useStreamingChat } from '@/hooks/useStreamingChat'

const {
  messages,
  sendMessage,
  isStreaming,
  currentStream,
} = useStreamingChat()
```

---

#### `useVoiceConversation.ts`
Voice-based conversations.

**Usage:**
```tsx
import { useVoiceConversation } from '@/hooks/useVoiceConversation'

const {
  isListening,
  isProcessing,
  startListening,
  stopListening,
} = useVoiceConversation()
```

---

### Task & Progress

#### `useTaskProgress.ts`
Track task completion progress.

**Usage:**
```tsx
import { useTaskProgress } from '@/hooks/useTaskProgress'

const {
  progress,
  totalMessages,
  updateProgress,
} = useTaskProgress(taskId)
```

---

#### `useTaskFeedbackProgress.ts`
Track task feedback progress.

**Usage:**
```tsx
import { useTaskFeedbackProgress } from '@/hooks/useTaskFeedbackProgress'

const { hasSubmittedFeedback, submitFeedback } = useTaskFeedbackProgress(attemptId)
```

---

## Best Practices

### Component Development

1. **Always use TypeScript** - Define proper types and interfaces
2. **Forward refs when needed** - Use `React.forwardRef` for input-like components
3. **Set displayName** - For better debugging experience
4. **Use the `cn()` utility** - For className management
5. **Prefer composition** - Use compound components over monolithic ones
6. **Make components accessible** - Use Radix UI primitives for a11y

### Styling

1. **Use Tailwind utilities first** - Avoid custom CSS when possible
2. **Use CSS variables for theming** - Support light/dark modes
3. **Keep animations performant** - Use transform and opacity
4. **Mobile-first responsive design** - Start with mobile, enhance for desktop
5. **Use `cn()` for conditional classes** - Proper Tailwind class merging

### Performance

1. **Use React.memo for expensive components** - Prevent unnecessary re-renders
2. **Lazy load heavy components** - Use `React.lazy` and `Suspense`
3. **Optimize images** - Use Next.js Image component
4. **Debounce/throttle event handlers** - For search, resize, scroll
5. **Code split by route** - Next.js App Router does this automatically

### Accessibility

1. **Use semantic HTML** - `<button>`, `<nav>`, `<main>`, etc.
2. **Provide ARIA labels** - For screen readers
3. **Keyboard navigation** - Support Tab, Enter, Escape
4. **Focus management** - Proper focus trapping in modals
5. **Color contrast** - Meet WCAG AA standards

### State Management

1. **Use URL state for shareable state** - Search params, filters
2. **Use React Context for app-wide state** - Auth, theme, sidebar
3. **Use local state by default** - Lift state up only when needed
4. **Use custom hooks for complex logic** - Keep components clean
5. **Consider SWR/React Query** - For server state management

---

## Quick Reference

### Import Paths

```typescript
// UI Components
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'

// Feature Components
import { CharacterCard } from '@/components/character/CharacterCard'
import { ChatInput } from '@/components/conversation/ChatInput'
import { DeckBrowser } from '@/components/deck/DeckBrowser'

// Hooks
import { useMobile } from '@/hooks/use-mobile'
import { useStreamingChat } from '@/hooks/useStreamingChat'

// Utils
import { cn } from '@/lib/utils'

// Contexts
import { useAuth } from '@/contexts/AuthContext'
```

---

### Common Component Combinations

#### Dialog with Form
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Form</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Form Title</DialogTitle>
    </DialogHeader>
    <form>
      <Label htmlFor="name">Name</Label>
      <Input id="name" />
      <DialogFooter>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

#### Card with Actions
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

#### Sidebar Navigation
```tsx
<SidebarProvider>
  <Sidebar>
    <SidebarHeader>
      <h2>App Name</h2>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/dashboard">Dashboard</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
    <SidebarFooter>
      <UserProfile />
    </SidebarFooter>
  </Sidebar>
  <SidebarInset>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

---

## Component Statistics

### Total Component Count: **117+ files**

- **29** UI Design System Components
- **35** Page Components
- **32** Feature Components
- **13** Custom Hooks
- **2** Context Providers
- **1** Global CSS file

### Largest Components:
1. `message-input.tsx` - 13KB
2. `GuidedTour.tsx` - 9.6KB
3. `Notification.tsx` - 7.9KB
4. `ErrorBoundary.tsx` - 6.4KB
5. `audio-visualizer.tsx` - 5.9KB

---

## Contributing Guidelines

### Adding New Components

1. **Create component file** in appropriate directory
2. **Define TypeScript interfaces** for props
3. **Implement component** with proper ref forwarding
4. **Add to index.ts** if in a feature directory
5. **Document usage** (add to this file)
6. **Test component** with different variants and states

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

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)

### Tools
- [Lucide Icons](https://lucide.dev)
- [Framer Motion](https://www.framer.com/motion)
- [Class Variance Authority](https://cva.style)

---

## Changelog

### Version 1.0.0 (2025-11-13)
- Initial documentation created
- Documented 117+ components
- Added usage examples for all UI components
- Documented all custom hooks
- Added styling guide and best practices

---

## License

This documentation is part of the Gengotalk project.

---

**Last Updated:** 2025-11-13
**Maintainer:** Development Team
**Version:** 1.0.0
