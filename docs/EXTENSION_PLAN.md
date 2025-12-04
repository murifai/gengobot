# Gengo Browser Extension - Development Plan

## Overview

A Chrome/Firefox browser extension for parsing Japanese text on any webpage, with dictionary lookup and one-click import to Gengo decks. Similar to Yomitan but integrated with the Gengo learning platform.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BROWSER EXTENSION                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  Content Script  │  │  Background SW   │  │  Popup UI        │       │
│  │                  │  │                  │  │                  │       │
│  │  • Text select   │  │  • Auth state    │  │  • Login/Logout  │       │
│  │  • Hover detect  │  │  • API calls     │  │  • Deck selector │       │
│  │  • Popup render  │  │  • Token storage │  │  • Settings      │       │
│  │  • Kuromoji      │  │  • Message hub   │  │  • Import history│       │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘       │
│           │                     │                     │                  │
│           └─────────────────────┼─────────────────────┘                  │
│                                 │                                        │
└─────────────────────────────────┼────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GENGO API (New Endpoints)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  POST /api/extension/auth/login     → Initiate OAuth, return token      │
│  GET  /api/extension/auth/session   → Validate token, return user       │
│  POST /api/extension/auth/logout    → Invalidate token                  │
│                                                                          │
│  GET  /api/extension/decks          → List user's decks (minimal)       │
│  POST /api/extension/cards          → Create flashcard in deck          │
│                                                                          │
│  GET  /api/extension/dictionary     → Lookup word (uses translations.db)│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXISTING INFRASTRUCTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  • translations.db (77MB SQLite) - Japanese dictionary with JLPT levels │
│  • DictionaryEntry model - Prisma schema for vocabulary                 │
│  • Flashcard/Deck models - User flashcard system                        │
│  • NextAuth - OAuth authentication                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
gengo-extension/
├── manifest.json              # Extension manifest (V3)
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Build config
│
├── src/
│   ├── background/
│   │   └── service-worker.ts  # Background service worker
│   │
│   ├── content/
│   │   ├── index.ts           # Content script entry
│   │   ├── parser.ts          # Kuromoji integration
│   │   ├── popup.ts           # Hover popup UI
│   │   └── styles.css         # Popup styles
│   │
│   ├── popup/
│   │   ├── index.html         # Popup HTML
│   │   ├── App.tsx            # React popup app
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── DeckSelector.tsx
│   │   │   └── Settings.tsx
│   │   └── styles.css
│   │
│   ├── lib/
│   │   ├── api.ts             # Gengo API client
│   │   ├── auth.ts            # Auth utilities
│   │   ├── storage.ts         # Chrome storage wrapper
│   │   └── kuromoji.ts        # Kuromoji wrapper
│   │
│   └── types/
│       └── index.ts           # TypeScript types
│
├── public/
│   ├── icons/                 # Extension icons
│   └── dict/                  # Kuromoji dictionary files
│
└── scripts/
    └── build-dict.ts          # Dictionary builder
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Extension Scaffold

**Create extension project:**

```bash
# From gengobot root
mkdir -p extensions/gengo-reader
cd extensions/gengo-reader

# Initialize
npm init -y
npm install -D vite @crxjs/vite-plugin typescript
npm install -D @types/chrome @types/node
npm install react react-dom
npm install -D @types/react @types/react-dom
npm install kuromoji
```

**manifest.json (Manifest V3):**

```json
{
  "manifest_version": 3,
  "name": "Gengo Reader",
  "version": "1.0.0",
  "description": "Japanese text parser with Gengo deck integration",

  "permissions": ["storage", "activeTab", "identity"],

  "host_permissions": ["https://gengobot.com/*", "http://localhost:3000/*"],

  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.ts"],
      "css": ["src/content/styles.css"]
    }
  ],

  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },

  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },

  "web_accessible_resources": [
    {
      "resources": ["dict/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 1.2 Backend API Endpoints

**New routes to add in gengobot:**

```
src/app/api/extension/
├── auth/
│   ├── login/route.ts      # POST - Generate extension token
│   ├── session/route.ts    # GET - Validate token
│   └── logout/route.ts     # POST - Invalidate token
├── decks/route.ts          # GET - User's decks
├── cards/route.ts          # POST - Create flashcard
└── dictionary/route.ts     # GET - Word lookup
```

**Extension Token Schema (add to Prisma):**

```prisma
model ExtensionToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  userAgent String?
  createdAt DateTime @default(now())
  expiresAt DateTime
  lastUsed  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}
