import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import AdminLayoutClient from './AdminLayoutClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  if (!user?.email) {
    redirect('/login');
  }

  // Check admin status
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { isAdmin: true, name: true, email: true },
  });

  if (!dbUser?.isAdmin) {
    redirect('/dashboard');
  }

  return <AdminLayoutClient user={dbUser}>{children}</AdminLayoutClient>;
}
