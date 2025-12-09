import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  // Check if already logged in
  const session = await getAdminSession();

  // If already has session, redirect to admin dashboard
  if (session) {
    redirect('/admin');
  }

  // Auth pages are standalone, no sidebar/header needed
  return <>{children}</>;
}
