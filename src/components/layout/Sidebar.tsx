'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/task-chat', label: 'Task Chat', icon: '💬' },
    { href: '/study', label: 'Study Decks', icon: '📚' },
    { href: '/task-history', label: 'History', icon: '📖' },
    { href: '/progress', label: 'Progress', icon: '📈' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const adminItems = [
    { href: '/admin', label: 'Admin Dashboard', icon: '👨‍💼' },
    { href: '/admin/roleplay/tasks', label: 'Manage Tasks', icon: '📝' },
  ];

  return (
    <aside
      className={cn('flex h-full w-64 flex-col border-r border-border bg-background', className)}
    >
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
          <span className="text-xl font-bold text-foreground">Gengotalk</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-card-background hover:text-foreground'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        <div className="mt-8 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase text-foreground/50">Admin</div>
          {adminItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-card-background hover:text-foreground'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">User Name</p>
            <p className="text-xs text-foreground/50 truncate">N5 Level</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
