import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, R2_BUCKET_NAME, getPublicUrl } from './r2-client';

export interface UploadOptions {
  key: string;
  file: Buffer | Uint8Array | Blob;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(options: UploadOptions): Promise<UploadResult> {
  const { key, file, contentType, metadata } = options;

  let buffer: Buffer;
  let size: number;

  if (file instanceof Buffer) {
    buffer = file;
    size = file.length;
  } else if (file instanceof Uint8Array) {
    buffer = Buffer.from(file);
    size = file.length;
  } else if (file instanceof Blob) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    size = file.size;
  } else {
    throw new Error('Unsupported file type');
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType || 'application/octet-stream',
    Metadata: metadata,
  });

  await getR2Client().send(command);

  return {
    key,
    url: getPublicUrl(key),
    size,
  };
}

/**
 * Upload a file from a File or Blob (browser environment)
 */
export async function uploadFileToR2(file: File, folder?: string): Promise<UploadResult> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = folder ? `${folder}/${timestamp}-${sanitizedName}` : `${timestamp}-${sanitizedName}`;

  return uploadToR2({
    key,
    file,
    contentType: file.type,
    metadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await getR2Client().send(command);
}

/**
 * Generate a unique key for a file
 */
export function generateFileKey(filename: string, folder?: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = prefix
    ? `${prefix}-${timestamp}-${random}-${sanitizedName}`
    : `${timestamp}-${random}-${sanitizedName}`;

  return folder ? `${folder}/${uniqueName}` : uniqueName;
}
