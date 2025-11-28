import { NextResponse } from 'next/server';
import { lookupVocabulary } from '@/lib/dictionary/translations-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'Word required' }, { status: 400 });
  }

  try {
    // Look up from translations.db (SQLite)
    const result = lookupVocabulary(word);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Vocabulary lookup error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
