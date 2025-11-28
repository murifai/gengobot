/**
 * JMDict Import Script
 *
 * Downloads and imports JMDict (Japanese-English dictionary) data into the database.
 * Uses local Wiktionary EN→ID dictionary for Indonesian translations.
 *
 * Usage:
 *   npx tsx scripts/import-jmdict.ts --download
 *   Or place JMdict_e file manually and run: npx tsx scripts/import-jmdict.ts
 */

import { XMLParser } from 'fast-xml-parser';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import * as http from 'http';
import * as https from 'https';

const prisma = new PrismaClient();

// Load EN→ID dictionary
const enIdDictPath = path.join(__dirname, 'data/en-id-dictionary.json');
const enIdDict: Record<string, string[]> = JSON.parse(fs.readFileSync(enIdDictPath, 'utf-8'));

// JMDict XML structure types
interface JMdictKanji {
  keb: string;
  ke_inf?: string | string[];
  ke_pri?: string | string[];
}

interface JMdictReading {
  reb: string;
  re_nokanji?: string;
  re_restr?: string | string[];
  re_inf?: string | string[];
  re_pri?: string | string[];
}

interface JMdictSense {
  stagk?: string | string[];
  stagr?: string | string[];
  pos?: string | string[];
  xref?: string | string[];
  ant?: string | string[];
  field?: string | string[];
  misc?: string | string[];
  s_inf?: string | string[];
  lsource?: string | { '#text': string; '@_xml:lang'?: string }[];
  dial?: string | string[];
  gloss: string | string[] | { '#text': string; '@_xml:lang'?: string }[];
}

interface JMdictEntry {
  ent_seq: number;
  k_ele?: JMdictKanji | JMdictKanji[];
  r_ele: JMdictReading | JMdictReading[];
  sense: JMdictSense | JMdictSense[];
}

// Priority markers from JMDict that indicate common words
const PRIORITY_MARKERS = [
  'news1',
  'news2',
  'ichi1',
  'ichi2',
  'spec1',
  'spec2',
  'gai1',
  'gai2',
  'nf01',
  'nf02',
  'nf03',
  'nf04',
  'nf05',
];

/**
 * Download JMDict file from EDRDG server using HTTP
 */
async function downloadJMdict(outputPath: string): Promise<void> {
  const url = 'http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz';

  console.log('Downloading JMdict_e.gz from EDRDG...');
  console.log('URL:', url);

  return new Promise((resolve, reject) => {
    const gzPath = outputPath + '.gz';
    const file = fs.createWriteStream(gzPath);

    const request = http.get(url, response => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error('Redirect without location header'));
          return;
        }
        console.log('Redirecting to:', redirectUrl);
        file.close();
        fs.unlinkSync(gzPath);

        const protocol = redirectUrl.startsWith('https') ? https : http;
        protocol
          .get(
            redirectUrl,
            { rejectUnauthorized: false } as https.RequestOptions,
            redirectResponse => {
              handleResponse(redirectResponse, gzPath, outputPath, resolve, reject);
            }
          )
          .on('error', reject);
        return;
      }

      handleResponse(response, gzPath, outputPath, resolve, reject);
    });

    request.on('error', err => {
      file.close();
      reject(err);
    });
  });
}

function handleResponse(
  response: import('http').IncomingMessage,
  gzPath: string,
  outputPath: string,
  resolve: () => void,
  reject: (err: Error) => void
): void {
  if (response.statusCode !== 200) {
    reject(new Error(`HTTP ${response.statusCode}: Failed to download`));
    return;
  }

  const file = fs.createWriteStream(gzPath);
  let downloadedBytes = 0;
  const totalBytes = parseInt(response.headers['content-length'] || '0', 10);

  response.on('data', (chunk: Buffer) => {
    downloadedBytes += chunk.length;
    if (totalBytes > 0) {
      const percent = Math.round((downloadedBytes / totalBytes) * 100);
      process.stdout.write(
        `\rDownloading: ${percent}% (${(downloadedBytes / 1024 / 1024).toFixed(1)}MB)`
      );
    }
  });

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('\nDownload complete. Extracting...');

    const gunzip = zlib.createGunzip();
    const input = fs.createReadStream(gzPath);
    const output = fs.createWriteStream(outputPath);

    input.pipe(gunzip).pipe(output);

    output.on('finish', () => {
      try {
        fs.unlinkSync(gzPath);
      } catch {
        // Ignore if file already deleted
      }
      console.log('Extraction complete.');
      resolve();
    });

    output.on('error', reject);
    gunzip.on('error', reject);
  });

  file.on('error', reject);
}

/**
 * Helper to ensure array format
 */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Extract English glosses from sense
 */
function extractGlosses(gloss: JMdictSense['gloss']): string[] {
  if (!gloss) return [];

  // Handle the complex gloss type: string | string[] | { '#text': string; '@_xml:lang'?: string }[]
  const glossArray = Array.isArray(gloss) ? gloss : [gloss];

  return glossArray
    .map(g => {
      if (typeof g === 'string') return g;
      if (g && typeof g === 'object' && '#text' in g) {
        const lang = (g as { '#text': string; '@_xml:lang'?: string })['@_xml:lang'];
        if (!lang || lang === 'eng') {
          return (g as { '#text': string })['#text'];
        }
      }
      return '';
    })
    .filter(Boolean);
}

/**
 * Translate English meanings to Indonesian using local dictionary
 */
