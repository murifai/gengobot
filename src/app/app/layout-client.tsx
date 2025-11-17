'use client';

import { usePathname } from 'next/navigation';

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're in a chat route (only when actually in chat interface)
  const isChatRoute =
    pathname?.includes('/chat') ||
    (pathname?.includes('/kaiwa/roleplay/') && pathname?.includes('/attempt/'));

  return (
    <div className="min-h-screen bg-background">
      <main className={isChatRoute ? '' : 'container mx-auto p-4 pb-24'}>{children}</main>
    </div>
  );
}
