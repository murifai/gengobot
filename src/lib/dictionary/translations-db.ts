/**
 * SQLite-based Japanese to Indonesian translation lookup
 * Uses the translations.db file for high-quality translations
 */

import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

interface TranslationEntry {
  kanji: string | null;
  reading: string;
  indonesian: string;
  english: string;
  jlpt_level: string | null;
}

export interface VocabularyLookupResult {
  found: boolean;
  word?: string;
  reading?: string;
  meaningsId?: string[];
  jlptLevel?: string | null;
}

// Singleton database instance
let db: DatabaseType | null = null;

function getDb(): DatabaseType {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'src/data/translations.db');
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}

/**
 * Look up vocabulary for a Japanese word
 * @param word - Japanese word (kanji or kana)
 * @returns Vocabulary data or not found
 */
export function lookupVocabulary(word: string): VocabularyLookupResult {
  try {
    const database = getDb();

    // Search for word in kanji or reading columns
    // The columns store JSON arrays, so we need to use LIKE with the word
    const stmt = database.prepare(`
      SELECT kanji, reading, indonesian, english, jlpt_level
      FROM entries
      WHERE kanji LIKE ? OR reading LIKE ?
      LIMIT 1
    `);

    const searchPattern = `%"${word}"%`;
    const entry = stmt.get(searchPattern, searchPattern) as TranslationEntry | undefined;

    if (!entry || !entry.indonesian) {
      return { found: false };
    }

    try {
      const kanjiList: string[] = entry.kanji ? JSON.parse(entry.kanji) : [];
      const readingList: string[] = JSON.parse(entry.reading);
      const indonesianList: string[] = JSON.parse(entry.indonesian);

      return {
        found: true,
        word: kanjiList[0] || readingList[0],
        reading: readingList[0],
        meaningsId: indonesianList.slice(0, 5),
        jlptLevel: entry.jlpt_level,
      };
    } catch {
      return { found: false };
    }
  } catch (error) {
    console.error('Translation lookup error:', error);
    return { found: false };
  }
}

/**
 * Close the database connection (for cleanup)
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
