# JLPT Question Admin Input System - Implementation Plan

**Version**: 1.2
**Last Updated**: 2025-12-29
**Status**: Planning Phase - Updated to Multi-Page Navigation
**Related Documents**: [Database Design](./01-database-design-v2.md), [Test Level Details](./02-test-level-details.md)

**Changelog v1.2:**
- Added explicit mondai type configurations with exact question numbers
- Updated to 2-sheet Excel template (Passages + Questions) for better flexibility
- Covers all special mondai types across all JLPT levels

**Changelog v1.1:**
- Changed from single-page with filters to multi-page navigation (Level → Section → Mondai → Questions)
- Auto-fills level/section/mondai from URL parameters when creating questions
- Added breadcrumb navigation
- Cleaner, more focused UI per page
- Added support for A-B comparison passages (N1/N2 Mondai 11)
- Added support for multiple questions per passage (reading comprehension, cloze tests, listening)
- Separate Excel templates for different mondai types

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [UI/UX Design](#3-uiux-design)
4. [Special Mondai Types](#4-special-mondai-types)
   - 4.1 [Explicit Mondai Configurations](#41-explicit-mondai-configurations)
   - 4.2 [Single Create Form UI](#42-single-create-form-ui)
   - 4.3 [Student Preview for Special Types](#43-student-preview-for-special-types)
5. [Technical Implementation](#5-technical-implementation)
6. [Cloudflare R2 Setup](#6-cloudflare-r2-setup)
7. [Bulk Import System (2-Sheet Template)](#7-bulk-import-system-2-sheet-template)
8. [Validation & Security](#8-validation--security)
9. [File Structure](#9-file-structure)
10. [Implementation Timeline](#10-implementation-timeline)

---

## 1. Overview

### 1.1 Goals

Create an admin interface for inputting JLPT test questions with:
- ✅ Unified form adapting to mondai type
- ✅ Rich text formatting (React-Quill)
- ✅ Media upload via Cloudflare R2
- ✅ Bulk import from Excel (.xlsx)
- ✅ Student preview for validation
- ✅ Access for all admins

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Page Navigation** | Separate pages for Level → Section → Mondai selection |
| **Single Unified Form** | One form adapts based on mondai type (auto-filled from URL) |
| **Passage Support** | Embedded passage form when mondai requires it |
| **Rich Text Editor** | React-Quill with bold, underline, italic, furigana |
| **Media Upload** | Cloudflare R2 for audio/images (free tier) |
| **Bulk Import** | Excel import by mondai with validation |
| **Student Preview** | Real-time preview of how students will see questions |
| **Validation** | Comprehensive validation (passage required, answer key, etc.) |

---

## 2. System Architecture

### 2.1 Page Structure (Multi-Page Navigation)

```
/admin/jlpt/questions
  └─ Level Selection Page (N5, N4, N3, N2, N1 cards)
      │
      ↓
/admin/jlpt/questions/[level]
  └─ Section Selection Page (Vocabulary, Grammar/Reading, Listening cards)
      │
      ↓
/admin/jlpt/questions/[level]/[section]
  └─ Mondai Selection Page (Mondai 1-20 cards with question counts)
      │
      ↓
/admin/jlpt/questions/[level]/[section]/[mondai]
  └─ Question Management Page for specific mondai
      ├─ Breadcrumb navigation (Level > Section > Mondai)
      ├─ Question List Table (all questions for this mondai)
      ├─ Action Bar
      │  ├─ [+ Add New Question] (auto-fills level/section/mondai)
      │  └─ [📥 Bulk Import] (imports to this mondai)
      └─ Modals
         ├─ Question Form Modal (Unified)
         ├─ Bulk Import Modal
         └─ Student Preview Modal
```

**URL Examples:**
- `/admin/jlpt/questions` - Level selection
- `/admin/jlpt/questions/N5` - Section selection for N5
- `/admin/jlpt/questions/N5/vocabulary` - Mondai selection for N5 Vocabulary
- `/admin/jlpt/questions/N5/vocabulary/1` - Question management for Mondai 1

### 2.2 Data Flow

```
Admin Input → Validation → Preview → Save
                                      ↓
                        Transaction (Prisma)
                                      ↓
        ┌────────────────────────────┴────────────────────┐
        ↓                            ↓                     ↓
    Passages                     Questions          Answer Choices
        ↓                            ↓
  Question Units ←─────────── Unit Questions
```

### 2.3 Component Hierarchy

```tsx
{/* Page 1: Level Selection */}
<LevelSelectionPage>
  <LevelCard level="N5" questionCount={500} />
  <LevelCard level="N4" questionCount={450} />
  {/* ... */}
</LevelSelectionPage>

{/* Page 2: Section Selection */}
<SectionSelectionPage level="N5">
  <Breadcrumb items={['Questions', 'N5']} />
  <SectionCard section="vocabulary" mondaiCount={4} questionCount={30} />
  <SectionCard section="grammar_reading" mondaiCount={6} questionCount={32} />
  <SectionCard section="listening" mondaiCount={4} questionCount={24} />
</SectionSelectionPage>

{/* Page 3: Mondai Selection */}
<MondaiSelectionPage level="N5" section="vocabulary">
  <Breadcrumb items={['Questions', 'N5', 'Vocabulary']} />
  <MondaiCard mondai={1} questionCount={12} maxQuestions={12} />
  <MondaiCard mondai={2} questionCount={8} maxQuestions={8} />
  {/* ... */}
</MondaiSelectionPage>

{/* Page 4: Question Management for Specific Mondai */}
<QuestionManagementPage level="N5" section="vocabulary" mondai={1}>
  <Breadcrumb items={['Questions', 'N5', 'Vocabulary', 'Mondai 1']} />
  <ActionBar>
    <AddQuestionButton />
    <BulkImportButton />
  </ActionBar>
  <QuestionListTable />

  {/* Modals */}
  <QuestionFormModal>
    <PassageFormSection />  {/* Conditional */}
    <QuestionInputSection>
      <RichTextEditor />
      <AnswerChoiceInput />
      <MediaUploadWidget />
    </QuestionInputSection>
    <StudentPreviewPanel />
  </QuestionFormModal>

  <BulkImportModal>
    <FileUpload />
    <PreviewTable />
    <StudentPreviewPanel />
  </BulkImportModal>
</QuestionManagementPage>
```

---

## 3. UI/UX Design

### 3.1 Page 1: Level Selection

```
┌─────────────────────────────────────────────────────────────────┐
│  JLPT Question Management                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Select Level:                                                  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   N5     │  │   N4     │  │   N3     │  │   N2     │       │
│  │          │  │          │  │          │  │          │       │
│  │ 86 Q     │  │ 105 Q    │  │ 104 Q    │  │ 104 Q    │       │
│  │ 14 Mondai│  │ 15 Mondai│  │ 16 Mondai│  │ 16 Mondai│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────┐                                                   │
│  │   N1     │                                                   │
│  │          │                                                   │
│  │ 110 Q    │                                                   │
│  │ 17 Mondai│                                                   │
│  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Page 2: Section Selection

```
┌─────────────────────────────────────────────────────────────────┐
│  JLPT Question Management                                       │
│  Questions > N5                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [← Back to Levels]                                             │
│                                                                  │
│  Select Section for N5:                                         │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐             │
│  │  言語知識（文字・語彙） │  │  言語知識（文法）・読解 │             │
│  │  Vocabulary         │  │  Grammar & Reading  │             │
│  │                     │  │                     │             │
│  │  30 Questions       │  │  32 Questions       │             │
│  │  4 Mondai           │  │  6 Mondai           │             │
│  └─────────────────────┘  └─────────────────────┘             │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │  聴解               │                                        │
│  │  Listening          │                                        │
│  │                     │                                        │
│  │  24 Questions       │                                        │
│  │  4 Mondai           │                                        │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Page 3: Mondai Selection

```
┌─────────────────────────────────────────────────────────────────┐
│  JLPT Question Management                                       │
│  Questions > N5 > Vocabulary                                    │
├─────────────────────────────────────────────────────────────────┤
│  [← Back to Sections]                                           │
│                                                                  │
│  Select Mondai for N5 Vocabulary:                               │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Mondai 1 │  │ Mondai 2 │  │ Mondai 3 │  │ Mondai 4 │       │
│  │ 漢字読み  │  │ 表記     │  │ 文脈規定  │  │ 言い換え  │       │
│  │          │  │          │  │          │  │          │       │
│  │ 12/12 Q  │  │ 8/8 Q    │  │ 10/10 Q  │  │ 5/5 Q    │       │
│  │ ✅ Complete│ │ ✅ Complete│ │ ⚠️  90%   │ │ ❌ 0%     │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Page 4: Question Management (Specific Mondai)

```
┌─────────────────────────────────────────────────────────────────┐
│  JLPT Question Management                                       │
│  Questions > N5 > Vocabulary > Mondai 1                         │
├─────────────────────────────────────────────────────────────────┤
│  [← Back to Mondai List]                                        │
│                                                                  │
│  N5 - Vocabulary - Mondai 1 (漢字読み)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [+ Add New Question]  [📥 Bulk Import]  [📄 Template]   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Questions (12/12):                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ # │ Question Preview        │ Type      │ Actions        │  │
│  ├───┼────────────────────────┼───────────┼────────────────┤  │
│  │ 1 │ 日本語を_____します。   │ Standard  │ [Edit][Delete] │  │
│  │ 2 │ これは_____です。       │ Standard  │ [Edit][Delete] │  │
│  │ 3 │ 昨日、友達と...         │ Standard  │ [Edit][Delete] │  │
│  └──────────────────────────────────────────────────────────┘  │
│  [← Prev]  Page 1 of 1  [Next →]                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Unified Question Form Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Question - N5 / Vocabulary / Mondai 1             [×]      │
├─────────────────────────────────────────────────────────────────┤
│  [📝 Edit Mode]  [👁️ Student Preview]                          │
│  ────────────────────────────────────────────────────────────   │
│                                                                  │
│  {IF MONDAI HAS PASSAGE}                                        │
│  ┌─ Passage Configuration ──────────────────────────────────┐  │
│  │ Content Type: ○ Text  ○ Audio  ○ Image                  │  │
│  │                                                           │  │
│  │ Title/Instructions:                                       │  │
│  │ ┌───────────────────────────────────────────────────┐    │  │
│  │ │ 次の文章を読んで、質問に答えてください。              │  │
│  │ └───────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │ Content: [Rich Text Editor]                              │  │
│  │ ┌───────────────────────────────────────────────────┐    │  │
│  │ │ 昨日、友達と映画を見ました。                         │  │
│  │ │ とても面白かったです。                               │  │
│  │ │ [B] [I] [U] [ふりがな]                               │  │
│  │ └───────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │ Media Upload (if audio/image):                           │  │
│  │ [Choose File] [📁] No file chosen                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Question #1 ─────────────────────────────────────────────┐ │
│  │ Question Text: [Rich Text Editor]                         │ │
│  │ ┌─────────────────────────────────────────────────────┐   │ │
│  │ │ 何をしましたか？                                        │ │
│  │ │ [B] [I] [U] [ふりがな]                                │ │
│  │ └─────────────────────────────────────────────────────┘   │ │
│  │                                                            │ │
│  │ Question Type: [Standard ▼]                               │ │
│  │ Blank Position: [___] (for cloze type)                    │ │
│  │                                                            │ │
│  │ Media Upload (optional): [Choose File] [📁]               │ │
│  │                                                            │ │
│  │ Answer Choices:                                            │ │
│  │ ┌────────────────────────────────────────────────────┐    │ │
│  │ │ ○ 1. 映画を見た                                       │ │
│  │ │ ○ 2. 本を読んだ                                       │ │
│  │ │ ○ 3. 音楽を聞いた                                     │ │
│  │ │ ○ 4. 買い物をした                         [Remove]  │ │
│  │ └────────────────────────────────────────────────────┘    │ │
│  │                                                            │ │
│  │ Correct Answer: [1 ▼]                                     │ │
│  │ Difficulty: [Medium ▼]                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [+ Add Another Question] (if passage-based mondai)             │
│                                                                  │
│  [💾 Save]  [Cancel]                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Student Preview Panel

```
┌─────────────────────────────────────────────────────────────────┐
│  👁️ Student Preview                                    [×]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  {IF HAS PASSAGE}                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 次の文章を読んで、質問に答えてください。                   │
│  │                                                          │   │
│  │ 昨日、友達と映画を見ました。                             │   │
│  │ とても面白かったです。                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  問題 1                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 何をしましたか？                                           │   │
│  │                                                          │   │
│  │ □ 1. 映画を見た                                          │   │
│  │ □ 2. 本を読んだ                                          │   │
│  │ □ 3. 音楽を聞いた                                        │   │
│  │ □ 4. 買い物をした                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ℹ️ Correct Answer: Choice 1                                   │
│  ℹ️ Difficulty: Medium                                         │
│                                                                  │
│  [Close]                                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.7 Bulk Import Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  📥 Bulk Import Questions - N5 / Vocabulary / Mondai 1  [×]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Download Template                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [📄 Download Excel Template for this Mondai]           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Step 2: Upload File                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Drag & drop Excel file here or [Choose File]           │   │
│  │ File: questions_n5_vocab_mondai1.xlsx  ✅               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Step 3: Preview & Validate                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✅ 12 questions found                                   │   │
│  │ ✅ Passage detected (text type)                         │   │
│  │ ✅ All questions have 3-4 answer choices                │   │
│  │ ✅ Correct answers specified                            │   │
│  │ ⚠️  Warning: Question 5 has no media (optional)         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Preview (First 3 questions):                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ # │ Question          │ Choices     │ Correct │ Status  │   │
│  ├───┼──────────────────┼─────────────┼─────────┼─────────┤   │
│  │ 1 │ 何をしましたか？  │ 4 choices   │ Choice 1│ ✅      │   │
│  │ 2 │ どうでしたか？    │ 4 choices   │ Choice 1│ ✅      │   │
│  │ 3 │ いつでしたか？    │ 4 choices   │ Choice 2│ ✅      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [👁️ Preview as Student]  [💾 Import]  [Cancel]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Special Mondai Types

This section details all mondai types that have special input requirements (passages with multiple questions, A-B comparisons, cloze tests, etc.).

### 4.1 Explicit Mondai Configurations

Each mondai type is explicitly defined with its structure and question numbers.

#### 4.1.1 N5 Mondai 4 - Short Text Reading (Questions 27-29)
**Structure:** 3 texts → 3 questions (1 question per text)
**Passage Type:** Text (short passages)
**Question Numbers:** 27, 28, 29

**Form Behavior:**
- Display 3 passage inputs (Passage 1, 2, 3)
- Each passage has its own question
- Admin creates all 3 passage-question pairs together

#### 4.1.2 N5 Mondai 5 - Medium Text Reading (Questions 30-31)
**Structure:** 2 texts → 2 questions (1 question per text)
**Passage Type:** Text (medium passages)
**Question Numbers:** 30, 31

**Form Behavior:**
- Display 2 passage inputs
- Each passage has 1 question
- Admin creates both pairs together

#### 4.1.3 N4 Mondai 4 - Short Text Reading (Questions 26-29)
**Structure:** 4 texts → 4 questions (1 question per text)
**Passage Type:** Text (short passages)
**Question Numbers:** 26, 27, 28, 29

**Form Behavior:**
- Display 4 passage inputs
- Each passage has 1 question
- Admin creates all 4 pairs together

#### 4.1.4 N3 Mondai 3 - Cloze Test (Questions 19-23)
**Structure:** 1 passage → 5 questions (blanks numbered 19-23)
**Passage Type:** Text with numbered blanks
**Question Numbers:** 19, 20, 21, 22, 23

**Form Behavior:**
- Single passage with rich text containing blank markers [19], [20], etc.
- 5 separate question fields (one per blank)
- All questions share the same passage

#### 4.1.5 N2 Mondai 7 - Short Reading (Questions 41-44)
**Structure:** 4 texts → 4 questions (1 question per text)
**Passage Type:** Text (informational, emails, notices)
**Question Numbers:** 41, 42, 43, 44

**Form Behavior:**
- Display 4 passage inputs
- Each passage has 1 question
- Admin creates all 4 pairs together

#### 4.1.6 N2 Mondai 11 - Long Reading (Questions 60-68)
**Structure:** 3 texts → 9 questions (3 questions per text)
**Passage Type:** Text (long analytical passages)
**Question Numbers:** 60-62 (text 1), 63-65 (text 2), 66-68 (text 3)

**Form Behavior:**
- Display 3 passage inputs (Text 1, 2, 3)
- Each text has 3 question fields
- Total 9 questions created together

#### 4.1.7 N2 Mondai 12 - A-B Comparison (Questions 69-71)
**Structure:** 2 texts (A & B) → 3 questions comparing both
**Passage Type:** Text (two related passages)
**Question Numbers:** 69, 70, 71

**Form Behavior:**
- Display 2 passage inputs labeled "Passage A" and "Passage B"
- 3 question fields that compare both passages
- Questions reference both texts

#### 4.1.8 N1 Mondai 7 - Short Reading (Questions 41-44)
**Structure:** 4 texts → 4 questions (1 question per text)
**Passage Type:** Text (complex informational texts)
**Question Numbers:** 41, 42, 43, 44

**Form Behavior:**
- Display 4 passage inputs
- Each passage has 1 question
- Admin creates all 4 pairs together

#### 4.1.9 N1 Mondai 9 - Medium Reading (Questions 50-58)
**Structure:** 3 texts → 9 questions (3 questions per text)
**Passage Type:** Text (medium analytical passages)
**Question Numbers:** 50-52 (text 1), 53-55 (text 2), 56-58 (text 3)

**Form Behavior:**
- Display 3 passage inputs
- Each text has 3 question fields
- Total 9 questions created together

#### 4.1.10 N1 Mondai 10 - Long Reading (Questions 59-63)
**Structure:** 1 long text → 5 questions
**Passage Type:** Text (very long analytical passage)
**Question Numbers:** 59, 60, 61, 62, 63

**Form Behavior:**
- Single long passage input
- 5 separate question fields
- All questions analyze the same passage

#### 4.1.11 N1 Mondai 11 - A-B Comparison (Questions 64-66)
**Structure:** 2 texts (A & B) → 3 questions comparing both
**Passage Type:** Text (two related complex passages)
**Question Numbers:** 64, 65, 66

**Form Behavior:**
- Display 2 passage inputs labeled "Passage A" and "Passage B"
- 3 question fields that compare both passages
- Questions reference both texts

#### 4.1.12 Listening Mondai 5 (3番) - Long Audio Multiple Questions
**Structure:** 1 audio → 2 questions
**Passage Type:** Audio (long conversation or monologue)
**Question Numbers:** Varies by level

**Form Behavior:**
- Single audio upload field
- 2 question fields
- Both questions reference the same audio

---

### 4.2 Single Create Form UI

Based on mondai type, the form adapts to show the appropriate structure.

#### Example: N1 Mondai 11 (A-B Comparison) Single Create Form

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Questions - N1 / Grammar & Reading / Mondai 11   [×]      │
├─────────────────────────────────────────────────────────────────┤
│  [📝 Edit Mode]  [👁️ Student Preview]                          │
│  ────────────────────────────────────────────────────────────   │
│                                                                  │
│  ┌─ Passage A ──────────────────────────────────────────────┐  │
│  │ Title: [次の文章Aを読んで、質問に答えてください。]         │  │
│  │                                                           │  │
│  │ Content: [Rich Text Editor]                              │  │
│  │ ┌───────────────────────────────────────────────────┐    │  │
│  │ │ 日本の伝統的な家屋について述べている文章...           │  │
│  │ │ [B] [I] [U] [ふりがな]                               │  │
│  │ └───────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Passage B ──────────────────────────────────────────────┐  │
│  │ Title: [次の文章Bを読んで、質問に答えてください。]         │  │
│  │                                                           │  │
│  │ Content: [Rich Text Editor]                              │  │
│  │ ┌───────────────────────────────────────────────────┐    │  │
│  │ │ 現代の住宅事情について述べている文章...               │  │
│  │ │ [B] [I] [U] [ふりがana]                              │  │
│  │ └───────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Question #1 ─────────────────────────────────────────────┐ │
│  │ Question Text:                                             │ │
│  │ ┌─────────────────────────────────────────────────────┐   │ │
│  │ │ 文章AとBの共通点は何ですか？                            │ │
│  │ └─────────────────────────────────────────────────────┘   │ │
│  │                                                            │ │
│  │ Answer Choices:                                            │ │
│  │ ○ 1. どちらも住宅について述べている                        │ │
│  │ ○ 2. どちらも伝統について述べている                        │ │
│  │ ○ 3. どちらも現代について述べている                        │ │
│  │ ○ 4. どちらも建築について述べている                        │ │
│  │                                                            │ │
│  │ Correct Answer: [1 ▼]  Difficulty: [Medium ▼]            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [+ Add Another Question]                                       │
│                                                                  │
│  [💾 Save All]  [Cancel]                                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Example: N1 Mondai 9 (Multi-Question) Single Create Form

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Questions - N1 / Grammar & Reading / Mondai 9     [×]      │
├─────────────────────────────────────────────────────────────────┤
│  [📝 Edit Mode]  [👁️ Student Preview]                          │
│  ────────────────────────────────────────────────────────────   │
│                                                                  │
│  ℹ️ This mondai: 3 texts → 9 questions (3 per text)           │
│                                                                  │
│  ┌─ Text 1 (Questions 50-52) ──────────────────────────────┐  │
│  │ Title: [次の文章を読んで、質問に答えてください。]           │  │
│  │ Content: [Rich Text Editor]                              │  │
│  │ ┌───────────────────────────────────────────────────┐    │  │
│  │ │ 環境問題に関する長文...                               │  │
│  │ │ [B] [I] [U] [ふりがな]                               │  │
│  │ └───────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │ Question 50: [この文章の主題は何ですか？]                │  │
│  │ Question 51: [筆者の意見はどれですか？]                  │  │
│  │ Question 52: [今後の課題は何ですか？]                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Text 2 (Questions 53-55) ──────────────────────────────┐  │
│  │ [Similar structure]                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Text 3 (Questions 56-58) ──────────────────────────────┐  │
│  │ [Similar structure]                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [💾 Save All (9 Questions)]  [Cancel]                          │
└─────────────────────────────────────────────────────────────────┘
```

#### Example: N3 Mondai 3 (Cloze Test) Single Create Form

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Questions - N3 / Grammar & Reading / Mondai 3     [×]      │
├─────────────────────────────────────────────────────────────────┤
│  ℹ️ Cloze Test: 1 passage → 5 questions (blanks 19-23)        │
│                                                                  │
│  ┌─ Passage with Blanks ────────────────────────────────────┐  │
│  │ Title: [次の文章を読んで、[19]から[23]に何を入れますか。] │  │
│  │                                                           │  │
│  │ Content: [Rich Text Editor]                              │  │
│  │ ┌───────────────────────────────────────────────────┐    │  │
│  │ │ 昨日、友達と[19]を見ました。                         │  │
│  │ │ とても[20]かったです。でも、[21]が...                │  │
│  │ │ [Insert Blank] buttons for [19], [20], [21], etc.   │  │
│  │ └───────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ Blank 19 ────────────────────────────────────────────────┐ │
│  │ Question Text: [19]に何を入れますか？                      │ │
│  │ ○ 1. 映画  ○ 2. 本  ○ 3. 音楽  ○ 4. テレビ             │ │
│  │ Correct: [1 ▼]  Difficulty: [Medium ▼]                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Similar fields for blanks 20-23]                              │
│                                                                  │
│  [💾 Save All (5 Questions)]  [Cancel]                          │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.3 Student Preview for Special Types

#### A-B Comparison Preview

```
┌─────────────────────────────────────────────────────────────────┐
│  👁️ Student Preview - A-B Comparison                  [×]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ 文章A ────────────────────────────────────────────────┐   │
│  │ 次の文章Aを読んで、質問に答えてください。                 │
│  │                                                          │   │
│  │ 日本の伝統的な家屋について述べている文章...               │
│  │ （本文）                                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ 文章B ────────────────────────────────────────────────┐   │
│  │ 次の文章Bを読んで、質問に答えてください。                 │
│  │                                                          │   │
│  │ 現代の住宅事情について述べている文章...                   │
│  │ （本文）                                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  問題 1                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 文章AとBの共通点は何ですか？                               │   │
│  │ □ 1. どちらも住宅について述べている                      │   │
│  │ □ 2. どちらも伝統について述べている                      │   │
│  │ □ 3. どちらも現代について述べている                      │   │
│  │ □ 4. どちらも建築について述べている                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ℹ️ Correct Answer: Choice 1                                   │
│                                                                  │
│  [Close]                                                         │
└─────────────────────────────────────────────────────────────────┘
```

#### Multi-Question Preview

```
┌─────────────────────────────────────────────────────────────────┐
│  👁️ Student Preview - Reading Comprehension        [×]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ 文章 ─────────────────────────────────────────────────┐   │
│  │ 次の文章を読んで、質問に答えてください。                   │
│  │                                                          │   │
│  │ 環境問題に関する長文...                                   │
│  │ （multiple paragraphs）                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  問題 1                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ この文章の主題は何ですか？                                 │   │
│  │ □ 1. 環境保護の重要性                                    │   │
│  │ □ 2. 経済発展の課題                                      │   │
│  │ □ 3. 技術革新の影響                                      │   │
│  │ □ 4. 国際協力の必要性                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ℹ️ Correct: Choice 1                                          │
│                                                                  │
│  問題 2                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 筆者の意見はどれですか？                                   │   │
│  │ □ 1. 個人の努力が重要                                    │   │
│  │ □ 2. 政府の役割が大きい                                  │   │
│  │ □ 3. 企業の責任が重い                                    │   │
│  │ □ 4. 全員の協力が必要                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ℹ️ Correct: Choice 4                                          │
│                                                                  │
│  問題 3                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 今後の課題は何ですか？                                     │   │
│  │ □ 1. 技術開発                                            │   │
│  │ □ 2. 意識改革                                            │   │
│  │ □ 3. 制度整備                                            │   │
│  │ □ 4. 予算確保                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ℹ️ Correct: Choice 2                                          │
│                                                                  │
│  [Close]                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Technical Implementation

### 5.1 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Rich Text Editor** | React-Quill | Question/passage formatting |
| **File Upload** | Cloudflare R2 | Media storage (audio/images) |
| **Bulk Import** | xlsx (SheetJS) | Excel parsing |
| **Validation** | Zod | Schema validation |
| **Database** | Prisma + PostgreSQL | Data persistence |
| **UI Framework** | Next.js 14 + Tailwind | Frontend |

### 4.2 Dependencies to Install

```bash
npm install react-quill quill
npm install xlsx
npm install @aws-sdk/client-s3  # For R2 (S3-compatible)
npm install zod
npm install react-dropzone  # For file upload UI
```

### 4.3 Environment Variables

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=gengobot-jlpt-media
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

---

## 6. Cloudflare R2 Setup

### 6.1 R2 Bucket Creation

**Step-by-step:**

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to R2 Object Storage

2. **Create Bucket**
   ```
   Bucket Name: gengobot-jlpt-media
   Location: Automatic (default)
   ```

3. **Configure CORS (Important!)**
   ```json
   [
     {
       "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

4. **Generate API Token**
   - R2 Dashboard → Manage R2 API Tokens
   - Create API Token with permissions:
     - ✅ Object Read & Write
     - ✅ Bucket: gengobot-jlpt-media
   - Save credentials:
     - Access Key ID
     - Secret Access Key

5. **Enable Public Access (Optional)**
   - Settings → Public Access
   - Enable public URL: `https://pub-xxxxx.r2.dev`
   - Or use custom domain

### 6.2 R2 Client Implementation

**File:** `/src/lib/cloudflare-r2.ts`

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  file: File,
  folder: 'audio' | 'images',
  level: string,
  mondai: number
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${level}/mondai${mondai}/${timestamp}_${sanitizedFilename}`;

  const buffer = await file.arrayBuffer();

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    })
  );

  // Return public URL
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(fileUrl: string): Promise<void> {
  const key = fileUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '');

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

export async function getSignedUploadUrl(
  filename: string,
  contentType: string,
  folder: 'audio' | 'images'
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${timestamp}_${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  const fileUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, fileUrl };
}
```

### 6.3 Upload API Endpoint

**File:** `/src/app/api/jlpt/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/cloudflare-r2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as 'audio' | 'images';
    const level = formData.get('level') as string;
    const mondai = parseInt(formData.get('mondai') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = {
      audio: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
      images: ['image/jpeg', 'image/png', 'image/jpg'],
    };

    if (!allowedTypes[folder].includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size (5MB for images, 20MB for audio)
    const maxSize = folder === 'images' ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }

    // Upload to R2
    const fileUrl = await uploadToR2(file, folder, level, mondai);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: file.name,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

---

## 7. Bulk Import System (2-Sheet Template)

**Major Change in v1.2:** All Excel templates now use 2 sheets (Passages + Questions) for maximum flexibility and clarity.

### 7.1 2-Sheet Template Structure

All bulk import templates use **2 separate sheets**:
- **Sheet 1: Passages** - Contains all passage data
- **Sheet 2: Questions** - Contains all question data with passage references

This approach:
- ✅ Works for ALL mondai types (with/without passages, single/multiple passages, A-B comparison)
- ✅ Clearer structure - passages separate from questions
- ✅ Easier to edit - no merged cells or complex row dependencies
- ✅ Scalable - add more passages or questions independently

---

### 7.2 Sheet 1: Passages

**For mondai WITHOUT passages:** Leave this sheet empty or delete it.

**For mondai WITH passages:**

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| passage_id | Unique ID for reference | Yes | P001 |
| passage_label | Label (e.g., "A", "B", "Text 1") | No | A |
| content_type | text/audio/image | Yes | text |
| title | Instructions | Yes | 次の文章Aを読んで、質問に答えてください。 |
| content_text | Full text (if type=text) | Conditional | 日本の伝統的な家屋について... |
| media_url | URL (if type=audio/image) | Conditional | https://r2.example.com/audio.mp3 |

**Example (N1 Mondai 11 - A-B Comparison):**

```excel
passage_id | passage_label | content_type | title                              | content_text                    | media_url
P001       | A             | text         | 次の文章Aを読んで、質問に答えてください。 | 日本の伝統的な家屋について...      |
P002       | B             | text         | 次の文章Bを読んで、質問に答えてください。 | 現代の住宅事情について...          |
```

**Example (N1 Mondai 9 - 3 texts, 3 questions each):**

```excel
passage_id | passage_label | content_type | title                              | content_text                    | media_url
P001       | Text 1        | text         | 次の文章を読んで、質問に答えてください。 | 環境問題に関する長文...            |
P002       | Text 2        | text         | 次の文章を読んで、質問に答えてください。 | 経済発展に関する長文...            |
P003       | Text 3        | text         | 次の文章を読んで、質問に答えてください。 | 技術革新に関する長文...            |
```

**Example (N3 Mondai 3 - Cloze Test):**

```excel
passage_id | passage_label | content_type | title                                      | content_text                           | media_url
P001       | -             | text         | 次の文章を読んで、[19]から[23]に何を入れますか。 | 昨日、友達と[19]を見ました。とても[20]... |
```

**Example (Listening with Audio):**

```excel
passage_id | passage_label | content_type | title                              | content_text | media_url
P001       | -             | audio        | 次の音声を聞いて、質問に答えてください。 |              | https://r2.example.com/n1_m5_q1.mp3
```

---

### 7.3 Sheet 2: Questions

**For ALL mondai types (with or without passages):**

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| passage_id | Reference to Sheet 1 | Conditional | P001 |
| passage_id_secondary | For A-B comparison | Conditional | P002 |
| question_number | Question number | Yes | 64 |
| question_text | Question text | Yes | 文章AとBの共通点は何ですか？ |
| question_type | standard/cloze/comparison/graphic | Yes | comparison |
| blank_position | For cloze only | No | 19 |
| media_url | Question-specific media | No | |
| choice_1 | First choice | Yes | どちらも住宅について述べている |
| choice_2 | Second choice | Yes | どちらも伝統について述べている |
| choice_3 | Third choice | Yes | どちらも現代について述べている |
| choice_4 | Fourth choice | No | どちらも建築について述べている |
| correct_answer | 1, 2, 3, or 4 | Yes | 1 |
| difficulty | easy/medium/hard | Yes | medium |

**Example 1: Mondai WITHOUT Passage (N5 Mondai 1)**

```excel
passage_id | passage_id_secondary | question_number | question_text              | question_type | choice_1  | choice_2  | choice_3  | choice_4 | correct_answer | difficulty
           |                      | 1               | 日本語を_____します。        | standard      | 勉強する   | 仕事する  | 食べる    | 寝る     | 1              | medium
           |                      | 2               | これは_____です。            | standard      | 本        | ペン      | 机        | 椅子     | 1              | easy
```

**Example 2: N1 Mondai 11 - A-B Comparison (Questions 64-66)**

```excel
passage_id | passage_id_secondary | question_number | question_text               | question_type | choice_1                  | choice_2                  | choice_3                  | choice_4                  | correct_answer | difficulty
P001       | P002                 | 64              | 文章AとBの共通点は何ですか？  | comparison    | どちらも住宅について述べている | どちらも伝統について述べている | どちらも現代について述べている | どちらも建築について述べている | 1              | medium
P001       | P002                 | 65              | 文章Aの主張は何ですか？      | comparison    | [choice 1]                | [choice 2]                | [choice 3]                | [choice 4]                | 2              | hard
P001       | P002                 | 66              | 文章Bで述べられている課題は？ | comparison    | [choice 1]                | [choice 2]                | [choice 3]                | [choice 4]                | 3              | medium
```

**Example 3: N1 Mondai 9 - Multi-Question (Questions 50-58)**

```excel
passage_id | passage_id_secondary | question_number | question_text               | question_type | choice_1        | choice_2        | choice_3        | choice_4        | correct_answer | difficulty
P001       |                      | 50              | この文章の主題は何ですか？    | standard      | 環境保護の重要性 | 経済発展の課題  | 技術革新の影響  | 国際協力の必要性 | 1              | medium
P001       |                      | 51              | 筆者の意見はどれですか？      | standard      | 個人の努力が重要 | 政府の役割が大きい | 企業の責任が重い | 全員の協力が必要 | 4              | hard
P001       |                      | 52              | 今後の課題は何ですか？        | standard      | 技術開発        | 意識改革        | 制度整備        | 予算確保        | 2              | medium
P002       |                      | 53              | この文章の主題は何ですか？    | standard      | [choice 1]      | [choice 2]      | [choice 3]      | [choice 4]      | 1              | medium
P002       |                      | 54              | 筆者の意見はどれですか？      | standard      | [choice 1]      | [choice 2]      | [choice 3]      | [choice 4]      | 2              | hard
P002       |                      | 55              | 今後の課題は何ですか？        | standard      | [choice 1]      | [choice 2]      | [choice 3]      | [choice 4]      | 3              | medium
P003       |                      | 56              | この文章の主題は何ですか？    | standard      | [choice 1]      | [choice 2]      | [choice 3]      | [choice 4]      | 1              | medium
P003       |                      | 57              | 筆者の意見はどれですか？      | standard      | [choice 1]      | [choice 2]      | [choice 3]      | [choice 4]      | 3              | hard
P003       |                      | 58              | 今後の課題は何ですか？        | standard      | [choice 1]      | [choice 2]      | [choice 3]      | [choice 4]      | 2              | medium
```

**Example 4: N3 Mondai 3 - Cloze Test (Questions 19-23)**

```excel
passage_id | passage_id_secondary | question_number | question_text              | question_type | blank_position | choice_1  | choice_2  | choice_3  | choice_4 | correct_answer | difficulty
P001       |                      | 19              | [19]に何を入れますか？      | cloze         | 19             | 映画      | 本        | 音楽      | テレビ   | 1              | medium
P001       |                      | 20              | [20]に何を入れますか？      | cloze         | 20             | 面白      | つまらな  | 難し      | 簡単     | 1              | easy
P001       |                      | 21              | [21]に何を入れますか？      | cloze         | 21             | 時間      | お金      | 場所      | 人       | 1              | medium
P001       |                      | 22              | [22]に何を入れますか？      | cloze         | 22             | [choice1] | [choice2] | [choice3] | [choice4]| 2              | medium
P001       |                      | 23              | [23]に何を入れますか？      | cloze         | 23             | [choice1] | [choice2] | [choice3] | [choice4]| 3              | hard
```

**Example 5: N5 Mondai 4 - Multiple Short Texts (Questions 27-29)**

```excel
passage_id | passage_id_secondary | question_number | question_text               | question_type | choice_1      | choice_2      | choice_3      | choice_4      | correct_answer | difficulty
P001       |                      | 27              | 何について書いていますか？   | standard      | 仕事          | 趣味          | 家族          | 旅行          | 1              | easy
P002       |                      | 28              | 何について書いていますか？   | standard      | 勉強          | 食事          | スポーツ      | 買い物        | 2              | easy
P003       |                      | 29              | 何について書いていますか？   | standard      | 天気          | 健康          | お金          | 時間          | 3              | easy
```

---

### 7.4 Template Generation (2-Sheet)

**File:** `/src/app/api/jlpt/questions/template/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getMondaiConfig } from '@/config/jlpt-mondai';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const level = searchParams.get('level') as string;
  const section = searchParams.get('section') as string;
  const mondai = parseInt(searchParams.get('mondai') as string);

  // Get mondai configuration
  const mondaiConfig = getMondaiConfig(level, section, mondai);

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Passages (if mondai needs passages)
  if (mondaiConfig.needsPassage) {
    const passageExamples = generatePassageExamples(mondaiConfig);
    const passageSheet = XLSX.utils.json_to_sheet(passageExamples);
    XLSX.utils.book_append_sheet(workbook, passageSheet, 'Passages');
  }

  // Sheet 2: Questions (always present)
  const questionExamples = generateQuestionExamples(mondaiConfig);
  const questionSheet = XLSX.utils.json_to_sheet(questionExamples);
  XLSX.utils.book_append_sheet(workbook, questionSheet, 'Questions');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Return Excel file
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="jlpt_${level}_${section}_mondai${mondai}_template.xlsx"`,
    },
  });
}

function generatePassageExamples(mondaiConfig: any) {
  const { passageStructure } = mondaiConfig;

  if (passageStructure.type === 'ab_comparison') {
    // A-B comparison (2 passages)
    return [
      {
        passage_id: 'P001',
        passage_label: 'A',
        content_type: 'text',
        title: '次の文章Aを読んで、質問に答えてください。',
        content_text: '【ここに文章Aの内容を入力してください】',
        media_url: '',
      },
      {
        passage_id: 'P002',
        passage_label: 'B',
        content_type: 'text',
        title: '次の文章Bを読んで、質問に答えてください。',
        content_text: '【ここに文章Bの内容を入力してください】',
        media_url: '',
      },
    ];
  } else if (passageStructure.count > 1) {
    // Multiple passages (e.g., N1 Mondai 9: 3 texts)
    const passages = [];
    for (let i = 1; i <= passageStructure.count; i++) {
      passages.push({
        passage_id: `P00${i}`,
        passage_label: `Text ${i}`,
        content_type: 'text',
        title: '次の文章を読んで、質問に答えてください。',
        content_text: `【ここにText ${i}の内容を入力してください】`,
        media_url: '',
      });
    }
    return passages;
  } else {
    // Single passage
    return [
      {
        passage_id: 'P001',
        passage_label: '',
        content_type: passageStructure.contentType || 'text',
        title: '次の文章を読んで、質問に答えてください。',
        content_text: '【ここに文章の内容を入力してください】',
        media_url: '',
      },
    ];
  }
}

function generateQuestionExamples(mondaiConfig: any) {
  const { questionStructure, passageStructure } = mondaiConfig;
  const questions = [];

  if (!mondaiConfig.needsPassage) {
    // No passage - standard questions
    for (let i = 1; i <= 3; i++) {
      questions.push({
        passage_id: '',
        passage_id_secondary: '',
        question_number: i,
        question_text: `【Question ${i} text here】`,
        question_type: 'standard',
        blank_position: '',
        media_url: '',
        choice_1: '【Choice 1】',
        choice_2: '【Choice 2】',
        choice_3: '【Choice 3】',
        choice_4: '【Choice 4】',
        correct_answer: 1,
        difficulty: 'medium',
      });
    }
  } else if (passageStructure.type === 'ab_comparison') {
    // A-B comparison questions
    for (let i = 0; i < questionStructure.questionsPerPassage; i++) {
      questions.push({
        passage_id: 'P001',
        passage_id_secondary: 'P002',
        question_number: questionStructure.startNumber + i,
        question_text: `【Question ${questionStructure.startNumber + i} comparing A & B】`,
        question_type: 'comparison',
        blank_position: '',
        media_url: '',
        choice_1: '【Choice 1】',
        choice_2: '【Choice 2】',
        choice_3: '【Choice 3】',
        choice_4: '【Choice 4】',
        correct_answer: 1,
        difficulty: 'medium',
      });
    }
  } else if (questionStructure.type === 'cloze') {
    // Cloze test (blanks in passage)
    for (let i = 0; i < questionStructure.totalQuestions; i++) {
      const questionNum = questionStructure.startNumber + i;
      questions.push({
        passage_id: 'P001',
        passage_id_secondary: '',
        question_number: questionNum,
        question_text: `[${questionNum}]に何を入れますか？`,
        question_type: 'cloze',
        blank_position: questionNum.toString(),
        media_url: '',
        choice_1: '【Choice 1】',
        choice_2: '【Choice 2】',
        choice_3: '【Choice 3】',
        choice_4: '【Choice 4】',
        correct_answer: 1,
        difficulty: 'medium',
      });
    }
  } else if (questionStructure.questionsPerPassage > 1) {
    // Multiple questions per passage
    for (let p = 1; p <= passageStructure.count; p++) {
      for (let q = 0; q < questionStructure.questionsPerPassage; q++) {
        const questionNum = questionStructure.startNumber + ((p - 1) * questionStructure.questionsPerPassage) + q;
        questions.push({
          passage_id: `P00${p}`,
          passage_id_secondary: '',
          question_number: questionNum,
          question_text: `【Question ${questionNum} for Text ${p}】`,
          question_type: 'standard',
          blank_position: '',
          media_url: '',
          choice_1: '【Choice 1】',
          choice_2: '【Choice 2】',
          choice_3: '【Choice 3】',
          choice_4: '【Choice 4】',
          correct_answer: 1,
          difficulty: 'medium',
        });
      }
    }
  } else {
    // Simple: 1 passage, multiple questions (1:1)
    for (let p = 1; p <= passageStructure.count; p++) {
      questions.push({
        passage_id: `P00${p}`,
        passage_id_secondary: '',
        question_number: questionStructure.startNumber + (p - 1),
        question_text: `【Question ${questionStructure.startNumber + (p - 1)} for Text ${p}】`,
        question_type: 'standard',
        blank_position: '',
        media_url: '',
        choice_1: '【Choice 1】',
        choice_2: '【Choice 2】',
        choice_3: '【Choice 3】',
        choice_4: '【Choice 4】',
        correct_answer: 1,
        difficulty: 'medium',
      });
    }
  }

  return questions;
}
```

---

### 7.5 Bulk Import Parser (2-Sheet)

**File:** `/src/lib/utils/excel-parser.ts`

```typescript
import * as XLSX from 'xlsx';

export interface ParsedQuestion {
  passage_id?: string;
  passage_id_secondary?: string;
  question_number: number;
  question_text: string;
  question_type: string;
  blank_position?: string;
  media_url?: string;
  choices: {
    choice_number: number;
    choice_text: string;
  }[];
  correct_answer: number;
  difficulty: string;
}

export interface ParsedPassage {
  passage_id: string;
  passage_label?: string;
  content_type: string;
  title: string;
  content_text?: string;
  media_url?: string;
}

export interface ExcelParseResult {
  passages: ParsedPassage[];
  questions: ParsedQuestion[];
  errors: string[];
  warnings: string[];
}

export function parseExcelFile(buffer: Buffer): ExcelParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const errors: string[] = [];
  const warnings: string[] = [];
  const passages: ParsedPassage[] = [];
  const questions: ParsedQuestion[] = [];

  // Parse Sheet 1: Passages (optional)
  const passageSheet = workbook.Sheets['Passages'];
  if (passageSheet) {
    const passageRows = XLSX.utils.sheet_to_json(passageSheet);

    passageRows.forEach((row: any, index: number) => {
      const rowNum = index + 2;

      // Validate required fields
      if (!row.passage_id) {
        errors.push(`Passages Sheet Row ${rowNum}: passage_id is required.`);
        return;
      }
      if (!row.content_type) {
        errors.push(`Passages Sheet Row ${rowNum}: content_type is required.`);
        return;
      }
      if (!['text', 'audio', 'image'].includes(row.content_type)) {
        errors.push(`Passages Sheet Row ${rowNum}: Invalid content_type. Must be text, audio, or image.`);
        return;
      }
      if (!row.title) {
        errors.push(`Passages Sheet Row ${rowNum}: title is required.`);
        return;
      }

      // Validate content based on type
      if (row.content_type === 'text' && !row.content_text) {
        errors.push(`Passages Sheet Row ${rowNum}: content_text is required for text type.`);
      }
      if (['audio', 'image'].includes(row.content_type) && !row.media_url) {
        errors.push(`Passages Sheet Row ${rowNum}: media_url is required for ${row.content_type} type.`);
      }

      passages.push({
        passage_id: row.passage_id,
        passage_label: row.passage_label || undefined,
        content_type: row.content_type,
        title: row.title,
        content_text: row.content_text || undefined,
        media_url: row.media_url || undefined,
      });
    });
  }

  // Parse Sheet 2: Questions (required)
  const questionSheet = workbook.Sheets['Questions'];
  if (!questionSheet) {
    throw new Error('Sheet "Questions" not found. Questions sheet is required.');
  }

  const questionRows = XLSX.utils.sheet_to_json(questionSheet);

  questionRows.forEach((row: any, index: number) => {
    const rowNum = index + 2;

    // Validate required fields
    if (!row.question_number) {
      errors.push(`Questions Sheet Row ${rowNum}: question_number is required.`);
      return;
    }
    if (!row.question_text) {
      errors.push(`Questions Sheet Row ${rowNum}: question_text is required.`);
      return;
    }
    if (!row.choice_1 || !row.choice_2 || !row.choice_3) {
      errors.push(`Questions Sheet Row ${rowNum}: At least 3 answer choices required.`);
      return;
    }
    if (!row.correct_answer || row.correct_answer < 1 || row.correct_answer > 4) {
      errors.push(`Questions Sheet Row ${rowNum}: correct_answer must be 1, 2, 3, or 4.`);
      return;
    }

    // Validate passage references
    if (row.passage_id) {
      const passageExists = passages.find((p) => p.passage_id === row.passage_id);
      if (!passageExists) {
        errors.push(
          `Questions Sheet Row ${rowNum}: passage_id "${row.passage_id}" not found in Passages sheet.`
        );
      }
    }
    if (row.passage_id_secondary) {
      const passageExists = passages.find((p) => p.passage_id === row.passage_id_secondary);
      if (!passageExists) {
        errors.push(
          `Questions Sheet Row ${rowNum}: passage_id_secondary "${row.passage_id_secondary}" not found in Passages sheet.`
        );
      }
    }

    // Build choices array
    const choices = [
      { choice_number: 1, choice_text: row.choice_1 },
      { choice_number: 2, choice_text: row.choice_2 },
      { choice_number: 3, choice_text: row.choice_3 },
    ];
    if (row.choice_4) {
      choices.push({ choice_number: 4, choice_text: row.choice_4 });
    }

    // Validate correct answer
    if (row.correct_answer > choices.length) {
      errors.push(
        `Questions Sheet Row ${rowNum}: correct_answer ${row.correct_answer} but only ${choices.length} choices provided.`
      );
    }

    // Optional warnings
    if (!row.media_url && row.question_type === 'graphic') {
      warnings.push(`Questions Sheet Row ${rowNum}: Graphic questions usually need media.`);
    }

    questions.push({
      passage_id: row.passage_id || undefined,
      passage_id_secondary: row.passage_id_secondary || undefined,
      question_number: row.question_number,
      question_text: row.question_text,
      question_type: row.question_type || 'standard',
      blank_position: row.blank_position || undefined,
      media_url: row.media_url || undefined,
      choices,
      correct_answer: row.correct_answer,
      difficulty: row.difficulty || 'medium',
    });
  });

  // Validation: Check for duplicate passage IDs
  const passageIds = passages.map((p) => p.passage_id);
  const duplicatePassageIds = passageIds.filter((id, index) => passageIds.indexOf(id) !== index);
  if (duplicatePassageIds.length > 0) {
    errors.push(`Duplicate passage_id found: ${duplicatePassageIds.join(', ')}`);
  }

  // Validation: Check for duplicate question numbers
  const questionNumbers = questions.map((q) => q.question_number);
  const duplicateQuestionNums = questionNumbers.filter((num, index) => questionNumbers.indexOf(num) !== index);
  if (duplicateQuestionNums.length > 0) {
    errors.push(`Duplicate question_number found: ${duplicateQuestionNums.join(', ')}`);
  }

  return { passages, questions, errors, warnings };
}
```

---

### 7.6 Bulk Import API (2-Sheet)

**File:** `/src/app/api/jlpt/questions/bulk-import/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseExcelFile } from '@/lib/utils/excel-parser';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const level = formData.get('level') as string;
    const section = formData.get('section') as string;
    const mondai = parseInt(formData.get('mondai') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse Excel (2-sheet format)
    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = parseExcelFile(buffer);

    // Return errors if validation failed
    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors: parseResult.errors,
        warnings: parseResult.warnings,
      });
    }

    // Import data in transaction
    const result = await prisma.$transaction(async (tx) => {
      const passageMap = new Map<string, string>(); // Excel passage_id -> DB passage.id
      const questionUnits: string[] = [];

      // Step 1: Create all passages from Passages sheet
      if (parseResult.passages.length > 0) {
        for (const passageData of parseResult.passages) {
          const passage = await tx.passages.create({
            data: {
              content_type: passageData.content_type,
              title: passageData.title,
              content_text: passageData.content_text,
              media_url: passageData.media_url,
            },
          });

          // Map Excel passage_id to database passage.id
          passageMap.set(passageData.passage_id, passage.id);
        }
      }

      // Step 2: Create question units (if needed)
      // For A-B comparison, create one unit with both passages
      const abComparisonQuestions = parseResult.questions.filter(
        (q) => q.passage_id && q.passage_id_secondary
      );
      if (abComparisonQuestions.length > 0) {
        const primaryPassageId = passageMap.get(abComparisonQuestions[0].passage_id!);
        const secondaryPassageId = passageMap.get(abComparisonQuestions[0].passage_id_secondary!);

        const unit = await tx.questionUnits.create({
          data: {
            level,
            section_type: section,
            mondai_number: mondai,
            unit_type: 'ab_comparison',
            passage_id: primaryPassageId!,
            passage_id_secondary: secondaryPassageId!,
          },
        });
        questionUnits.push(unit.id);
      } else if (parseResult.passages.length > 0) {
        // For other passage-based mondai, create units per passage
        for (const [excelPassageId, dbPassageId] of passageMap.entries()) {
          const unit = await tx.questionUnits.create({
            data: {
              level,
              section_type: section,
              mondai_number: mondai,
              unit_type: determineUnitType(parseResult.questions),
              passage_id: dbPassageId,
            },
          });
          questionUnits.push(unit.id);
        }
      }

      // Step 3: Create questions
      const createdQuestions = await Promise.all(
        parseResult.questions.map(async (q) => {
          // Map passage IDs from Excel to database
          const primaryPassageId = q.passage_id ? passageMap.get(q.passage_id) : null;
          const secondaryPassageId = q.passage_id_secondary
            ? passageMap.get(q.passage_id_secondary)
            : null;

          const question = await tx.questions.create({
            data: {
              level,
              section_type: section,
              mondai_number: mondai,
              passage_id: primaryPassageId,
              question_number: q.question_number,
              question_text: q.question_text,
              question_type: q.question_type,
              blank_position: q.blank_position,
              media_url: q.media_url,
              correct_answer: q.correct_answer,
              difficulty_level: q.difficulty,
            },
          });

          // Create answer choices
          await tx.answerChoices.createMany({
            data: q.choices.map((c) => ({
              question_id: question.id,
              choice_number: c.choice_number,
              choice_text: c.choice_text,
            })),
          });

          // Link questions to units
          if (questionUnits.length > 0) {
            // For A-B comparison, all questions link to the same unit
            if (secondaryPassageId) {
              await tx.unitQuestions.create({
                data: {
                  unit_id: questionUnits[0],
                  question_id: question.id,
                },
              });
            } else {
              // For other passage types, link to the appropriate unit
              const unitIndex = findUnitIndexForQuestion(
                q,
                parseResult.passages,
                questionUnits
              );
              if (unitIndex !== -1) {
                await tx.unitQuestions.create({
                  data: {
                    unit_id: questionUnits[unitIndex],
                    question_id: question.id,
                  },
                });
              }
            }
          }

          return question;
        })
      );

      return {
        passages_created: parseResult.passages.length,
        units_created: questionUnits.length,
        questions_created: createdQuestions.length,
        passage_ids: Array.from(passageMap.values()),
        unit_ids: questionUnits,
        question_ids: createdQuestions.map((q) => q.id),
      };
    });

    return NextResponse.json({
      success: true,
      imported_count: parseResult.questions.length,
      warnings: parseResult.warnings,
      data: result,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error.message },
      { status: 500 }
    );
  }
}

function determineUnitType(questions: any[]): string {
  if (questions.some((q) => q.question_type === 'cloze')) {
    return 'cloze_test';
  }
  if (questions.some((q) => q.question_type === 'comparison')) {
    return 'ab_comparison';
  }
  return 'reading_comp';
}

function findUnitIndexForQuestion(
  question: any,
  passages: any[],
  units: string[]
): number {
  if (!question.passage_id) return -1;

  const passageIndex = passages.findIndex((p) => p.passage_id === question.passage_id);
  return passageIndex;
}
```

---

## 8. Validation & Security

### 8.1 Validation Schema

**File:** `/src/lib/validation/jlpt-question.ts`

```typescript
import { z } from 'zod';

export const passageSchema = z.object({
  content_type: z.enum(['text', 'audio', 'image']),
  title: z.string().min(1, 'Passage title required'),
  content_text: z.string().optional(),
  media_url: z.string().url().optional(),
}).refine(
  (data) => {
    if (data.content_type === 'text') {
      return !!data.content_text;
    }
    return !!data.media_url;
  },
  {
    message: 'Text passages need content_text, audio/image need media_url',
  }
);

export const answerChoiceSchema = z.object({
  choice_number: z.number().min(1).max(4),
  choice_text: z.string().min(1, 'Choice text required'),
  choice_media_url: z.string().url().optional(),
});

export const questionSchema = z.object({
  level: z.enum(['N1', 'N2', 'N3', 'N4', 'N5']),
  section_type: z.enum(['vocabulary', 'grammar_reading', 'listening']),
  mondai_number: z.number().min(1).max(20),
  question_number: z.number().min(1),
  question_text: z.string().min(1, 'Question text required'),
  question_type: z.enum(['standard', 'cloze', 'comparison', 'graphic']),
  blank_position: z.string().optional(),
  media_url: z.string().url().optional(),
  media_type: z.enum(['audio', 'image']).optional(),
  correct_answer: z.number().min(1).max(4),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  answer_choices: z.array(answerChoiceSchema).min(3).max(4),
  passage: passageSchema.optional(),
}).refine(
  (data) => data.correct_answer <= data.answer_choices.length,
  {
    message: 'Correct answer must match an existing choice',
  }
);

export const bulkImportSchema = z.object({
  level: z.enum(['N1', 'N2', 'N3', 'N4', 'N5']),
  section_type: z.enum(['vocabulary', 'grammar_reading', 'listening']),
  mondai_number: z.number().min(1).max(20),
  passage: passageSchema.optional(),
  questions: z.array(questionSchema).min(1),
});
```

### 8.2 Security Checklist

- ✅ **Authentication**: Admin-only access (check `session.user.isAdmin`)
- ✅ **File Upload**: Type/size validation, virus scanning (optional)
- ✅ **Input Sanitization**: HTML sanitization for rich text (DOMPurify)
- ✅ **SQL Injection**: Using Prisma ORM (parameterized queries)
- ✅ **XSS Prevention**: React escapes by default, sanitize HTML content
- ✅ **CORS**: R2 bucket CORS configured for domain
- ✅ **Rate Limiting**: Consider rate limiting for upload endpoints
- ✅ **Transaction Safety**: Atomic operations with Prisma transactions

---

## 9. File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── jlpt/
│   │       └── questions/
│   │           ├── page.tsx                    # Page 1: Level selection
│   │           ├── [level]/
│   │           │   ├── page.tsx                # Page 2: Section selection
│   │           │   └── [section]/
│   │           │       ├── page.tsx            # Page 3: Mondai selection
│   │           │       └── [mondai]/
│   │           │           └── page.tsx        # Page 4: Question management
│   │
│   └── api/
│       └── jlpt/
│           ├── questions/
│           │   ├── route.ts                    # CRUD endpoints
│           │   ├── [id]/
│           │   │   └── route.ts                # Update/Delete single question
│           │   ├── bulk-import/
│           │   │   └── route.ts                # Excel import
│           │   └── template/
│           │       └── route.ts                # Download Excel template
│           │
│           ├── passages/
│           │   ├── route.ts                    # Passage CRUD
│           │   └── [id]/
│           │       └── route.ts
│           │
│           └── upload/
│               └── route.ts                    # Media upload to R2
│
├── components/
│   └── admin/
│       └── jlpt/
│           ├── LevelCard.tsx                   # Level selection card
│           ├── SectionCard.tsx                 # Section selection card
│           ├── MondaiCard.tsx                  # Mondai selection card
│           ├── Breadcrumb.tsx                  # Navigation breadcrumb
│           ├── QuestionListTable.tsx           # Questions list table
│           ├── QuestionFormModal.tsx           # Unified form modal
│           ├── PassageFormSection.tsx          # Passage input (conditional)
│           ├── QuestionInputSection.tsx        # Single question input
│           ├── AnswerChoiceInput.tsx           # Answer choices
│           ├── MediaUploadWidget.tsx           # File upload widget
│           ├── BulkImportModal.tsx             # Excel import modal
│           ├── StudentPreviewPanel.tsx         # Preview as student
│           └── RichTextEditor.tsx              # React-Quill wrapper
│
├── lib/
│   ├── cloudflare-r2.ts                        # R2 client & upload functions
│   ├── validation/
│   │   └── jlpt-question.ts                    # Zod schemas
│   ├── utils/
│   │   ├── excel-parser.ts                     # Excel parsing logic
│   │   ├── question-helpers.ts                 # Helper functions
│   │   └── sanitize-html.ts                    # HTML sanitization
│   └── prisma.ts                               # Prisma client
│
└── config/
    └── jlpt-mondai.ts                          # Existing mondai config
```

---

## 10. Implementation Timeline

### Phase 1: Infrastructure Setup (2 days)

**Day 1:**
- ✅ Install dependencies (react-quill, xlsx, @aws-sdk/client-s3)
- ✅ Set up Cloudflare R2 bucket
- ✅ Configure environment variables
- ✅ Create R2 client library (`/src/lib/cloudflare-r2.ts`)
- ✅ Create upload API endpoint (`/src/app/api/jlpt/upload/route.ts`)

**Day 2:**
- ✅ Create validation schemas (`/src/lib/validation/jlpt-question.ts`)
- ✅ Create RichTextEditor component wrapper (React-Quill)
- ✅ Create MediaUploadWidget component
- ✅ Test media upload flow

**Deliverables:**
- Working media upload to R2
- Rich text editor component
- Validation schemas

---

### Phase 2: Admin UI - Multi-Page Navigation (3 days)

**Day 3:**
- ✅ Create Page 1: Level selection (`/admin/jlpt/questions/page.tsx`)
- ✅ Create Page 2: Section selection (`/admin/jlpt/questions/[level]/page.tsx`)
- ✅ Create Page 3: Mondai selection (`/admin/jlpt/questions/[level]/[section]/page.tsx`)
- ✅ Create LevelCard, SectionCard, MondaiCard components
- ✅ Create Breadcrumb component
- ✅ Test navigation flow

**Day 4:**
- ✅ Create Page 4: Question management (`/admin/jlpt/questions/[level]/[section]/[mondai]/page.tsx`)
- ✅ Create QuestionListTable component
- ✅ Implement data fetching with URL params
- ✅ Create QuestionFormModal (unified form)
- ✅ Create PassageFormSection (conditional rendering)

**Day 5:**
- ✅ Create QuestionInputSection
- ✅ Create AnswerChoiceInput component
- ✅ Integrate RichTextEditor and MediaUploadWidget
- ✅ Create StudentPreviewPanel component
- ✅ Test complete form flow (add/edit question)

**Deliverables:**
- Complete 4-page navigation system
- Working question form with auto-filled params
- Student preview

---

### Phase 3: API Endpoints (2 days)

**Day 6:**
- ✅ Create question CRUD API (`/src/app/api/jlpt/questions/route.ts`)
- ✅ Create passage CRUD API (`/src/app/api/jlpt/passages/route.ts`)
- ✅ Implement transaction logic for creating questions with passages
- ✅ Test API endpoints

**Day 7:**
- ✅ Integrate API with admin UI
- ✅ Test create/edit/delete flows
- ✅ Handle error states
- ✅ Add loading states

**Deliverables:**
- Working CRUD operations
- Data persistence
- Error handling

---

### Phase 4: Bulk Import Feature (2 days)

**Day 8:**
- ✅ Create Excel parser (`/src/lib/utils/excel-parser.ts`)
- ✅ Create template download API (`/src/app/api/jlpt/questions/template/route.ts`)
- ✅ Test Excel parsing with sample data

**Day 9:**
- ✅ Create bulk import API (`/src/app/api/jlpt/questions/bulk-import/route.ts`)
- ✅ Create BulkImportModal component
- ✅ Implement preview and validation UI
- ✅ Test bulk import flow

**Deliverables:**
- Excel template generation
- Bulk import functionality
- Preview before import

---

### Phase 5: Testing & Polish (2 days)

**Day 10:**
- ✅ Unit tests for validation logic
- ✅ Unit tests for Excel parser
- ✅ Integration tests for API endpoints
- ✅ Fix bugs and edge cases

**Day 11:**
- ✅ E2E tests with Playwright
- ✅ Performance testing (large imports)
- ✅ Security audit (file upload, XSS)
- ✅ Documentation and user guide

**Deliverables:**
- Test coverage
- Bug fixes
- Production-ready system

---

### Total Timeline: 11 days

---

## 10. Success Metrics

### Performance Targets
- ✅ Question creation: <2 minutes per question (manual input)
- ✅ Bulk import: Handle 50+ questions in <30 seconds
- ✅ Media upload: Complete in <10 seconds per file
- ✅ Page load: <2 seconds for admin page
- ✅ Preview rendering: <1 second

### Quality Targets
- ✅ Zero data corruption (transaction safety)
- ✅ 100% validation coverage
- ✅ No XSS vulnerabilities (sanitized HTML)
- ✅ No SQL injection (Prisma ORM)
- ✅ Proper error messages for all failures

### User Experience Targets
- ✅ Intuitive form flow (minimal training needed)
- ✅ Clear error messages
- ✅ Real-time validation feedback
- ✅ Student preview accuracy (100% match)
- ✅ Bulk import success rate >95%

---

## 11. Next Steps

Once this plan is approved:

1. ✅ Create R2 bucket and configure credentials
2. ✅ Install dependencies
3. ✅ Start Phase 1 (Infrastructure)
4. ✅ Implement components in sequence
5. ✅ Test each phase before moving forward
6. ✅ Deploy to staging for admin testing

---

## Related Documentation

- [Database Design v2](./01-database-design-v2.md)
- [Test Level Details](./02-test-level-details.md)
- [Scoring Calculation](./03-scoring-calculation.md)

---

**Questions or Changes?** Please review this plan and provide feedback before implementation begins.
