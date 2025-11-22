import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { UsageType } from '@prisma/client';
import { creditService } from './credit-service';
import { CreditCheck } from './credit-config';

/**
 * Middleware to check credits before allowing API route access
 */
export async function withCreditCheck(
  request: NextRequest,
  usageType: UsageType,
  estimatedUnits: number = 1
): Promise<{ allowed: boolean; response?: NextResponse; creditCheck?: CreditCheck }> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      allowed: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const creditCheck = await creditService.checkCredits(session.user.id, usageType, estimatedUnits);

  if (!creditCheck.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Insufficient credits',
          message: creditCheck.reason,
          creditsRequired: creditCheck.creditsRequired,
          creditsAvailable: creditCheck.creditsAvailable,
          isTrialUser: creditCheck.isTrialUser,
          trialDaysRemaining: creditCheck.trialDaysRemaining,
        },
        { status: 402 } // Payment Required
      ),
      creditCheck,
    };
  }

  return { allowed: true, creditCheck };
}

/**
 * Higher-order function to wrap API handlers with credit checking
 */
export function createCreditGuardedHandler(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string> }
  ) => Promise<NextResponse>,
  usageType: UsageType,
  getEstimatedUnits?: (request: NextRequest) => Promise<number> | number
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const estimatedUnits = getEstimatedUnits ? await getEstimatedUnits(request) : 1;

    const { allowed, response, creditCheck } = await withCreditCheck(
      request,
      usageType,
      estimatedUnits
    );

    if (!allowed) {
      return response!;
    }

    // Add credit check info to request headers for the handler
    const modifiedRequest = new NextRequest(request.url, {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
    });

    modifiedRequest.headers.set('x-credit-check', JSON.stringify(creditCheck));

    return handler(modifiedRequest, context);
  };
}

/**
 * Record usage after successful API call
 */
export async function recordUsage(
  userId: string,
  usageType: UsageType,
  actualUnits: number,
  referenceId?: string,
  referenceType?: string
): Promise<void> {
  await creditService.deductCredits(userId, usageType, actualUnits, referenceId, referenceType);
}

/**
 * Type for usage check results in client components
 */
export interface UsageCheckResult {
  canUse: boolean;
  remaining: number;
  message?: string;
  isTrialUser: boolean;
  trialDaysRemaining?: number;
}

/**
 * Check usage for a specific type (for client-side use via API)
 */
export async function checkUsage(
  userId: string,
  usageType: UsageType,
  units: number = 1
): Promise<UsageCheckResult> {
  const creditCheck = await creditService.checkCredits(userId, usageType, units);

  return {
    canUse: creditCheck.allowed,
    remaining: creditCheck.creditsAvailable,
    message: creditCheck.reason,
    isTrialUser: creditCheck.isTrialUser,
    trialDaysRemaining: creditCheck.trialDaysRemaining,
  };
}
