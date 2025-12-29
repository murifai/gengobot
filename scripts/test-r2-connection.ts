/**
 * Test script to verify Cloudflare R2 connection
 * Run with: npx tsx scripts/test-r2-connection.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { uploadToR2, deleteFromR2 } from '../src/lib/storage/upload';
import { getPublicUrl } from '../src/lib/storage/r2-client';

async function testR2Connection() {
  console.log('🧪 Testing Cloudflare R2 Connection...\n');

  try {
    // Step 1: Verify environment variables
    console.log('1️⃣ Checking environment variables...');
    const requiredVars = [
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
    ];

    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    console.log('   ✅ Account ID:', process.env.R2_ACCOUNT_ID);
    console.log('   ✅ Access Key ID:', process.env.R2_ACCESS_KEY_ID?.substring(0, 10) + '...');
    console.log('   ✅ Bucket Name:', process.env.R2_BUCKET_NAME);
    console.log('   ✅ Jurisdiction:', process.env.R2_JURISDICTION || 'global');
    console.log('');

    // Step 2: Create test file
    console.log('2️⃣ Creating test file...');
    const testContent = `R2 Connection Test
Timestamp: ${new Date().toISOString()}
Account ID: ${process.env.R2_ACCOUNT_ID}
Bucket: ${process.env.R2_BUCKET_NAME}
`;
    const testBuffer = Buffer.from(testContent, 'utf-8');
    const testKey = `test/connection-test-${Date.now()}.txt`;
    console.log('   📄 Test file key:', testKey);
    console.log('');

    // Step 3: Upload test file
    console.log('3️⃣ Uploading test file to R2...');
    const uploadResult = await uploadToR2({
      key: testKey,
      file: testBuffer,
      contentType: 'text/plain',
      metadata: {
        purpose: 'connection-test',
        timestamp: new Date().toISOString(),
      },
    });

    console.log('   ✅ Upload successful!');
    console.log('   📦 Key:', uploadResult.key);
    console.log('   📊 Size:', uploadResult.size, 'bytes');
    console.log('');

    // Step 4: Get public URL
    console.log('4️⃣ Generating public URL...');
    try {
      const publicUrl = getPublicUrl(testKey);
      console.log('   ✅ Public URL:', publicUrl);
      console.log('');
      console.log("   ℹ️  Note: If you haven't enabled public access,");
      console.log("      you won't be able to access this URL in a browser.");
      console.log('      See docs/cloudflare-r2-setup.md for instructions.');
    } catch (error) {
      console.log('   ⚠️  Public URL not configured');
      console.log('      Set R2_PUBLIC_URL or R2_CUSTOM_DOMAIN to enable public access');
    }
    console.log('');

    // Step 5: Clean up test file
    console.log('5️⃣ Cleaning up test file...');
    await deleteFromR2(testKey);
    console.log('   ✅ Test file deleted');
    console.log('');

    // Success
    console.log('🎉 SUCCESS! R2 connection is working correctly!\n');
    console.log('Next steps:');
    console.log('1. Enable public access (R2.dev subdomain or custom domain)');
    console.log('2. Set R2_PUBLIC_URL or R2_CUSTOM_DOMAIN in .env.local');
    console.log('3. Start uploading files using the /api/upload endpoint');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR: R2 connection test failed\n');

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('\nStack trace:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }

    console.error('\n📖 Troubleshooting:');
    console.error('1. Check that all R2 environment variables are set in .env.local');
    console.error("2. Verify your API token has 'Object Read & Write' permissions");
    console.error('3. Ensure the token is scoped to the correct bucket');
    console.error('4. Check that your Account ID is correct');
    console.error('5. See docs/cloudflare-r2-setup.md for detailed setup instructions');
    console.error('');

    process.exit(1);
  }
}

// Run the test
testR2Connection();
