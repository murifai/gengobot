import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/storage/upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

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

    // Upload to R2 in jlpt/audio folder
    const result = await uploadFileToR2(file, 'jlpt/audio');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json({ error: 'Failed to upload audio file' }, { status: 500 });
  }
}
