import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/lib/storage/upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB for images)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Validate image file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image file type. Allowed: JPEG, PNG, GIF, WebP, SVG' },
        { status: 400 }
      );
    }

    // Upload to R2 in jlpt/images folder
    const result = await uploadFileToR2(file, 'jlpt/images');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image file' }, { status: 500 });
  }
}
