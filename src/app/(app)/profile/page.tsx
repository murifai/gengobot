import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { ProfilePage } from '@/components/app/profile/ProfilePage';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

export default async function ProfileSettingsPage() {
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
      image: true,
      proficiency: true,
      fullName: true,
      nickname: true,
      domicile: true,
      institution: true,
      subscriptionPlan: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // Map database user to ProfilePage props
  const userProfile = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    fullName: dbUser.fullName ?? null,
    nickname: dbUser.nickname ?? null,
    domicile: dbUser.domicile ?? null,
    institution: dbUser.institution ?? null,
    proficiency: dbUser.proficiency,
    subscriptionPlan: dbUser.subscriptionPlan ?? 'free',
    createdAt: dbUser.createdAt,
  };

  return <ProfilePage user={userProfile} />;
}
