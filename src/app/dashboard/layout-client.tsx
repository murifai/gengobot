'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    isAdmin: boolean;
  };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const pathname = usePathname();

  // Check if we're in a task attempt chat route
  const isTaskAttemptRoute = pathname?.includes('/tasks/') && pathname?.includes('/attempt/');

  // If in task attempt, render without sidebar/header for full screen
  if (isTaskAttemptRoute) {
    return <>{children}</>;
  }

  // Normal dashboard layout with sidebar
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar user={user} />
      <SidebarInset>
        <DashboardHeader user={user} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-24">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
