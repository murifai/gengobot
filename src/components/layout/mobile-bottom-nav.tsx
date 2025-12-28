'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, BookOpen, User, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dasbor', href: '/', icon: LayoutDashboard },
  { label: 'Drill', href: '/drill', icon: BookOpen },
  { label: 'Kaiwa', href: '/kaiwa', icon: MessageSquare },
  { label: 'JLPT', href: '/jlpt', icon: GraduationCap },
  { label: 'Profile', href: '/profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  // Hide navigation in onboarding and subscription flow (prevent bypass)
  const isOnboardingRoute = pathname?.startsWith('/onboarding');
  const isChoosePlanRoute = pathname?.startsWith('/choose-plan');

  // Hide navigation in chat routes (only when actually in chat interface)
  const isChatRoute =
    pathname?.includes('/chat') ||
    (pathname?.includes('/kaiwa/roleplay/') && pathname?.includes('/attempt/')) ||
    (pathname?.includes('/tasks/') && pathname?.includes('/attempt/'));

  if (isOnboardingRoute || isChoosePlanRoute || isChatRoute) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-4 px-4"
      data-mobile-nav="true"
    >
      <div className="flex items-center justify-center gap-5 pointer-events-auto bg-background border-2 border-border rounded-base p-3 shadow-shadow w-full mx-auto max-w-fit">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button variant={active ? 'default' : 'outline'} size="icon-lg" asChild>
                  <Link href={item.href}>
                    <Icon className={cn('size-6', active && 'fill-current')} />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
