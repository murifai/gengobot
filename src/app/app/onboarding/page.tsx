import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { OnboardingFlow } from '@/components/app/profile/onboarding/OnboardingFlow';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

export default async function OnboardingPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.email) {
    redirect('/login');
  }

  // Get user data from database
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      // Note: onboardingCompleted will be available after migration
      // onboardingCompleted: true,
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // TODO: After migration, check if onboarding is already completed
  // if (dbUser.onboardingCompleted) {
  //   redirect('/app');
  // }

  return <OnboardingFlow userId={dbUser.id} />;
}
