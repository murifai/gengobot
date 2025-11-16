import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

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
    <SidebarProvider defaultOpen={true}>
      <AppSidebar user={typedUser} />
      <SidebarInset>
        <DashboardHeader user={typedUser} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-24">{children}</div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