function translateToIndonesian(englishMeanings: string[]): string[] {
  const translations: string[] = [];

  for (const meaning of englishMeanings) {
    const lowerMeaning = meaning.toLowerCase().trim();

    // Direct lookup
    if (enIdDict[lowerMeaning]) {
      translations.push(...enIdDict[lowerMeaning]);
      continue;
    }

    // Try to find by individual words
    const words = lowerMeaning.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord && enIdDict[cleanWord]) {
        translations.push(...enIdDict[cleanWord]);
      }
    }
  }

  // Remove duplicates and limit
  return [...new Set(translations)].slice(0, 10);
}

/**
 * Calculate priority score based on JMDict priority markers
 */
function calculatePriority(entry: JMdictEntry): number {
  let priority = 0;

  const kanjiElements = toArray(entry.k_ele);
  for (const kEle of kanjiElements) {
    const priorities = toArray(kEle.ke_pri);
    for (const pri of priorities) {
      if (PRIORITY_MARKERS.includes(pri)) {
        if (pri.endsWith('1')) {
          priority += 10;
        } else {
          priority += 5;
        }
        if (pri.startsWith('nf')) {
          const level = parseInt(pri.slice(2));
          priority += Math.max(0, 10 - level * 2);
        }
      }
    }
  }

  const readingElements = toArray(entry.r_ele);
  for (const rEle of readingElements) {
    const priorities = toArray(rEle.re_pri);
    for (const pri of priorities) {
      if (PRIORITY_MARKERS.includes(pri)) {
        if (pri.endsWith('1')) {
          priority += 10;
        } else {
          priority += 5;
        }
        if (pri.startsWith('nf')) {
          const level = parseInt(pri.slice(2));
          priority += Math.max(0, 10 - level * 2);
        }
      }
    }
  }

  return priority;
}

/**
 * Main import function
 */
async function importJMdict(filePath: string): Promise<void> {
  console.log('Reading JMdict file...');
  const xml = fs.readFileSync(filePath, 'utf-8');

  console.log('Parsing XML (this may take a few minutes)...');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: tagName =>
      [
        'k_ele',
        'r_ele',
        'sense',
        'gloss',
        'pos',
        'ke_pri',
        're_pri',
        'misc',
        'field',
        'dial',
      ].includes(tagName),
  });

  const data = parser.parse(xml);
  const entries: JMdictEntry[] = data.JMdict.entry;

  console.log(`Found ${entries.length} entries`);
  console.log(`EN→ID dictionary has ${Object.keys(enIdDict).length} words`);

  // Clear existing data
  console.log('Clearing existing dictionary data...');
  await prisma.dictionaryEntry.deleteMany();

  // Process in batches
  const BATCH_SIZE = 1000;
  let imported = 0;
  let skipped = 0;
  let withTranslations = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    const processed = batch
      .map(entry => {
        try {
          const kanjiElements = toArray(entry.k_ele);
          const kanji = kanjiElements.map(k => k.keb).filter(Boolean);

          const readingElements = toArray(entry.r_ele);
          const readings = readingElements.map(r => r.reb).filter(Boolean);

          const senses = toArray(entry.sense);
          const meaningsEn: string[] = [];
          const partsOfSpeech: string[] = [];

          for (const sense of senses) {
            const glosses = extractGlosses(sense.gloss);
            meaningsEn.push(...glosses);

            const pos = toArray(sense.pos);
            partsOfSpeech.push(...pos);
          }

          // Translate to Indonesian
          const meaningsId = translateToIndonesian(meaningsEn);
          if (meaningsId.length > 0) withTranslations++;

          const priority = calculatePriority(entry);

          return {
            entryId: entry.ent_seq,
            kanji,
            readings,
            meaningsEn: [...new Set(meaningsEn)].slice(0, 20),
            meaningsId,
            partsOfSpeech: [...new Set(partsOfSpeech)],
            jlptLevel: null,
            priority,
          };
        } catch (error) {
          console.error(`Error processing entry ${entry.ent_seq}:`, error);
          return null;
        }
      })
      .filter(Boolean);

    try {
      await prisma.dictionaryEntry.createMany({
        data: processed as NonNullable<(typeof processed)[number]>[],
        skipDuplicates: true,
      });
      imported += processed.length;
    } catch (error) {
      console.error(`Error inserting batch at ${i}:`, error);
      skipped += processed.length;
    }

    const progress = Math.round(((i + batch.length) / entries.length) * 100);
    process.stdout.write(`\rProgress: ${progress}% (${imported} imported, ${skipped} skipped)`);
  }

  console.log('\n\nImport complete!');
  console.log(`Total imported: ${imported}`);
  console.log(`Total skipped: ${skipped}`);
  console.log(`Entries with Indonesian translations: ${withTranslations}`);

  const totalCount = await prisma.dictionaryEntry.count();
  const withPriorityCount = await prisma.dictionaryEntry.count({
    where: { priority: { gt: 0 } },
  });
  const withIdCount = await prisma.dictionaryEntry.count({
    where: { meaningsId: { isEmpty: false } },
  });

  console.log(`\nDatabase Statistics:`);
  console.log(`Total entries: ${totalCount}`);
  console.log(`Entries with priority markers: ${withPriorityCount}`);
  console.log(`Entries with Indonesian translations: ${withIdCount}`);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldDownload = args.includes('--download');

  const jmdictPath = path.join(__dirname, 'JMdict_e');

  try {
    if (!fs.existsSync(jmdictPath)) {
      if (shouldDownload) {
        await downloadJMdict(jmdictPath);
      } else {
        console.error('JMdict_e file not found.');
        console.error('Please either:');
        console.error('  1. Download manually from http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz');
        console.error('  2. Run with --download flag: npx tsx scripts/import-jmdict.ts --download');
        process.exit(1);
      }
    }

    await importJMdict(jmdictPath);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
