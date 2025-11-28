# PLAN-04: Vocabulary Translation (In-Chat)

## Overview

Implementasi sistem terjemahan kosakata terintegrasi dalam chat/task. Menggunakan JMDict sebagai sumber data dengan terjemahan lokal EN→ID (tanpa API AI).

**Priority**: MEDIUM
**Complexity**: Medium
**Sessions**: 1-2

---

## Current State Analysis

### Yang Sudah Ada:

- `VocabularyHints.tsx` - Inline hints during tasks
- Chat interface di Kaiwa dan Task

### Yang Akan Dibuat:

- [ ] Database kosakata dari JMDict
- [ ] Static EN→ID translation mapping
- [ ] Word lookup component untuk chat
- [ ] Clickable vocabulary dalam chat messages

---

## Architecture Overview

```
JMDict (Japanese-English)
        ↓
    Parser/Importer
        ↓
    PostgreSQL Database
        ↓
    Dictionary Lookup API
        ↓
    Static EN→ID Mapping (local JSON)
        ↓
    In-Chat Word Popup Component
```

**Perbedaan dari Plan Sebelumnya:**

- ❌ Tidak ada standalone dictionary page
- ❌ Tidak ada AI API untuk translation
- ✅ Translation dari static JSON file (EN→ID)
- ✅ Fokus pada vocabulary popup dalam chat

---

## Session 1: Database & Import

### Tasks:

#### 1.1 Create Dictionary Database Schema

**File**: `prisma/schema.prisma`

```prisma
// Dictionary Entry (from JMDict)
model DictionaryEntry {
  id            String   @id @default(cuid())
  entryId       Int      @unique // JMdict ent_seq

  // Readings
  kanji         String[] // Array of kanji writings
  readings      String[] // Array of kana readings

  // Meanings
  meaningsEn    String[] // English meanings (from JMDict)
  meaningsId    String[] // Indonesian (from static mapping)

  // Part of speech
  partsOfSpeech String[] // noun, verb, adj-i, etc.

  // JLPT Level (if available)
  jlptLevel     String?  // N5, N4, N3, N2, N1

  // Frequency/Priority
  priority      Int      @default(0) // Higher = more common

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([kanji])
  @@index([readings])
  @@index([jlptLevel])
  @@index([priority])
}
```

#### 1.2 Static EN→ID Translation Data

**File**: `src/data/en-id-dictionary.json`

Pre-compiled translation mapping untuk common English words:

```json
{
  "word": "kata",
  "person": "orang",
  "thing": "benda",
  "place": "tempat",
  "to eat": "makan",
  "to drink": "minum",
  "to go": "pergi",
  "to come": "datang",
  "beautiful": "cantik/indah",
  "big": "besar",
  "small": "kecil",
  "good": "baik/bagus",
  "bad": "buruk/jelek",
  "new": "baru",
  "old": "lama/tua",
  "many": "banyak",
  "few": "sedikit",
  "long": "panjang",
  "short": "pendek",
  "high": "tinggi",
  "low": "rendah",
  "house": "rumah",
  "school": "sekolah",
  "station": "stasiun",
  "hospital": "rumah sakit",
  "shop": "toko",
  "restaurant": "restoran",
  "book": "buku",
  "pen": "pena/pulpen",
  "water": "air",
  "food": "makanan",
  "money": "uang",
  "time": "waktu",
  "day": "hari",
  "week": "minggu",
  "month": "bulan",
  "year": "tahun",
  "morning": "pagi",
  "afternoon": "siang/sore",
  "evening": "malam",
  "night": "malam",
  "today": "hari ini",
  "tomorrow": "besok",
  "yesterday": "kemarin",
  "now": "sekarang",
  "later": "nanti",
  "always": "selalu",
  "sometimes": "kadang-kadang",
  "never": "tidak pernah",
  "often": "sering",
  "usually": "biasanya",
  "work": "kerja/bekerja",
  "study": "belajar",
  "read": "membaca",
  "write": "menulis",
  "speak": "berbicara",
  "listen": "mendengar",
  "see": "melihat",
  "walk": "berjalan",
  "run": "berlari",
  "sleep": "tidur",
  "wake up": "bangun",
  "buy": "membeli",
  "sell": "menjual",
  "give": "memberi",
  "receive": "menerima",
  "make": "membuat",
  "use": "menggunakan",
  "friend": "teman",
  "family": "keluarga",
  "father": "ayah",
  "mother": "ibu",
  "child": "anak",
  "teacher": "guru",
  "student": "murid/siswa",
  "doctor": "dokter",
  "company": "perusahaan",
  "country": "negara",
  "city": "kota",
  "language": "bahasa",
  "Japanese": "bahasa Jepang",
  "English": "bahasa Inggris",
  "Indonesian": "bahasa Indonesia",
  "question": "pertanyaan",
  "answer": "jawaban",
  "meaning": "arti",
  "example": "contoh",
  "telephone": "telepon",
  "movie": "film",
  "music": "musik",
  "flower": "bunga",
  "tree": "pohon",
  "animal": "hewan",
  "cat": "kucing",
  "dog": "anjing",
  "bird": "burung",
  "fish": "ikan",
  "car": "mobil",
  "train": "kereta",
  "airplane": "pesawat",
  "bus": "bis",
  "bicycle": "sepeda",
  "weather": "cuaca",
  "hot": "panas",
  "cold": "dingin",
  "rain": "hujan",
  "snow": "salju",
  "sunny": "cerah",
  "color": "warna",
  "red": "merah",
  "blue": "biru",
  "green": "hijau",
  "yellow": "kuning",
  "white": "putih",
  "black": "hitam",
  "number": "angka/nomor",
  "one": "satu",
  "two": "dua",
  "three": "tiga",
  "four": "empat",
  "five": "lima",
  "ten": "sepuluh",
  "hundred": "seratus",
  "thousand": "seribu"
}
```

