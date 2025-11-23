import 'server-only';
import type { AdminRole } from '@prisma/client';
import { getAdminSession } from './admin-auth';
import { hasPermission, hasAllPermissions, hasAnyPermission, type Permission } from './admin-rbac';

// Check permission for current admin session
export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await getAdminSession();

  if (!session) {
    return false;
  }

  return hasPermission(session.role, permission);
}

// Check multiple permissions for current admin session
export async function checkPermissions(
  permissions: Permission[],
  requireAll: boolean = false
): Promise<boolean> {
  const session = await getAdminSession();

  if (!session) {
    return false;
  }

  if (requireAll) {
    return hasAllPermissions(session.role, permissions);
  }

  return hasAnyPermission(session.role, permissions);
}

// Check if current admin can manage target admin
export async function canManageAdmin(targetRole: AdminRole): Promise<boolean> {
  const session = await getAdminSession();

  if (!session) {
    return false;
  }

  // Only SUPER_ADMIN can manage admins
  if (session.role !== 'SUPER_ADMIN') {
    return false;
  }

  return true;
}

// Permission guard for API routes
export async function requirePermission(
  permission: Permission
): Promise<{ success: true } | { success: false; error: string; status: number }> {
  const session = await getAdminSession();

  if (!session) {
    return {
      success: false,
      error: 'Unauthorized',
      status: 401,
    };
  }

  if (!hasPermission(session.role, permission)) {
    return {
      success: false,
      error: 'Forbidden',
      status: 403,
    };
  }

  return { success: true };
}

// Permission guard for multiple permissions
export async function requirePermissions(
  permissions: Permission[],
  requireAll: boolean = false
): Promise<{ success: true } | { success: false; error: string; status: number }> {
  const session = await getAdminSession();

  if (!session) {
    return {
      success: false,
      error: 'Unauthorized',
      status: 401,
    };
  }

  const hasRequired = requireAll
    ? hasAllPermissions(session.role, permissions)
    : hasAnyPermission(session.role, permissions);

  if (!hasRequired) {
    return {
      success: false,
      error: 'Forbidden',
      status: 403,
    };
  }

  return { success: true };
}
