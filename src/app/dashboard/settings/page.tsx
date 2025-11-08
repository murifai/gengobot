import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';

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

  return <SettingsClient user={user} dbUser={dbUser} />;
}