#### 1.3 JMDict Import Script

**File**: `scripts/import-jmdict.ts`

```typescript
import { XMLParser } from 'fast-xml-parser';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import enIdDict from '../src/data/en-id-dictionary.json';

const prisma = new PrismaClient();

// Translation function using static mapping
function translateToIndonesian(englishMeanings: string[]): string[] {
  const translations: string[] = [];

  for (const meaning of englishMeanings) {
    const lowerMeaning = meaning.toLowerCase().trim();

    // Direct lookup
    if (enIdDict[lowerMeaning]) {
      translations.push(enIdDict[lowerMeaning]);
      continue;
    }

    // Try to find partial match
    for (const [en, id] of Object.entries(enIdDict)) {
      if (lowerMeaning.includes(en) || en.includes(lowerMeaning)) {
        translations.push(id);
        break;
      }
    }
  }

  return [...new Set(translations)]; // Remove duplicates
}

async function importJMdict() {
  // ... (same import logic as before, but use translateToIndonesian for meaningsId)
}
```

### Checklist Session 1:

- [ ] Create DictionaryEntry model
- [ ] Create static EN→ID mapping JSON (500+ common words)
- [ ] Run database migration
- [ ] Create JMdict parser with local translation
- [ ] Import JMdict data with Indonesian translations
- [ ] Tag JLPT levels

---

## Session 2: In-Chat Vocabulary Component

### Tasks:

#### 2.1 Dictionary Lookup API

**File**: `src/app/api/vocabulary/lookup/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'Word required' }, { status: 400 });
  }

  try {
    // Search by exact match first, then partial
    const entry = await prisma.dictionaryEntry.findFirst({
      where: {
        OR: [{ kanji: { has: word } }, { readings: { has: word } }],
      },
      orderBy: { priority: 'desc' },
    });

    if (!entry) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      word: entry.kanji[0] || entry.readings[0],
      reading: entry.readings[0],
      meaningsEn: entry.meaningsEn.slice(0, 5),
      meaningsId: entry.meaningsId.slice(0, 5),
      partsOfSpeech: entry.partsOfSpeech,
      jlptLevel: entry.jlptLevel,
    });
  } catch (error) {
    console.error('Vocabulary lookup error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
```

#### 2.2 Vocabulary Popup Component

**File**: `src/components/chat/VocabularyPopup.tsx`

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface VocabularyPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
}

interface VocabData {
  found: boolean;
  word?: string;
  reading?: string;
  meaningsEn?: string[];
  meaningsId?: string[];
  partsOfSpeech?: string[];
  jlptLevel?: string | null;
}

