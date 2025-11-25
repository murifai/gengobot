// API Route: Deduct credits for realtime session usage
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { creditService } from '@/lib/subscription';

export const runtime = 'nodejs';

/**
 * POST /api/realtime/deduct-credits
 * Deduct credits after a realtime session ends
 *
 * Expected body:
 * {
 *   audioInputTokens: number;   // Total audio input tokens used
 *   audioOutputTokens: number;  // Total audio output tokens used
 *   textInputTokens?: number;   // Optional text input tokens
 *   textOutputTokens?: number;  // Optional text output tokens
 *   sessionDurationSeconds?: number; // Optional session duration for logging
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check user authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      audioInputTokens = 0,
      audioOutputTokens = 0,
      textInputTokens = 0,
      textOutputTokens = 0,
      sessionDurationSeconds = 0,
    } = body;

    // Validate that we have some usage data
    if (
      audioInputTokens === 0 &&
      audioOutputTokens === 0 &&
      textInputTokens === 0 &&
      textOutputTokens === 0
    ) {
      console.log('[Realtime Credits] No usage to deduct');
      return NextResponse.json({
        success: true,
        credits: 0,
        usdCost: 0,
        message: 'No usage to deduct',
      });
    }

    // Deduct credits based on actual realtime usage
    const creditResult = await creditService.deductCreditsFromUsage(
      session.user.id,
      {
        model: 'gpt-4o-realtime-preview',
        audioInputTokens,
        audioOutputTokens,
        inputTokens: textInputTokens,
        outputTokens: textOutputTokens,
      },
      undefined, // referenceId
      'realtime_session',
      'Realtime voice conversation'
    );

    console.log('[Realtime Credits] Deduction completed:', {
      userId: session.user.id,
      sessionDurationSeconds,
      audioInputTokens,
      audioOutputTokens,
      textInputTokens,
      textOutputTokens,
      creditsDeducted: creditResult.credits,
      usdCost: creditResult.usdCost,
    });

    return NextResponse.json({
      success: true,
      credits: creditResult.credits,
      usdCost: creditResult.usdCost,
    });
  } catch (error) {
    console.error('[Realtime Credits] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deduct credits',
      },
      { status: 500 }
    );
  }
}
