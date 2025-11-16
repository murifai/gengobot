import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/?login=required');
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 pb-24">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
