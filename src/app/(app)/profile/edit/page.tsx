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
      fullName: true,
      nickname: true,
      domicile: true,
      institution: true,
      proficiency: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // Map database user to EditProfilePage props
  const userProfile = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    fullName: dbUser.fullName,
    nickname: dbUser.nickname,
    domicile: dbUser.domicile,
    institution: dbUser.institution,
    proficiency: dbUser.proficiency,
  };

  return <EditProfilePage user={userProfile} />;
}