```

### 1.3 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Extension  │     │   Gengo     │     │   Google    │     │   Gengo     │
│   Popup     │     │   Login     │     │   OAuth     │     │   API       │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Click Login    │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │ 2. Open popup window                  │                   │
       │   gengobot.com/extension/auth         │                   │
       │──────────────────────────────────────>│                   │
       │                   │                   │                   │
       │                   │ 3. Google OAuth   │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │ 4. Auth success   │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │                   │ 5. Generate token │                   │
       │                   │──────────────────────────────────────>│
       │                   │                   │                   │
       │                   │ 6. Return token   │                   │
       │                   │<──────────────────────────────────────│
       │                   │                   │                   │
       │ 7. postMessage with token             │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 8. Store token in chrome.storage      │                   │
       │                   │                   │                   │
```

---

## Phase 2: Kuromoji Integration (Week 2-3)

### 2.1 Dictionary Setup

Kuromoji requires dictionary files. We'll bundle a compact version:

```typescript
// src/lib/kuromoji.ts
import kuromoji from 'kuromoji';

let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;

export async function initializeTokenizer(): Promise<void> {
  if (tokenizer) return;

  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: chrome.runtime.getURL('dict/') }).build((err, _tokenizer) => {
      if (err) {
        reject(err);
        return;
      }
      tokenizer = _tokenizer;
      resolve();
    });
  });
}

export interface ParsedToken {
  surface: string; // Surface form (as written)
  reading: string; // Reading in katakana
  baseForm: string; // Dictionary form
  pos: string; // Part of speech
  posDetail: string; // Detailed POS
}

export function tokenize(text: string): ParsedToken[] {
  if (!tokenizer) {
    throw new Error('Tokenizer not initialized');
  }

  return tokenizer.tokenize(text).map(token => ({
    surface: token.surface_form,
    reading: token.reading || token.surface_form,
    baseForm: token.basic_form || token.surface_form,
    pos: token.pos,
    posDetail: token.pos_detail_1,
  }));
}
```

### 2.2 Dictionary Files

Download and process Kuromoji IPA dictionary:

```bash
# Download kuromoji-ipadic (approx 20MB compressed)
# Place in extensions/gengo-reader/public/dict/
```

---

## Phase 3: Content Script (Week 3-4)

### 3.1 Text Detection & Parsing

```typescript
// src/content/index.ts
import { initializeTokenizer, tokenize } from '../lib/kuromoji';
import { showPopup, hidePopup } from './popup';
import { lookupWord } from '../lib/api';

// Japanese text detection regex
const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

let isEnabled = true;
let hoverTimeout: number | null = null;

async function init() {
  // Initialize Kuromoji
  await initializeTokenizer();

  // Listen for text selection
  document.addEventListener('mouseup', handleTextSelection);

  // Listen for hover (optional, can be toggled)
  document.addEventListener('mouseover', handleHover);
  document.addEventListener('mouseout', handleMouseOut);

  console.log('[Gengo Reader] Initialized');
}

function handleTextSelection(event: MouseEvent) {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (!text || !japaneseRegex.test(text)) {
    return;
  }

  // Parse and show popup
  processText(text, event.clientX, event.clientY);
}

function handleHover(event: MouseEvent) {
  if (!isEnabled) return;

  const target = event.target as HTMLElement;
  const text = target.textContent?.trim();

  if (!text || !japaneseRegex.test(text)) {
    return;
  }

  // Debounce hover
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }

  hoverTimeout = window.setTimeout(() => {
    // Get character under cursor
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (!range) return;

    // Expand to word boundaries
    const word = extractWordAtPosition(range);
    if (word && japaneseRegex.test(word)) {
      processText(word, event.clientX, event.clientY);
    }
  }, 200);
}

async function processText(text: string, x: number, y: number) {
  try {
    // Tokenize with Kuromoji
    const tokens = tokenize(text);

    // Get first meaningful token (skip particles for single lookups)
    const mainToken = tokens.find(t => !['助詞', '助動詞', '記号'].includes(t.pos)) || tokens[0];

    if (!mainToken) return;

    // Lookup in Gengo dictionary
    const result = await lookupWord(mainToken.baseForm);

    // Show popup
    showPopup({
      x,
      y,
      token: mainToken,
      dictionary: result,
    });
  } catch (error) {
    console.error('[Gengo Reader] Error processing text:', error);
  }
}

// Initialize on load
init();
```

