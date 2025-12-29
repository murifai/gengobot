# Cloudflare R2 and CDN Setup Guide

This guide walks you through setting up Cloudflare R2 (object storage) and CDN for the Gengobot project.

## Table of Contents

1. [What is Cloudflare R2?](#what-is-cloudflare-r2)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create a Cloudflare Account](#step-1-create-a-cloudflare-account)
4. [Step 2: Create an R2 Bucket](#step-2-create-an-r2-bucket)
5. [Step 3: Generate R2 API Tokens](#step-3-generate-r2-api-tokens)
6. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
7. [Step 5: Set Up Public Access (Optional)](#step-5-set-up-public-access-optional)
8. [Step 6: Configure Custom Domain (Recommended)](#step-6-configure-custom-domain-recommended)
9. [Usage Examples](#usage-examples)
10. [Troubleshooting](#troubleshooting)

## What is Cloudflare R2?

Cloudflare R2 is an S3-compatible object storage service with:

- **Zero egress fees** - No charges for data transfer out
- **S3 compatibility** - Works with existing S3 tools and SDKs
- **Global CDN** - Automatic edge caching for fast delivery
- **Cost-effective** - $0.015/GB storage, no bandwidth charges

## Prerequisites

- A Cloudflare account (free or paid)
- Basic understanding of environment variables
- Access to your project's `.env.local` file

## Step 1: Create a Cloudflare Account

1. Go to [cloudflare.com](https://www.cloudflare.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address
4. Log in to your Cloudflare dashboard

## Step 2: Create an R2 Bucket

1. In the Cloudflare dashboard, click **R2** in the left sidebar
2. Click **Create bucket**
3. Enter a bucket name (e.g., `gengobot-assets`)
   - Use lowercase letters, numbers, and hyphens only
   - Must be unique across your account
4. Select a location hint (optional - closest to your users)
5. Click **Create bucket**

## Step 3: Generate R2 API Tokens

1. In the R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure the token:
   - **Token name**: `gengobot-r2-access`
   - **Permissions**: Select "Object Read & Write"
   - **Bucket scope**: Choose your bucket (e.g., `gengobot-assets`)
   - **TTL**: Leave default (no expiration) or set as needed
4. Click **Create API Token**
5. **IMPORTANT**: Copy and save these credentials (you won't see them again):
   - **Access Key ID**
   - **Secret Access Key**
6. Note your **Account ID** from the R2 dashboard URL (e.g., `https://dash.cloudflare.com/<account-id>/r2`)

## Step 4: Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Add the following variables with your actual credentials:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=gengobot-assets
R2_JURISDICTION=
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

3. Replace the placeholder values:
   - `R2_ACCOUNT_ID`: Your Cloudflare Account ID from Step 3
   - `R2_ACCESS_KEY_ID`: Access Key ID from Step 3
   - `R2_SECRET_ACCESS_KEY`: Secret Access Key from Step 3
   - `R2_BUCKET_NAME`: Your bucket name from Step 2
   - `R2_JURISDICTION`: (Optional) Set to `eu` or `apac` for jurisdiction-specific endpoint, leave empty for global
   - `R2_PUBLIC_URL`: Leave empty for now (will be set in Step 5)

4. Restart your development server to load the new variables

### Jurisdiction-Specific Endpoints

The system automatically constructs the correct endpoint based on your configuration:

- **Global (default)**: Leave `R2_JURISDICTION` empty → `https://<account-id>.r2.cloudflarestorage.com`
- **EU**: Set `R2_JURISDICTION=eu` → `https://<account-id>.eu.r2.cloudflarestorage.com`
- **APAC**: Set `R2_JURISDICTION=apac` → `https://<account-id>.apac.r2.cloudflarestorage.com`

## Step 5: Set Up Public Access (Optional)

By default, R2 buckets are private. To make files publicly accessible:

### Option A: Enable R2.dev Subdomain (Quick & Easy)

1. Go to your bucket in the R2 dashboard
2. Click the **Settings** tab
3. Under **Public access**, click **Allow Access**
4. Click **Enable R2.dev subdomain**
5. Copy the generated URL (e.g., `https://pub-xxx.r2.dev`)
6. Update `R2_PUBLIC_URL` in your `.env.local`:

```env
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

**Note**: R2.dev is free but not recommended for production (no custom domain, rate limits).

### Option B: Use Custom Domain (Recommended for Production)

See [Step 6](#step-6-configure-custom-domain-recommended) below.

## Step 6: Configure Custom Domain (Recommended)

Using a custom domain provides better branding, no rate limits, and full CDN benefits.

### Prerequisites

- A domain managed by Cloudflare DNS
- If your domain is not on Cloudflare, add it:
  1. In Cloudflare dashboard, click **Add site**
  2. Enter your domain and follow the setup wizard
  3. Update your domain's nameservers to Cloudflare's

### Setup Steps

1. In your R2 bucket settings, scroll to **Custom Domains**
2. Click **Connect Domain**
3. Enter your subdomain (e.g., `cdn.yourdomain.com`)
4. Click **Continue**
5. Cloudflare will automatically:
   - Create a CNAME record in your DNS
   - Issue a free SSL certificate
   - Enable CDN caching

6. Update your `.env.local`:

```env
R2_CUSTOM_DOMAIN=https://cdn.yourdomain.com
```

### CDN Caching Configuration (Optional)

1. Go to **Cloudflare Dashboard** > **Your Domain** > **Rules** > **Page Rules**
2. Create a new page rule for `cdn.yourdomain.com/*`:
   - **Cache Level**: Cache Everything
   - **Edge Cache TTL**: 1 month
   - **Browser Cache TTL**: 1 day
3. Save and deploy

## Usage Examples

### Upload a File from an API Route

```typescript
import { uploadFileToR2 } from '@/lib/storage/upload';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  const result = await uploadFileToR2(file, 'images');

  return Response.json({
    url: result.url,
    key: result.key,
    size: result.size,
  });
}
```

### Upload from Client-Side

```typescript
async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'profile-images');

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log('Uploaded to:', data.data.url);
}
```

### Delete a File

```typescript
import { deleteFromR2 } from '@/lib/storage/upload';

await deleteFromR2('images/1234567890-photo.jpg');
```

### Generate Custom File Keys

```typescript
import { generateFileKey, uploadToR2 } from '@/lib/storage/upload';

const key = generateFileKey('avatar.jpg', 'users/123', 'profile');
// Result: users/123/profile-1234567890-abc123-avatar.jpg

await uploadToR2({
  key,
  file: buffer,
  contentType: 'image/jpeg',
  metadata: {
    userId: '123',
    uploadedBy: 'user@example.com',
  },
});
```

## Troubleshooting

### "R2_ACCOUNT_ID is not set" Error

**Solution**: Make sure you've added all R2 variables to `.env.local` and restarted your dev server.

### "Access Denied" Error

**Solutions**:

1. Verify your API token has correct permissions (Object Read & Write)
2. Check that the token is scoped to the correct bucket
3. Ensure credentials in `.env.local` match those from Cloudflare

### Files Upload But Can't Access Them

**Solutions**:

1. Check if public access is enabled (Step 5)
2. Verify `R2_PUBLIC_URL` or `R2_CUSTOM_DOMAIN` is set correctly
3. If using custom domain, wait a few minutes for DNS propagation

### CORS Errors When Uploading from Browser

**Solution**: Add CORS policy to your bucket:

1. Go to R2 bucket settings
2. Scroll to **CORS policy**
3. Add this configuration:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### Slow Upload Speeds

**Solutions**:

1. Enable custom domain with CDN (Step 6)
2. Use multipart uploads for files >5MB (already handled by `@aws-sdk/lib-storage`)
3. Check your internet connection

## Cost Estimate

Cloudflare R2 pricing (as of 2024):

- **Storage**: $0.015/GB per month
- **Class A operations** (writes): $4.50 per million requests
- **Class B operations** (reads): $0.36 per million requests
- **Egress**: **FREE** (no data transfer charges)

Example monthly cost for 100GB storage + 1M reads + 100K writes:

- Storage: 100GB × $0.015 = $1.50
- Reads: 1M × $0.36/1M = $0.36
- Writes: 100K × $4.50/1M = $0.45
- **Total**: ~$2.31/month

R2 includes 10GB storage and 1M Class A operations free per month.

## Next Steps

1. Test the upload functionality using the `/api/upload` endpoint
2. Integrate image uploads into your application forms
3. Set up automated backups of important files
4. Configure cache rules for optimal CDN performance
5. Monitor usage in Cloudflare dashboard

## Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3 (S3)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Custom Domains Guide](https://developers.cloudflare.com/r2/buckets/public-buckets/#custom-domains)
