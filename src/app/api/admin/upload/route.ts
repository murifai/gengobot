import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getAdminSession } from '@/lib/auth/admin-auth';

// Allowed file types for different upload categories
const ALLOWED_TYPES = {
  audio: {
    mimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'],
    extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: 'audio',
  },
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: 'images',
  },
};

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'audio';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate upload type
    const uploadConfig = ALLOWED_TYPES[type as keyof typeof ALLOWED_TYPES];
    if (!uploadConfig) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    // Validate file size
    if (file.size > uploadConfig.maxSize) {
      const maxSizeMB = uploadConfig.maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File size must be less than ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = path.extname(file.name).toLowerCase();
    const isValidMime = uploadConfig.mimeTypes.includes(file.type);
    const isValidExt = uploadConfig.extensions.includes(fileExtension);

    if (!isValidMime && !isValidExt) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${uploadConfig.extensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadConfig.folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${randomString}-${safeFileName}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL path
    const publicPath = `/uploads/${uploadConfig.folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
