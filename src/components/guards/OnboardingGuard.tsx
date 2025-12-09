'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface OnboardingGuardProps {
  children: React.ReactNode;
  onboardingCompleted: boolean;
  hasSubscription: boolean;
}

/**
 * OnboardingGuard - Controls access to subscription and onboarding setup flow
 *
 * New flow (user can skip onboarding initially):
 * 1. No subscription → redirect to choose-plan
 * 2. Has subscription but no onboarding → allowed to use app (onboarding is optional initially)
 * 3. Main features (drill, kaiwa, ujian) require onboarding completion via FeatureGuard
 */
export function OnboardingGuard({
  children,
  onboardingCompleted,
  hasSubscription,
}: OnboardingGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isOnboardingPage = pathname?.startsWith('/onboarding');
  const isChoosePlanPage = pathname?.startsWith('/choose-plan');
  const isUpgradePage = pathname?.startsWith('/upgrade');
  const isPaymentPage = pathname?.startsWith('/payment');

  // Pages that are part of the setup flow (subscription + onboarding)
  const isSetupFlowPage = isChoosePlanPage || isUpgradePage || isPaymentPage || isOnboardingPage;

  useEffect(() => {
    // Flow: choose-plan -> (payment if paid) -> app (onboarding is optional initially)

    // If no subscription and not in setup flow, redirect to choose-plan
    if (!hasSubscription && !isSetupFlowPage) {
      router.replace('/choose-plan');
      return;
    }

    // If completed everything but still on choose-plan, redirect to app
    if (hasSubscription && isChoosePlanPage) {
      router.replace('/');
      return;
    }

    // If completed onboarding but still on onboarding page, redirect to app
    if (hasSubscription && onboardingCompleted && isOnboardingPage) {
      router.replace('/');
      return;
    }
  }, [
    hasSubscription,
    onboardingCompleted,
    isSetupFlowPage,
    isChoosePlanPage,
    isOnboardingPage,
    router,
  ]);

  // Show loading while redirecting
  const shouldRedirectToChoosePlan = !hasSubscription && !isSetupFlowPage;
  const shouldRedirectFromChoosePlan = hasSubscription && isChoosePlanPage;
  const shouldRedirectFromOnboarding = hasSubscription && onboardingCompleted && isOnboardingPage;

  if (shouldRedirectToChoosePlan || shouldRedirectFromChoosePlan || shouldRedirectFromOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
