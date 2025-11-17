import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { DashboardLayoutClient } from './layout-client';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.email) {
    redirect('/login');
  }

  const typedUser = user as {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    isAdmin: boolean;
  };

  return (
    <DashboardLayoutClient user={typedUser}>
      {children}
      <MobileBottomNav />
    </DashboardLayoutClient>
  );
}
