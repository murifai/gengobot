'use client';

import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: User | null;
}

export default function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const pathname = usePathname();

  // Check if we're on a chat conversation page (e.g., /dashboard/chat/[id])
  const isChatConversationPage =
    pathname.startsWith('/dashboard/chat/') && pathname.split('/').length > 3;

  return (
    <>
      {!isChatConversationPage && <DashboardHeader user={user} />}
      <div
        className={cn(
          'flex flex-col',
          isChatConversationPage
            ? 'flex-1 h-full overflow-hidden' // Full height, no padding for chat
            : 'flex-1 gap-4 p-4 pt-0' // Normal padding for other pages
        )}
      >
        {children}
      </div>
    </>
  );
}
