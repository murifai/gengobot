'use client';

import { usePathname } from 'next/navigation';

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're in a chat route
  const isChatRoute =
    pathname?.includes('/kaiwa/bebas') ||
    pathname?.includes('/kaiwa/roleplay') ||
    pathname?.includes('/chat');

  return (
    <div className="min-h-screen bg-background">
      <main className={isChatRoute ? '' : 'container mx-auto p-4 pb-24'}>{children}</main>
    </div>
  );
}
