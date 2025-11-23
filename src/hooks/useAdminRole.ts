'use client';

import { useMemo } from 'react';
import type { AdminRole } from '@prisma/client';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  isRoleHigherOrEqual,
  type Permission,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
} from '@/lib/auth/admin-rbac';

interface UseAdminRoleReturn {
  // Permission checks
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;

  // Role checks
  isRole: (role: AdminRole) => boolean;
  isAtLeast: (role: AdminRole) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isViewer: boolean;

  // Role info
  permissions: Permission[];
  displayName: string;
  description: string;
}

export function useAdminRole(role: AdminRole): UseAdminRoleReturn {
  return useMemo(
    () => ({
      // Permission checks
      can: (permission: Permission) => hasPermission(role, permission),
      canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
      canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),

      // Role checks
      isRole: (targetRole: AdminRole) => role === targetRole,
      isAtLeast: (targetRole: AdminRole) => isRoleHigherOrEqual(role, targetRole),
      isSuperAdmin: role === 'SUPER_ADMIN',
      isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
      isViewer: role === 'VIEWER',

      // Role info
      permissions: getPermissions(role),
      displayName: ROLE_DISPLAY_NAMES[role],
      description: ROLE_DESCRIPTIONS[role],
    }),
    [role]
  );
}

// Context-based hook for components that need admin data
export interface AdminContextValue {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

// Export types
export type { Permission };
