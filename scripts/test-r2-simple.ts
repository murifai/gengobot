/**
 * Simple R2 connection test - minimal S3 client setup
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

async function testR2Simple() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  console.log('🔍 Simple R2 Test\n');
  console.log('Config:');
  console.log(`  Endpoint: https://${accountId}.r2.cloudflarestorage.com`);
  console.log(`  Bucket: ${bucketName}`);
  console.log(`  Access Key: ${accessKeyId?.substring(0, 10)}...`);
  console.log('');

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });

  console.log('Testing bucket access with HeadBucket command...\n');

  try {
    const command = new HeadBucketCommand({
      Bucket: bucketName,
    });

    const response = await client.send(command);

    console.log('✅ SUCCESS! Bucket is accessible!');
    console.log('Response:', response);
    console.log('\nYour R2 configuration is working correctly!');
    console.log('You can now upload files to R2.');
  } catch (error: any) {
    console.log('❌ FAILED!');
    console.log('Error Code:', error.name);
    console.log('Error Message:', error.message);
    console.log('');

    if (error.name === 'AccessDenied') {
      console.log('📋 Access Denied - Possible causes:');
      console.log('');
      console.log('1. Token Scope Issue:');
      console.log(`   - Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens`);
      console.log(`   - Find your token and check if it's scoped to "${bucketName}"`);
      console.log(`   - Token might be scoped to a different bucket`);
      console.log('');
      console.log('2. Wrong Credentials:');
      console.log('   - You might have copied Account API Token instead of R2 API Token');
      console.log("   - The credentials should be from 'R2 API Tokens' section (top)");
      console.log("   - NOT from 'User API Tokens' section (bottom)");
      console.log('');
      console.log('3. Bucket Name Mismatch:');
      console.log(`   - Verify in Cloudflare R2 that bucket is named exactly: "${bucketName}"`);
      console.log('   - Bucket names are case-sensitive');
      console.log('');
      console.log('💡 Try this:');
      console.log('   1. Delete the existing R2 API token');
      console.log('   2. Create a NEW R2 API token with:');
      console.log('      - Permission: Object Read & Write');
      console.log(`      - Scope: Apply to bucket "${bucketName}" OR "All buckets"`);
      console.log('   3. Copy the new credentials immediately');
      console.log('   4. Update .env.local and run this test again');
    }
  }
}

testR2Simple();