### 3.2 Popup Component (Reuse Existing VocabularyPopup Pattern)

The extension popup mirrors the existing Gengo chat popup system for consistency.

**Existing Components to Reference:**

- `src/components/chat/VocabularyPopup.tsx` - Chat word popup
- `src/components/vocabulary/VocabularyDetail.tsx` - Detailed vocabulary popup
- `src/lib/utils/kuromoji-parser.ts` - Tokenization utilities

```typescript
// src/content/popup.ts
// Mirrors: src/components/chat/VocabularyPopup.tsx

import { ParsedToken } from '../lib/kuromoji';
import { DictionaryResult } from '../lib/api';

interface PopupData {
  x: number;
  y: number;
  token: ParsedToken;
  dictionary: DictionaryResult | null;
}

let popupElement: HTMLElement | null = null;

export function showPopup(data: PopupData) {
  hidePopup();

  popupElement = document.createElement('div');
  popupElement.id = 'gengo-reader-popup';
  popupElement.className = 'gengo-popup';

  const { token, dictionary } = data;
  const hiraganaReading = katakanaToHiragana(token.reading);

  // Structure matches VocabularyPopup.tsx
  popupElement.innerHTML = `
    <div class="gengo-popup-header">
      <div class="gengo-popup-word-section">
        <span class="gengo-word">${token.surface}</span>
        ${
          hiraganaReading !== token.surface
            ? `
          <span class="gengo-reading">${hiraganaReading}</span>
        `
            : ''
        }
        <button class="gengo-audio-btn" id="gengo-audio-btn" title="Play pronunciation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>
      </div>
      ${
        dictionary?.jlptLevel
          ? `
        <span class="gengo-jlpt gengo-jlpt-${dictionary.jlptLevel.toLowerCase()}">
          ${dictionary.jlptLevel}
        </span>
      `
          : ''
      }
    </div>

    ${
      token.baseForm && token.baseForm !== token.surface
        ? `
      <div class="gengo-base-form">
        <span class="gengo-label">Kata Dasar:</span>
        <span class="gengo-value">${token.baseForm}</span>
      </div>
    `
        : ''
    }

    <div class="gengo-popup-body">
      ${
        dictionary
          ? `
        ${
          dictionary.meaningsId?.length
            ? `
          <div class="gengo-meaning-section">
            <span class="gengo-label">Indonesia:</span>
            <div class="gengo-meaning">${dictionary.meaningsId.slice(0, 3).join(', ')}</div>
          </div>
        `
            : ''
        }
        ${
          dictionary.meaningsEn?.length
            ? `
          <div class="gengo-meaning-section">
            <span class="gengo-label">English:</span>
            <div class="gengo-meaning">${dictionary.meaningsEn.slice(0, 3).join(', ')}</div>
          </div>
        `
            : ''
        }
        ${
          dictionary.partsOfSpeech?.length
            ? `
          <div class="gengo-pos">${dictionary.partsOfSpeech.join(', ')}</div>
        `
            : ''
        }
      `
          : `
        <div class="gengo-no-result">Kata tidak ditemukan</div>
      `
      }
    </div>

    <div class="gengo-popup-footer">
      <button class="gengo-btn gengo-btn-add" id="gengo-add-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Tambah ke Deck
      </button>
    </div>
  `;

  // Viewport-aware positioning (from VocabularyPopup.tsx)
  positionPopup(popupElement, data.x, data.y);
  document.body.appendChild(popupElement);

  // Event listeners
  popupElement.querySelector('#gengo-audio-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    playAudio(dictionary?.reading || token.reading);
  });

  popupElement.querySelector('#gengo-add-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    showDeckSelector(token, dictionary);
  });

  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
}

export function hidePopup() {
  if (popupElement) {
    popupElement.remove();
    popupElement = null;
  }
  document.removeEventListener('click', handleClickOutside);
}

function handleClickOutside(event: MouseEvent) {
  if (popupElement && !popupElement.contains(event.target as Node)) {
    hidePopup();
  }
}

// Viewport-aware positioning (matches VocabularyPopup.tsx logic)
function positionPopup(element: HTMLElement, x: number, y: number) {
  const popupWidth = 300;
  const popupHeight = 250;
  const padding = 10;

  let left = x;
  let top = y + 10;

  // Prevent overflow right
  if (left + popupWidth > window.innerWidth - padding) {
    left = window.innerWidth - popupWidth - padding;
  }
  // Prevent overflow left
  if (left < padding) {
    left = padding;
  }
  // Prevent overflow bottom - show above cursor
  if (top + popupHeight > window.innerHeight - padding) {
    top = y - popupHeight - 10;
  }

  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

// Audio playback using Web Speech API (matches VocabularyPopup.tsx)
function playAudio(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.8;
  speechSynthesis.speak(utterance);
}

function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A0-\u30FF]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60));
}
```

