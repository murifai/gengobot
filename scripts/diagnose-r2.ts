/**
 * Diagnostic script for R2 connection issues
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '../src/lib/storage/r2-client';

async function diagnoseR2() {
  console.log('🔍 R2 Connection Diagnostics\n');

  console.log('Environment Variables:');
  console.log('  Account ID:', process.env.R2_ACCOUNT_ID);
  console.log('  Access Key:', process.env.R2_ACCESS_KEY_ID?.substring(0, 20) + '...');
  console.log('  Bucket Name:', process.env.R2_BUCKET_NAME);
  console.log('  Endpoint:', `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
  console.log('');

  // Try to list buckets (requires admin permissions)
  console.log('Attempting to list buckets...');
  try {
    const client = getR2Client();
    const command = new ListBucketsCommand({});
    const response = await client.send(command);

    console.log('✅ Successfully connected to R2!');
    console.log('Available buckets:');
    response.Buckets?.forEach(bucket => {
      console.log(`  - ${bucket.Name}`);
    });
    console.log('');

    if (response.Buckets?.some(b => b.Name === process.env.R2_BUCKET_NAME)) {
      console.log(`✅ Bucket '${process.env.R2_BUCKET_NAME}' exists and is accessible`);
    } else {
      console.log(`⚠️  Bucket '${process.env.R2_BUCKET_NAME}' not found in accessible buckets`);
      console.log('   This might be a scope issue with your R2 API token.');
    }
  } catch (error: any) {
    console.log('❌ Failed to list buckets');
    console.log('Error:', error.message);
    console.log('');
    console.log('This is expected if your token is scoped to a specific bucket.');
    console.log("Let's try a different approach...");
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('💡 Troubleshooting Checklist:');
  console.log('');
  console.log('1. ✓ Check Token Scope in Cloudflare Dashboard:');
  console.log(`   Go to R2 > Manage R2 API Tokens > gengobot-app`);
  console.log(`   Verify it's scoped to: '${process.env.R2_BUCKET_NAME}' OR 'All buckets'`);
  console.log('');
  console.log('2. ✓ Verify Bucket Name:');
  console.log(
    `   In Cloudflare R2 dashboard, confirm bucket is named exactly: '${process.env.R2_BUCKET_NAME}'`
  );
  console.log('   (case-sensitive!)');
  console.log('');
  console.log('3. ✓ Check Token Permissions:');
  console.log("   Token must have: 'Object Read & Write' permission");
  console.log('');
  console.log('4. ✓ Try Creating a New Token:');
  console.log('   Sometimes tokens get corrupted during creation.');
  console.log('   Delete the old token and create a fresh one.');
  console.log('');
}

diagnoseR2();
