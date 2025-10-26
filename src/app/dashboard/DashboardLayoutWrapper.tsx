'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { CustomAppSidebar } from '@/components/dashboard/CustomAppSidebar';
import DashboardLayoutClient from './DashboardLayoutClient';

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  user: User | null;
}

export default function DashboardLayoutWrapper({ children, user }: DashboardLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Custom Sidebar */}
      <div className="relative">
        <CustomAppSidebar
          user={user}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
      </div>
    </div>
  );
}
