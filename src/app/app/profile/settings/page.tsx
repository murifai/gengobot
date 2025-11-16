import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import SettingsClient from '@/app/dashboard/settings/SettingsClient';

export const runtime = 'nodejs';

export default async function SettingsPage() {
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
      name: true,
      email: true,
      proficiency: true,
      preferredTaskCategories: true,
    },
  });

  const typedUser = user as {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    isAdmin: boolean;
  };

  return <SettingsClient user={typedUser} dbUser={dbUser} />;
}
