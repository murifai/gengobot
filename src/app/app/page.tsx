import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import AppDashboard from '@/components/app/dashboard/AppDashboard';

export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.email) {
    redirect('/login');
  }

  // Check onboarding status from database
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      onboardingCompleted: true,
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // Check if onboarding is completed
  // For new users, onboardingCompleted will be false
  // Redirect to onboarding if not completed
  if (!dbUser.onboardingCompleted) {
    redirect('/app/onboarding');
  }

  return <AppDashboard />;
}
