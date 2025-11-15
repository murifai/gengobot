// Type definitions for Deck and Flashcard system

export type CardType = 'kanji' | 'vocabulary' | 'grammar';

export type SpacedRepetitionRating = 'belum_hafal' | 'hafal';

// Kanji Card Template
export interface KanjiCardData {
  kanji: string;
  kanjiMeaning: string;
  onyomi?: string;
  kunyomi?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
  tags?: string[];
}

// Vocabulary Card Template
export interface VocabularyCardData {
  word: string;
  wordMeaning: string;
  reading: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
  tags?: string[];
}

// Grammar Card Template
export interface GrammarCardData {
  grammarPoint: string;
  grammarMeaning: string;
  usageNote?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
  tags?: string[];
}

// Combined Flashcard type
export interface Flashcard {
  id: string;
  deckId: string;
  cardType: CardType;

  // Kanji fields
  kanji?: string;
  kanjiMeaning?: string;
  onyomi?: string;
  kunyomi?: string;

  // Vocabulary fields
  word?: string;
  wordMeaning?: string;
  reading?: string;
  partOfSpeech?: string;

  // Grammar fields
  grammarPoint?: string;
  grammarMeaning?: string;
  usageNote?: string;

  // Common fields
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
  tags?: string[];

  // Spaced repetition
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate?: Date;
  lastReviewedAt?: Date;

  // Metadata
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Deck type
export interface Deck {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  category?: string;
  difficulty?: string;
  totalCards: number;
  studyCount: number;
  averageScore?: number;
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  flashcards?: Flashcard[];
}

// Study Session type
export interface StudySession {
  id: string;
  userId: string;
  deckId: string;
  cardsReviewed: number;
  cardsCorrect: number;
  averageResponseTime?: number;
  belumHafalCount: number;
  hafalCount: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
}

// Flashcard Review type
export interface FlashcardReview {
  id: string;
  flashcardId: string;
  sessionId: string;
  rating: SpacedRepetitionRating;
  responseTime?: number;
  easeFactor: number;
  interval: number;
  reviewedAt: Date;
}

// API Request/Response types

export interface CreateDeckRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  category?: string;
  difficulty?: string;
}

export interface UpdateDeckRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  category?: string;
  difficulty?: string;
  isActive?: boolean;
}

export interface CreateFlashcardRequest {
  deckId: string;
  cardType: CardType;
  data: KanjiCardData | VocabularyCardData | GrammarCardData;
  position?: number;
}

export interface UpdateFlashcardRequest {
  cardType?: CardType;
  data?: Partial<KanjiCardData | VocabularyCardData | GrammarCardData>;
  position?: number;
  isActive?: boolean;
}

export interface ImportDeckRequest {
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  cards: ImportCardData[];
}

export interface ImportCardData {
  cardType: CardType;
  [key: string]: string | string[] | undefined;
}

export interface ImportResult {
  success: boolean;
  deckId?: string;
  cardsImported: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
}

export interface DeckListResponse {
  decks: Deck[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FlashcardListResponse {
  flashcards: Flashcard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Excel Import/Export types
export interface ExcelKanjiRow {
  Kanji: string;
  Meaning: string;
  Onyomi?: string;
  Kunyomi?: string;
  'Example Word'?: string;
  'Example Sentence'?: string;
  'Example Translation'?: string;
  Notes?: string;
  Tags?: string;
}

export interface ExcelVocabularyRow {
  Word: string;
  Meaning: string;
  Reading: string;
  'Part of Speech'?: string;
  'Example Sentence'?: string;
  'Example Translation'?: string;
  Notes?: string;
  Tags?: string;
}

export interface ExcelGrammarRow {
  'Grammar Point': string;
  Meaning: string;
  'Usage Note'?: string;
  'Example Sentence'?: string;
  'Example Translation'?: string;
  Notes?: string;
  Tags?: string;
}

export type ExcelRow = ExcelKanjiRow | ExcelVocabularyRow | ExcelGrammarRow;

// Utility type for creating cards
export type CreateCardData =
  | { cardType: 'kanji'; data: KanjiCardData }
  | { cardType: 'vocabulary'; data: VocabularyCardData }
  | { cardType: 'grammar'; data: GrammarCardData };

// Filter types
export interface DeckFilters {
  category?: string;
  difficulty?: string;
  isPublic?: boolean;
  isActive?: boolean;
  createdBy?: string;
  search?: string;
}

export interface FlashcardFilters {
  deckId?: string;
  cardType?: CardType;
  isActive?: boolean;
  tags?: string[];
  search?: string;
  dueForReview?: boolean;
}
