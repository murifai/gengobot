import { prisma } from '@/lib/prisma';

export interface TrialEligibility {
  eligible: boolean;
  reason?: string;
  previousTrialDate?: Date;
  wasUpgraded?: boolean;
}

/**
 * Check if an email is eligible for trial
 * Returns false if the email has already used a trial
 */
export async function checkTrialEligibility(email: string): Promise<TrialEligibility> {
  const history = await prisma.trialHistory.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!history) {
    return { eligible: true };
  }

  // If user previously upgraded to paid, they're not abusing - but still no new trial
  if (history.wasUpgraded) {
    return {
      eligible: false,
      reason: 'Email ini sudah pernah berlangganan. Silakan pilih paket berbayar.',
      previousTrialDate: history.trialStartedAt,
      wasUpgraded: true,
    };
  }

  return {
    eligible: false,
    reason:
      'Email ini sudah pernah menggunakan trial. Silakan gunakan email lain atau pilih paket berbayar.',
    previousTrialDate: history.trialStartedAt,
    wasUpgraded: false,
  };
}

/**
 * Record when a user starts their trial
 */
export async function recordTrialStart(userId: string, email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();

  await prisma.trialHistory.upsert({
    where: { email: normalizedEmail },
    create: {
      userId,
      email: normalizedEmail,
      trialStartedAt: new Date(),
      hasUsedTrial: true,
    },
    update: {
      userId,
      trialStartedAt: new Date(),
      hasUsedTrial: true,
    },
  });
}

/**
 * Update trial history when user upgrades to paid subscription
 */
export async function recordTrialUpgrade(userId: string): Promise<void> {
  await prisma.trialHistory.updateMany({
    where: { userId },
    data: {
      wasUpgraded: true,
      trialEndedAt: new Date(),
    },
  });
}

/**
 * Update trial credits used in history
 */
export async function updateTrialCreditsUsed(userId: string, creditsUsed: number): Promise<void> {
  await prisma.trialHistory.updateMany({
    where: { userId },
    data: {
      trialCreditsUsed: creditsUsed,
    },
  });
}

/**
 * Record when trial ends (either expired or user deleted account)
 */
export async function recordTrialEnd(userId: string): Promise<void> {
  await prisma.trialHistory.updateMany({
    where: { userId },
    data: {
      trialEndedAt: new Date(),
    },
  });
}

/**
 * Disconnect user from trial history when account is deleted
 * The history record remains for anti-abuse purposes
 */
export async function disconnectUserFromTrialHistory(userId: string): Promise<void> {
  await prisma.trialHistory.updateMany({
    where: { userId },
    data: {
      userId: null,
      trialEndedAt: new Date(),
    },
  });
}
