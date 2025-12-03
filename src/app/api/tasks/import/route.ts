import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

interface TaskImportRow {
  title: string;
  description: string;
  category: string;
  subcategoryId?: string;
  difficulty: string;
  scenario: string;
  learningObjectives: string;
  conversationExample: string;
  estimatedDuration?: string | number;
  prerequisites?: string;
  characterId?: string;
  isActive?: string | boolean;
  // AI Configuration
  prompt?: string;
  voice?: string;
  speakingSpeed?: string | number;
}

// POST /api/tasks/import - Import tasks from Excel file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importedBy = formData.get('importedBy') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<TaskImportRow>(worksheet);

    if (data.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    const validDifficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string; data: Partial<TaskImportRow> }>,
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row number (1-indexed + header row)

      try {
        // Validate required fields
        if (!row.title || !row.description || !row.category || !row.difficulty || !row.scenario) {
          throw new Error(
            'Missing required fields: title, description, category, difficulty, scenario'
          );
        }

        // Validate difficulty
        if (!validDifficulties.includes(row.difficulty)) {
          throw new Error(
            `Invalid difficulty: ${row.difficulty}. Must be one of: ${validDifficulties.join(', ')}`
          );
        }

        // Parse arrays from comma-separated strings
        const learningObjectives = row.learningObjectives
          ? row.learningObjectives
              .split(',')
              .map((obj: string) => obj.trim())
              .filter((obj: string) => obj.length > 0)
          : [];

        const conversationExample = row.conversationExample ? row.conversationExample.trim() : '';

        if (learningObjectives.length === 0) {
          throw new Error('learningObjectives must contain at least one objective');
        }

        if (conversationExample.length === 0) {
          throw new Error('conversationExample must not be empty');
        }

        // Parse isActive
        let isActive = true;
        if (row.isActive !== undefined && row.isActive !== null && row.isActive !== '') {
          const activeStr = String(row.isActive).toUpperCase();
          isActive = activeStr === 'TRUE' || activeStr === '1' || activeStr === 'YES';
        }

        // Parse estimatedDuration (default to 10 minutes if not provided)
        let estimatedDuration = 10;
        if (row.estimatedDuration) {
          const duration = parseInt(String(row.estimatedDuration), 10);
          if (!isNaN(duration) && duration > 0) {
            estimatedDuration = duration;
          }
        }

        // Parse AI Configuration fields
        const prompt = row.prompt?.trim() || '';

        // Validate and parse voice
        const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        let voice = 'alloy';
        if (row.voice && row.voice.trim() !== '') {
          const voiceValue = row.voice.trim().toLowerCase();
          if (validVoices.includes(voiceValue)) {
            voice = voiceValue;
          } else {
            throw new Error(
              `Invalid voice: ${row.voice}. Must be one of: ${validVoices.join(', ')}`
            );
          }
        }

        // Validate and parse speakingSpeed (0.25 - 4.0)
        let speakingSpeed = 1.0;
        if (
          row.speakingSpeed !== undefined &&
          row.speakingSpeed !== null &&
          row.speakingSpeed !== ''
        ) {
          const speed = parseFloat(String(row.speakingSpeed));
          if (isNaN(speed) || speed < 0.25 || speed > 4.0) {
            throw new Error(
              `Invalid speakingSpeed: ${row.speakingSpeed}. Must be a number between 0.25 and 4.0`
            );
          }
          speakingSpeed = speed;
        }

        // Validate characterId if provided
        if (row.characterId && row.characterId.trim() !== '') {
          const character = await prisma.character.findUnique({
            where: { id: row.characterId.trim() },
          });
          if (!character) {
            throw new Error(`Character not found: ${row.characterId}`);
          }
        }

        // Note: subcategoryId validation skipped - will be validated by database constraints

        // Create the task using relation connect syntax
        await prisma.task.create({
          data: {
            title: row.title.trim(),
            description: row.description.trim(),
            category: row.category.trim(),
            difficulty: row.difficulty as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
            scenario: row.scenario.trim(),
            learningObjectives,
            conversationExample,
            estimatedDuration,
            isActive,
            // AI Configuration
            prompt,
            voice,
            speakingSpeed,
            ...(row.prerequisites && row.prerequisites.trim() !== ''
              ? { prerequisites: row.prerequisites.trim() }
              : {}),
            ...(row.characterId && row.characterId.trim() !== ''
              ? { character: { connect: { id: row.characterId.trim() } } }
              : {}),
            ...(row.subcategoryId && row.subcategoryId.trim() !== ''
              ? { subcategory: { connect: { id: row.subcategoryId.trim() } } }
              : {}),
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: {
            title: row.title,
            category: row.category,
            difficulty: row.difficulty,
          },
        });
      }
    }

    // Log admin action if importedBy is provided and user exists
    if (importedBy) {
      try {
        const adminUser = await prisma.user.findUnique({
          where: { id: importedBy },
          select: { id: true },
        });

        if (adminUser) {
          await prisma.adminLog.create({
            data: {
              adminId: importedBy,
              actionType: 'import_tasks',
              entityType: 'task',
              entityId: 'bulk',
              details: {
                fileName: file.name,
                results,
              },
            },
          });
        }
      } catch (error) {
        console.error('Failed to create admin log:', error);
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      results,
    });
  } catch (error) {
    console.error('Error importing tasks:', error);
    return NextResponse.json(
      {
        error: 'Failed to import tasks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
