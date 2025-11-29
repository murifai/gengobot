import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { midtransService } from '@/lib/payment';

/**
 * GET /api/debug/midtrans-config
 * Debug endpoint to check Midtrans configuration (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only allow admin users
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const envInfo = midtransService.getEnvironmentInfo();
    const clientKey = midtransService.getClientKey();

    return NextResponse.json({
      environment: {
        MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION,
        isProduction: envInfo.isProduction,
        hasServerKey: envInfo.hasServerKey,
        hasClientKey: envInfo.hasClientKey,
        clientKeyPrefix: clientKey?.substring(0, 15) + '...',
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      },
      expectedBehavior: {
        shouldUse: envInfo.isProduction ? 'Production keys' : 'Sandbox keys',
        webhookShouldReceive: envInfo.isProduction
          ? 'Notifications from Midtrans Production'
          : 'Notifications from Midtrans Sandbox',
      },
      troubleshooting: [
        'Check Midtrans Dashboard → Settings → Configuration → Payment Notification URL',
        `It should be: ${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/midtrans`,
        'Make sure the server key matches the one in Midtrans Dashboard',
        envInfo.isProduction
          ? 'You are using PRODUCTION - keys should start with "Mid-"'
          : 'You are using SANDBOX - keys should start with "SB-Mid-"',
      ],
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Failed to get config' }, { status: 500 });
  }
}
