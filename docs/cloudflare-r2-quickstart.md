# Cloudflare R2 Quick Start

Get up and running with Cloudflare R2 in 5 minutes.

## Quick Setup Checklist

- [ ] Create Cloudflare account
- [ ] Create R2 bucket
- [ ] Generate API tokens
- [ ] Add credentials to `.env.local`
- [ ] Enable public access or custom domain
- [ ] Test upload

## 1. Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2**
2. Click **Create bucket**
3. Name it `gengobot-assets` (or your preference)
4. Click **Create bucket**

## 2. Get API Credentials

1. Click **Manage R2 API Tokens**
2. Click **Create API token**
3. Set:
   - Name: `gengobot-r2-access`
   - Permissions: **Object Read & Write**
   - Bucket: `gengobot-assets`
4. Click **Create API Token**
5. **Copy these values** (you won't see them again):
   - Access Key ID
   - Secret Access Key
6. **Note your Account ID** from the R2 dashboard URL

## 3. Configure Environment

Add to your `.env.local`:

```env
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=gengobot-assets
R2_JURISDICTION=
```

**Jurisdiction-specific endpoints:**

- Leave `R2_JURISDICTION` empty for global endpoint
- Set `R2_JURISDICTION=eu` for EU endpoint
- Set `R2_JURISDICTION=apac` for APAC endpoint

## 4. Enable Public Access (Choose One)

### Option A: R2.dev Subdomain (Quick)

1. In bucket settings → **Public access** → **Allow Access**
2. Click **Enable R2.dev subdomain**
3. Copy the URL (e.g., `https://pub-xxx.r2.dev`)
4. Add to `.env.local`:

```env
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### Option B: Custom Domain (Recommended)

1. In bucket settings → **Custom Domains** → **Connect Domain**
2. Enter subdomain (e.g., `cdn.yourdomain.com`)
3. Add to `.env.local`:

```env
R2_CUSTOM_DOMAIN=https://cdn.yourdomain.com
```

## 5. Restart Dev Server

```bash
npm run dev
```

## 6. Test Upload

### Using the API endpoint:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/image.jpg" \
  -F "folder=test"
```

### Using the component:

```tsx
import { FileUpload } from '@/components/upload/FileUpload';

export default function TestPage() {
  return (
    <FileUpload
      folder="test-uploads"
      onUploadComplete={(url, key) => {
        console.log('Uploaded:', url);
      }}
    />
  );
}
```

## Common Issues

### "R2_ACCOUNT_ID is not set"

→ Did you restart the dev server after adding env vars?
→ Make sure you copied the Account ID from the Cloudflare dashboard

### "Access Denied"

→ Check API token permissions include Object Read & Write

### Files upload but 404 when accessing

→ Enable public access (Step 4)

## Next Steps

- Read the [full setup guide](./cloudflare-r2-setup.md) for advanced configuration
- Configure CORS for browser uploads
- Set up custom CDN caching rules
- Implement image optimization

## Cost

Free tier includes:

- 10 GB storage
- 1 million Class A operations/month

After that:

- Storage: $0.015/GB/month
- Reads: $0.36/million requests
- **Egress: FREE** (unlimited bandwidth)

For most apps, expect ~$1-3/month.

## Support

- [Full Documentation](./cloudflare-r2-setup.md)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Troubleshooting Guide](./cloudflare-r2-setup.md#troubleshooting)
