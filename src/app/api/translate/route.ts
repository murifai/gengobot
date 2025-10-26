import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/translate
 * Translate Japanese words/phrases to Indonesian
 */
export async function POST(request: NextRequest) {
  try {
    const { word, reading, context } = await request.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    // Use OpenAI to translate with context awareness
    const prompt = `Translate the following Japanese word to Indonesian. Provide a concise, natural translation.

Japanese word: ${word}
${reading ? `Reading: ${reading}` : ''}
${context ? `Context: ${context}` : ''}

Provide ONLY the Indonesian translation, nothing else. Keep it short and natural (1-3 words maximum).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a Japanese-Indonesian translator. Provide accurate, concise translations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const translation = completion.choices[0]?.message?.content?.trim() || null;

    return NextResponse.json({
      word,
      reading,
      translation,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
