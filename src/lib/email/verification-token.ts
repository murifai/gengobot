/**
 * Email Verification Token Utilities
 * Handles generation, validation, and cleanup of email verification tokens
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TOKEN_EXPIRY_HOURS = 24;

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a verification token for an email address
 */
export async function createVerificationToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.emailVerificationToken.deleteMany({
    where: { email },
  });

  // Generate new token
  const token = generateToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + TOKEN_EXPIRY_HOURS);

  // Save to database
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify a token and return the associated email
 * Returns null if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null;
  }

  // Check if token is expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.emailVerificationToken.delete({
      where: { token },
    });
    return null;
  }

  // Check if already verified
  if (verificationToken.verifiedAt) {
    return null;
  }

  return verificationToken.email;
}

/**
 * Mark a token as verified
 */
export async function markTokenAsVerified(token: string): Promise<void> {
  await prisma.emailVerificationToken.update({
    where: { token },
    data: { verifiedAt: new Date() },
  });
}

/**
 * Delete verification token after use
 */
export async function deleteVerificationToken(token: string): Promise<void> {
  await prisma.emailVerificationToken.delete({
    where: { token },
  });
}

/**
 * Clean up expired tokens (should be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.emailVerificationToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * Check if an email has a pending verification token
 */
export async function hasPendingVerification(email: string): Promise<boolean> {
  const token = await prisma.emailVerificationToken.findFirst({
    where: {
      email,
      expires: {
        gt: new Date(),
      },
      verifiedAt: null,
    },
  });

  return token !== null;
}
