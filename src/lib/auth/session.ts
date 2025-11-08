import { auth } from './auth';
import { prisma } from '@/lib/prisma';

/**
 * Get the current session in API routes
 */
export async function getSession() {
  return await auth();
}

/**
 * Get current user from session for API routes
 */
export async function getCurrentSessionUser() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

/**
 * Get current user with full database details for API routes
 */
export async function getCurrentUserFromSession() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require admin - throws if not admin
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Forbidden');
  }
  return session.user;
}
