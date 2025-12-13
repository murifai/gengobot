import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Admin, AdminRole } from '@prisma/client';

// Session cookie name
const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Admin session data structure
export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create admin session
export async function createAdminSession(admin: Admin): Promise<string> {
  const sessionData: AdminSession = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };

  // Encode session data as base64
  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  // Update last login
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  return sessionToken;
}

// Get current admin session
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    console.log('getAdminSession - cookie name:', ADMIN_SESSION_COOKIE);
    console.log('getAdminSession - sessionToken exists:', !!sessionToken);

    if (!sessionToken) {
      return null;
    }

    // Decode session data
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    ) as AdminSession;

    // Verify admin still exists and is active
    const admin = await prisma.admin.findUnique({
      where: { id: sessionData.id },
      select: { id: true, isActive: true, role: true },
    });

    if (!admin || !admin.isActive) {
      // Clear invalid session
      await destroyAdminSession();
      return null;
    }

    // Update role if changed
    if (admin.role !== sessionData.role) {
      sessionData.role = admin.role;
    }

    return sessionData;
  } catch {
    return null;
  }
}

// Destroy admin session (logout)
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

// Authenticate admin with email/password
export async function authenticateAdmin(email: string, password: string): Promise<Admin | null> {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!admin || !admin.isActive) {
    return null;
  }

  const isValid = await verifyPassword(password, admin.password);

  if (!isValid) {
    return null;
  }

  return admin;
}

// Generate password reset token
export async function generateResetToken(email: string): Promise<string | null> {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!admin || !admin.isActive) {
    return null;
  }

  // Generate random token
  const token = crypto.randomUUID();
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });

  return token;
}

// Verify and use reset token
export async function verifyResetToken(token: string): Promise<Admin | null> {
  const admin = await prisma.admin.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  return admin;
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const admin = await verifyResetToken(token);

  if (!admin) {
    return false;
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return true;
}

// Change password (for logged-in admin)
export async function changePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  });

  if (!admin) {
    return false;
  }

  const isValid = await verifyPassword(currentPassword, admin.password);

  if (!isValid) {
    return false;
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.admin.update({
    where: { id: adminId },
    data: { password: hashedPassword },
  });

  return true;
}

// Get admin by ID
export async function getAdminById(id: string): Promise<Admin | null> {
  return prisma.admin.findUnique({
    where: { id },
  });
}

// Get admin by email
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  return prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });
}
