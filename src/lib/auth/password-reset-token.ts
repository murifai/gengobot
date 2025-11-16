/**
 * Password Reset Token Utilities
 * Handles generation, validation, and cleanup of password reset tokens
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const TOKEN_EXPIRY_HOURS = 1; // Password reset tokens expire in 1 hour for security

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a password reset token for an email address
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  // Generate new token
  const token = generateToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + TOKEN_EXPIRY_HOURS);

  // Save to database
  await prisma.passwordResetToken.create({
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
 * Returns null if token is invalid, expired, or already used
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return null;
  }

  // Check if token is expired
  if (resetToken.expires < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { token },
    });
    return null;
  }

  // Check if already used
  if (resetToken.usedAt) {
    return null;
  }

  return resetToken.email;
}

/**
 * Mark a token as used
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}

/**
 * Delete password reset token after use
 */
export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.delete({
    where: { token },
  });
}

/**
 * Clean up expired tokens (should be run periodically)
 */
export async function cleanupExpiredResetTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * Check if an email has a pending password reset token
 */
export async function hasPendingPasswordReset(email: string): Promise<boolean> {
  const token = await prisma.passwordResetToken.findFirst({
    where: {
      email,
      expires: {
        gt: new Date(),
      },
      usedAt: null,
    },
  });

  return token !== null;
}
