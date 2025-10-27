'use client';

import { User } from '@supabase/supabase-js';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: User | null;
}

export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  return <div className="flex-1 flex flex-col overflow-auto">{children}</div>;
}