export function VocabularyPopup({ word, position, onClose }: VocabularyPopupProps) {
  const [data, setData] = useState<VocabData | null>(null);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchVocab() {
      try {
        const res = await fetch(`/api/vocabulary/lookup?word=${encodeURIComponent(word)}`);
        const result = await res.json();
        setData(result);
      } catch {
        setData({ found: false });
      } finally {
        setLoading(false);
      }
    }
    fetchVocab();
  }, [word]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const playAudio = () => {
    const text = data?.reading || word;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-background border-2 border-border rounded-base shadow-shadow p-3 min-w-[200px] max-w-[300px]"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: position.y + 10,
      }}
    >
      {loading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : data?.found ? (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-lg font-bold font-japanese">{data.word}</span>
              {data.word !== data.reading && (
                <span className="text-sm text-muted-foreground ml-1 font-japanese">
                  ({data.reading})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={playAudio} className="p-1 hover:bg-secondary-background rounded">
                <Volume2 className="h-3 w-3" />
              </button>
              {data.jlptLevel && <Badge size="sm">{data.jlptLevel}</Badge>}
            </div>
          </div>

          {/* Indonesian Meanings */}
          {data.meaningsId && data.meaningsId.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Indonesia:</p>
              <p className="text-sm">{data.meaningsId.slice(0, 3).join(', ')}</p>
            </div>
          )}

          {/* English Meanings */}
          {data.meaningsEn && data.meaningsEn.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">English:</p>
              <p className="text-sm text-muted-foreground">
                {data.meaningsEn.slice(0, 3).join(', ')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Kata tidak ditemukan</p>
      )}
    </div>
  );
}
```

#### 2.3 Clickable Japanese Text Component

**File**: `src/components/chat/ClickableJapanese.tsx`

```tsx
'use client';

import { useState, useCallback } from 'react';
import { VocabularyPopup } from './VocabularyPopup';

interface ClickableJapaneseProps {
  text: string;
  className?: string;
}

// Regex to detect Japanese characters
const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;

export function ClickableJapanese({ text, className }: ClickableJapaneseProps) {
  const [popup, setPopup] = useState<{ word: string; x: number; y: number } | null>(null);

  const handleWordClick = useCallback((word: string, e: React.MouseEvent) => {
    e.preventDefault();
    setPopup({
      word,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  // Split text into Japanese and non-Japanese parts
  const parts: { text: string; isJapanese: boolean }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = JAPANESE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isJapanese: false });
    }
    parts.push({ text: match[0], isJapanese: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isJapanese: false });
  }

  return (
    <>
      <span className={className}>
        {parts.map((part, i) =>
          part.isJapanese ? (
            <span
              key={i}
              onClick={e => handleWordClick(part.text, e)}
              className="cursor-pointer hover:bg-main/20 hover:underline rounded px-0.5 transition-colors"
            >
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </span>

      {popup && (
        <VocabularyPopup
          word={popup.word}
          position={{ x: popup.x, y: popup.y }}
          onClose={closePopup}
        />
      )}
    </>
  );
}
```

#### 2.4 Integrate into Chat Components

Update `ChatClient.tsx` and task chat components to use `ClickableJapanese`:

```tsx
// In message rendering
<ClickableJapanese text={message.content} className="whitespace-pre-wrap" />
```

### Checklist Session 2:

- [ ] Create vocabulary lookup API
- [ ] Create VocabularyPopup component
- [ ] Create ClickableJapanese wrapper component
- [ ] Integrate into ChatClient (Kaiwa)
- [ ] Integrate into Task chat
- [ ] Test word detection and popup
- [ ] Test audio playback

---

## Files to Create

### Database:

- [ ] `prisma/schema.prisma` (update with DictionaryEntry)

### Data:

- [ ] `src/data/en-id-dictionary.json` (static EN→ID mapping)

### Scripts:

- [ ] `scripts/import-jmdict.ts`

### API:

- [ ] `src/app/api/vocabulary/lookup/route.ts`

### Components:

- [ ] `src/components/chat/VocabularyPopup.tsx`
- [ ] `src/components/chat/ClickableJapanese.tsx`

---

## Testing Checklist

### Data Import:

- [ ] JMdict imports successfully
- [ ] Indonesian translations populated from static mapping
- [ ] JLPT levels tagged

### Vocabulary Lookup:

- [ ] API returns correct data for kanji
- [ ] API returns correct data for hiragana
- [ ] Returns not found gracefully

### UI:

- [ ] Japanese text is clickable in chat
- [ ] Popup appears on click
- [ ] Popup shows Indonesian translation
- [ ] Popup closes on outside click
- [ ] Audio playback works
- [ ] Mobile friendly (touch)

---

## Definition of Done

- [ ] JMdict data imported with local EN→ID translations
- [ ] Vocabulary lookup API working
- [ ] Japanese text clickable in chat messages
- [ ] Popup shows word info with Indonesian meaning
- [ ] Audio playback working
- [ ] Works in Kaiwa chat
- [ ] Works in Task chat
- [ ] Mobile responsive

---

## Notes

**Keuntungan pendekatan lokal (tanpa AI API):**

1. Tidak ada biaya API tambahan
2. Response instan (tidak perlu network call ke AI)
3. Konsisten (hasil selalu sama)
4. Offline-capable (setelah data loaded)

**Keterbatasan:**

1. Terjemahan terbatas pada static mapping
2. Tidak bisa translate konteks/kalimat
3. Perlu manual maintenance untuk expand vocabulary

---

_Plan Version: 2.0_
_Updated: 2025-11-28_
_Change: Switched from AI API translation to local static mapping, focus on in-chat vocabulary popup_
