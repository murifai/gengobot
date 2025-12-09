'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/dashboard/admin-sidebar';
import { AdminHeader } from '@/components/dashboard/admin-header';
import { AdminFooter } from '@/components/dashboard/admin-footer';
import type { AdminRole } from '@prisma/client';

interface AdminLayoutClientProps {
  admin: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
  };
  children: React.ReactNode;
}

export default function AdminLayoutClient({ admin, children }: AdminLayoutClientProps) {
  return (
    <SidebarProvider>
      <AdminSidebar admin={admin} variant="inset" />
      <SidebarInset>
        <AdminHeader admin={admin} />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <AdminFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
