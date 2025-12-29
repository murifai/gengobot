import { S3Client } from '@aws-sdk/client-s3';

// Construct endpoint based on account ID
// Default to global endpoint, or use jurisdiction-specific if provided
const getR2Endpoint = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId) {
    throw new Error('R2_ACCOUNT_ID is not set');
  }

  const jurisdiction = process.env.R2_JURISDICTION; // optional: 'eu', 'apac'

  if (jurisdiction) {
    return `https://${accountId}.${jurisdiction}.r2.cloudflarestorage.com`;
  }

  return `https://${accountId}.r2.cloudflarestorage.com`;
};

// Lazy initialization of R2 client
let _r2Client: S3Client | null = null;

export const getR2Client = (): S3Client => {
  if (!_r2Client) {
    if (!process.env.R2_ACCESS_KEY_ID) {
      throw new Error('R2_ACCESS_KEY_ID is not set');
    }

    if (!process.env.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2_SECRET_ACCESS_KEY is not set');
    }

    _r2Client = new S3Client({
      region: 'auto',
      endpoint: getR2Endpoint(),
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return _r2Client;
};

// For backwards compatibility
export const r2Client = new Proxy({} as S3Client, {
  get(_, prop: string | symbol) {
    const client = getR2Client() as unknown as Record<string | symbol, unknown>;
    return client[prop];
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'gengobot-assets';

export function getPublicUrl(key: string): string {
  const customDomain = process.env.R2_CUSTOM_DOMAIN;
  if (customDomain) {
    return `${customDomain}/${key}`;
  }

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${key}`;
  }

  throw new Error('Either R2_CUSTOM_DOMAIN or R2_PUBLIC_URL must be set for public file access');
}
