import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { syncUser } from '@/lib/auth/sync-user';
import DashboardLayoutWrapper from './DashboardLayoutWrapper';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Sync user to database
  await syncUser(user);

  return <DashboardLayoutWrapper user={user}>{children}</DashboardLayoutWrapper>;
}
