import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import ProgressClient from '@/components/app/profile/ProgressClient';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.email) {
    redirect('/login');
  }

  return (
    <ProgressClient
      user={
        user as {
          id: string;
          email: string;
          name?: string | null;
          image?: string | null;
          isAdmin: boolean;
        }
      }
    />
  );
}
