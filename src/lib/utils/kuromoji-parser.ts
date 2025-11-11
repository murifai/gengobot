/**
 * Kuromoji Parser Utility
 * Tokenizes Japanese text and extracts vocabulary information
 */

import kuromoji from 'kuromoji';

export interface Token {
  surface_form: string; // The actual word/character
  pos: string; // Part of speech (名詞, 動詞, etc.)
  pos_detail_1: string; // Detailed POS (固有名詞, 一般, etc.)
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string; // Conjugation type
  conjugated_form: string; // Conjugated form
  basic_form: string; // Dictionary form
  reading: string; // Katakana reading
  pronunciation: string; // Pronunciation
}

export interface VocabularyInfo {
  word: string; // Surface form
  reading: string; // Katakana reading
  baseForm: string; // Dictionary form
  partOfSpeech: string; // Part of speech
  posDetail: string; // Detailed part of speech
  conjugation?: string; // Conjugation info (if applicable)
  isGrouped?: boolean; // Whether this token was merged with others
  originalTokens?: string[]; // Original tokens before merging
  meaning?: string; // Indonesian translation (optional, can be added later)
}

let tokenizerInstance: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
let tokenizerPromise: Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> | null = null;

/**
 * Initialize Kuromoji tokenizer (lazy load)
 */
export async function initializeTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (tokenizerInstance) {
    return tokenizerInstance;
  }

  if (tokenizerPromise) {
    return tokenizerPromise;
  }

  tokenizerPromise = new Promise((resolve, reject) => {
    kuromoji
      .builder({
        dicPath: '/dict/', // Dictionary files should be in public/dict/
      })
      .build((err, tokenizer) => {
        if (err) {
          console.error('Failed to build Kuromoji tokenizer:', err);
          reject(err);
          return;
        }
        tokenizerInstance = tokenizer;
        resolve(tokenizer);
      });
  });

  return tokenizerPromise;
}

/**
 * Tokenize Japanese text and extract vocabulary information
 */
export async function tokenizeJapanese(text: string): Promise<VocabularyInfo[]> {
  try {
    const tokenizer = await initializeTokenizer();
    const tokens = tokenizer.tokenize(text);

    const vocabInfos = tokens.map(token => ({
      word: token.surface_form,
      reading: token.reading || token.surface_form,
      baseForm: token.basic_form || token.surface_form,
      partOfSpeech: token.pos,
      posDetail: [token.pos_detail_1, token.pos_detail_2, token.pos_detail_3]
        .filter(Boolean)
        .join('・'),
      conjugation:
        token.conjugated_type && token.conjugated_type !== '*'
          ? `${token.conjugated_type} (${token.conjugated_form})`
          : undefined,
    }));

    // Merge verb phrases for learner-friendly display
    return mergeVerbPhrases(vocabInfos);
  } catch (error) {
    console.error('Failed to tokenize text:', error);
    return [];
  }
}

/**
 * Get POS (Part of Speech) in readable format (Indonesian)
 */
export function formatPartOfSpeech(pos: string, posDetail?: string): string {
  const posMap: Record<string, string> = {
    名詞: 'Nomina',
    動詞: 'Verba',
    形容詞: 'Adjektiva',
    副詞: 'Adverbia',
    助詞: 'Partikel',
    助動詞: 'Verba Bantu',
    接続詞: 'Konjungsi',
    連体詞: 'Prenominal',
    感動詞: 'Interjeksi',
    記号: 'Simbol',
    フィラー: 'Pengisi',
    その他: 'Lainnya',
  };

  const mainPos = posMap[pos] || pos;
  return posDetail ? `${mainPos} (${posDetail})` : mainPos;
}

/**
 * Check if a token should be highlighted (content words, not particles/symbols)
 */
export function shouldHighlightToken(vocabInfo: VocabularyInfo): boolean {
  const contentPOS = ['名詞', '動詞', '形容詞', '副詞', '連体詞'];
  return contentPOS.includes(vocabInfo.partOfSpeech);
}

/**
 * Convert katakana reading to hiragana
 */
