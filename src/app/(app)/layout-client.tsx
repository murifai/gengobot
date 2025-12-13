'use client';

import { usePathname } from 'next/navigation';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're in onboarding or subscription flow (prevent bypass via nav)
  const isOnboardingRoute = pathname?.startsWith('/onboarding');
  const isChoosePlanRoute = pathname?.startsWith('/choose-plan');

  // Check if we're in a chat route (only when actually in chat interface)
  const isChatRoute =
    pathname?.includes('/chat') ||
    (pathname?.includes('/kaiwa/roleplay/') && pathname?.includes('/attempt/'));

  // Check if we're in a roleplay task route (pre-task study with prerequisite decks)
  // Match /kaiwa/roleplay/[taskId] but not /kaiwa/roleplay/[taskId]/attempt/[attemptId]
  const isRoleplayTaskRoute =
    pathname?.includes('/kaiwa/roleplay/') && !pathname?.includes('/attempt/');

  // Check if we're in a drill route (when studying flashcards)
  // Exclude deck management pages (/decks/ and /my-decks) from hiding the nav
  const isDrillRoute =
    pathname?.includes('/drill/') &&
    !pathname?.includes('/decks/') &&
    !pathname?.includes('/my-decks');

  // Hide bottom nav in onboarding, choose-plan, chat, drill, and roleplay task routes
  const showBottomNav =
    !isOnboardingRoute &&
    !isChoosePlanRoute &&
    !isChatRoute &&
    !isDrillRoute &&
    !isRoleplayTaskRoute;

  // Full-screen routes don't need container padding
  const isFullScreenRoute =
    isOnboardingRoute || isChoosePlanRoute || isChatRoute || isDrillRoute || isRoleplayTaskRoute;

  return (
    <div className="min-h-screen bg-background">
      <main className={isFullScreenRoute ? '' : 'container mx-auto p-4 pb-24'}>{children}</main>
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
}
