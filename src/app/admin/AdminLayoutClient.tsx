'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminHeader } from '@/components/dashboard/admin-header';

interface AdminLayoutClientProps {
  user: {
    name: string | null;
    email: string;
  };
  children: React.ReactNode;
}

export default function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar user={user} />
      <SidebarInset>
        <AdminHeader user={user} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