### 3.3 Popup Styles (Neobrutalism - Matches Gengo Design System)

Styles match the existing Gengo neobrutalism design system used in `VocabularyPopup.tsx`.

```css
/* src/content/styles.css */
/* Matches: Gengo neobrutalism design system */

#gengo-reader-popup {
  position: fixed;
  z-index: 2147483647;
  background: #ffffff;
  border-radius: 8px;
  border: 2px solid #1a1a1a;
  box-shadow: 4px 4px 0 #1a1a1a;
  min-width: 280px;
  max-width: 350px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  overflow: hidden;
}

/* Header */
.gengo-popup-header {
  padding: 12px 16px;
  background: #88aaee; /* Gengo primary blue */
  border-bottom: 2px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gengo-popup-word-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gengo-word {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Noto Sans JP', sans-serif;
}

.gengo-reading {
  font-size: 14px;
  color: #1a1a1a;
  opacity: 0.8;
  font-family: 'Noto Sans JP', sans-serif;
}

.gengo-audio-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #1a1a1a;
  transition: background 0.2s;
}

.gengo-audio-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* JLPT Badges - Matches VocabularyDetail.tsx */
.gengo-jlpt {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  border: 2px solid #1a1a1a;
}

.gengo-jlpt-n5 {
  background: #a3e635;
  color: #1a1a1a;
} /* Lime */
.gengo-jlpt-n4 {
  background: #4ade80;
  color: #1a1a1a;
} /* Green */
.gengo-jlpt-n3 {
  background: #facc15;
  color: #1a1a1a;
} /* Yellow */
.gengo-jlpt-n2 {
  background: #fb923c;
  color: #1a1a1a;
} /* Orange */
.gengo-jlpt-n1 {
  background: #f87171;
  color: #1a1a1a;
} /* Red */

/* Base Form Section */
.gengo-base-form {
  padding: 8px 16px;
  background: #f5f5f5;
  border-bottom: 2px solid #1a1a1a;
  display: flex;
  gap: 8px;
  align-items: center;
}

.gengo-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

.gengo-value {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Noto Sans JP', sans-serif;
}

/* Body */
.gengo-popup-body {
  padding: 12px 16px;
}

.gengo-meaning-section {
  margin-bottom: 8px;
}

.gengo-meaning-section .gengo-label {
  display: block;
  margin-bottom: 2px;
}

.gengo-meaning {
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.4;
}

.gengo-pos {
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ddd;
}

.gengo-no-result {
  color: #666;
  font-size: 13px;
  text-align: center;
  padding: 8px 0;
}

/* Footer */
.gengo-popup-footer {
  padding: 10px 16px 12px;
  border-top: 2px solid #1a1a1a;
  background: #f5f5f5;
}

.gengo-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 6px;
  border: 2px solid #1a1a1a;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.gengo-btn-add {
  background: #88aaee;
  color: #1a1a1a;
  box-shadow: 2px 2px 0 #1a1a1a;
}

.gengo-btn-add:hover {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 #1a1a1a;
}

.gengo-btn-add:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

/* Deck Selector Modal */
.gengo-deck-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483648;
}

.gengo-deck-modal-content {
  background: white;
  border: 2px solid #1a1a1a;
  border-radius: 8px;
  box-shadow: 6px 6px 0 #1a1a1a;
  width: 320px;
  max-height: 400px;
  overflow: hidden;
}

.gengo-deck-modal-header {
  padding: 12px 16px;
  border-bottom: 2px solid #1a1a1a;
  font-weight: 700;
  font-size: 16px;
}

.gengo-deck-list {
  max-height: 280px;
  overflow-y: auto;
}

.gengo-deck-item {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.15s;
}

.gengo-deck-item:hover {
  background: #f5f5f5;
}

.gengo-deck-item-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.gengo-deck-item-meta {
  font-size: 12px;
  color: #666;
}

/* Success Toast */
.gengo-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #4ade80;
  border: 2px solid #1a1a1a;
  border-radius: 6px;
  padding: 12px 16px;
  box-shadow: 3px 3px 0 #1a1a1a;
  font-weight: 600;
  z-index: 2147483649;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  #gengo-reader-popup {
    background: #262626;
    border-color: #404040;
    box-shadow: 4px 4px 0 #404040;
  }

  .gengo-popup-header {
    background: #3b5998;
    border-color: #404040;
  }

  .gengo-word,
  .gengo-reading {
    color: #f5f5f5;
  }

  .gengo-audio-btn {
    color: #f5f5f5;
  }

  .gengo-base-form {
    background: #333;
    border-color: #404040;
  }

  .gengo-label {
    color: #999;
  }

  .gengo-value,
  .gengo-meaning {
    color: #f5f5f5;
  }

  .gengo-popup-footer {
    background: #333;
    border-color: #404040;
  }

  .gengo-btn-add {
    background: #3b5998;
    color: #f5f5f5;
    border-color: #404040;
    box-shadow: 2px 2px 0 #404040;
  }
}
```

