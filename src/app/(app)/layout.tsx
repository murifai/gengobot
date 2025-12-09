import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { AppLayoutClient } from './layout-client';
import { OnboardingGuard } from '@/components/guards/OnboardingGuard';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/?login=required');
  }

  // Check onboarding and subscription status from database
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      onboardingCompleted: true,
      subscription: {
        select: { id: true },
      },
    },
  });

  const onboardingCompleted = dbUser?.onboardingCompleted ?? false;
  const hasSubscription = !!dbUser?.subscription;

  return (
    <AppLayoutClient>
      <OnboardingGuard onboardingCompleted={onboardingCompleted} hasSubscription={hasSubscription}>
        {children}
      </OnboardingGuard>
    </AppLayoutClient>
  );
}
