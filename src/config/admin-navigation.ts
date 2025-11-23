import {
  LayoutDashboard,
  BarChart3,
  Users,
  MessageSquare,
  Layers,
  CreditCard,
  Ticket,
  UserCog,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@/lib/auth/admin-rbac';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  children?: NavItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// Main navigation structure based on new sitemap
export const adminNavigation: NavSection[] = [
  {
    // Main section (no title)
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
      },
      {
        title: 'Statistik',
        href: '/admin/statistik',
        icon: BarChart3,
        permission: 'statistik.view',
      },
      {
        title: 'Pengguna',
        href: '/admin/pengguna',
        icon: Users,
        permission: 'pengguna.view',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        title: 'Roleplay',
        href: '/admin/roleplay',
        icon: MessageSquare,
        permission: 'tasks.view',
        children: [
          {
            title: 'Tasks',
            href: '/admin/roleplay/tasks',
            icon: MessageSquare,
            permission: 'tasks.view',
          },
          {
            title: 'Kategori',
            href: '/admin/roleplay/category',
            icon: Layers,
            permission: 'categories.view',
          },
        ],
      },
      {
        title: 'Dek',
        href: '/admin/dek',
        icon: Layers,
        permission: 'decks.view',
      },
    ],
  },
  {
    title: 'Business',
    items: [
      {
        title: 'Subskripsi',
        href: '/admin/subskripsi',
        icon: CreditCard,
        permission: 'subscription.view',
        children: [
          {
            title: 'Setting',
            href: '/admin/subskripsi/setting',
            icon: Settings,
            permission: 'subscription.view',
          },
          {
            title: 'Voucher',
            href: '/admin/subskripsi/voucher',
            icon: Ticket,
            permission: 'vouchers.view',
          },
        ],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Admin',
        href: '/admin/admins',
        icon: UserCog,
        permission: 'admins.view',
        children: [
          {
            title: 'List Admin',
            href: '/admin/admins/list',
            icon: Users,
            permission: 'admins.view',
          },
          {
            title: 'Profile',
            href: '/admin/admins/profile',
            icon: UserCog,
            permission: 'settings.view',
          },
        ],
      },
    ],
  },
];

// Flatten navigation for easy lookup
export function flattenNavigation(sections: NavSection[]): NavItem[] {
  const items: NavItem[] = [];

  for (const section of sections) {
    for (const item of section.items) {
      items.push(item);
      if (item.children) {
        items.push(...item.children);
      }
    }
  }

  return items;
}

// Get breadcrumb path for a given href
export function getBreadcrumbPath(href: string): NavItem[] {
  const path: NavItem[] = [];
  const flatItems = flattenNavigation(adminNavigation);

  // Find the current item
  const currentItem = flatItems.find(item => item.href === href);
  if (!currentItem) return path;

  // Find parent if exists
  for (const section of adminNavigation) {
    for (const item of section.items) {
      if (item.children) {
        const child = item.children.find(c => c.href === href);
        if (child) {
          path.push(item);
          path.push(child);
          return path;
        }
      }
      if (item.href === href) {
        path.push(item);
        return path;
      }
    }
  }

  return path;
}

// Check if a path is active (including children)
export function isPathActive(itemHref: string, currentPath: string): boolean {
  if (itemHref === '/admin') {
    return currentPath === '/admin';
  }
  return currentPath.startsWith(itemHref);
}