export function katakanaToHiragana(katakana: string): string {
  return katakana.replace(/[\u30A1-\u30F6]/g, match => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * Convert katakana to romaji (romanization)
 */
export function katakanaToRomaji(katakana: string): string {
  const kanaMap: Record<string, string> = {
    // Vowels
    ア: 'a',
    イ: 'i',
    ウ: 'u',
    エ: 'e',
    オ: 'o',
    // K-sounds
    カ: 'ka',
    キ: 'ki',
    ク: 'ku',
    ケ: 'ke',
    コ: 'ko',
    // G-sounds
    ガ: 'ga',
    ギ: 'gi',
    グ: 'gu',
    ゲ: 'ge',
    ゴ: 'go',
    // S-sounds
    サ: 'sa',
    シ: 'shi',
    ス: 'su',
    セ: 'se',
    ソ: 'so',
    // Z-sounds
    ザ: 'za',
    ジ: 'ji',
    ズ: 'zu',
    ゼ: 'ze',
    ゾ: 'zo',
    // T-sounds
    タ: 'ta',
    チ: 'chi',
    ツ: 'tsu',
    テ: 'te',
    ト: 'to',
    // D-sounds
    ダ: 'da',
    ヂ: 'ji',
    ヅ: 'zu',
    デ: 'de',
    ド: 'do',
    // N-sounds
    ナ: 'na',
    ニ: 'ni',
    ヌ: 'nu',
    ネ: 'ne',
    ノ: 'no',
    // H-sounds
    ハ: 'ha',
    ヒ: 'hi',
    フ: 'fu',
    ヘ: 'he',
    ホ: 'ho',
    // B-sounds
    バ: 'ba',
    ビ: 'bi',
    ブ: 'bu',
    ベ: 'be',
    ボ: 'bo',
    // P-sounds
    パ: 'pa',
    ピ: 'pi',
    プ: 'pu',
    ペ: 'pe',
    ポ: 'po',
    // M-sounds
    マ: 'ma',
    ミ: 'mi',
    ム: 'mu',
    メ: 'me',
    モ: 'mo',
    // Y-sounds
    ヤ: 'ya',
    ユ: 'yu',
    ヨ: 'yo',
    // R-sounds
    ラ: 'ra',
    リ: 'ri',
    ル: 'ru',
    レ: 're',
    ロ: 'ro',
    // W-sounds
    ワ: 'wa',
    ヲ: 'wo',
    ン: 'n',
    // Small kana
    ャ: 'ya',
    ュ: 'yu',
    ョ: 'yo',
    ッ: '',
    ー: '',
  };

  let result = '';
  let i = 0;

  while (i < katakana.length) {
    const char = katakana[i];
    const nextChar = katakana[i + 1];

    // Handle small tsu (ッ) - doubles the next consonant
    if (char === 'ッ' && nextChar && kanaMap[nextChar]) {
      const nextRomaji = kanaMap[nextChar];
      result += nextRomaji[0]; // Add first consonant
      i++;
      continue;
    }

    // Handle combination with small ya/yu/yo
    if (
      nextChar &&
      (nextChar === 'ャ' || nextChar === 'ュ' || nextChar === 'ョ') &&
      kanaMap[char]
    ) {
      const baseRomaji = kanaMap[char];
      const smallKanaRomaji = kanaMap[nextChar];

      // Remove 'i' from base and add small kana
      if (baseRomaji.endsWith('i')) {
        result += baseRomaji.slice(0, -1) + smallKanaRomaji;
      } else if (baseRomaji.endsWith('hi')) {
        result += baseRomaji.slice(0, -2) + 'y' + smallKanaRomaji;
      } else {
        result += baseRomaji + smallKanaRomaji;
      }
      i += 2;
      continue;
    }

    // Regular conversion
    if (kanaMap[char]) {
      result += kanaMap[char];
    } else {
      result += char; // Keep non-katakana characters as-is
    }
    i++;
  }

  return result;
}

/**
 * Merge verb stems with auxiliary verbs for learner-friendly display
 * Also merges noun+verb compounds (e.g., 勉強 + します → 勉強します)
 * Examples:
 * - し + ます → します (to do)
 * - 食べ + ます → 食べます (to eat)
 * - 見 + て + い + ます → 見ています (is looking)
 * - 行っ + た → 行った (went)
 * - 飲ま + ない → 飲まない (don't drink)
 * - 勉強 + し + ます → 勉強します (study)
 */
export function mergeVerbPhrases(tokens: VocabularyInfo[]): VocabularyInfo[] {
  const merged: VocabularyInfo[] = [];
  let i = 0;

  while (i < tokens.length) {
    const current = tokens[i];

    // Check if current token is a noun followed by する verb (サ変動詞 pattern)
    if (
      current.partOfSpeech === '名詞' &&
      i + 1 < tokens.length &&
      tokens[i + 1].partOfSpeech === '動詞' &&
      tokens[i + 1].baseForm === 'する'
    ) {
      let mergedWord = current.word;
      let mergedReading = current.reading;
      const originalTokens = [current.word];
      let j = i + 1;

      // Merge the noun with the verb
      const verb = tokens[j];
      mergedWord += verb.word;
      mergedReading += verb.reading;
      originalTokens.push(verb.word);
      j++;

      // Continue merging auxiliaries after the verb
      while (j < tokens.length) {
        const next = tokens[j];
        const shouldMerge =
          next.partOfSpeech === '助動詞' ||
          (next.partOfSpeech === '助詞' &&
            next.word.match(/^[てで]$/) &&
            j + 1 < tokens.length &&
            (tokens[j + 1].partOfSpeech === '助動詞' || tokens[j + 1].partOfSpeech === '動詞'));

        if (shouldMerge) {
          mergedWord += next.word;
          mergedReading += next.reading;
          originalTokens.push(next.word);
          j++;

          if (next.word.match(/^[てで]$/)) {
            continue;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      merged.push({
        word: mergedWord,
        reading: mergedReading,
        baseForm: current.word + verb.baseForm, // e.g., 勉強する
        partOfSpeech: '動詞', // Treat as verb
        posDetail: current.posDetail,
        conjugation: verb.conjugation,
        isGrouped: true,
        originalTokens,
      });
      i = j;
      continue;
    }

    // Check if current token is a verb
    if (current.partOfSpeech === '動詞') {
      let mergedWord = current.word;
      let mergedReading = current.reading;
      const originalTokens = [current.word];
      let j = i + 1;
      let foundAuxiliary = false;

      // Look ahead for auxiliary verbs and verb-related particles
      while (j < tokens.length) {
        const next = tokens[j];

        // Patterns to merge:
        // 1. 助動詞 (auxiliary verbs): ます, た, だ, ない, etc.
        // 2. 助詞 (particles) when followed by auxiliary: て, で
        const shouldMerge =
          next.partOfSpeech === '助動詞' || // auxiliary verb
          (next.partOfSpeech === '助詞' && // particle
            next.word.match(/^[てで]$/) && // て or で
            j + 1 < tokens.length &&
            (tokens[j + 1].partOfSpeech === '助動詞' || tokens[j + 1].partOfSpeech === '動詞'));

        if (shouldMerge) {
          mergedWord += next.word;
          mergedReading += next.reading;
          originalTokens.push(next.word);
          foundAuxiliary = true;
          j++;

          // If we merged て/で, continue to check for following verb/auxiliary
          if (next.word.match(/^[てで]$/)) {
            continue;
          } else {
            // For other auxiliaries, stop after merging
            break;
          }
        } else {
          break;
        }
      }

      // If we merged anything, create a grouped token
      if (foundAuxiliary) {
        merged.push({
          word: mergedWord,
          reading: mergedReading,
          baseForm: current.baseForm,
          partOfSpeech: current.partOfSpeech,
          posDetail: current.posDetail,
          conjugation: current.conjugation,
          isGrouped: true,
          originalTokens,
        });
        i = j; // Skip the merged tokens
      } else {
        merged.push(current);
        i++;
      }
    } else {
      merged.push(current);
      i++;
    }
  }

  return merged;
}
