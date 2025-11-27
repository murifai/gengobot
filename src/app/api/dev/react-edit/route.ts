/**
 * DEV-ONLY API endpoint for react-edit tool
 * Saves text edits to JSON files for manual review
 *
 * TO REMOVE FOR PRODUCTION:
 * Delete this entire file: src/app/api/dev/react-edit/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

interface EditEntry {
  id: string;
  timestamp: string;
  page: string;
  componentName: string | null;
  sourceLocation: string | null;
  originalText: string;
  newText: string;
  applied: boolean;
}

interface EditsFile {
  lastUpdated: string;
  edits: EditEntry[];
}

const EDITS_DIR = path.join(process.cwd(), '.react-edit');

function getEditsFilePath(page: string): string {
  // Sanitize page path for filename
  const sanitized = page.replace(/\//g, '_').replace(/^_/, '') || 'index';
  return path.join(EDITS_DIR, `${sanitized}.json`);
}

async function ensureEditsDir(): Promise<void> {
  if (!existsSync(EDITS_DIR)) {
    await mkdir(EDITS_DIR, { recursive: true });
  }
}

async function readEditsFile(filePath: string): Promise<EditsFile> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { lastUpdated: new Date().toISOString(), edits: [] };
  }
}

async function writeEditsFile(filePath: string, data: EditsFile): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }
  try {
    const body = await request.json();
    const { page, componentName, sourceLocation, originalText, newText } = body;

    await ensureEditsDir();

    const filePath = getEditsFilePath(page);
    const editsFile = await readEditsFile(filePath);

    // Check for duplicate (same original text in same component)
    const existingIndex = editsFile.edits.findIndex(
      e => e.originalText === originalText && e.componentName === componentName && !e.applied
    );

    const entry: EditEntry = {
      id: `edit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      page,
      componentName,
      sourceLocation,
      originalText,
      newText,
      applied: false,
    };

    if (existingIndex >= 0) {
      // Update existing entry
      editsFile.edits[existingIndex] = entry;
    } else {
      // Add new entry
      editsFile.edits.push(entry);
    }

    editsFile.lastUpdated = new Date().toISOString();
    await writeEditsFile(filePath, editsFile);

    // Build clickable file link for VS Code
    const fileLink = sourceLocation
      ? `vscode://file${path.join(process.cwd(), sourceLocation.replace(/:\d+:\d+$/, '').replace(/:\d+$/, ''))}${sourceLocation.match(/:\d+/) ? `:${sourceLocation.match(/:(\d+)/)?.[1]}` : ''}`
      : null;

    return NextResponse.json({
      success: true,
      editId: entry.id,
      savedTo: filePath.replace(process.cwd(), '.'),
      fileToEdit: sourceLocation,
      fileLink,
      message: `Edit saved! Check ${filePath.replace(process.cwd(), '.')}`,
    });
  } catch (error) {
    console.error('Failed to save edit:', error);
    return NextResponse.json({ success: false, error: 'Failed to save edit' }, { status: 500 });
  }
}

export async function GET() {
  if (!isDevelopment) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }
  try {
    await ensureEditsDir();

    const fs = await import('fs/promises');
    const files = await fs.readdir(EDITS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const allEdits: Record<string, EditsFile> = {};

    for (const file of jsonFiles) {
      const filePath = path.join(EDITS_DIR, file);
      const content = await readEditsFile(filePath);
      const pageName = file.replace('.json', '').replace(/_/g, '/');
      allEdits[pageName] = content;
    }

    return NextResponse.json({
      editsDirectory: EDITS_DIR.replace(process.cwd(), '.'),
      pages: allEdits,
      totalEdits: Object.values(allEdits).reduce(
        (sum, page) => sum + page.edits.filter(e => !e.applied).length,
        0
      ),
    });
  } catch (error) {
    console.error('Failed to read edits:', error);
    return NextResponse.json({ success: false, error: 'Failed to read edits' }, { status: 500 });
  }
}
