import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/admin-auth';
import AdminLayoutClient from './AdminLayoutClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // If no admin session, redirect to admin login
  if (!session) {
    redirect('/admin/auth/login');
  }

  return (
    <AdminLayoutClient
      admin={{
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
