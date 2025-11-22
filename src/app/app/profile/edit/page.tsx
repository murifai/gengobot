import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { EditProfilePage } from '@/components/app/profile/EditProfilePage';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

export default async function EditProfileRoute() {
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
      createdAt: true,
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // Cast to extended type until Prisma client is regenerated
  const userWithNewFields = dbUser as typeof dbUser & {
    fullName?: string | null;
    nickname?: string | null;
    domicile?: string | null;
    institution?: string | null;
    subscriptionPlan?: string;
  };

  // Map database user to EditProfilePage props
  const userProfile = {
    id: userWithNewFields.id,
    email: userWithNewFields.email,
    name: userWithNewFields.name,
    image: userWithNewFields.image,
    fullName: userWithNewFields.fullName ?? null,
    nickname: userWithNewFields.nickname ?? null,
    domicile: userWithNewFields.domicile ?? null,
    institution: userWithNewFields.institution ?? null,
    proficiency: userWithNewFields.proficiency,
  };

  return <EditProfilePage user={userProfile} />;
}
