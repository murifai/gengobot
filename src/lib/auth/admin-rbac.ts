import type { AdminRole } from '@prisma/client';

// Permission definitions
export type Permission =
  // Dashboard
  | 'dashboard.view'
  // Statistics
  | 'statistik.view'
  | 'statistik.export'
  // Users
  | 'pengguna.view'
  // Roleplay
  | 'tasks.view'
  | 'tasks.create'
  | 'tasks.edit'
  | 'tasks.delete'
  | 'categories.view'
  | 'categories.manage'
  // Decks
  | 'decks.view'
  | 'decks.create'
  | 'decks.edit'
  | 'decks.delete'
  // Subscription
  | 'subscription.view'
  | 'subscription.manage'
  | 'vouchers.view'
  | 'vouchers.manage'
  // Admin Management
  | 'admins.view'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.delete'
  // Settings
  | 'settings.view'
  | 'settings.manage';

// Permission matrix by role
const PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    // Has all permissions
    'dashboard.view',
    'statistik.view',
    'statistik.export',
    'pengguna.view',
    'tasks.view',
    'tasks.create',
    'tasks.edit',
    'tasks.delete',
    'categories.view',
    'categories.manage',
    'decks.view',
    'decks.create',
    'decks.edit',
    'decks.delete',
    'subscription.view',
    'subscription.manage',
    'vouchers.view',
    'vouchers.manage',
    'admins.view',
    'admins.create',
    'admins.edit',
    'admins.delete',
    'settings.view',
    'settings.manage',
  ],
  ADMIN: [
    'dashboard.view',
    'statistik.view',
    'statistik.export',
    'pengguna.view',
    'tasks.view',
    'tasks.create',
    'tasks.edit',
    'tasks.delete',
    'categories.view',
    'categories.manage',
    'decks.view',
    'decks.create',
    'decks.edit',
    'decks.delete',
    'subscription.view',
    'vouchers.view',
    'vouchers.manage',
    'settings.view',
  ],
  VIEWER: [
    'dashboard.view',
    'statistik.view',
    'statistik.export',
    'pengguna.view',
    'tasks.view',
    'categories.view',
    'decks.view',
    'subscription.view',
    'vouchers.view',
    'settings.view',
  ],
};

// Check if role has permission
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}

// Check if role has any of the permissions
export function hasAnyPermission(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

// Check if role has all permissions
export function hasAllPermissions(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

// Get all permissions for a role
export function getPermissions(role: AdminRole): Permission[] {
  return [...PERMISSIONS[role]];
}

// Role hierarchy check
export function isRoleHigherOrEqual(role: AdminRole, targetRole: AdminRole): boolean {
  const hierarchy: AdminRole[] = ['VIEWER', 'ADMIN', 'SUPER_ADMIN'];
  return hierarchy.indexOf(role) >= hierarchy.indexOf(targetRole);
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  VIEWER: 'Viewer',
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Full access to all features including admin management',
  ADMIN: 'Can manage content and view analytics, but cannot manage admins',
  VIEWER: 'Read-only access to dashboard and analytics',
};