---

## Component Reuse Strategy

The extension reuses patterns from existing Gengo components for consistency.

### Existing Components → Extension Mapping

| Gengo Component               | Extension Equivalent        | Reused Logic                              |
| ----------------------------- | --------------------------- | ----------------------------------------- |
| `VocabularyPopup.tsx`         | `content/popup.ts`          | Popup structure, positioning, audio       |
| `VocabularyDetail.tsx`        | `content/popup.ts`          | Meaning display, JLPT badges, add-to-deck |
| `ClickableJapanese.tsx`       | `content/index.ts`          | Japanese text detection regex             |
| `kuromoji-parser.ts`          | `lib/kuromoji.ts`           | Tokenization, verb phrase merging         |
| `/api/vocabulary/lookup`      | `/api/extension/dictionary` | Dictionary lookup logic                   |
| `/api/vocabulary/add-to-deck` | `/api/extension/cards`      | Flashcard creation                        |

### Shared Utilities

```typescript
// These utilities are copied from gengobot to extension
// Keep in sync when updating

// From: src/lib/utils/kuromoji-parser.ts
export function katakanaToHiragana(str: string): string;
export function mergeVerbPhrases(tokens: VocabularyInfo[]): VocabularyInfo[];
export function shouldHighlightToken(vocab: VocabularyInfo): boolean;

// From: src/components/vocabulary/VocabularyDetail.tsx
export function getJlptColor(level: string): string;

// Japanese detection regex (from ClickableJapanese.tsx)
const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
```

### API Endpoint Mapping

