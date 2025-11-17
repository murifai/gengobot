import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { AppLayoutClient } from './layout-client';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/?login=required');
  }

  return <AppLayoutClient>{children}</AppLayoutClient>;
}
