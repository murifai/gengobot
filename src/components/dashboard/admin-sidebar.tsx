'use client';

import * as React from 'react';
import {
  BarChart3,
  BookOpen,
  FolderKanban,
  Settings,
  Shield,
  Users,
  Layers,
  Home,
  CreditCard,
  Tag,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Admin menu items
const items = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Tasks',
    url: '/admin/tasks',
    icon: FolderKanban,
  },
  {
    title: 'Decks',
    url: '/admin/decks',
    icon: BookOpen,
  },
  {
    title: 'Categories',
    url: '/admin/categories',
    icon: Layers,
  },
  {
    title: 'Characters',
    url: '/admin/characters',
    icon: Users,
  },
  {
    title: 'Subscription',
    url: '/admin/subscription',
    icon: CreditCard,
  },
  {
    title: 'Vouchers',
    url: '/admin/vouchers',
    icon: Tag,
  },
];

const bottomItems = [
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
];

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string | null;
    email: string;
  };
}

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const userInitial = user.email?.charAt(0).toUpperCase() || 'A';

  return (
    <Sidebar variant="sidebar" collapsible="none" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">GengoBot</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    onClick={() => router.push(item.url)}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    onClick={() => router.push(item.url)}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-indigo-600 text-white">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name || 'Admin'}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
