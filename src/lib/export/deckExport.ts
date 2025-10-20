import * as XLSX from 'xlsx';
import {
  CardType,
  ExcelKanjiRow,
  ExcelVocabularyRow,
  ExcelGrammarRow,
  ImportCardData,
  ImportError,
} from '@/types/deck';

/**
 * Detect card type from Excel row headers
 */
export function detectCardType(row: Record<string, unknown>): CardType | null {
  const headers = Object.keys(row).map(h => h.toLowerCase());

  if (headers.includes('kanji') && headers.includes('meaning')) {
    return 'kanji';
  }

  if (headers.includes('word') && headers.includes('reading')) {
    return 'vocabulary';
  }

  if (headers.includes('grammar point')) {
    return 'grammar';
  }

  return null;
}

/**
 * Parse Excel row into ImportCardData
 */
export function parseExcelRow(
  row: Record<string, unknown>,
  cardType: CardType,
  rowIndex: number
): { card: ImportCardData | null; errors: ImportError[] } {
  const errors: ImportError[] = [];

  try {
    switch (cardType) {
      case 'kanji': {
        const kanjiRow = row as unknown as ExcelKanjiRow;

        if (!kanjiRow.Kanji || !kanjiRow.Meaning) {
          errors.push({
            row: rowIndex,
            message: 'Kanji and Meaning are required for kanji cards',
          });
          return { card: null, errors };
        }

        return {
          card: {
            cardType: 'kanji',
            kanji: String(kanjiRow.Kanji).trim(),
            kanjiMeaning: String(kanjiRow.Meaning).trim(),
            onyomi: kanjiRow.Onyomi ? String(kanjiRow.Onyomi).trim() : undefined,
            kunyomi: kanjiRow.Kunyomi ? String(kanjiRow.Kunyomi).trim() : undefined,
            exampleSentence: kanjiRow['Example Sentence']
              ? String(kanjiRow['Example Sentence']).trim()
              : undefined,
            exampleTranslation: kanjiRow['Example Translation']
              ? String(kanjiRow['Example Translation']).trim()
              : undefined,
            notes: kanjiRow.Notes ? String(kanjiRow.Notes).trim() : undefined,
            tags: kanjiRow.Tags
              ? String(kanjiRow.Tags)
                  .split(',')
                  .map(t => t.trim())
              : undefined,
          },
          errors,
        };
      }

      case 'vocabulary': {
        const vocabRow = row as unknown as ExcelVocabularyRow;

        if (!vocabRow.Word || !vocabRow.Meaning || !vocabRow.Reading) {
          errors.push({
            row: rowIndex,
            message: 'Word, Meaning, and Reading are required for vocabulary cards',
          });
          return { card: null, errors };
        }

        return {
          card: {
            cardType: 'vocabulary',
            word: String(vocabRow.Word).trim(),
            wordMeaning: String(vocabRow.Meaning).trim(),
            reading: String(vocabRow.Reading).trim(),
            partOfSpeech: vocabRow['Part of Speech']
              ? String(vocabRow['Part of Speech']).trim()
              : undefined,
            exampleSentence: vocabRow['Example Sentence']
              ? String(vocabRow['Example Sentence']).trim()
              : undefined,
            exampleTranslation: vocabRow['Example Translation']
              ? String(vocabRow['Example Translation']).trim()
              : undefined,
            notes: vocabRow.Notes ? String(vocabRow.Notes).trim() : undefined,
            tags: vocabRow.Tags
              ? String(vocabRow.Tags)
                  .split(',')
                  .map(t => t.trim())
              : undefined,
          },
          errors,
        };
      }

      case 'grammar': {
        const grammarRow = row as unknown as ExcelGrammarRow;

        if (!grammarRow['Grammar Point'] || !grammarRow.Meaning) {
          errors.push({
            row: rowIndex,
            message: 'Grammar Point and Meaning are required for grammar cards',
          });
          return { card: null, errors };
        }

        return {
          card: {
            cardType: 'grammar',
            grammarPoint: String(grammarRow['Grammar Point']).trim(),
            grammarMeaning: String(grammarRow.Meaning).trim(),
            usageNote: grammarRow['Usage Note']
              ? String(grammarRow['Usage Note']).trim()
              : undefined,
            exampleSentence: grammarRow['Example Sentence']
              ? String(grammarRow['Example Sentence']).trim()
              : undefined,
            exampleTranslation: grammarRow['Example Translation']
              ? String(grammarRow['Example Translation']).trim()
              : undefined,
            notes: grammarRow.Notes ? String(grammarRow.Notes).trim() : undefined,
            tags: grammarRow.Tags
              ? String(grammarRow.Tags)
                  .split(',')
                  .map(t => t.trim())
              : undefined,
          },
          errors,
        };
      }

      default:
        errors.push({
          row: rowIndex,
          message: `Unknown card type: ${cardType}`,
        });
        return { card: null, errors };
    }
  } catch (error) {
    errors.push({
      row: rowIndex,
      message: `Error parsing row: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return { card: null, errors };
  }
}

/**
 * Parse Excel file buffer and extract cards
 */
export function parseExcelFile(buffer: ArrayBuffer): {
  cards: ImportCardData[];
  errors: ImportError[];
} {
  const allCards: ImportCardData[] = [];
  const allErrors: ImportError[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

      if (rows.length === 0) {
        continue;
      }

      // Detect card type from first row
      const cardType = detectCardType(rows[0]);

      if (!cardType) {
        allErrors.push({
          row: 0,
          message: `Could not detect card type from sheet "${sheetName}". Please ensure headers match template format.`,
        });
        continue;
      }

      // Parse each row
      rows.forEach((row, index) => {
        const { card, errors } = parseExcelRow(row, cardType, index + 2); // +2 for header row and 1-based indexing

        if (card) {
          allCards.push(card);
        }

        allErrors.push(...errors);
      });
    }

    return {
      cards: allCards,
      errors: allErrors,
    };
  } catch (error) {
    allErrors.push({
      row: 0,
      message: `Error reading Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return {
      cards: allCards,
      errors: allErrors,
    };
  }
}

/**
 * Generate blank Excel template for deck import
 */
export function generateImportTemplate(): ArrayBuffer {
  const workbook = XLSX.utils.book_new();

  // Kanji template sheet
  const kanjiData = [
    {
      Kanji: '日',
      Meaning: 'sun, day',
      Onyomi: 'ニチ、ジツ',
      Kunyomi: 'ひ、か',
      'Example Sentence': '今日は良い天気です。',
      'Example Translation': "Today's weather is good.",
      Notes: 'Common kanji used daily',
      Tags: 'JLPT N5, common',
    },
  ];
  const kanjiSheet = XLSX.utils.json_to_sheet(kanjiData);
  XLSX.utils.book_append_sheet(workbook, kanjiSheet, 'Kanji Template');

  // Vocabulary template sheet
  const vocabData = [
    {
      Word: '食べる',
      Meaning: 'to eat',
      Reading: 'たべる',
      'Part of Speech': 'Verb (Ichidan)',
      'Example Sentence': 'ご飯を食べます。',
      'Example Translation': 'I eat rice.',
      Notes: 'Ichidan verb',
      Tags: 'JLPT N5, verbs',
    },
  ];
  const vocabSheet = XLSX.utils.json_to_sheet(vocabData);
  XLSX.utils.book_append_sheet(workbook, vocabSheet, 'Vocabulary Template');

  // Grammar template sheet
  const grammarData = [
    {
      'Grammar Point': '〜ています (Progressive)',
      Meaning: 'To be doing something (continuous action)',
      'Usage Note': 'Verb て-form + います',
      'Example Sentence': '今、本を読んでいます。',
      'Example Translation': 'I am reading a book now.',
      Notes: 'Used for ongoing actions',
      Tags: 'JLPT N5, grammar',
    },
  ];
  const grammarSheet = XLSX.utils.json_to_sheet(grammarData);
  XLSX.utils.book_append_sheet(workbook, grammarSheet, 'Grammar Template');

  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}

/**
 * Export deck to Excel format
 */
export function exportDeckToExcel(
  deckName: string,
  flashcards: Array<{
    cardType: CardType;
    [key: string]: unknown;
  }>
): ArrayBuffer {
  const workbook = XLSX.utils.book_new();

  // Group cards by type
  const kanjiCards = flashcards.filter(c => c.cardType === 'kanji');
  const vocabCards = flashcards.filter(c => c.cardType === 'vocabulary');
  const grammarCards = flashcards.filter(c => c.cardType === 'grammar');

  // Export Kanji cards
  if (kanjiCards.length > 0) {
    const kanjiData = kanjiCards.map(card => ({
      Kanji: card.kanji || '',
      Meaning: card.kanjiMeaning || '',
      Onyomi: card.onyomi || '',
      Kunyomi: card.kunyomi || '',
      'Example Sentence': card.exampleSentence || '',
      'Example Translation': card.exampleTranslation || '',
      Notes: card.notes || '',
      Tags: Array.isArray(card.tags) ? (card.tags as string[]).join(', ') : '',
    }));
    const kanjiSheet = XLSX.utils.json_to_sheet(kanjiData);
    XLSX.utils.book_append_sheet(workbook, kanjiSheet, 'Kanji');
  }

  // Export Vocabulary cards
  if (vocabCards.length > 0) {
    const vocabData = vocabCards.map(card => ({
      Word: card.word || '',
      Meaning: card.wordMeaning || '',
      Reading: card.reading || '',
      'Part of Speech': card.partOfSpeech || '',
      'Example Sentence': card.exampleSentence || '',
      'Example Translation': card.exampleTranslation || '',
      Notes: card.notes || '',
      Tags: Array.isArray(card.tags) ? (card.tags as string[]).join(', ') : '',
    }));
    const vocabSheet = XLSX.utils.json_to_sheet(vocabData);
    XLSX.utils.book_append_sheet(workbook, vocabSheet, 'Vocabulary');
  }

  // Export Grammar cards
  if (grammarCards.length > 0) {
    const grammarData = grammarCards.map(card => ({
      'Grammar Point': card.grammarPoint || '',
      Meaning: card.grammarMeaning || '',
      'Usage Note': card.usageNote || '',
      'Example Sentence': card.exampleSentence || '',
      'Example Translation': card.exampleTranslation || '',
      Notes: card.notes || '',
      Tags: Array.isArray(card.tags) ? (card.tags as string[]).join(', ') : '',
    }));
    const grammarSheet = XLSX.utils.json_to_sheet(grammarData);
    XLSX.utils.book_append_sheet(workbook, grammarSheet, 'Grammar');
  }

  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}
