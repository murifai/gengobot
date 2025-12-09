'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FeatureGuardProps {
  children: React.ReactNode;
}

/**
 * FeatureGuard - Protects main features (drill, kaiwa, ujian) requiring onboarding completion
 *
 * This guard checks if the user has completed onboarding before accessing main features.
 * If not completed, it redirects to the onboarding page.
 */
export function FeatureGuard({ children }: FeatureGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const response = await fetch('/api/user/onboarding-status');
        if (response.ok) {
          const data = await response.json();
          setOnboardingCompleted(data.onboardingCompleted);
          if (!data.onboardingCompleted) {
            router.replace('/onboarding');
          }
        } else {
          // If API fails, allow access (fail open for better UX)
          setOnboardingCompleted(true);
        }
      } catch {
        // On error, allow access (fail open)
        setOnboardingCompleted(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [router]);

  // Show loading while checking
  if (isChecking || onboardingCompleted === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  // If onboarding not completed, don't render children (will redirect)
  if (!onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
