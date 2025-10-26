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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

// Menu items
const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Tasks',
    url: '/dashboard/tasks',
    icon: GraduationCap,
  },
  {
    title: 'Study Decks',
    url: '/study',
    icon: BookOpen,
  },
  {
    title: 'Chat',
    url: '/dashboard/chat',
    icon: MessageSquare,
  },
  {
    title: 'Progress',
    url: '/dashboard/progress',
    icon: TrendingUp,
  },
  {
    title: 'Characters',
    url: '/dashboard/characters',
    icon: Users,
  },
];

const bottomItems = [
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

interface CustomAppSidebarProps {
  user: User | null;
  isOpen: boolean;
  onToggle: () => void;
}

export function CustomAppSidebar({ user, isOpen, onToggle }: CustomAppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div
      className={cn(
        'bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col h-full',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Book className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">GengoBot</span>
                <span className="truncate text-xs">Language Learning</span>
              </div>
            </div>
          ) : (
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
              <Book className="size-4" />
            </div>
          )}
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.url;

            return (
              <button
                key={item.title}
                onClick={() => router.push(item.url)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  !isOpen && 'justify-center'
                )}
                title={!isOpen ? item.title : undefined}
              >
                <Icon className="size-5 shrink-0" />
                {isOpen && <span className="truncate text-sm">{item.title}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <nav className="space-y-1 px-2 mt-auto pt-4 border-t border-sidebar-border">
          {bottomItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.url;

            return (
              <button
                key={item.title}
                onClick={() => router.push(item.url)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  !isOpen && 'justify-center'
                )}
                title={!isOpen ? item.title : undefined}
              >
                <Icon className="size-5 shrink-0" />
                {isOpen && <span className="truncate text-sm">{item.title}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', !isOpen && 'justify-center')}>
          <Avatar className="h-8 w-8 rounded-lg shrink-0">
            <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-semibold">
                {user?.user_metadata?.full_name || 'User'}
              </span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-20 -right-3 bg-sidebar border border-sidebar-border rounded-full p-1.5 hover:bg-sidebar-accent transition-colors shadow-md"
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
    </div>
  );
}
