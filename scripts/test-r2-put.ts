/**
 * Test R2 upload with direct PutObjectCommand
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function testPutObject() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  console.log('🧪 Testing R2 Upload (PutObject)\n');

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });

  const testKey = `test/put-test-${Date.now()}.txt`;
  const testContent = 'Hello from R2!';

  console.log(`Uploading file: ${testKey}`);
  console.log(`To bucket: ${bucketName}\n`);

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    });

    const response = await client.send(command);

    console.log('✅ SUCCESS! File uploaded successfully!');
    console.log('Response:', response);
    console.log('\n🎉 Your R2 token has WRITE permission!');
    console.log(`\nFile location: ${testKey}`);
  } catch (error: any) {
    console.log('❌ Upload failed!');
    console.log('Error:', error.name, '-', error.message);
    console.log('');

    if (error.name === 'AccessDenied') {
      console.log('⚠️  YOUR TOKEN DOES NOT HAVE WRITE PERMISSION\n');
      console.log('Your token can READ the bucket but cannot WRITE to it.');
      console.log('');
      console.log('To fix this:');
      console.log('1. Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens');
      console.log('2. Delete your current token');
      console.log('3. Create a new token with:');
      console.log("   ✓ Permission: 'Object Read & Write' (not just 'Read')");
      console.log(`   ✓ Bucket: '${bucketName}' or 'All buckets'`);
      console.log('4. Copy the new credentials');
      console.log('5. Update your .env.local file');
      console.log('');
      console.log("Make absolutely sure you select 'Object Read & Write'!");
    }
  }
}

testPutObject();
