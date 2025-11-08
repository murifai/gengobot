'use client';

import * as React from 'react';
import {
  BookOpen,
  GraduationCap,
  Home,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
  Book,
  Mic,
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
import { User } from '@supabase/supabase-js';

// Menu items
const items = [
  {
    title: 'Dasbor',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Tugas',
    url: '/dashboard/tasks',
    icon: GraduationCap,
  },
  {
    title: 'Dek Belajar',
    url: '/study',
    icon: BookOpen,
  },
  {
    title: 'Obrolan',
    url: '/dashboard/chat',
    icon: MessageSquare,
  },
  {
    title: 'Obrolan Suara',
    url: '/chat-webrtc',
    icon: Mic,
  },
  {
    title: 'Kemajuan',
    url: '/dashboard/progress',
    icon: TrendingUp,
  },
  {
    title: 'Karakter',
    url: '/dashboard/characters',
    icon: Users,
  },
];

const bottomItems = [
  {
    title: 'Pengaturan',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <Sidebar variant="sidebar" collapsible="none" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Book className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">GengoBot</span>
                  <span className="truncate text-xs">Belajar Bahasa</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
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
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.user_metadata?.full_name || 'Pengguna'}
                </span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
