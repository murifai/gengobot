import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/storage/upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const level = formData.get('level') as string | null;
    const section = formData.get('section') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 50MB for audio)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Validate audio file types
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/aac',
      'audio/m4a',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid audio file type. Allowed: MP3, WAV, OGG, WebM, AAC, M4A' },
        { status: 400 }
      );
    }

    // Build folder path with optional level and section organization
    let folder = 'jlpt/audio';
    if (level && section) {
      folder = `jlpt/audio/${level}/${section}`;
    } else if (level) {
      folder = `jlpt/audio/${level}`;
    }

    // Upload to R2 with organized folder structure
    const result = await uploadFileToR2(file, folder);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json({ error: 'Failed to upload audio file' }, { status: 500 });
  }
}
