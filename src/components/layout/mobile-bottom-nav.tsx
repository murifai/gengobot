'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, BookOpen, User, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/shadcn-io/dock';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dasbor', href: '/app', icon: LayoutDashboard },
  { label: 'Drill', href: '/app/drill', icon: BookOpen },
  { label: 'Kaiwa', href: '/app/kaiwa', icon: MessageSquare },
  { label: 'Ujian', href: '/app/ujian', icon: GraduationCap },
  { label: 'Profile', href: '/app/profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === '/app';
    }
    return pathname?.startsWith(href);
  };

  // Hide navigation in chat routes
  const isChatRoute =
    pathname?.includes('/kaiwa/bebas') ||
    pathname?.includes('/kaiwa/roleplay') ||
    pathname?.includes('/chat') ||
    (pathname?.includes('/tasks/') && pathname?.includes('/attempt/'));

  if (isChatRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-4">
      <div className="flex items-center justify-center pointer-events-auto">
        <Dock magnification={80} distance={120} panelHeight={64}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <DockItem key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-center rounded-full transition-all duration-200',
                    'w-12 h-12', // Fixed size to ensure circular shape
                    active
                      ? 'bg-primary/20 text-primary scale-110'
                      : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 hover:scale-110 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700/80'
                  )}
                >
                  <DockIcon>
                    <Icon
                      className={cn(
                        'transition-all duration-200',
                        active ? 'w-6 h-6 fill-current' : 'w-5 h-5 group-hover:w-6 group-hover:h-6'
                      )}
                    />
                  </DockIcon>
                </Link>
                <DockLabel>{item.label}</DockLabel>
              </DockItem>
            );
          })}
        </Dock>
      </div>
    </div>
  );
}
