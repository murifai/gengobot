/**
 * Process Wiktionary EN-ID data
 *
 * Converts Yomichan format to a simple EN→ID lookup dictionary
 *
 * Input format (Yomichan): [indonesian_word, "", "", "", 0, ["english_word {pos} (definition) (indo)"], 0, "source"]
 * Output format: { "english_word": ["indonesian_translation1", "indonesian_translation2"] }
 */

import * as fs from 'fs';
import * as path from 'path';

interface WiktionaryEntry {
  indonesian: string;
  english: string;
  pos: string;
  definition: string;
}

function parseWiktionaryEntry(entry: unknown[]): WiktionaryEntry | null {
  try {
    const indonesian = entry[0] as string;
    const glosses = entry[5] as string[];

    if (!glosses || glosses.length === 0) return null;

    const gloss = glosses[0];

    // Parse: "english_word {pos} (definition) (indo)"
    // Example: "abandon {v} (membiarkan, menelantarkan, mengabaika)"
    const match = gloss.match(/^(\w+(?:\s+\w+)*)\s*\{(\w+)\}\s*\(([^)]+)\)/);

    if (!match) {
      // Try simpler format: "word {pos} (indo)"
      const simpleMatch = gloss.match(/^(\w+(?:\s+\w+)*)\s*\{(\w+)\}/);
      if (simpleMatch) {
        return {
          indonesian: indonesian.toLowerCase(),
          english: simpleMatch[1].toLowerCase(),
          pos: simpleMatch[2],
          definition: '',
        };
      }
      return null;
    }

    return {
      indonesian: indonesian.toLowerCase(),
      english: match[1].toLowerCase(),
      pos: match[2],
      definition: match[3],
    };
  } catch {
    return null;
  }
}

async function processWiktionary() {
  const inputPath = path.join(__dirname, 'data/en-id-wiktionary.json');
  const outputPath = path.join(__dirname, 'data/en-id-dictionary.json');

  console.log('Reading Wiktionary data...');
  const rawData = fs.readFileSync(inputPath, 'utf-8');
  const entries: unknown[][] = JSON.parse(rawData);

  console.log(`Processing ${entries.length} entries...`);

  // Create EN→ID mapping
  const enToId: Record<string, Set<string>> = {};
  let processed = 0;
  let skipped = 0;

  for (const entry of entries) {
    const parsed = parseWiktionaryEntry(entry);

    if (parsed) {
      const { english, indonesian } = parsed;

      if (!enToId[english]) {
        enToId[english] = new Set();
      }
      enToId[english].add(indonesian);
      processed++;
    } else {
      skipped++;
    }
  }

  // Convert Sets to arrays
  const dictionary: Record<string, string[]> = {};
  for (const [en, idSet] of Object.entries(enToId)) {
    dictionary[en] = Array.from(idSet);
  }

  console.log(`Processed: ${processed}, Skipped: ${skipped}`);
  console.log(`Unique English words: ${Object.keys(dictionary).length}`);

  // Save output
  fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2));
  console.log(`Saved to ${outputPath}`);

  // Show sample
  console.log('\nSample entries:');
  const sampleKeys = Object.keys(dictionary).slice(0, 10);
  for (const key of sampleKeys) {
    console.log(`  ${key}: ${dictionary[key].join(', ')}`);
  }
}

processWiktionary().catch(console.error);
