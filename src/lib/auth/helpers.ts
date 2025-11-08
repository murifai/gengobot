import { auth } from './auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Get the current user session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

/**
 * Get the current user from database with full details
 */
export async function getCurrentUserFromDB() {
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
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.isAdmin === true;
}

/**
 * Create a new user with hashed password
 */
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  isAdmin?: boolean;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      isAdmin: data.isAdmin || false,
    },
  });

  return user;
}

/**
 * Verify user credentials
 */
export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }

  return user;
}
