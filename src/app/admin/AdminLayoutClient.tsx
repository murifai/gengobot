'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface AdminLayoutClientProps {
  user: {
    name: string | null;
    email: string;
  };
  children: React.ReactNode;
}

export default function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navigation = [
    { name: 'Analytics', href: '/admin/analytics' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Tasks', href: '/admin/tasks' },
    { name: 'Characters', href: '/admin/characters' },
    { name: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <nav className="bg-indigo-600 dark:bg-indigo-800 border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <div className="hidden md:flex space-x-4">
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">
                  User Dashboard
                </Button>
              </Link>
              <div className="text-white text-sm">{user.name || user.email}</div>
              <Button onClick={handleSignOut} variant="secondary" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-indigo-600 dark:bg-indigo-800 border-b border-indigo-700">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === item.href
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
