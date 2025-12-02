'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface OnboardingGuardProps {
  children: React.ReactNode;
  onboardingCompleted: boolean;
  hasSubscription: boolean;
}

export function OnboardingGuard({
  children,
  onboardingCompleted,
  hasSubscription,
}: OnboardingGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isOnboardingPage = pathname?.startsWith('/app/onboarding');
  const isChoosePlanPage = pathname?.startsWith('/app/choose-plan');
  const isUpgradePage = pathname?.startsWith('/app/upgrade');
  const isPaymentPage = pathname?.startsWith('/app/payment');

  // Pages that are part of the setup flow (subscription + onboarding)
  const isSetupFlowPage = isChoosePlanPage || isUpgradePage || isPaymentPage || isOnboardingPage;

  useEffect(() => {
    // Flow: choose-plan -> (payment if paid) -> onboarding -> app

    // If no subscription and not in setup flow, redirect to choose-plan
    if (!hasSubscription && !isSetupFlowPage) {
      router.replace('/app/choose-plan');
      return;
    }

    // If has subscription but onboarding not completed and not in setup flow, redirect to onboarding
    if (hasSubscription && !onboardingCompleted && !isSetupFlowPage) {
      router.replace('/app/onboarding');
      return;
    }

    // If completed everything but still on choose-plan, redirect to app
    if (hasSubscription && onboardingCompleted && isChoosePlanPage) {
      router.replace('/app');
      return;
    }
  }, [hasSubscription, onboardingCompleted, isSetupFlowPage, isChoosePlanPage, router]);

  // Show loading while redirecting
  const shouldRedirectToChoosePlan = !hasSubscription && !isSetupFlowPage;
  const shouldRedirectToOnboarding = hasSubscription && !onboardingCompleted && !isSetupFlowPage;

  if (shouldRedirectToChoosePlan || shouldRedirectToOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
