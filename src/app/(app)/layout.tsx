import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardLayoutWrapper from '../dashboard/DashboardLayoutWrapper';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayoutWrapper user={user}>
      <DashboardHeader user={user} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
    </DashboardLayoutWrapper>
  );
}