| Web App Endpoint                    | Extension Endpoint                     | Notes                         |
| ----------------------------------- | -------------------------------------- | ----------------------------- |
| `GET /api/vocabulary/lookup?word=X` | `GET /api/extension/dictionary?word=X` | Same SQLite lookup            |
| `POST /api/vocabulary/add-to-deck`  | `POST /api/extension/cards`            | Token auth instead of session |
| `GET /api/decks` (user's decks)     | `GET /api/extension/decks`             | Filtered for extension use    |

### Design System Tokens

Extension CSS uses Gengo's neobrutalism design tokens:

```css
/* Colors */
--gengo-primary: #88aaee;
--gengo-border: #1a1a1a;
--gengo-shadow: #1a1a1a;
--gengo-bg: #ffffff;
--gengo-bg-secondary: #f5f5f5;

/* JLPT Level Colors */
--jlpt-n5: #a3e635;
--jlpt-n4: #4ade80;
--jlpt-n3: #facc15;
--jlpt-n2: #fb923c;
--jlpt-n1: #f87171;

/* Spacing */
--popup-padding: 12px 16px;
--border-radius: 8px;
--border-width: 2px;
```

---

## Phase 4: API Integration (Week 4-5)

### 4.1 Extension API Client

```typescript
// src/lib/api.ts
import { getStoredToken } from './storage';

const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/extension'
    : 'https://gengobot.com/api/extension';

export interface DictionaryResult {
  entryId: number;
  kanji: string[];
  readings: string[];
  meaningsEn: string[];
  meaningsId: string[];
  partsOfSpeech: string[];
  jlptLevel: string | null;
}

export interface Deck {
  id: string;
  name: string;
  category: string | null;
  difficulty: string | null;
  totalCards: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getStoredToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, clear and throw
      await chrome.storage.local.remove('gengo_token');
      throw new Error('Session expired');
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Dictionary lookup
export async function lookupWord(word: string): Promise<DictionaryResult | null> {
  try {
    const result = await fetchWithAuth(`/dictionary?word=${encodeURIComponent(word)}`);
    return result.data;
  } catch (error) {
    console.error('[Gengo] Dictionary lookup failed:', error);
    return null;
  }
}

// Get user's decks
export async function getUserDecks(): Promise<Deck[]> {
  const result = await fetchWithAuth('/decks');
  return result.data;
}

// Add card to deck
export async function addCardToDeck(
  deckId: string,
  card: {
    word: string;
    reading: string;
    meaning: string;
    meaningId?: string;
    partOfSpeech?: string;
    jlptLevel?: string;
    exampleSentence?: string;
  }
): Promise<void> {
  await fetchWithAuth('/cards', {
    method: 'POST',
    body: JSON.stringify({
      deckId,
      ...card,
    }),
  });
}

// Get current session
export async function getSession(): Promise<User | null> {
  try {
    const result = await fetchWithAuth('/auth/session');
    return result.user;
  } catch {
    return null;
  }
}
```

### 4.2 Backend API Routes

**`src/app/api/extension/auth/login/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate secure token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Store token
  await prisma.extensionToken.create({
    data: {
      token,
      userId: session.user.id,
      userAgent: request.headers.get('user-agent'),
      expiresAt,
    },
  });

  return NextResponse.json({
    token,
    expiresAt: expiresAt.toISOString(),
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
  });
}
```

**`src/app/api/extension/dictionary/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyExtensionToken } from '@/lib/extension-auth';
import { lookupTranslation } from '@/lib/dictionary/translations-db';

export async function GET(request: NextRequest) {
  // Verify token
  const authResult = await verifyExtensionToken(request);
  if (!authResult.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const word = request.nextUrl.searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'Word parameter required' }, { status: 400 });
  }

  // Lookup in translations.db
  const result = await lookupTranslation(word);

  return NextResponse.json({ data: result });
}
```

**`src/app/api/extension/cards/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyExtensionToken } from '@/lib/extension-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  // Verify token
  const authResult = await verifyExtensionToken(request);
  if (!authResult.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { deckId, word, reading, meaning, meaningId, partOfSpeech, jlptLevel } = body;

  // Verify deck ownership
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      createdBy: authResult.userId,
    },
  });

  if (!deck) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  // Create flashcard
  const flashcard = await prisma.flashcard.create({
    data: {
      deckId,
      cardType: 'vocabulary',
      word,
      reading,
      wordMeaning: meaning,
      partOfSpeech,
      tags: jlptLevel ? [jlptLevel, 'browser-import'] : ['browser-import'],
    },
  });

  // Update deck card count
  await prisma.deck.update({
    where: { id: deckId },
    data: { totalCards: { increment: 1 } },
  });

  return NextResponse.json({ data: flashcard });
}
```

---

## Phase 5: Popup UI (Week 5-6)

### 5.1 Extension Popup

```tsx
// src/popup/App.tsx
import { useState, useEffect } from 'react';
import { getSession, getUserDecks, Deck, User } from '../lib/api';
import { Login } from './components/Login';
import { DeckSelector } from './components/DeckSelector';
import { Settings } from './components/Settings';

type Tab = 'main' | 'settings';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('main');

  useEffect(() => {
    async function init() {
      const session = await getSession();
      setUser(session);

      if (session) {
        const userDecks = await getUserDecks();
        setDecks(userDecks);

        // Restore last selected deck
        const stored = await chrome.storage.local.get('selectedDeck');
        if (stored.selectedDeck) {
          setSelectedDeck(stored.selectedDeck);
        }
      }

      setLoading(false);
    }

    init();
  }, []);

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={setUser} />;
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <img src={user.image || '/icons/default-avatar.png'} alt="" className="avatar" />
        <span className="username">{user.name}</span>
        <button onClick={() => setTab(tab === 'main' ? 'settings' : 'main')}>
          {tab === 'main' ? '⚙️' : '←'}
        </button>
      </header>

      {tab === 'main' ? (
        <main className="popup-main">
          <DeckSelector
            decks={decks}
            selected={selectedDeck}
            onSelect={async id => {
              setSelectedDeck(id);
              await chrome.storage.local.set({ selectedDeck: id });
            }}
          />

          <div className="stats">
            <p>
              Cards added today: <strong>0</strong>
            </p>
          </div>
        </main>
      ) : (
        <Settings user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}
```

---

## Phase 6: Testing & Polish (Week 6-7)

### 6.1 Testing Checklist

- [ ] OAuth flow works in popup window
- [ ] Token persists across browser restarts
- [ ] Kuromoji initializes correctly
- [ ] Text selection triggers popup
- [ ] Dictionary lookups work
- [ ] Card creation works
- [ ] Deck selector persists selection
- [ ] Dark mode support
- [ ] Multiple tabs don't conflict
- [ ] Works on major sites (YouTube, NHK, news sites)

### 6.2 Performance Optimization

- Lazy load Kuromoji (don't block page load)
- Cache dictionary lookups
- Debounce hover events
- Minimize content script size

---

## Installation Guide

### Development Setup

```bash
# 1. Clone/navigate to extension directory
cd extensions/gengo-reader

# 2. Install dependencies
npm install

# 3. Build extension
npm run build

# 4. Load in Chrome
#    - Open chrome://extensions
#    - Enable "Developer mode"
#    - Click "Load unpacked"
#    - Select the `dist` folder
```

### Backend Setup

```bash
# 1. Add Prisma migration
npx prisma migrate dev --name add_extension_token

# 2. Restart dev server
npm run dev
```

---

## Timeline Summary

| Phase              | Duration | Deliverables                                 |
| ------------------ | -------- | -------------------------------------------- |
| 1. Foundation      | Week 1-2 | Extension scaffold, API endpoints, auth flow |
| 2. Kuromoji        | Week 2-3 | Tokenizer integration, dictionary files      |
| 3. Content Script  | Week 3-4 | Text detection, popup UI, word lookup        |
| 4. API Integration | Week 4-5 | Full API client, deck/card operations        |
| 5. Popup UI        | Week 5-6 | Settings, deck selector, user management     |
| 6. Testing         | Week 6-7 | QA, performance, cross-site testing          |

---

## Future Enhancements

- [ ] Firefox support
- [ ] Kanji stroke order display
- [ ] Audio pronunciation (TTS)
- [ ] Pitch accent visualization
- [ ] Sentence mining (grab surrounding context)
- [ ] Anki export option
- [ ] Keyboard shortcuts
- [ ] Custom popup themes

---

**Last Updated:** 2024-12-03
**Version:** 1.0
**Author:** Gengo Team
