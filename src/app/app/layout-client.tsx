'use client';

import { usePathname } from 'next/navigation';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're in a chat route (only when actually in chat interface)
  const isChatRoute =
    pathname?.includes('/chat') ||
    (pathname?.includes('/kaiwa/roleplay/') && pathname?.includes('/attempt/'));

  // Check if we're in a drill route (when studying flashcards)
  const isDrillRoute = pathname?.includes('/drill/') && !pathname?.includes('/decks/');

  // Hide bottom nav in chat and drill routes
  const showBottomNav = !isChatRoute && !isDrillRoute;

  return (
    <div className="min-h-screen bg-background">
      <main className={isChatRoute || isDrillRoute ? '' : 'container mx-auto p-4 pb-24'}>
        {children}
      </main>
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
}
