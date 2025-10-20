import { NextResponse } from 'next/server';
import { generateImportTemplate } from '@/lib/export/deckExport';

// GET /api/decks/template - Download deck import template
export async function GET() {
  try {
    const template = generateImportTemplate();

    return new NextResponse(template, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="deck-import-template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
