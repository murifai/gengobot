import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

/**
 * Check if the current user is an admin by checking the Admin table
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.email) {
    return false;
  }

  // Check if user exists in Admin table
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  });

  return !!admin;
}

/**
 * Check if a specific email is an admin
 */
export async function isEmailAdmin(email: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  return !!admin;
}

/**
 * Get current user with admin status
 */
export async function getCurrentUserWithRole() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      proficiency: true,
    },
  });

  if (!dbUser) {
    return null;
  }

  // Check if this user is also an admin
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  });

  return {
    ...dbUser,
    isAdmin: !!admin,
  };
}
