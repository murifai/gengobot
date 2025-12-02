import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  isRoleHigherOrEqual,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  type Permission,
} from '@/lib/auth/admin-rbac';
import type {} from '@prisma/client'; // AdminRole type used indirectly via hasPermission

describe('Admin RBAC', () => {
  describe('hasPermission', () => {
    it('should return true for SUPER_ADMIN with any permission', () => {
      expect(hasPermission('SUPER_ADMIN', 'dashboard.view')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'admins.create')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'admins.delete')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'subscription.manage')).toBe(true);
    });

    it('should return true for ADMIN with allowed permissions', () => {
      expect(hasPermission('ADMIN', 'dashboard.view')).toBe(true);
      expect(hasPermission('ADMIN', 'tasks.create')).toBe(true);
      expect(hasPermission('ADMIN', 'tasks.edit')).toBe(true);
      expect(hasPermission('ADMIN', 'tasks.delete')).toBe(true);
      expect(hasPermission('ADMIN', 'vouchers.manage')).toBe(true);
    });

    it('should return false for ADMIN with restricted permissions', () => {
      expect(hasPermission('ADMIN', 'admins.create')).toBe(false);
      expect(hasPermission('ADMIN', 'admins.edit')).toBe(false);
      expect(hasPermission('ADMIN', 'admins.delete')).toBe(false);
      expect(hasPermission('ADMIN', 'subscription.manage')).toBe(false);
      expect(hasPermission('ADMIN', 'settings.manage')).toBe(false);
    });

    it('should return true for VIEWER with read-only permissions', () => {
      expect(hasPermission('VIEWER', 'dashboard.view')).toBe(true);
      expect(hasPermission('VIEWER', 'statistik.view')).toBe(true);
      expect(hasPermission('VIEWER', 'statistik.export')).toBe(true);
      expect(hasPermission('VIEWER', 'pengguna.view')).toBe(true);
      expect(hasPermission('VIEWER', 'tasks.view')).toBe(true);
    });

    it('should return false for VIEWER with write permissions', () => {
      expect(hasPermission('VIEWER', 'tasks.create')).toBe(false);
      expect(hasPermission('VIEWER', 'tasks.edit')).toBe(false);
      expect(hasPermission('VIEWER', 'tasks.delete')).toBe(false);
      expect(hasPermission('VIEWER', 'categories.manage')).toBe(false);
      expect(hasPermission('VIEWER', 'decks.create')).toBe(false);
      expect(hasPermission('VIEWER', 'admins.view')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if role has any of the permissions', () => {
      expect(hasAnyPermission('ADMIN', ['admins.create', 'tasks.create'])).toBe(true);
      expect(hasAnyPermission('VIEWER', ['tasks.create', 'tasks.view'])).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      expect(hasAnyPermission('VIEWER', ['admins.create', 'tasks.create', 'tasks.edit'])).toBe(
        false
      );
      expect(hasAnyPermission('ADMIN', ['admins.create', 'admins.delete'])).toBe(false);
    });

    it('should return true for SUPER_ADMIN with any permissions', () => {
      expect(hasAnyPermission('SUPER_ADMIN', ['admins.create', 'admins.delete'])).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if role has all permissions', () => {
      expect(hasAllPermissions('ADMIN', ['dashboard.view', 'tasks.create', 'tasks.edit'])).toBe(
        true
      );
      expect(hasAllPermissions('VIEWER', ['dashboard.view', 'statistik.view'])).toBe(true);
      expect(
        hasAllPermissions('SUPER_ADMIN', ['admins.create', 'admins.delete', 'subscription.manage'])
      ).toBe(true);
    });

    it('should return false if role is missing any permission', () => {
      expect(hasAllPermissions('ADMIN', ['dashboard.view', 'admins.create'])).toBe(false);
      expect(hasAllPermissions('VIEWER', ['dashboard.view', 'tasks.create'])).toBe(false);
    });
  });

  describe('getPermissions', () => {
    it('should return all permissions for a role', () => {
      const superAdminPerms = getPermissions('SUPER_ADMIN');
      const adminPerms = getPermissions('ADMIN');
      const viewerPerms = getPermissions('VIEWER');

      expect(superAdminPerms).toContain('admins.create');
      expect(superAdminPerms).toContain('admins.delete');
      expect(superAdminPerms).toContain('subscription.manage');

      expect(adminPerms).toContain('tasks.create');
      expect(adminPerms).not.toContain('admins.create');

      expect(viewerPerms).toContain('dashboard.view');
      expect(viewerPerms).not.toContain('tasks.create');
    });

    it('should return a copy of permissions array', () => {
      const perms1 = getPermissions('ADMIN');
      const perms2 = getPermissions('ADMIN');
      expect(perms1).not.toBe(perms2);
      expect(perms1).toEqual(perms2);
    });

    it('should have correct permission counts', () => {
      const superAdminPerms = getPermissions('SUPER_ADMIN');
      const adminPerms = getPermissions('ADMIN');
      const viewerPerms = getPermissions('VIEWER');

      // SUPER_ADMIN should have the most permissions
      expect(superAdminPerms.length).toBeGreaterThan(adminPerms.length);
      // ADMIN should have more permissions than VIEWER
      expect(adminPerms.length).toBeGreaterThan(viewerPerms.length);
    });
  });

  describe('isRoleHigherOrEqual', () => {
    it('should correctly compare role hierarchy', () => {
      // SUPER_ADMIN is highest
      expect(isRoleHigherOrEqual('SUPER_ADMIN', 'SUPER_ADMIN')).toBe(true);
      expect(isRoleHigherOrEqual('SUPER_ADMIN', 'ADMIN')).toBe(true);
      expect(isRoleHigherOrEqual('SUPER_ADMIN', 'VIEWER')).toBe(true);

      // ADMIN is middle
      expect(isRoleHigherOrEqual('ADMIN', 'SUPER_ADMIN')).toBe(false);
      expect(isRoleHigherOrEqual('ADMIN', 'ADMIN')).toBe(true);
      expect(isRoleHigherOrEqual('ADMIN', 'VIEWER')).toBe(true);

      // VIEWER is lowest
      expect(isRoleHigherOrEqual('VIEWER', 'SUPER_ADMIN')).toBe(false);
      expect(isRoleHigherOrEqual('VIEWER', 'ADMIN')).toBe(false);
      expect(isRoleHigherOrEqual('VIEWER', 'VIEWER')).toBe(true);
    });
  });

  describe('ROLE_DISPLAY_NAMES', () => {
    it('should have display names for all roles', () => {
      expect(ROLE_DISPLAY_NAMES.SUPER_ADMIN).toBe('Super Admin');
      expect(ROLE_DISPLAY_NAMES.ADMIN).toBe('Admin');
      expect(ROLE_DISPLAY_NAMES.VIEWER).toBe('Viewer');
    });
  });

  describe('ROLE_DESCRIPTIONS', () => {
    it('should have descriptions for all roles', () => {
      expect(ROLE_DESCRIPTIONS.SUPER_ADMIN).toContain('Full access');
      expect(ROLE_DESCRIPTIONS.ADMIN).toContain('content');
      expect(ROLE_DESCRIPTIONS.VIEWER).toContain('Read-only');
    });
  });

  describe('Permission matrix integrity', () => {
    it('should have SUPER_ADMIN with all admin management permissions', () => {
      const superAdminPerms = getPermissions('SUPER_ADMIN');
      expect(superAdminPerms).toContain('admins.view');
      expect(superAdminPerms).toContain('admins.create');
      expect(superAdminPerms).toContain('admins.edit');
      expect(superAdminPerms).toContain('admins.delete');
    });

    it('should have VIEWER with only view and export permissions', () => {
      const viewerPerms = getPermissions('VIEWER');

      // Check that VIEWER only has view and export permissions
      viewerPerms.forEach((perm: Permission) => {
        expect(perm).toMatch(/\.(view|export)$/);
      });
    });

    it('should not have ADMIN with admin management write permissions', () => {
      const adminPerms = getPermissions('ADMIN');
      expect(adminPerms).not.toContain('admins.create');
      expect(adminPerms).not.toContain('admins.edit');
      expect(adminPerms).not.toContain('admins.delete');
    });

    it('should have proper permission inheritance', () => {
      // All roles should have dashboard.view
      expect(hasPermission('SUPER_ADMIN', 'dashboard.view')).toBe(true);
      expect(hasPermission('ADMIN', 'dashboard.view')).toBe(true);
      expect(hasPermission('VIEWER', 'dashboard.view')).toBe(true);

      // Only SUPER_ADMIN and ADMIN should have content management
      expect(hasPermission('SUPER_ADMIN', 'tasks.create')).toBe(true);
      expect(hasPermission('ADMIN', 'tasks.create')).toBe(true);
      expect(hasPermission('VIEWER', 'tasks.create')).toBe(false);
    });
  });
});
